import React from 'react';
import { cn } from "@/lib/utils";

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

  // Apply animations based on props
  const animationClasses = animated ? 'transition-all duration-500' : '';
  const pulseClasses = pulse ? 'animate-pulse' : '';
  
  // Override colorScheme based on theme if provided
  const effectiveColorScheme = theme === 'dark' ? 'light' : 
                               theme === 'light' ? 'primary' : 
                               colorScheme;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Logo Icon */}
      <div className={cn(
        "relative flex-shrink-0", 
        sizeClasses[size], 
        animationClasses, 
        pulseClasses
      )}>
        {/* Sound Wave Circles */}
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className={cn("w-full h-full", animated ? "transition-transform duration-700" : "")}
        >
          {/* Outer Wave Circle */}
          <circle 
            cx="12" 
            cy="12" 
            r="11" 
            className={cn(
              "opacity-20", 
              colorClasses[effectiveColorScheme].primary,
              animated ? "animate-ping" : ""
            )} 
            strokeWidth="1" 
            stroke="currentColor" 
            fill="none"
          />
          
          {/* Middle Wave Circle */}
          <circle 
            cx="12" 
            cy="12" 
            r="8" 
            className={cn(
              "opacity-40", 
              colorClasses[effectiveColorScheme].primary,
              animated ? "animate-pulse" : ""
            )} 
            strokeWidth="1.5" 
            stroke="currentColor" 
            fill="none"
          />
          
          {/* Inner Wave Circle */}
          <circle 
            cx="12" 
            cy="12" 
            r="5" 
            className={cn(
              "opacity-70", 
              colorClasses[effectiveColorScheme].primary
            )} 
            strokeWidth="2" 
            stroke="currentColor" 
            fill="none"
          />
          
          {/* Center Point */}
          <circle 
            cx="12" 
            cy="12" 
            r="2.5" 
            className={colorClasses[effectiveColorScheme].accent} 
            fill="currentColor"
          />
        </svg>
      </div>
      
      {/* Logo Text */}
      {withText && (
        <div className="flex flex-col">
          <span className={cn("font-bold leading-none tracking-tight", 
            textSizeClasses[size], 
            colorClasses[effectiveColorScheme].primary
          )}>
            NoiseSense
          </span>
        </div>
      )}
    </div>
  );
};

export default NoiseSenseLogo;
