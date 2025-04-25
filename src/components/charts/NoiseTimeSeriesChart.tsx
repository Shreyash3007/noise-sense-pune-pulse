
import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Volume2, ZoomIn, ZoomOut, Calendar } from "lucide-react";

interface NoiseTimeSeriesData {
  time: string;
  avgLevel: number;
  maxLevel: number;
  minLevel: number;
  range: number;
  count: number;
  primaryNoiseType: string;
}

interface NoiseTimeSeriesChartProps {
  title?: string;
  description?: string;
  data: NoiseTimeSeriesData[];
  height?: number;
  showTimeRanges?: boolean;
  showLegend?: boolean;
  timeFormat?: "hourly" | "daily" | "weekly" | "monthly";
}

const sampleData: NoiseTimeSeriesData[] = [
  {
    time: "2024-07-15 06:00",
    avgLevel: 58,
    maxLevel: 72,
    minLevel: 45,
    range: 27,
    count: 12,
    primaryNoiseType: "Traffic",
  },
  {
    time: "2024-07-15 09:00",
    avgLevel: 65,
    maxLevel: 85,
    minLevel: 48,
    range: 37,
    count: 25,
    primaryNoiseType: "Traffic",
  },
  {
    time: "2024-07-15 12:00",
    avgLevel: 63,
    maxLevel: 79,
    minLevel: 52,
    range: 27,
    count: 18,
    primaryNoiseType: "Construction",
  },
  {
    time: "2024-07-15 15:00",
    avgLevel: 68,
    maxLevel: 88,
    minLevel: 55,
    range: 33,
    count: 22,
    primaryNoiseType: "Construction",
  },
  {
    time: "2024-07-15 18:00",
    avgLevel: 72,
    maxLevel: 95,
    minLevel: 58,
    range: 37,
    count: 30,
    primaryNoiseType: "Music",
  },
  {
    time: "2024-07-15 21:00",
    avgLevel: 75,
    maxLevel: 101,
    minLevel: 60,
    range: 41,
    count: 28,
    primaryNoiseType: "Music",
  },
  {
    time: "2024-07-16 00:00",
    avgLevel: 62,
    maxLevel: 85,
    minLevel: 50,
    range: 35,
    count: 15,
    primaryNoiseType: "Traffic",
  },
  {
    time: "2024-07-16 03:00",
    avgLevel: 54,
    maxLevel: 68,
    minLevel: 42,
    range: 26,
    count: 8,
    primaryNoiseType: "Traffic",
  },
];

