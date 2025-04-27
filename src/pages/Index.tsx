import { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Users,
  AlertTriangle,
  Building2,
  Clock,
  Bell,
  Sunrise,
  Moon,
  Sun,
  MessageSquare,
  X,
  Send,
  Loader2,
  ListFilter,
  TrendingUp,
  LightbulbIcon
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { NoiseLevelsMap } from "@/components/NoiseLevelsMap";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import NoiseSenseLogo from "@/components/NoiseSenseLogo";
import { useIsMobile } from "@/hooks/use-mobile";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { NoisePieChart } from "@/components/charts/NoisePieChart";
import { NoiseBarChart } from "@/components/charts/NoiseBarChart";
import { generatePuneNoiseData } from "@/lib/mock-data";
import { getAIAnalytics, getAIRecommendations, chatWithAI } from "@/integrations/openai/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

const LandingPage = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll();
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user'|'ai', content: string}>>([]);
  const [userMessage, setUserMessage] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [aiRecommendations, setAiRecommendations] = useState<string>("");
  const [isAiInsightsLoading, setIsAiInsightsLoading] = useState(false);
  
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
        totalReports: 7845,
        avgLevel: 72,
        recentReports: 218,
        activeUsers: 542,
        citiesCount: 12,
        noiseReduction: "18%"
      };
    },
  });

  // Generate noise data for map
  const noiseData = useMemo(() => generatePuneNoiseData(200), []);

  // Load AI insights when noise data is available
  useEffect(() => {
    const fetchAiInsights = async () => {
      if (noiseData.length === 0) return;
      
      setIsAiInsightsLoading(true);
      try {
        const analytics = await getAIAnalytics(noiseData);
        const recommendations = await getAIRecommendations(noiseData);
        
        setAiInsights(analytics);
        setAiRecommendations(recommendations);
      } catch (error) {
        console.error("Error loading AI insights:", error);
      } finally {
        setIsAiInsightsLoading(false);
      }
    };
    
    fetchAiInsights();
  }, [noiseData]);

  // Function to handle chat submission
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userMessage.trim()) return;
    
    // Add user message to chat
    const newMessage = { role: 'user' as const, content: userMessage.trim() };
    setChatMessages([...chatMessages, newMessage]);
    setUserMessage("");
    setIsChatLoading(true);

    // Use the NoiseSense AI chat function
    try {
      const response = await chatWithAI([{ 
        id: Date.now().toString(),
        sender: 'user',
        text: userMessage,
        timestamp: new Date().toISOString()
      }]);
      
      // Add AI response
      setChatMessages(prev => [
        ...prev, 
        { 
          role: 'ai', 
          content: response
        }
      ]);
      setIsChatLoading(false);
      
      // Scroll to bottom of chat
      if (chatRef.current) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }
    } catch (error) {
      console.error("Error chatting with AI:", error);
      setChatMessages(prev => [
        ...prev, 
        { 
          role: 'ai', 
          content: "I'm sorry, I couldn't process your request at the moment. Please try again later."
        }
      ]);
      setIsChatLoading(false);
    }
  };

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

  // Add noise pollution health effects data
  const noiseHealthEffects = [
    {
      level: "Low (Below 50 dB)",
      effects: ["Generally comfortable", "Minimal health impact", "Light sleep disturbance possible"],
      icon: <Volume2 className="h-5 w-5" />,
      color: "bg-green-500",
      percentage: 30
    },
    {
      level: "Moderate (50-65 dB)",
      effects: ["Increased stress levels", "Decreased concentration", "Potential sleep disturbance"],
      icon: <Volume2 className="h-5 w-5" />,
      color: "bg-yellow-500",
      percentage: 45
    },
    {
      level: "High (65-80 dB)",
      effects: ["Significant stress increase", "Cognitive impairment", "Cardiovascular effects", "Serious sleep disturbance"],
      icon: <Volume2 className="h-5 w-5" />,
      color: "bg-orange-500",
      percentage: 20
    },
    {
      level: "Dangerous (Above 80 dB)",
      effects: ["Hearing damage risk", "Severe cardiovascular effects", "Cognitive development issues in children", "Mental health impacts"],
      icon: <AlertTriangle className="h-5 w-5" />,
      color: "bg-red-500",
      percentage: 5
    }
  ];
  
  // Add noise sources data
  const noiseSources = [
    { name: "Traffic", percentage: 38, icon: <MapIcon /> },
    { name: "Construction", percentage: 27, icon: <Building2 /> },
    { name: "Industrial", percentage: 15, icon: <Activity /> },
    { name: "Community Events", percentage: 12, icon: <Users /> },
    { name: "Other", percentage: 8, icon: <Volume2 /> },
  ];

  // Add awareness section refs
  const awarenessRef = useRef<HTMLDivElement>(null);
  const awarenessInView = useInView(awarenessRef, { once: true, amount: 0.2 });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section with animated background and recorder */}
      <motion.section 
        className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600 text-white relative overflow-hidden flex items-center"
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute h-[500px] w-[500px] rounded-full bg-purple-400/20 blur-3xl top-[-150px] right-[-100px]"></div>
          <div className="absolute h-[600px] w-[600px] rounded-full bg-blue-400/20 blur-3xl bottom-[-200px] left-[-150px]"></div>
          <motion.div 
            className="absolute h-[300px] w-[300px] rounded-full bg-pink-400/20 blur-3xl"
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
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-8 sm:py-16 mt-8 sm:mt-16">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center">
            <div className="lg:w-1/2 text-center lg:text-left">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="mb-6 flex justify-center lg:justify-start"
              >
                <NoiseSenseLogo size="md" animated pulse />
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
              className="lg:w-1/2 w-full max-w-[90%] sm:max-w-lg mx-auto lg:max-w-none"
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
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 max-w-5xl mx-auto"
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
        className="py-16 bg-background"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4" variant="outline">Real-Time Data</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Noise Pollution Map</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Visualize current noise pollution hotspots across Pune city
            </p>
          </motion.div>
          
          {/* Map visualization - full width */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {/* Map visualization - 2/3 width on desktop */}
            <motion.div 
              className="md:col-span-2 bg-card rounded-lg shadow-xl p-2 sm:p-4 overflow-hidden border border-border h-[500px]"
              whileHover={{ 
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
              }}
            >
              <div className="h-full relative rounded-md overflow-hidden">
                <NoiseLevelsMap data={noiseData} />
              </div>
            </motion.div>
            
            {/* NoiseSense AI Insights - 1/3 width on desktop */}
            <motion.div 
              className="bg-card rounded-lg shadow-xl p-4 overflow-hidden border border-border"
              whileHover={{ 
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Brain className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">NoiseSense AI Insights</h3>
      </div>

              {isAiInsightsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : (
                <Tabs defaultValue="summary" className="w-full">
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="insights">Key Insights</TabsTrigger>
                    <TabsTrigger value="actions">Recommended</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="summary" className="space-y-3">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p className="text-sm text-muted-foreground">Analysis based on {noiseData.length} noise reports across Pune</p>
                      
                      <div className="mt-3 space-y-3">
                        {aiRecommendations ? (
                          <div className="text-sm">
                            {aiRecommendations.split('\n').map((paragraph, idx) => (
                              <p key={idx} className={idx === 0 ? "font-medium" : ""}>{paragraph}</p>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm space-y-2">
                            <p className="font-medium">Noise pollution in Pune has reached concerning levels in several key areas.</p>
                            <p>Analysis of recent data shows average noise levels of 72dB across the city, with traffic contributing to over 35% of total noise pollution.</p>
                            <p>The most affected areas include commercial districts and major intersections, with peak levels occurring during rush hours (8-10am and 5-7pm).</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="insights" className="space-y-3">
                    {aiInsights && aiInsights.insights ? (
                      <div className="space-y-3">
                        {aiInsights.insights.map((insight: any, idx: number) => (
                          <div 
                            key={idx}
                            className={`p-3 rounded-lg ${
                              insight.category === 'trend' ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' :
                              insight.category === 'anomaly' ? 'bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500' :
                              insight.category === 'recommendation' ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500' :
                              'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500'
                            }`}
                          >
                            <div className="flex gap-2">
                              {insight.category === 'trend' ? (
                                <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              ) : insight.category === 'anomaly' ? (
                                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                              ) : insight.category === 'recommendation' ? (
                                <LightbulbIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              ) : (
                                <Activity className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                              )}
                              <div>
                                <p className="text-sm">{insight.text}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Confidence: {Math.round(insight.relevance * 100)}%
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-3 rounded-lg">
                          <div className="flex gap-2">
                            <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm">Traffic noise is the predominant source, accounting for 38% of all reports.</p>
                          </div>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-3 rounded-lg">
                          <div className="flex gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm">Noise levels exceeding 80dB detected in residential areas near MIDC Industrial Zone.</p>
                          </div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-3 rounded-lg">
                          <div className="flex gap-2">
                            <LightbulbIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm">Weekend noise levels peak between 8pm-11pm, primarily from entertainment venues.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="actions" className="space-y-3">
                    {aiInsights && aiInsights.recommendedActions ? (
                      <div className="space-y-3">
                        {aiInsights.recommendedActions.slice(0, 4).map((action: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-card rounded-lg border">
                            <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                              {idx + 1}
                            </div>
                            <p className="text-sm">{action}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-card rounded-lg border">
                          <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                            1
                          </div>
                          <p className="text-sm">Implement time restrictions on construction activities in residential areas</p>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-card rounded-lg border">
                          <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                            2
                          </div>
                          <p className="text-sm">Install sound barriers along high-traffic corridors identified in the heat map</p>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-card rounded-lg border">
                          <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                            3
                          </div>
                          <p className="text-sm">Increase noise monitoring in industrial zones during evening hours</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-2 text-xs text-right text-muted-foreground">
                      Powered by NoiseSense AI
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="text-center mt-0 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <p className="text-muted-foreground max-w-xl mx-auto">
              This interactive map displays real-time noise levels across Pune city, collected from our network of sensors and community reports.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        ref={featuresRef}
        className="py-20 bg-background"
        initial="hidden"
        animate={featuresInView ? "visible" : "hidden"}
        variants={staggerChildren}
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

      {/* New Noise Awareness Section */}
      <motion.section
        ref={awarenessRef}
        className="py-16 bg-accent/30"
        initial="hidden"
        animate={awarenessInView ? "visible" : "hidden"}
        variants={staggerChildren}
      >
        <div className="container mx-auto px-4">
          <motion.div variants={fadeIn} className="text-center mb-12">
            <Badge className="mb-4" variant="outline">Health Awareness</Badge>
            <h2 className="text-3xl font-bold mb-4">Understanding Noise Pollution Impact</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Noise pollution is more than just an annoyance. Research shows it can have significant effects on physical and mental health.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <motion.div variants={fadeIn} className="bg-card rounded-lg shadow-lg p-6 border">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Ear className="h-5 w-5 text-primary" />
                Health Effects by Noise Level
              </h3>
              <div className="space-y-6">
                {noiseHealthEffects.map((effect, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-full ${effect.color}`}></div>
                        <span className="font-medium">{effect.level}</span>
                      </div>
                      <span className="text-sm">{effect.percentage}% of urban exposure</span>
                    </div>
                    <Progress value={effect.percentage} className="h-2" />
                    <ul className="text-sm text-muted-foreground pl-6 pt-1">
                      {effect.effects.map((item, idx) => (
                        <li key={idx} className="list-disc">{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div variants={fadeIn} className="bg-card rounded-lg shadow-lg p-6 border">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Long-term Exposure Effects
              </h3>
              <div className="space-y-4">
                <div className="rounded-lg border p-4 bg-background/50">
                  <div className="flex items-start gap-3">
                    <Heart className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Cardiovascular Health</h4>
                      <p className="text-sm text-muted-foreground">
                        Studies show prolonged exposure to noise above 65dB can increase blood pressure and risk of heart disease by up to 20%.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg border p-4 bg-background/50">
                  <div className="flex items-start gap-3">
                    <Brain className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Cognitive Function</h4>
                      <p className="text-sm text-muted-foreground">
                        Children exposed to high noise levels show reduced reading comprehension and memory performance in educational settings.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg border p-4 bg-background/50">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Sleep Disruption</h4>
                      <p className="text-sm text-muted-foreground">
                        Nighttime noise can fragment sleep patterns, leading to fatigue, decreased productivity, and weakened immune response.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg border p-4 bg-background/50">
                  <div className="flex items-start gap-3">
                    <Bell className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Hearing Damage</h4>
                      <p className="text-sm text-muted-foreground">
                        Regular exposure to sounds above 85dB can cause permanent hearing loss, affecting an estimated 17% of urban residents.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          <motion.div variants={fadeIn} className="flex justify-center mt-8">
            <Link to="/about#noise-pollution">
              <Button size="lg" variant="outline" className="gap-2">
                Learn More About Noise Pollution
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>
      
      {/* Common Noise Sources Section */}
      <motion.section 
        className="py-16 bg-background"
        initial={{ opacity: 0, y: 30 }}
        animate={awarenessInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Common Noise Sources in Pune</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Understanding the primary sources of urban noise helps target reduction efforts effectively.
            </p>
        </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            {noiseSources.map((source, index) => (
              <Card key={index} className="flex flex-col items-center p-6 text-center h-full">
                <div className="mb-4 bg-primary/10 p-3 rounded-full">
                  {source.icon}
                </div>
                <h3 className="font-medium mb-2">{source.name}</h3>
                <p className="text-3xl font-bold text-primary">{source.percentage}%</p>
                <Separator className="my-4" />
                <p className="text-sm text-muted-foreground">of all reports</p>
          </Card>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Statistics Section */}
      <motion.section 
        ref={statsRef}
        className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
        initial="hidden"
        animate={statsInView ? "visible" : "hidden"}
        variants={staggerChildren}
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
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 max-w-5xl mx-auto"
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
            {/* Recording button removed */}
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
              {/* View Analytics button removed */}
      </div>
    </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default LandingPage;
