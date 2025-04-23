'use client';

import { motion, Variants } from 'framer-motion';
import { useEffect, useState } from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  animated?: boolean;
}

const Logo = ({ size = 'medium', className = '', animated = true }: LogoProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
  };

  const waveVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i: number) => ({
      opacity: [0.3, 0.7, 0.3],
      scale: [1, 1.1, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "loop" as const,
        delay: i * 0.2,
      },
    }),
  };

  const pulseVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: [0.5, 0.8, 0.5],
      scale: [1, 1.2, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "loop" as const,
      },
    },
  };

  const textVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.3,
      },
    },
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-blue-500"
          initial="hidden"
          animate={isVisible && animated ? "visible" : "hidden"}
          variants={pulseVariants}
        />
        
        {/* Inner circle */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center"
          initial="hidden"
          animate={isVisible && animated ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0, scale: 0.8 },
            visible: {
              opacity: 1,
              scale: 1,
              transition: { duration: 0.5 },
            },
          }}
        >
          {/* Sound waves */}
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border-2 border-white"
              style={{
                width: `${30 + i * 15}%`,
                height: `${30 + i * 15}%`,
              }}
              custom={i}
              initial="hidden"
              animate={isVisible && animated ? "visible" : "hidden"}
              variants={waveVariants}
            />
          ))}
          
          {/* Center dot */}
          <motion.div
            className="w-2 h-2 bg-white rounded-full"
            initial="hidden"
            animate={isVisible && animated ? "visible" : "hidden"}
            variants={{
              hidden: { opacity: 0, scale: 0 },
              visible: {
                opacity: 1,
                scale: 1,
                transition: { duration: 0.5, delay: 0.2 },
              },
            }}
          />
        </motion.div>
      </div>
      
      {/* Text */}
      <motion.div
        className="ml-2"
        initial="hidden"
        animate={isVisible && animated ? "visible" : "hidden"}
        variants={textVariants}
      >
        <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">
          NoiseSense
        </span>
      </motion.div>
    </div>
  );
};

export default Logo; 