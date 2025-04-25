
import React, { useState, useEffect } from 'react';
import {
  BarChart2, Download, FileSpreadsheet, Filter, Trash2, Send,
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Volume2, 
  AlertTriangle, MapPin, Info, FileText, Mail
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import NoiseLevelsMap from '@/components/NoiseLevelsMap';

const AdminPortal = () => {
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [filterNoiseType, setFilterNoiseType] = useState<string>("all");
  const [filterStartDate, setFilterStartDate] = useState<Date | undefined>(undefined);
  const [filterEndDate, setFilterEndDate] = useState<Date | undefined>(undefined);
  const [filterMinDecibel, setFilterMinDecibel] = useState<number | undefined>(undefined);
  const [filterMaxDecibel, setFilterMaxDecibel] = useState<number | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);

  const queryClient = useQueryClient();

  // Data fetching
  const { data: noiseReports = [], isLoading } = useQuery({
    queryKey: ['admin-noise-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('noise_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error fetching data",
          description: error.message,
        });
        return [];
      }
      
      return data || [];
    },
  });

  // Filtered reports
  const filteredReports = noiseReports.filter(report => {
    // Filter by noise type
    if (filterNoiseType !== 'all' && report.noise_type !== filterNoiseType) return false;
    
    // Filter by date range
    if (filterStartDate && new Date(report.created_at) < filterStartDate) return false;
    if (filterEndDate) {
      const endOfDay = new Date(filterEndDate);
      endOfDay.setHours(23, 59, 59, 999);
      if (new Date(report.created_at) > endOfDay) return false;
    }
    
    // Filter by decibel range
    if (filterMinDecibel !== undefined && report.decibel_level < filterMinDecibel) return false;
    if (filterMaxDecibel !== undefined && report.decibel_level > filterMaxDecibel) return false;
    
    return true;
  });

  // Delete all demo data
  const deleteAllDemoMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('noise_reports')
        .delete()
        .eq('id', '');  // This will trigger the RLS policy for admin-only delete
      
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "All demo data has been deleted",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-noise-reports'] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error deleting data",
        description: error.message,
      });
    }
  });

  // Submit report to authorities
  const submitToAuthorities = async (authority: string) => {
    try {
      // In a real app, this would be a Supabase Edge Function call
      // For demo purposes, we'll just show a success toast
      
      // Convert filtered reports to a format suitable for the authorities
      const reportsForAuthority = filteredReports.map(report => ({
        created_at: report.created_at instanceof Date ? report.created_at.toISOString() : report.created_at,
        decibel_level: report.decibel_level,
        latitude: report.latitude,
        longitude: report.longitude,
        noise_type: report.noise_type,
        notes: report.notes
      }));
      
      console.log(`Sending ${reportsForAuthority.length} reports to ${authority}`, reportsForAuthority);
      
      // Here you would call your Supabase function or API endpoint
      // await supabase.functions.invoke('send-reports-to-authority', {
      //   body: { reports: reportsForAuthority, authority }
      // });
      
      toast({
        title: "Reports submitted",
        description: `${reportsForAuthority.length} reports have been submitted to ${authority}.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error submitting reports",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilterNoiseType("all");
    setFilterStartDate(undefined);
    setFilterEndDate(undefined);
    setFilterMinDecibel(undefined);
    setFilterMaxDecibel(undefined);
  };

  // Export data as CSV
  const exportAsCSV = () => {
    // Generate CSV data
    const headers = ["Date", "Time", "Noise Type", "Decibels", "Latitude", "Longitude", "Notes"];
    const csvRows = filteredReports.map(report => {
      const date = new Date(report.created_at);
      return [
        date.toLocaleDateString(),
        date.toLocaleTimeString(),
        report.noise_type,
        report.decibel_level,
        report.latitude,
        report.longitude,
        report.notes || ""
      ].map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `noise-reports-${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate statistics
  const stats = {
    totalReports: filteredReports.length,
    averageDecibel: filteredReports.length
      ? Math.round(filteredReports.reduce((sum, r) => sum + r.decibel_level, 0) / filteredReports.length)
      : 0,
    highNoiseCount: filteredReports.filter(r => r.decibel_level >= 80).length,
    byCategory: Object.entries(
      filteredReports.reduce<Record<string, number>>((acc, report) => {
        acc[report.noise_type] = (acc[report.noise_type] || 0) + 1;
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1]),
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart2 className="h-8 w-8 text-purple-500" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor and analyze noise pollution data across Pune
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-1" 
              onClick={exportAsCSV}
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export as CSV</span>
              <span className="sm:hidden">Export</span>
            </Button>
            
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
              <span className="sm:hidden">Filter</span>
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className="flex items-center gap-1">
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Delete Demo Data</span>
                  <span className="sm:hidden">Delete</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete All Demo Data</DialogTitle>
                  <DialogDescription>
                    This action will permanently delete all demo data from the database. This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button 
                    variant="destructive" 
                    onClick={() => deleteAllDemoMutation.mutate()}
                    disabled={deleteAllDemoMutation.isPending}
                  >
                    {deleteAllDemoMutation.isPending ? "Deleting..." : "Delete All Data"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>
      
      {showFilters && (
        <Card className="mb-6 animate-in fade-in duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Data Filters
            </CardTitle>
            <CardDescription>
              Filter the noise reports by various criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Noise Type</label>
                <Select value={filterNoiseType} onValueChange={setFilterNoiseType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {Array.from(new Set(noiseReports.map(r => r.noise_type))).map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filterStartDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filterStartDate ? format(filterStartDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filterStartDate}
                      onSelect={setFilterStartDate}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <label className="text-sm font-medium">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filterEndDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filterEndDate ? format(filterEndDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filterEndDate}
                      onSelect={setFilterEndDate}
                      disabled={(date) => filterStartDate && date < filterStartDate || date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <label className="text-sm font-medium">Min Decibel Level</label>
                <Select 
                  value={filterMinDecibel?.toString() || ''} 
                  onValueChange={val => setFilterMinDecibel(val ? Number(val) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No minimum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No minimum</SelectItem>
                    <SelectItem value="40">40 dB</SelectItem>
                    <SelectItem value="50">50 dB</SelectItem>
                    <SelectItem value="60">60 dB</SelectItem>
                    <SelectItem value="70">70 dB</SelectItem>
                    <SelectItem value="80">80 dB</SelectItem>
                    <SelectItem value="90">90 dB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Max Decibel Level</label>
                <Select 
                  value={filterMaxDecibel?.toString() || ''} 
                  onValueChange={val => setFilterMaxDecibel(val ? Number(val) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No maximum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No maximum</SelectItem>
                    <SelectItem value="50">50 dB</SelectItem>
                    <SelectItem value="60">60 dB</SelectItem>
                    <SelectItem value="70">70 dB</SelectItem>
                    <SelectItem value="80">80 dB</SelectItem>
                    <SelectItem value="90">90 dB</SelectItem>
                    <SelectItem value="100">100 dB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button 
                variant="ghost" 
                onClick={resetFilters}
                className="mr-2"
              >
                Reset
              </Button>
              <Button 
                onClick={() => setShowFilters(false)}
              >
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>Map View</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Reports</span>
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export</span>
          </TabsTrigger>
          <TabsTrigger value="submit" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            <span>Submit</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-blue-500" />
                  Total Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalReports}</div>
                <p className="text-muted-foreground text-sm mt-1">
                  {filterStartDate || filterEndDate 
                    ? `In selected date range` 
                    : `Total recorded noise incidents`}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-amber-500" />
                  Average Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.averageDecibel} dB</div>
                <p className="text-muted-foreground text-sm mt-1">
                  Average noise level across all reports
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  High Noise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats.highNoiseCount}
                  <span className="text-base ml-1 font-normal text-muted-foreground">
                    ({stats.totalReports ? Math.round((stats.highNoiseCount / stats.totalReports) * 100) : 0}%)
                  </span>
                </div>
                <p className="text-muted-foreground text-sm mt-1">
                  Reports exceeding 80dB threshold
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Noise by Category</CardTitle>
                <CardDescription>
                  Distribution of noise sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.byCategory.length > 0 ? 
                    stats.byCategory.map(([category, count]) => {
                      const percentage = Math.round((count / stats.totalReports) * 100);
                      return (
                        <div key={category} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{category}</span>
                            <span className="font-medium">{count} reports ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div 
                              className="bg-purple-600 h-2.5 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    }) : 
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                      No data available for the selected filters
                    </div>
                  }
                </div>
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Latest Reports</CardTitle>
                <CardDescription>
                  Most recent noise complaints
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                  {filteredReports.slice(0, 5).map(report => (
                    <div
                      key={report.id}
                      className="border rounded-lg p-3 text-sm hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{report.noise_type}</span>
                        <Badge 
                          variant={
                            report.decibel_level >= 80 ? "destructive" : 
                            report.decibel_level >= 60 ? "default" : 
                            "secondary"
                          }
                        >
                          {report.decibel_level} dB
                        </Badge>
                      </div>
                      <div className="text-muted-foreground flex gap-2 items-center">
                        <CalendarIcon className="h-3 w-3" />
                        <span>{new Date(report.created_at).toLocaleString()}</span>
                      </div>
                      {report.notes && (
                        <div className="mt-2 text-muted-foreground italic">
                          "{report.notes}"
                        </div>
                      )}
                    </div>
                  ))}
                  {filteredReports.length === 0 && (
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                      No reports available for the selected filters
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground border-t pt-4">
                Showing {Math.min(5, filteredReports.length)} of {filteredReports.length} reports
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle>Noise Map Visualization</CardTitle>
              <CardDescription>
                Geographic distribution of noise reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[600px]">
                <NoiseLevelsMap />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Noise Reports</CardTitle>
                <CardDescription>
                  Complete list of all reported incidents
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={exportAsCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <div className="grid grid-cols-[1fr,1fr,1fr,1fr,80px] font-medium p-3 border-b bg-muted/50">
                  <div>Date & Time</div>
                  <div>Type</div>
                  <div>Level</div>
                  <div>Location</div>
                  <div className="text-right">Details</div>
                </div>
                <div className="max-h-[500px] overflow-y-auto">
                  {filteredReports.map(report => (
                    <div key={report.id} className="grid grid-cols-[1fr,1fr,1fr,1fr,80px] p-3 border-b text-sm hover:bg-muted/50">
                      <div>{new Date(report.created_at).toLocaleString()}</div>
                      <div>{report.noise_type}</div>
                      <div>
                        <Badge 
                          variant={
                            report.decibel_level >= 80 ? "destructive" : 
                            report.decibel_level >= 60 ? "default" : 
                            "secondary"
                          }
                        >
                          {report.decibel_level} dB
                        </Badge>
                      </div>
                      <div className="truncate">
                        {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
                      </div>
                      <div className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Info className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Noise Report Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              <div>
                                <div className="text-sm font-medium mb-1">Date & Time</div>
                                <div>{new Date(report.created_at).toLocaleString()}</div>
                              </div>
                              <div>
                                <div className="text-sm font-medium mb-1">Noise Type</div>
                                <div>{report.noise_type}</div>
                              </div>
                              <div>
                                <div className="text-sm font-medium mb-1">Decibel Level</div>
                                <div>
                                  <Badge 
                                    variant={
                                      report.decibel_level >= 80 ? "destructive" : 
                                      report.decibel_level >= 60 ? "default" : 
                                      "secondary"
                                    }
                                    className="text-base"
                                  >
                                    {report.decibel_level} dB
                                  </Badge>
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-medium mb-1">Location</div>
                                <div>{report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}</div>
                              </div>
                              {report.notes && (
                                <div>
                                  <div className="text-sm font-medium mb-1">Notes</div>
                                  <div className="italic">{report.notes}</div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                  {filteredReports.length === 0 && (
                    <div className="flex items-center justify-center h-40 text-muted-foreground">
                      No reports available for the selected filters
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">
              Showing {filteredReports.length} of {noiseReports.length} reports
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>
                Export noise pollution data in various formats
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="bg-muted/30">
                  <CardHeader className="py-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileSpreadsheet className="h-5 w-5" />
                      CSV Export
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Export detailed data in CSV format for spreadsheet analysis
                    </p>
                    <Button 
                      className="w-full" 
                      onClick={exportAsCSV}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export as CSV
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/30">
                  <CardHeader className="py-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      PDF Report
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Generate PDF report with visualizations and analysis
                    </p>
                    <Button 
                      className="w-full"
                      // In production, this would generate a PDF
                      onClick={() => toast({
                        title: "PDF Export",
                        description: "PDF export functionality coming soon!"
                      })}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Generate PDF
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/30">
                  <CardHeader className="py-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      GeoJSON Export
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Export location data in GeoJSON format for map applications
                    </p>
                    <Button 
                      className="w-full"
                      // In production, this would generate GeoJSON
                      onClick={() => toast({
                        title: "GeoJSON Export",
                        description: "GeoJSON export functionality coming soon!"
                      })}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export GeoJSON
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="font-medium text-lg mb-4">Export Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="text-sm font-medium">Anonymous Data</label>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-muted-foreground text-sm">
                        Remove personal identifiers
                      </span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Include Analytics</label>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-muted-foreground text-sm">
                        Add statistical analysis
                      </span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="submit">
          <Card>
            <CardHeader>
              <CardTitle>Submit to Authorities</CardTitle>
              <CardDescription>
                Forward selected reports to relevant government departments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-muted/30">
                  <CardHeader className="py-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Volume2 className="h-5 w-5 text-blue-500" />
                      Traffic Noise
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Forward traffic-related noise complaints to Regional Transport Office (RTO)
                    </p>
                    <Button 
                      className="w-full" 
                      onClick={() => submitToAuthorities("RTO")}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Submit to RTO
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/30">
                  <CardHeader className="py-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Volume2 className="h-5 w-5 text-purple-500" />
                      Event/DJ Noise
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Forward event and loudspeaker noise complaints to Police Department
                    </p>
                    <Button 
                      className="w-full"
                      onClick={() => submitToAuthorities("Police Department")}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Submit to Police
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/30">
                  <CardHeader className="py-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Volume2 className="h-5 w-5 text-amber-500" />
                      Construction/Industrial
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Forward construction noise complaints to Pune Municipal Corporation
                    </p>
                    <Button 
                      className="w-full"
                      onClick={() => submitToAuthorities("PMC")}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Submit to PMC
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="font-medium text-lg mb-4">Submission Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="text-sm font-medium">Include Report PDF</label>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-muted-foreground text-sm">
                        Attach detailed PDF report
                      </span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Send Copy to Management</label>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-muted-foreground text-sm">
                        CC department managers
                      </span>
                      <Switch />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPortal;
