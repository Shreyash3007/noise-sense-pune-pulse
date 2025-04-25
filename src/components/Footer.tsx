import { Link } from "react-router-dom";
import NoiseSenseLogo from "@/components/NoiseSenseLogo";
import { Map } from "lucide-react";
import { motion } from "framer-motion";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
      }
    }
  };

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Logo and About */}
          <motion.div 
            className="space-y-4"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <div className="flex items-center gap-2">
              <NoiseSenseLogo size="sm" animated={true} />
              <span className="text-xl font-semibold bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent">
                Noise Sense
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Crowdsourced noise pollution monitoring and analytics platform. Join our community to help create quieter, healthier environments.
            </p>
          </motion.div>
          
          {/* Navigation Links */}
          <motion.div 
            className="space-y-4"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
            custom={1}
          >
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Map className="h-4 w-4 text-primary" />
              Navigation
            </h3>
            <nav className="flex flex-col space-y-2">
              <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200">Home</Link>
              <Link to="/map" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200">Analytics Dashboard</Link>
              <Link to="/record" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200">Record Noise</Link>
              <Link to="/admin" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200">Admin Portal</Link>
            </nav>
          </motion.div>
        </div>
        
        {/* Bottom Section */}
        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {currentYear} Noise Sense. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
