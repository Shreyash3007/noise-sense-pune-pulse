
import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';

interface NoiseSenseLogo {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  colorScheme?: 'primary' | 'light' | 'dark';
  withText?: boolean;
  animated?: boolean;
  pulse?: boolean;
  theme?: string;
}

const NoiseSenseLogo: React.FC<NoiseSenseLogo> = ({
  className,
  size = 'md',
  colorScheme = 'primary',
  withText = true,
  animated = false,
  pulse = false,
  theme,
}) => {
  // Size mappings
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };
  
  // Color mappings
  const colorClasses = {
    primary: {
      primary: 'text-primary',
      secondary: 'text-primary/80',
      accent: 'text-blue-500',
    },
    light: {
      primary: 'text-white',
      secondary: 'text-white/80',
      accent: 'text-blue-300',
    },
    dark: {
      primary: 'text-gray-900',
      secondary: 'text-gray-800',
      accent: 'text-blue-600',
    },
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };
  
  const [isAnimating, setIsAnimating] = useState(false);

  // For hover animation
  useEffect(() => {
    if (animated) {
      const interval = setInterval(() => {
        setIsAnimating(true);
        const timeout = setTimeout(() => {
          setIsAnimating(false);
        }, 2000);
        return () => clearTimeout(timeout);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [animated]);

  // Override colorScheme based on theme if provided
  const effectiveColorScheme = theme === 'dark' ? 'light' : 
                               theme === 'light' ? 'primary' : 
                               colorScheme;

  // Fixed the animation variants to use proper types for repeatType
  const outerWaveVariants = {
    initial: { scale: 0.9, opacity: 0.2 },
    animate: { 
      scale: 1.1, 
      opacity: 0.3, 
      transition: { 
        duration: 2, 
        repeat: Infinity, 
        repeatType: "reverse" as const
      } 
    },
    hover: { scale: 1.15, opacity: 0.4, transition: { duration: 0.3 } }
  };

  const middleWaveVariants = {
    initial: { scale: 0.8, opacity: 0.4 },
    animate: { 
      scale: 1, 
      opacity: 0.6, 
      transition: { 
        duration: 1.5, 
        repeat: Infinity, 
        repeatType: "reverse" as const, 
        delay: 0.2 
      } 
    },
    hover: { scale: 1.05, opacity: 0.7, transition: { duration: 0.3, delay: 0.05 } }
  };

  const innerWaveVariants = {
    initial: { scale: 0.9, opacity: 0.7 },
    animate: { 
      scale: 1, 
      opacity: 0.8, 
      transition: { 
        duration: 1, 
        repeat: Infinity, 
        repeatType: "reverse" as const, 
        delay: 0.4 
      } 
    },
    hover: { scale: 1.1, opacity: 0.9, transition: { duration: 0.3, delay: 0.1 } }
  };

  const centerPointVariants = {
    initial: { scale: 1 },
    animate: { 
      scale: 1.2, 
      transition: { 
        duration: 0.8, 
        repeat: Infinity, 
        repeatType: "reverse" as const, 
        delay: 0.6 
      } 
    },
    hover: { scale: 1.3, transition: { duration: 0.3, delay: 0.15 } }
  };

  const textVariants = {
    initial: { opacity: 0.9 },
    hover: { opacity: 1, x: 3, transition: { duration: 0.3 } }
  };

  const containerVariants = {
    hover: {
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  return (
    <motion.div 
      className={cn("flex items-center gap-2", className)}
      initial="initial"
      animate={isAnimating ? "animate" : "initial"}
      whileHover="hover"
      variants={containerVariants}
    >
      {/* Logo Icon */}
      <div className={cn(
        "relative flex-shrink-0", 
        sizeClasses[size]
      )}>
        {/* Sound Wave Circles */}
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-full h-full"
        >
          {/* Outer Wave Circle */}
          <motion.circle 
            cx="12" 
            cy="12" 
            r="11" 
            className={cn("opacity-20", colorClasses[effectiveColorScheme].primary)} 
            strokeWidth="1" 
            stroke="currentColor" 
            fill="none"
            variants={outerWaveVariants}
          />
          
          {/* Middle Wave Circle */}
          <motion.circle 
            cx="12" 
            cy="12" 
            r="8" 
            className={cn("opacity-40", colorClasses[effectiveColorScheme].primary)} 
            strokeWidth="1.5" 
            stroke="currentColor" 
            fill="none"
            variants={middleWaveVariants}
          />
          
          {/* Inner Wave Circle */}
          <motion.circle 
            cx="12" 
            cy="12" 
            r="5" 
            className={cn("opacity-70", colorClasses[effectiveColorScheme].primary)} 
            strokeWidth="2" 
            stroke="currentColor" 
            fill="none"
            variants={innerWaveVariants}
          />
          
          {/* Center Point */}
          <motion.circle 
            cx="12" 
            cy="12" 
            r="2.5" 
            className={colorClasses[effectiveColorScheme].accent} 
            fill="currentColor"
            variants={centerPointVariants}
          />
        </svg>
      </div>
      
      {/* Logo Text */}
      {withText && (
        <motion.div 
          className="flex flex-col"
          variants={textVariants}
        >
          <span className={cn("font-bold leading-none tracking-tight", 
            textSizeClasses[size], 
            colorClasses[effectiveColorScheme].primary
          )}>
            NoiseSense
          </span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default NoiseSenseLogo;
