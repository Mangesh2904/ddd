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
  const [companySuggestions, setCompanySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [role, setRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [guidance, setGuidance] = useState('');
  const [resources, setResources] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
    let searchUrl = '';
    
    if (item.search_query) {
      // For resources with search queries
      if (type === 'youtube' || item.channel) {
        // YouTube search
        searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(item.search_query)}`;
      } else if (type === 'github_repos') {
        // GitHub search
        searchUrl = `https://github.com/search?q=${encodeURIComponent(item.search_query)}&type=repositories`;
      } else if (type === 'coding_practice') {
        // Google search for coding platforms
        searchUrl = `https://www.google.com/search?q=${encodeURIComponent(item.platform + ' ' + item.search_query)}`;
      } else {
        // General Google search
        searchUrl = `https://www.google.com/search?q=${encodeURIComponent(item.search_query)}`;
      }
    } else if (item.platform) {
      // Platform-specific searches
      if (item.platform === 'LeetCode') {
        searchUrl = `https://leetcode.com/problemset/`;
      } else if (item.platform === 'HackerRank') {
        searchUrl = `https://www.hackerrank.com/domains`;
      } else if (item.platform === 'InterviewBit') {
        searchUrl = `https://www.interviewbit.com/practice/`;
      } else if (item.platform === 'CodeSignal') {
        searchUrl = `https://codesignal.com/developers/`;
      } else if (item.platform === 'GeeksforGeeks') {
        searchUrl = `https://www.geeksforgeeks.org/`;
      } else if (item.platform === 'Medium' || item.platform === 'Dev.to') {
        searchUrl = `https://www.google.com/search?q=${encodeURIComponent(item.title + ' ' + item.platform)}`;
      } else {
        searchUrl = `https://www.google.com/search?q=${encodeURIComponent(item.platform + ' ' + item.title)}`;
      }
    } else if (item.how_to_find) {
      // Use Google search for how_to_find instructions
      searchUrl = `https://www.google.com/search?q=${encodeURIComponent(item.title)}`;
    } else {
      // Default: Google search with title
      searchUrl = `https://www.google.com/search?q=${encodeURIComponent(item.title + ' ' + (item.author || item.channel || ''))}`;
    }
    
    // Open in new tab
    window.open(searchUrl, '_blank', 'noopener,noreferrer');
  };

  const renderResourceSection = (title, items, type) => {
    if (!items || items.length === 0) return null;

    const getSectionColor = () => {
      const colors = {
        youtube: 'from-red-500 to-red-600',
        coding_practice: 'from-green-500 to-green-600',
        articles: 'from-blue-500 to-blue-600',
        github_repos: 'from-purple-500 to-purple-600',
        documentation: 'from-indigo-500 to-indigo-600',
        courses: 'from-orange-500 to-orange-600',
        books: 'from-pink-500 to-pink-600',
        company_specific: 'from-teal-500 to-teal-600'
      };
      return colors[type] || 'from-gray-500 to-gray-600';
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
                  {item.platform && (
                    <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">
                      Platform: {item.platform}
                    </p>
                  )}
                  {item.author && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Author: {item.author}
                    </p>
                  )}
                  {item.difficulty && (
                    <span className={`inline-block text-xs px-2 py-1 rounded-full mb-2 ${
                      item.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                      item.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      item.difficulty === 'Hard' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {item.difficulty}
                    </span>
                  )}
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                    {item.description}
                  </p>
                  {item.link_description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                      💡 {item.link_description}
                    </p>
                  )}
                  {item.search_query && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-2">
                      <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                        🔍 Click to search: "{item.search_query}"
                      </p>
                    </div>
                  )}
                  {item.how_to_find && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic mt-2">
                      📍 {item.how_to_find}
                    </p>
                  )}
                  {item.relevance && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                      ✓ {item.relevance}
                    </p>
                  )}
                  {item.topics && item.topics.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.topics.map((topic, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                          {topic}
                        </span>
                      ))}
                    </div>
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
              {resources.coding_practice && renderResourceSection('💻 Coding Practice Platforms', resources.coding_practice, 'coding_practice')}
              {resources.articles && renderResourceSection('📄 Articles & Blogs', resources.articles, 'articles')}
              {resources.github_repos && renderResourceSection('⚡ GitHub Repositories', resources.github_repos, 'github_repos')}
              {resources.documentation && renderResourceSection('📚 Documentation & Guides', resources.documentation, 'documentation')}
              {resources.courses && renderResourceSection('🎓 Online Courses', resources.courses, 'courses')}
              {resources.books && renderResourceSection('📖 Recommended Books', resources.books, 'books')}
              {resources.company_specific && renderResourceSection('🏢 Company-Specific Resources', resources.company_specific, 'company_specific')}
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