import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { NoiseLevelsMap } from "@/components/NoiseLevelsMap";
import { Volume2, MapPin, AlertTriangle, Info, Filter, Calendar, Activity, Map as MapIcon, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion, useInView } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

// Import the chart components with proper exports
import { NoiseBarChart } from "@/components/charts/NoiseBarChart";
import NoiseTimeSeriesChart from "@/components/charts/NoiseTimeSeriesChart";
import { NoisePieChart } from "@/components/charts/NoisePieChart";
import { NoiseHeatmapChart } from "@/components/charts/NoiseHeatmapChart";
import { NoiseAnalyticsDashboard } from "@/components/charts/NoiseAnalyticsDashboard";

const AnalyticsDashboard = () => {
  const [showInfo, setShowInfo] = useState(false);
  const [currentTab, setCurrentTab] = useState("map");
  const [locationAccess, setLocationAccess] = useState<"granted" | "denied" | "pending">("pending");
  const [activeFilters, setActiveFilters] = useState(false);
  const [noiseTypeFilter, setNoiseTypeFilter] = useState("all");
  const [dateRangeFilter, setDateRangeFilter] = useState("all");
  const [decibelRangeFilter, setDecibelRangeFilter] = useState([40, 100]);
  
  const mapViewRef = useRef(null);
  const mapViewInView = useInView(mapViewRef, { once: true, amount: 0.3 });
  
  const statsViewRef = useRef(null);
  const statsViewInView = useInView(statsViewRef, { once: true, amount: 0.3 });
  
  const analyticsViewRef = useRef(null);
  const analyticsViewInView = useInView(analyticsViewRef, { once: true, amount: 0.3 });

  useEffect(() => {
    // Animation for page entrance
    const timer = setTimeout(() => {
      setShowInfo(true);
    }, 1000);
    
    // Check for location permission
    if (navigator.geolocation) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          setLocationAccess('granted');
        } else if (result.state === 'denied') {
          setLocationAccess('denied');
        } else {
          setLocationAccess('pending');
        }
      });
    }
    
    return () => clearTimeout(timer);
  }, []);

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };
  
  const staggerContainer = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const handleRequestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationAccess("granted");
        },
        () => {
          setLocationAccess("denied");
        }
      );
    }
  };
  
  const applyFilters = () => {
    setActiveFilters(true);
    // Here we would typically update the map or query data
    // For this demo, we'll just show a success message
    // You would connect this to your actual map filtering logic
  };
  
  const clearFilters = () => {
    setNoiseTypeFilter("all");
    setDateRangeFilter("all");
    setDecibelRangeFilter([40, 100]);
    setActiveFilters(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-8"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <BarChart2 className="h-8 w-8 text-purple-500 dark:text-purple-400" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Analytics Dashboard
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Visualize and analyze noise data with interactive maps and powerful analytics tools.
          </p>
        </motion.div>
        
        {/* Tab Navigation */}
        <motion.div 
          className="mb-6"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          custom={1}
        >
          <Tabs defaultValue="map" onValueChange={setCurrentTab} className="w-full">
            <div className="flex justify-center">
              <TabsList className="grid grid-cols-3 w-[400px]">
                <TabsTrigger value="map" className="flex items-center gap-2">
                  <MapIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Noise Map</span>
                </TabsTrigger>
                <TabsTrigger value="stats" className="flex items-center gap-2">
                  <BarChart2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Statistics</span>
                </TabsTrigger>
                <TabsTrigger value="trends" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  <span className="hidden sm:inline">Trends</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* Map Tab Content */}
            <TabsContent value="map">
              <motion.div 
                className="mb-6 opacity-0 animate-[fade-in_0.5s_ease-out_0.5s_forwards]"
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                custom={2}
              >
                <Alert variant="default" className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
                  <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                  <AlertTitle className="text-gray-900 dark:text-white">About this map</AlertTitle>
                  <AlertDescription className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center text-gray-700 dark:text-gray-300">
                    <span>This map displays crowdsourced noise data collected by citizens.</span>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="whitespace-nowrap">
                          Learn More
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Understanding Noise Pollution</DialogTitle>
                          <DialogDescription className="pt-4">
                            <div className="space-y-4 text-sm">
                              <p>Noise pollution is measured in decibels (dB). Here's what different levels mean:</p>
                              
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                  <span><strong>Below 60 dB:</strong> Generally safe. Normal conversation is about 60 dB.</span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                                  <span><strong>60-80 dB:</strong> Moderate. City traffic from inside a car is about 80 dB.</span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                                  <span><strong>Above 80 dB:</strong> Potentially harmful with prolonged exposure.</span>
                                </div>
                              </div>
                              
                              <p>The WHO recommends noise levels below 70 dB over 24 hours to prevent hearing damage.</p>
                              
                              <div className="bg-amber-50 dark:bg-amber-900/30 p-3 rounded-md border border-amber-200 dark:border-amber-800">
                                <div className="flex gap-2">
                                  <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400 shrink-0" />
                                  <div>
                                    <p className="font-medium">Health impacts of noise pollution include:</p>
                                    <ul className="list-disc pl-5 pt-1 space-y-1">
                                      <li>Stress and anxiety</li>
                                      <li>Sleep disturbance</li>
                                      <li>Cardiovascular issues</li>
                                      <li>Reduced cognitive performance</li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                  </AlertDescription>
                </Alert>
              </motion.div>
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" ref={mapViewRef}>
                <motion.div 
                  className="lg:col-span-3"
                  variants={fadeInUp}
                  initial="initial"
                  animate={mapViewInView ? "animate" : "initial"}
                  custom={3}
                >
                  <Card className="p-6 shadow-lg border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-purple-500" />
                        Interactive Noise Map
                      </h2>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <Filter className="h-4 w-4" />
                            Filter
                            {activeFilters && <Badge className="ml-1 h-2 w-2 p-0 bg-purple-500"></Badge>}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Filter Map Data</DialogTitle>
                            <DialogDescription>
                              Customize what noise data is displayed on the map.
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label>Noise Type</Label>
                              <Select value={noiseTypeFilter} onValueChange={setNoiseTypeFilter}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select noise type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All Types</SelectItem>
                                  <SelectItem value="traffic">Traffic</SelectItem>
                                  <SelectItem value="construction">Construction</SelectItem>
                                  <SelectItem value="event">Events & Music</SelectItem>
                                  <SelectItem value="industrial">Industrial</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="grid gap-2">
                              <Label>Date Range</Label>
                              <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select date range" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All Time</SelectItem>
                                  <SelectItem value="today">Today</SelectItem>
                                  <SelectItem value="week">Past Week</SelectItem>
                                  <SelectItem value="month">Past Month</SelectItem>
                                  <SelectItem value="year">Past Year</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="grid gap-2">
                              <div className="flex justify-between">
                                <Label>Decibel Range</Label>
                                <span className="text-sm text-gray-500">{decibelRangeFilter[0]}dB - {decibelRangeFilter[1]}dB</span>
                              </div>
                              <Slider
                                min={0}
                                max={150}
                                step={5}
                                value={decibelRangeFilter}
                                onValueChange={setDecibelRangeFilter}
                                className="mt-2"
                              />
                            </div>
                          </div>
                          
                          <div className="flex justify-between">
                            <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
                            <Button onClick={applyFilters}>Apply Filters</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    <div className="h-[500px] lg:h-[600px]">
                      <NoiseLevelsMap />
                    </div>
                  </Card>
                </motion.div>
                
                <motion.div 
                  className={`space-y-6`}
                  variants={staggerContainer}
                  initial="initial"
                  animate={mapViewInView ? "animate" : "initial"}
                >
                  {/* Location Access Card */}
                  {locationAccess !== "granted" && (
                    <motion.div variants={fadeInUp}>
                      <Card className="p-4 border-gray-100 dark:border-gray-700 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                        <h3 className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-200 mb-3">
                          <MapPin className="h-4 w-4 text-red-500" />
                          Location Access
                        </h3>
                        {locationAccess === "denied" ? (
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Location access is blocked. Enable location permissions to see your position on the map.
                            </p>
                            <Button variant="outline" size="sm" className="w-full" onClick={handleRequestLocation}>
                              Request Location
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Allow location access to see your position on the map and get local noise data.
                            </p>
                            <Button variant="outline" size="sm" className="w-full" onClick={handleRequestLocation}>
                              Enable Location
                            </Button>
                          </div>
                        )}
                      </Card>
                    </motion.div>
                  )}
                  
                  {/* Map Legend Card */}
                  <motion.div variants={fadeInUp}>
                    <Card className="p-4 border-gray-100 dark:border-gray-700 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                      <h3 className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-200 mb-3">
                        <MapPin className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                        Map Legend
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-green-500"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-300">Below 60 dB - Safe levels</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-300">60-80 dB - Moderate levels</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-red-500"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-300">Above 80 dB - High levels</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-8 rounded-md bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 opacity-60"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-300">Heatmap intensity</span>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                  
                  {/* Noise Types Legend */}
                  <motion.div variants={fadeInUp}>
                    <Card className="p-4 border-gray-100 dark:border-gray-700 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                      <h3 className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-200 mb-3">
                        <Volume2 className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                        Noise Categories
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-300">Traffic</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-300">Construction</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-pink-500"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-300">Events & Music</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-slate-500"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-300">Industrial</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-gray-500"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-300">Other</span>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                  
                  {/* Noise Thresholds */}
                  <motion.div variants={fadeInUp}>
                    <Card className="p-4 border-gray-100 dark:border-gray-700 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                      <h3 className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-200 mb-3">
                        <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                        Noise Thresholds
                      </h3>
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        <p>According to national guidelines:</p>
                        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                          <div className="grid grid-cols-2 gap-1">
                            <span className="text-gray-600 dark:text-gray-400">Residential:</span>
                            <span>55 dB (day) / 45 dB (night)</span>
                          </div>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                          <div className="grid grid-cols-2 gap-1">
                            <span className="text-gray-600 dark:text-gray-400">Commercial:</span>
                            <span>65 dB (day) / 55 dB (night)</span>
                          </div>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                          <div className="grid grid-cols-2 gap-1">
                            <span className="text-gray-600 dark:text-gray-400">Industrial:</span>
                            <span>75 dB (day) / 70 dB (night)</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                  
                  {/* Taking Action Card */}
                  <motion.div variants={fadeInUp}>
                    <Card className="p-4 border-gray-100 dark:border-gray-700 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                      <h3 className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-200 mb-3">
                        <Info className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                        Taking Action
                      </h3>
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        <p>If you notice excessive noise in your area:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Report to your local authorities</li>
                          <li>Contact local police for noise violations</li>
                          <li>Organize community awareness campaigns</li>
                        </ul>
                        <Button variant="outline" size="sm" className="w-full mt-2">
                          View Guidelines
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                </motion.div>
              </div>
            </TabsContent>
            
            {/* Statistics Tab Content */}
            <TabsContent value="stats">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" ref={statsViewRef}>
                <motion.div 
                  className="lg:col-span-2"
                  variants={fadeInUp}
                  initial="initial"
                  animate={statsViewInView ? "animate" : "initial"}
                >
                  <Card className="p-6 shadow-lg border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <BarChart2 className="h-5 w-5 text-purple-500" />
                      Noise Level Distribution
                    </h3>
                    <div className="h-80">
                      <NoiseBarChart />
                    </div>
                  </Card>
                </motion.div>
                
                <motion.div
                  variants={fadeInUp}
                  initial="initial"
                  animate={statsViewInView ? "animate" : "initial"}
                  custom={1}
                >
                  <Card className="p-6 shadow-lg border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Volume2 className="h-5 w-5 text-purple-500" />
                      Noise Sources
                    </h3>
                    <div className="h-80">
                      <NoisePieChart />
                    </div>
                  </Card>
                </motion.div>
                
                <motion.div
                  className="lg:col-span-3"
                  variants={fadeInUp}
                  initial="initial"
                  animate={statsViewInView ? "animate" : "initial"}
                  custom={2}
                >
                  <Card className="p-6 shadow-lg border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                    <NoiseTimeSeriesChart />
                  </Card>
                </motion.div>
                
                <motion.div
                  className="lg:col-span-3"
                  variants={fadeInUp}
                  initial="initial"
                  animate={statsViewInView ? "animate" : "initial"}
                  custom={3}
                >
                  <Card className="p-6 shadow-lg border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-purple-500" />
                      Heatmap: Time vs Intensity
                    </h3>
                    <div className="h-80">
                      <NoiseHeatmapChart />
                    </div>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>
            
            {/* Trends Tab Content */}
            <TabsContent value="trends" ref={analyticsViewRef}>
              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate={analyticsViewInView ? "animate" : "initial"}
              >
                <NoiseAnalyticsDashboard data={[]} />
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
