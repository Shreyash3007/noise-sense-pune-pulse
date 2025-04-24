import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  const themeIcons = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  };

  const Icon = themeIcons[theme];

  return (
    <div className="relative">
      <motion.button
        onClick={toggleMenu}
        className="p-2 rounded-lg hover:bg-accent transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Icon className="w-5 h-5" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-popover border border-border"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div className="py-1">
              {(['light', 'dark', 'system'] as const).map((themeOption) => {
                const OptionIcon = themeIcons[themeOption];
                return (
                  <motion.button
                    key={themeOption}
                    onClick={() => handleThemeChange(themeOption)}
                    className={`w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-accent transition-colors ${
                      theme === themeOption ? 'text-primary' : 'text-foreground'
                    }`}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <OptionIcon className="w-4 h-4" />
                    <span className="capitalize">{themeOption}</span>
                    {theme === themeOption && (
                      <motion.div
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                        layoutId="themeIndicator"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeToggle; 