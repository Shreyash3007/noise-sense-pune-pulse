import React, { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Filter, Loader2, MapPin, RefreshCcw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchNoiseLevels } from "@/integrations/supabase/client";
import { NoiseLevelsMap } from "@/components/NoiseLevelsMap";
import { useMediaQuery } from "@/hooks/use-mobile";
import { toast } from "@/components/ui/use-toast";
import { NoiseBarChart } from "@/components/charts/NoiseBarChart";
import { NoisePieChart } from "@/components/charts/NoisePieChart";
import { NoiseHeatmapChart } from "@/components/charts/NoiseHeatmapChart";
import { NoiseAnalyticsDashboard } from "@/components/charts/NoiseAnalyticsDashboard";
import NoiseSenseLogo from "@/components/NoiseSenseLogo";

// Mock data for analytics charts when actual data isn't available yet
const mockTimeSeriesData = [
  {
    time: "2025-04-20",
    avgLevel: 65,
    maxLevel: 85,
    minLevel: 45,
    range: 40,
    count: 24,
    primaryNoiseType: "Traffic"
  },
  {
    time: "2025-04-21",
    avgLevel: 62,
    maxLevel: 88,
    minLevel: 47,
    range: 41,
    count: 18,
    primaryNoiseType: "Traffic"
  },
  {
    time: "2025-04-22",
    avgLevel: 58,
    maxLevel: 79,
    minLevel: 42,
    range: 37,
    count: 22,
    primaryNoiseType: "Construction"
  },
  {
    time: "2025-04-23",
    avgLevel: 68,
    maxLevel: 92,
    minLevel: 44,
    range: 48,
    count: 30,
    primaryNoiseType: "Event"
  },
  {
    time: "2025-04-24",
    avgLevel: 64,
    maxLevel: 86,
    minLevel: 48,
    range: 38,
    count: 26,
    primaryNoiseType: "Traffic"
  }
];

const mockNoiseReports = [
  {
    id: "1",
    latitude: 40.7128,
    longitude: -74.0060,
    decibel_level: 75,
    noise_type: "Traffic",
    created_at: "2025-04-24T10:30:00Z",
    notes: "Heavy traffic noise from highway"
  },
  {
    id: "2",
    latitude: 40.7138,
    longitude: -74.0050,
    decibel_level: 85,
    noise_type: "Construction",
    created_at: "2025-04-24T11:45:00Z",
    notes: "Construction site with drilling"
  },
  {
    id: "3",
    latitude: 40.7148,
    longitude: -74.0070,
    decibel_level: 90,
    noise_type: "Event",
    created_at: "2025-04-23T20:15:00Z",
    notes: "Outdoor concert nearby"
  },
  {
    id: "4",
    latitude: 40.7118,
    longitude: -74.0080,
    decibel_level: 65,
    noise_type: "Industrial",
    created_at: "2025-04-22T14:20:00Z",
    notes: "Factory machinery"
  },
  {
    id: "5",
    latitude: 40.7108,
    longitude: -74.0040,
    decibel_level: 70,
    noise_type: "Traffic",
    created_at: "2025-04-21T08:10:00Z",
    notes: "Bus terminal"
  }
];

const AnalyticsDashboard = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [activeTab, setActiveTab] = useState("map");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date(),
  });
  const [noiseType, setNoiseType] = useState<string>("all");
  const [severity, setSeverity] = useState<string>("all");
  const dashboardRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: dashboardRef,
    offset: ["start start", "end end"]
  });
  
  const fadeTransform = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  
  const { data: noiseData, isLoading, isError, refetch } = useQuery({
    queryKey: ['noise-levels', dateRange, noiseType, severity],
    queryFn: async () => {
      try {
        return mockNoiseReports;
      } catch (error) {
        console.error("Error fetching noise data:", error);
        throw error;
      }
    },
  });

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing data",
      description: "Fetching the latest noise reports",
    });
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "";
    return format(date, "PPP");
  };

  return (
    <div className="min-h-screen bg-background" ref={dashboardRef}>
      <motion.div 
        className="pt-6 pb-12 px-4 md:px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                <NoiseSenseLogo size="md" />
                Analytics Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Explore noise pollution data and insights
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start w-full sm:w-auto">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={(range) => setDateRange(range as { from: Date | undefined; to: Date | undefined })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <Button onClick={handleRefresh} size="icon" variant="outline">
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Tabs 
            defaultValue="map" 
            value={activeTab} 
            onValueChange={handleTabChange} 
            className="w-full"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <TabsList className="mb-4 sm:mb-0">
                <TabsTrigger value="map" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className={isMobile ? 'hidden' : ''}>Noise Map</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span className={isMobile ? 'hidden' : ''}>Analytics</span>
                </TabsTrigger>
              </TabsList>
              
              <div className="flex flex-wrap gap-2">
                <div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 gap-2">
                        <Filter className="h-3 w-3" />
                        Filters
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-medium leading-none">Noise Type</h4>
                          <RadioGroup 
                            value={noiseType} 
                            onValueChange={setNoiseType}
                            className="flex flex-col gap-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="all" id="all-types" />
                              <Label htmlFor="all-types">All Types</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="traffic" id="traffic" />
                              <Label htmlFor="traffic">Traffic</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="construction" id="construction" />
                              <Label htmlFor="construction">Construction</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="event" id="event" />
                              <Label htmlFor="event">Events/Parties</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="industrial" id="industrial" />
                              <Label htmlFor="industrial">Industrial</Label>
                            </div>
                          </RadioGroup>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium leading-none">Severity Level</h4>
                          <RadioGroup 
                            value={severity} 
                            onValueChange={setSeverity}
                            className="flex flex-col gap-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="all" id="all-severity" />
                              <Label htmlFor="all-severity">All Levels</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="low" id="low" />
                              <Label htmlFor="low">Low (&lt;60 dB)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="medium" id="medium" />
                              <Label htmlFor="medium">Medium (60-80 dB)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="high" id="high" />
                              <Label htmlFor="high">High (&gt;80 dB)</Label>
                            </div>
                          </RadioGroup>
                        </div>
                        
                        <Button className="w-full" onClick={() => {
                          refetch();
                        }}>
                          Apply Filters
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                
                <Badge variant="outline" className={noiseType !== 'all' ? 'block' : 'hidden'}>
                  Type: {noiseType}
                </Badge>
                
                <Badge variant="outline" className={severity !== 'all' ? 'block' : 'hidden'}>
                  Severity: {severity}
                </Badge>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-lg">Loading data...</span>
              </div>
            ) : isError ? (
              <Card className="mb-8">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-center text-destructive mb-4">
                    There was an error loading the noise data. Please try again.
                  </p>
                  <Button onClick={() => refetch()}>
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Retry
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="pb-8"
              >
                <TabsContent value="map" className="mt-0">
                  <div className="grid grid-cols-1 gap-6">
                    <Card className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="h-[70vh]">
                          <NoiseLevelsMap />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <NoiseBarChart data={noiseData} />
                      <NoisePieChart data={noiseData} />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="analytics" className="mt-0">
                  <div className="grid grid-cols-1 gap-6">
                    <NoiseAnalyticsDashboard 
                      data={noiseData} 
                      startDate={dateRange.from} 
                      endDate={dateRange.to} 
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <NoiseBarChart data={noiseData} />
                      <NoiseHeatmapChart data={noiseData} />
                    </div>
                  </div>
                </TabsContent>
              </motion.div>
            )}
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsDashboard;
