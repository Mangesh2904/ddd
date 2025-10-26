import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

/**
 * Search for recent YouTube videos using Perplexity AI
 * @param {string} query - Search query for YouTube videos
 * @param {number} count - Number of videos to return
 * @returns {Promise<Array>} Array of video objects with title, channel, and search_query
 */
export const searchYouTubeVideos = async (query, count = 3) => {
  try {
    if (!PERPLEXITY_API_KEY) {
      console.warn('Perplexity API key not configured, using fallback');
      return getFallbackVideos(query, count);
    }

    const prompt = `Find ${count} high-quality, recent YouTube videos or playlists about "${query}". 

CRITICAL REQUIREMENTS:
- Videos MUST be uploaded within the last 2 years (2023-2025)
- Provide ACTUAL YouTube video URLs (https://www.youtube.com/watch?v=VIDEO_ID)
- Only include videos that actually exist and are currently available
- Use well-known educational channels
- Verify the URLs are real and working

Return ONLY a JSON array in this exact format:
[
  {
    "title": "<Specific topic the video covers>",
    "channel": "<Verified channel name>",
    "url": "https://www.youtube.com/watch?v=<VIDEO_ID>",
    "type": "Full Course|Tutorial|Crash Course|Playlist"
  }
]

IMPORTANT: 
- The "url" field MUST contain the actual, working YouTube video URL
- Do not make up or guess video IDs
- Only include videos you can verify exist
- If you cannot find actual URLs, provide search_query as fallback

Example:
[
  {
    "title": "React Hooks Complete Guide",
    "channel": "Traversy Media",
    "url": "https://www.youtube.com/watch?v=TNhaISOUy6Q",
    "type": "Tutorial"
  }
]`;

    const response = await axios.post(
      PERPLEXITY_API_URL,
      {
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const responseText = response.data.choices[0].message.content;
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) {
      console.warn('No valid JSON found in Perplexity response, using fallback');
      return getFallbackVideos(query, count);
    }

    const videos = JSON.parse(jsonMatch[0]);
    
    // Validate and clean results
    const validVideos = videos
      .filter(v => v.title && v.channel && (v.url || v.search_query))
      .map(v => {
        // If URL exists, ensure it's a proper YouTube URL
        if (v.url && !v.url.includes('youtube.com')) {
          // Invalid URL, create search query as fallback
          v.search_query = `${v.channel} ${v.title}`;
          delete v.url;
        }
        // If no URL but has search_query, that's fine
        // If no URL and no search_query, create search_query
        if (!v.url && !v.search_query) {
          v.search_query = `${v.channel} ${v.title}`;
        }
        return v;
      })
      .slice(0, count);

    if (validVideos.length === 0) {
      console.warn('No valid videos from Perplexity, using fallback');
      return getFallbackVideos(query, count);
    }

    return validVideos;

  } catch (error) {
    console.error('Perplexity API error:', error.message);
    return getFallbackVideos(query, count);
  }
};

/**
 * Verify if resources are genuine and available using Perplexity
 * @param {string} companyName - Company name
 * @param {string} role - Job role
 * @returns {Promise<Object>} Verified resources object
 */
export const verifyPlacementResources = async (companyName, role) => {
  try {
    if (!PERPLEXITY_API_KEY) {
      console.warn('Perplexity API key not configured, using Gemini only');
      return null;
    }

    const prompt = `Find genuine, recent (uploaded within last 2 years) YouTube resources for preparing for ${role} position at ${companyName}.

CRITICAL REQUIREMENTS:
- ONLY YouTube videos/playlists (no LeetCode, no articles, no blogs)
- Provide ACTUAL YouTube video URLs (https://www.youtube.com/watch?v=VIDEO_ID)
- Content MUST be from last 2 years (2023-2025)
- Only verified, available videos that currently exist
- From reputable educational channels
- Provide 5-8 diverse resources

Return ONLY a JSON object in this exact format:
{
  "youtube": [
    {
      "title": "<What this video teaches>",
      "channel": "<Channel name>",
      "url": "https://www.youtube.com/watch?v=<VIDEO_ID>",
      "type": "Full Course|Tutorial|Interview Prep|Crash Course",
      "description": "<Why this is useful for ${role} at ${companyName}>"
    }
  ]
}

IMPORTANT:
- Provide actual YouTube video URLs that work
- Do not make up or guess video IDs
- If you cannot find actual URLs, provide search_query as fallback
- Only include videos that actually exist and are available`;

    const response = await axios.post(
      PERPLEXITY_API_URL,
      {
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const responseText = response.data.choices[0].message.content;
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
      console.warn('No valid JSON found in Perplexity response for resources');
      return null;
    }

    const resources = JSON.parse(jsonMatch[0]);
    return resources;

  } catch (error) {
    console.error('Perplexity resource verification error:', error.message);
    return null;
  }
};

/**
 * Fallback video suggestions when Perplexity is unavailable
 */
function getFallbackVideos(query, count) {
  const channels = [
    'freeCodeCamp',
    'Traversy Media',
    'The Net Ninja',
    'Programming with Mosh',
    'Web Dev Simplified',
    'Fireship',
    'Tech With Tim',
    'Corey Schafer'
  ];

  const results = [];
  for (let i = 0; i < Math.min(count, 3); i++) {
    results.push({
      title: `${query} Tutorial`,
      channel: channels[i % channels.length],
      search_query: `${channels[i % channels.length]} ${query} 2024`,
      type: 'Tutorial'
    });
  }
  return results;
}
