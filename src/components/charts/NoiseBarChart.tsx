
import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NoiseReport } from "./NoiseAnalyticsDashboard";

export interface NoiseBarChartProps {
  data?: NoiseReport[];
  title?: string;
}

export const NoiseBarChart: React.FC<NoiseBarChartProps> = ({ 
  data = [], 
  title = "Noise Types Distribution" 
}) => {
  
  const chartData = useMemo(() => {
    // Group by noise type and calculate averages
    const groupedData: Record<string, { count: number, total: number }> = {};
    
    data.forEach((item) => {
      if (!groupedData[item.noise_type]) {
        groupedData[item.noise_type] = { count: 0, total: 0 };
      }
      groupedData[item.noise_type].count += 1;
      groupedData[item.noise_type].total += item.decibel_level;
    });
    
    // Convert to array format for Recharts
    return Object.entries(groupedData).map(([type, values]) => ({
      name: type,
      value: values.count,
      average: Math.round(values.total / values.count),
    }));
  }, [data]);

  // Custom colors for different noise types
  const getBarColor = (type: string) => {
    const colors: Record<string, string> = {
      "Traffic": "#f97316",
      "Construction": "#ef4444",
      "Music": "#8b5cf6", 
      "Industrial": "#6366f1",
      "Event": "#ec4899",
      "Other": "#8b5cf6"
    };
    
    return colors[type] || "#8b5cf6";
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 p-2 border border-border rounded shadow-md">
          <p className="font-medium">{`${payload[0].payload.name}`}</p>
          <p className="text-sm">{`Reports: ${payload[0].value}`}</p>
          <p className="text-sm">{`Avg. Level: ${payload[0].payload.average} dB`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 25,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  height={60}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  className="text-foreground"
                />
                <YAxis 
                  tickLine={false}
                  axisLine={false}
                  className="text-foreground"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="value" name="Number of Reports" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.name)} />
                  ))}
                </Bar>
              </BarChart>
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
