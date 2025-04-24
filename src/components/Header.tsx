import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';
import { Volume2, MapPin, Info as InfoIcon, Lock, Menu, X, Waves, AlertTriangle } from 'lucide-react';

// Import the NoiseSenseLogo component
import NoiseSenseLogo from './NoiseSenseLogo';

// Use named export
export const Header = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showTip, setShowTip] = useState(false);

  // Handle scroll events to change header appearance
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show educational tip after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTip(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  // Close tip after it's been shown for a while
  useEffect(() => {
    if (showTip) {
      const timer = setTimeout(() => {
        setShowTip(false);
      }, 8000);
      
      return () => clearTimeout(timer);
    }
  }, [showTip]);

  const isActive = (path: string) => location.pathname === path;

  // Animation variants
  const navItemVariants = {
    hidden: { opacity: 0, y: -5 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { 
        delay: 0.1 * custom,
        duration: 0.4,
        ease: "easeOut"
      }
    })
  };

  const logoVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        duration: 0.5,
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    }
  };

  const tipVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 25 
      }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      transition: { 
        duration: 0.3,
        ease: "easeIn" 
      } 
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-30 w-full transition-all">
      <nav className={`${
        isScrolled 
          ? 'bg-white/95 dark:bg-gray-950/95 backdrop-blur-md shadow-md border-b border-gray-200 dark:border-gray-800' 
          : 'bg-white/0 dark:bg-gray-950/0'
        } transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Desktop Navigation */}
            <div className="flex items-center">
              {/* Logo */}
              <Link to="/" className="flex items-center">
                <motion.div
                  variants={logoVariants}
                  initial="initial"
                  animate="animate"
                >
                  <NoiseSenseLogo size="md" animated={true} />
                </motion.div>
                <div className="flex flex-col ml-2">
                  <motion.span 
                    className="text-lg font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    Noise Sense
                  </motion.span>
                  <motion.span 
                    className="text-xs leading-tight text-purple-600 dark:text-purple-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    Pune Pulse
                  </motion.span>
                </div>
              </Link>

              {/* Desktop Navigation Links */}
              <div className="hidden md:flex items-center ml-10 space-x-8">
                <motion.div 
                  custom={1} 
                  variants={navItemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Link 
                    to="/" 
                    className={`inline-flex items-center px-1 pt-1 border-b-2 transition-all duration-200 ease-in-out ${
                      isActive('/') 
                        ? 'border-purple-500 text-gray-900 dark:text-white font-medium' 
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-purple-700 dark:hover:text-purple-300 hover:border-purple-300 dark:hover:border-purple-700'
                    }`}
                  >
                    <span className="relative flex items-center">
                      <Volume2 className="mr-2 h-4 w-4" />
                      Report Noise
                      {isActive('/') && (
                        <motion.span 
                          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full"
                          layoutId="underline"
                        />
                      )}
                    </span>
                  </Link>
                </motion.div>
                
                <motion.div 
                  custom={2} 
                  variants={navItemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Link 
                    to="/map" 
                    className={`inline-flex items-center px-1 pt-1 border-b-2 transition-all duration-200 ease-in-out ${
                      isActive('/map') 
                        ? 'border-purple-500 text-gray-900 dark:text-white font-medium' 
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-purple-700 dark:hover:text-purple-300 hover:border-purple-300 dark:hover:border-purple-700'
                    }`}
                  >
                    <span className="relative flex items-center">
                      <MapPin className="mr-2 h-4 w-4" />
                      View Map
                      {isActive('/map') && (
                        <motion.span 
                          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full"
                          layoutId="underline"
                        />
                      )}
                    </span>
                  </Link>
                </motion.div>
                
                <motion.div 
                  custom={3} 
                  variants={navItemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Link 
                    to="/about" 
                    className={`inline-flex items-center px-1 pt-1 border-b-2 transition-all duration-200 ease-in-out ${
                      isActive('/about') 
                        ? 'border-purple-500 text-gray-900 dark:text-white font-medium' 
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-purple-700 dark:hover:text-purple-300 hover:border-purple-300 dark:hover:border-purple-700'
                    }`}
                  >
                    <span className="relative flex items-center">
                      <InfoIcon className="mr-2 h-4 w-4" />
                      About
                      {isActive('/about') && (
                        <motion.span 
                          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full"
                          layoutId="underline"
                        />
                      )}
                    </span>
                  </Link>
                </motion.div>
              </div>
            </div>
            
            {/* Right side elements */}
            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <ThemeToggle />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <Link to="/admin">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="hidden sm:flex items-center gap-1 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-300 hover:border-purple-200 dark:hover:border-purple-800 transition-colors duration-200"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    Admin Portal
                  </Button>
                </Link>
              </motion.div>
              
              {/* Mobile menu button */}
              <div className="flex md:hidden">
                <motion.button 
                  type="button" 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-200"
                  whileTap={{ scale: 0.95 }}
                >
                  {isMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              className="md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 shadow-lg absolute w-full z-10"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="px-4 pt-2 pb-3 space-y-1">
                <Link 
                  to="/" 
                  className={`block py-2.5 px-3 rounded-md transition-all duration-200 ${
                    isActive('/') 
                      ? 'bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-900/40 dark:to-transparent text-purple-700 dark:text-purple-200 font-medium' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-300'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5" />
                    Report Noise
                  </div>
                </Link>
                <Link 
                  to="/map" 
                  className={`block py-2.5 px-3 rounded-md transition-all duration-200 ${
                    isActive('/map') 
                      ? 'bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-900/40 dark:to-transparent text-purple-700 dark:text-purple-200 font-medium' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-300'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    View Map
                  </div>
                </Link>
                <Link 
                  to="/about" 
                  className={`block py-2.5 px-3 rounded-md transition-all duration-200 ${
                    isActive('/about') 
                      ? 'bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-900/40 dark:to-transparent text-purple-700 dark:text-purple-200 font-medium' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-300'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    <InfoIcon className="h-5 w-5" />
                    About
                  </div>
                </Link>
                <Link 
                  to="/admin" 
                  className={`block py-2.5 px-3 rounded-md transition-all duration-200 ${
                    isActive('/admin') 
                      ? 'bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-900/40 dark:to-transparent text-purple-700 dark:text-purple-200 font-medium' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-300'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Admin Portal
                  </div>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Educational tip - floating notification */}
      <AnimatePresence>
        {showTip && (
          <motion.div 
            className="fixed top-20 right-4 md:right-6 lg:right-8 z-40 max-w-xs bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg shadow-lg p-4"
            variants={tipVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 text-sm">Did you know?</h4>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                  Exposure to noise above 85dB for extended periods can lead to permanent hearing damage. Help us map noise pollution in Pune!
                </p>
                <button 
                  onClick={() => setShowTip(false)}
                  className="text-xs text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 mt-2 underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

// Also keep default export for backwards compatibility
export default Header; 