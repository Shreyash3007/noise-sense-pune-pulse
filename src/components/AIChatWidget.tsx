
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Bot, X, Maximize, Minimize } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ChatBox from './ChatBox';
import NoiseSenseLogo from './NoiseSenseLogo';

const AIChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMinimized(!isMinimized);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 mb-4 overflow-hidden"
            style={{ width: '350px', height: '500px' }}
          >
            <div className="flex justify-between items-center p-2 border-b">
              <div className="flex items-center">
                <NoiseSenseLogo size="sm" className="mr-2" />
                <span className="font-medium">NoiseSense AI</span>
              </div>
              <div className="flex gap-1">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-7 w-7" 
                  onClick={toggleMinimize}
                >
                  <Minimize className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-7 w-7" 
                  onClick={toggleChat}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="h-[calc(100%-40px)]">
              <ChatBox compact />
            </div>
          </motion.div>
        )}
        
        {isOpen && isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 mb-4 overflow-hidden"
          >
            <div className="flex justify-between items-center p-3">
              <div className="flex items-center">
                <NoiseSenseLogo size="sm" className="mr-2" />
                <span className="font-medium">NoiseSense AI</span>
              </div>
              <div className="flex gap-1">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-7 w-7" 
                  onClick={toggleMinimize}
                >
                  <Maximize className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-7 w-7" 
                  onClick={toggleChat}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={toggleChat}
        size="lg"
        className={`rounded-full w-14 h-14 shadow-lg ${isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-purple-600 hover:bg-purple-700'}`}
      >
        {isOpen ? <X /> : <Bot />}
      </Button>
    </div>
  );
};

export default AIChatWidget;
