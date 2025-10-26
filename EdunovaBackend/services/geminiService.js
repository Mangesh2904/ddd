import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { searchYouTubeVideos } from './perplexityService.js';

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

Return ONLY valid JSON in this exact format (YouTube videos will be added separately):
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

Focus on creating a comprehensive learning path with clear topics for each week. YouTube resources will be added automatically using AI-powered search.`;

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

    // Add YouTube videos using Perplexity for each week
    console.log('Fetching YouTube videos using Perplexity AI...');
    for (let i = 0; i < roadmapData.milestones.length; i++) {
      const milestone = roadmapData.milestones[i];
      try {
        // Create a search query combining topic and week topics
        const weekTopics = milestone.topics ? milestone.topics.join(', ') : milestone.title;
        const searchQuery = `${topic} ${weekTopics}`;
        
        // Fetch 2-3 videos for this week using Perplexity
        const videos = await searchYouTubeVideos(searchQuery, 3);
        milestone.youtube_videos = videos;
        
        console.log(`Added ${videos.length} videos for Week ${milestone.week}`);
      } catch (error) {
        console.error(`Error fetching videos for week ${milestone.week}:`, error);
        // Continue with next week if this one fails
        milestone.youtube_videos = [];
      }
    }

    return roadmapData;
  } catch (error) {
    console.error('Error generating structured roadmap:', error);
    throw new Error(`Failed to generate roadmap: ${error.message}`);
  }
};
