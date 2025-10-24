'use client'

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader, Calendar, Clock } from 'lucide-react';
import { isAuthenticated, getAuthHeaders } from '../utils/auth';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export default function RoadmapHistory() {
  const [roadmapHistory, setRoadmapHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchRoadmapHistory = async () => {
      try {
        if (!isAuthenticated()) {
          setError('Please login to view your roadmap history');
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${apiUrl}/api/roadmap/history`, {
          headers: getAuthHeaders()
        });
        
        if (response.status === 401) {
          setError('Session expired. Please login again');
          setIsLoading(false);
          return;
        }
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch roadmap history');
        }
        
        const data = await response.json();
        setRoadmapHistory(data.history);
      } catch (err) {
        console.error('Error fetching roadmap history:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoadmapHistory();
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
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">Roadmap History</h1>

      <div className="flex-grow overflow-auto">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl mb-6 text-center"
                role="alert"
              >
                <div className="flex flex-col items-center space-y-3">
                  <span className="font-medium">{error}</span>
                  {(error.includes('login') || error.includes('Session expired')) && (
                    <Link 
                      to="/login"
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                    >
                      Go to Login
                    </Link>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {isLoading ? (
            <div className="text-center text-gray-600 dark:text-gray-300 flex items-center justify-center">
              <Loader className="w-6 h-6 animate-spin mr-2" />
              Loading roadmap history...
            </div>
          ) : roadmapHistory.length === 0 && !error ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                No Roadmaps Yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                You haven't created any learning roadmaps yet. Start your learning journey by creating your first roadmap!
              </p>
              <Link 
                to="/roadmap"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
              >
                Create Your First Roadmap
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {roadmapHistory.map((roadmap, index) => (
                  <motion.div
                    key={roadmap._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
                  >
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{roadmap.topic}</h2>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>Duration: {roadmap.duration} weeks</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{new Date(roadmap.createdAt).toLocaleString()}</span>
                    </div>
                    <Link 
                      to={`/roadmap/${roadmap._id}`}
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                    >
                      View Roadmap
                    </Link>
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