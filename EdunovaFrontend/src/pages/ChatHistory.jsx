'use client'

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader, MessageSquare, User, Bot } from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';
import '../components/ChatbotStyles.css';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ChatHistory() {
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/chatbot/history`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch chat history');
        }
        const data = await response.json();
        setChatHistory(data.history);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatHistory();
  }, []);

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
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">Chat History</h1>

      <div className="flex-grow overflow-auto">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-red-500 mb-4 text-center"
              >
                Error: {error}
              </motion.div>
            )}
          </AnimatePresence>
          {isLoading ? (
            <div className="text-center text-gray-600 dark:text-gray-300 flex items-center justify-center">
              <Loader className="w-6 h-6 animate-spin mr-2" />
              Loading chat history...
            </div>
          ) : chatHistory.length === 0 ? (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-600 dark:text-gray-300"
            >
              No chat history available.
            </motion.p>
          ) : (
            <div className="space-y-8">
              <AnimatePresence>
                {chatHistory.map((chat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                  >
                    {/* User Message */}
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-green-500 to-teal-600">
                            <User className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-4">
                            <p className="leading-relaxed">{chat.userMessage}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bot Response */}
                    <div className="p-6">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
                            <Bot className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 chatbot-message">
                            <MarkdownRenderer content={chat.botResponse} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="px-6 pb-4 flex items-center justify-end text-sm text-gray-500 dark:text-gray-400">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      <span>{new Date(chat.createdAt).toLocaleString()}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}