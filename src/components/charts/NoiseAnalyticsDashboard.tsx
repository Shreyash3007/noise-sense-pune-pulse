
import { NoiseBarChart } from "./NoiseBarChart";
import { NoiseHeatmapChart } from "./NoiseHeatmapChart";
import { NoisePieChart } from "./NoisePieChart";
import NoiseTimeSeriesChart from "./NoiseTimeSeriesChart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NoiseReport {
  id: string;
  latitude: number;
  longitude: number;
  decibel_level: number;
  noise_type: string;
  created_at: string;
  notes?: string;
}

interface NoiseAnalyticsDashboardProps {
  data: NoiseReport[];
  loading?: boolean;
  error?: string | null;
}

export function NoiseAnalyticsDashboard({ 
  data = [],
  loading = false,
  error = null
}: NoiseAnalyticsDashboardProps) {
  // Generate summary stats
  const generateSummaryStats = () => {
    if (data.length === 0) return null;
    
    // Calculate average decibel level
    const avgDecibel = Math.round(
      data.reduce((sum, report) => sum + report.decibel_level, 0) / data.length
    );
    
    // Find highest and lowest decibel readings
    const highestDecibel = Math.max(...data.map(report => report.decibel_level));
    const lowestDecibel = Math.min(...data.map(report => report.decibel_level));
    
    // Count reports by severity level
    const dangerousCount = data.filter(report => report.decibel_level >= 80).length;
    const highCount = data.filter(report => report.decibel_level >= 65 && report.decibel_level < 80).length;
    const moderateCount = data.filter(report => report.decibel_level >= 50 && report.decibel_level < 65).length;
    const lowCount = data.filter(report => report.decibel_level < 50).length;
    
    // Get most common noise type
    const noiseTypeCounts: Record<string, number> = {};
    data.forEach(report => {
      noiseTypeCounts[report.noise_type] = (noiseTypeCounts[report.noise_type] || 0) + 1;
    });
    
    const mostCommonNoiseType = Object.entries(noiseTypeCounts)
      .sort((a, b) => b[1] - a[1])[0][0];
    
    return {
      totalReports: data.length,
      avgDecibel,
      highestDecibel,
      lowestDecibel,
      dangerousCount,
      highCount,
      moderateCount,
      lowCount,
      mostCommonNoiseType
    };
  };

  const summaryStats = generateSummaryStats();

  // Function to export data as CSV
  const exportDataCSV = () => {
    if (data.length === 0) return;
    
    // Create CSV headers
    const headers = ["ID", "Latitude", "Longitude", "Decibel Level", "Noise Type", "Date", "Notes"];
    
    // Map data to CSV rows
    const csvRows = data.map(report => [
      report.id,
      report.latitude,
      report.longitude,
      report.decibel_level,
      report.noise_type,
      new Date(report.created_at).toISOString(),
      report.notes || ""
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...csvRows.map(row => row.join(","))
    ].join("\n");
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `noise_reports_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTitle>Error loading analytics data</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Show empty state
  if (data.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No Data Available</CardTitle>
          <CardDescription>
            There are currently no noise reports to analyze. Create some reports to see analytics.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Reports</CardDescription>
            <CardTitle className="text-2xl">{summaryStats?.totalReports}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Noise reports collected
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Noise Level</CardDescription>
            <CardTitle className="text-2xl">{summaryStats?.avgDecibel} dB</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Average decibel level across all reports
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Danger Level Reports</CardDescription>
            <CardTitle className="text-2xl">{summaryStats?.dangerousCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">80+ dB</Badge>
              <p className="text-sm text-muted-foreground">
                {Math.round((summaryStats?.dangerousCount || 0) / summaryStats?.totalReports * 100)}% of total
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Most Common Noise</CardDescription>
            <CardTitle className="text-2xl truncate">{summaryStats?.mostCommonNoiseType}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Most frequently reported noise type
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Export data button */}
      <div className="flex justify-end mb-4">
        <Button variant="outline" onClick={exportDataCSV}>
          <FileDown className="mr-2 h-4 w-4" />
          Export Report Data
        </Button>
      </div>

      {/* Charts Section with proper layout to prevent overlapping */}
      <div className="space-y-8">
        {/* Time Series Chart - Full Width */}
        <div className="w-full">
          <NoiseTimeSeriesChart 
            data={data.map(report => ({
              time: new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              avgLevel: report.decibel_level,
              maxLevel: report.decibel_level + 5, // Simulated max level
              minLevel: Math.max(report.decibel_level - 10, 0), // Simulated min level
              range: 10,
              count: 1,
              primaryNoiseType: report.noise_type
            }))}
            title="Noise Level Trends" 
            description="Historical pattern analysis of noise levels over time"
          />
        </div>

        {/* Two Column Charts with proper spacing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-[400px]">
            <NoisePieChart data={data} title="Noise Distribution" />
          </div>
          <div className="h-[400px]">
            <NoiseBarChart data={data} title="Noise Levels Analysis" />
          </div>
        </div>
        
        {/* Heatmap - Full Width */}
        <div className="w-full mt-8">
          <NoiseHeatmapChart 
            data={data} 
            title="Noise Time Distribution" 
            description="Heatmap showing noise levels by hour and day of the week"
          />
        </div>
      </div>
      
      {/* Additional statistics */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Noise Level Distribution</CardTitle>
          <CardDescription>Breakdown of noise reports by intensity level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Badge variant="destructive" className="mr-2">Dangerous</Badge>
                  <span className="text-sm">80+ dB</span>
                </div>
                <span className="text-sm font-medium">{summaryStats?.dangerousCount} reports ({Math.round((summaryStats?.dangerousCount || 0) / summaryStats?.totalReports * 100)}%)</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 rounded-full" 
                  style={{ width: `${(summaryStats?.dangerousCount || 0) / summaryStats?.totalReports * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Badge variant="outline" className="bg-orange-100 text-orange-600 hover:bg-orange-200 border-orange-200 mr-2">High</Badge>
                  <span className="text-sm">65-80 dB</span>
                </div>
                <span className="text-sm font-medium">{summaryStats?.highCount} reports ({Math.round((summaryStats?.highCount || 0) / summaryStats?.totalReports * 100)}%)</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500 rounded-full" 
                  style={{ width: `${(summaryStats?.highCount || 0) / summaryStats?.totalReports * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-600 hover:bg-yellow-200 border-yellow-200 mr-2">Moderate</Badge>
                  <span className="text-sm">50-65 dB</span>
                </div>
                <span className="text-sm font-medium">{summaryStats?.moderateCount} reports ({Math.round((summaryStats?.moderateCount || 0) / summaryStats?.totalReports * 100)}%)</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-500 rounded-full" 
                  style={{ width: `${(summaryStats?.moderateCount || 0) / summaryStats?.totalReports * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Badge variant="outline" className="bg-green-100 text-green-600 hover:bg-green-200 border-green-200 mr-2">Low</Badge>
                  <span className="text-sm">0-50 dB</span>
                </div>
                <span className="text-sm font-medium">{summaryStats?.lowCount} reports ({Math.round((summaryStats?.lowCount || 0) / summaryStats?.totalReports * 100)}%)</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full" 
                  style={{ width: `${(summaryStats?.lowCount || 0) / summaryStats?.totalReports * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
