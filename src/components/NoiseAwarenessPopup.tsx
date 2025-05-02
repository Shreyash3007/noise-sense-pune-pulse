import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, Volume2, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

// List of noise awareness quotes and facts
const noiseAwarenessFacts = [
  {
    title: 'Health Impact',
    content: 'Prolonged exposure to noise levels above 70dB can contribute to stress, anxiety, and hearing damage.',
    type: 'warning',
  },
  {
    title: 'Sleep Disruption',
    content: 'Nighttime noise can disrupt sleep patterns, affecting memory and cognitive function over time.',
    type: 'info',
  },
  {
    title: 'Did You Know?',
    content: 'Noise levels in residential areas should not exceed 55dB during the day and 45dB at night as per WHO guidelines.',
    type: 'fact',
  },
  {
    title: 'Cognitive Impact',
    content: 'Chronic noise exposure can impair cognitive performance, especially in children during learning.',
    type: 'warning',
  },
  {
    title: 'Community Action',
    content: 'Your noise reports help create accurate noise maps, enabling targeted policies for noise reduction.',
    type: 'info',
  },
  {
    title: 'Heart Health',
    content: 'Traffic noise has been linked to increased risk of cardiovascular diseases and high blood pressure.',
    type: 'warning',
  },
  {
    title: 'Biodiversity Impact',
    content: 'Urban noise pollution can disrupt wildlife communication and behavior patterns.',
    type: 'fact',
  },
  {
    title: 'Sound Measurement',
    content: 'A normal conversation is about 60dB, while city traffic can reach 85dB or more.',
    type: 'fact',
  }
];

const NoiseAwarenessPopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentFact, setCurrentFact] = useState(noiseAwarenessFacts[0]);
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    // Show popup initially after 30 seconds
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 30000);

    // Setup interval for showing the popup every 2 minutes
    const intervalTimer = setInterval(() => {
      // Change to next fact
      const nextIndex = (factIndex + 1) % noiseAwarenessFacts.length;
      setFactIndex(nextIndex);
      setCurrentFact(noiseAwarenessFacts[nextIndex]);
      setIsVisible(true);
    }, 120000); // 2 minutes in milliseconds

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, [factIndex]);

  // Auto-hide popup after 10 seconds
  useEffect(() => {
    let hideTimer: NodeJS.Timeout;
    
    if (isVisible) {
      hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 10000); // 10 seconds
    }
    
    return () => {
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [isVisible]);

  // Get icon based on fact type
  const getFactIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-sky-500" />;
      default:
        return <Volume2 className="h-5 w-5 text-purple-500" />;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          style={{ 
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem', 
            zIndex: 50,
            maxWidth: '20rem' 
          }}
        >
          <Card className="border border-border shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <div className="relative overflow-hidden">
                {/* Color bar at top based on type */}
                <div 
                  className={`h-1 w-full ${
                    currentFact.type === 'warning' 
                      ? 'bg-amber-500' 
                      : currentFact.type === 'info' 
                        ? 'bg-sky-500' 
                        : 'bg-purple-500'
                  }`}
                />
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-1 right-1 h-7 w-7 text-muted-foreground hover:text-foreground" 
                  onClick={() => setIsVisible(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
                
                <div className="p-4 pt-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 pt-1">
                      {getFactIcon(currentFact.type)}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1">{currentFact.title}</h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        {currentFact.content}
                      </p>
                      <Link to="/about" className="inline-flex items-center text-xs text-primary hover:underline">
                        Learn more about noise pollution
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NoiseAwarenessPopup; 