import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
  ComposedChart,
  Bar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { BadgePlus, BarChart, Calendar, Download, LineChart as LineChartIcon } from "lucide-react";

interface NoiseReport {
  id: string;
  latitude: number;
  longitude: number;
  decibel_level: number;
  noise_type: string;
  created_at: string;
  notes?: string;
}

interface NoiseTimeSeriesChartProps {
  data: NoiseReport[];
  title?: string;
  description?: string;
}

export function NoiseTimeSeriesChart({ 
  data, 
  title = "Noise Level Trends", 
  description = "Time series analysis of noise levels" 
}: NoiseTimeSeriesChartProps) {
  const [timeRange, setTimeRange] = useState<"daily" | "weekly" | "monthly">("daily");
  const [chartType, setChartType] = useState<"line" | "area" | "bar" | "composed">("area");
  const [loading, setLoading] = useState(false);
  
  // Process data for the time series chart
  const processData = () => {
    if (!data || data.length === 0) return [];
    
    // Sort data by date
    const sortedData = [...data].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    // Group data based on selected time range
    if (timeRange === "daily") {
      // Group by hour of day
      const hourlyData: Record<number, { time: string, avgLevel: number, count: number, maxLevel: number, minLevel: number, noiseTypes: Record<string, number> }> = {};
      
      // Initialize hours
      for (let i = 0; i < 24; i++) {
        hourlyData[i] = { 
          time: `${i}:00`, 
          avgLevel: 0, 
          count: 0,
          maxLevel: 0,
          minLevel: 200, // Start with a high number to find minimum
          noiseTypes: {}
        };
      }
      
      // Process data
      sortedData.forEach(report => {
        const hour = new Date(report.created_at).getHours();
        hourlyData[hour].avgLevel += report.decibel_level;
        hourlyData[hour].count += 1;
        hourlyData[hour].maxLevel = Math.max(hourlyData[hour].maxLevel, report.decibel_level);
        hourlyData[hour].minLevel = Math.min(hourlyData[hour].minLevel, report.decibel_level);
        
        // Track noise types
        const noiseType = report.noise_type;
        hourlyData[hour].noiseTypes[noiseType] = (hourlyData[hour].noiseTypes[noiseType] || 0) + 1;
      });
      
      // Calculate averages
      return Object.values(hourlyData).map(hourData => ({
        time: hourData.time,
        avgLevel: hourData.count > 0 ? Math.round(hourData.avgLevel / hourData.count) : 0,
        maxLevel: hourData.maxLevel || 0,
        minLevel: hourData.minLevel < 200 ? hourData.minLevel : 0,
        range: hourData.maxLevel - (hourData.minLevel < 200 ? hourData.minLevel : 0),
        count: hourData.count,
        // Get most common noise type
        primaryNoiseType: Object.entries(hourData.noiseTypes).sort((a, b) => b[1] - a[1])[0]?.[0] || "None"
      }));
    } 
    else if (timeRange === "weekly") {
      // Group by day of week
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const dailyData: Record<string, { day: string, avgLevel: number, count: number, maxLevel: number, minLevel: number, noiseTypes: Record<string, number> }> = {};
      
      // Initialize days
      days.forEach(day => {
        dailyData[day] = { day, avgLevel: 0, count: 0, maxLevel: 0, minLevel: 200, noiseTypes: {} };
      });
      
      // Process data
      sortedData.forEach(report => {
        const day = days[new Date(report.created_at).getDay()];
        dailyData[day].avgLevel += report.decibel_level;
        dailyData[day].count += 1;
        dailyData[day].maxLevel = Math.max(dailyData[day].maxLevel, report.decibel_level);
        dailyData[day].minLevel = Math.min(dailyData[day].minLevel, report.decibel_level);
        
        // Track noise types
        const noiseType = report.noise_type;
        dailyData[day].noiseTypes[noiseType] = (dailyData[day].noiseTypes[noiseType] || 0) + 1;
      });
      
      // Return in correct order with calculated averages
      return days.map(day => ({
        time: day,
        avgLevel: dailyData[day].count > 0 ? Math.round(dailyData[day].avgLevel / dailyData[day].count) : 0,
        maxLevel: dailyData[day].maxLevel || 0,
        minLevel: dailyData[day].minLevel < 200 ? dailyData[day].minLevel : 0,
        range: dailyData[day].maxLevel - (dailyData[day].minLevel < 200 ? dailyData[day].minLevel : 0),
        count: dailyData[day].count,
        primaryNoiseType: Object.entries(dailyData[day].noiseTypes).sort((a, b) => b[1] - a[1])[0]?.[0] || "None"
      }));
    }
    else if (timeRange === "monthly") {
      // Group by month
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthlyData: Record<string, { month: string, avgLevel: number, count: number, maxLevel: number, minLevel: number, noiseTypes: Record<string, number> }> = {};
      
      // Initialize months
      months.forEach(month => {
        monthlyData[month] = { month, avgLevel: 0, count: 0, maxLevel: 0, minLevel: 200, noiseTypes: {} };
      });
      
      // Process data
      sortedData.forEach(report => {
        const month = months[new Date(report.created_at).getMonth()];
        monthlyData[month].avgLevel += report.decibel_level;
        monthlyData[month].count += 1;
        monthlyData[month].maxLevel = Math.max(monthlyData[month].maxLevel, report.decibel_level);
        monthlyData[month].minLevel = Math.min(monthlyData[month].minLevel, report.decibel_level);
        
        // Track noise types
        const noiseType = report.noise_type;
        monthlyData[month].noiseTypes[noiseType] = (monthlyData[month].noiseTypes[noiseType] || 0) + 1;
      });
      
      // Return data for all months
      return months.map(month => ({
        time: month,
        avgLevel: monthlyData[month].count > 0 ? Math.round(monthlyData[month].avgLevel / monthlyData[month].count) : 0,
        maxLevel: monthlyData[month].maxLevel || 0,
        minLevel: monthlyData[month].minLevel < 200 ? monthlyData[month].minLevel : 0,
        range: monthlyData[month].maxLevel - (monthlyData[month].minLevel < 200 ? monthlyData[month].minLevel : 0),
        count: monthlyData[month].count,
        primaryNoiseType: Object.entries(monthlyData[month].noiseTypes).sort((a, b) => b[1] - a[1])[0]?.[0] || "None"
      }));
    }
    
    return [];
  };

  const chartData = processData();
  
  // Calculate safe noise threshold
  const safeNoiseThreshold = 70;
  
  // Simulate data update
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [timeRange, chartType]);

  const renderChart = () => {
    switch(chartType) {
      case "line":
        return (
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 30,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
            <XAxis 
              dataKey="time" 
              className="text-xs fill-gray-500 dark:fill-gray-400"
            />
            <YAxis 
              domain={[0, 'dataMax + 10']}
              className="fill-gray-500 dark:fill-gray-400"
              label={{ 
                value: "Decibel Level (dB)", 
                angle: -90, 
                position: "insideLeft",
                className: "fill-gray-500 dark:fill-gray-400" 
              }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderColor: "#d1d5db",
                borderRadius: "0.375rem",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              }}
              formatter={(value: number, name: string) => [
                `${value} ${name === "avgLevel" ? "dB" : name === "count" ? "reports" : ""}`, 
                name === "avgLevel" ? "Avg. Noise Level" : name === "maxLevel" ? "Max Level" : name === "minLevel" ? "Min Level" : "Report Count"
              ]}
            />
            <Legend />
            <ReferenceLine 
              y={safeNoiseThreshold} 
              stroke="#ef4444" 
              strokeDasharray="3 3"
              label={{ 
                value: "Safe Threshold", 
                position: "right", 
                className: "fill-red-500 dark:fill-red-400 text-xs" 
              }}
            />
            <Line
              type="monotone"
              dataKey="avgLevel"
              name="Average Noise Level"
              stroke="#8884d8"
              strokeWidth={2}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="maxLevel"
              name="Max Level"
              stroke="#ff7300"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="minLevel"
              name="Min Level"
              stroke="#82ca9d"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              activeDot={{ r: 4 }}
            />
          </LineChart>
        );
      case "area":
        return (
          <AreaChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 30,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
            <XAxis 
              dataKey="time" 
              className="text-xs fill-gray-500 dark:fill-gray-400"
            />
            <YAxis 
              domain={[0, 'dataMax + 10']}
              className="fill-gray-500 dark:fill-gray-400"
              label={{ 
                value: "Decibel Level (dB)", 
                angle: -90, 
                position: "insideLeft",
                className: "fill-gray-500 dark:fill-gray-400" 
              }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderColor: "#d1d5db",
                borderRadius: "0.375rem",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              }}
              formatter={(value: number) => [`${value} dB`, "Avg. Noise Level"]}
            />
            <Legend />
            <ReferenceLine 
              y={safeNoiseThreshold} 
              stroke="#ef4444" 
              strokeDasharray="3 3"
              label={{ 
                value: "Safe Threshold", 
                position: "right", 
                className: "fill-red-500 dark:fill-red-400 text-xs" 
              }}
            />
            <Area
              type="monotone"
              dataKey="avgLevel"
              name="Average Noise Level"
              stroke="#8884d8"
              fill="url(#colorGradient)"
              strokeWidth={2}
              activeDot={{ r: 6 }}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
          </AreaChart>
        );
      case "bar":
        return (
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 30,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
            <XAxis 
              dataKey="time" 
              className="text-xs fill-gray-500 dark:fill-gray-400"
            />
            <YAxis 
              domain={[0, 'dataMax + 10']}
              className="fill-gray-500 dark:fill-gray-400"
              label={{ 
                value: "Decibel Level (dB)", 
                angle: -90, 
                position: "insideLeft",
                className: "fill-gray-500 dark:fill-gray-400" 
              }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderColor: "#d1d5db",
                borderRadius: "0.375rem",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              }}
              formatter={(value: number) => [`${value} dB`, "Avg. Noise Level"]}
            />
            <Legend />
            <ReferenceLine 
              y={safeNoiseThreshold} 
              stroke="#ef4444" 
              strokeDasharray="3 3"
              label={{ 
                value: "Safe Threshold", 
                position: "right", 
                className: "fill-red-500 dark:fill-red-400 text-xs" 
              }}
            />
            <Bar 
              dataKey="avgLevel" 
              name="Average Noise Level" 
              fill="#8884d8" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );
      case "composed":
        return (
          <ComposedChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 30,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
            <XAxis 
              dataKey="time" 
              className="text-xs fill-gray-500 dark:fill-gray-400"
            />
            <YAxis 
              domain={[0, 'dataMax + 10']}
              className="fill-gray-500 dark:fill-gray-400"
              label={{ 
                value: "Decibel Level (dB)", 
                angle: -90, 
                position: "insideLeft",
                className: "fill-gray-500 dark:fill-gray-400" 
              }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              domain={[0, 'auto']}
              className="fill-gray-500 dark:fill-gray-400"
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderColor: "#d1d5db",
                borderRadius: "0.375rem",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              }}
              formatter={(value: number, name: string) => [
                `${value} ${name === "count" ? "reports" : "dB"}`, 
                name === "count" ? "Report Count" : name === "avgLevel" ? "Avg. Noise Level" : "Range (Max-Min)"
              ]}
            />
            <Legend />
            <ReferenceLine 
              y={safeNoiseThreshold} 
              stroke="#ef4444" 
              strokeDasharray="3 3"
              label={{ 
                value: "Safe Threshold", 
                position: "right", 
                className: "fill-red-500 dark:fill-red-400 text-xs" 
              }}
            />
            <Bar 
              dataKey="range" 
              barSize={20} 
              fill="#8884d8" 
              opacity={0.3}
              name="Range (Max-Min)"
              radius={[4, 4, 0, 0]}
            />
            <Line
              type="monotone"
              dataKey="avgLevel"
              stroke="#8884d8"
              name="Average Noise Level"
              strokeWidth={2}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="count"
              stroke="#82ca9d"
              name="Report Count"
              strokeWidth={1.5}
            />
          </ComposedChart>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <ToggleGroup type="single" value={chartType} onValueChange={(value) => value && setChartType(value as any)}>
            <ToggleGroupItem value="area" aria-label="Area Chart">
              <AreaChart className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="line" aria-label="Line Chart">
              <LineChartIcon className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="bar" aria-label="Bar Chart">
              <BarChart className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="composed" aria-label="Composed Chart">
              <BadgePlus className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          <Select
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as "daily" | "weekly" | "monthly")}
          >
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily (24h)</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full relative">
          {loading && (
            <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-10">
              <div className="h-10 w-10 border-4 border-t-purple-600 border-gray-200 rounded-full animate-spin"></div>
            </div>
          )}
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}