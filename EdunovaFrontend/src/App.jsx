import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

// Importing components and pages
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import ChatbotFloater from './components/ChatbotFloater'
import Home from './pages/Home'
import Roadmap from './pages/Roadmap'
import Chatbot from './pages/Chatbot'
import Checklist from './pages/Checklist'
import ChatHistory from './pages/ChatHistory'
import RoadmapHistory from './pages/RoadmapHistory'
import RoadmapView from './pages/RoadmapView'
import Login from './pages/Login'
import Signup from './pages/Signup'
import PlacementPrep from './pages/PlacementPrep'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();
  
  if (!token) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
};

// Public Route Component (redirect to home if already logged in)
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    // Redirect to home if already authenticated
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'))

  // Update login state when storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem('token'));
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900 text-gray-900 dark:text-gray-100">
        {/* Show Navbar and Sidebar only when logged in */}
        {isLoggedIn && (
          <>
            <Navbar setIsSidebarOpen={setIsSidebarOpen} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <ChatbotFloater />
          </>
        )}
        
        <main className={isLoggedIn ? "pt-16 px-4 md:px-8 lg:px-16 transition-all duration-300 ease-in-out" : ""}>
          <AnimatePresence mode="wait">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={
                <PublicRoute>
                  <Login setIsLoggedIn={setIsLoggedIn} />
                </PublicRoute>
              } />
              <Route path="/signup" element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              } />

              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Home />
                  </motion.div>
                </ProtectedRoute>
              } />
              
              <Route path="/roadmap" element={
                <ProtectedRoute>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Roadmap />
                  </motion.div>
                </ProtectedRoute>
              } />
              
              <Route path="/chatbot" element={
                <ProtectedRoute>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Chatbot />
                  </motion.div>
                </ProtectedRoute>
              } />
              
              <Route path="/checklist" element={
                <ProtectedRoute>
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Checklist />
                  </motion.div>
                </ProtectedRoute>
              } />
              
              <Route path="/placement-prep" element={
                <ProtectedRoute>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PlacementPrep />
                  </motion.div>
                </ProtectedRoute>
              } />
              
              <Route path="/chat-history" element={
                <ProtectedRoute>
                  <ChatHistory />
                </ProtectedRoute>
              } />
              
              <Route path="/roadmap-history" element={
                <ProtectedRoute>
                  <RoadmapHistory />
                </ProtectedRoute>
              } />

              <Route path="/roadmap/:id" element={
                <ProtectedRoute>
                  <RoadmapView />
                </ProtectedRoute>
              } />

              {/* Catch all - redirect to login if not authenticated, home if authenticated */}
              <Route path="*" element={
                isLoggedIn ? <Navigate to="/" replace /> : <Navigate to="/login" replace />
              } />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </Router>
  )
}
