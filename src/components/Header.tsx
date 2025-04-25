
import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { 
  Volume2, 
  MapPin, 
  InfoIcon, 
  Activity, 
  BarChart2, 
  Menu, 
  X,
  Mic,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import NoiseSenseLogo from '@/components/NoiseSenseLogo';
import ThemeToggle from '@/components/ThemeToggle';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useMediaQuery } from "@/hooks/use-mobile";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const mainNavItems = [
    { label: "Home", path: "/", icon: <Volume2 className="h-4 w-4 mr-2" /> },
    { label: "Analytics Dashboard", path: "/map", icon: <BarChart2 className="h-4 w-4 mr-2" /> },
    { label: "Record Noise", path: "/record", icon: <Mic className="h-4 w-4 mr-2" /> },
    { label: "About", path: "/about", icon: <InfoIcon className="h-4 w-4 mr-2" /> },
  ];

  const adminItems = [
    { label: "Admin Portal", path: "/admin", icon: <User className="h-4 w-4 mr-2" /> },
  ];

  // Desktop navigation rendering function
  const renderDesktopNav = () => (
    <div className="hidden md:flex items-center space-x-1">
      <NavigationMenu>
        <NavigationMenuList>
          {/* Main Navigation Items */}
          <NavigationMenuItem>
            <NavigationMenuTrigger>Navigation</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                {mainNavItems.map(item => (
                  <li key={item.path}>
                    <NavigationMenuLink asChild>
                      <Link
                        to={item.path}
                        className={cn(
                          "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                          isActive(item.path) && "bg-accent/50"
                        )}
                      >
                        <div className="flex items-center">
                          {item.icon}
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>
                        {item.path === "/map" && (
                          <div className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            View real-time noise data across the city with interactive visualizations.
                          </div>
                        )}
                        {item.path === "/record" && (
                          <div className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Contribute to noise monitoring by recording sound levels in your area.
                          </div>
                        )}
                      </Link>
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* Admin Navigation Items */}
          <NavigationMenuItem>
            <NavigationMenuTrigger className="bg-primary/10 dark:bg-primary/20 hover:bg-primary/20 dark:hover:bg-primary/30">Admin</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-3 p-4 w-[200px]">
                {adminItems.map(item => (
                  <li key={item.path}>
                    <NavigationMenuLink asChild>
                      <Link
                        to={item.path}
                        className={cn(
                          "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                          isActive(item.path) && "bg-accent/50"
                        )}
                      >
                        <div className="flex items-center">
                          {item.icon}
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      {/* Also show some direct links for commonly accessed pages */}
      <Tabs defaultValue={location.pathname} className="hidden lg:flex ml-4">
        <TabsList className="bg-transparent">
          {mainNavItems.map(item => (
            <TabsTrigger 
              key={item.path} 
              value={item.path}
              className={cn(
                "data-[state=active]:bg-accent/50 transition-all duration-300",
                isActive(item.path) && "bg-accent/50"
              )}
              asChild
            >
              <Link to={item.path} className="flex items-center gap-2">
                {item.icon}
                {item.label}
              </Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );

  // Mobile navigation menu rendering function
  const renderMobileNav = () => (
    <AnimatePresence>
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 top-16 bg-white dark:bg-gray-900 p-4 md:hidden z-50"
        >
          <div className="flex flex-col space-y-4">
            {mainNavItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center py-3 px-4 rounded-md transition-colors",
                  isActive(item.path) 
                    ? "bg-accent text-accent-foreground" 
                    : "hover:bg-accent/50 hover:text-accent-foreground"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
            <div className="border-t dark:border-gray-800 my-2 pt-2">
              <h3 className="text-sm text-muted-foreground mb-2 px-4">Admin</h3>
              {adminItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center py-3 px-4 rounded-md transition-colors",
                    isActive(item.path) 
                      ? "bg-accent text-accent-foreground" 
                      : "hover:bg-accent/50 hover:text-accent-foreground"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const headerVariants = {
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    hidden: { opacity: 0, y: -25, transition: { duration: 0.3 } }
  };

  return (
    <header 
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300 backdrop-blur-md",
        scrolled 
          ? "bg-white/80 dark:bg-gray-900/80 shadow-md" 
          : "bg-transparent"
      )}
    >
      <motion.div 
        className="container mx-auto px-4 h-16 flex items-center justify-between"
        initial="visible"
        animate="visible"
        variants={headerVariants}
      >
        {/* Logo and Brand Area */}
        <Link to="/" className="flex items-center space-x-2">
          <NoiseSenseLogo size="sm" animated={true} />
          <motion.div 
            className="font-semibold text-lg md:text-xl leading-none"
            animate={{ opacity: 1, x: 0 }}
            initial={{ opacity: 0, x: -10 }}
            transition={{ delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent dark:from-primary dark:to-purple-300">
              Noise Sense
            </span>
          </motion.div>
        </Link>
        
        {/* Desktop Navigation */}
        {renderDesktopNav()}

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2">
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
      </motion.div>
      
      {/* Mobile Navigation */}
      {renderMobileNav()}
    </header>
  );
}
