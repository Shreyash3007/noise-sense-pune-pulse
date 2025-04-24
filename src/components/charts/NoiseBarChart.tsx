import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NoiseReport {
  id: string;
  latitude: number;
  longitude: number;
  decibel_level: number;
  noise_type: string;
  created_at: string;
  notes?: string;
}

interface NoiseBarChartProps {
  data: NoiseReport[];
  title?: string;
}

export function NoiseBarChart({ data, title = "Noise Levels by Type" }: NoiseBarChartProps) {
  const [chartView, setChartView] = useState<"type" | "day" | "hour">("type");

  // Process data for different chart views
  const getChartData = () => {
    if (chartView === "type") {
      // Group by noise type
      const groupedByType: Record<string, { type: string; count: number; avgDecibel: number }> = {};
      
      data.forEach((report) => {
        if (!groupedByType[report.noise_type]) {
          groupedByType[report.noise_type] = {
            type: report.noise_type,
            count: 0,
            avgDecibel: 0,
          };
        }
        
        groupedByType[report.noise_type].count += 1;
        groupedByType[report.noise_type].avgDecibel += report.decibel_level;
      });
      
      // Calculate averages and convert to array
      return Object.values(groupedByType).map(group => ({
        ...group,
        avgDecibel: Math.round(group.avgDecibel / group.count),
      }));
    } 
    
    else if (chartView === "day") {
      // Group by day of week
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const groupedByDay: Record<string, { day: string; count: number; avgDecibel: number }> = {};
      
      // Initialize all days
      days.forEach(day => {
        groupedByDay[day] = { day, count: 0, avgDecibel: 0 };
      });
      
      data.forEach((report) => {
        const date = new Date(report.created_at);
        const day = days[date.getDay()];
        
        groupedByDay[day].count += 1;
        groupedByDay[day].avgDecibel += report.decibel_level;
      });
      
      // Calculate averages and convert to array
      return days.map(day => {
        const group = groupedByDay[day];
        return {
          ...group,
          avgDecibel: group.count ? Math.round(group.avgDecibel / group.count) : 0,
        };
      });
    } 
    
    else if (chartView === "hour") {
      // Group by hour of day
      const groupedByHour: Record<number, { hour: string; count: number; avgDecibel: number }> = {};
      
      // Initialize all hours
      for (let i = 0; i < 24; i++) {
        const hourLabel = i.toString().padStart(2, '0') + ":00";
        groupedByHour[i] = { hour: hourLabel, count: 0, avgDecibel: 0 };
      }
      
      data.forEach((report) => {
        const date = new Date(report.created_at);
        const hour = date.getHours();
        
        groupedByHour[hour].count += 1;
        groupedByHour[hour].avgDecibel += report.decibel_level;
      });
      
      // Calculate averages and convert to array
      return Object.values(groupedByHour).map(group => ({
        ...group,
        avgDecibel: group.count ? Math.round(group.avgDecibel / group.count) : 0,
      }));
    }
    
    return [];
  };

  const chartData = getChartData();

  return (
    <Card className="w-full transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium">{title}</CardTitle>
        <Select
          value={chartView}
          onValueChange={(value) => setChartView(value as "type" | "day" | "hour")}
        >
          <SelectTrigger className="w-[180px] h-8">
            <SelectValue placeholder="View by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="type">By Noise Type</SelectItem>
            <SelectItem value="day">By Day of Week</SelectItem>
            <SelectItem value="hour">By Hour of Day</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 70,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
              <XAxis 
                dataKey={chartView === "type" ? "type" : chartView === "day" ? "day" : "hour"} 
                angle={-45} 
                textAnchor="end" 
                tick={{ fontSize: 12 }} 
                className="text-xs fill-gray-500 dark:fill-gray-400"
                dy={20}
              />
              <YAxis 
                yAxisId="left" 
                orientation="left" 
                className="fill-gray-500 dark:fill-gray-400"
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                domain={[0, 100]}
                className="fill-gray-500 dark:fill-gray-400"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  borderColor: "#d1d5db",
                  borderRadius: "0.375rem",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                }}
                itemStyle={{ color: "#374151" }}
              />
              <Legend />
              <Bar
                name="Number of Reports"
                dataKey="count"
                fill="#8884d8"
                yAxisId="left"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                name="Average Decibel Level"
                dataKey="avgDecibel"
                fill="#82ca9d"
                yAxisId="right"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 