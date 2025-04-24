import React from 'react';
import NoiseSenseLogo from '@/components/NoiseSenseLogo';
import { cn } from '@/lib/utils';

interface BrandedLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const BrandedLoader: React.FC<BrandedLoaderProps> = ({
  size = 'md',
  text,
  className
}) => {
  // Map sizes to pixel values
  const sizeMap = {
    sm: 36,
    md: 64,
    lg: 96
  };
  
  const logoSize = sizeMap[size];
  
  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className="relative">
        <NoiseSenseLogo 
          size="md" 
          animated={true} 
          className="animate-pulse"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </div>
      
      {text && (
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export const FullScreenLoader: React.FC<{ text?: string }> = ({ text }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm z-50">
      <BrandedLoader size="lg" text={text || "Loading..."} />
    </div>
  );
}; 