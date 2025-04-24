
import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Volume2, MapPin, InfoIcon, Lock, Menu, X, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Toggle dark mode
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Check if link is active
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className="bg-purple-100 dark:bg-purple-900 p-1.5 rounded-md">
                    <Volume2 className="h-5 w-5 text-purple-700 dark:text-purple-300" />
                  </div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">NoiseSense</span>
                </div>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link 
                  to="/" 
                  className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                    isActive('/') 
                      ? 'border-purple-500 text-gray-900 dark:text-white font-medium' 
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'
                  } transition-colors`}
                >
                  Report Noise
                </Link>
                <Link 
                  to="/map" 
                  className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                    isActive('/map') 
                      ? 'border-purple-500 text-gray-900 dark:text-white font-medium' 
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'
                  } transition-colors`}
                >
                  View Map
                </Link>
                <Link 
                  to="/about" 
                  className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                    isActive('/about') 
                      ? 'border-purple-500 text-gray-900 dark:text-white font-medium' 
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'
                  } transition-colors`}
                >
                  About
                </Link>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleTheme}
                className="text-gray-500 dark:text-gray-400"
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              
              <Link to="/admin">
                <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5" />
                  Admin Portal
                </Button>
              </Link>
              
              <div className="flex sm:hidden">
                <button 
                  type="button" 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {isMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="sm:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg absolute w-full z-10 animate-[fade-in_0.2s_ease-out]">
            <div className="px-4 pt-2 pb-3 space-y-1">
              <Link 
                to="/" 
                className={`block py-2.5 px-3 rounded-md ${
                  isActive('/') 
                    ? 'bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-200 font-medium' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Report Noise
                </div>
              </Link>
              <Link 
                to="/map" 
                className={`block py-2.5 px-3 rounded-md ${
                  isActive('/map') 
                    ? 'bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-200 font-medium' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  View Map
                </div>
              </Link>
              <Link 
                to="/about" 
                className={`block py-2.5 px-3 rounded-md ${
                  isActive('/about') 
                    ? 'bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-200 font-medium' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <InfoIcon className="h-5 w-5" />
                  About
                </div>
              </Link>
              <Link 
                to="/admin" 
                className={`block py-2.5 px-3 rounded-md ${
                  isActive('/admin') 
                    ? 'bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-200 font-medium' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Admin Portal
                </div>
              </Link>
            </div>
          </div>
        )}
      </nav>
      <main>{children}</main>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="bg-purple-100 dark:bg-purple-900 p-1.5 rounded-md">
                <Volume2 className="h-5 w-5 text-purple-700 dark:text-purple-300" />
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">NoiseSense</span>
            </div>
            
            <div className="flex space-x-6">
              <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Home</Link>
              <Link to="/map" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Map</Link>
              <Link to="/about" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">About</Link>
              <Link to="/admin" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Admin</Link>
            </div>
          </div>
          
          <div className="mt-6 border-t border-gray-100 dark:border-gray-700 pt-6 text-center md:text-left">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} NoiseSense. A crowdsourced noise pollution monitoring platform for Pune.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
