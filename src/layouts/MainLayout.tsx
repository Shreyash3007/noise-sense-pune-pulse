import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Volume2, MapPin, InfoIcon, Lock, Menu, X, Activity, BarChart2, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import NoiseSenseLogo from '@/components/NoiseSenseLogo';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if link is active
  const isActive = (path: string) => location.pathname === path;
  
  // Logo animation variants
  const logoVariants = {
    hover: {
      scale: 1.05,
      transition: { 
        duration: 0.3,
        yoyo: Infinity,
        ease: "easeInOut"
      }
    }
  };
  
  // Wave animation variants for the logo
  const waveVariants = {
    animate: {
      opacity: [0.3, 0.6, 0.3],
      scale: [0.8, 1, 0.8],
      transition: {
        repeat: Infinity,
        duration: 2,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-50 transition-colors duration-200">
      {/* Use the Header component instead of duplicating navigation */}
      <Header />
      
      {/* Main content area */}
      <main className="pt-20 flex-grow">{children}</main>
      
      {/* Footer component */}
      <Footer />
    </div>
  );
};

export default MainLayout;
