import { askGemini, generateContent } from '../services/geminiService.js';
import { verifyPlacementResources } from '../services/perplexityService.js';
import Placement from '../models/Placement.js';

export const generatePlacementContent = async (req, res) => {
  const { companyName, role } = req.body;
  const userId = req.user ? req.user.id : null;

  // Debug logging
  console.log('=== Placement Content Generation ===');
  console.log('Company Name:', companyName);
  console.log('Role:', role);
  console.log('User ID:', userId);

  try {
    if (!companyName || !companyName.trim()) {
      console.log('Error: Company name is missing');
      return res.status(400).json({ error: 'Company name is required' });
    }

    if (!role || !role.trim()) {
      console.log('Error: Role is missing');
      return res.status(400).json({ error: 'Role is required' });
    }

    // Generate comprehensive placement preparation guidance
    const guidancePrompt = `Create a comprehensive placement preparation guide for the ${role} position at ${companyName}.

**CRITICAL: Make this guide practical, actionable, and company-specific.**

Structure the guide with these sections:

## About ${companyName}
- Brief company overview and what they do
- Company culture and values
- Why work at ${companyName}
- Recent news or developments

## ${role} Role at ${companyName}
- Key responsibilities and expectations
- Required technical skills
- Day-to-day activities
- Team structure and collaboration

## Interview Process
- Typical interview rounds (phone screen, technical, behavioral, system design, etc.)
- What to expect in each round
- Duration and timeline
- Common interview formats

## Technical Preparation
### Core Topics to Master
- List the most important technical topics for ${role}
- Prioritize based on ${companyName}'s tech stack
- Include both fundamental and advanced concepts

### Key Skills Required
- Programming languages (with proficiency levels)
- Frameworks and tools
- System design knowledge
- Problem-solving approaches

### Data Structures & Algorithms
- Most frequently asked DS&A topics
- Difficulty levels to focus on
- Time complexity analysis tips

### System Design (if applicable)
- Key system design concepts
- Scalability and distributed systems
- ${companyName}-specific architecture patterns

## Preparation Strategy
### Timeline (Recommended)
- Week 1-2: Focus areas
- Week 3-4: Focus areas
- Week 5-6: Final preparation

### Daily Study Plan
- Hours to dedicate
- Topic distribution
- Practice vs Theory ratio

### Practice Recommendations
- Number of problems to solve
- Types of problems to focus on
- Mock interview importance

## Important Tips
- Company-specific interview tips
- Common mistakes to avoid
- How to stand out
- Questions to ask interviewers

## Soft Skills & Behavioral Prep
- Common behavioral questions for ${role}
- STAR method examples
- Leadership and teamwork scenarios
- Communication tips

Format this professionally with clear markdown headers, bullet points, and actionable advice. Make it comprehensive but scannable.`;

    // Generate resources with REAL links using Perplexity
    const resourcesPrompt = `Generate a comprehensive list of YouTube learning resources to prepare for ${role} position at ${companyName}.

**CRITICAL: Provide ONLY YouTube video/playlist recommendations. NO LeetCode, NO coding platforms, NO articles, NO blogs.**

IMPORTANT REQUIREMENTS:
- ONLY YouTube videos and playlists
- Content from last 2 years (2023-2025)
- From reputable educational channels
- Focus on interview preparation, technical skills, and company-specific content
- 8-12 diverse resources

Return ONLY a JSON object in this exact format:
{
  "youtube": [
    {
      "title": "<Descriptive title of what this video/playlist teaches>",
      "channel": "<Channel name - use well-known educational channels>",
      "description": "<Why this is useful for ${role} at ${companyName}>",
      "type": "Full Course|Tutorial|Interview Prep|Crash Course|Playlist",
      "search_query": "<Exact search query: Channel name + topic + year>"
    }
  ]
}

Focus on:
- Core technical skills for ${role}
- Interview preparation strategies
- System design (if applicable)
- Behavioral interview tips
- Company culture and values (if available)
- Technology stack commonly used

DO NOT include:
- LeetCode or coding practice platforms
- Articles or blog posts
- Books or documentation
- GitHub repositories
- Any non-YouTube resources`;

    // Get guidance and try to get verified resources from Perplexity
    console.log('Sending prompts to Gemini for:', companyName, 'and role:', role);
    
    // Try to get verified resources from Perplexity first
    let perplexityResources = null;
    try {
      console.log('Attempting to fetch verified resources from Perplexity...');
      perplexityResources = await verifyPlacementResources(companyName, role);
      if (perplexityResources && perplexityResources.youtube && perplexityResources.youtube.length > 0) {
        console.log(`Got ${perplexityResources.youtube.length} verified YouTube resources from Perplexity`);
      }
    } catch (perplexityError) {
      console.error('Perplexity verification failed:', perplexityError);
    }
    
    // Always get guidance from Gemini
    const guidanceResponse = await generateContent(guidancePrompt, 4096);
    console.log('Received guidance from Gemini');
    
    // If Perplexity didn't provide resources, get from Gemini as fallback
    let resources;
    if (perplexityResources && perplexityResources.youtube && perplexityResources.youtube.length > 0) {
      console.log('Using Perplexity-verified resources');
      resources = perplexityResources;
    } else {
      console.log('Perplexity resources unavailable, using Gemini fallback');
      const resourcesResponse = await generateContent(resourcesPrompt, 4096);
      
      // Parse resources JSON with robust error handling
      try {
        console.log('Raw resources response length:', resourcesResponse.length);
        
        // Clean the response to extract JSON
        let cleanedResourcesResponse = resourcesResponse
          .replace(/```json\n?/gi, '')
          .replace(/```\n?/gi, '')
          .replace(/^[^{]*/, '') // Remove any text before {
          .replace(/[^}]*$/, '') // Remove any text after }
          .trim();
        
        // Try to find JSON object in the response
        const jsonObjectMatch = cleanedResourcesResponse.match(/\{[\s\S]*\}/);
        if (jsonObjectMatch) {
          cleanedResourcesResponse = jsonObjectMatch[0];
        }
        
        console.log('Cleaned response length:', cleanedResourcesResponse.length);
        
        resources = JSON.parse(cleanedResourcesResponse);
        
        // Validate resources format
        if (typeof resources !== 'object' || Array.isArray(resources)) {
          throw new Error('Invalid resources format - not an object');
        }

        console.log('Successfully parsed resources from Gemini');

      } catch (parseError) {
        console.error('Error parsing resources JSON:', parseError.message);
        console.error('Response that failed:', resourcesResponse.substring(0, 500));
        
        // Fallback resources structure with only YouTube
        resources = {
          youtube: [
            {
              title: `${role} Interview Preparation`,
              channel: "freeCodeCamp",
              description: "Comprehensive interview preparation for the role",
              type: "Full Course",
              search_query: `freeCodeCamp ${role} interview 2024`
            },
            {
              title: `${companyName} Interview Experience and Tips`,
              channel: "Tech Interview Pro",
              description: "Learn from real interview experiences and expert tips",
              type: "Interview Prep",
              search_query: `${companyName} ${role} interview experience 2024`
            },
            {
              title: `Technical Skills for ${role}`,
              channel: "Programming with Mosh",
              description: "Master the technical skills required for the role",
              type: "Tutorial",
              search_query: `Programming with Mosh ${role} tutorial 2024`
            }
          ]
        };
        console.log('Using fallback resources');
      }
    }

    // Save to database if user is authenticated
    if (userId) {
      try {
        const placement = new Placement({
          userId,
          companyName: companyName.trim(),
          role: role.trim(),
          guidance: guidanceResponse,
          resources: resources
        });
        await placement.save();
      } catch (saveError) {
        console.error('Error saving placement data:', saveError);
        // Don't fail the request if saving fails
      }
    }

    res.status(200).json({
      guidance: guidanceResponse,
      resources: resources,
      companyName: companyName.trim(),
      role: role.trim()
    });

  } catch (error) {
    console.error('Error generating placement content:', error);
    res.status(500).json({ error: 'Failed to generate placement content' });
  }
};

