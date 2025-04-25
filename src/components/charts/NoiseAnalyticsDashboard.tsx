
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import NoiseTimeSeriesChart, { NoiseTimeSeriesData } from "./NoiseTimeSeriesChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NoiseBarChart } from "./NoiseBarChart";
import { NoisePieChart } from "./NoisePieChart";
import { NoiseHeatmapChart } from "./NoiseHeatmapChart";
import { useMediaQuery } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

interface NoiseReport {
  id: string;
  latitude: number;
  longitude: number;
  decibel_level: number;
  noise_type: string;
  created_at: string;
  notes?: string;
}

interface NoiseAnalyticsDashboardProps {
  data?: NoiseReport[];
  startDate?: Date;
  endDate?: Date;
}

export const NoiseAnalyticsDashboard: React.FC<NoiseAnalyticsDashboardProps> = ({ 
  data = [], 
  startDate, 
  endDate 
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [activeTab, setActiveTab] = useState("time-series");

  // Process data for time series chart
  const timeSeriesData = React.useMemo((): NoiseTimeSeriesData[] => {
    if (!data || data.length === 0) return [];
    
    // Group by day
    const groupedByDay: Record<string, NoiseReport[]> = {};
    
    data.forEach(report => {
      const date = new Date(report.created_at);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      if (!groupedByDay[dateKey]) {
        groupedByDay[dateKey] = [];
      }
      
      groupedByDay[dateKey].push(report);
    });
    
    // Process each day's data
    return Object.entries(groupedByDay).map(([dateKey, dayReports]) => {
      // Calculate stats
      const avgLevel = Math.round(dayReports.reduce((sum, r) => sum + r.decibel_level, 0) / dayReports.length);
      const maxLevel = Math.max(...dayReports.map(r => r.decibel_level));
      const minLevel = Math.min(...dayReports.map(r => r.decibel_level));
      
      // Count noise types
      const typeCounts: Record<string, number> = {};
      dayReports.forEach(report => {
        typeCounts[report.noise_type] = (typeCounts[report.noise_type] || 0) + 1;
      });
      
      // Find primary noise type
      let primaryNoiseType = "Unknown";
      let maxTypeCount = 0;
      
      Object.entries(typeCounts).forEach(([type, count]) => {
        if (count > maxTypeCount) {
          maxTypeCount = count;
          primaryNoiseType = type;
        }
      });
      
      return {
        time: dateKey,
        avgLevel,
        maxLevel,
        minLevel,
        range: maxLevel - minLevel,
        count: dayReports.length,
        primaryNoiseType
      };
    }).sort((a, b) => a.time.localeCompare(b.time)); // Sort by date
  }, [data]);

  const tabContentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Noise Analytics Dashboard</CardTitle>
        <CardDescription>
          Comprehensive analysis of noise pollution data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs 
          defaultValue="time-series" 
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="time-series">Time Trends</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="heatmap">Time Heatmap</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>
          
          <motion.div
            key={activeTab}
            initial="hidden"
            animate="visible"
            variants={tabContentVariants}
          >
            <TabsContent value="time-series" className="mt-0">
              <NoiseTimeSeriesChart 
                data={timeSeriesData}
                title="Noise Level Trends Over Time" 
                description="Daily noise level patterns showing average, minimum and maximum readings" 
              />
            </TabsContent>
            
            <TabsContent value="distribution" className="mt-0">
              <NoiseBarChart 
                data={data} 
                title="Noise Level Distribution" 
                description="Distribution of noise levels across different categories"
              />
            </TabsContent>
            
            <TabsContent value="heatmap" className="mt-0">
              <NoiseHeatmapChart 
                data={data} 
                title="Noise Time Distribution" 
                description="Heatmap showing noise levels by hour and day of the week"
              />
            </TabsContent>
            
            <TabsContent value="categories" className="mt-0">
              <NoisePieChart 
                data={data} 
                title="Noise Source Categories" 
                description="Breakdown of reported noise sources by category"
              />
            </TabsContent>
          </motion.div>
        </Tabs>
      </CardContent>
    </Card>
  );
};
