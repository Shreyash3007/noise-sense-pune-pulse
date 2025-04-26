
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { NoiseReport } from '@/types';

interface NoiseBarChartProps {
  data: NoiseReport[];
  title: string;
  height?: number | string;
  className?: string;
  showControls?: boolean;
}

export const NoiseBarChart: React.FC<NoiseBarChartProps> = ({ 
  data, 
  title, 
  height = 350, 
  className = '',
  showControls = false
}) => {
  // Process data for chart
  const [chartData, setChartData] = useState<{name: string, value: number}[]>([]);
  
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    // Group data by noise type and calculate average decibel level
    const groupedData = data.reduce((acc, report) => {
      if (!acc[report.noise_type]) {
        acc[report.noise_type] = {
          sum: Number(report.decibel_level),
          count: 1
        };
      } else {
        acc[report.noise_type].sum += Number(report.decibel_level);
        acc[report.noise_type].count += 1;
      }
      return acc;
    }, {} as Record<string, { sum: number, count: number }>);
    
    // Convert to chart format
    const chartFormatData = Object.keys(groupedData).map(noiseType => ({
      name: noiseType,
      value: Math.round(groupedData[noiseType].sum / groupedData[noiseType].count)
    }));
    
    // Sort by value (optional)
    chartFormatData.sort((a, b) => b.value - a.value);
    
    setChartData(chartFormatData);
  }, [data]);
  
  // Colors for different decibel levels
  const getBarColor = (value: number) => {
    if (value >= 85) return '#EF4444'; // Red - dangerous
    if (value >= 70) return '#F59E0B'; // Amber - warning
    if (value >= 55) return '#FBBF24'; // Yellow - moderate
    return '#10B981'; // Green - safe
  };
  
  if (!data || data.length === 0) {
    return (
      <Card className={`p-4 ${className}`}>
        <h3 className="text-lg font-medium mb-4">{title || 'Noise Levels by Type'}</h3>
        <div className="space-y-2">
          <Skeleton className="h-[300px]" />
        </div>
      </Card>
    );
  }
  
  return (
    <div className={`w-full ${className}`}>
      {title && <h3 className="text-lg font-medium mb-2">{title}</h3>}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={70}
              tick={{fontSize: 12}}
            />
            <YAxis 
              label={{ 
                value: 'Decibels (dB)', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' } 
              }}
              domain={[0, 'dataMax + 10']} 
            />
            <Tooltip
              formatter={(value: number) => [`${value} dB`, 'Avg. Noise Level']}
              labelFormatter={(label) => `Noise Type: ${label}`}
            />
            <Legend verticalAlign="top" height={36} />
            <Bar 
              dataKey="value" 
              name="Avg. Noise Level (dB)"
              radius={[4, 4, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.value)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default NoiseBarChart;
