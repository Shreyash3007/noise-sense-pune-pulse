import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import NoiseRecorder from "@/components/NoiseRecorder";
import { Volume2, Headphones, AlertTriangle, MapPin, BarChart2, ArrowRight, Activity, Info, Mic, MapIcon, Heart, Brain, Ear } from "lucide-react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FeatureCard } from "@/components/FeatureCard";
import { NoiseLevelsMap } from "@/components/NoiseLevelsMap";
import { motion } from "framer-motion";
import NoiseSenseLogo from "@/components/NoiseSenseLogo";

const LandingPage = () => {
  const [showFeatures, setShowFeatures] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Get recent statistics
  const { data: stats } = useQuery({
    queryKey: ["noise-stats"],
    queryFn: async () => {
      // Get total reports count
      const { count: totalReports, error: countError } = await supabase
        .from("noise_reports")
        .select("*", { count: "exact", head: true });
        
      if (countError) throw countError;
      
      // Get average decibel level
      const { data: avgData, error: avgError } = await supabase
        .from("noise_reports")
        .select("decibel_level");
        
      if (avgError) throw avgError;
      
      let avgLevel = 0;
      if (avgData && avgData.length) {
        avgLevel = Math.round(
          avgData.reduce((sum, item) => sum + (item.decibel_level || 0), 0) / avgData.length
        );
      }
      
      // Get reports from last 24 hours
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { data: recentReports, error: recentError } = await supabase
        .from("noise_reports")
        .select("*", { count: "exact" })
        .gte("created_at", yesterday.toISOString());
        
      const recentCount = recentReports?.length || 0;
      
      return {
        totalReports,
        avgLevel,
        recentReports: recentCount
      };
    },
  });

  useEffect(() => {
    // Animate features in after a delay
    const timer = setTimeout(() => {
      setShowFeatures(true);
    }, 800);
    
    // Set page as loaded after everything is rendered
    const loadTimer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(loadTimer);
    }
  }, []);
  
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 * custom,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      <main>
        {/* Hero Section with Embedded Recorder */}
        <section className="bg-gradient-to-br from-purple-600 via-purple-500 to-blue-500 text-white py-12 lg:py-16 relative overflow-hidden">
          {/* Animated background circles */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute h-[300px] w-[300px] rounded-full bg-white/5 top-[-50px] left-[-50px]"></div>
            <div className="absolute h-[500px] w-[500px] rounded-full bg-white/5 bottom-[-100px] right-[-100px]"></div>
            <motion.div 
              className="absolute h-[200px] w-[200px] rounded-full bg-white/5"
              animate={{ 
                x: [50, 150, 100, 50],
                y: [50, 100, 150, 50] 
              }}
              transition={{ 
                duration: 20, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
            ></motion.div>
          </div>
          
          <motion.div 
            className="container mx-auto px-4 relative z-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              <div className="lg:w-1/2 text-center lg:text-left">
                <motion.h1 
                  className="text-4xl lg:text-6xl font-bold mb-4 leading-tight flex items-center justify-center lg:justify-start gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  <NoiseSenseLogo size="lg" theme="light" />
                  <span className="drop-shadow-lg">Pune Noise Sense</span>
                </motion.h1>
                
                <motion.div 
                  className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 mt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  <Link to="/map">
                    <Button size="lg" className="w-full sm:w-auto bg-white text-purple-700 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
                      <MapPin className="mr-2 h-5 w-5" />
                      View Noise Map
                    </Button>
                  </Link>
                  <Link to="/admin">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-white hover:bg-white/10 backdrop-blur-sm">
                      <BarChart2 className="mr-2 h-5 w-5" />
                      Dashboard
                    </Button>
                  </Link>
                </motion.div>
              </div>
              
              {/* Embedded Recorder */}
              <motion.div 
                className="lg:w-1/2 mt-8 lg:mt-0 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <NoiseRecorder />
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Map Preview Section */}
        <motion.section 
          className="py-12 bg-white dark:bg-gray-900"
          variants={fadeIn}
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
          custom={3}
        >
          <div className="container mx-auto px-4">
            <motion.div variants={fadeIn} custom={1}>
              <h2 className="text-3xl font-bold text-center mb-4">Real-Time Noise Map</h2>
            </motion.div>
            
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 max-w-5xl mx-auto overflow-hidden border border-gray-100 dark:border-gray-700"
              variants={fadeIn}
              custom={2}
            >
              <div className="h-96 relative">
                <NoiseLevelsMap />
              </div>
            </motion.div>
            
            <motion.div 
              className="text-center mt-8"
              variants={fadeIn}
              custom={3}
            >
              <Link to="/map">
                <Button className="bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg transition-all duration-200 px-6 py-6 text-lg">
                  <MapIcon className="mr-2 h-5 w-5" />
                  View Full Noise Map
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section 
          className="py-12 bg-gray-50 dark:bg-gray-950"
          variants={fadeIn}
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
          custom={5}
        >
          <div className="container mx-auto px-4">
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              animate={isLoaded ? "visible" : "hidden"}
            >
              <motion.div 
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-100 dark:border-gray-700 text-center"
                variants={fadeIn}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Total Reports</h3>
                <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">{stats?.totalReports || "0"}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Measurements collected</p>
              </motion.div>
              
              <motion.div 
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-100 dark:border-gray-700 text-center"
                variants={fadeIn}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Average Level</h3>
                <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">{stats?.avgLevel || "0"} dB</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Average noise level</p>
              </motion.div>
              
              <motion.div 
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-100 dark:border-gray-700 text-center"
                variants={fadeIn}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Recent Activity</h3>
                <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">{stats?.recentReports || "0"}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Reports in 24 hours</p>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="mt-12 text-center"
              variants={fadeIn}
              custom={3}
            >
              <Link to="/admin" className="inline-block">
                <Button variant="default" className="bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg transition-all duration-200">
                  <BarChart2 className="mr-2 h-4 w-4" />
                  View Admin Dashboard
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default LandingPage;
