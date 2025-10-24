import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Loader, BookOpen, Plus, ThumbsUp, ThumbsDown, Star, MessageSquare, AlertCircle } from 'lucide-react'
import MarkdownRenderer from '../components/MarkdownRenderer'
import '../components/ChatbotStyles.css'

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Roadmap = () => {
  const [topic, setTopic] = useState('')
  const [weeks, setWeeks] = useState('')
  const [roadmap, setRoadmap] = useState(null)
  const [roadmapData, setRoadmapData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedback, setFeedback] = useState({
    rating: 0,
    helpful: null,
    learningPace: 'just_right',
    tooBasic: false,
    tooAdvanced: false,
    comments: '',
    completedWeeks: 0
  })
  const [currentRoadmapId, setCurrentRoadmapId] = useState(null)
  const [validationWarning, setValidationWarning] = useState(null)

  const generateRoadmap = async () => {
    if (!topic.trim() || !weeks.trim()) {
      setError('Please enter both topic and number of weeks')
      return
    }

    setIsLoading(true)
    setError(null)
    setRoadmap(null)
    setValidationWarning(null)
    setShowFeedback(false)

    try {
      const token = localStorage.getItem('token')
      const headers = {
        'Content-Type': 'application/json',
      }
      
      // Add authorization header only if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${apiUrl}/api/roadmap/generate`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ topic: topic.trim(), weeks: parseInt(weeks) }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate roadmap')
      }

      const data = await response.json()
      setRoadmap(data.roadmap)
      setRoadmapData({ 
        topic: data.topic, 
        weeks: data.weeks,
        requestedWeeks: data.requestedWeeks,
        generatedBy: 'Gemini AI'
      })

      // Show validation warning if duration was adjusted
      if (data.validation && !data.validation.is_realistic) {
        if (data.validation.warning) {
          setValidationWarning(data.validation.warning)
        } else if (data.validation.info) {
          setValidationWarning(data.validation.info)
        }
      }

      // If user is logged in, we might have a roadmap ID from response
      // For now, we'll need to fetch it or store it differently
      // This is simplified - in production you'd return the ID from the API
      
    } catch (error) {
      console.error('Error generating roadmap:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const submitFeedback = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please login to submit feedback')
        return
      }

      // In a real scenario, you'd get the roadmap ID when generating
      // For now, this is a placeholder
      if (!currentRoadmapId) {
        setError('Cannot submit feedback: roadmap ID not found')
        return
      }

      const response = await fetch(`${apiUrl}/api/roadmap/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          roadmapId: currentRoadmapId,
          ...feedback
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit feedback')
      }

      setShowFeedback(false)
      // Reset feedback form
      setFeedback({
        rating: 0,
        helpful: null,
        learningPace: 'just_right',
        tooBasic: false,
        tooAdvanced: false,
        comments: '',
        completedWeeks: 0
      })
      
      // Show success message
      console.log('Feedback submitted successfully')
    } catch (error) {
      console.error('Error submitting feedback:', error)
      setError(error.message)
    }
  }

  const addToChecklist = async (content) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please login to add items to checklist')
        return
      }

      const response = await fetch(`${apiUrl}/api/checklist/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content, type: 'roadmap' }),
      })

      if (!response.ok) {
        throw new Error('Failed to add to checklist')
      }

      // Show success message (you can implement a toast notification here)
      console.log('Added to checklist successfully')
    } catch (error) {
      console.error('Error adding to checklist:', error)
      setError(error.message)
    }
  }

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
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">Which Roadmap Should I Create For You?</h1>

      <div className="flex-grow overflow-auto mb-4">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center"
                role="alert"
              >
                <span className="font-medium">Error:</span>
                <span className="ml-2">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-md text-center">
                <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  Generating Your Roadmap
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Creating a comprehensive {weeks}-week learning plan for {topic}...
                </p>
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {roadmap && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="w-8 h-8" />
                      <div>
                        <h2 className="text-2xl font-bold">
                          {roadmapData?.topic} Learning Roadmap
                        </h2>
                        <p className="opacity-90">
                          {roadmapData?.weeks} Week Comprehensive Guide
                          <span className="ml-2 text-xs bg-green-500/30 px-2 py-1 rounded">✓ Gemini AI Powered</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setShowFeedback(!showFeedback)}
                        className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Feedback</span>
                      </button>
                      <button
                        onClick={() => addToChecklist(`${roadmapData?.topic} - ${roadmapData?.weeks} Week Roadmap`)}
                        className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add to Checklist</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Validation Warning */}
                {validationWarning && (
                  <div className="mx-6 mt-4 mb-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">{validationWarning}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Feedback Form */}
                {showFeedback && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mx-6 mb-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">How was this roadmap?</h3>
                    
                    {/* Star Rating */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Rating
                      </label>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setFeedback({ ...feedback, rating: star })}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`w-8 h-8 ${
                                star <= feedback.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Helpful */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Was this helpful?
                      </label>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setFeedback({ ...feedback, helpful: true })}
                          className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                            feedback.helpful === true
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span>Yes</span>
                        </button>
                        <button
                          onClick={() => setFeedback({ ...feedback, helpful: false })}
                          className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                            feedback.helpful === false
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <ThumbsDown className="w-4 h-4" />
                          <span>No</span>
                        </button>
                      </div>
                    </div>

                    {/* Learning Pace */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Learning Pace
                      </label>
                      <select
                        value={feedback.learningPace}
                        onChange={(e) => setFeedback({ ...feedback, learningPace: e.target.value })}
                        className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-white"
                      >
                        <option value="too_fast">Too Fast</option>
                        <option value="just_right">Just Right</option>
                        <option value="too_slow">Too Slow</option>
                      </select>
                    </div>

                    {/* Difficulty Feedback */}
                    <div className="mb-4 space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={feedback.tooBasic}
                          onChange={(e) => setFeedback({ ...feedback, tooBasic: e.target.checked })}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Content was too basic</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={feedback.tooAdvanced}
                          onChange={(e) => setFeedback({ ...feedback, tooAdvanced: e.target.checked })}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Content was too advanced</span>
                      </label>
                    </div>

                    {/* Completed Weeks */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Weeks Completed (optional)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={roadmapData?.weeks || 100}
                        value={feedback.completedWeeks}
                        onChange={(e) => setFeedback({ ...feedback, completedWeeks: parseInt(e.target.value) || 0 })}
                        className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-white"
                      />
                    </div>

                    {/* Comments */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Additional Comments (optional)
                      </label>
                      <textarea
                        value={feedback.comments}
                        onChange={(e) => setFeedback({ ...feedback, comments: e.target.value })}
                        rows="3"
                        placeholder="Tell us more about your experience..."
                        className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-white"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setShowFeedback(false)}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={submitFeedback}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        Submit Feedback
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Content */}
                <div className="p-8 chatbot-message">
                  <MarkdownRenderer content={roadmap} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!roadmap && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                Ready to Start Learning?
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Enter a topic and duration below to generate a comprehensive, 
                personalized learning roadmap with detailed resources and milestones.
              </p>
            </motion.div>
          )}
        </div>
      </div>

      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 max-w-4xl mx-auto w-full"
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center">
            Create Your Personalized Learning Roadmap
          </h3>
          <div className="flex flex-col sm:flex-row items-end space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-grow">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Learning Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., React.js, Machine Learning, Digital Marketing..."
                className="w-full p-4 border-0 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>
            <div className="w-full sm:w-32">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duration
              </label>
              <input
                type="number"
                value={weeks}
                onChange={(e) => setWeeks(e.target.value)}
                placeholder="Weeks"
                className="w-full p-4 border-0 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="52"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={generateRoadmap}
              disabled={isLoading || !topic.trim() || !weeks.trim()}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg font-semibold"
            >
              {isLoading ? 'Generating...' : 'Generate Roadmap'}
            </button>
          </div>
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
            Get a comprehensive learning plan with resources, milestones, and practical exercises
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Roadmap