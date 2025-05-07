import { useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface NoiseTimeSeriesData {
  time: string;
  avgLevel: number;
  maxLevel: number;
  minLevel: number;
  range: number;
  count: number;
  primaryNoiseType: string;
  hourOfDay?: number;
  timeOfDay?: string;
  dayOfWeek?: string;
  formattedTime?: string;
  timestamp?: number;
}

export interface NoiseTimeSeriesChartProps {
  data: NoiseTimeSeriesData[];
  title?: string;
  description?: string;
  height?: number | string;
}

const NoiseTimeSeriesChart = ({
  data,
  title = "Noise Level Over Time",
  description = "Average, maximum and minimum noise levels tracked over time",
  height = 350
}: NoiseTimeSeriesChartProps) => {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center" style={{ height: typeof height === 'number' ? `${height}px` : height }}>
          <p className="text-muted-foreground">No time series data available</p>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border p-3 rounded-md shadow-md">
          <p className="font-medium">{`${label}`}</p>
          <p className="text-sm text-destructive">{`Max: ${data.maxLevel} dB`}</p>
          <p className="text-sm text-primary">{`Avg: ${data.avgLevel} dB`}</p>
          <p className="text-sm text-muted-foreground">{`Min: ${data.minLevel} dB`}</p>
          <div className="border-t mt-2 pt-2">
            {data.formattedTime && (
              <p className="text-xs text-muted-foreground">{`Time: ${data.formattedTime}`}</p>
            )}
            {data.timeOfDay && (
              <p className="text-xs text-muted-foreground">{`Period: ${data.timeOfDay}`}</p>
            )}
            {data.dayOfWeek && (
              <p className="text-xs text-muted-foreground">{`Day: ${data.dayOfWeek}`}</p>
            )}
            <p className="text-xs text-muted-foreground">{`Type: ${data.primaryNoiseType}`}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Tabs
          defaultValue="area"
          value={chartType}
          onValueChange={(value) => setChartType(value as 'area' | 'bar')}
          className="w-[200px]"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="area">Area</TabsTrigger>
            <TabsTrigger value="bar">Bar</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="pt-4">
        <div style={{ height: typeof height === 'number' ? `${height}px` : height, width: '100%' }}>
          {chartType === 'area' ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="time" />
                <YAxis domain={['dataMin - 10', 'dataMax + 10']} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="maxLevel"
                  stroke="#f87171"
                  fill="#f87171"
                  fillOpacity={0.1}
                  activeDot={{ r: 6 }}
                  name="Max Level (dB)"
                />
                <Area
                  type="monotone"
                  dataKey="avgLevel"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.2}
                  activeDot={{ r: 6 }}
                  name="Avg Level (dB)"
                />
                <Area
                  type="monotone"
                  dataKey="minLevel"
                  stroke="#60a5fa"
                  fill="#60a5fa"
                  fillOpacity={0.1}
                  activeDot={{ r: 6 }}
                  name="Min Level (dB)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="time" />
                <YAxis domain={['dataMin - 10', 'dataMax + 10']} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="maxLevel"
                  fill="#f87171"
                  opacity={0.8}
                  name="Max Level (dB)"
                />
                <Bar
                  dataKey="avgLevel"
                  fill="#8b5cf6"
                  opacity={0.8}
                  name="Avg Level (dB)"
                />
                <Bar
                  dataKey="minLevel"
                  fill="#60a5fa"
                  opacity={0.8}
                  name="Min Level (dB)"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NoiseTimeSeriesChart;
