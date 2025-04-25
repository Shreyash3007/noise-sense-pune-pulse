
import React, { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, AreaChart, TooltipProps } from "recharts";
import { useMediaQuery } from "@/hooks/use-mobile";

// Define Types
export interface NoiseTimeSeriesData {
  time: string;
  avgLevel: number;
  maxLevel: number;
  minLevel: number;
  range: number;
  count: number;
  primaryNoiseType: string;
}

export interface NoiseTimeSeriesChartProps {
  data: NoiseTimeSeriesData[];
  title?: string;
  description?: string;
}

// Helper function to format time based on the selected grouping
const formatTime = (time: string, grouping: string) => {
  if (grouping === "hour") {
    // time is in format "HH:mm"
    return time;
  } else if (grouping === "day") {
    // time is a date string
    const date = new Date(time);
    return date.toLocaleDateString(undefined, { weekday: 'short' });
  } else if (grouping === "month") {
    // time is a month name
    return time;
  }
  return time;
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
        <p className="text-sm font-medium">{label}</p>
        <div className="mt-1">
          {payload.map((entry, index) => (
            <p 
              key={`tooltip-entry-${index}`} 
              className="text-sm" 
              style={{ color: entry.color }}
            >
              {`${entry.name}: ${entry.value} ${entry.name === 'Range' ? '' : 'dB'}`}
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const NoiseTimeSeriesChart: React.FC<NoiseTimeSeriesChartProps> = ({ 
  data = [], 
  title = "Noise Level Trends", 
  description = "Average and peak noise levels over time"
}) => {
  const isSmallScreen = useMediaQuery("(max-width: 640px)");
  const isMediumScreen = useMediaQuery("(max-width: 1024px)");
  
  const [chartType, setChartType] = React.useState<"line" | "area">("line");
  const [timeGrouping, setTimeGrouping] = React.useState<"hour" | "day" | "month">("day");
  const [chartHeight, setChartHeight] = React.useState(400);
  
  // Adjust chart height based on screen size
  useEffect(() => {
    if (isSmallScreen) {
      setChartHeight(300);
    } else if (isMediumScreen) {
      setChartHeight(350);
    } else {
      setChartHeight(400);
    }
  }, [isSmallScreen, isMediumScreen]);
  
  // Calculate statistics from data
  const stats = React.useMemo(() => {
    if (!data || data.length === 0) return { maxValue: 0, avgValue: 0, totalCount: 0 };
    
    const maxValue = Math.max(...data.map(d => d.maxLevel));
    const totalCount = data.reduce((acc, curr) => acc + curr.count, 0);
    const weightedSum = data.reduce((acc, curr) => acc + (curr.avgLevel * curr.count), 0);
    const avgValue = totalCount > 0 ? Math.round(weightedSum / totalCount) : 0;
    
    return { maxValue, avgValue, totalCount };
  }, [data]);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-y-2 pb-2">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 mt-2 md:mt-0">
          <ToggleGroup type="single" value={chartType} onValueChange={(value) => value && setChartType(value as "line" | "area")}>
            <ToggleGroupItem value="line" aria-label="Line chart">Line</ToggleGroupItem>
            <ToggleGroupItem value="area" aria-label="Area chart">Area</ToggleGroupItem>
          </ToggleGroup>
          
          <ToggleGroup type="single" value={timeGrouping} onValueChange={(value) => value && setTimeGrouping(value as "hour" | "day" | "month")}>
            <ToggleGroupItem value="hour" aria-label="Group by hour">Hour</ToggleGroupItem>
            <ToggleGroupItem value="day" aria-label="Group by day">Day</ToggleGroupItem>
            <ToggleGroupItem value="month" aria-label="Group by month">Month</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-wrap gap-3 mb-4">
          <Badge variant="outline" className="bg-background/50">
            Max: <span className="ml-1 font-semibold text-primary">{stats.maxValue} dB</span>
          </Badge>
          <Badge variant="outline" className="bg-background/50">
            Avg: <span className="ml-1 font-semibold text-blue-500 dark:text-blue-400">{stats.avgValue} dB</span>
          </Badge>
          <Badge variant="outline" className="bg-background/50">
            Samples: <span className="ml-1 font-semibold">{stats.totalCount}</span>
          </Badge>
        </div>
        
        <div style={{ height: chartHeight, width: "100%" }} className="mt-4">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "line" ? (
              <LineChart
                data={data}
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
                  tickFormatter={(time) => formatTime(time, timeGrouping)}
                  tick={{ fontSize: 12 }}
                  className="fill-gray-500 dark:fill-gray-400"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  domain={[0, 'auto']}
                  className="fill-gray-500 dark:fill-gray-400"
                  label={{ 
                    value: "Decibels (dB)", 
                    angle: -90, 
                    position: "insideLeft",
                    className: "fill-gray-500 dark:fill-gray-400" 
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="maxLevel" 
                  name="Max Level" 
                  stroke="#ef4444" 
                  strokeWidth={2} 
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="avgLevel" 
                  name="Avg Level" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                />
                <Line 
                  type="monotone" 
                  dataKey="minLevel" 
                  name="Min Level" 
                  stroke="#22c55e" 
                  strokeWidth={2} 
                />
              </LineChart>
            ) : (
              <AreaChart
                data={data}
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
                  tickFormatter={(time) => formatTime(time, timeGrouping)}
                  tick={{ fontSize: 12 }}
                  className="fill-gray-500 dark:fill-gray-400"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  domain={[0, 'auto']}
                  className="fill-gray-500 dark:fill-gray-400"
                  label={{ 
                    value: "Decibels (dB)", 
                    angle: -90, 
                    position: "insideLeft",
                    className: "fill-gray-500 dark:fill-gray-400" 
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="maxLevel" 
                  name="Max Level" 
                  stroke="#ef4444" 
                  fill="#ef4444" 
                  fillOpacity={0.2} 
                />
                <Area 
                  type="monotone" 
                  dataKey="avgLevel" 
                  name="Avg Level" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.2} 
                />
                <Area 
                  type="monotone" 
                  dataKey="minLevel" 
                  name="Min Level" 
                  stroke="#22c55e" 
                  fill="#22c55e" 
                  fillOpacity={0.2} 
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default NoiseTimeSeriesChart;
