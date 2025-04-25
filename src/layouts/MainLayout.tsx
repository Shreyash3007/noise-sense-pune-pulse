
import { ReactNode, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const location = useLocation();

  // Set up page transition animations
  useEffect(() => {
    // Reset scroll position on route change
    window.scrollTo(0, 0);
    
    // Mark page as loaded for animations
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 200);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Page transition variants
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-50 transition-colors duration-200">
      {/* Header with navigation */}
      <Header />
      
      {/* Main content area with page transitions */}
      <motion.main 
        className="flex-grow pt-16"
        initial="initial"
        animate={isLoaded ? "animate" : "initial"}
        exit="exit"
        variants={pageVariants}
      >
        {children}
      </motion.main>
      
      {/* Footer component */}
      <Footer />
    </div>
  );
};

export default MainLayout;
