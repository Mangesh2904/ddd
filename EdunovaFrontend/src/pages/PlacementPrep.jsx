import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Loader, 
  Building2, 
  Target, 
  XCircle,
  BookOpen,
  Youtube,
  Code,
  FileText,
  Github,
  BookMarked,
  GraduationCap,
  Briefcase,
  ExternalLink,
  Lightbulb
} from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';
import '../components/ChatbotStyles.css';
import { isAuthenticated, getAuthHeaders } from '../utils/auth';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PlacementPrep = () => {
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [guidance, setGuidance] = useState('');
  const [resources, setResources] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
    setGuidance('');
    setResources(null);
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
      setGuidance(data.guidance);
      setResources(data.resources);
    } catch (error) {
      console.error('Error generating placement content:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const ResourceIcon = ({ type }) => {
    const iconMap = {
      youtube: Youtube,
      coding_practice: Code,
      articles: FileText,
      github_repos: Github,
      documentation: BookMarked,
      courses: GraduationCap,
      books: BookOpen,
      company_specific: Briefcase
    };
    const Icon = iconMap[type] || Lightbulb;
    return <Icon className="w-5 h-5" />;
  };

  const handleResourceClick = (item, type) => {
    let targetUrl = '';
    
    // Check if item has a direct URL (preferred)
    if (item.url) {
      targetUrl = item.url;
    } else if (item.search_query) {
      // Fallback to search if no direct URL
      if (type === 'youtube' || item.channel) {
        // YouTube search
        targetUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(item.search_query)}`;
      } else {
        // General Google search
        targetUrl = `https://www.google.com/search?q=${encodeURIComponent(item.search_query)}`;
      }
    } else {
      // Last resort: search by title and channel
      const searchTerm = `${item.title} ${item.channel || ''}`.trim();
      targetUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerm)}`;
    }
    
    // Open in new tab
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const renderResourceSection = (title, items, type) => {
    if (!items || items.length === 0) return null;

    // Only render YouTube resources
    if (type !== 'youtube') return null;

    const getSectionColor = () => {
      return 'from-red-500 to-red-600';
    };

    return (
      <div className="mb-8">
        <div className={`flex items-center space-x-3 mb-4 bg-gradient-to-r ${getSectionColor()} text-white px-4 py-3 rounded-lg`}>
          <ResourceIcon type={type} />
          <h3 className="text-xl font-bold">{title}</h3>
          <span className="ml-auto bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
            {items.length} {items.length === 1 ? 'Resource' : 'Resources'}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleResourceClick(item, type)}
              className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-grow">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </h4>
                  {item.channel && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">
                      Channel: {item.channel}
                    </p>
                  )}
                  {item.type && (
                    <span className="inline-block text-xs px-2 py-1 rounded-full mb-2 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                      {item.type}
                    </span>
                  )}
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                    {item.description}
                  </p>
                  {item.url ? (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mt-2">
                      <p className="text-sm text-green-800 dark:text-green-300 font-medium">
                        🎬 Click to watch: Direct YouTube link
                      </p>
                    </div>
                  ) : item.search_query && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-2">
                      <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                        🔍 Click to search: "{item.search_query}"
                      </p>
                    </div>
                  )}
                  {item.relevance && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                      ✓ {item.relevance}
                    </p>
                  )}
                </div>
                <button 
                  className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors flex-shrink-0 ml-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResourceClick(item, type);
                  }}
                  title="Open resource"
                >
                  <ExternalLink className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

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
            Placement Preparation Guide
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Get comprehensive, company-specific interview guidance and curated resources to ace your placement
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
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && generatePlacementContent()}
                placeholder="Enter company name (e.g., Google, Microsoft, Amazon)"
                className="w-full p-4 border-0 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
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
                  Generating Guide...
                </>
              ) : (
                <>
                  <Target className="w-5 h-5 mr-2" />
                  Generate Prep Guide
                </>
              )}
            </button>
          </div>
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
            Get personalized interview guidance and curated learning resources
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
                Preparing Your Guide
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Generating comprehensive preparation material for {role === 'custom' ? customRole : role} at {companyName}...
              </p>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        {!isLoading && guidance && resources && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Guidance Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                <h2 className="text-2xl font-bold flex items-center">
                  <Lightbulb className="w-6 h-6 mr-3" />
                  Interview Preparation Guide
                </h2>
                <p className="opacity-90 mt-1">
                  {companyName} - {role === 'custom' ? customRole : role} Position
                </p>
              </div>

              <div className="p-8 chatbot-message max-h-[600px] overflow-y-auto">
                <MarkdownRenderer content={guidance} />
              </div>
            </div>

            {/* Resources Section */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 mr-3 text-green-600" />
                  Learning Resources
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Curated resources to help you prepare effectively
                </p>
              </div>

              {resources.youtube && renderResourceSection('📺 YouTube Videos & Playlists', resources.youtube, 'youtube')}
              
              {(!resources.youtube || resources.youtube.length === 0) && (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                  <Youtube className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No YouTube resources available at the moment.</p>
                  <p className="text-sm mt-2">Try searching on YouTube directly for "{role} at {companyName}"</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && !guidance && !resources && !error && (
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
              Enter your target company and role above to get a comprehensive preparation guide with curated resources.
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default PlacementPrep;