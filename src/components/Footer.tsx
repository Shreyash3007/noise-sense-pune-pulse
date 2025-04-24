import React from 'react';
import { Link } from 'react-router-dom';
import NoiseSenseLogo from './NoiseSenseLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            {/* Footer logo */}
            <NoiseSenseLogo size="md" animated={true} />
            <div className="flex flex-col">
              <span className="text-base font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">Noise Sense</span>
              <span className="text-xs leading-tight text-purple-600 dark:text-purple-400">Pune Pulse</span>
            </div>
          </div>
          
          <div className="flex space-x-6">
            <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors duration-200">Home</Link>
            <Link to="/map" className="text-gray-600 dark:text-gray-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors duration-200">Map</Link>
            <Link to="/about" className="text-gray-600 dark:text-gray-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors duration-200">About</Link>
            <Link to="/admin" className="text-gray-600 dark:text-gray-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors duration-200">Admin</Link>
          </div>
        </div>
        
        <div className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-6 text-center md:text-left">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Noise Sense - Pune Pulse. A crowdsourced noise pollution monitoring platform for Pune.
          </p>
        </div>
      </div>
    </footer>
  );
}; 