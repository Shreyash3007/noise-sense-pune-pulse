
import { ReactNode, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [prevPath, setPrevPath] = useState("");
  const location = useLocation();

  // Set up page transition animations
  useEffect(() => {
    // Store previous path for transition direction
    setPrevPath(location.pathname);
    
    // Reset scroll position on route change
    window.scrollTo(0, 0);
    
    // Mark page as loaded for animations
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 150);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Page transition variants
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 10,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1.0],
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1.0],
        when: "afterChildren",
        staggerChildren: 0.05
      }
    }
  };

  // Child elements transition variants
  const childVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1.0],
      }
    },
    exit: { 
      opacity: 0, 
      y: -10,
      transition: { 
        duration: 0.2,
        ease: [0.25, 0.1, 0.25, 1.0],
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 text-gray-900 dark:text-gray-50 transition-colors duration-300">
      {/* Header with navigation */}
      <Header />
      
      {/* Main content area with page transitions */}
      <motion.main 
        className="flex-grow pt-16"
        initial="initial"
        animate={isLoaded ? "animate" : "initial"}
        exit="exit"
        variants={pageVariants}
        key={location.pathname}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={childVariants}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </motion.main>
      
      {/* Footer component */}
      <Footer />
    </div>
  );
};

export default MainLayout;
