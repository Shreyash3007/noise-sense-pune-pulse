
import React, { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Filter, Loader2, MapPin, RefreshCcw, InfoIcon, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchNoiseLevels } from "@/integrations/supabase/client";
import { NoiseLevelsMap } from "@/components/NoiseLevelsMap";
import { useMediaQuery } from "@/hooks/use-mobile";
import { toast } from "@/components/ui/use-toast";
import { NoiseBarChart } from "@/components/charts/NoiseBarChart";
import { NoisePieChart } from "@/components/charts/NoisePieChart";
import { NoiseHeatmapChart } from "@/components/charts/NoiseHeatmapChart";
import NoiseTimeSeriesChart from "@/components/charts/NoiseTimeSeriesChart";
import NoiseSenseLogo from "@/components/NoiseSenseLogo";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NoiseReport, TimeSeriesPoint } from "@/types";
import ChatBox from "@/components/ChatBox";

const mockTimeSeriesData: TimeSeriesPoint[] = [
  {
    time: "2025-04-20",
    avgLevel: 65,
    maxLevel: 85,
    minLevel: 45,
    count: 24,
    primaryNoiseType: "Traffic"
  },
  {
    time: "2025-04-21",
    avgLevel: 62,
    maxLevel: 88,
    minLevel: 47,
    count: 18,
    primaryNoiseType: "Traffic"
  },
  {
    time: "2025-04-22",
    avgLevel: 58,
    maxLevel: 79,
    minLevel: 42,
    count: 22,
    primaryNoiseType: "Construction"
  },
  {
    time: "2025-04-23",
    avgLevel: 68,
    maxLevel: 92,
    minLevel: 44,
    count: 30,
    primaryNoiseType: "Event"
  },
  {
    time: "2025-04-24",
    avgLevel: 64,
    maxLevel: 86,
    minLevel: 48,
    count: 26,
    primaryNoiseType: "Traffic"
  }
];

const mockNoiseReports: NoiseReport[] = [
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
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date(),
  });
  const [noiseType, setNoiseType] = useState<string>("all");
  const [severity, setSeverity] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("map");
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
        const { generatePuneNoiseData } = await import('@/lib/mock-data');
        return generatePuneNoiseData(500);
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

  const formatDate = (date: Date | undefined) => {
    if (!date) return "";
    return format(date, "PPP");
  };

  const calculateAverageNoise = () => {
    if (!noiseData || noiseData.length === 0) return 0;
    
    const sum = noiseData.reduce((total, report) => {
      const decibelLevel = Number(report.decibel_level);
      return total + (isNaN(decibelLevel) ? 0 : decibelLevel);
    }, 0);
    
    return Math.round(sum / noiseData.length);
  };

  return (
    <div className="min-h-screen bg-background" ref={dashboardRef}>
      <motion.div
        className="container mx-auto px-4 py-8"
        style={{ opacity: fadeTransform }}
      >
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-1">Noise Map</h1>
              <p className="text-muted-foreground">
                Explore noise pollution data in your area
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 h-9">
                    <Calendar className="h-4 w-4" />
                    <span className={isMobile ? 'hidden' : ''}>
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
                          </>
                        ) : (
                          formatDate(dateRange.from)
                        )
                      ) : (
                        "Date Range"
                      )}
                    </span>
                  </Button>
                </PopoverTrigger>
                
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    initialFocus
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange as any}
                    numberOfMonths={isMobile ? 1 : 2}
                  />
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 h-9">
                    <Filter className="h-4 w-4" />
                    <span className={isMobile ? 'hidden' : ''}>Filters</span>
                  </Button>
                </PopoverTrigger>
                
                <PopoverContent className="w-[260px]">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Noise Type</h4>
                      <Select
                        value={noiseType}
                        onValueChange={setNoiseType}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="Traffic">Traffic</SelectItem>
                          <SelectItem value="Construction">Construction</SelectItem>
                          <SelectItem value="Industrial">Industrial</SelectItem>
                          <SelectItem value="Restaurant/Bar">Restaurant/Bar</SelectItem>
                          <SelectItem value="Loudspeakers">Loudspeakers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Severity</h4>
                      <Select
                        value={severity}
                        onValueChange={setSeverity}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Levels" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          <SelectItem value="low">Low (&lt; 65 dB)</SelectItem>
                          <SelectItem value="medium">Medium (65-80 dB)</SelectItem>
                          <SelectItem value="high">High (&gt; 80 dB)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button className="w-full" onClick={() => {
                      refetch();
                    }}>
                      Apply Filters
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              
              <Button variant="outline" size="icon" onClick={handleRefresh} className="h-9 w-9">
                <RefreshCcw className="h-4 w-4" />
              </Button>
              
              <Badge variant="outline" className={noiseType !== 'all' ? 'block' : 'hidden'}>
                Type: {noiseType}
              </Badge>
              
              <Badge variant="outline" className={severity !== 'all' ? 'block' : 'hidden'}>
                Severity: {severity}
              </Badge>
            </div>
          </div>
          
          <Tabs defaultValue="map" value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex mb-4">
              <TabsTrigger value="map">Map View</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="assistant">AI Assistant</TabsTrigger>
            </TabsList>
            
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="pb-8"
              >
                <TabsContent value="map">
                  <div className="grid grid-cols-1 gap-6">
                    <Card className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="h-[70vh]">
                          <NoiseLevelsMap data={noiseData} />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardDescription>Total Reports</CardDescription>
                          <CardTitle className="text-2xl">{noiseData?.length || 0}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Number of noise reports
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardDescription>Average Noise</CardDescription>
                          <CardTitle className="text-2xl">
                            {noiseData && noiseData.length > 0 
                              ? calculateAverageNoise()
                              : 0} dB
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            How loud it is on average
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardDescription>Common Noise</CardDescription>
                          <CardTitle className="text-2xl truncate">
                            {noiseData && noiseData.length > 0 
                              ? Object.entries(
                                  noiseData.reduce((acc: Record<string, number>, report) => {
                                    acc[report.noise_type] = (acc[report.noise_type] || 0) + 1;
                                    return acc;
                                  }, {})
                                ).sort((a, b) => b[1] - a[1])[0][0]
                              : "N/A"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Most frequent noise source
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardDescription>High Noise Areas</CardDescription>
                          <CardTitle className="text-2xl truncate">
                            {noiseData && noiseData.length > 0 
                              ? Object.entries(
                                  noiseData.reduce((acc: Record<string, number>, report) => {
                                    const area = report.address?.split(',')[0] || 'Unknown';
                                    acc[area] = (acc[area] || 0) + 1;
                                    return acc;
                                  }, {})
                                ).sort((a, b) => b[1] - a[1])[0][0]
                              : "N/A"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Area with most noise reports
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="analytics">
                  <div className="grid grid-cols-1 gap-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Types of Noise</CardTitle>
                          <CardDescription>What's making noise in your area</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="h-[350px] flex items-center justify-center">
                            <NoisePieChart data={noiseData || []} title="" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>How Loud Is It?</CardTitle>
                          <CardDescription>Noise levels by different sources</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="h-[350px] flex items-center justify-center">
                            <NoiseBarChart data={noiseData || []} title="" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Noise Trends Over Time</CardTitle>
                        <CardDescription>Weekly noise level patterns</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[350px]">
                          <NoiseTimeSeriesChart data={mockTimeSeriesData} />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="assistant">
                  <div className="grid grid-cols-1 gap-6">
                    <ChatBox 
                      initialMessage="Hello! I'm your NoiseSense AI assistant. I can help you understand the noise data shown here. What would you like to know about noise pollution in your area?" 
                    />
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
