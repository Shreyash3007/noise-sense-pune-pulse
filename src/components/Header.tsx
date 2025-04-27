import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Volume2, MapPin, Info, Activity, BarChart2, Menu, X, Mic, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import NoiseSenseLogo from '@/components/NoiseSenseLogo';
import ThemeToggle from '@/components/ThemeToggle';
import NotificationSystem from '@/components/NotificationSystem';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useIsMobile } from "@/hooks/use-mobile";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const mainNavItems = [
    { label: "Home", path: "/", icon: <Volume2 className="h-4 w-4 mr-2" /> },
    { label: "About", path: "/about", icon: <Info className="h-4 w-4 mr-2" /> },
    { label: "AI Chat", path: "/ai-chat", icon: <Mic className="h-4 w-4 mr-2" /> },
    { label: "Admin", path: "/admin", icon: <User className="h-4 w-4 mr-2" /> },
  ];

  // Mobile navigation rendering function
  const renderMobileNav = () => (
    <AnimatePresence>
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 top-16 bg-background/95 backdrop-blur-md p-4 md:hidden z-50"
        >
          <div className="flex flex-col space-y-2 pt-4">
            {mainNavItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center py-3 px-4 rounded-md transition-colors",
                  isActive(item.path) 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "hover:bg-accent/80 hover:text-accent-foreground"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <header 
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300 backdrop-blur-md",
        scrolled 
          ? "bg-background/80 shadow-sm border-b border-border/40" 
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo and Brand Area */}
        <Link to="/" className="flex items-center space-x-2">
          <NoiseSenseLogo size="sm" animated={true} />
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {mainNavItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "relative py-1 px-1 text-sm font-medium transition-colors hover:text-primary",
                isActive 
                  ? "text-primary after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-primary" 
                  : "text-foreground/70"
              )}
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Mobile Menu Button and Theme Toggle */}
        <div className="flex items-center gap-2">
          <NotificationSystem />
          <ThemeToggle />
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {renderMobileNav()}
    </header>
  );
}
