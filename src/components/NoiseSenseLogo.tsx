import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NoiseSenseLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
  theme?: "light" | "dark" | "auto";
}

const NoiseSenseLogo = ({ 
  className, 
  size = "md", 
  animated = true,
  theme = "auto" 
}: NoiseSenseLogoProps) => {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-24 w-24"
  };

  const waveVariants = {
    initial: { pathLength: 0, opacity: 0 },
    animate: { 
      pathLength: 1, 
      opacity: 1,
      transition: { 
        duration: 1.5,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    }
  };

  const dotVariants = {
    initial: { scale: 0.8, opacity: 0.6 },
    animate: {
      scale: 1.2,
      opacity: 1,
      transition: {
        duration: 1,
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    }
  };

  const ringVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: 1.5,
      opacity: [0, 0.2, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className={cn("relative", sizes[size], className)}>
      <motion.svg
        viewBox="0 0 100 100"
        className={cn(
          "w-full h-full",
          theme === "light" ? "text-white" : theme === "dark" ? "text-gray-900" : "text-purple-600 dark:text-white"
        )}
        initial={animated ? "initial" : "animate"}
        animate="animate"
      >
        {/* Background Circle */}
        <circle
          cx="50"
          cy="50"
          r="48"
          className="fill-current opacity-10"
        />

        {/* Animated Rings */}
        {animated && (
          <>
            <motion.circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-current"
              fill="none"
              strokeWidth="0.5"
              variants={ringVariants}
            />
            <motion.circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-current"
              fill="none"
              strokeWidth="0.5"
              variants={ringVariants}
              transition={{ delay: 0.5 }}
            />
          </>
        )}

        {/* Sound Waves */}
        <motion.path
          d="M 25,50 Q 50,20 75,50"
          fill="none"
          className="stroke-current"
          strokeWidth="2"
          variants={waveVariants}
        />
        <motion.path
          d="M 25,50 Q 50,80 75,50"
          fill="none"
          className="stroke-current"
          strokeWidth="2"
          variants={waveVariants}
        />

        {/* Center Dot */}
        <motion.circle
          cx="50"
          cy="50"
          r="4"
          className="fill-current"
          variants={dotVariants}
        />

        {/* Location Marker Lines */}
        <motion.path
          d="M 50,50 L 50,35"
          className="stroke-current"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
        <motion.path
          d="M 50,50 L 65,50"
          className="stroke-current"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        />
      </motion.svg>
    </div>
  );
};

export default NoiseSenseLogo; 