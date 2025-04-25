
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NoiseReport } from "./NoiseAnalyticsDashboard";

export interface NoisePieChartProps {
  data?: NoiseReport[];
  title?: string;
}

export const NoisePieChart: React.FC<NoisePieChartProps> = ({ 
  data = [], 
  title = "Noise Distribution" 
}) => {
  // Prepare data for the pie chart
  const chartData = React.useMemo(() => {
    const noiseTypes: Record<string, number> = {};
    
    data.forEach((report) => {
      if (!noiseTypes[report.noise_type]) {
        noiseTypes[report.noise_type] = 0;
      }
      noiseTypes[report.noise_type]++;
    });
    
    return Object.entries(noiseTypes).map(([name, value]) => ({
      name,
      value,
    }));
  }, [data]);

  // Colors for the pie chart segments
  const COLORS = ['#f97316', '#ef4444', '#8b5cf6', '#6366f1', '#ec4899', '#14b8a6', '#84cc16', '#f59e0b'];
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / data.total) * 100).toFixed(1);
      
      return (
        <div className="bg-background/95 p-2 border border-border rounded shadow-md">
          <p className="font-medium">{`${data.name}`}</p>
          <p className="text-sm">{`Reports: ${data.value} (${percentage}%)`}</p>
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
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Legend layout="vertical" verticalAlign="middle" align="right" />
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
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
