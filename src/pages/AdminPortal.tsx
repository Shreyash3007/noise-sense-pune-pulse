
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Lock, User, BarChart2, Map, Calendar, FileDown, Loader2, Filter, Download, RefreshCw, AlertTriangle, Info, Volume2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import NoiseLevelsMap from "@/components/NoiseLevelsMap";
import { useNavigate } from "react-router-dom";

// Admin login status management
const useAdminAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const savedAuth = localStorage.getItem('adminAuth');
    return savedAuth ? JSON.parse(savedAuth) : false;
  });
  
  const navigate = useNavigate();

  const login = async (username: string, password: string) => {
    // In a real app, this would check against a database
    // For this demo, we'll use a simple check
    if (username === "admin" && password === "noise2023") {
      setIsLoggedIn(true);
      localStorage.setItem('adminAuth', JSON.stringify(true));
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('adminAuth');
    navigate('/admin');
  };
  
  return { isLoggedIn, login, logout };
};

// Login Form Component
const LoginForm = ({ onLogin }: { onLogin: (username: string, password: string) => Promise<boolean> }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const success = await onLogin(username, password);
      if (!success) {
        setError("Invalid username or password");
        toast({
          title: "Login Failed",
          description: "Please check your credentials and try again.",
          variant: "destructive"
        });
      }
    } catch (err) {
      setError("An error occurred during login");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="bg-blue-100 p-3 inline-flex rounded-full mb-4">
          <Lock className="h-8 w-8 text-blue-700" />
        </div>
        <h2 className="text-2xl font-bold">Government Admin Portal</h2>
        <p className="text-gray-600 mt-2">Sign in to access noise pollution data analytics</p>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>
      
      <Alert className="mt-6 bg-amber-50 border-amber-100">
        <Info className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800 text-sm">
          For demo purposes, use "admin" as username and "noise2023" as password.
        </AlertDescription>
      </Alert>
    </Card>
  );
};

