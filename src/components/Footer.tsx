
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NoiseSenseLogo from "@/components/NoiseSenseLogo";
import { Volume2, Github, Linkedin, Twitter, Mail, Map, Heart, Shield } from "lucide-react";
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

  // Match with updated design language
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
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
            <div className="flex space-x-3">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-800">
                <Github className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-800">
                <Twitter className="h-4 w-4" />
                <span className="sr-only">Twitter</span>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-800">
                <Linkedin className="h-4 w-4" />
                <span className="sr-only">LinkedIn</span>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-800">
                <Mail className="h-4 w-4" />
                <span className="sr-only">Email</span>
              </Button>
            </div>
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
              <Link to="/about" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200">About</Link>
              <Link to="/admin" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200">Admin Portal</Link>
            </nav>
          </motion.div>
          
          {/* Resources */}
          <motion.div 
            className="space-y-4"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
            custom={2}
          >
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-primary" />
              Resources
            </h3>
            <nav className="flex flex-col space-y-2">
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200">Noise Level Guidelines</a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200">Health Impact Studies</a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200">Community Actions</a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200">Data API Documentation</a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200">Reporting Guidelines</a>
            </nav>
          </motion.div>
          
          {/* Newsletter Signup */}
          <motion.div 
            className="space-y-4"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
            custom={3}
          >
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              Stay Updated
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Subscribe to our newsletter for the latest updates and noise data insights.</p>
            <div className="flex gap-2">
              <Input type="email" placeholder="Your email" className="max-w-[220px]" />
              <Button variant="default">Subscribe</Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              We respect your privacy and will never share your information.
            </p>
          </motion.div>
        </div>
        
        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 md:mb-0">
            © {currentYear} Noise Sense. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <a href="#" className="hover:text-primary dark:hover:text-primary flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span>Privacy Policy</span>
            </a>
            <a href="#" className="hover:text-primary dark:hover:text-primary flex items-center gap-1">
              <Heart className="h-3 w-3" />
              <span>Community Guidelines</span>
            </a>
            <a href="#" className="hover:text-primary dark:hover:text-primary">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
