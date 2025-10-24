import { askGemini } from '../services/geminiService.js';
import Chat from '../models/Chat.js';

export const askChatbot = async (req, res) => {
  const { message, chatHistory = [] } = req.body;
  const userId = req.user ? req.user.id : null;

  try {
    // Enhanced system context for academic and friendly responses
    const systemContext = `You are EduBot, a friendly, encouraging, and highly knowledgeable educational assistant for Edunova - a comprehensive learning platform. 📚

Your Purpose:
Help students excel in their academic journey by providing clear, concise, and engaging educational support.

You MUST ONLY help with:
1. 📖 Academic subjects: Math, Science, Programming, Literature, History, etc.
2. 💡 Study tips, learning strategies, and time management
3. 🎯 Career guidance and skill development in tech and education
4. 💻 Technology, coding, software development questions
5. 🚀 Learning roadmaps and educational resources
6. 📊 Exam preparation and concept clarification

Your Communication Style:
- Be warm, friendly, and encouraging (use emojis occasionally to be friendly)
- Keep responses concise and to the point (2-4 paragraphs max unless explaining complex topics)
- Use clear examples and analogies
- Break down complex concepts into simple, digestible parts
- Encourage curiosity and deeper learning

IMPORTANT RULES:
❌ If asked about non-educational topics (entertainment, gossip, politics, sports, general chat, personal life questions), politely redirect:
   "I'm here to help you with your studies and learning journey! 📚 Let's focus on education. How can I assist you with your academic goals today?"

✅ For educational questions:
   - Provide clear, accurate answers
   - Use examples when helpful
   - Suggest additional resources when relevant (but don't fabricate URLs)
   - Encourage practice and hands-on learning

User's question: ${message}`;

    const botResponse = await askGemini(systemContext, chatHistory);
    
    if (userId) {
      const chat = new Chat({
        userId,
        userMessage: message,
        botResponse
      });
      await chat.save();
    }

    res.status(200).json({ response: botResponse });
  } catch (error) {
    console.error('Error in chatbot request:', error);
    res.status(500).json({ error: 'Failed to get response from chatbot' });
  }
};

export const getChatHistory = async (req, res) => {
  const userId = req.user.id;

  try {
    const history = await Chat.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ history });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
};
