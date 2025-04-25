
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NoiseSenseLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  animated?: boolean;
  theme?: "light" | "dark" | "auto";
  variant?: "default" | "minimal" | "icon";
  pulse?: boolean;
}

const NoiseSenseLogo = ({ 
  className, 
  size = "md", 
  animated = true,
  theme = "auto",
  variant = "default",
  pulse = false
}: NoiseSenseLogoProps) => {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
    "2xl": "h-32 w-32"
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

  const pulseVariants = {
    animate: {
      scale: [0.97, 1.03, 0.97],
      opacity: [0.8, 1, 0.8],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div 
      className={cn("relative", sizes[size], className)}
      animate={pulse ? "animate" : undefined}
      variants={pulse ? pulseVariants : undefined}
    >
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
        {animated && variant !== "minimal" && (
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

        {/* Sound Waves - Modified for more modern appearance */}
        {variant !== "minimal" ? (
          <>
            <motion.path
              d="M 25,50 Q 50,20 75,50"
              fill="none"
              className="stroke-current"
              strokeWidth="2.5"
              strokeLinecap="round"
              variants={waveVariants}
            />
            <motion.path
              d="M 25,50 Q 50,80 75,50"
              fill="none"
              className="stroke-current"
              strokeWidth="2.5"
              strokeLinecap="round"
              variants={waveVariants}
            />
            {/* Additional ambient waves */}
            {animated && (
              <>
                <motion.path
                  d="M 30,50 Q 50,30 70,50"
                  fill="none"
                  className="stroke-current opacity-60"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  variants={waveVariants}
                  transition={{ delay: 0.2 }}
                />
                <motion.path
                  d="M 30,50 Q 50,70 70,50"
                  fill="none"
                  className="stroke-current opacity-60"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  variants={waveVariants}
                  transition={{ delay: 0.2 }}
                />
                <motion.path
                  d="M 35,50 Q 50,35 65,50"
                  fill="none"
                  className="stroke-current opacity-30"
                  strokeWidth="1"
                  strokeLinecap="round"
                  variants={waveVariants}
                  transition={{ delay: 0.4 }}
                />
                <motion.path
                  d="M 35,50 Q 50,65 65,50"
                  fill="none"
                  className="stroke-current opacity-30"
                  strokeWidth="1"
                  strokeLinecap="round"
                  variants={waveVariants}
                  transition={{ delay: 0.4 }}
                />
              </>
            )}
          </>
        ) : (
          // Minimal variant with simple, elegant lines
          <>
            <motion.path
              d="M 30,50 L 70,50"
              fill="none"
              className="stroke-current"
              strokeWidth="3"
              strokeLinecap="round"
              variants={waveVariants}
            />
            <motion.path
              d="M 35,40 L 65,40"
              fill="none"
              className="stroke-current opacity-70"
              strokeWidth="2"
              strokeLinecap="round"
              variants={waveVariants}
              transition={{ delay: 0.15 }}
            />
            <motion.path
              d="M 35,60 L 65,60"
              fill="none"
              className="stroke-current opacity-70"
              strokeWidth="2"
              strokeLinecap="round"
              variants={waveVariants}
              transition={{ delay: 0.15 }}
            />
          </>
        )}

        {/* Center Dot */}
        <motion.circle
          cx="50"
          cy="50"
          r={variant === "minimal" ? "3" : "4"}
          className="fill-current"
          variants={dotVariants}
        />

        {/* City Silhouette (Only for default variant and not minimal) */}
        {variant === "default" && (
          <g className="fill-current opacity-30">
            <motion.path
              d="M 25,65 L 25,75 L 75,75 L 75,65 L 70,65 L 70,60 L 65,60 L 65,55 L 60,55 L 60,65 L 55,65 L 55,57 L 50,57 L 50,65 L 45,65 L 45,60 L 40,60 L 40,65 L 35,65 L 35,62 L 30,62 L 30,65 L 25,65"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 0.3 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            />
          </g>
        )}

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
    </motion.div>
  );
};

export default NoiseSenseLogo;
