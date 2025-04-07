import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isSeller } = useAuth();
  
  // Check if current route matches the given path
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="backdrop-blur-md bg-black/70 border-b border-white/10 fixed w-full z-50"
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-white">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              _art
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {['/', '/explore', '/artists'].map((path, index) => (
              <motion.div
                key={path}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1), duration: 0.3 }}
              >
                <Link 
                  to={path} 
                  className={`font-medium hover:text-white transition-all duration-300 ${
                    isActive(path) 
                      ? 'text-white relative after:absolute after:bottom-[-6px] after:left-0 after:h-[2px] after:w-full after:bg-white after:origin-bottom-right after:scale-x-100' 
                      : 'text-gray-400 relative after:absolute after:bottom-[-6px] after:left-0 after:h-[2px] after:w-full after:bg-white after:origin-bottom-right after:scale-x-0 after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100'
                  }`}
                >
                  {path === '/' ? 'Home' : 
                   path === '/explore' ? 'Explore' : 
                   'Artists'}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="relative"
            >
              <input 
                type="text" 
                placeholder="Search artwork..."
                className="py-2 pl-10 pr-4 rounded-full backdrop-blur-md bg-white/5 border border-white/20 focus:outline-none focus:border-white/40 text-white w-40 lg:w-64 transition-all duration-300 focus:w-72"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              whileHover={{ scale: 1.1 }}
            >
              <Link to="/profile" className="text-gray-400 hover:text-white transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            </motion.div>

            {isSeller && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
              >
                <Link to="/upload" className="backdrop-blur-md bg-white/90 text-black py-2 px-4 rounded-lg hover:bg-white transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                  Upload Art
                </Link>
              </motion.div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            whileTap={{ scale: 0.9 }}
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden py-4 border-t border-white/10 overflow-hidden"
            >
              <nav className="flex flex-col space-y-4">
                {['/', '/explore', '/artists'].map((path, index) => (
                  <motion.div
                    key={path}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.3 }}
                  >
                    <Link 
                      to={path} 
                      className={`font-medium hover:text-white transition ${
                        isActive(path) ? 'text-white' : 'text-gray-400'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {path === '/' ? 'Home' : 
                      path === '/explore' ? 'Explore' : 
                      'Artists'}
                    </Link>
                  </motion.div>
                ))}

                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  className="pt-2 border-t border-white/10"
                >
                  <Link 
                    to="/profile" 
                    className="flex items-center font-medium text-gray-400 hover:text-white transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </Link>
                </motion.div>

                {isSeller && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                    whileHover={{ scale: 1.03 }}
                  >
                    <Link 
                      to="/upload" 
                      className="backdrop-blur-md bg-white/90 text-black py-2 px-4 rounded-lg text-center hover:bg-white transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.3)] block"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Upload Art
                    </Link>
                  </motion.div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header; 