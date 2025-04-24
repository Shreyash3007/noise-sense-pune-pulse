
import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Volume2, MapPin, InfoIcon, Lock, Menu, X, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Toggle dark mode (for future implementation)
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Here you would add actual dark mode implementation
  };

  // Check if link is active
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className="bg-purple-100 p-1.5 rounded-md">
                    <Volume2 className="h-5 w-5 text-purple-700" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">NoiseSense</span>
                </div>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link 
                  to="/" 
                  className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                    isActive('/') 
                      ? 'border-purple-500 text-gray-900 font-medium' 
                      : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                  } transition-colors`}
                >
                  Report Noise
                </Link>
                <Link 
                  to="/map" 
                  className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                    isActive('/map') 
                      ? 'border-purple-500 text-gray-900 font-medium' 
                      : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                  } transition-colors`}
                >
                  View Map
                </Link>
                <Link 
                  to="/about" 
                  className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                    isActive('/about') 
                      ? 'border-purple-500 text-gray-900 font-medium' 
                      : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
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
                onClick={toggleDarkMode}
                className="text-gray-500"
                title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
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
                  className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
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
          <div className="sm:hidden bg-white border-t border-gray-200 shadow-lg absolute w-full z-10 animate-[fade-in_0.2s_ease-out]">
            <div className="px-4 pt-2 pb-3 space-y-1">
              <Link 
                to="/" 
                className={`block py-2.5 px-3 rounded-md ${
                  isActive('/') 
                    ? 'bg-purple-50 text-purple-700 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
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
                    ? 'bg-purple-50 text-purple-700 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
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
                    ? 'bg-purple-50 text-purple-700 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
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
                    ? 'bg-purple-50 text-purple-700 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
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
      <footer className="bg-white border-t border-gray-200 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="bg-purple-100 p-1.5 rounded-md">
                <Volume2 className="h-5 w-5 text-purple-700" />
              </div>
              <span className="text-lg font-bold text-gray-900">NoiseSense</span>
            </div>
            
            <div className="flex space-x-6">
              <Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link>
              <Link to="/map" className="text-gray-600 hover:text-gray-900">Map</Link>
              <Link to="/about" className="text-gray-600 hover:text-gray-900">About</Link>
              <Link to="/admin" className="text-gray-600 hover:text-gray-900">Admin</Link>
            </div>
          </div>
          
          <div className="mt-6 border-t border-gray-100 pt-6 text-center md:text-left">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} NoiseSense. A crowdsourced noise pollution monitoring platform for Pune.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
