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

CRITICAL REQUIREMENTS:
1. MUST include 2-3 YouTube video links per week (with real URLs, titles, and channels)
2. MUST include hands-on projects (at least one per week)
3. Topics should be specific and actionable
4. Projects should build on each other progressively

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
          "title": "<video title>",
          "url": "https://www.youtube.com/watch?v=...",
          "channel": "<channel name>",
          "duration": "<duration>"
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
}`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    const roadmapData = JSON.parse(jsonMatch[0]);
    
    if (!roadmapData.milestones || roadmapData.milestones.length === 0) {
      throw new Error('Invalid roadmap structure: missing milestones');
    }

    return roadmapData;
  } catch (error) {
    console.error('Error generating structured roadmap:', error);
    throw new Error(`Failed to generate roadmap: ${error.message}`);
  }
};
