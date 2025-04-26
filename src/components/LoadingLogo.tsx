
import NoiseSenseLogo from "./NoiseSenseLogo";
import { motion } from "framer-motion";

interface LoadingLogoProps {
  size?: "sm" | "md" | "lg";  // Removed "xl" as it's not supported in NoiseSenseLogo
  text?: string;
}

const LoadingLogo = ({ size = "lg", text = "Loading..." }: LoadingLogoProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <NoiseSenseLogo size={size} animated />
      </motion.div>
      {text && (
        <motion.p
          className="text-sm text-gray-600 dark:text-gray-400"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export default LoadingLogo;
