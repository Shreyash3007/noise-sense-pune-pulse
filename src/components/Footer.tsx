import { Link } from "react-router-dom";
import NoiseSenseLogo from "@/components/NoiseSenseLogo";
import { Map, Mail, Github, Twitter, Linkedin, ExternalLink, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  const containerAnimation = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const linkAnimation = {
    initial: { opacity: 0.8 },
    hover: { opacity: 1, scale: 1.05 },
    tap: { scale: 0.98 }
  };

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 border-t border-gray-100 dark:border-gray-800">
      <div className="container mx-auto px-4 py-12">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-12 gap-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerAnimation}
        >
          {/* Logo and About */}
          <motion.div 
            className="md:col-span-5 space-y-5"
            variants={itemAnimation}
          >
            <div className="flex items-center gap-2">
              <NoiseSenseLogo size="md" animated={true} />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent">
                Noise Sense
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-md">
              Crowdsourced noise pollution monitoring and analytics platform. Join our community to help create quieter, 
              healthier environments for everyone.
            </p>
            <div className="pt-2">
              <Button variant="outline" className="rounded-full" asChild>
                <a href="mailto:contact@noisesense.org" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Contact Us
                </a>
              </Button>
            </div>
          </motion.div>
          
          {/* Navigation Links */}
          <motion.div 
            className="md:col-span-3 space-y-5"
            variants={itemAnimation}
          >
            <h3 className="font-semibold text-xl text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Map className="h-5 w-5 text-primary" />
              Navigation
            </h3>
            <nav className="grid grid-cols-1 gap-3">
              <motion.div whileHover="hover" whileTap="tap" initial="initial" variants={linkAnimation}>
                <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200 flex items-center gap-2">
                  Home
                </Link>
              </motion.div>
              <motion.div whileHover="hover" whileTap="tap" initial="initial" variants={linkAnimation}>
                <Link to="/map" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200 flex items-center gap-2">
                  Noise Map
                </Link>
              </motion.div>
              <motion.div whileHover="hover" whileTap="tap" initial="initial" variants={linkAnimation}>
                <Link to="/record" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200 flex items-center gap-2">
                  Record Noise
                </Link>
              </motion.div>
              <motion.div whileHover="hover" whileTap="tap" initial="initial" variants={linkAnimation}>
                <Link to="/admin" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200 flex items-center gap-2">
                  Admin Portal
                </Link>
              </motion.div>
            </nav>
          </motion.div>
          
          {/* Resources */}
          <motion.div 
            className="md:col-span-4 space-y-5"
            variants={itemAnimation}
          >
            <h3 className="font-semibold text-xl text-gray-900 dark:text-gray-100">
              Connect With Us
            </h3>
            <div className="flex flex-wrap gap-3">
              <motion.a 
                href="https://github.com/noisesense" 
                target="_blank" 
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300 hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
              >
                <Github className="h-5 w-5" />
              </motion.a>
              <motion.a 
                href="https://twitter.com/noisesense" 
                target="_blank" 
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300 hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </motion.a>
              <motion.a 
                href="https://linkedin.com/company/noisesense" 
                target="_blank" 
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300 hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </motion.a>
              <motion.a 
                href="https://noisesense.org" 
                target="_blank" 
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300 hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
              >
                <ExternalLink className="h-5 w-5" />
              </motion.a>
            </div>
            <p className="text-gray-500 dark:text-gray-500 text-sm">
              Join our mission to make cities quieter and healthier. Together we can create more livable urban spaces.
            </p>
          </motion.div>
        </motion.div>
        
        {/* Bottom Section */}
        <motion.div 
          className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
            © {currentYear} Noise Sense. Made with <Heart className="h-3 w-3 text-red-500 animate-pulse" /> for quieter cities.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200">
              Terms of Use
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
