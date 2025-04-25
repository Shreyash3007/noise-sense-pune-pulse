
import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NoiseRecorder from "@/components/NoiseRecorder";
import { 
  Volume2, 
  Headphones, 
  MapPin, 
  BarChart2, 
  ArrowRight, 
  Activity, 
  Mic, 
  MapIcon, 
  Heart, 
  Brain, 
  Ear,
  ChevronDown,
  Shield,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { NoiseLevelsMap } from "@/components/NoiseLevelsMap";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import NoiseSenseLogo from "@/components/NoiseSenseLogo";
import { useIsMobile } from "@/hooks/use-mobile";

const LandingPage = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll();
  
  // Parallax and scroll-based animations
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.3]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 40]);
  
  // Refs for scroll animations
  const featuresRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.2 });
  const statsInView = useInView(statsRef, { once: true, amount: 0.3 });
  const howItWorksInView = useInView(howItWorksRef, { once: true, amount: 0.3 });
  const ctaInView = useInView(ctaRef, { once: true, amount: 0.5 });
  
  // Get recent statistics
  const { data: stats } = useQuery({
    queryKey: ["noise-stats"],
    queryFn: async () => {
      // Simulate data for now
      return {
        totalReports: 5207,
        avgLevel: 72,
        recentReports: 124,
        activeUsers: 389,
        citiesCount: 12,
        noiseReduction: "14%"
      };
    },
  });

  useEffect(() => {
    // Set page as loaded after everything is rendered
    const loadTimer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    
    return () => {
      clearTimeout(loadTimer);
    }
  }, []);
  
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 + delay * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };
  
  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };
  
  const features = [
    {
      icon: <Volume2 className="h-5 w-5 text-purple-600" />,
      title: "Noise Monitoring",
      description: "Accurately measure and record noise levels in your area with your smartphone."
    },
    {
      icon: <MapIcon className="h-5 w-5 text-indigo-600" />,
      title: "Interactive Maps",
      description: "Visualize noise pollution hotspots with detailed heatmaps and data filtering."
    },
    {
      icon: <Activity className="h-5 w-5 text-blue-600" />,
      title: "Data Analytics",
      description: "Analyze trends, patterns, and anomalies in noise data over time."
    },
    {
      icon: <Users className="h-5 w-5 text-pink-600" />,
      title: "Community Driven",
      description: "Join a network of volunteers collecting and sharing valuable noise data."
    },
    {
      icon: <Shield className="h-5 w-5 text-green-600" />,
      title: "Privacy Focused",
      description: "All personal data is protected while contributing to public datasets."
    },
    {
      icon: <Heart className="h-5 w-5 text-red-600" />,
      title: "Health Impact",
      description: "Understand how noise affects health and well-being in urban areas."
    }
  ];
  
  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight - 100,
      behavior: "smooth"
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section with animated background and recorder */}
      <motion.section 
        className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600 text-white relative overflow-hidden flex items-center"
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute h-[500px] w-[500px] rounded-full bg-purple-400/10 blur-3xl top-[-150px] right-[-100px]"></div>
          <div className="absolute h-[600px] w-[600px] rounded-full bg-blue-400/10 blur-3xl bottom-[-200px] left-[-150px]"></div>
          <motion.div 
            className="absolute h-[300px] w-[300px] rounded-full bg-pink-400/10 blur-3xl"
            animate={{ 
              x: [50, 150, 100, 50],
              y: [150, 250, 300, 150] 
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity,
              repeatType: "reverse"
            }}
          ></motion.div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 py-16 mt-16">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
            <div className="lg:w-1/2 text-center lg:text-left">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="mb-6 flex justify-center lg:justify-start"
              >
                <NoiseSenseLogo size="xl" animated pulse />
              </motion.div>
              
              <motion.h1 
                className="text-4xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Monitor <span className="text-blue-200">Noise Pollution</span> in Your Community
              </motion.h1>
              
              <motion.p 
                className="text-lg lg:text-xl text-blue-100 mb-8 max-w-xl mx-auto lg:mx-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Join our crowdsourced initiative to map, analyze, and address urban noise pollution through citizen science.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Link to="/map">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-purple-700 hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-lg">
                    <BarChart2 className="mr-2 h-5 w-5" />
                    Analytics Dashboard
                  </Button>
                </Link>
                <Link to="/record">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-white hover:bg-white/10 backdrop-blur-sm hover:scale-105 transition-all duration-300">
                    <Mic className="mr-2 h-5 w-5" />
                    Record Noise
                  </Button>
                </Link>
              </motion.div>
              
              <motion.div
                className="mt-16 hidden lg:block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 1 }}
              >
                <button 
                  onClick={scrollToContent}
                  className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors mx-auto lg:mx-0 group"
                >
                  <span>Scroll to learn more</span>
                  <ChevronDown className="h-4 w-4 animate-bounce group-hover:animate-pulse" />
                </button>
              </motion.div>
            </div>
            
            {/* Embedded Recorder */}
            <motion.div 
              className="lg:w-1/2 w-full max-w-lg mx-auto lg:max-w-none"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card className="bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                <NoiseRecorder />
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section 
        className="py-16 bg-background"
        ref={statsRef}
      >
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={statsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4" variant="outline">Our Impact</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Making Cities Quieter</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Our growing network of noise monitors is helping create awareness and drive positive change.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
            variants={staggerChildren}
            initial="hidden"
            animate={statsInView ? "visible" : "hidden"}
          >
            <motion.div 
              className="bg-card rounded-lg p-6 shadow-md border border-border text-center hover:shadow-lg transition-all duration-300"
              variants={fadeIn}
              custom={0}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-1">Total Reports</h3>
              <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">{stats?.totalReports.toLocaleString() || "0"}</p>
              <p className="text-sm text-muted-foreground mt-1">Measurements collected</p>
            </motion.div>
            
            <motion.div 
              className="bg-card rounded-lg p-6 shadow-md border border-border text-center hover:shadow-lg transition-all duration-300"
              variants={fadeIn}
              custom={1}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-1">Average Level</h3>
              <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">{stats?.avgLevel || "0"} dB</p>
              <p className="text-sm text-muted-foreground mt-1">Average noise level</p>
            </motion.div>
            
            <motion.div 
              className="bg-card rounded-lg p-6 shadow-md border border-border text-center hover:shadow-lg transition-all duration-300"
              variants={fadeIn}
              custom={2}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-1">Recent Activity</h3>
              <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">{stats?.recentReports || "0"}</p>
              <p className="text-sm text-muted-foreground mt-1">Reports in 24 hours</p>
            </motion.div>
            
            <motion.div 
              className="bg-card rounded-lg p-6 shadow-md border border-border text-center hover:shadow-lg transition-all duration-300"
              variants={fadeIn}
              custom={3}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-1">Active Users</h3>
              <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">{stats?.activeUsers || "0"}</p>
              <p className="text-sm text-muted-foreground mt-1">Monthly contributors</p>
            </motion.div>
            
            <motion.div 
              className="bg-card rounded-lg p-6 shadow-md border border-border text-center hover:shadow-lg transition-all duration-300"
              variants={fadeIn}
              custom={4}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-1">Cities</h3>
              <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">{stats?.citiesCount || "0"}</p>
              <p className="text-sm text-muted-foreground mt-1">Across the country</p>
            </motion.div>
            
            <motion.div 
              className="bg-card rounded-lg p-6 shadow-md border border-border text-center hover:shadow-lg transition-all duration-300"
              variants={fadeIn}
              custom={5}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-1">Noise Reduction</h3>
              <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">{stats?.noiseReduction || "0%"}</p>
              <p className="text-sm text-muted-foreground mt-1">In mapped hotspots</p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Map Preview Section */}
      <motion.section 
        className="py-16 bg-accent/20"
        initial={{ opacity: 0 }}
        animate={isLoaded ? { opacity: 1 } : { opacity: 0 }}
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4" variant="outline">Real-Time Data</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Interactive Noise Map</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Visualize noise pollution hotspots with our interactive heatmap. Identify patterns and problem areas.
            </p>
          </motion.div>
          
          <motion.div 
            className="bg-card rounded-lg shadow-xl p-4 max-w-5xl mx-auto overflow-hidden border border-border"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ 
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
            }}
          >
            <div className="h-96 relative rounded-md overflow-hidden">
              <NoiseLevelsMap />
            </div>
          </motion.div>
          
          <motion.div 
            className="text-center mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Link to="/map">
              <Button className="bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg transition-all duration-300 group">
                <MapIcon className="mr-2 h-5 w-5" />
                Explore Analytics Dashboard
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        className="py-16 bg-background"
        ref={featuresRef}
      >
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4" variant="outline">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">How We're Tackling Noise Pollution</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Our platform combines mobile technology, data science, and community involvement to address urban noise challenges.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
            variants={staggerChildren}
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
          >
            {features.map((feature, index) => (
              <motion.div 
                key={feature.title}
                className="bg-card rounded-lg p-6 shadow-md border border-border hover:shadow-lg transition-all duration-300"
                variants={fadeIn}
                custom={index}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section 
        className="py-16 bg-accent/20"
        ref={howItWorksRef}
      >
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={howItWorksInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4" variant="outline">Process</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Join our community effort to map noise pollution in just a few simple steps.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
            variants={staggerChildren}
            initial="hidden"
            animate={howItWorksInView ? "visible" : "hidden"}
          >
            <motion.div 
              className="relative"
              variants={fadeIn}
              custom={0}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="bg-card rounded-lg p-6 shadow-md border border-border h-full hover:shadow-lg transition-all duration-300">
                <div className="flex justify-center mb-6">
                  <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold text-purple-600 dark:text-purple-400">
                    1
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-center">Record</h3>
                <p className="text-muted-foreground text-center">
                  Use our app to measure noise levels in your area. Just press record and let your device do the work.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 left-full w-12 h-1 bg-gradient-to-r from-purple-500 to-transparent transform -translate-y-1/2 -translate-x-6"></div>
            </motion.div>
            
            <motion.div 
              className="relative"
              variants={fadeIn}
              custom={1}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="bg-card rounded-lg p-6 shadow-md border border-border h-full hover:shadow-lg transition-all duration-300">
                <div className="flex justify-center mb-6">
                  <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold text-blue-600 dark:text-blue-400">
                    2
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-center">Submit</h3>
                <p className="text-muted-foreground text-center">
                  Add details about the noise source and submit your report to our database.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 left-full w-12 h-1 bg-gradient-to-r from-blue-500 to-transparent transform -translate-y-1/2 -translate-x-6"></div>
            </motion.div>
            
            <motion.div 
              variants={fadeIn}
              custom={2}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="bg-card rounded-lg p-6 shadow-md border border-border h-full hover:shadow-lg transition-all duration-300">
                <div className="flex justify-center mb-6">
                  <div className="bg-green-100 dark:bg-green-900/30 rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold text-green-600 dark:text-green-400">
                    3
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-center">Impact</h3>
                <p className="text-muted-foreground text-center">
                  Your data contributes to noise maps that help identify problems and inform policy changes.
                </p>
              </div>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={howItWorksInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Link to="/record">
              <Button className="bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg transition-all duration-300 group">
                <Mic className="mr-2 h-5 w-5" />
                Start Recording
                <ArrowRight className="ml-2 h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="py-16 bg-gradient-to-br from-blue-600 via-purple-500 to-pink-500 text-white relative overflow-hidden"
        ref={ctaRef}
      >
        {/* Background elements */}
        <div className="absolute inset-0">
          <div className="absolute h-[300px] w-[300px] rounded-full bg-white/5 blur-3xl top-[-150px] left-[-100px]"></div>
          <div className="absolute h-[400px] w-[400px] rounded-full bg-white/5 blur-3xl bottom-[-200px] right-[-150px]"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.7 }}
          >
            <NoiseSenseLogo size="lg" theme="light" className="mx-auto mb-6" />
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Make a Difference?</h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Join thousands of volunteers who are mapping noise pollution and making their communities quieter, healthier places to live.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/record">
                <Button size="lg" className="bg-white text-purple-700 hover:bg-gray-100 hover:scale-105 shadow-lg hover:shadow-xl transition-all duration-300">
                  <Mic className="mr-2 h-5 w-5" />
                  Start Recording
                </Button>
              </Link>
              <Link to="/map">
                <Button size="lg" className="bg-transparent border-2 border-white text-white hover:bg-white/10 hover:scale-105 transition-all duration-300">
                  <BarChart2 className="mr-2 h-5 w-5" />
                  View Analytics
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default LandingPage;
