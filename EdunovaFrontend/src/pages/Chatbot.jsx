import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader, Send, Bot, User } from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';
import '../components/ChatbotStyles.css';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setMessages([{ 
      text: "Hey there! 👋 I'm EduBot, your friendly study companion! I'm here to help you with:\n\n📚 Understanding tough concepts\n💻 Learning to code\n🎯 Career guidance\n✨ Study tips & strategies\n\nWhat would you like to learn about today?", 
      isBot: true 
    }]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
  
    const userMessage = { text: input, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
  
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header only if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
  
      // Build chat history for context (last 10 messages, excluding welcome message)
      const chatHistory = messages
        .slice(1) // Skip the first welcome message
        .slice(-10) // Get last 10 messages
        .filter(msg => !msg.isBot || msg.text !== messages[0].text) // Exclude any welcome messages
        .map(msg => ({
          role: msg.isBot ? 'model' : 'user',
          parts: [{ text: msg.text }]
        }));

      const response = await fetch(`${apiUrl}/api/chatbot/ask`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ message: input, chatHistory }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Server responded with ${response.status}: ${errorData.message || 'Unknown error'}`);
      }
  
      const data = await response.json();
      if (!data.response) {
        throw new Error('Server response is missing the "response" field');
      }
  
      const botMessage = { text: data.response, isBot: true };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { text: `Error: ${error.message}`, isBot: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900 p-8 relative flex flex-col"
    >
      <Link to="/" className="absolute top-4 left-4 text-blue-600 dark:text-blue-400 hover:underline flex items-center">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Home
      </Link>
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">Chat with AI Assistant</h1>

      <div className="flex-grow overflow-auto mb-4">
        <div className="max-w-4xl mx-auto">
          <div className="h-[600px] overflow-y-auto p-4 space-y-6 chat-container">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} mb-6`}
                >
                  <div className={`flex max-w-[85%] ${message.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                    {/* Avatar */}
                    <div className={`flex-shrink-0 ${message.isBot ? 'mr-3' : 'ml-3'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.isBot 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                          : 'bg-gradient-to-r from-green-500 to-teal-600'
                      }`}>
                        {message.isBot ? (
                          <Bot className="w-5 h-5 text-white" />
                        ) : (
                          <User className="w-5 h-5 text-white" />
                        )}
                      </div>
                    </div>

                    {/* Message Content */}
                    <div className={`message-bubble ${
                      message.isBot 
                        ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700' 
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    } rounded-2xl shadow-lg overflow-hidden`}>
                      <div className={`p-4 ${message.isBot ? 'chatbot-message' : ''}`}>
                        {message.isBot ? (
                          <MarkdownRenderer content={message.text} />
                        ) : (
                          <p className="text-white leading-relaxed">{message.text}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start mb-6"
              >
                <div className="flex max-w-[85%]">
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-4">
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="max-w-4xl mx-auto w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            className="p-4"
          >
            <div className="flex items-end space-x-4">
              <div className="flex-grow">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Ask me about studying, programming, career advice, or any educational topic..."
                  className="chat-input w-full p-4 border-0 resize-none focus:outline-none bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 min-h-[60px] max-h-[120px]"
                  rows="2"
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
              Press Enter to send, Shift+Enter for new line
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Chatbot;