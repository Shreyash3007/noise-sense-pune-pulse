import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  Sector,
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

interface NoisePieChartProps {
  data?: NoiseReport[];
  title?: string;
}

// Custom colors for pie chart segments
const COLORS = [
  '#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', 
  '#d0ed57', '#ffc658', '#ff8042', '#f97316', '#ef4444',
  '#ec4899', '#a855f7', '#6366f1', '#3b82f6', '#06b6d4'
];

export const NoisePieChart = ({ data = [], title = "Noise Distribution" }: NoisePieChartProps) => {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const [chartView, setChartView] = useState<"type" | "severity">("type");

  // Process data for different chart views
  const getChartData = () => {
    if (chartView === "type") {
      // Group by noise type
      const groupedByType: Record<string, { name: string; value: number }> = {};
      
      data.forEach((report) => {
        if (!groupedByType[report.noise_type]) {
          groupedByType[report.noise_type] = {
            name: report.noise_type,
            value: 0,
          };
        }
        
        groupedByType[report.noise_type].value += 1;
      });
      
      return Object.values(groupedByType);
    } 
    
    else if (chartView === "severity") {
      // Group by severity level
      const severityLevels = [
        { range: [0, 50], name: "Low (0-50 dB)" },
        { range: [50, 65], name: "Moderate (50-65 dB)" },
        { range: [65, 80], name: "High (65-80 dB)" },
        { range: [80, Infinity], name: "Dangerous (80+ dB)" },
      ];
      
      const groupedBySeverity: Record<string, { name: string; value: number }> = {};
      
      // Initialize all severity levels
      severityLevels.forEach((level) => {
        groupedBySeverity[level.name] = { name: level.name, value: 0 };
      });
      
      data.forEach((report) => {
        const level = severityLevels.find(
          (l) => report.decibel_level >= l.range[0] && report.decibel_level < l.range[1]
        );
        
        if (level) {
          groupedBySeverity[level.name].value += 1;
        }
      });
      
      return Object.values(groupedBySeverity);
    }
    
    return [];
  };

  const chartData = getChartData();

  // Render active shape with animation
  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const {
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      percent,
      name,
      value,
    } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? "start" : "end";

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path
          d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
          stroke={fill}
          fill="none"
        />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          textAnchor={textAnchor}
          fill="#333333"
          className="text-xs fill-gray-700 dark:fill-gray-300"
        >
          {name}
        </text>
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          dy={18}
          textAnchor={textAnchor}
          fill="#999999"
          className="text-xs fill-gray-500 dark:fill-gray-400"
        >
          {`${value} reports (${(percent * 100).toFixed(1)}%)`}
        </text>
      </g>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium">{title}</CardTitle>
        <Select
          value={chartView}
          onValueChange={(value) => setChartView(value as "type" | "severity")}
        >
          <SelectTrigger className="w-[180px] h-8">
            <SelectValue placeholder="View by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="type">By Noise Type</SelectItem>
            <SelectItem value="severity">By Severity Level</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(undefined)}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value} reports`, chartView === "type" ? "Count" : "Severity"]}
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                }}
              />
              <Legend formatter={(value) => <span className="text-sm">{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default NoisePieChart;
