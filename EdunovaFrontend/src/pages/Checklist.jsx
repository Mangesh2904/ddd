'use client'

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Loader, 
  Plus, 
  Trash2, 
  Check, 
  Filter, 
  CheckCircle2, 
  Circle, 
  Calendar,
  MessageSquare,
  Map,
  Target,
  AlertCircle
} from 'lucide-react';
import { isAuthenticated, getAuthHeaders } from '../utils/auth';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Checklist() {
  const [checklistItems, setChecklistItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [newItemType, setNewItemType] = useState('chat');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'completed', 'pending'
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'chat', 'roadmap'
  const [isAddingItem, setIsAddingItem] = useState(false);

  useEffect(() => {
    fetchChecklist();
  }, []);

  useEffect(() => {
    filterItems();
  }, [checklistItems, filter, typeFilter]);

  const filterItems = () => {
    let filtered = checklistItems;

    // Filter by completion status
    if (filter === 'completed') {
      filtered = filtered.filter(item => item.completed);
    } else if (filter === 'pending') {
      filtered = filtered.filter(item => !item.completed);
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === typeFilter);
    }

    setFilteredItems(filtered);
  };

  const fetchChecklist = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!isAuthenticated()) {
        setError('Please login to view your checklist');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${apiUrl}/api/checklist`, {
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        setError('Session expired. Please login again');
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch checklist');
      }

      const data = await response.json();
      setChecklistItems(data.checklist);
    } catch (e) {
      console.error('Fetch error:', e);
      setError(e.message || 'An error occurred while fetching the checklist. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async () => {
    if (!newItem.trim()) return;
    
    setIsAddingItem(true);
    setError(null);
    
    try {
      if (!isAuthenticated()) {
        setError('Please login to add items to your checklist');
        setIsAddingItem(false);
        return;
      }

      const response = await fetch(`${apiUrl}/api/checklist/add`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content: newItem.trim(), type: newItemType }),
      });

      if (response.status === 401) {
        setError('Session expired. Please login again');
        setIsAddingItem(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add item');
      }

      const data = await response.json();
      setNewItem('');
      setChecklistItems((prev) => [data.item, ...prev]);
    } catch (e) {
      console.error('Add item error:', e);
      setError(e.message || 'Failed to add item. Please try again.');
    } finally {
      setIsAddingItem(false);
    }
  };

  const toggleItemCompletion = async (id, completed) => {
    // Optimistically update UI
    setChecklistItems(prev => 
      prev.map(item => 
        item._id === id ? { ...item, completed: !completed } : item
      )
    );

    try {
      const response = await fetch(`${apiUrl}/api/checklist/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ completed: !completed }),
      });

      if (!response.ok) {
        // Revert optimistic update on error
        setChecklistItems(prev => 
          prev.map(item => 
            item._id === id ? { ...item, completed: completed } : item
          )
        );
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update item');
      }
    } catch (e) {
      console.error('Toggle completion error:', e);
      setError(e.message || 'Failed to update item. Please try again.');
    }
  };

  const removeItem = async (id) => {
    // Optimistically remove from UI
    const originalItems = checklistItems;
    setChecklistItems(prev => prev.filter(item => item._id !== id));

    try {
      const response = await fetch(`${apiUrl}/api/checklist/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        // Revert optimistic update on error
        setChecklistItems(originalItems);
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove item');
      }
    } catch (e) {
      console.error('Remove item error:', e);
      setError(e.message || 'Failed to remove item. Please try again.');
    }
  };

  const getItemIcon = (type) => {
    switch (type) {
      case 'chat':
        return <MessageSquare className="w-4 h-4" />;
      case 'roadmap':
        return <Map className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const getCompletionStats = () => {
    const total = checklistItems.length;
    const completed = checklistItems.filter(item => item.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
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
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">My Learning Checklist</h1>
        {!error && checklistItems.length > 0 && (
          <div className="inline-flex items-center space-x-4 bg-white dark:bg-gray-800 rounded-full px-6 py-3 shadow-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {getCompletionStats().completed} of {getCompletionStats().total} completed
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300"
                  style={{ width: `${getCompletionStats().percentage}%` }}
                />
              </div>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                {getCompletionStats().percentage}%
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex-grow overflow-auto mb-4">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl mb-6 flex items-center"
                role="alert"
              >
                <AlertCircle className="w-5 h-5 mr-3" />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
                  <span className="font-medium">{error}</span>
                  {(error.includes('login') || error.includes('Session expired')) && (
                    <Link 
                      to="/login"
                      className="mt-2 sm:mt-0 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                    >
                      Go to Login
                    </Link>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isLoading ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-md text-center">
                <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  Loading Your Checklist
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Fetching your learning tasks...
                </p>
              </div>
            </motion.div>
          ) : !error && (
            <>
              {/* Add Item Section */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6"
              >
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Add New Task
                </h3>
                <div className="flex flex-col sm:flex-row items-end space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="flex-grow">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Task Description
                    </label>
                    <input
                      type="text"
                      value={newItem}
                      onChange={(e) => setNewItem(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addItem()}
                      className="w-full p-4 border-0 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Complete React tutorial, Read about machine learning..."
                      disabled={isAddingItem}
                    />
                  </div>
                  <div className="w-full sm:w-40">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={newItemType}
                      onChange={(e) => setNewItemType(e.target.value)}
                      className="w-full p-4 border-0 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isAddingItem}
                    >
                      <option value="chat">Chat Task</option>
                      <option value="roadmap">Roadmap Task</option>
                    </select>
                  </div>
                  <button 
                    onClick={addItem} 
                    disabled={isAddingItem || !newItem.trim()}
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg font-semibold flex items-center justify-center"
                  >
                    {isAddingItem ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-5 h-5 mr-2" />
                        Add Task
                      </>
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Filters Section */}
              {checklistItems.length > 0 && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                      <Filter className="w-5 h-5 mr-2" />
                      Filter Tasks
                    </h3>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                      <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2 border-0 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Tasks</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                      </select>
                      <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-4 py-2 border-0 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Categories</option>
                        <option value="chat">Chat Tasks</option>
                        <option value="roadmap">Roadmap Tasks</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Checklist Items */}
              <div className="space-y-4">
                <AnimatePresence>
                  {filteredItems.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <Target className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                        {checklistItems.length === 0 ? 'No Tasks Yet' : 'No Tasks Match Your Filter'}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        {checklistItems.length === 0 
                          ? 'Start organizing your learning journey by adding your first task!'
                          : 'Try adjusting your filters to see more tasks.'
                        }
                      </p>
                      {checklistItems.length === 0 && (
                        <button
                          onClick={() => document.querySelector('input[placeholder*="task"]')?.focus()}
                          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                        >
                          <Plus className="w-5 h-5 mr-2" />
                          Add Your First Task
                        </button>
                      )}
                    </motion.div>
                  ) : (
                    filteredItems.map((item, index) => (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 ${
                          item.completed ? 'opacity-75' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-4">
                          <button
                            onClick={() => toggleItemCompletion(item._id, item.completed)}
                            className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                              item.completed 
                                ? 'bg-green-500 border-green-500 shadow-lg shadow-green-200' 
                                : 'border-gray-300 dark:border-gray-500 hover:border-green-400'
                            }`}
                          >
                            {item.completed && <Check className="w-4 h-4 text-white" />}
                          </button>
                          
                          <div className="flex-grow min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-grow">
                                <p className={`text-base leading-relaxed ${
                                  item.completed 
                                    ? 'line-through text-gray-500 dark:text-gray-400' 
                                    : 'text-gray-800 dark:text-white'
                                }`}>
                                  {item.content}
                                </p>
                                <div className="flex items-center space-x-4 mt-3">
                                  <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
                                    item.type === 'chat' 
                                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                      : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                  }`}>
                                    {getItemIcon(item.type)}
                                    <span className="capitalize">{item.type}</span>
                                  </div>
                                  <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                                    <Calendar className="w-3 h-3" />
                                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <button 
                                onClick={() => removeItem(item._id)} 
                                className="ml-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                                title="Delete task"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}