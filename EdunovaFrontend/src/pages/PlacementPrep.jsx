import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Loader, 
  Building2, 
  Target, 
  CheckCircle2, 
  XCircle, 
  Brain,
  BookOpen,
  Award,
  RefreshCw,
  ChevronRight,
  Lightbulb
} from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';
import '../components/ChatbotStyles.css';
import { isAuthenticated, getAuthHeaders } from '../utils/auth';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PlacementPrep = () => {
  const [companyName, setCompanyName] = useState('');
  const [companySuggestions, setCompanySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [role, setRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [questions, setQuestions] = useState([]);
  const [concepts, setConcepts] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('questions'); // 'questions' or 'concepts'

  // Debounced company search
  useEffect(() => {
    const searchCompanies = async () => {
      if (companyName.trim().length < 2) {
        setCompanySuggestions([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(`${apiUrl}/api/placement/companies/search?query=${encodeURIComponent(companyName)}`);
        if (response.ok) {
          const data = await response.json();
          setCompanySuggestions(data.companies || []);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Error searching companies:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(searchCompanies, 300);
    return () => clearTimeout(timer);
  }, [companyName]);

  const generatePlacementContent = async () => {
    if (!companyName.trim()) {
      setError('Please enter a company name');
      return;
    }
    
    const finalRole = role === 'custom' ? customRole : role;
    if (!finalRole.trim()) {
      setError('Please select or enter a role');
      return;
    }

    setIsLoading(true);
    setError(null);
    setQuestions([]);
    setConcepts('');
    setSelectedAnswers({});
    setShowResults(false);
    setCurrentQuestionIndex(0);
    if (role !== 'custom') {
      setCustomRole('');
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${apiUrl}/api/placement/generate`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ 
          companyName: companyName.trim(),
          role: finalRole.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate placement content');
      }

      const data = await response.json();
      setQuestions(data.questions);
      setConcepts(data.concepts);
    } catch (error) {
      console.error('Error generating placement content:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex, selectedOption) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: selectedOption
    }));
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    setScore(correctAnswers);
    setShowResults(true);
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setShowResults(false);
    setCurrentQuestionIndex(0);
    setScore(0);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const getScoreColor = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900 p-8 relative"
    >
      <Link to="/" className="absolute top-4 left-4 text-blue-600 dark:text-blue-400 hover:underline flex items-center">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Home
      </Link>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 flex items-center justify-center">
            <Building2 className="w-8 h-8 mr-3" />
            Placement Preparation
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Get company-specific interview questions and important concepts to ace your placement interviews
          </p>
        </div>

        {/* Input Section */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center">
            Choose Your Target Company & Role
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && !showSuggestions && generatePlacementContent()}
                  onFocus={() => companySuggestions.length > 0 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Type to search companies..."
                  className="w-full p-4 border-0 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                  autoComplete="off"
                />
                {isSearching && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <Loader className="w-4 h-4 animate-spin text-blue-500" />
                  </div>
                )}
              </div>
              
              {/* Autocomplete Dropdown */}
              {showSuggestions && companySuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
                  {companySuggestions.map((company, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setCompanyName(company);
                        setShowSuggestions(false);
                      }}
                      className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer transition-colors flex items-center"
                    >
                      <Building2 className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="text-gray-800 dark:text-white">{company}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-4 border-0 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <option value="">Select a role...</option>
                <option value="Software Engineer">Software Engineer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="Data Analyst">Data Analyst</option>
                <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                <option value="DevOps Engineer">DevOps Engineer</option>
                <option value="Product Manager">Product Manager</option>
                <option value="QA Engineer">QA Engineer</option>
                <option value="Security Engineer">Security Engineer</option>
                <option value="Mobile Developer">Mobile Developer</option>
                <option value="UI/UX Designer">UI/UX Designer</option>
                <option value="Business Analyst">Business Analyst</option>
                <option value="Technical Lead">Technical Lead</option>
                <option value="System Administrator">System Administrator</option>
                <option value="Cloud Engineer">Cloud Engineer</option>
                <option value="custom">Other (Custom Role)</option>
              </select>
              {role === 'custom' && (
                <input
                  type="text"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && generatePlacementContent()}
                  placeholder="Enter your custom role..."
                  className="w-full p-4 border-0 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                  disabled={isLoading}
                />
              )}
            </div>
          </div>
          <div className="flex justify-center">
            <button
              onClick={generatePlacementContent}
              disabled={isLoading || !companyName.trim() || (role === 'custom' ? !customRole.trim() : !role.trim())}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg font-semibold flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Target className="w-5 h-5 mr-2" />
                  Generate Prep Material
                </>
              )}
            </button>
          </div>
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
            Get tailored interview questions and key concepts for your target company
          </div>
        </motion.div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl mb-6 flex items-center"
              role="alert"
            >
              <XCircle className="w-5 h-5 mr-3" />
              <span className="font-medium">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-md text-center">
              <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Preparing Your Interview Material
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Generating {role === 'custom' ? customRole : role} questions and concepts for {companyName}...
              </p>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        {!isLoading && questions.length > 0 && concepts && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Questions Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                <h2 className="text-xl font-bold flex items-center">
                  <Brain className="w-6 h-6 mr-3" />
                  Interview Questions
                </h2>
                <p className="opacity-90 mt-1">
                  {companyName} - {role === 'custom' ? customRole : role} Position
                </p>
              </div>

              <div className="p-6">
                {!showResults ? (
                  <>
                    {/* Question Navigation */}
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Question {currentQuestionIndex + 1} of {questions.length}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={prevQuestion}
                          disabled={currentQuestionIndex === 0}
                          className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={nextQuestion}
                          disabled={currentQuestionIndex === questions.length - 1}
                          className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                      />
                    </div>

                    {/* Current Question */}
                    {currentQuestion && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white leading-relaxed">
                          {currentQuestion.question}
                        </h3>
                        
                        <div className="space-y-3">
                          {currentQuestion.options.map((option, optionIndex) => (
                            <button
                              key={optionIndex}
                              onClick={() => handleAnswerSelect(currentQuestionIndex, optionIndex)}
                              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                                selectedAnswers[currentQuestionIndex] === optionIndex
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                  : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                              }`}
                            >
                              <div className="flex items-center">
                                <span className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center text-xs font-bold ${
                                  selectedAnswers[currentQuestionIndex] === optionIndex
                                    ? 'border-blue-500 bg-blue-500 text-white'
                                    : 'border-gray-300'
                                }`}>
                                  {String.fromCharCode(65 + optionIndex)}
                                </span>
                                <span className="text-gray-800 dark:text-white">{option}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Submit Quiz Button */}
                    <div className="mt-8 flex justify-center">
                      <button
                        onClick={calculateScore}
                        disabled={Object.keys(selectedAnswers).length !== questions.length}
                        className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg font-semibold flex items-center"
                      >
                        <Award className="w-5 h-5 mr-2" />
                        Submit Quiz
                      </button>
                    </div>
                  </>
                ) : (
                  /* Results Section */
                  <div className="text-center space-y-6">
                    <div className={`text-6xl font-bold ${getScoreColor()}`}>
                      {score}/{questions.length}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                        Quiz Completed!
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        You scored {Math.round((score / questions.length) * 100)}% on {companyName} interview questions
                      </p>
                    </div>

                    {/* Detailed Results */}
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {questions.map((question, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border-l-4 ${
                            selectedAnswers[index] === question.correctAnswer
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                              : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400 flex-grow">
                              Q{index + 1}: {question.question.substring(0, 50)}...
                            </span>
                            {selectedAnswers[index] === question.correctAnswer ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={resetQuiz}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-lg font-semibold flex items-center mx-auto"
                    >
                      <RefreshCw className="w-5 h-5 mr-2" />
                      Retake Quiz
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Concepts Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-teal-600 p-6 text-white">
                <h2 className="text-xl font-bold flex items-center">
                  <Lightbulb className="w-6 h-6 mr-3" />
                  Key Concepts
                </h2>
                <p className="opacity-90 mt-1">
                  Important topics for {companyName} - {role === 'custom' ? customRole : role}
                </p>
              </div>

              <div className="p-6 chatbot-message max-h-[600px] overflow-y-auto">
                <MarkdownRenderer content={concepts} />
              </div>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && questions.length === 0 && !concepts && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              Ready to Ace Your Interview?
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Enter your target company name and role above to get personalized interview questions 
              and important concepts to study.
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default PlacementPrep;