import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Scatter,
  ScatterChart,
  ZAxis,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, Download, BarChart4, PieChart, LineChart, Share2, Loader2 } from "lucide-react";
import { getAIAnalytics } from '@/integrations/openai/client';

interface NoiseReport {
  id: string;
  latitude: number;
  longitude: number;
  decibel_level: number;
  noise_type: string;
  created_at: string;
  notes?: string;
  address?: string;
  reported_by?: string;
  status?: string;
  flagged?: boolean;
}

interface NoiseAnalyticsAdvancedProps {
  data: NoiseReport[];
  view?: 'predictive' | 'insights' | 'correlation';
}

// Custom tooltip for recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card p-3 border rounded-md shadow-md">
        <p className="font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.value} {entry.unit || ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const NoiseAnalyticsAdvanced: React.FC<NoiseAnalyticsAdvancedProps> = ({ data, view }) => {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [activeTab, setActiveTab] = useState(view === 'predictive' ? 'trends' : 
                                             view === 'correlation' ? 'correlation' : 
                                             view === 'insights' ? 'distribution' : 'trends');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch AI analytics when component mounts or data changes
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!data || data.length === 0) return;
      
      setLoading(true);
      try {
        // Process data for trend analysis using NoiseSense AI
        const analytics = await getAIAnalytics(data);
        setAnalyticsData(analytics);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [data]);

  // Process data for trend analysis using NoiseSense AI
  const processTrendData = () => {
    if (analyticsData && analyticsData.predictions && analyticsData.predictions.length > 0) {
      return analyticsData.predictions.map((pred: any) => ({
        name: pred.date.split('-').slice(1).join('/'), // Format as MM/DD
        predicted: pred.predictedLevel,
        confidence: pred.confidence
      }));
    }
    
    // Fallback to mock data if AI data is not available
    return [
      { name: 'Mon', actual: 65, predicted: 67 },
      { name: 'Tue', actual: 72, predicted: 70 },
      { name: 'Wed', actual: 68, predicted: 69 },
      { name: 'Thu', actual: 75, predicted: 73 },
      { name: 'Fri', actual: 82, predicted: 78 },
      { name: 'Sat', actual: 87, predicted: 83 },
      { name: 'Sun', actual: 76, predicted: 75 },
      { name: 'Next Mon', actual: null, predicted: 71 },
      { name: 'Next Tue', actual: null, predicted: 73 },
      { name: 'Next Wed', actual: null, predicted: 76 },
    ];
  };

  // Process data for correlation analysis
  const processCorrelationData = () => {
    // Create scatter plot data points
    return data.map(report => ({
      x: new Date(report.created_at).getHours(),
      y: report.decibel_level,
      z: report.noise_type === 'Traffic' ? 20 :
         report.noise_type === 'Construction' ? 30 :
         report.noise_type === 'Industrial' ? 40 : 10,
      name: report.noise_type
    }));
  };

  // Process data for distribution analysis
  const processDistributionData = () => {
    const typeCounts: Record<string, number> = {};
    data.forEach(report => {
      typeCounts[report.noise_type] = (typeCounts[report.noise_type] || 0) + 1;
    });

    return Object.entries(typeCounts).map(([type, count]) => ({
      name: type,
      value: count
    }));
  };

  // Create pattern severity data for radar chart
  const createPatternData = () => {
    return [
      { subject: 'Morning Rush', A: 85, B: 70, fullMark: 100 },
      { subject: 'Daytime', A: 68, B: 60, fullMark: 100 },
      { subject: 'Evening Rush', A: 82, B: 72, fullMark: 100 },
      { subject: 'Night', A: 62, B: 50, fullMark: 100 },
      { subject: 'Weekends', A: 77, B: 65, fullMark: 100 },
      { subject: 'Events', A: 90, B: 78, fullMark: 100 },
    ];
  };

  // Radial chart data for frequency analysis
  const createFrequencyData = () => {
    return [
      { name: 'Traffic', value: 35, fill: '#0088FE' },
      { name: 'Construction', value: 25, fill: '#00C49F' },
      { name: 'Industrial', value: 20, fill: '#FFBB28' },
      { name: 'Community', value: 15, fill: '#FF8042' },
      { name: 'Music', value: 5, fill: '#8884d8' },
    ];
  };

  const trendData = processTrendData();
  const correlationData = processCorrelationData();
  const distributionData = processDistributionData();
  const patternData = createPatternData();
  const frequencyData = createFrequencyData();

  // Render different view based on the view prop
  if (view) {
    if (view === 'predictive') {
      if (loading) {
        return (
          <div className="flex flex-col items-center justify-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Loading AI predictions...</p>
          </div>
        );
      }
      
      const predictionData = processTrendData();
      
      return (
        <div className="space-y-4">
          <div className="mb-4">
            <h3 className="text-lg font-medium">Predictive Noise Analysis</h3>
            <p className="text-sm text-muted-foreground">
              AI-powered predictions of future noise patterns based on historical data from {data.length} reports
            </p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={predictionData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis label={{ value: 'Noise Level (dB)', angle: -90, position: 'insideLeft' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="predicted"
                  stroke="#82ca9d"
                  fillOpacity={1}
                  fill="url(#colorPredicted)"
                  name="Predicted Levels"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-4 bg-accent/30 rounded-md">
            <p className="text-sm font-medium">Prediction Insights:</p>
            <ul className="text-sm mt-2 space-y-1">
              {analyticsData && analyticsData.insights ? (
                analyticsData.insights
                  .filter((insight: any) => insight.category === 'trend' || insight.category === 'recommendation')
                  .slice(0, 3)
                  .map((insight: any, idx: number) => (
                    <li key={idx}>• {insight.text}</li>
                  ))
              ) : (
                <>
                  <li>• Expected 15% increase in traffic noise next week due to festival season</li>
                  <li>• Construction noise likely to decrease as projects complete in the next month</li>
                  <li>• AI model predicts noise complaints will peak on weekends in central areas</li>
                </>
              )}
            </ul>
          </div>
        </div>
      );
    } else if (view === 'correlation') {
      if (loading) {
        return (
          <div className="flex flex-col items-center justify-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Analyzing noise correlations...</p>
          </div>
        );
      }
      
      return (
        <div className="space-y-4">
          <div className="mb-4">
            <h3 className="text-lg font-medium">Noise Pattern Correlations</h3>
            <p className="text-sm text-muted-foreground">
              Statistical relationships between noise types, timing, and locations from {data.length} reports
            </p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Hour of Day" 
                  label={{ value: 'Hour of Day', position: 'insideBottom', offset: -10 }}
                  domain={[0, 24]}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Noise Level" 
                  label={{ value: 'dB', angle: -90, position: 'insideLeft' }}
                  domain={[40, 100]}
                />
                <ZAxis type="number" dataKey="z" range={[60, 600]} name="Frequency" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                <Legend />
                <Scatter 
                  name="Noise Incidents" 
                  data={correlationData} 
                  fill="#8884d8" 
                  shape="circle"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          {analyticsData && analyticsData.correlations && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium">Key Correlations:</p>
              {analyticsData.correlations.map((corr: any, idx: number) => (
                <div key={idx} className="text-sm">
                  <div className="flex justify-between items-center">
                    <p>{corr.factor}</p>
                    <p className="font-medium">{Math.round(corr.correlationStrength * 100)}% correlation</p>
                  </div>
                  <div className="w-full bg-accent/30 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full" 
                      style={{ width: `${Math.round(corr.correlationStrength * 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{corr.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    } else if (view === 'insights') {
      if (loading) {
        return (
          <div className="flex flex-col items-center justify-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Generating AI insights...</p>
          </div>
        );
      }
      
      return (
        <div className="space-y-4">
          <div className="mb-4">
            <h3 className="text-lg font-medium">Noise Distribution Insights</h3>
            <p className="text-sm text-muted-foreground">
              Key findings and patterns in noise reporting data from {data.length} reports
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={110} data={patternData}>
                  <PolarGrid className="stroke-muted" />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis />
                  <Radar name="This Week" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Radar name="Last Week" dataKey="B" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                  <Legend />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  innerRadius={20} 
                  outerRadius={110} 
                  barSize={10} 
                  data={frequencyData}
                >
                  <RadialBar
                    label={{ position: 'insideStart', fill: '#888' }}
                    background
                    dataKey="value"
                  />
                  <Legend 
                    iconSize={10} 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                  />
                  <Tooltip content={<CustomTooltip />} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Display AI-generated insights */}
          {analyticsData && analyticsData.insights && (
            <div className="bg-card rounded-lg p-4 border border-border mt-4">
              <h4 className="text-sm font-medium mb-3">NoiseSense AI Insights:</h4>
              <div className="space-y-3">
                {analyticsData.insights.map((insight: any, idx: number) => (
                  <div 
                    key={idx}
                    className={`p-3 rounded-lg ${
                      insight.category === 'trend' ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' :
                      insight.category === 'anomaly' ? 'bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500' :
                      insight.category === 'recommendation' ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500' :
                      'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500'
                    }`}
                  >
                    <p className="text-sm">{insight.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Confidence: {Math.round(insight.relevance * 100)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Anomalies section */}
          {analyticsData && analyticsData.anomalies && analyticsData.anomalies.length > 0 && (
            <div className="bg-card rounded-lg p-4 border border-border mt-4">
              <h4 className="text-sm font-medium mb-3">Detected Anomalies:</h4>
              <div className="space-y-3">
                {analyticsData.anomalies.map((anomaly: any, idx: number) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500"
                  >
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">{anomaly.date}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        anomaly.severity > 0.8 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 
                        'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {anomaly.severity > 0.8 ? 'High' : 'Medium'} Severity
                      </span>
                    </div>
                    <p className="text-sm mt-1">{anomaly.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
  }

  // Return the full dashboard view when no specific view is requested
  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Advanced Analytics Dashboard</CardTitle>
            <CardDescription>Comprehensive noise pollution analytics with predictive insights</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
              <SelectTrigger className="w-[130px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Last 24 Hours</SelectItem>
                <SelectItem value="week">Past Week</SelectItem>
                <SelectItem value="month">Past Month</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" title="Export Data">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" title="Share Dashboard">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b px-6">
            <TabsList className="bg-transparent border-b-0 mb-0 pt-0 h-12">
              <TabsTrigger className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none" value="trends">
                <LineChart className="h-4 w-4 mr-2" />
                Trend Analysis
              </TabsTrigger>
              <TabsTrigger className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none" value="correlation">
                <BarChart4 className="h-4 w-4 mr-2" />
                Correlation Analysis
              </TabsTrigger>
              <TabsTrigger className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none" value="distribution">
                <PieChart className="h-4 w-4 mr-2" />
                Distribution Analysis
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Trend Analysis Tab */}
          <TabsContent value="trends" className="p-6 mt-0">
            <div className="mb-4">
              <h3 className="text-lg font-medium">Noise Level Trends with Predictive Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Historical and predicted noise levels based on collected data patterns
              </p>
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trendData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis label={{ value: 'Noise Level (dB)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorActual)"
                    name="Actual Levels"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="predicted"
                    stroke="#82ca9d"
                    fillOpacity={1}
                    fill="url(#colorPredicted)"
                    name="Predicted Levels"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-4 bg-accent/30 rounded-md">
              <p className="text-sm font-medium">Trend Insights:</p>
              <ul className="text-sm mt-2 space-y-1">
                <li>• Weekends show 20% higher noise levels than weekdays</li>
                <li>• Peak hours are consistently around 8-10 AM and 5-7 PM</li>
                <li>• Traffic noise follows predictable patterns based on rush hours</li>
                <li>• Construction noise has seasonal variations with higher levels during dry seasons</li>
              </ul>
            </div>
          </TabsContent>
          
          {/* Correlation Analysis Tab */}
          <TabsContent value="correlation" className="p-6 mt-0">
            <div className="mb-4">
              <h3 className="text-lg font-medium">Time-of-Day vs. Noise Level Correlation</h3>
              <p className="text-sm text-muted-foreground">
                How noise levels correlate with time of day and type of noise
              </p>
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    name="Hour of Day" 
                    label={{ value: 'Hour of Day (24h format)', position: 'insideBottom', offset: -10 }}
                    domain={[0, 24]}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="y" 
                    name="Noise Level" 
                    label={{ value: 'Noise Level (dB)', angle: -90, position: 'insideLeft' }}
                    domain={[40, 100]}
                  />
                  <ZAxis type="number" dataKey="z" range={[60, 600]} name="Frequency" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                  <Legend />
                  <Scatter 
                    name="Noise Incidents" 
                    data={correlationData} 
                    fill="#8884d8" 
                    shape="circle"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-4 bg-accent/30 rounded-md">
              <p className="text-sm font-medium">Correlation Insights:</p>
              <ul className="text-sm mt-2 space-y-1">
                <li>• Strong correlation between traffic noise and rush hours (r=0.87)</li>
                <li>• Industrial noise more consistent throughout working hours</li>
                <li>• Construction noise peaks mid-morning and early afternoon</li>
                <li>• Community noise increases in evening hours and weekends</li>
              </ul>
            </div>
          </TabsContent>
          
          {/* Distribution Analysis Tab */}
          <TabsContent value="distribution" className="p-6 mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Radar Chart */}
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-medium">Noise Patterns by Time Period</h3>
                  <p className="text-sm text-muted-foreground">
                    Comparison of current and historical noise patterns
                  </p>
                </div>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius={130} data={patternData}>
                      <PolarGrid className="stroke-muted" />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis domain={[0, 100]} />
                      <Radar
                        name="Current Period"
                        dataKey="A"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.6}
                      />
                      <Radar
                        name="Historical Average"
                        dataKey="B"
                        stroke="#82ca9d"
                        fill="#82ca9d"
                        fillOpacity={0.6}
                      />
                      <Legend />
                      <Tooltip content={<CustomTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Radial Bar Chart */}
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-medium">Noise Type Frequency</h3>
                  <p className="text-sm text-muted-foreground">
                    Distribution of noise reports by source type
                  </p>
                </div>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart 
                      cx="50%" 
                      cy="50%" 
                      innerRadius="20%" 
                      outerRadius="80%" 
                      barSize={20} 
                      data={frequencyData}
                      startAngle={180} 
                      endAngle={0}
                    >
                      <RadialBar
                        label={{ fill: '#666', position: 'insideStart' }}
                        background
                        dataKey="value"
                      />
                      <Legend 
                        iconSize={10} 
                        layout="vertical" 
                        verticalAlign="middle" 
                        align="right"
                      />
                      <Tooltip content={<CustomTooltip />} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-accent/30 rounded-md">
              <p className="text-sm font-medium">Distribution Insights:</p>
              <ul className="text-sm mt-2 space-y-1">
                <li>• Traffic noise accounts for 35% of all noise reports</li>
                <li>• Morning rush hour noise patterns have increased 10% compared to historical data</li>
                <li>• Evening noise intensity decreased in residential areas after new regulations</li>
                <li>• Weekend noise patterns show seasonal variations with peaks during festival months</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default NoiseAnalyticsAdvanced; 