
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { NoiseReport } from '@/types';

interface NoisePieChartProps {
  data: NoiseReport[];
  title: string;
  height?: number | string;
  className?: string;
}

export const NoisePieChart: React.FC<NoisePieChartProps> = ({
  data,
  title,
  height = 350,
  className = '',
}) => {
  const [chartData, setChartData] = useState<{ name: string; value: number }[]>([]);

  // Predefined colors for noise categories
  const COLORS = [
    '#8884d8', // Purple
    '#82ca9d', // Green
    '#ffc658', // Yellow
    '#ff8042', // Orange
    '#0088fe', // Blue
    '#00C49F', // Teal
    '#FFBB28', // Gold
    '#FF8042', // Coral
    '#a4de6c', // Light Green
    '#d0ed57', // Lime
  ];

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Group data by noise type and count occurrences
    const noiseTypeCounts = data.reduce((acc, report) => {
      const type = report.noise_type;
      if (!acc[type]) {
        acc[type] = 0;
      }
      acc[type]++;
      return acc;
    }, {} as Record<string, number>);

    // Convert to chart format and sort by frequency
    const processedData = Object.keys(noiseTypeCounts)
      .map((type) => ({
        name: type,
        value: noiseTypeCounts[type],
      }))
      .sort((a, b) => b.value - a.value);

    setChartData(processedData);
  }, [data]);

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (!data || data.length === 0) {
    return (
      <Card className={`p-4 ${className}`}>
        <h3 className="text-lg font-medium mb-4">{title || 'Noise Types Distribution'}</h3>
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
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              animationDuration={1000}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`${value} reports`, 'Count']}
              labelFormatter={(label) => `Noise Type: ${label}`}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default NoisePieChart;