// Admin Dashboard
const AdminDashboard = ({ onLogout }: { onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dateRange, setDateRange] = useState<"week" | "month" | "year" | "all">("month");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const { toast } = useToast();
  
  const { data: noiseData, isLoading } = useQuery({
    queryKey: ["admin-noise-data", dateRange],
    queryFn: async () => {
      // Get date range constraint
      let rangeDate = null;
      const now = new Date();
      
      if (dateRange === "week") {
        rangeDate = new Date(now);
        rangeDate.setDate(rangeDate.getDate() - 7);
      } else if (dateRange === "month") {
        rangeDate = new Date(now);
        rangeDate.setMonth(rangeDate.getMonth() - 1);
      } else if (dateRange === "year") {
        rangeDate = new Date(now);
        rangeDate.setFullYear(rangeDate.getFullYear() - 1);
      }
      
      let query = supabase.from("noise_reports").select("*");
      
      if (rangeDate) {
        query = query.gte('created_at', rangeDate.toISOString());
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });
      
      if (error) throw error;
      
      return {
        reports: data,
        stats: calculateStats(data)
      };
    },
  });
  
  // Calculate statistics from noise reports
  const calculateStats = (reports: any[]) => {
    if (!reports || !reports.length) return null;
    
    const noiseTypeCount: Record<string, number> = {};
    let totalDecibels = 0;
    let maxDecibel = 0;
    let minDecibel = Infinity;
    
    // Group by day for time series
    const dailyCounts: Record<string, { count: number, avgLevel: number }> = {};
    
    reports.forEach(report => {
      // Count by noise type
      noiseTypeCount[report.noise_type] = (noiseTypeCount[report.noise_type] || 0) + 1;
      
      // Track min/max/avg decibels
      totalDecibels += report.decibel_level;
      maxDecibel = Math.max(maxDecibel, report.decibel_level);
      minDecibel = Math.min(minDecibel, report.decibel_level);
      
      // Group by day
      const date = new Date(report.created_at).toISOString().split('T')[0];
      if (!dailyCounts[date]) {
        dailyCounts[date] = { count: 0, avgLevel: 0 };
      }
      dailyCounts[date].count += 1;
      dailyCounts[date].avgLevel += report.decibel_level;
    });
    
    // Calculate daily averages
    Object.keys(dailyCounts).forEach(date => {
      dailyCounts[date].avgLevel /= dailyCounts[date].count;
    });
    
    // Sort daily data
    const dailyData = Object.entries(dailyCounts)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    return {
      reportCount: reports.length,
      avgDecibel: Math.round(totalDecibels / reports.length),
      maxDecibel,
      minDecibel,
      noiseTypeDistribution: noiseTypeCount,
      timeSeries: dailyData
    };
  };
  
  const generateReport = () => {
    setIsGeneratingReport(true);
    
    // Simulate report generation
    setTimeout(() => {
      setIsGeneratingReport(false);
      toast({
        title: "Report Generated",
        description: "Noise pollution report has been generated and downloaded.",
      });
    }, 1500);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Portal</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-md">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Government Official</span>
          </div>
          <Button variant="outline" size="sm" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            Noise Map
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileDown className="h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Timeline
          </TabsTrigger>
        </TabsList>
        
        {/* Filter Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Filter by time period:</span>
          </div>
          <div className="flex gap-2">
            {["week", "month", "year", "all"].map((range) => (
              <Button 
                key={range}
                size="sm"
                variant={dateRange === range ? "default" : "outline"}
                onClick={() => setDateRange(range as any)}
              >
                {range === "week" ? "Past Week" :
                 range === "month" ? "Past Month" :
                 range === "year" ? "Past Year" : "All Time"}
              </Button>
            ))}
            <Button size="sm" variant="outline" className="ml-2" title="Refresh Data">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="dashboard" className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : !noiseData?.stats ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>No data available for the selected time period.</AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Reports</p>
                      <p className="text-2xl font-bold">{noiseData.stats.reportCount}</p>
                    </div>
                    <div className="bg-blue-100 p-2 rounded-full">
                      <BarChart2 className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Avg. Noise Level</p>
                      <p className="text-2xl font-bold">{noiseData.stats.avgDecibel} dB</p>
                    </div>
                    <div className="bg-amber-100 p-2 rounded-full">
                      <Volume2 className="h-5 w-5 text-amber-600" />
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 bg-gradient-to-br from-red-50 to-rose-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Max Level Recorded</p>
                      <p className="text-2xl font-bold">{noiseData.stats.maxDecibel} dB</p>
                    </div>
                    <div className="bg-red-100 p-2 rounded-full">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Min Level Recorded</p>
                      <p className="text-2xl font-bold">{noiseData.stats.minDecibel} dB</p>
                    </div>
                    <div className="bg-green-100 p-2 rounded-full">
                      <Volume2 className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-medium mb-4">Noise Sources Distribution</h3>
                  <div className="space-y-4">
                    {noiseData.stats.noiseTypeDistribution && Object.entries(noiseData.stats.noiseTypeDistribution).map(([type, count]) => {
                      const percentage = Math.round((count as number / noiseData.stats.reportCount) * 100);
                      return (
                        <div key={type} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize">{type}</span>
                            <span className="font-medium">{count} reports ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
                
                <Card className="p-6">
                  <h3 className="text-lg font-medium mb-4">Reports Timeline</h3>
                  {noiseData.stats.timeSeries && noiseData.stats.timeSeries.length > 0 ? (
                    <div className="h-64">
                      <div className="h-full relative flex items-end space-x-2">
                        {noiseData.stats.timeSeries.slice(-14).map((day: any, index: number) => {
                          const height = (day.count / Math.max(...noiseData.stats.timeSeries.map((d: any) => d.count))) * 100;
                          const dateObj = new Date(day.date);
                          const formattedDate = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
                          
                          return (
                            <div key={index} className="flex-1 flex flex-col items-center">
                              <div className="flex-1 w-full flex items-end">
                                <div 
                                  className="w-full bg-blue-500 rounded-t"
                                  style={{ height: `${height}%` }}
                                  title={`${day.count} reports, Avg: ${day.avgLevel.toFixed(1)} dB`}
                                ></div>
                              </div>
                              <div className="text-xs mt-1 text-gray-600">{formattedDate}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center h-64 text-gray-500">
                      No timeline data available for the selected period
                    </div>
                  )}
                </Card>
              </div>
              
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Hot Spots Analysis</h3>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Based on the collected noise data, we have identified the following noise pollution hot spots in Pune:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-md p-4 bg-red-50 border-red-100">
                      <h4 className="font-medium text-red-800 mb-1">Critical Zone</h4>
                      <p className="text-sm text-red-700 mb-2">Avg: 82-95 dB</p>
                      <ul className="text-sm text-red-600 list-disc pl-4 space-y-1">
                        <li>Swargate Traffic Junction</li>
                        <li>Pune Railway Station Area</li>
                        <li>Shivajinagar Bus Stand</li>
                      </ul>
                    </div>
                    
                    <div className="border rounded-md p-4 bg-amber-50 border-amber-100">
                      <h4 className="font-medium text-amber-800 mb-1">High Risk Zone</h4>
                      <p className="text-sm text-amber-700 mb-2">Avg: 70-82 dB</p>
                      <ul className="text-sm text-amber-600 list-disc pl-4 space-y-1">
                        <li>FC Road Commercial Area</li>
                        <li>Hadapsar Industrial Zone</li>
                        <li>Hinjawadi IT Park</li>
                      </ul>
                    </div>
                    
                    <div className="border rounded-md p-4 bg-yellow-50 border-yellow-100">
                      <h4 className="font-medium text-yellow-800 mb-1">Moderate Risk Zone</h4>
                      <p className="text-sm text-yellow-700 mb-2">Avg: 60-70 dB</p>
                      <ul className="text-sm text-yellow-600 list-disc pl-4 space-y-1">
                        <li>Kothrud Residential Area</li>
                        <li>Aundh Mixed Use Zone</li>
                        <li>Viman Nagar Commercial Complex</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="map">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Interactive Noise Map</h3>
            <NoiseLevelsMap />
          </Card>
        </TabsContent>
        
        <TabsContent value="reports">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Generate Reports</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-md p-4 hover:border-blue-200 hover:bg-blue-50 transition-colors cursor-pointer">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <FileDown className="h-4 w-4 text-blue-600" />
                    Noise Level Summary
                  </h4>
                  <p className="text-sm text-gray-600">Comprehensive summary of noise levels across different areas of Pune.</p>
                </div>
                
                <div className="border rounded-md p-4 hover:border-blue-200 hover:bg-blue-50 transition-colors cursor-pointer">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <FileDown className="h-4 w-4 text-blue-600" />
                    Temporal Analysis
                  </h4>
                  <p className="text-sm text-gray-600">Analysis of noise patterns across different times of day and seasons.</p>
                </div>
                
                <div className="border rounded-md p-4 hover:border-blue-200 hover:bg-blue-50 transition-colors cursor-pointer">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <FileDown className="h-4 w-4 text-blue-600" />
                    Threshold Violations
                  </h4>
                  <p className="text-sm text-gray-600">Report identifying areas exceeding regulatory noise thresholds.</p>
                </div>
                
                <div className="border rounded-md p-4 hover:border-blue-200 hover:bg-blue-50 transition-colors cursor-pointer">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <FileDown className="h-4 w-4 text-blue-600" />
                    Source Analysis
                  </h4>
                  <p className="text-sm text-gray-600">Breakdown of noise pollution by source type and location.</p>
                </div>
                
                <div className="border rounded-md p-4 hover:border-blue-200 hover:bg-blue-50 transition-colors cursor-pointer">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <FileDown className="h-4 w-4 text-blue-600" />
                    Historical Comparison
                  </h4>
                  <p className="text-sm text-gray-600">Year-over-year comparison of noise levels to track improvements.</p>
                </div>
                
                <div className="border rounded-md p-4 hover:border-blue-200 hover:bg-blue-50 transition-colors cursor-pointer">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <FileDown className="h-4 w-4 text-blue-600" />
                    Raw Data Export
                  </h4>
                  <p className="text-sm text-gray-600">Complete export of all noise measurement data in CSV format.</p>
                </div>
              </div>
              
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={generateReport}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isGeneratingReport}
                >
                  {isGeneratingReport ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Generate Selected Reports
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 mt-6">
            <h3 className="text-lg font-medium mb-4">Recent Noise Reports</h3>
            
            {isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : !noiseData?.reports?.length ? (
              <div className="text-center py-6 text-gray-500">
                No reports available for the selected time period
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-600 text-sm">Date</th>
                      <th className="px-4 py-2 text-left text-gray-600 text-sm">Location</th>
                      <th className="px-4 py-2 text-left text-gray-600 text-sm">Noise Level</th>
                      <th className="px-4 py-2 text-left text-gray-600 text-sm">Type</th>
                      <th className="px-4 py-2 text-left text-gray-600 text-sm">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {noiseData.reports.slice(0, 10).map((report: any) => (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">
                          {new Date(report.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`font-medium ${
                            report.decibel_level >= 80 ? 'text-red-600' : 
                            report.decibel_level >= 60 ? 'text-amber-600' : 
                            'text-green-600'
                          }`}>
                            {report.decibel_level} dB
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm capitalize">
                          {report.noise_type}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {report.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {noiseData.reports.length > 10 && (
                  <div className="mt-4 text-center">
                    <Button variant="outline" size="sm">
                      View All {noiseData.reports.length} Reports
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="timeline">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-6">Noise Level Timeline Analysis</h3>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : !noiseData?.stats?.timeSeries?.length ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>No timeline data available for the selected period.</AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Noise Level Trends</h4>
                  <div className="h-64 relative">
                    <div className="absolute inset-0 flex items-end space-x-1">
                      {noiseData.stats.timeSeries.map((day: any, index: number) => {
                        const height = (day.avgLevel / 100) * 100;
                        return (
                          <div 
                            key={index} 
                            className="flex-1 h-full flex flex-col justify-end group"
                          >
                            <div 
                              className={`w-full rounded-t transition-all group-hover:opacity-80 ${
                                day.avgLevel >= 80 ? 'bg-red-500' : 
                                day.avgLevel >= 60 ? 'bg-amber-500' : 
                                'bg-green-500'
                              }`}
                              style={{ height: `${Math.max(5, height)}%` }}
                              title={`${new Date(day.date).toLocaleDateString()}: ${day.avgLevel.toFixed(1)} dB`}
                            ></div>
                            
                            <div className="invisible group-hover:visible absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                              {day.avgLevel.toFixed(1)} dB
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Horizontal guidelines */}
                    <div className="absolute left-0 right-0 top-0 border-t border-dashed border-gray-300 text-xs text-gray-500" style={{ bottom: '80%' }}>
                      <span className="absolute -top-4 left-0">80 dB</span>
                    </div>
                    <div className="absolute left-0 right-0 top-0 border-t border-dashed border-gray-300 text-xs text-gray-500" style={{ bottom: '60%' }}>
                      <span className="absolute -top-4 left-0">60 dB</span>
                    </div>
                    <div className="absolute left-0 right-0 top-0 border-t border-dashed border-gray-300 text-xs text-gray-500" style={{ bottom: '40%' }}>
                      <span className="absolute -top-4 left-0">40 dB</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>{new Date(noiseData.stats.timeSeries[0].date).toLocaleDateString()}</span>
                    <span>{new Date(noiseData.stats.timeSeries[noiseData.stats.timeSeries.length - 1].date).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Time of Day Analysis</h4>
                    <p className="text-gray-600 text-sm mb-4">
                      Analysis of noise levels categorized by time of day shows distinct patterns:
                    </p>
                    <div className="space-y-4">
                      {[
                        { time: "Morning (5am-9am)", level: 72, color: "bg-amber-500" },
                        { time: "Day (9am-5pm)", level: 67, color: "bg-amber-500" },
                        { time: "Evening (5pm-10pm)", level: 74, color: "bg-amber-500" },
                        { time: "Night (10pm-5am)", level: 58, color: "bg-green-500" },
                      ].map(item => (
                        <div key={item.time} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{item.time}</span>
                            <span className="font-medium">{item.level} dB</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`${item.color} h-2.5 rounded-full`} 
                              style={{ width: `${(item.level / 100) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-white border rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Seasonal Comparison</h4>
                    <p className="text-gray-600 text-sm mb-4">
                      Comparison of noise levels across different seasons reveals important trends:
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-16 w-16 bg-blue-100 rounded-md flex items-center justify-center text-blue-700">Winter</div>
                        <div className="flex-1">
                          <div className="text-sm flex justify-between mb-1">
                            <span>Average: 64.3 dB</span>
                            <span className="text-amber-600 font-medium">Moderate</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-amber-500 h-2 rounded-full" style={{ width: '64%' }}></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="h-16 w-16 bg-green-100 rounded-md flex items-center justify-center text-green-700">Spring</div>
                        <div className="flex-1">
                          <div className="text-sm flex justify-between mb-1">
                            <span>Average: 62.7 dB</span>
                            <span className="text-amber-600 font-medium">Moderate</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-amber-500 h-2 rounded-full" style={{ width: '63%' }}></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="h-16 w-16 bg-amber-100 rounded-md flex items-center justify-center text-amber-700">Summer</div>
                        <div className="flex-1">
                          <div className="text-sm flex justify-between mb-1">
                            <span>Average: 70.1 dB</span>
                            <span className="text-amber-600 font-medium">High</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-amber-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="h-16 w-16 bg-blue-100 rounded-md flex items-center justify-center text-blue-700">Monsoon</div>
                        <div className="flex-1">
                          <div className="text-sm flex justify-between mb-1">
                            <span>Average: 68.8 dB</span>
                            <span className="text-amber-600 font-medium">High</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-amber-500 h-2 rounded-full" style={{ width: '69%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Main Admin Portal Component
const AdminPortal = () => {
  const { isLoggedIn, login, logout } = useAdminAuth();
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!isLoggedIn ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Government Admin Portal</h1>
              <p className="text-gray-600">
                Access restricted to authorized government personnel only
              </p>
            </div>
            <LoginForm onLogin={login} />
          </>
        ) : (
          <AdminDashboard onLogout={logout} />
        )}
      </div>
    </div>
  );
};

export default AdminPortal;
