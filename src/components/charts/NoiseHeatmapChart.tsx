
import React from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export interface NoiseReport {
  id: string;
  latitude: number;
  longitude: number;
  decibel_level: number;
  noise_type: string;
  created_at: string;
  notes?: string;
}

export interface NoiseHeatmapChartProps {
  data?: NoiseReport[];
  title?: string;
}

export const NoiseHeatmapChart = ({ 
  data = [], 
  title = "Noise Time Distribution" 
}: NoiseHeatmapChartProps) => {
  const processData = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    const heatmapData = [];
    
    data.forEach(report => {
      const date = new Date(report.created_at);
      const day = date.getDay(); // 0-6
      const hour = date.getHours(); // 0-23
      
      heatmapData.push({
        day: days[day],
        dayIndex: day,
        hour,
        value: report.decibel_level,
        type: report.noise_type,
      });
    });
    
    return heatmapData;
  };

  const heatmapData = processData();

  const getColor = (value: number) => {
    if (value >= 80) return "#ef4444";
    if (value >= 70) return "#f97316";
    if (value >= 60) return "#eab308";
    if (value >= 50) return "#84cc16";
    return "#22c55e";
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card p-3 border border-border rounded-md shadow-lg">
          <p className="font-medium">{data.day} at {data.hour}:00</p>
          <p className="text-sm">Noise Level: <span className="font-medium">{data.value} dB</span></p>
          <p className="text-sm">Type: <span className="font-medium">{data.type}</span></p>
        </div>
      );
    }
    
    return null;
  };

  return (
    <Card className="w-full hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Showing noise levels by hour and day of the week</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] w-full">
          {heatmapData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{
                  top: 20,
                  right: 20,
                  bottom: 60,
                  left: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="hour" 
                  name="Hour" 
                  type="number"
                  domain={[0, 23]}
                  tickFormatter={(hour) => `${hour}:00`}
                  label={{ 
                    value: "Hour of Day", 
                    position: "insideBottom", 
                    offset: -10,
                    className: "fill-muted-foreground" 
                  }}
                  className="text-muted-foreground"
                />
                <YAxis 
                  dataKey="dayIndex" 
                  name="Day" 
                  type="number"
                  domain={[0, 6]}
                  tickFormatter={(day) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]}
                  label={{ 
                    value: "Day of Week", 
                    angle: -90, 
                    position: "insideLeft",
                    className: "fill-muted-foreground" 
                  }}
                  className="text-muted-foreground"
                />
                <ZAxis
                  dataKey="value"
                  range={[50, 400]}
                  name="Decibel Level"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Scatter name="Noise Reports" data={heatmapData} fill="#8884d8">
                  {heatmapData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColor(entry.value)} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">No data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NoiseHeatmapChart;
