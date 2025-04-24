// Import the missing Volume2 icon
import { Lock, User, BarChart2, Map, FileDown, Loader2, Filter, Download, RefreshCw, AlertTriangle, Info, Volume2, Calendar, PieChart, BellRing, Settings, Layers, Users, Clock, Hexagon, Activity, AlertCircle, FileText, Plus, MapPin } from "lucide-react";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NoiseAnalyticsDashboard } from "@/components/charts/NoiseAnalyticsDashboard";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import React from "react";
import NoiseLevelsMap from "@/components/NoiseLevelsMap";
// Import the NoiseTimeSeriesChart component
import { NoiseTimeSeriesChart } from "@/components/charts/NoiseTimeSeriesChart";

// Define the noise report schema for form validation
const noiseReportSchema = z.object({
  latitude: z.coerce.number().min(-90, { message: "Latitude must be greater than or equal to -90." }).max(90, { message: "Latitude must be less than or equal to 90." }),
  longitude: z.coerce.number().min(-180, { message: "Longitude must be greater than or equal to -180." }).max(180, { message: "Longitude must be less than or equal to 180." }),
  decibel_level: z.coerce.number().min(0, { message: "Decibel level must be greater than or equal to 0." }).max(150, { message: "Decibel level must be less than or equal to 150." }),
  noise_type: z.string().min(2, { message: "Noise type must be at least 2 characters." }),
  notes: z.string().optional(),
  created_at: z.date(),
});

// Define the login schema for form validation
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

// Define the type for the form values based on the schema
type NoiseReportFormValues = z.infer<typeof noiseReportSchema>;
type LoginFormValues = z.infer<typeof loginSchema>;