const formatTime = (time: string, format: "hourly" | "daily" | "weekly" | "monthly") => {
  const date = new Date(time);
  
  switch (format) {
    case "hourly":
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    case "daily":
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    case "weekly":
      return `W${Math.ceil(date.getDate() / 7)} ${date.toLocaleDateString([], { month: 'short' })}`;
    case "monthly":
      return date.toLocaleDateString([], { month: 'short', year: '2-digit' });
    default:
      return time;
  }
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-md shadow-md">
        <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} className="text-sm" style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value} ${entry.name.includes("Level") ? "dB" : ""}`}
          </p>
        ))}
        {payload[0]?.payload?.primaryNoiseType && (
          <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
            Main source: {payload[0].payload.primaryNoiseType}
          </p>
        )}
        {payload[0]?.payload?.count && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Reports: {payload[0].payload.count}
          </p>
        )}
      </div>
    );
  }
  
  return null;
};

const NoiseTimeSeriesChart: React.FC<NoiseTimeSeriesChartProps> = ({ 
  title = "Noise Level Trends", 
  description = "Average and peak noise levels over time",
  data = sampleData,
  height = 350,
  showTimeRanges = true,
  showLegend = true,
  timeFormat = "hourly"
}) => {
  const [zoom, setZoom] = useState(1);
  const [activeView, setActiveView] = useState<"line" | "area" | "full">("line");
  const [activePeriod, setActivePeriod] = useState<"hourly" | "daily" | "weekly" | "monthly">(timeFormat);
  
  const processedData = data.map(item => ({
    ...item,
    formattedTime: formatTime(item.time, activePeriod)
  }));
  
  const handleZoomIn = () => {
    if (zoom < 2) setZoom(zoom + 0.25);
  };
  
  const handleZoomOut = () => {
    if (zoom > 0.5) setZoom(zoom - 0.25);
  };
  
  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl flex items-center">
              <Volume2 className="mr-2 h-5 w-5 text-primary" />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex space-x-1">
            <Button variant="outline" size="icon" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Calendar className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as "line" | "area" | "full")}>
          <div className="pl-6 border-b">
            <TabsList>
              <TabsTrigger value="line">Line Chart</TabsTrigger>
              <TabsTrigger value="area">Area Chart</TabsTrigger>
              <TabsTrigger value="full">Full Data</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="line" className="p-4">
            <div style={{ width: '100%', height: height * zoom }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={processedData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 20,
                    bottom: 30,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis 
                    dataKey="formattedTime" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    className="text-gray-600 dark:text-gray-300"
                  />
                  <YAxis 
                    yAxisId="left"
                    domain={['dataMin - 5', 'dataMax + 5']}
                    label={{ 
                      value: 'Decibel (dB)', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle' },
                      className: "fill-gray-600 dark:fill-gray-300"
                    }}
                    tick={{ fontSize: 12 }}
                    className="text-gray-600 dark:text-gray-300"
                  />
                  {showTimeRanges && (
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      tick={{ fontSize: 12 }} 
                      domain={[0, 'dataMax + 10']}
                      className="text-gray-600 dark:text-gray-300"
                    />
                  )}
                  <Tooltip content={<CustomTooltip />} />
                  {showLegend && <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />}
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="avgLevel" 
                    name="Avg Level" 
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                    dot={{ r: 3 }} 
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="maxLevel" 
                    name="Max Level" 
                    stroke="#EC4899" 
                    strokeWidth={2} 
                    dot={{ r: 3 }} 
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    strokeDasharray="3 3"
                  />
                  {showTimeRanges && (
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="count" 
                      name="Reports" 
                      stroke="#14B8A6" 
                      strokeWidth={2}
                      dot={{ r: 3 }} 
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="area" className="p-4">
            <div style={{ width: '100%', height: height * zoom }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={processedData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 20,
                    bottom: 30,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis 
                    dataKey="formattedTime" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    className="text-gray-600 dark:text-gray-300"
                  />
                  <YAxis 
                    domain={['dataMin - 5', 'dataMax + 5']}
                    label={{ 
                      value: 'Decibel (dB)', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle' },
                      className: "fill-gray-600 dark:fill-gray-300"
                    }}
                    tick={{ fontSize: 12 }}
                    className="text-gray-600 dark:text-gray-300"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {showLegend && <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />}
                  <Area 
                    type="monotone" 
                    dataKey="minLevel" 
                    name="Min Level" 
                    fill="#8B5CF6" 
                    stroke="#8B5CF6" 
                    fillOpacity={0.1} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="avgLevel" 
                    name="Avg Level" 
                    fill="#8B5CF6" 
                    stroke="#8B5CF6" 
                    fillOpacity={0.3} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="maxLevel" 
                    name="Max Level" 
                    fill="#EC4899" 
                    stroke="#EC4899"
                    fillOpacity={0.3} 
                  />
                  <Line
                    type="monotone"
                    dataKey="avgLevel"
                    name="Avg Level"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="full" className="p-4">
            <div style={{ width: '100%', height: height * zoom }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={processedData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 20,
                    bottom: 30,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis 
                    dataKey="formattedTime" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    className="text-gray-600 dark:text-gray-300"
                  />
                  <YAxis 
                    yAxisId="left"
                    domain={['dataMin - 5', 'dataMax + 5']}
                    label={{ 
                      value: 'Decibel (dB)', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle' },
                      className: "fill-gray-600 dark:fill-gray-300"
                    }}
                    tick={{ fontSize: 12 }}
                    className="text-gray-600 dark:text-gray-300"
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    tick={{ fontSize: 12 }} 
                    domain={[0, 'dataMax + 10']}
                    className="text-gray-600 dark:text-gray-300"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {showLegend && <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />}
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="minLevel" 
                    name="Min Level" 
                    fill="#8B5CF6" 
                    stroke="#8B5CF6" 
                    fillOpacity={0.1} 
                  />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="maxLevel" 
                    name="Max Level" 
                    fill="#EC4899" 
                    stroke="#EC4899"
                    fillOpacity={0.2} 
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="avgLevel" 
                    name="Avg Level" 
                    stroke="#8B5CF6" 
                    strokeWidth={2.5} 
                    dot={{ r: 3 }} 
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="count" 
                    name="Reports" 
                    stroke="#14B8A6" 
                    strokeWidth={2}
                    dot={{ r: 3 }} 
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="pt-2 pb-4 px-6">
        <div className="flex w-full justify-between items-center">
          <div className="flex space-x-1">
            <Button 
              size="sm" 
              variant={activePeriod === "hourly" ? "default" : "outline"} 
              onClick={() => setActivePeriod("hourly")}
            >
              Hourly
            </Button>
            <Button 
              size="sm" 
              variant={activePeriod === "daily" ? "default" : "outline"}
              onClick={() => setActivePeriod("daily")}
            >
              Daily
            </Button>
            <Button 
              size="sm" 
              variant={activePeriod === "weekly" ? "default" : "outline"}
              onClick={() => setActivePeriod("weekly")}
            >
              Weekly
            </Button>
            <Button 
              size="sm" 
              variant={activePeriod === "monthly" ? "default" : "outline"}
              onClick={() => setActivePeriod("monthly")}
            >
              Monthly
            </Button>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">Data updated hourly</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default NoiseTimeSeriesChart;
