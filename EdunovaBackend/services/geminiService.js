import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// For chatbot with conversation history
export const askGemini = async (prompt, chatHistory = []) => {
  try {
    // If no chat history, use generateContent instead
    if (!chatHistory || chatHistory.length === 0) {
      const result = await model.generateContent(prompt);
      return result.response.text();
    }

    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to get response from Gemini');
  }
};

// For single prompts without conversation history
export const generateContent = async (prompt, maxTokens = 4096) => {
  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.7,
      },
    });
    return result.response.text();
  } catch (error) {
    console.error('Gemini generateContent error:', error);
    throw new Error(`Failed to generate content: ${error.message}`);
  }
};

export const generateStructuredRoadmap = async (topic, weeks) => {
  const prompt = `Generate a comprehensive ${weeks}-week learning roadmap for "${topic}".

CRITICAL INSTRUCTIONS FOR YOUTUBE RECOMMENDATIONS:
1. Provide 2-3 YouTube video/playlist SEARCH RECOMMENDATIONS per week
2. Use DIVERSE, HIGH-QUALITY educational channels (mix different creators, don't repeat same channels)
3. ONLY recommend content from channels known for ${topic}
4. Content should be recent (uploaded within last 2-2.5 years when possible)

RECOMMENDED CHANNELS BY CATEGORY:
**Web Development:**
- Traversy Media, The Net Ninja, Kevin Powell, Web Dev Simplified, Fireship, Dave Gray, JavaScript Mastery, Coding Addict

**Programming/CS:**
- freeCodeCamp, Programming with Mosh, Tech With Tim, Corey Schafer, CS Dojo, CodeWithHarry

**Python/Data Science:**
- Tech With Tim, Corey Schafer, Krish Naik, CodeBasics, sentdex, Keith Galli

**React/Frontend:**
- Traversy Media, JavaScript Mastery, Academind, PedroTech, Coding Addict, Dave Gray

**Backend/Databases:**
- Traversy Media, Hussein Nasser, Fireship, Ben Awad, Caleb Curry

**DevOps/Cloud:**
- TechWorld with Nana, Fireship, NetworkChuck, Cloud Advocate

**Mobile Development:**
- The Net Ninja, Academind, Traversy Media, Programming with Mosh

IMPORTANT:
- For each recommendation, provide SEARCH INSTRUCTIONS (e.g., "Search: React Complete Course 2024 Traversy Media")
- DO NOT generate fake video URLs
- Provide channel name + specific search query
- Vary the channels across weeks
- Mention if it's a full course/tutorial/crash course

Return ONLY valid JSON in this exact format:
{
  "topic": "${topic}",
  "duration_weeks": ${weeks},
  "total_estimated_hours": <number>,
  "description": "<brief overview>",
  "prerequisites": ["prereq1", "prereq2"],
  "milestones": [
    {
      "week": 1,
      "title": "Week 1: <Title>",
      "topics": ["topic1", "topic2", "topic3"],
      "youtube_videos": [
        {
          "title": "<Specific topic/concept to learn>",
          "search_query": "<Channel Name> <Specific search terms> <Year if relevant>",
          "channel": "<channel name>",
          "type": "Full Course|Tutorial|Crash Course|Playlist"
        }
      ],
      "difficulty": "Beginner|Intermediate|Advanced",
      "estimated_hours": <number>
    }
  ],
  "projects": [
    {
      "title": "<project name>",
      "description": "<what to build>",
      "week_assignment": <week_number>,
      "difficulty": "Beginner|Intermediate|Advanced",
      "estimated_hours": <number>
    }
  ]
}

EXAMPLE:
{
  "youtube_videos": [
    {
      "title": "React Fundamentals and Hooks",
      "search_query": "Traversy Media React Crash Course 2024",
      "channel": "Traversy Media",
      "type": "Crash Course"
    }
  ]
}`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    const roadmapData = JSON.parse(jsonMatch[0]);
    
    // Validate structure
    if (!roadmapData.milestones || roadmapData.milestones.length === 0) {
      throw new Error('Invalid roadmap structure: missing milestones');
    }

    // Validate YouTube links format
    roadmapData.milestones.forEach((milestone, idx) => {
      if (milestone.youtube_videos) {
        milestone.youtube_videos = milestone.youtube_videos.map(video => {
          // Ensure required fields exist
          if (!video.search_query && !video.url) {
            console.warn(`Missing search_query in week ${idx + 1}`);
            video.search_query = `${video.channel} ${video.title}`;
          }
          return video;
        });
      }
    });

    return roadmapData;
  } catch (error) {
    console.error('Error generating structured roadmap:', error);
    throw new Error(`Failed to generate roadmap: ${error.message}`);
  }
};
