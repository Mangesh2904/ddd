'use client'

import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader, BookOpen, Plus, Check, Calendar, Clock, Share2 } from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';
import '../components/ChatbotStyles.css';
import { isAuthenticated, getAuthHeaders } from '../utils/auth';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function RoadmapView() {
  const { id } = useParams();
  const [roadmap, setRoadmap] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isAddingToChecklist, setIsAddingToChecklist] = useState(false);
  const [addedItems, setAddedItems] = useState(new Set());

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        if (!isAuthenticated()) {
          setError('Please login to view roadmap');
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${apiUrl}/api/roadmap/${id}`, {
          headers: getAuthHeaders()
        });
        
        if (response.status === 401) {
          setError('Session expired. Please login again');
          setIsLoading(false);
          return;
        }
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch roadmap');
        }
        
        const data = await response.json();
        setRoadmap(data.roadmap);
      } catch (err) {
        console.error('Error fetching roadmap:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoadmap();
  }, [id]);

  const extractTopicsFromRoadmap = () => {
    if (!roadmap || !roadmap.structuredRoadmap || !roadmap.structuredRoadmap.milestones) {
      return [];
    }

    const topics = [];
    roadmap.structuredRoadmap.milestones.forEach((milestone) => {
      if (milestone.topics && Array.isArray(milestone.topics)) {
        milestone.topics.forEach((topic) => {
          topics.push({
            id: `${milestone.week}-${topic}`,
            week: milestone.week,
            weekTitle: milestone.title,
            content: topic
          });
        });
      }
    });
    return topics;
  };

  const toggleItemSelection = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const addSelectedToChecklist = async () => {
    if (selectedItems.size === 0) {
      alert('Please select at least one item to add to checklist');
      return;
    }

    setIsAddingToChecklist(true);
    const topics = extractTopicsFromRoadmap();
    const itemsToAdd = topics.filter(t => selectedItems.has(t.id));

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to add items to checklist');
        return;
      }

      // Add each selected item to checklist
      for (const item of itemsToAdd) {
        const response = await fetch(`${apiUrl}/api/checklist/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            content: `${item.weekTitle}: ${item.content}`,
            type: 'roadmap'
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to add "${item.content}" to checklist`);
        }
      }

      // Update added items
      const newAdded = new Set(addedItems);
      selectedItems.forEach(id => newAdded.add(id));
      setAddedItems(newAdded);
      
      // Clear selection
      setSelectedItems(new Set());
      
      alert(`Successfully added ${itemsToAdd.length} item(s) to checklist!`);
    } catch (error) {
      console.error('Error adding to checklist:', error);
      setError(error.message);
    } finally {
      setIsAddingToChecklist(false);
    }
  };

  const topics = extractTopicsFromRoadmap();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900 p-8 relative flex flex-col"
    >
      <div className="flex items-center justify-between mb-8">
        <Link to="/roadmap-history" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to History
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-600 dark:text-gray-300 flex items-center justify-center flex-grow">
          <Loader className="w-6 h-6 animate-spin mr-2" />
          Loading roadmap...
        </div>
      ) : error ? (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl mb-6 text-center max-w-2xl mx-auto"
          role="alert"
        >
          <div className="flex flex-col items-center space-y-3">
            <span className="font-medium">{error}</span>
            {(error.includes('login') || error.includes('Session expired')) && (
              <Link 
                to="/login"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Go to Login
              </Link>
            )}
          </div>
        </motion.div>
      ) : roadmap ? (
        <div className="max-w-6xl mx-auto w-full space-y-6">
          {/* Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-8 h-8" />
                  <div>
                    <h1 className="text-2xl font-bold">{roadmap.topic}</h1>
                    <div className="flex items-center space-x-4 mt-2 text-sm opacity-90">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{roadmap.duration} weeks</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{new Date(roadmap.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Add to Checklist Section */}
            {topics.length > 0 && (
              <div className="p-6 bg-gradient-to-r from-green-50 to-teal-50 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                      <Plus className="w-5 h-5 mr-2 text-green-600" />
                      Add Topics to Checklist
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Select topics you want to add to your learning checklist
                    </p>
                  </div>
                  {selectedItems.size > 0 && (
                    <button
                      onClick={addSelectedToChecklist}
                      disabled={isAddingToChecklist}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAddingToChecklist ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          <span>Adding...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Add {selectedItems.size} to Checklist</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Topic Selection Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {topics.map((topic) => (
                    <div
                      key={topic.id}
                      onClick={() => !addedItems.has(topic.id) && toggleItemSelection(topic.id)}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        addedItems.has(topic.id)
                          ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 opacity-60 cursor-not-allowed'
                          : selectedItems.has(topic.id)
                          ? 'bg-green-100 dark:bg-green-900/30 border-green-500 dark:border-green-600'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-600'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                          addedItems.has(topic.id)
                            ? 'bg-gray-400 border-gray-400'
                            : selectedItems.has(topic.id)
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {(selectedItems.has(topic.id) || addedItems.has(topic.id)) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div className="flex-grow">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Week {topic.week}
                          </div>
                          <div className="text-sm font-medium text-gray-800 dark:text-white">
                            {topic.content}
                          </div>
                          {addedItems.has(topic.id) && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              ✓ Already in checklist
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Roadmap Content */}
            <div className="p-8 chatbot-message">
              <MarkdownRenderer content={roadmap.content} />
            </div>
          </motion.div>
        </div>
      ) : null}
    </motion.div>
  );
}