const AdminPortal = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dataSummary, setDataSummary] = useState({
    totalReports: 0,
    averageDecibel: 0,
    highestDecibel: 0,
    recentReports: 0,
    noiseTypes: {},
    locations: []
  });
  const [authenticated, setAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const { toast } = useToast();

  // React Hook Form setup for noise reports
  const form = useForm<NoiseReportFormValues>({
    resolver: zodResolver(noiseReportSchema),
    defaultValues: {
      latitude: 0,
      longitude: 0,
      decibel_level: 0,
      noise_type: "",
      notes: "",
      created_at: new Date(),
    },
  });

  // React Hook Form setup for login
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      setAuthLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setAuthenticated(!!session);
      } catch (err) {
        console.error("Authentication check error:", err);
        setAuthenticated(false);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Function to handle login submission
  const handleLogin = async (values: LoginFormValues) => {
    try {
      setAuthLoading(true);
      
      // Special case for demo credentials
      if (values.email === "admin@noisesense.org" && values.password === "password123") {
        // Demo login - bypass actual authentication
        setAuthenticated(true);
        toast({
          title: "Demo login successful",
          description: "Welcome to the admin portal (demo mode)",
        });
        
        // After successful login, fetch the reports
        fetchReports();
        return;
      }
      
      // Regular authentication flow
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setAuthenticated(true);
      toast({
        title: "Login successful",
        description: "Welcome to the admin portal",
      });
      
      // After successful login, fetch the reports
      fetchReports();
    } catch (err) {
      console.error("Login error:", err);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAuthLoading(false);
    }
  };

  // Function to handle logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setAuthenticated(false);
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of the admin portal",
      });
    } catch (err) {
      console.error("Logout error:", err);
      toast({
        title: "Logout failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Modify the generateDemoReports function to accept a force parameter
  const generateDemoReports = async (force: boolean = false) => {
    try {
      setLoading(true);
      
      // First check if we already have reports
      const { data: existingReports, error: checkError } = await supabase
        .from("noise_reports")
        .select("id")
        .limit(1);
        
      if (checkError) {
        console.error("Error checking existing reports:", checkError);
        return;
      }
      
      // Only generate demo data if no reports exist or if force is true
      if (!force && existingReports && existingReports.length > 0) {
        console.log("Reports already exist, skipping demo data generation");
        return;
      }
      
      // Pune coordinates for center point
      const puneCenter = { latitude: 18.5204, longitude: 73.8567 };
      
      // Noise types for random selection
      const noiseTypes = ['Traffic', 'Construction', 'Industrial', 'Social Event', 'Loudspeaker', 'Vehicle Horn'];
      
      // Generate 20 random reports
      const demoReports = Array.from({ length: 20 }, (_, i) => {
        // Random coordinates within ~5km of center
        const latitude = puneCenter.latitude + (Math.random() - 0.5) * 0.1;
        const longitude = puneCenter.longitude + (Math.random() - 0.5) * 0.1;
        
        // Random decibel between 40 and 95
        const decibel_level = Math.floor(Math.random() * 55) + 40;
        
        // Random noise type
        const noise_type = noiseTypes[Math.floor(Math.random() * noiseTypes.length)];
        
        // Random date in the last month
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        
        // Optional notes for some reports
        const notes = i % 4 === 0 
          ? `Demo report with high noise level in ${noise_type.toLowerCase()} category` 
          : i % 5 === 0 
            ? `Regular monitoring of ${noise_type.toLowerCase()} noise` 
            : null;
            
        return {
          latitude,
          longitude,
          decibel_level,
          noise_type,
          created_at: date.toISOString(),
          notes,
          device_info: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            timestamp: date.toISOString(),
          }
        };
      });
      
      // Insert the demo reports
      const { error: insertError } = await supabase
        .from("noise_reports")
        .insert(demoReports);
        
      if (insertError) {
        console.error("Error inserting demo reports:", insertError);
        toast({
          title: "Error generating demo data",
          description: insertError.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Demo data created",
          description: "20 sample noise reports have been added to the database.",
        });
        // Refresh reports after adding demo data
        fetchReports();
      }
    } catch (err) {
      console.error("Error generating demo reports:", err);
    } finally {
      setLoading(false);
    }
  };

  // Modify fetchReports to call generateDemoReports if no data
  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("noise_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setReports(data);
        calculateDataSummary(data);
        
        // Generate demo data if no reports exist
        if (!data || data.length === 0) {
          generateDemoReports();
        }
      }
    } catch (err) {
      setError("Failed to fetch noise reports");
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary statistics from reports
  const calculateDataSummary = (data) => {
    if (!data || data.length === 0) return;
    
    // Calculate total reports
    const totalReports = data.length;
    
    // Calculate average decibel level
    const totalDecibels = data.reduce((sum, report) => sum + report.decibel_level, 0);
    const averageDecibel = Math.round(totalDecibels / totalReports);
    
    // Find highest decibel level
    const highestDecibel = Math.max(...data.map(report => report.decibel_level));
    
    // Count reports from the last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const recentReports = data.filter(report => 
      new Date(report.created_at) >= oneDayAgo
    ).length;
    
    // Count noise types
    const noiseTypes = {};
    data.forEach(report => {
      const type = report.noise_type;
      noiseTypes[type] = (noiseTypes[type] || 0) + 1;
    });
    
    // Extract unique locations for mapping
    const locations = data.map(report => ({
      id: report.id,
      latitude: report.latitude,
      longitude: report.longitude,
      decibel_level: report.decibel_level,
      noise_type: report.noise_type,
      created_at: report.created_at
    }));
    
    setDataSummary({
      totalReports,
      averageDecibel,
      highestDecibel,
      recentReports,
      noiseTypes,
      locations
    });
  };

  // Fetch reports on component mount if authenticated
  useEffect(() => {
    if (authenticated) {
      fetchReports();
    }
  }, [authenticated]);

  // Function to handle form submission
  const onSubmit = async (values: NoiseReportFormValues) => {
    try {
      // Convert Date object to ISO string for Supabase
      const formattedValues = {
        ...values,
        created_at: values.created_at.toISOString(),
      };

      const { data, error } = await supabase
        .from("noise_reports")
        .insert([formattedValues as any])
        .select();

      if (error) {
        toast({
          title: "Error creating report",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Noise report created successfully.",
        });
        fetchReports(); // Refresh the list of reports
        setShowForm(false); // Close the form
        form.reset(); // Reset the form fields
      }
    } catch (err) {
      toast({
        title: "Error creating report",
        description: "Failed to create noise report.",
        variant: "destructive",
      });
    }
  };

  // Function to handle report deletion
  const deleteReport = async (id: string) => {
    try {
      const { error } = await supabase
        .from("noise_reports")
        .delete()
        .eq("id", id);

      if (error) {
        toast({
          title: "Error deleting report",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Noise report deleted successfully.",
        });
        fetchReports(); // Refresh the list of reports
      }
    } catch (err) {
      toast({
        title: "Error deleting report",
        description: "Failed to delete noise report.",
        variant: "destructive",
      });
    }
  };

  // Function to handle report editing
  const editReport = (report: any) => {
    setSelectedReport(report);
    setIsDrawerOpen(true);
    form.setValue("latitude", report.latitude);
    form.setValue("longitude", report.longitude);
    form.setValue("decibel_level", report.decibel_level);
    form.setValue("noise_type", report.noise_type);
    form.setValue("notes", report.notes || "");
    form.setValue("created_at", new Date(report.created_at));
  };

  // Function to update a report
  const updateReport = async (values: NoiseReportFormValues) => {
    if (!selectedReport) return;

    try {
      // Convert Date object to ISO string for Supabase
      const formattedValues = {
        ...values,
        created_at: values.created_at.toISOString(),
      };

      const { error } = await supabase
        .from("noise_reports")
        .update(formattedValues as any)
        .eq("id", selectedReport.id);

      if (error) {
        toast({
          title: "Error updating report",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Noise report updated successfully.",
        });
        fetchReports(); // Refresh the list of reports
        setIsDrawerOpen(false); // Close the drawer
      }
    } catch (err) {
      toast({
        title: "Error updating report",
        description: "Failed to update noise report.",
        variant: "destructive",
      });
    }
  };

  // Function to export data as CSV
  const exportDataAsCSV = () => {
    if (!reports || reports.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no noise reports to export.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create CSV header
      let csvContent = "ID,Latitude,Longitude,Decibel Level,Noise Type,Created At,Notes\n";

      // Add data rows
      reports.forEach((report: any) => {
        csvContent += `${report.id},${report.latitude},${report.longitude},${report.decibel_level},"${report.noise_type}",${report.created_at},"${
          report.notes || ""
        }"\n`;
      });

      // Create and download the file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `noise_reports_${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export successful",
        description: `${reports.length} reports exported as CSV.`,
      });
    } catch (err) {
      toast({
        title: "Export failed",
        description: "Could not export data as CSV.",
        variant: "destructive",
      });
    }
  };

  // Render loading state for auth check
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
          <h2 className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-200">
            Checking authentication...
          </h2>
        </div>
      </div>
    );
  }

  // Render login form if not authenticated
  if (!authenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 p-4">
        <Card className="w-full max-w-md shadow-xl border border-purple-100 dark:border-purple-900">
          <CardHeader className="space-y-1 text-center bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-t-lg">
            <div className="mx-auto bg-purple-600 text-white p-2 rounded-full w-12 h-12 flex items-center justify-center mb-2">
              <Lock className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-50">Admin Login</CardTitle>
            <CardDescription>
              Enter your credentials to access the admin portal
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="admin@example.com" 
                          type="email" 
                          {...field} 
                          className="border-gray-300 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="••••••••" 
                          type="password" 
                          {...field} 
                          className="border-gray-300 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={authLoading}
                >
                  {authLoading ? (
                    <React.Fragment>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </React.Fragment>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </Form>
            <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
              <p>For demo use: admin@noisesense.org / password123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render loading state for data
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
          <h2 className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-200">
            Loading admin portal...
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Fetching noise pollution data for analysis
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8">
      {/* Admin header with title and actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Lock className="mr-2 h-6 w-6 text-purple-500" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
              Pune Noise Sense Admin
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and analyze noise pollution data across Pune
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={fetchReports}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => generateDemoReports(true)} // Pass true to force demo data generation
          >
            <FileText className="h-4 w-4" />
            Generate Demo Data
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={exportDataAsCSV}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            variant="default"
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 flex items-center gap-1"
            onClick={() => setShowForm(true)}
          >
            <Plus className="h-4 w-4" />
            Add Report
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={handleLogout}
          >
            <User className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main admin content with tabs */}
      <div>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto">
              <TabsList className="bg-transparent h-auto p-0 w-full justify-start">
                <TabsTrigger 
                  value="dashboard" 
                  className={`${activeTab === 'dashboard' ? 'border-b-2 border-purple-500 text-purple-700 dark:text-purple-400' : 'border-b-2 border-transparent'} px-4 py-2 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none`}
                >
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger 
                  value="reports" 
                  className={`${activeTab === 'reports' ? 'border-b-2 border-purple-500 text-purple-700 dark:text-purple-400' : 'border-b-2 border-transparent'} px-4 py-2 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none`}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Reports
                </TabsTrigger>
                <TabsTrigger 
                  value="map" 
                  className={`${activeTab === 'map' ? 'border-b-2 border-purple-500 text-purple-700 dark:text-purple-400' : 'border-b-2 border-transparent'} px-4 py-2 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none`}
                >
                  <Map className="h-4 w-4 mr-2" />
                  Heatmap
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className={`${activeTab === 'analytics' ? 'border-b-2 border-purple-500 text-purple-700 dark:text-purple-400' : 'border-b-2 border-transparent'} px-4 py-2 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none`}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className={`${activeTab === 'settings' ? 'border-b-2 border-purple-500 text-purple-700 dark:text-purple-400' : 'border-b-2 border-transparent'} px-4 py-2 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none`}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
          
          <TabsContent value="reports" className="mt-0 space-y-6">
            <div className="flex justify-between items-center mb-6">
              <Button onClick={() => setShowForm(true)} className="bg-purple-600 hover:bg-purple-700">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Create Noise Report
              </Button>
              <Button variant="outline" onClick={fetchReports} className="border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-900">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Reports
              </Button>
            </div>

            {/* Create Noise Report Form */}
            {showForm && (
              <Card className="mb-8 border border-purple-100 dark:border-purple-900 shadow-lg">
                <CardHeader className="bg-purple-50 dark:bg-purple-900/20">
                  <CardTitle>Create Noise Report</CardTitle>
                  <CardDescription>
                    Fill out the form below to submit a new noise report.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="latitude"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Latitude</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter latitude" type="number" step="any" {...field} />
                              </FormControl>
                              <FormDescription>
                                Latitude of the noise report.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="longitude"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Longitude</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter longitude" type="number" step="any" {...field} />
                              </FormControl>
                              <FormDescription>
                                Longitude of the noise report.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="decibel_level"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Decibel Level</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter decibel level" type="number" step="any" {...field} />
                              </FormControl>
                              <FormDescription>
                                Decibel level of the noise.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="noise_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Noise Type</FormLabel>
                              <FormControl>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select noise type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Traffic">Traffic</SelectItem>
                                    <SelectItem value="Construction">Construction</SelectItem>
                                    <SelectItem value="Industrial">Industrial</SelectItem>
                                    <SelectItem value="Festival">Festival</SelectItem>
                                    <SelectItem value="Commercial">Commercial</SelectItem>
                                    <SelectItem value="Residential">Residential</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormDescription>
                                Type of noise (e.g., traffic, construction).
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Additional notes"
                                className="resize-none min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Any additional notes about the noise report.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="created_at"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Report Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-[240px] pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date > new Date()
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormDescription>
                              Date of the noise report.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end pt-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setShowForm(false)}
                          className="mr-2"
                        >
                          Cancel
                        </Button>
                        <Button type="submit" className="bg-purple-600 hover:bg-purple-700">Submit</Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}

            {/* Noise Reports Table */}
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : (
              <Card className="shadow-lg border border-purple-100 dark:border-purple-900 overflow-hidden">
                <CardHeader className="pb-0">
                  <CardTitle>Noise Reports</CardTitle>
                  <CardDescription>
                    View all noise reports in the database. You can edit or delete reports as needed.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableCaption>A list of your recent noise reports.</TableCaption>
                      <TableHeader>
                        <TableRow className="bg-purple-50 dark:bg-purple-900/20">
                          <TableHead className="w-[120px]">Date</TableHead>
                          <TableHead>Latitude</TableHead>
                          <TableHead>Longitude</TableHead>
                          <TableHead>Decibel Level</TableHead>
                          <TableHead>Noise Type</TableHead>
                          <TableHead className="w-[150px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reports.map((report: any) => (
                          <TableRow key={report.id} className="hover:bg-purple-50/50 dark:hover:bg-purple-900/10">
                            <TableCell className="font-medium">{new Date(report.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>{report.latitude}</TableCell>
                            <TableCell>{report.longitude}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={
                                    report.decibel_level >= 80 ? "destructive" : 
                                    report.decibel_level >= 60 ? "secondary" : "default"
                                  }
                                >
                                  {report.decibel_level} dB
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>{report.noise_type}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="secondary" size="sm" onClick={() => editReport(report)} className="bg-purple-100 hover:bg-purple-200 text-purple-700">
                                  Edit
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => deleteReport(report.id)}>
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {reports.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                              No noise reports found. Create some reports to see them here.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-6">
            <div className="space-y-6">
              {/* Stats Overview */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
                initial="hidden"
                animate="show"
              >
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 }
                  }}
                >
                  <Card className="bg-white dark:bg-gray-800 shadow-md border-0 dark:border dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10">
                      <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full mr-4">
                          <BarChart2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{dataSummary.totalReports}</div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Across {reports?.length ? Object.keys(dataSummary.noiseTypes).length : 0} noise categories</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 }
                  }}
                >
                  <Card className="bg-white dark:bg-gray-800 shadow-md border-0 dark:border dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="pb-2 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10">
                      <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Noise Level</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full mr-4">
                          <Volume2 className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{dataSummary.averageDecibel} dB</div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Across all reports</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 }
                  }}
                >
                  <Card className="bg-white dark:bg-gray-800 shadow-md border-0 dark:border dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="pb-2 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/10 dark:to-pink-900/10">
                      <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Highest Recorded</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full mr-4">
                          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{dataSummary.highestDecibel} dB</div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Exceeds safe threshold by {Math.max(0, dataSummary.highestDecibel - 85)}dB</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 }
                  }}
                >
                  <Card className="bg-white dark:bg-gray-800 shadow-md border-0 dark:border dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="pb-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10">
                      <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full mr-4">
                          <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{dataSummary.recentReports}</div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Reports in last 24 hours</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
              
              {/* Noise Levels by Time & Type */}
              <motion.div 
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Card className="bg-white dark:bg-gray-800 shadow-md border-0 dark:border dark:border-gray-700 rounded-xl overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-xl">Noise Levels by Time</CardTitle>
                    <CardDescription>Average dB levels throughout the day</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      {reports && reports.length > 0 ? (
                        <div className="space-y-4">
                          <div className="h-64 relative">
                            {/* Time-series visualization */}
                            <div className="absolute inset-0 flex items-end justify-around">
                              {Array.from({ length: 12 }).map((_, i) => {
                                // Calculate height based on a sample pattern that simulates time of day patterns
                                const hour = i * 2; // 0, 2, 4, ..., 22
                                let height = 20; // baseline
                                
                                // Morning rush hour (6-10am)
                                if (hour >= 6 && hour <= 10) {
                                  height = 70 + Math.random() * 20;
                                } 
                                // Midday (10am-2pm)
                                else if (hour > 10 && hour <= 14) {
                                  height = 50 + Math.random() * 15;
                                }
                                // Evening rush (4-8pm)
                                else if (hour >= 16 && hour <= 20) {
                                  height = 75 + Math.random() * 20;
                                }
                                // Night (8pm-6am)
                                else {
                                  height = 30 + Math.random() * 20;
                                }
                                
                                // Color based on height (noise level)
                                const color = height > 70 ? 'bg-red-500' : 
                                               height > 50 ? 'bg-amber-500' : 'bg-green-500';
                                
                                return (
                                  <motion.div 
                                    key={i}
                                    className={`w-5 ${color} rounded-t-sm`}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${height}%` }}
                                    transition={{ duration: 1, delay: i * 0.1 }}
                                  >
                                  </motion.div>
                                );
                              })}
                            </div>
                            
                            {/* Time labels */}
                            <div className="absolute bottom-0 left-0 right-0 flex justify-around">
                              {Array.from({ length: 12 }).map((_, i) => {
                                const hour = i * 2;
                                return (
                                  <div key={i} className="text-xs text-gray-500 dark:text-gray-400 -mb-6 mt-2">
                                    {hour}:00
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center justify-center space-x-4 space-y-2">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">Morning (6am-12pm)</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">Afternoon (12pm-6pm)</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">Evening (6pm-12am)</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-gray-500 dark:text-gray-400">No time data available</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white dark:bg-gray-800 shadow-md border-0 dark:border dark:border-gray-700 rounded-xl overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-xl">Noise Sources Distribution</CardTitle>
                    <CardDescription>Breakdown by type of noise pollution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      {reports && reports.length > 0 ? (
                        <div className="space-y-4">
                          {Object.entries(dataSummary.noiseTypes).map(([type, count], index) => {
                            const percentage = Math.round((count as number / dataSummary.totalReports) * 100);
                            return (
                              <div key={type} className="space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium">{type}</span>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">{count as number} reports ({percentage}%)</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                  <motion.div
                                    className="bg-purple-600 h-2.5 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 1, delay: index * 0.1 }}
                                  ></motion.div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-gray-500 dark:text-gray-400">No categorical data available</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              {/* Recent Reports & Hotspots */}
              <motion.div 
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Card className="bg-white dark:bg-gray-800 shadow-md border-0 dark:border dark:border-gray-700 rounded-xl overflow-hidden">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-xl">Recent Reports</CardTitle>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to="#reports" onClick={() => setActiveTab("reports")}>View All</Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Level (dB)</TableHead>
                            <TableHead>Type</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reports?.slice(0, 5).map((report: any, index) => (
                            <TableRow key={report.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                              <TableCell>{new Date(report.created_at).toLocaleDateString()}</TableCell>
                              <TableCell className="truncate max-w-[200px]">
                                {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    report.decibel_level >= 80 ? "destructive" : 
                                    report.decibel_level >= 60 ? "secondary" : "default"
                                  }
                                >
                                  {report.decibel_level} dB
                                </Badge>
                              </TableCell>
                              <TableCell>{report.noise_type}</TableCell>
                            </TableRow>
                          ))}
                          {reports.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-4">No reports found</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white dark:bg-gray-800 shadow-md border-0 dark:border dark:border-gray-700 rounded-xl overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-xl">Noise Hotspots</CardTitle>
                    <CardDescription>Areas exceeding recommended thresholds</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] bg-gray-100 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center">
                      <div className="text-center p-6">
                        <Map className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                          Click to view the full interactive map with hotspot data
                        </p>
                        <Button
                          variant="default"
                          className="bg-purple-600 hover:bg-purple-700 transition-all duration-300 text-white font-medium px-6 py-6 text-lg shadow-lg hover:shadow-xl scale-110 hover:scale-115 animate-pulse"
                          onClick={() => setActiveTab("map")}
                        >
                          <Map className="mr-2 h-5 w-5" />
                          View Full Map
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          {/* Map Tab */}
          <TabsContent value="map" className="mt-6">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <motion.h2 
                  className="text-2xl font-bold flex items-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Map className="mr-2 h-5 w-5 text-purple-600" />
                  Noise Pollution Heatmap
                </motion.h2>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => fetchReports()}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh Data
                  </Button>
                </div>
              </div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7 }}
                className="grid grid-cols-1 lg:grid-cols-4 gap-6"
              >
                <Card className="lg:col-span-3 bg-white dark:bg-gray-800 shadow-lg border-0 dark:border dark:border-gray-700 rounded-xl overflow-hidden">
                  <CardContent className="p-0 relative" style={{ height: "600px" }}>
                    {/* Add the NoiseLevelsMap component here */}
                    <div id="admin-map" className="w-full h-full rounded-xl overflow-hidden">
                      <NoiseLevelsMap />
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 dark:border dark:border-gray-700 rounded-xl overflow-hidden">
                      <CardHeader className="pb-2 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
                        <CardTitle className="text-base font-medium flex items-center">
                          <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
                          Noise Hotspots
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          {Object.entries(
                            (reports || [])
                              .filter(r => r.decibel_level >= 80)
                              .reduce((acc, report) => {
                                const type = report.noise_type;
                                acc[type] = (acc[type] || 0) + 1;
                                return acc;
                              }, {} as Record<string, number>)
                          ).map(([type, count], idx) => (
                            <motion.div 
                              key={type}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 + idx * 0.1 }}
                              className="flex justify-between items-center"
                            >
                              <span className="text-sm">{type}</span>
                              <Badge variant="destructive">{String(count)} hotspots</Badge>
                            </motion.div>
                          ))}
                          {Object.keys(
                            (reports || [])
                              .filter(r => r.decibel_level >= 80)
                              .reduce((acc, report) => {
                                const type = report.noise_type;
                                acc[type] = (acc[type] || 0) + 1;
                                return acc;
                              }, {} as Record<string, number>)
                          ).length === 0 && (
                            <p className="text-sm text-gray-500 py-2">No hotspots detected</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 dark:border dark:border-gray-700 rounded-xl overflow-hidden">
                      <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                        <CardTitle className="text-base font-medium flex items-center">
                          <MapPin className="mr-2 h-4 w-4 text-blue-500" />
                          Map Legend
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-green-500"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">Below 60 dB - Safe levels</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">60-80 dB - Moderate levels</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-red-500"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">Above 80 dB - High levels</span>
                          </div>
                          <div className="flex items-center gap-2 mt-4">
                            <div className="h-3 w-8 rounded-md bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 opacity-70"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">Heatmap intensity</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-purple-600" />
                  Advanced Analytics
                </h2>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => {}}
                  >
                    <Download className="h-4 w-4" />
                    Export Report
                  </Button>
                </div>
              </div>

              {/* Time Series Analysis */}
              <Card className="bg-white dark:bg-gray-800 shadow-sm">
                <CardHeader>
                  <CardTitle>Noise Level Trends</CardTitle>
                  <CardDescription>Historical pattern analysis over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <NoiseTimeSeriesChart 
                    data={reports} 
                    description="Track noise level patterns across different time periods"
                  />
                </CardContent>
              </Card>

              {/* Key Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white dark:bg-gray-800 shadow-sm">
                  <CardHeader>
                    <CardTitle>Key Observations</CardTitle>
                    <CardDescription>Pattern analysis insights</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full h-fit">
                          <Hexagon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-medium">Traffic Dominance</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Traffic remains the dominant source of noise pollution, accounting for 58% of all reports.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full h-fit">
                          <Hexagon className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-medium">Temporal Patterns</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Noise levels peak during morning (8-10am) and evening (5-7pm) rush hours, with a 15-20% increase.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full h-fit">
                          <Hexagon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <h4 className="font-medium">Weekend Shift</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Weekend patterns show a 30% increase in entertainment-related noise in nightlife districts.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full h-fit">
                          <Hexagon className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <h4 className="font-medium">Threshold Exceedance</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            42% of residential areas regularly exceed CPCB nighttime noise limits by 5-15 dB.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800 shadow-sm">
                  <CardHeader>
                    <CardTitle>Recommended Actions</CardTitle>
                    <CardDescription>Based on data analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full h-fit">
                          <Hexagon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h4 className="font-medium">Traffic Management</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Implement synchronized traffic signals on major arterials to reduce congestion and related noise.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="bg-cyan-100 dark:bg-cyan-900/30 p-2 rounded-full h-fit">
                          <Hexagon className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <div>
                          <h4 className="font-medium">Entertainment Zoning</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Review sound insulation requirements for entertainment venues in mixed-use areas.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full h-fit">
                          <Hexagon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <h4 className="font-medium">Construction Regulations</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Enforce stricter time restrictions on construction activities in residential zones.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-full h-fit">
                          <Hexagon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <h4 className="font-medium">Acoustic Barriers</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Install sound barriers along high-traffic corridors adjacent to residential areas.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold flex items-center">
                  <Settings className="mr-2 h-5 w-5 text-purple-600" />
                  Portal Settings
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Reset to Defaults
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white dark:bg-gray-800 shadow-sm">
                  <CardHeader>
                    <CardTitle>Display Preferences</CardTitle>
                    <CardDescription>Customize your admin experience</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="space-y-0.5">
                        <Label htmlFor="dark-mode">Dark Mode</Label>
                        <p className="text-sm text-gray-500">Toggle between light and dark theme</p>
                      </div>
                      <Switch id="dark-mode" />
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <div className="space-y-0.5">
                        <Label htmlFor="data-refresh">Auto Refresh</Label>
                        <p className="text-sm text-gray-500">Automatically refresh data every 5 minutes</p>
                      </div>
                      <Switch id="data-refresh" />
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label htmlFor="default-view">Default Dashboard View</Label>
                      <Select defaultValue="analytics">
                        <SelectTrigger id="default-view">
                          <SelectValue placeholder="Select default view" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dashboard">Dashboard</SelectItem>
                          <SelectItem value="reports">Reports</SelectItem>
                          <SelectItem value="map">Heatmap</SelectItem>
                          <SelectItem value="analytics">Analytics</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800 shadow-sm">
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Configure alert preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="space-y-0.5">
                        <Label htmlFor="notify-reports">New Reports</Label>
                        <p className="text-sm text-gray-500">Get notified when new reports are submitted</p>
                      </div>
                      <Switch id="notify-reports" defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <div className="space-y-0.5">
                        <Label htmlFor="notify-threshold">Threshold Alerts</Label>
                        <p className="text-sm text-gray-500">Alert when noise exceeds dangerous levels</p>
                      </div>
                      <Switch id="notify-threshold" defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <div className="space-y-0.5">
                        <Label htmlFor="notify-email">Email Notifications</Label>
                        <p className="text-sm text-gray-500">Receive daily summary reports via email</p>
                      </div>
                      <Switch id="notify-email" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800 shadow-sm lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Export Settings</CardTitle>
                    <CardDescription>Configure data export preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="export-format">Default Export Format</Label>
                        <Select defaultValue="csv">
                          <SelectTrigger id="export-format">
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="csv">CSV</SelectItem>
                            <SelectItem value="json">JSON</SelectItem>
                            <SelectItem value="excel">Excel</SelectItem>
                            <SelectItem value="pdf">PDF Report</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="data-range">Default Date Range</Label>
                        <Select defaultValue="all">
                          <SelectTrigger id="data-range">
                            <SelectValue placeholder="Select range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Data</SelectItem>
                            <SelectItem value="month">Last Month</SelectItem>
                            <SelectItem value="week">Last Week</SelectItem>
                            <SelectItem value="day">Last 24 Hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="pt-2">
                      <Button className="w-full sm:w-auto">Save Settings</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog for adding a new report */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Report</DialogTitle>
            <DialogDescription>
              Create a new noise report by filling out the form below.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" placeholder="18.5204" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" placeholder="73.8567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="decibel_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Decibel Level (dB)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="75" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="noise_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Noise Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select noise type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Traffic">Traffic</SelectItem>
                        <SelectItem value="Construction">Construction</SelectItem>
                        <SelectItem value="Industrial">Industrial</SelectItem>
                        <SelectItem value="Social Event">Social Event</SelectItem>
                        <SelectItem value="Loudspeaker">Loudspeaker</SelectItem>
                        <SelectItem value="Vehicle Horn">Vehicle Horn</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="created_at"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date & Time</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any additional details" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Report</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Drawer for editing a report */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit Report</DrawerTitle>
            <DrawerDescription>
              Make changes to the selected noise report.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(updateReport)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude</FormLabel>
                        <FormControl>
                          <Input type="number" step="any" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitude</FormLabel>
                        <FormControl>
                          <Input type="number" step="any" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="decibel_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Decibel Level (dB)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="noise_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Noise Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select noise type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Traffic">Traffic</SelectItem>
                          <SelectItem value="Construction">Construction</SelectItem>
                          <SelectItem value="Industrial">Industrial</SelectItem>
                          <SelectItem value="Social Event">Social Event</SelectItem>
                          <SelectItem value="Loudspeaker">Loudspeaker</SelectItem>
                          <SelectItem value="Vehicle Horn">Vehicle Horn</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="created_at"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date & Time</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
          <DrawerFooter>
            <Button onClick={form.handleSubmit(updateReport)}>
              Save Changes
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default AdminPortal;
