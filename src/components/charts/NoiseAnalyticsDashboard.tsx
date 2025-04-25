
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { NoiseBarChart } from "./NoiseBarChart";
import { NoisePieChart } from "./NoisePieChart";
import { NoiseTimeSeriesChart } from "./NoiseTimeSeriesChart";
import { NoiseHeatmapChart } from "./NoiseHeatmapChart";

export interface NoiseReport {
  id: string;
  latitude: number;
  longitude: number;
  decibel_level: number;
  noise_type: string;
  created_at: string;
  notes?: string;
}

export interface NoiseAnalyticsDashboardProps {
  data?: NoiseReport[];
  startDate?: Date;
  endDate?: Date;
}

export const NoiseAnalyticsDashboard: React.FC<NoiseAnalyticsDashboardProps> = ({
  data = [],
  startDate,
  endDate,
}) => {
  // Format date range for display
  const formatDate = (date?: Date) => {
    if (!date) return "N/A";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const dateRangeText = `${formatDate(startDate)} - ${formatDate(endDate)}`;

  // Analytics for summary section
  const analytics = React.useMemo(() => {
    if (!data || data.length === 0) return null;

    const totalReports = data.length;
    const avgLevel =
      data.reduce((sum, item) => sum + item.decibel_level, 0) / totalReports;
    
    const noiseTypes = data.reduce((acc, item) => {
      acc[item.noise_type] = (acc[item.noise_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const primaryType = Object.entries(noiseTypes).sort((a, b) => b[1] - a[1])[0]?.[0] || "Unknown";
    
    const maxLevel = Math.max(...data.map(item => item.decibel_level));
    const minLevel = Math.min(...data.map(item => item.decibel_level));

    return {
      totalReports,
      avgLevel: avgLevel.toFixed(1),
      primaryType,
      maxLevel,
      minLevel,
      noiseTypes
    };
  }, [data]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Noise Analytics Dashboard</CardTitle>
          <p className="text-sm text-muted-foreground">
            Data analytics for period: {dateRangeText}
          </p>
        </CardHeader>
        <CardContent>
          {!analytics ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No data available for analysis</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{analytics.totalReports}</div>
                    <p className="text-xs text-muted-foreground uppercase">Total Reports</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{analytics.avgLevel} dB</div>
                    <p className="text-xs text-muted-foreground uppercase">Average Level</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{analytics.maxLevel} dB</div>
                    <p className="text-xs text-muted-foreground uppercase">Max Level</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{analytics.primaryType}</div>
                    <p className="text-xs text-muted-foreground uppercase">Primary Noise Type</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="w-full md:w-auto grid grid-cols-4 md:flex">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="time">Time Series</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <NoiseBarChart data={data} title="Noise by Type" />
            
            {/* Pie Chart */}
            <NoisePieChart data={data} title="Noise Distribution" />
          </div>
        </TabsContent>

        <TabsContent value="time" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <NoiseTimeSeriesChart data={data} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="mt-4">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Noise Level Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <NoiseBarChart data={data} title="" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="heatmap" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Noise Heatmap</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <NoiseHeatmapChart data={data} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