export const getPlacementHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required to access placement history' });
    }

    const history = await Placement.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ history });
  } catch (error) {
    console.error('Error fetching placement history:', error);
    res.status(500).json({ error: 'Failed to fetch placement history' });
  }
};

export const searchCompanies = async (req, res) => {
  const { query } = req.query;

  if (!query || query.trim().length < 2) {
    return res.status(400).json({ error: 'Query must be at least 2 characters' });
  }

  try {
    const searchPrompt = `List 10 well-known technology companies whose names start with or contain "${query}". Include both large corporations and notable startups.

Return ONLY a JSON array of company names, no additional text:
["Company Name 1", "Company Name 2", ...]

Examples format: ["Google", "Microsoft", "Amazon", "Meta", "Netflix", "Apple", "Tesla", "Uber", "Airbnb", "Stripe"]

Focus on:
- Tech companies (software, hardware, cloud, AI, etc.)
- Companies known for hiring software engineers
- Mix of FAANG, unicorns, and well-known startups
- Real company names only

Return exactly 10 suggestions that match "${query}".`;

    const response = await generateContent(searchPrompt, 1024);
    
    // Parse the JSON response with robust error handling
    let companies;
    try {
      console.log('Company search response length:', response.length);
      
      // More aggressive cleaning
      let cleanedResponse = response
        .replace(/```json\n?/gi, '')
        .replace(/```\n?/gi, '')
        .replace(/^[^\[]*/, '') // Remove text before [
        .replace(/[^\]]*$/, '') // Remove text after ]
        .trim();
      
      // Try to extract JSON array
      const jsonMatch = cleanedResponse.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0];
      }
      
      console.log('Cleaned company response:', cleanedResponse.substring(0, 200));
      
      companies = JSON.parse(cleanedResponse);
      
      if (!Array.isArray(companies)) {
        throw new Error('Invalid response format - not an array');
      }
      
      // Filter out any non-string entries and limit to 10
      companies = companies
        .filter(c => typeof c === 'string' && c.trim().length > 0)
        .slice(0, 10);
      
      if (companies.length === 0) {
        throw new Error('No valid companies in response');
      }
      
      console.log(`Found ${companies.length} companies`);
      
    } catch (parseError) {
      console.error('Error parsing companies:', parseError.message);
      console.error('Response:', response.substring(0, 300));
      
      // Fallback with common tech companies matching the query
      const queryLower = query.toLowerCase();
      const fallbackCompanies = [
        'Google', 'Microsoft', 'Amazon', 'Apple', 'Meta',
        'Netflix', 'Tesla', 'Uber', 'Airbnb', 'Adobe',
        'Oracle', 'IBM', 'Salesforce', 'Intel', 'Nvidia',
        'Twitter', 'LinkedIn', 'Spotify', 'Slack', 'Zoom',
        'PayPal', 'Stripe', 'Square', 'Shopify', 'Atlassian',
        'Dropbox', 'Snapchat', 'Pinterest', 'Reddit', 'Discord',
        'GitHub', 'GitLab', 'Figma', 'Notion', 'Asana'
      ];
      
      companies = fallbackCompanies
        .filter(c => c.toLowerCase().includes(queryLower))
        .slice(0, 10);
      
      // If no matches, suggest based on first letter
      if (companies.length === 0) {
        companies = fallbackCompanies
          .filter(c => c.toLowerCase().startsWith(queryLower[0]))
          .slice(0, 10);
      }
      
      // If still no matches, return top 10
      if (companies.length === 0) {
        companies = fallbackCompanies.slice(0, 10);
      }
      
      console.log('Using fallback companies:', companies.length);
    }

    res.status(200).json({ companies });
  } catch (error) {
    console.error('Error searching companies:', error);
    res.status(500).json({ error: 'Failed to search companies' });
  }
};
