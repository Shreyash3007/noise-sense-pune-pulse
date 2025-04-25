import React, { useState, useEffect, useRef } from 'react';
import { motion } from "framer-motion";
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  BarChart2,
  Bell,
  FileText,
  HelpCircle,
  Settings,
  User,
  Users,
  Volume2,
  X,
  PieChart,
  Map,
  LogOut,
  TrendingUpIcon,
  RocketIcon,
  LightbulbIcon,
  ActivityIcon,
  EyeIcon,
  MoreHorizontalIcon,
  Brain,
  AlertTriangleIcon,
  Share2,
  SearchIcon,
  ChevronDown,
  Download,
  Filter,
  Mail,
  Send,
  MapIcon,
  Clock
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { NoiseBarChart } from "@/components/charts/NoiseBarChart";
import { NoisePieChart } from "@/components/charts/NoisePieChart";
import { NoiseAnalyticsDashboard } from "@/components/charts/NoiseAnalyticsDashboard";
import { useMediaQuery } from "@/hooks/use-mobile";
import NoiseTimeSeriesChart from "@/components/charts/NoiseTimeSeriesChart";
import { NoiseHeatmapChart } from "@/components/charts/NoiseHeatmapChart";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from 'react-router-dom';
import { NoiseAnalyticsAdvanced } from "@/components/charts/NoiseAnalyticsAdvanced";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { getDeepSeekAnalytics, getDeepSeekRecommendations, chatWithDeepSeek } from '@/integrations/deepseek/client';
import ReactMarkdown from 'react-markdown';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { NoiseLevelsMap } from "@/components/NoiseLevelsMap";

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

// Add a new interface for noise level breakdown by classification
interface NoiseStatsByCategory {
  category: string;
  count: number;
  percentage: number;
  color: string;
}

const AdminPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState("visualAnalytics");
  const [noiseReports, setNoiseReports] = useState<NoiseReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<NoiseReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<"csv" | "json" | "pdf">("csv");
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [reportFilter, setReportFilter] = useState<string>("all");
  const [currentReportTab, setCurrentReportTab] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<NoiseReport | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportsPerPage, setReportsPerPage] = useState(7);
  const [paginatedReports, setPaginatedReports] = useState<NoiseReport[]>([]);
  const navigate = useNavigate();
  const [aiRecommendations, setAiRecommendations] = useState<string>("");
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [deepseekQuery, setDeepseekQuery] = useState<string>("");
  const [isDeepseekSearching, setIsDeepseekSearching] = useState<boolean>(false);
  const [deepseekSearchResults, setDeepseekSearchResults] = useState<NoiseReport[]>([]);
  const [deepseekExplanation, setDeepseekExplanation] = useState<string>("");
  const [showDeepseekSearch, setShowDeepseekSearch] = useState<boolean>(false);
  const [showReportGenerator, setShowReportGenerator] = useState<boolean>(false);
  const [reportType, setReportType] = useState<"summary" | "detailed" | "custom">("summary");
  const [reportFilters, setReportFilters] = useState<{
    dateRange: DateRange | undefined;
    noiseTypes: string[];
    minDecibel: number;
    maxDecibel: number;
    statuses: string[];
    includeCharts: boolean;
  }>({
    dateRange: undefined,
    noiseTypes: [],
    minDecibel: 0,
    maxDecibel: 120,
    statuses: [],
    includeCharts: true
  });
  const [reportData, setReportData] = useState<NoiseReport[]>([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [showForwardDialog, setShowForwardDialog] = useState<boolean>(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [departmentReports, setDepartmentReports] = useState<{[key: string]: NoiseReport[]}>({});
  const [forwardingReport, setForwardingReport] = useState<boolean>(false);

  // Check authentication
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAdminAuthenticated") === "true";
    if (!isAuthenticated) {
      navigate("/admin/login");
    }
  }, [navigate]);

  // Fetch mock data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Import and use the generatePuneNoiseData function
        const { generatePuneNoiseData } = await import('@/lib/mock-data');
        const mockData: NoiseReport[] = generatePuneNoiseData(500);
        
        setNoiseReports(mockData);
        setLoading(false);
        
        // After fetching reports data, load AI insights
        loadAiInsights(mockData);
      } catch (err) {
        setError("Failed to load noise reports data");
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter reports based on status and search term
  useEffect(() => {
    if (noiseReports.length === 0) {
      setFilteredReports([]);
      return;
    }

    let filtered = [...noiseReports];
    
    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(report => report.status === statusFilter);
    }
    
    // Filter by search term
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(report => 
        report.id.toLowerCase().includes(term) ||
        report.noise_type.toLowerCase().includes(term) ||
        report.address?.toLowerCase().includes(term) ||
        (report.notes && report.notes.toLowerCase().includes(term))
      );
    }
    
    setFilteredReports(filtered);
    // Reset pagination to first page when filters change
    setCurrentPage(1);
  }, [noiseReports, statusFilter, searchTerm]);
  
  // Apply pagination
  useEffect(() => {
    if (filteredReports.length === 0) {
      setPaginatedReports([]);
      return;
    }
    
    const startIndex = (currentPage - 1) * reportsPerPage;
    const endIndex = startIndex + reportsPerPage;
    const paginatedResults = filteredReports.slice(startIndex, endIndex);
    
    setPaginatedReports(paginatedResults);
  }, [filteredReports, currentPage, reportsPerPage]);
  
  // Pagination controls
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);
  
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };
  
  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // Handle status change
  const handleStatusChange = (id: string, newStatus: string) => {
    setNoiseReports(
      noiseReports.map((report) =>
        report.id === id ? { ...report, status: newStatus } : report
      )
    );
    toast({
      title: "Status Updated",
      description: `Report #${id} marked as ${newStatus}`,
    });
  };

  // Handle flag toggle
  const handleFlagToggle = (id: string) => {
    setNoiseReports(
      noiseReports.map((report) =>
        report.id === id ? { ...report, flagged: !report.flagged } : report
      )
    );
    const report = noiseReports.find((r) => r.id === id);
    toast({
      title: report?.flagged ? "Flag Removed" : "Report Flagged",
      description: `Report #${id} has been ${
        report?.flagged ? "unflagged" : "flagged"
      }`,
    });
  };

  // Calculate summary stats
  const getSummaryStats = () => {
    if (noiseReports.length === 0) return null;
    
    const avgDecibel = Math.round(
      noiseReports.reduce((sum, report) => sum + report.decibel_level, 0) / noiseReports.length
    );
    
    const dangerousCount = noiseReports.filter(report => report.decibel_level >= 80).length;
    const flaggedCount = noiseReports.filter(report => report.flagged).length;
    
    // Count by noise type
    const noiseTypeCounts: Record<string, number> = {};
    noiseReports.forEach(report => {
      noiseTypeCounts[report.noise_type] = (noiseTypeCounts[report.noise_type] || 0) + 1;
    });
    
    const mostCommonType = Object.entries(noiseTypeCounts)
      .sort((a, b) => b[1] - a[1])[0][0];
    
    return {
      total: noiseReports.length,
      avgDecibel,
      dangerousCount,
      flaggedCount,
      mostCommonType,
      noiseTypeCounts
    };
  };

  // Get noise reports categorized by level
  const getNoiseLevelCategories = (): NoiseStatsByCategory[] => {
    if (noiseReports.length === 0) return [];
    
    const dangerous = noiseReports.filter(report => report.decibel_level >= 80).length;
    const high = noiseReports.filter(report => report.decibel_level >= 65 && report.decibel_level < 80).length;
    const moderate = noiseReports.filter(report => report.decibel_level >= 50 && report.decibel_level < 65).length;
    const low = noiseReports.filter(report => report.decibel_level < 50).length;
    
    return [
      {
        category: "Dangerous",
        count: dangerous,
        percentage: Math.round((dangerous / noiseReports.length) * 100),
        color: "bg-red-500"
      },
      {
        category: "High",
        count: high,
        percentage: Math.round((high / noiseReports.length) * 100),
        color: "bg-orange-500"
      },
      {
        category: "Moderate",
        count: moderate,
        percentage: Math.round((moderate / noiseReports.length) * 100),
        color: "bg-yellow-500"
      },
      {
        category: "Low",
        count: low,
        percentage: Math.round((low / noiseReports.length) * 100),
        color: "bg-green-500"
      }
    ];
  };

  // Export data function
  const exportData = (format: "csv" | "json" | "pdf") => {
    if (noiseReports.length === 0) return;
    
    let content = '';
    let fileType = '';
    let fileName = `noise_reports_export_${new Date().toISOString().split('T')[0]}`;
    
    if (format === 'csv') {
      // Create CSV headers
      const headers = ["ID", "Latitude", "Longitude", "Decibel Level", "Noise Type", "Date", "Notes", "Address", "Status"];
      
      // Create CSV rows
      const rows = noiseReports.map(report => [
        report.id,
        report.latitude,
        report.longitude,
        report.decibel_level,
        report.noise_type,
        report.created_at,
        report.notes || "",
        report.address || "",
        report.status || ""
      ]);
      
      // Join headers and rows
      content = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      fileType = 'text/csv';
      fileName += '.csv';
    } else if (format === 'json') {
      content = JSON.stringify(noiseReports, null, 2);
      fileType = 'application/json';
      fileName += '.json';
    } else {
      // Simple mock for PDF export (in a real app, you'd use a PDF library)
      alert('PDF export would generate a formatted PDF file');
      return;
    }
    
    // Create a download link
    const blob = new Blob([content], { type: fileType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setShowExportOptions(false);
  };

  const stats = getSummaryStats();
  const noiseCategories = getNoiseLevelCategories();

  // Add handleForwardToGovt function with other handler functions
  const handleForwardToGovt = (report: NoiseReport) => {
    // Get department email from settings
    const departmentEmail = getDepartmentEmail(report.noise_type);
    
    toast({
      title: "Report Forwarded",
      description: `Report #${report.id} forwarded to ${departmentEmail}`,
    });
  };
  
  const getDepartmentEmail = (noiseType: string): string => {
    // This would normally come from settings
    const deptMappings: Record<string, string> = {
      "Traffic": "traffic@punecorp.gov.in",
      "Construction": "construction@punecorp.gov.in",
      "Industrial": "industrial@punecorp.gov.in",
      "Music": "events@punecorp.gov.in",
      "Other": "noise@punecorp.gov.in"
    };
    
    const normalizedType = noiseType.toLowerCase();
    for (const [key, value] of Object.entries(deptMappings)) {
      if (normalizedType.includes(key.toLowerCase())) {
        return value;
      }
    }
    
    return deptMappings["Other"]; // Default department
  };

  const handleViewReport = (report: NoiseReport) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  /**
   * Load AI insights using DeepSeek integration
   */
  const loadAiInsights = async (reports: NoiseReport[]) => {
    if (!reports || reports.length === 0) return;
    
    setIsAiLoading(true);
    try {
      // Get AI analytics and recommendations
      const analytics = await getDeepSeekAnalytics(reports);
      const recommendations = await getDeepSeekRecommendations(reports);
      
      setAiInsights(analytics);
      setAiRecommendations(recommendations);
    } catch (error) {
      console.error("Error loading AI insights:", error);
      toast({
        variant: "destructive",
        title: "AI Analysis Error",
        description: "Could not load AI-powered insights. Please try again later."
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  // Function to perform DeepSeek AI-powered search
  const performDeepseekSearch = async () => {
    if (!deepseekQuery.trim()) return;
    
    setIsDeepseekSearching(true);
    setDeepseekSearchResults([]);
    setDeepseekExplanation("");
    
    try {
      // Use the DeepSeek chat API to understand and process the query
      const response = await chatWithDeepSeek(`I have a dataset of noise reports in Pune. Can you help me search for: ${deepseekQuery}. Return JSON format.`);
      
      // Parse DeepSeek's query explanation
      const explanationMatch = response.match(/.*?\{/s);
      if (explanationMatch) {
        setDeepseekExplanation(explanationMatch[0].replace(/\{$/, '').trim());
      }
      
      // Extract any JSON from the response
      const jsonMatch = response.match(/\{.*\}/s);
      
      if (jsonMatch) {
        try {
          const searchCriteria = JSON.parse(jsonMatch[0]);
          
          // Apply the search criteria to filter noise reports
          let results = [...noiseReports];
          
          // Filter by decibel range if provided
          if (searchCriteria.minDecibel !== undefined) {
            results = results.filter(r => r.decibel_level >= searchCriteria.minDecibel);
          }
          if (searchCriteria.maxDecibel !== undefined) {
            results = results.filter(r => r.decibel_level <= searchCriteria.maxDecibel);
          }
          
          // Filter by noise type if provided
          if (searchCriteria.noiseType) {
            const noiseTypes = Array.isArray(searchCriteria.noiseType) 
              ? searchCriteria.noiseType 
              : [searchCriteria.noiseType];
            
            results = results.filter(r => 
              noiseTypes.some(type => 
                r.noise_type.toLowerCase().includes(type.toLowerCase())
              )
            );
          }
          
          // Filter by status if provided
          if (searchCriteria.status) {
            const statuses = Array.isArray(searchCriteria.status) 
              ? searchCriteria.status 
              : [searchCriteria.status];
            
            results = results.filter(r => 
              statuses.some(status => 
                r.status === status || 
                (status === 'any' && r.status)
              )
            );
          }
          
          // Filter by date range if provided
          if (searchCriteria.startDate) {
            const startDate = new Date(searchCriteria.startDate);
            results = results.filter(r => new Date(r.created_at) >= startDate);
          }
          if (searchCriteria.endDate) {
            const endDate = new Date(searchCriteria.endDate);
            results = results.filter(r => new Date(r.created_at) <= endDate);
          }
          
          // Apply location filtering if provided
          if (searchCriteria.location) {
            results = results.filter(r => 
              r.address && r.address.toLowerCase().includes(searchCriteria.location.toLowerCase())
            );
          }
          
          // Check for any text matches
          if (searchCriteria.textMatch) {
            results = results.filter(r => 
              (r.notes && r.notes.toLowerCase().includes(searchCriteria.textMatch.toLowerCase())) ||
              (r.address && r.address.toLowerCase().includes(searchCriteria.textMatch.toLowerCase())) ||
              r.noise_type.toLowerCase().includes(searchCriteria.textMatch.toLowerCase())
            );
          }
          
          setDeepseekSearchResults(results);
        } catch (parseError) {
          console.error("Error parsing DeepSeek JSON response:", parseError);
          
          // Fallback to basic keyword search
          performBasicSearch();
        }
      } else {
        // Fallback to basic keyword search if no JSON format found
        performBasicSearch();
      }
    } catch (error) {
      console.error("Error performing DeepSeek search:", error);
      toast({
        variant: "destructive",
        title: "Search Error",
        description: "Unable to perform AI-powered search. Please try again."
      });
      
      // Fallback to basic search
      performBasicSearch();
    } finally {
      setIsDeepseekSearching(false);
    }
  };
  
  // Basic keyword search as fallback
  const performBasicSearch = () => {
    const terms = deepseekQuery.toLowerCase().split(' ');
    
    const results = noiseReports.filter(report => 
      terms.some(term => 
        report.noise_type.toLowerCase().includes(term) ||
        (report.address && report.address.toLowerCase().includes(term)) ||
        (report.notes && report.notes.toLowerCase().includes(term)) ||
        report.status?.toLowerCase().includes(term) ||
        report.id.toLowerCase().includes(term)
      )
    );
    
    setDeepseekSearchResults(results);
  };
  
  // Handle form submission for DeepSeek search
  const handleDeepseekSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performDeepseekSearch();
  };
  
  // Apply search results to filtered reports
  const applySearchResults = () => {
    if (deepseekSearchResults.length > 0) {
      setFilteredReports(deepseekSearchResults);
      setShowDeepseekSearch(false);
      setStatusFilter("all"); // Reset other filters
      setSearchTerm("");
      setCurrentPage(1);
      
      toast({
        title: "Search Results Applied",
        description: `Found ${deepseekSearchResults.length} matching reports`
      });
    }
  };

  // Generate a report based on filters
  const generateReport = () => {
    setIsGeneratingReport(true);
    
    setTimeout(() => {
      // Apply filters to get the data for the report
      let filteredData = [...noiseReports];
      
      // Apply date range filter
      if (reportFilters.dateRange?.from) {
        filteredData = filteredData.filter(report => 
          new Date(report.created_at) >= reportFilters.dateRange!.from!
        );
      }
      if (reportFilters.dateRange?.to) {
        filteredData = filteredData.filter(report => 
          new Date(report.created_at) <= reportFilters.dateRange!.to!
        );
      }
      
      // Apply noise type filter
      if (reportFilters.noiseTypes.length > 0) {
        filteredData = filteredData.filter(report => 
          reportFilters.noiseTypes.includes(report.noise_type)
        );
      }
      
      // Apply decibel range filter
      filteredData = filteredData.filter(report => 
        report.decibel_level >= reportFilters.minDecibel && 
        report.decibel_level <= reportFilters.maxDecibel
      );
      
      // Apply status filter
      if (reportFilters.statuses.length > 0) {
        filteredData = filteredData.filter(report => 
          reportFilters.statuses.includes(report.status || 'unresolved')
        );
      }
      
      // Set report data
      setReportData(filteredData);
      
      // Organize reports by department
      const reportsByDepartment: {[key: string]: NoiseReport[]} = {
        "Traffic Department": [],
        "Construction Department": [],
        "Industrial Department": [],
        "Music & Events Department": [],
        "Environment Department": []
      };
      
      // Categorize reports by noise type to relevant departments
      filteredData.forEach(report => {
        const noiseType = report.noise_type.toLowerCase();
        
        if (noiseType.includes('traffic') || noiseType.includes('vehicle') || noiseType.includes('horn')) {
          reportsByDepartment["Traffic Department"].push(report);
        } else if (noiseType.includes('construction') || noiseType.includes('drilling') || noiseType.includes('machinery')) {
          reportsByDepartment["Construction Department"].push(report);
        } else if (noiseType.includes('industrial') || noiseType.includes('factory')) {
          reportsByDepartment["Industrial Department"].push(report);
        } else if (noiseType.includes('music') || noiseType.includes('event') || noiseType.includes('party')) {
          reportsByDepartment["Music & Events Department"].push(report);
        } else {
          reportsByDepartment["Environment Department"].push(report);
        }
      });
      
      setDepartmentReports(reportsByDepartment);
      setIsGeneratingReport(false);
      
      // Show success message
      toast({
        title: "Report Generated",
        description: `Report generated with ${filteredData.length} noise complaints`,
      });
    }, 1000); // Simulate loading time
  };
  
  // Calculate report summary statistics
  const calculateReportStats = () => {
    if (reportData.length === 0) return null;
    
    const avgDecibel = Math.round(
      reportData.reduce((sum, report) => sum + report.decibel_level, 0) / reportData.length
    );
    
    const dangerousCount = reportData.filter(report => report.decibel_level >= 80).length;
    const highCount = reportData.filter(report => report.decibel_level >= 65 && report.decibel_level < 80).length;
    const moderateCount = reportData.filter(report => report.decibel_level >= 50 && report.decibel_level < 65).length;
    const lowCount = reportData.filter(report => report.decibel_level < 50).length;
    
    // Count by noise type
    const noiseTypeCounts: Record<string, number> = {};
    reportData.forEach(report => {
      noiseTypeCounts[report.noise_type] = (noiseTypeCounts[report.noise_type] || 0) + 1;
    });
    
    const mostCommonType = Object.entries(noiseTypeCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
    
    return {
      total: reportData.length,
      avgDecibel,
      dangerousCount,
      highCount,
      moderateCount,
      lowCount,
      noiseTypeCounts,
      mostCommonType
    };
  };
  
  // Forward the report to the selected department
  const forwardReportToDepartment = async () => {
    if (!selectedDepartment) return;
    
    setForwardingReport(true);
    
    try {
      // Get reports for the selected department
      const departmentData = departmentReports[selectedDepartment] || [];
      
      // Get department email from settings
      const departmentEmail = getDepartmentEmail(selectedDepartment);
      
      // Simulate sending report to the department
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      toast({
        title: "Report Forwarded",
        description: `${departmentData.length} noise reports forwarded to ${departmentEmail}`,
        variant: "default"
      });
      
      // Close the dialog
      setShowForwardDialog(false);
    } catch (error) {
      console.error("Error forwarding report:", error);
      toast({
        title: "Error",
        description: "Failed to forward report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setForwardingReport(false);
    }
  };
  
  // Reset report filters to default values
  const resetReportFilters = () => {
    setReportFilters({
      dateRange: undefined,
      noiseTypes: [],
      minDecibel: 0,
      maxDecibel: 120,
      statuses: [],
      includeCharts: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-6">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="container mx-auto py-6 px-4 space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-y-2">
        <div>
          <h1 className="text-3xl font-bold">Admin Portal</h1>
          <p className="text-muted-foreground">Manage noise reports and analyze data</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="font-normal">Admin Access</Badge>
          <div className="relative">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowExportOptions(!showExportOptions)}
            >
              <FileText className="mr-2 h-4 w-4" />
              Export Data
            </Button>
            
            {showExportOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-background rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1">
                  <button
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-accent"
                    onClick={() => exportData('csv')}
                  >
                    Export as CSV
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-accent"
                    onClick={() => exportData('json')}
                  >
                    Export as JSON
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-accent"
                    onClick={() => exportData('pdf')}
                  >
                    Export as PDF
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setShowReportGenerator(true)}
          >
            <Mail className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
          
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              localStorage.removeItem("isAdminAuthenticated");
              localStorage.removeItem("adminUsername");
              localStorage.removeItem("adminLoginTime");
              navigate("/admin/login");
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6 w-full md:w-auto">
          <TabsTrigger value="visualAnalytics">
            <MapIcon className="mr-2 h-4 w-4 hidden md:inline" />
            Visual Analytics
          </TabsTrigger>
          <TabsTrigger value="aiAnalytics">
            <Brain className="mr-2 h-4 w-4 hidden md:inline" />
            AI Analytics
          </TabsTrigger>
          <TabsTrigger value="reportGenerator">
            <FileText className="mr-2 h-4 w-4 hidden md:inline" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4 hidden md:inline" />
            Settings
          </TabsTrigger>
        </TabsList>
        
        {/* Visual Analytics Tab */}
        <TabsContent value="visualAnalytics" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Reports</CardDescription>
                <CardTitle className="text-2xl truncate">{stats?.total || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground truncate">
                  Noise reports collected
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Average Noise Level</CardDescription>
                <CardTitle className="text-2xl truncate">{stats?.avgDecibel || 0} dB</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground truncate">
                  Average measured decibel level
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Dangerous Noise Reports</CardDescription>
                <CardTitle className="text-2xl truncate">{stats?.dangerousCount || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">80+ dB</Badge>
                  <p className="text-sm text-muted-foreground truncate">
                    {Math.round((stats?.dangerousCount || 0) / (stats?.total || 1) * 100)}% of total
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Common Noise Type</CardDescription>
                <CardTitle className="text-2xl truncate">{stats?.mostCommonType || "N/A"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground truncate">
                  Most frequently reported noise
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Noise Map Visualization */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Map className="mr-2 h-5 w-5 text-primary" />
                Noise Heatmap
              </CardTitle>
              <CardDescription>
                Geographical distribution of noise reports across Pune
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] rounded-md overflow-hidden border bg-muted/20">
                <NoiseLevelsMap data={noiseReports} />
              </div>
              
              <div className="mt-4 grid grid-cols-4 gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-xs text-muted-foreground">Low (&lt;50dB)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <span className="text-xs text-muted-foreground">Moderate (50-65dB)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                  <span className="text-xs text-muted-foreground">High (65-80dB)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <span className="text-xs text-muted-foreground">Dangerous (&gt;80dB)</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Time Series Chart */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5 text-primary" />
                Noise Level Time Trends
              </CardTitle>
              <CardDescription>
                Noise level patterns over time showing daily and weekly trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <NoiseTimeSeriesChart 
                  data={noiseReports.map(report => ({
                    time: new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    avgLevel: report.decibel_level,
                    maxLevel: report.decibel_level + 5, // Simulated max level
                    minLevel: Math.max(report.decibel_level - 10, 0), // Simulated min level
                    range: 10,
                    count: 1,
                    primaryNoiseType: report.noise_type
                  }))}
                  title="" 
                  description=""
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Distribution Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="mr-2 h-5 w-5 text-primary" />
                  Noise Type Distribution
                </CardTitle>
                <CardDescription>
                  Breakdown of noise reports by source type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <NoisePieChart 
                    data={noiseReports}
                    title=""
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart2 className="mr-2 h-5 w-5 text-primary" />
                  Noise Level Analysis
                </CardTitle>
                <CardDescription>
                  Analysis by decibel level intensity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <NoiseBarChart 
                    data={noiseReports}
                    title=""
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Noise Heatmap Chart (Time-based) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-primary" />
                Noise Time Distribution
              </CardTitle>
              <CardDescription>
                Heatmap showing noise patterns by time of day and day of week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NoiseHeatmapChart 
                data={noiseReports}
                title=""
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* AI Analytics Tab */}
        <TabsContent value="aiAnalytics" className="space-y-6">
          {/* DeepSeek AI Insights */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="mr-2 h-5 w-5 text-primary" />
                DeepSeek AI Insights
                <Badge className="ml-2" variant="outline">Enterprise</Badge>
              </CardTitle>
              <CardDescription>
                Advanced AI-powered noise pollution analysis and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isAiLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-sm text-muted-foreground">
                    DeepSeek AI is analyzing your noise data...
                  </p>
                </div>
              ) : !aiInsights ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <AlertTriangleIcon className="h-8 w-8 text-amber-500 mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    No AI insights available. Please load data first.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => loadAiInsights(noiseReports)}
                  >
                    Generate AI Insights
                  </Button>
                </div>
              ) : (
                <Tabs defaultValue="summary" className="w-full">
                  <TabsList className="grid grid-cols-5 mb-4">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="predictions">Predictions</TabsTrigger>
                    <TabsTrigger value="insights">Insights</TabsTrigger>
                    <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
                    <TabsTrigger value="actions">Actions</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="summary">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p className="text-muted-foreground mb-4">AI-generated analysis based on {noiseReports.length} noise reports</p>
                      <ReactMarkdown>
                        {aiRecommendations}
                      </ReactMarkdown>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="predictions">
                    <div className="space-y-4">
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={aiInsights.predictions}
                            margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            />
                            <YAxis domain={['auto', 'auto']} />
                            <Tooltip 
                              formatter={(value: number) => [`${value} dB`, 'Predicted Level']}
                              labelFormatter={(date) => new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="predictedLevel" 
                              stroke="#8884d8" 
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {aiInsights.predictions.map((prediction, idx) => (
                          <div key={idx} className="border rounded-lg p-3 bg-card">
                            <p className="font-medium">{new Date(prediction.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                            <div className="mt-2 flex items-center justify-between gap-2">
                              <Badge variant="outline" className="font-mono">
                                {prediction.predictedLevel} dB
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {prediction.confidence}% confidence
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="insights">
                    <div className="space-y-4">
                      {aiInsights.insights.map((insight, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-lg ${
                            insight.category === 'trend' ? 'bg-blue-50 dark:bg-blue-900/20' :
                            insight.category === 'anomaly' ? 'bg-amber-50 dark:bg-amber-900/20' :
                            insight.category === 'recommendation' ? 'bg-green-50 dark:bg-green-900/20' :
                            'bg-purple-50 dark:bg-purple-900/20'
                          } border-l-4 ${
                            insight.category === 'trend' ? 'border-blue-500' :
                            insight.category === 'anomaly' ? 'border-amber-500' :
                            insight.category === 'recommendation' ? 'border-green-500' :
                            'border-purple-500'
                          }`}
                        >
                          <div className="flex gap-3">
                            {insight.category === 'trend' ? (
                              <TrendingUpIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                            ) : insight.category === 'anomaly' ? (
                              <AlertTriangleIcon className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                            ) : insight.category === 'recommendation' ? (
                              <LightbulbIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            ) : (
                              <ActivityIcon className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="space-y-1">
                              <p className="text-sm font-medium">{insight.text}</p>
                              <p className="text-xs text-muted-foreground">
                                Relevance: {Math.round(insight.relevance * 100)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="anomalies">
                    <div className="space-y-4">
                      {aiInsights.anomalies.map((anomaly, idx) => (
                        <Card key={idx}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={`text-amber-500 rounded-full w-8 h-8 flex items-center justify-center bg-amber-100 dark:bg-amber-900/30 flex-shrink-0`}>
                                <AlertTriangleIcon className="h-4 w-4" />
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium">{new Date(anomaly.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                                  <Badge variant={anomaly.severity > 0.8 ? "destructive" : "default"} className="ml-2">
                                    {Math.round(anomaly.severity * 100)}% severity
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{anomaly.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="actions">
                    <div className="space-y-4">
                      {aiInsights.recommendedActions.map((action, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-4 bg-card rounded-lg border">
                          <div className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="text-sm">{action}</p>
                          </div>
                        </div>
                      ))}

                      <div className="mt-6 pt-6 border-t">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Forward to stakeholders</h4>
                            <p className="text-sm text-muted-foreground">Send this analysis to relevant departments</p>
                          </div>
                          <Button onClick={() => setShowForwardDialog(true)}>
                            <Share2 className="h-4 w-4 mr-2" />
                            Share Report
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
          
          {/* AI-Powered Search */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <SearchIcon className="mr-2 h-5 w-5 text-primary" />
                AI-Powered Search
              </CardTitle>
              <CardDescription>
                Use natural language to search through noise reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDeepseekSearchSubmit} className="space-y-4">
                <div className="flex gap-2">
                  <Input 
                    placeholder="e.g., 'High decibel traffic noise reports from last week'" 
                    value={deepseekQuery}
                    onChange={(e) => setDeepseekQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isDeepseekSearching || !deepseekQuery.trim()}>
                    {isDeepseekSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <SearchIcon className="h-4 w-4" />
                    )}
                    <span className="ml-2 hidden md:inline">Search</span>
                  </Button>
                </div>
                
                {/* Quick search suggestions */}
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    type="button"
                    onClick={() => setDeepseekQuery("High noise levels in residential areas")}
                  >
                    High noise in residential
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    type="button"
                    onClick={() => setDeepseekQuery("Unresolved traffic noise reports")}
                  >
                    Unresolved traffic noise
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    type="button"
                    onClick={() => setDeepseekQuery("Reports above 80dB in the last week")}
                  >
                    &gt;80dB last week
                  </Button>
                </div>
                
                {deepseekExplanation && (
                  <Alert variant="default" className="bg-card mt-4">
                    <Brain className="h-4 w-4 text-primary" />
                    <AlertTitle>AI Search Understanding</AlertTitle>
                    <AlertDescription className="text-sm">
                      {deepseekExplanation}
                    </AlertDescription>
                  </Alert>
                )}
                
                {isDeepseekSearching ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Searching...</span>
                  </div>
                ) : deepseekSearchResults.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium">Found {deepseekSearchResults.length} matching reports</p>
                      <Button size="sm" onClick={applySearchResults}>
                        Apply Results
                      </Button>
                    </div>
                    
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>dB Level</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {deepseekSearchResults.slice(0, 5).map((report) => (
                            <TableRow key={report.id}>
                              <TableCell className="font-medium">{report.id.substring(0, 8)}...</TableCell>
                              <TableCell>{new Date(report.created_at).toLocaleDateString()}</TableCell>
                              <TableCell>{report.noise_type}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    report.decibel_level >= 80 ? "destructive" :
                                    report.decibel_level >= 65 ? "default" :
                                    "outline"
                                  }
                                >
                                  {report.decibel_level} dB
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                          {deepseekSearchResults.length > 5 && (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                                + {deepseekSearchResults.length - 5} more reports
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
          
          {/* Correlation Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ActivityIcon className="mr-2 h-5 w-5 text-primary" />
                Correlation Analysis
              </CardTitle>
              <CardDescription>
                AI-detected correlations between noise levels and other factors
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isAiLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !aiInsights?.correlations ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-muted-foreground mb-2">No correlation data available</p>
                  <Button 
                    variant="outline" 
                    onClick={() => loadAiInsights(noiseReports)}
                  >
                    Generate Correlations
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {aiInsights.correlations.map((correlation, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{correlation.factor}</span>
                        </div>
                        <span className="text-sm font-medium">
                          {(correlation.correlationStrength * 100).toFixed(0)}% correlation
                        </span>
                      </div>
                      <Progress value={correlation.correlationStrength * 100} className="h-2" />
                      <p className="text-sm text-muted-foreground">{correlation.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Report Generator Tab */}
        <TabsContent value="reportGenerator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Report Filters Panel */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="mr-2 h-5 w-5 text-primary" />
                  Report Filters
                </CardTitle>
                <CardDescription>
                  Configure filters to generate custom reports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Report Type</Label>
                  <div className="grid grid-cols-1 gap-2">
                    <Button 
                      variant={reportType === "summary" ? "default" : "outline"} 
                      className="justify-start"
                      onClick={() => setReportType("summary")}
                    >
                      <BarChart2 className="h-4 w-4 mr-2" />
                      Summary Report
                    </Button>
                    <Button 
                      variant={reportType === "detailed" ? "default" : "outline"} 
                      className="justify-start"
                      onClick={() => setReportType("detailed")}
                    >
                      <ActivityIcon className="h-4 w-4 mr-2" />
                      Detailed Analysis
                    </Button>
                    <Button 
                      variant={reportType === "custom" ? "default" : "outline"} 
                      className="justify-start"
                      onClick={() => setReportType("custom")}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Custom Report
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <Label>Date Range</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="w-full justify-start text-left font-normal mt-1"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {reportFilters.dateRange?.from ? (
                          reportFilters.dateRange.to ? (
                            <>
                              {reportFilters.dateRange.from.toLocaleDateString()} -{" "}
                              {reportFilters.dateRange.to.toLocaleDateString()}
                            </>
                          ) : (
                            reportFilters.dateRange.from.toLocaleDateString()
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4" align="start">
                      <div className="bg-background rounded-md p-3">
                        <Calendar
                          mode="range"
                          selected={reportFilters.dateRange}
                          onSelect={(range) => {
                            if (range) {
                              setReportFilters({...reportFilters, dateRange: range});
                            }
                          }}
                          initialFocus
                          className="border-none"
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label>Noise Types</Label>
                  <Select onValueChange={(value) => {
                    if (value === "all") {
                      setReportFilters({...reportFilters, noiseTypes: []})
                    } else if (reportFilters.noiseTypes.includes(value)) {
                      setReportFilters({...reportFilters, noiseTypes: reportFilters.noiseTypes.filter(t => t !== value)})
                    } else {
                      setReportFilters({...reportFilters, noiseTypes: [...reportFilters.noiseTypes, value]})
                    }
                  }}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder={`${reportFilters.noiseTypes.length === 0 ? 'All' : reportFilters.noiseTypes.length} noise types selected`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Traffic">Traffic</SelectItem>
                      <SelectItem value="Construction">Construction</SelectItem>
                      <SelectItem value="Industrial">Industrial</SelectItem>
                      <SelectItem value="Music">Music & Events</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Decibel Range ({reportFilters.minDecibel} - {reportFilters.maxDecibel} dB)</Label>
                  <div className="pt-4 px-1">
                    <Slider 
                      value={[reportFilters.minDecibel, reportFilters.maxDecibel]} 
                      max={120} 
                      step={5}
                      onValueChange={(value) => {
                        if (Array.isArray(value) && value.length === 2) {
                          setReportFilters({
                            ...reportFilters, 
                            minDecibel: value[0], 
                            maxDecibel: value[1]
                          })
                        }
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Status</Label>
                  <Select onValueChange={(value) => {
                    if (value === "all") {
                      setReportFilters({...reportFilters, statuses: []})
                    } else if (reportFilters.statuses.includes(value)) {
                      setReportFilters({...reportFilters, statuses: reportFilters.statuses.filter(s => s !== value)})
                    } else {
                      setReportFilters({...reportFilters, statuses: [...reportFilters.statuses, value]})
                    }
                  }}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder={`${reportFilters.statuses.length === 0 ? 'All' : reportFilters.statuses.length} statuses selected`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="unresolved">Unresolved</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="escalated">Escalated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="includeCharts" 
                    checked={reportFilters.includeCharts} 
                    onCheckedChange={(checked) => 
                      setReportFilters({...reportFilters, includeCharts: !!checked})
                    }
                  />
                  <label htmlFor="includeCharts">Include Charts & Graphs</label>
                </div>
                
                <div className="pt-4 flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={resetReportFilters}
                  >
                    Reset Filters
                  </Button>
                  <Button 
                    onClick={generateReport}
                    disabled={isGeneratingReport}
                  >
                    {isGeneratingReport ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Report
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Generated Report Preview */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-primary" />
                  Report Preview
                </CardTitle>
                <CardDescription>
                  Generated report based on your filter criteria
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isGeneratingReport ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">Generating your report...</p>
                  </div>
                ) : reportData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No report generated yet. Select your filters and click "Generate Report".</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Noise Pollution Report</h3>
                        <Badge variant="outline">
                          {reportType === "summary" ? "Summary" : 
                           reportType === "detailed" ? "Detailed" : "Custom"}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        Generated on {new Date().toLocaleString()} • {reportData.length} reports included
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Date Range</p>
                          <p className="text-sm text-muted-foreground">
                            {reportFilters.dateRange?.from 
                              ? `${reportFilters.dateRange.from.toLocaleDateString()} - ${reportFilters.dateRange.to?.toLocaleDateString() || 'Present'}`
                              : 'All dates'
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Noise Types</p>
                          <p className="text-sm text-muted-foreground">
                            {reportFilters.noiseTypes.length > 0 
                              ? reportFilters.noiseTypes.join(', ')
                              : 'All types'
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Decibel Range</p>
                          <p className="text-sm text-muted-foreground">
                            {reportFilters.minDecibel}dB - {reportFilters.maxDecibel}dB
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Statuses</p>
                          <p className="text-sm text-muted-foreground">
                            {reportFilters.statuses.length > 0 
                              ? reportFilters.statuses.join(', ')
                              : 'All statuses'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Executive Summary</h3>
                      </div>
                      
                      {/* Calculate report stats */}
                      {(() => {
                        const reportStats = calculateReportStats();
                        return reportStats && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="p-4 text-center">
                                  <p className="text-3xl font-bold">{reportStats.total}</p>
                                  <p className="text-sm text-muted-foreground">Total Reports</p>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardContent className="p-4 text-center">
                                  <p className="text-3xl font-bold">{reportStats.avgDecibel}dB</p>
                                  <p className="text-sm text-muted-foreground">Average Level</p>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardContent className="p-4 text-center">
                                  <p className="text-3xl font-bold">{reportStats.dangerousCount}</p>
                                  <p className="text-sm text-muted-foreground">Dangerous Noise</p>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardContent className="p-4 text-center">
                                  <p className="text-3xl font-bold text-nowrap truncate">{reportStats.mostCommonType}</p>
                                  <p className="text-sm text-muted-foreground">Common Type</p>
                                </CardContent>
                              </Card>
                        </div>
                        );
                      })()}
                      
                      {reportFilters.includeCharts && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                          <Card>
                            <CardHeader className="p-4 pb-0">
                              <CardTitle className="text-sm">Noise Type Distribution</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                              <div className="h-[200px]">
                                <NoisePieChart data={reportData} />
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader className="p-4 pb-0">
                              <CardTitle className="text-sm">Noise Level Distribution</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                              <div className="h-[200px]">
                                <NoiseBarChart data={reportData} />
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Reports By Department</h3>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowForwardDialog(true)}
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Forward to Departments
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        {Object.entries(departmentReports).map(([department, reports]) => (
                          <div key={department}>
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium">{department}</h4>
                              <Badge variant="outline">{reports.length} reports</Badge>
                            </div>
                            {reports.length > 0 ? (
                              <div className="border rounded-md overflow-hidden">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>ID</TableHead>
                                      <TableHead>Date</TableHead>
                                      <TableHead>Type</TableHead>
                                      <TableHead>dB Level</TableHead>
                                      <TableHead>Status</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {reports.slice(0, 3).map((report) => (
                                      <TableRow key={report.id}>
                                        <TableCell className="font-medium">{report.id.substring(0, 8)}...</TableCell>
                                        <TableCell>{new Date(report.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>{report.noise_type}</TableCell>
                                        <TableCell>
                                          <Badge variant={
                                            report.decibel_level >= 80 ? "destructive" :
                                            report.decibel_level >= 65 ? "default" :
                                            "outline"
                                          }>
                                            {report.decibel_level} dB
                                          </Badge>
                                        </TableCell>
                                        <TableCell>{report.status || "unresolved"}</TableCell>
                                      </TableRow>
                                    ))}
                                    {reports.length > 3 && (
                                      <TableRow>
                                        <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                                          + {reports.length - 3} more reports
                                        </TableCell>
                                      </TableRow>
                                    )}
                                  </TableBody>
                                </Table>
                              </div>
                            ) : (
                              <div className="text-center p-4 border rounded-md bg-muted/20">
                                <p className="text-sm text-muted-foreground">No reports for this department</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-4">
                      <Button 
                        variant="outline"
                        onClick={() => exportData('pdf')}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Export as PDF
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => exportData('csv')}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Export as CSV
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button>
                            <Send className="mr-2 h-4 w-4" />
                            Submit Report
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Submit Report to Department</DialogTitle>
                            <DialogDescription>
                              Select which department to forward this report to.
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="department">Select Department</Label>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a department" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="traffic">Traffic Department (RTO)</SelectItem>
                                  <SelectItem value="construction">Construction Department</SelectItem>
                                  <SelectItem value="industrial">Industrial Department</SelectItem>
                                  <SelectItem value="police">Music & Events (Police)</SelectItem>
                                  <SelectItem value="environment">Environment Department</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="notes">Additional Notes</Label>
                              <Textarea 
                                id="notes" 
                                placeholder="Include any additional information for the department..."
                                rows={4}
                              />
                            </div>
                          </div>
                          
                          <DialogFooter>
                            <Button variant="outline" className="mr-2">Cancel</Button>
                            <Button onClick={() => {
                              toast({
                                title: "Report Submitted",
                                description: "The report has been forwarded to the selected department."
                              });
                            }}>
                              <Send className="mr-2 h-4 w-4" />
                              Send Report
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Noise Reports Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Noise Reports Management</CardTitle>
                  <CardDescription>
                    View, filter and manage all submitted noise reports.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">                  
                  <Select 
                    defaultValue="all" 
                    onValueChange={(value) => setStatusFilter(value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Reports</SelectItem>
                      <SelectItem value="unresolved">Unresolved</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="escalated">Escalated</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Search reports..."
                    className="w-[200px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">ID</TableHead>
                      <TableHead className="w-[180px]">Date/Time</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Noise Type</TableHead>
                      <TableHead className="text-center">dB Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          {loading ? (
                            <div className="flex justify-center items-center">
                              <Loader2 className="h-6 w-6 animate-spin mr-2" />
                              Loading reports...
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center text-center">
                              <p className="text-muted-foreground">No reports found</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {statusFilter !== "all" ? "Try changing the status filter" : 
                                 searchTerm ? "Try a different search term" : "No data available"}
                              </p>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">{report.id.substring(0, 8)}...</TableCell>
                          <TableCell>
                            {new Date(report.created_at).toLocaleDateString()}{" "}
                            {new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </TableCell>
                          <TableCell>
                            {report.address || `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`}
                          </TableCell>
                          <TableCell>{report.noise_type}</TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={
                                report.decibel_level >= 80 ? "destructive" :
                                report.decibel_level >= 65 ? "default" :
                                "outline"
                              }
                            >
                              {report.decibel_level} dB
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                report.status === "resolved" ? "outline" :
                                report.status === "escalated" ? "destructive" :
                                report.status === "in-progress" ? "default" :
                                "secondary"
                              }
                              className={
                                report.status === "resolved" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                                report.status === "in-progress" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" :
                                report.status === "escalated" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                                "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                              }
                            >
                              {report.status || "unresolved"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <DotsHorizontalIcon className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleViewReport(report)}>
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleStatusChange(report.id, "resolved")}>
                                  Mark as Resolved
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <DropdownMenuTrigger className="w-full text-left">
                                    Change Status
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => handleStatusChange(report.id, "unresolved")}>
                                      Unresolved
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(report.id, "in-progress")}>
                                      In Progress
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(report.id, "resolved")}>
                                      Resolved
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(report.id, "escalated")}>
                                      Escalated
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className={report.flagged ? "text-amber-600" : "text-red-600"}
                                  onClick={() => handleFlagToggle(report.id)}
                                >
                                  {report.flagged ? "Remove Flag" : "Flag as Important"}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">{paginatedReports.length}</span> of{" "}
                  <span className="font-medium">{filteredReports.length}</span> reports
                  {filteredReports.length < noiseReports.length && 
                    <> (filtered from {noiseReports.length} total reports)</>
                  }
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground px-2">
                    Page {currentPage} of {Math.max(1, Math.ceil(filteredReports.length / reportsPerPage))}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage >= Math.ceil(filteredReports.length / reportsPerPage)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5 text-primary" />
                General Settings
              </CardTitle>
              <CardDescription>
                Configure the admin portal and system settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Display Settings</h3>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reportsPerPage">Reports per page</Label>
                    <div className="flex items-center gap-2">
                      <Select value={reportsPerPage.toString()} onValueChange={(value) => setReportsPerPage(parseInt(value))}>
                        <SelectTrigger className="w-[80px]">
                          <SelectValue placeholder={reportsPerPage.toString()} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="7">7</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="15">15</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="defaultExportFormat">Default export format</Label>
                    <div className="flex items-center gap-2">
                      <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as "csv" | "json" | "pdf")}>
                        <SelectTrigger className="w-[80px]">
                          <SelectValue placeholder={exportFormat.toUpperCase()} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem value="pdf">PDF</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Department Settings</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure department email addresses for forwarding noise reports
                </p>
                
                <div className="space-y-3 border rounded-md p-4">
                  {/* Traffic Department */}
                  <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                    <Label htmlFor="trafficEmail" className="md:col-span-1">Traffic Department (RTO)</Label>
                    <div className="md:col-span-2">
                      <Input 
                        id="trafficEmail" 
                        defaultValue="rto.pune@maharashtra.gov.in" 
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  {/* Construction Department */}
                  <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                    <Label htmlFor="constructionEmail" className="md:col-span-1">Construction Department</Label>
                    <div className="md:col-span-2">
                      <Input 
                        id="constructionEmail" 
                        defaultValue="construction@punecorp.gov.in" 
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  {/* Industrial Department */}
                  <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                    <Label htmlFor="industrialEmail" className="md:col-span-1">Industrial Department</Label>
                    <div className="md:col-span-2">
                      <Input 
                        id="industrialEmail" 
                        defaultValue="industrial@punecorp.gov.in" 
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  {/* Music & Events Department */}
                  <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                    <Label htmlFor="musicEmail" className="md:col-span-1">Music & Events (Police)</Label>
                    <div className="md:col-span-2">
                      <Input 
                        id="musicEmail" 
                        defaultValue="noise.complaints@punepolice.gov.in" 
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  {/* Default Department */}
                  <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                    <Label htmlFor="defaultEmail" className="md:col-span-1">Default Department</Label>
                    <div className="md:col-span-2">
                      <Input 
                        id="defaultEmail" 
                        defaultValue="noise@punecorp.gov.in" 
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button variant="outline" className="mr-2">
                    Reset to Defaults
                  </Button>
                  <Button>
                    Save Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Dialogs and other modals will be kept */}
      
      {/* Report Generator Dialog */}
      <Dialog open={showReportGenerator} onOpenChange={setShowReportGenerator}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Generate Noise Report</DialogTitle>
            <DialogDescription>
              Customize and generate reports for various departments
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Report Type</h3>
                <div className="grid grid-cols-1 gap-2">
                  <Button 
                    variant={reportType === "summary" ? "default" : "outline"} 
                    className="justify-start"
                    onClick={() => setReportType("summary")}
                  >
                    <BarChart2 className="h-4 w-4 mr-2" />
                    Summary Report
                  </Button>
                  <Button 
                    variant={reportType === "detailed" ? "default" : "outline"} 
                    className="justify-start"
                    onClick={() => setReportType("detailed")}
                  >
                    <ActivityIcon className="h-4 w-4 mr-2" />
                    Detailed Analysis
                  </Button>
                  <Button 
                    variant={reportType === "custom" ? "default" : "outline"} 
                    className="justify-start"
                    onClick={() => setReportType("custom")}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Custom Report
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Filters</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label>Date Range</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className="w-full justify-start text-left font-normal mt-1"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {reportFilters.dateRange?.from ? (
                            reportFilters.dateRange.to ? (
                              <>
                                {reportFilters.dateRange.from.toLocaleDateString()} -{" "}
                                {reportFilters.dateRange.to.toLocaleDateString()}
                              </>
                            ) : (
                              reportFilters.dateRange.from.toLocaleDateString()
                            )
                          ) : (
                            <span>Pick a date range</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-4" align="start">
                        <div className="bg-background rounded-md p-3">
                          <Calendar
                            mode="range"
                            selected={reportFilters.dateRange}
                            onSelect={(range) => {
                              if (range) {
                                setReportFilters({...reportFilters, dateRange: range});
                              }
                            }}
                            initialFocus
                            className="border-none"
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <Label>Noise Types</Label>
                    <Select onValueChange={(value) => {
                      if (value === "all") {
                        setReportFilters({...reportFilters, noiseTypes: []})
                      } else if (reportFilters.noiseTypes.includes(value)) {
                        setReportFilters({...reportFilters, noiseTypes: reportFilters.noiseTypes.filter(t => t !== value)})
                      } else {
                        setReportFilters({...reportFilters, noiseTypes: [...reportFilters.noiseTypes, value]})
                      }
                    }}>
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue placeholder={`${reportFilters.noiseTypes.length === 0 ? 'All' : reportFilters.noiseTypes.length} selected`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Traffic">Traffic</SelectItem>
                        <SelectItem value="Construction">Construction</SelectItem>
                        <SelectItem value="Industrial">Industrial</SelectItem>
                        <SelectItem value="Music">Music & Events</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Decibel Range ({reportFilters.minDecibel} - {reportFilters.maxDecibel} dB)</Label>
                    <div className="pt-4 px-1">
                      <Slider 
                        value={[reportFilters.minDecibel, reportFilters.maxDecibel]} 
                        max={120} 
                        step={5}
                        onValueChange={(value) => {
                          if (Array.isArray(value) && value.length === 2) {
                            setReportFilters({
                              ...reportFilters, 
                              minDecibel: value[0], 
                              maxDecibel: value[1]
                            })
                          }
                        }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Status</Label>
                    <Select onValueChange={(value) => {
                      if (value === "all") {
                        setReportFilters({...reportFilters, statuses: []})
                      } else if (reportFilters.statuses.includes(value)) {
                        setReportFilters({...reportFilters, statuses: reportFilters.statuses.filter(s => s !== value)})
                      } else {
                        setReportFilters({...reportFilters, statuses: [...reportFilters.statuses, value]})
                      }
                    }}>
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue placeholder={`${reportFilters.statuses.length === 0 ? 'All' : reportFilters.statuses.length} selected`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="unresolved">Unresolved</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="escalated">Escalated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="includeCharts" 
                      checked={reportFilters.includeCharts} 
                      onCheckedChange={(checked) => 
                        setReportFilters({...reportFilters, includeCharts: !!checked})
                      }
                    />
                    <label htmlFor="includeCharts">Include Charts & Graphs</label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2 border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Report Preview</h3>
                <Badge variant="outline">{reportType}</Badge>
              </div>
              
              {isGeneratingReport ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Generating report...</p>
                </div>
              ) : reportData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-8 w-8 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Click 'Generate Report' to preview</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Date Range</p>
                      <p className="text-sm text-muted-foreground">
                        {reportFilters.dateRange?.from 
                          ? `${reportFilters.dateRange.from.toLocaleDateString()} - ${reportFilters.dateRange.to?.toLocaleDateString() || 'Present'}`
                          : 'All dates'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Reports</p>
                      <p className="text-sm text-muted-foreground">{reportData.length} total</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Noise Types</p>
                      <p className="text-sm text-muted-foreground">
                        {reportFilters.noiseTypes.length > 0 
                          ? reportFilters.noiseTypes.join(', ')
                          : 'All types'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Decibel Range</p>
                      <p className="text-sm text-muted-foreground">
                        {reportFilters.minDecibel}dB - {reportFilters.maxDecibel}dB
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Department Distribution</p>
                    <div className="space-y-2">
                      {Object.entries(departmentReports).map(([department, reports]) => (
                        <div key={department} className="flex justify-between items-center">
                          <p className="text-sm">{department}</p>
                          <Badge variant="outline">{reports.length} reports</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className="flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={resetReportFilters}
            >
              Reset Filters
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="secondary"
                onClick={() => {
                  if (reportData.length > 0) {
                    // Switch to the reports tab to view the generated report
                    setActiveTab("reportGenerator");
                    setShowReportGenerator(false);
                  }
                }}
                disabled={reportData.length === 0}
              >
                View Full Report
              </Button>
              <Button 
                onClick={generateReport} 
                disabled={isGeneratingReport}
              >
                {isGeneratingReport ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Forward Report Dialog */}
      <Dialog open={showForwardDialog} onOpenChange={setShowForwardDialog}>
        {/* Existing dialog content */}
      </Dialog>
    </motion.div>
  );
};

export default AdminPortal;
