import React, { useState, useEffect, useRef, useMemo } from 'react';
// @ts-ignore
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
  Map,
  LogOut,
  TrendingUpIcon,
  RocketIcon,
  LightbulbIcon,
  ActivityIcon,
  EyeIcon,
  MoreHorizontalIcon,
  Brain,
  AlertTriangle as AlertTriangleIcon,
  Share2,
  SearchIcon,
  ChevronDown,
  Download,
  Filter,
  Mail,
  Send,
  MapIcon,
  Clock,
  RefreshCw,
  Info,
  LayoutDashboard,
  BrainCircuit,
  Mic,
  Calendar as CalendarIcon,
  Flag,
  MapPin,
  Search,
  Loader2,
  Save,
  Trash2,
  Database,
  File,
  FileIcon,
  FileSpreadsheet,
  Car,
  HardHat,
  Factory,
  Music,
  Leaf,
  FileBarChart2
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
import { Progress } from "@/components/ui/progress";
import { useNavigate } from 'react-router-dom';
import { NoiseAnalyticsAdvanced } from "@/components/charts/NoiseAnalyticsAdvanced";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { chatWithAI } from '@/lib/mock-data';
import { getNoiseSenseAIAnalytics as getAIAnalytics, getNoiseSenseAIRecommendations as getAIRecommendations } from '@/integrations/noisesense-ai/client';
import { PUNE_AREAS } from '@/lib/mock-data';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { NoiseLevelsMap } from "@/components/NoiseLevelsMap";
import {
  LineChart,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Line
} from "recharts";

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
  const [aiQuery, setAiQuery] = useState<string>("");
  const [isAiSearching, setIsAiSearching] = useState<boolean>(false);
  const [aiSearchResults, setAiSearchResults] = useState<NoiseReport[]>([]);
  const [aiExplanation, setAiExplanation] = useState<string>("");
  const [showAiSearch, setShowAiSearch] = useState<boolean>(false);
  const [showReportGenerator, setShowReportGenerator] = useState<boolean>(false);
  const [reportType, setReportType] = useState<"summary" | "detailed" | "custom">("summary");
  const [reportFilters, setReportFilters] = useState<{
    dateRange: DateRange | undefined;
    noiseTypes: string[];
    minDecibel: number;
    maxDecibel: number;
    statuses: string[];
    includeCharts: boolean;
    includeLocationData: boolean;
    includeSummaryStats: boolean;
  }>({
    dateRange: undefined,
    noiseTypes: [],
    minDecibel: 0,
    maxDecibel: 120,
    statuses: [],
    includeCharts: true,
    includeLocationData: true,
    includeSummaryStats: true
  });
  const [reportData, setReportData] = useState<NoiseReport[]>([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [showForwardDialog, setShowForwardDialog] = useState<boolean>(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [departmentReports, setDepartmentReports] = useState<{[key: string]: NoiseReport[]}>({});
  const [forwardingReport, setForwardingReport] = useState<boolean>(false);
  
  // Settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    reportThreshold: 80, // dB threshold for high-priority notifications
    dailyDigest: false,
    alertSound: true,
  });
  
  const [systemSettings, setSystemSettings] = useState({
    dataRetentionDays: 90,
    autoArchive: true,
    mapDefaultView: "heatmap", // heatmap or markers
    defaultZoomLevel: 12,
  });
  
  const [aiSettings, setAiSettings] = useState({
    enableAiInsights: true,
    insightFrequency: "weekly", // daily, weekly, monthly
    saveSearchQueries: true,
    preferredModel: "gpt-4", // gpt-4, claude, gemini
  });

  const [exportSettings, setExportSettings] = useState({
    defaultFormat: "csv", // csv, pdf, json
    includeCharts: true,
    compressFiles: false,
    defaultRecipients: "",
  });

  // Check authentication
  useEffect(() => {
    // Always check authentication status
    const isAuthenticated = localStorage.getItem("isAdminAuthenticated") === "true";
    if (!isAuthenticated) {
      // Clear any stale auth data
      localStorage.removeItem("adminUsername");
      localStorage.removeItem("adminLoginTime");
      
      // Redirect to login page
      navigate("/admin/login");
    }
  }, [navigate]);

  // Fetch mock data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Check if we already have stored data in localStorage
        const storedReports = localStorage.getItem('noiseReports');
        
        if (storedReports && storedReports !== "undefined" && storedReports.length > 10) {
          try {
            const parsedReports = JSON.parse(storedReports);
            if (Array.isArray(parsedReports) && parsedReports.length > 0) {
              setNoiseReports(parsedReports);
              setLoading(false);
              
              // After fetching reports data, load AI insights
              loadAIInsights(parsedReports);
              return;
            }
          } catch (parseError) {
            console.error("Error parsing stored reports:", parseError);
            // Continue to generate mock data
          }
        }
        
        // Generate mock data if no valid stored data
        console.log("Generating mock data for admin portal");
        const { generatePuneNoiseData } = await import('@/lib/mock-data');
        const mockData = generatePuneNoiseData(500);
        
        // Store the generated data
        localStorage.setItem('noiseReports', JSON.stringify(mockData));
        
        setNoiseReports(mockData);
        setLoading(false);
        
        // After fetching reports data, load AI insights
        loadAIInsights(mockData);
        
      } catch (err) {
        console.error("Failed to load or generate noise reports data:", err);
        
        // Final fallback - create basic mock data directly
        try {
          const basicMockData = Array(50).fill(null).map((_, i) => ({
            id: `report-fallback-${i}`,
            latitude: 18.52 + (Math.random() * 0.1),
            longitude: 73.85 + (Math.random() * 0.1),
            decibel_level: 50 + Math.floor(Math.random() * 40),
            noise_type: ["Traffic", "Construction", "Industrial", "Loudspeakers", "Vehicle Horn"][Math.floor(Math.random() * 5)],
            created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            notes: "Generated fallback data",
            status: "pending",
          }));
          
          setNoiseReports(basicMockData);
          localStorage.setItem('noiseReports', JSON.stringify(basicMockData));
        } catch (fallbackErr) {
          setError("Failed to load or generate noise reports data");
        }
        
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
    const updatedReports = noiseReports.map((report) =>
      report.id === id ? { ...report, status: newStatus } : report
    );
    
    // Update state
    setNoiseReports(updatedReports);
    
    // Persist changes to localStorage
    localStorage.setItem('noiseReports', JSON.stringify(updatedReports));
    
    toast({
      title: "Status Updated",
      description: `Report #${id} marked as ${newStatus}`,
    });
  };

  // Handle flag toggle
  const handleFlagToggle = (id: string) => {
    const updatedReports = noiseReports.map((report) =>
      report.id === id ? { ...report, flagged: !report.flagged } : report
    );
    
    // Update state
    setNoiseReports(updatedReports);
    
    // Persist changes to localStorage
    localStorage.setItem('noiseReports', JSON.stringify(updatedReports));
    
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
    const categories = [
      { range: [0, 40], label: "Low (0-40 dB)", color: "#4ade80" },  // Green
      { range: [41, 65], label: "Moderate (41-65 dB)", color: "#facc15" }, // Yellow
      { range: [66, 85], label: "High (66-85 dB)", color: "#fb923c" }, // Orange
      { range: [86, 100], label: "Very High (86-100 dB)", color: "#ef4444" }, // Red
      { range: [101, 150], label: "Dangerous (101+ dB)", color: "#7c3aed" }  // Purple
    ];
  
    const counts = categories.map(category => {
      const count = filteredReports.filter(
        report => report.decibel_level >= category.range[0] && report.decibel_level <= category.range[1]
      ).length;
      return {
        category: category.label,
        count,
        percentage: Math.round((count / filteredReports.length) * 100) || 0,
        color: category.color
      };
    });
  
    return counts;
  };

  // Get statistics by noise type
  const getNoiseTypeStats = () => {
    const noiseTypes = ["Traffic", "Construction", "Industrial", "Music", "Other"];
    const colorMap = {
      "Traffic": "#3b82f6",      // Blue
      "Construction": "#f97316", // Orange
      "Industrial": "#6366f1",   // Indigo
      "Music": "#ec4899",        // Pink
      "Other": "#8b5cf6"         // Purple
    };
    
    const stats = noiseTypes.map(type => {
      const count = filteredReports.filter(report => report.noise_type === type).length;
      return {
        category: type,
        count,
        percentage: Math.round((count / filteredReports.length) * 100) || 0,
        color: colorMap[type] || "#a3a3a3" // Default to gray if type not in map
      };
    });
    
    return stats;
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
   * Load AI insights using NoiseSense AI integration
   */
  const loadAIInsights = async (reports: NoiseReport[]) => {
    if (!reports.length) return null;
    
    try {
      // Load AI insights using NoiseSense AI integration
      const analytics = await getAIAnalytics(reports);
      const recommendations = await getAIRecommendations(reports);
      
      return {
        analytics,
        recommendations
      };
    } catch (error) {
      console.error("Error loading AI insights:", error);
      return null;
    }
  };

  // Function to perform AI-powered search
  const performAiSearch = async () => {
    if (!aiQuery.trim()) return;
    
    setIsAiSearching(true);
    setAiSearchResults([]);
    setAiExplanation("");
    
    try {
      // Use the NoiseSense AI chat API to understand and process the query
      const response = await chatWithAI([{
        role: 'user',
        content: `I have a dataset of noise reports in Pune. Can you help me search for: ${aiQuery}. Format your response as follows: First provide a brief explanation, then return a valid JSON object with a "results" array containing matching items. Example format: "Here's what I found... {"results": [...]}"` 
      }]);
      
      // Parse AI's query explanation
      const explanationPattern = /(.+?)(?:\{|\[)/s;
      const explanationMatch = response.match(explanationPattern);
      
      if (explanationMatch) {
        setAiExplanation(explanationMatch[1].trim());
      }
      
      // Improved JSON extraction - try different patterns
      let jsonData = null;
      
      // Try to extract JSON with a more flexible approach
      try {
        // First try standard pattern
        const jsonPattern = /(\{|\[)(.+?)(\}|\])(?:\s*$|\n)/s;
        const jsonMatch = response.match(jsonPattern);
        
        if (jsonMatch) {
          const jsonStr = response.substring(
            response.indexOf(jsonMatch[1]),
            response.lastIndexOf(jsonMatch[3]) + 1
          );
          jsonData = JSON.parse(jsonStr);
        } else {
          // Try to find anything that looks like JSON
          const possibleJson = response.substring(
            response.indexOf("{"),
            response.lastIndexOf("}") + 1
          );
          
          if (possibleJson && possibleJson.includes("{") && possibleJson.includes("}")) {
            jsonData = JSON.parse(possibleJson);
          }
        }
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        // Continue to fallback
      }
      
      // Process the JSON data if found
      if (jsonData && jsonData.results && Array.isArray(jsonData.results)) {
        const results = jsonData.results
          .map((item: any) => {
            // Try to find matching report by ID or characteristics
            return noiseReports.find(report => 
              (item.id && report.id === item.id) ||
              (item.location && report.address && report.address.includes(item.location)) ||
              (item.decibel && report.decibel_level === item.decibel) ||
              (item.type && report.noise_type === item.type)
            );
          })
          .filter(Boolean);
          
        setAiSearchResults(results);
        
        // If no results found after processing, fall back to keyword search
        if (results.length === 0) {
          console.log("No matches found from AI results, falling back to keyword search");
          fallbackToKeywordSearch();
        }
      } else {
        console.error("Could not extract valid JSON from AI response:", response);
        // Fall back to keyword search
        fallbackToKeywordSearch();
      }
    } catch (error) {
      console.error("Error performing AI search:", error);
      // Fall back to keyword search
      fallbackToKeywordSearch();
    } finally {
      setIsAiSearching(false);
    }
  };
  
  // Basic keyword search as fallback
  const fallbackToKeywordSearch = () => {
    const terms = aiQuery.toLowerCase().split(' ');
    
    // Simple keyword matching as fallback
    const results = noiseReports.filter(report => {
      return terms.some(term => 
        report.noise_type.toLowerCase().includes(term) ||
        (report.notes && report.notes.toLowerCase().includes(term)) ||
        (report.address && report.address.toLowerCase().includes(term))
      );
    });
    
    setAiSearchResults(results);
  };
  
  // Handle form submission for AI search
  const handleAiSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performAiSearch();
  };
  
  // Use useEffect for applying search results to avoid render-time state updates
  useEffect(() => {
    // Only proceed if there are actual results and they've changed from previous
    if (aiSearchResults.length > 0) {
      setFilteredReports(aiSearchResults);
      setShowAiSearch(false);
      
      toast({
        title: "AI Search Results",
        description: `Found ${aiSearchResults.length} matching reports`
      });
    }
  }, [aiSearchResults]);
  
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
      
      // Generate different department reports based on report type
      if (reportType === "detailed" || reportType === "custom") {
        // For detailed and custom reports, provide comprehensive breakdowns by department
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
        
        // For detailed reports, also analyze time patterns
        if (reportType === "detailed") {
          // Sort by time for time-based analysis (would be more sophisticated in production)
          filteredData.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        }
      } else {
        // For summary reports, provide a simpler breakdown
        const basicDepartments: {[key: string]: NoiseReport[]} = {
          "General Overview": filteredData
        };
        
        // Set a simplified department report for summary view
        setDepartmentReports(basicDepartments);
      }
      
      setIsGeneratingReport(false);
      
      // Show success message
      toast({
        title: "Report Generated",
        description: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generated with ${filteredData.length} noise complaints`,
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
      includeCharts: true,
      includeLocationData: true,
      includeSummaryStats: true
    });
  };

  // Load settings from localStorage
  useEffect(() => {
    const loadSettings = () => {
      try {
        // Load notification settings
        const storedNotificationSettings = localStorage.getItem('notificationSettings');
        if (storedNotificationSettings) {
          setNotificationSettings(JSON.parse(storedNotificationSettings));
        }
        
        // Load system settings
        const storedSystemSettings = localStorage.getItem('systemSettings');
        if (storedSystemSettings) {
          setSystemSettings(JSON.parse(storedSystemSettings));
        }
        
        // Load AI settings
        const storedAiSettings = localStorage.getItem('aiSettings');
        if (storedAiSettings) {
          setAiSettings(JSON.parse(storedAiSettings));
        }
        
        // Load export settings
        const storedExportSettings = localStorage.getItem('exportSettings');
        if (storedExportSettings) {
          setExportSettings(JSON.parse(storedExportSettings));
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        toast({
          title: "Failed to load settings",
          description: "Some settings could not be loaded properly.",
          variant: "destructive",
          duration: 5000,
        });
      }
    };
    
    loadSettings();
  }, []);

  // Save all settings to localStorage
  const saveSettings = () => {
    try {
      localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
      localStorage.setItem('systemSettings', JSON.stringify(systemSettings));
      localStorage.setItem('aiSettings', JSON.stringify(aiSettings));
      localStorage.setItem('exportSettings', JSON.stringify(exportSettings));
      
      toast({
        title: "Settings saved",
        description: "Your settings have been successfully saved.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Failed to save settings",
        description: "There was an error saving your settings.",
        variant: "destructive",
        duration: 5000,
      });
    }
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
      {/* Admin Header */}
      <div className="flex flex-wrap items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <div className="flex items-center space-x-2">
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
              // Clear all authentication data including trusted device
              localStorage.removeItem("isAdminAuthenticated");
              localStorage.removeItem("adminUsername");
              localStorage.removeItem("adminLoginTime");
              localStorage.removeItem("adminTrustedAuth");
              navigate("/admin/login");
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="mb-4 w-full justify-start overflow-x-auto">
          <TabsTrigger value="dashboard">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="map-analytics">
            <Map className="mr-2 h-4 w-4" />
            Map Analytics
          </TabsTrigger>
          <TabsTrigger value="charts">
            <BarChart2 className="mr-2 h-4 w-4" />
            Charts & Trends
          </TabsTrigger>
          <TabsTrigger value="ai-insights">
            <BrainCircuit className="mr-2 h-4 w-4" />
            NoiseSense AI Insights
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="mr-2 h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>
        
        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Dashboard content here */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Noise Report Trends</CardTitle>
                <CardDescription>Reports over the past 30 days</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      { date: "01/05", reports: 21 },
                      { date: "05/05", reports: 35 },
                      { date: "10/05", reports: 45 },
                      { date: "15/05", reports: 25 },
                      { date: "20/05", reports: 38 },
                      { date: "25/05", reports: 52 },
                      { date: "30/05", reports: 41 },
                    ]}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Area type="monotone" dataKey="reports" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorReports)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Noise Types Distribution</CardTitle>
                <CardDescription>Breakdown by categories</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getNoiseLevelCategories()}
                      dataKey="count"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {getNoiseLevelCategories().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest reports and actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {noiseReports.slice(0, 5).map((report, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className={`w-2 h-2 mt-1.5 rounded-full ${
                        report.status === 'resolved' ? 'bg-green-500' : 
                        report.status === 'pending' ? 'bg-orange-500' : 'bg-red-500'
                      }`}></div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium">{report.noise_type}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(report.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{report.address}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="w-full">
                  View All Reports
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Map Analytics Tab */}
        <TabsContent value="map-analytics" className="space-y-6">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Map className="mr-2 h-5 w-5 text-primary" />
                Noise Heatmap Visualization
              </CardTitle>
              <CardDescription>
                Geographical distribution of noise reports across Pune
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[550px] rounded-md overflow-hidden border border-muted">
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

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Noise Distribution</CardTitle>
                <CardDescription>By area and density</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { area: "Koregaon Park", value: 65 },
                      { area: "Hinjewadi", value: 85 },
                      { area: "Kothrud", value: 45 },
                      { area: "Viman Nagar", value: 75 },
                      { area: "Baner", value: 62 },
                    ]}
                    margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
                  >
                    <XAxis dataKey="area" angle={-45} textAnchor="end" />
                    <YAxis />
                    <Tooltip />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Bar dataKey="value" fill="var(--color-primary)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Hotspot Analysis</CardTitle>
                <CardDescription>Top noise complaint locations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {PUNE_AREAS.slice(0, 6).map((area, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{area.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 rounded-full bg-muted overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{width: `${Math.round(Math.random() * 100)}%`}}
                          ></div>
                        </div>
                        <span className="text-xs font-medium">
                          {Math.round(30 + Math.random() * 70)} reports
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Time Distribution</CardTitle>
                <CardDescription>Reports by time of day</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { time: "12 AM", value: 10 },
                      { time: "3 AM", value: 5 },
                      { time: "6 AM", value: 15 },
                      { time: "9 AM", value: 42 },
                      { time: "12 PM", value: 35 },
                      { time: "3 PM", value: 45 },
                      { time: "6 PM", value: 58 },
                      { time: "9 PM", value: 40 },
                    ]}
                    margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
                  >
                    <XAxis dataKey="time" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="var(--color-primary)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Charts & Trends Tab */}
        <TabsContent value="charts" className="space-y-6">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-primary" />
                  Noise Level Trends
                </CardTitle>
                <CardDescription>
                  Daily and weekly patterns in noise levels across Pune
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      { day: "Mon", morning: 58, afternoon: 65, evening: 75 },
                      { day: "Tue", morning: 62, afternoon: 68, evening: 80 },
                      { day: "Wed", morning: 60, afternoon: 70, evening: 76 },
                      { day: "Thu", morning: 65, afternoon: 72, evening: 82 },
                      { day: "Fri", morning: 68, afternoon: 75, evening: 88 },
                      { day: "Sat", morning: 55, afternoon: 78, evening: 85 },
                      { day: "Sun", morning: 50, afternoon: 65, evening: 70 }
                    ]}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorMorning" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorAfternoon" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorEvening" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
                    <XAxis dataKey="day" tick={{ fill: 'var(--muted-foreground)' }} />
                    <YAxis label={{ value: 'Decibels (dB)', angle: -90, position: 'insideLeft', style: { fill: 'var(--muted-foreground)' } }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                      labelStyle={{ color: 'var(--foreground)' }}
                      formatter={(value) => [`${value} dB`, '']}
                    />
                    <Legend wrapperStyle={{ paddingTop: 10 }} />
                    <Area type="monotone" dataKey="morning" name="Morning (6-12)" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorMorning)" />
                    <Area type="monotone" dataKey="afternoon" name="Afternoon (12-18)" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorAfternoon)" />
                    <Area type="monotone" dataKey="evening" name="Evening (18-24)" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorEvening)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart2 className="mr-2 h-5 w-5 text-primary" />
                  Noise Source Distribution
                </CardTitle>
                <CardDescription>
                  Breakdown by noise source category and intensity
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { category: 'Traffic', count: 215, color: '#3b82f6' },
                      { category: 'Construction', count: 160, color: '#f59e0b' },
                      { category: 'Industrial', count: 95, color: '#ef4444' },
                      { category: 'Events', count: 75, color: '#8b5cf6' },
                      { category: 'Loudspeakers', count: 65, color: '#ec4899' },
                      { category: 'Restaurant/Bar', count: 55, color: '#14b8a6' },
                      { category: 'Other', count: 35, color: '#64748b' }
                    ]}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 100, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border)" opacity={0.6} />
                    <XAxis type="number" tick={{ fill: 'var(--muted-foreground)' }} />
                    <YAxis dataKey="category" type="category" scale="band" tick={{ fill: 'var(--muted-foreground)' }} width={90} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                      labelStyle={{ color: 'var(--foreground)' }}
                      formatter={(value) => [`${value} reports`, '']}
                    />
                    <Legend />
                    <Bar dataKey="count" name="Number of Reports">
                      {
                        [
                          { category: 'Traffic', count: 215, color: '#3b82f6' },
                          { category: 'Construction', count: 160, color: '#f59e0b' },
                          { category: 'Industrial', count: 95, color: '#ef4444' },
                          { category: 'Events', count: 75, color: '#8b5cf6' },
                          { category: 'Loudspeakers', count: 65, color: '#ec4899' },
                          { category: 'Restaurant/Bar', count: 55, color: '#14b8a6' },
                          { category: 'Other', count: 35, color: '#64748b' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))
                      }
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapIcon className="mr-2 h-5 w-5 text-primary" />
                  Area-Based Noise Comparison
                </CardTitle>
                <CardDescription>
                  Comparative analysis of different areas in Pune
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={PUNE_AREAS.map(area => ({
                      name: area.name,
                      avgNoise: Math.round(60 + Math.random() * 30),
                      peakNoise: Math.round(75 + Math.random() * 30)
                    }))}
                    margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} tick={{ fill: 'var(--muted-foreground)' }} />
                    <YAxis 
                      label={{ value: 'Decibels (dB)', angle: -90, position: 'insideLeft', style: { fill: 'var(--muted-foreground)' } }}
                      domain={[50, 90]} 
                      tick={{ fill: 'var(--muted-foreground)' }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                      labelStyle={{ color: 'var(--foreground)' }}
                      formatter={(value) => [`${value} dB`, '']}
                    />
                    <Legend wrapperStyle={{ paddingTop: 20 }} />
                    <Bar dataKey="avgNoise" name="Average Noise" fill="#3b82f6" />
                    <Bar dataKey="peakNoise" name="Peak Noise" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="col-span-1 md:col-span-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Time-of-Day Noise Patterns</CardTitle>
                  <CardDescription>Noise intensity by hour and day of week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] w-full">
                    {/* Compact Time-of-Day Heatmap */}
                    <div className="grid grid-cols-8 gap-1 h-full">
                      {/* Time labels on the left */}
                      <div className="col-span-1 grid grid-rows-6 text-xs text-muted-foreground">
                        <div className="flex items-center justify-end pr-2">Morning</div>
                        <div className="flex items-center justify-end pr-2">Noon</div>
                        <div className="flex items-center justify-end pr-2">Afternoon</div>
                        <div className="flex items-center justify-end pr-2">Evening</div>
                        <div className="flex items-center justify-end pr-2">Night</div>
                        <div className="flex items-center justify-end pr-2">Late Night</div>
                      </div>
                      
                      {/* Heatmap grid */}
                      <div className="col-span-7 grid grid-cols-7 gap-1 h-full">
                        {/* Day labels on top */}
                        <div className="col-span-7 grid grid-cols-7 text-xs text-center text-muted-foreground pb-1">
                          <div>Mon</div>
                          <div>Tue</div>
                          <div>Wed</div>
                          <div>Thu</div>
                          <div>Fri</div>
                          <div>Sat</div>
                          <div>Sun</div>
                        </div>
                        
                        {/* Actual heatmap cells */}
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, dayIndex) => (
                          <div key={day} className="grid grid-rows-6 gap-1 w-full">
                            {[
                              {timeRange: "5-9", label: "Morning"},
                              {timeRange: "9-12", label: "Noon"},
                              {timeRange: "12-16", label: "Afternoon"},
                              {timeRange: "16-20", label: "Evening"},
                              {timeRange: "20-24", label: "Night"},
                              {timeRange: "0-5", label: "Late Night"}
                            ].map((timeSlot, timeIndex) => {
                              // Intensity calculation based on day and time
                              // In a real app, this would come from actual data
                              let intensity;
                              
                              // Simulate noise patterns (higher on weekends and evenings)
                              if (dayIndex >= 5) { // Weekend
                                intensity = timeIndex === 3 || timeIndex === 4 ? 0.9 : 
                                           timeIndex === 2 ? 0.7 : 
                                           timeIndex === 5 ? 0.8 : 0.5;
                              } else { // Weekday
                                intensity = timeIndex === 3 ? 0.8 : 
                                           timeIndex === 2 || timeIndex === 4 ? 0.6 : 
                                           timeIndex === 5 ? 0.3 : 0.4;
                              }
                              
                              // Apply traffic patterns for morning/evening rush hours
                              if ((timeIndex === 0 || timeIndex === 3) && dayIndex < 5) {
                                intensity += 0.15; // Rush hours on weekdays
                              }
                              
                              // Clamp intensity between 0-1
                              intensity = Math.min(1, Math.max(0, intensity));
                              
                              // Color based on intensity
                              const getHeatmapColor = (value) => {
                                // Generate a color from green to red based on intensity
                                if (value < 0.3) return "#4ade80"; // Green
                                if (value < 0.5) return "#facc15"; // Yellow
                                if (value < 0.7) return "#fb923c"; // Orange
                                if (value < 0.85) return "#f87171"; // Light red
                                return "#ef4444"; // Red
                              };
                              
                              return (
                                <div 
                                  key={`${day}-${timeSlot.timeRange}`}
                                  className="w-full rounded-sm flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
                                  style={{ 
                                    backgroundColor: getHeatmapColor(intensity),
                                    opacity: 0.3 + (intensity * 0.7) // Scale opacity for visual effect
                                  }}
                                  title={`${day} ${timeSlot.label}: ${Math.round(intensity * 100)}% noise level`}
                                >
                                  {intensity > 0.7 && (
                                    <span className="text-[8px] font-bold text-white">
                                      {Math.round(intensity * 100)}%
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#4ade80" }}></div>
                      <span>Low</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#facc15" }}></div>
                      <span>Moderate</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#fb923c" }}></div>
                      <span>High</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#ef4444" }}></div>
                      <span>Very High</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUpIcon className="mr-2 h-5 w-5 text-primary" />
                Annual Noise Pollution Trends
              </CardTitle>
              <CardDescription>
                Long-term analysis of noise pollution in Pune with seasonal patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { month: "Jan", traffic: 65, construction: 55, industrial: 70, events: 60 },
                    { month: "Feb", traffic: 68, construction: 58, industrial: 72, events: 62 },
                    { month: "Mar", traffic: 70, construction: 65, industrial: 75, events: 68 },
                    { month: "Apr", traffic: 72, construction: 70, industrial: 78, events: 75 },
                    { month: "May", traffic: 75, construction: 72, industrial: 80, events: 80 },
                    { month: "Jun", traffic: 68, construction: 60, industrial: 72, events: 72 },
                    { month: "Jul", traffic: 62, construction: 52, industrial: 68, events: 65 },
                    { month: "Aug", traffic: 60, construction: 50, industrial: 65, events: 60 },
                    { month: "Sep", traffic: 65, construction: 58, industrial: 70, events: 68 },
                    { month: "Oct", traffic: 70, construction: 65, industrial: 75, events: 78 },
                    { month: "Nov", traffic: 75, construction: 70, industrial: 78, events: 82 },
                    { month: "Dec", traffic: 80, construction: 72, industrial: 82, events: 85 }
                  ]}
                  margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
                  <XAxis dataKey="month" tick={{ fill: 'var(--muted-foreground)' }} />
                  <YAxis 
                    label={{ value: 'Average dB', angle: -90, position: 'insideLeft', style: { fill: 'var(--muted-foreground)' } }}
                    domain={[50, 90]} 
                    tick={{ fill: 'var(--muted-foreground)' }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                    labelStyle={{ color: 'var(--foreground)' }}
                    formatter={(value) => [`${value} dB`, '']}
                  />
                  <Legend wrapperStyle={{ paddingTop: 10 }} />
                  <Line type="monotone" dataKey="traffic" name="Traffic Noise" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="construction" name="Construction Noise" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="industrial" name="Industrial Noise" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="events" name="Events & Festivals" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* NoiseSense AI Insights Tab */}
        <TabsContent value="ai-insights" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="md:col-span-2 lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BrainCircuit className="mr-2 h-5 w-5 text-primary" />
                  NoiseSense AI Assistant
                </CardTitle>
                <CardDescription>
                  Ask questions about noise data to get AI-powered insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAiSearchSubmit} className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Ask a question about noise data (e.g., 'Show me high noise areas at night')"
                      value={aiQuery}
                      onChange={e => setAiQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={isAiSearching}>
                      {isAiSearching ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  {aiExplanation && (
                    <Alert>
                      <Brain className="h-4 w-4" />
                      <AlertDescription>
                        {aiExplanation}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {aiSearchResults.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-2">AI Search Results</h3>
                      <div className="border rounded-md overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Type</TableHead>
                              <TableHead>Location</TableHead>
                              <TableHead>dB Level</TableHead>
                              <TableHead>Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {aiSearchResults.slice(0, 5).map((result, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{result.noise_type}</TableCell>
                                <TableCell className="truncate max-w-[150px]">{result.address}</TableCell>
                                <TableCell>{result.decibel_level} dB</TableCell>
                                <TableCell>{new Date(result.created_at).toLocaleDateString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>AI Predictions</CardTitle>
                <CardDescription>Forecasted noise trends</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { month: "Jan", actual: 58, predicted: null },
                      { month: "Feb", actual: 62, predicted: null },
                      { month: "Mar", actual: 65, predicted: null },
                      { month: "Apr", actual: 70, predicted: null },
                      { month: "May", actual: 75, predicted: null },
                      { month: "Jun", actual: 80, predicted: null },
                      { month: "Jul", actual: null, predicted: 78 },
                      { month: "Aug", actual: null, predicted: 75 },
                      { month: "Sep", actual: null, predicted: 80 },
                      { month: "Oct", actual: null, predicted: 85 },
                      { month: "Nov", actual: null, predicted: 70 },
                      { month: "Dec", actual: null, predicted: 65 },
                    ]}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="actual" stroke="#8884d8" />
                    <Line type="monotone" dataKey="predicted" stroke="#82ca9d" strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="mr-2 h-5 w-5 text-primary" />
                AI Generated Insights
              </CardTitle>
              <CardDescription>
                Automatically generated observations and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-md bg-muted/40">
                  <h3 className="text-base font-medium mb-2">Key Findings</h3>
                  <ul className="space-y-2 list-disc pl-4">
                    <li>Traffic noise is the most reported issue across Pune, accounting for 38% of all reports</li>
                    <li>Construction noise complaints have increased by 25% in the last month</li>
                    <li>The average noise level in Hinjewadi IT Park is 72dB, exceeding recommended levels</li>
                    <li>Evening hours (6-10 PM) show the highest concentration of noise complaints</li>
                    <li>82% of dangerous noise level reports (80+ dB) are from industrial and construction sources</li>
                  </ul>
                </div>
                
                <div className="p-4 border rounded-md bg-muted/40">
                  <h3 className="text-base font-medium mb-2">AI Recommendations</h3>
                  <ul className="space-y-2 list-disc pl-4">
                    <li>Increase enforcement of noise regulations in Hinjewadi area during evening hours</li>
                    <li>Implement sound barriers along main traffic corridors in Koregaon Park</li>
                    <li>Review construction permits in residential areas to limit working hours</li>
                    <li>Deploy mobile noise monitoring stations to the top 5 hotspots</li>
                    <li>Launch a public awareness campaign targeting vehicle noise reduction</li>
                  </ul>
                </div>
                
                <div className="p-4 border rounded-md bg-muted/40">
                  <h3 className="text-base font-medium mb-2">Noise Impact Analysis</h3>
                  <p>The AI analysis indicates that current noise levels in 28% of monitored areas exceed WHO recommendations for urban environments, potentially impacting public health. Continuous exposure above 70dB is linked to stress, sleep disturbances, and potential hearing damage.</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
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
              <div className="space-y-6">
                {[
                  { factor: "Traffic Density", correlationStrength: 0.85, description: "Strong correlation between traffic volume and noise levels" },
                  { factor: "Time of Day", correlationStrength: 0.72, description: "Peak noise levels align with rush hours (9 AM and 6 PM)" },
                  { factor: "Construction Activity", correlationStrength: 0.68, description: "Areas with active construction show elevated noise levels" },
                  { factor: "Population Density", correlationStrength: 0.64, description: "Higher population areas generally report more noise issues" },
                  { factor: "Commercial Zoning", correlationStrength: 0.59, description: "Commercial zones show higher noise levels after business hours" }
                ].map((correlation, idx) => (
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
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-semibold">Noise Reports</h2>
              <Badge variant="outline" className="font-normal">
                {filteredReports.length} reports
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setShowAiSearch(true)}>
                <Brain className="mr-2 h-4 w-4" />
                AI Search
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowExportOptions(!showExportOptions)}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              {showExportOptions && (
                <div className="absolute right-4 mt-28 z-50 bg-background rounded-md shadow-md border border-border p-2 flex flex-col space-y-1">
                  <Button variant="ghost" size="sm" className="justify-start" onClick={() => exportData('csv')}>
                    CSV Format
                  </Button>
                  <Button variant="ghost" size="sm" className="justify-start" onClick={() => exportData('json')}>
                    JSON Format
                  </Button>
                  <Button variant="ghost" size="sm" className="justify-start" onClick={() => exportData('pdf')}>
                    PDF Format
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="w-full sm:w-2/3 space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>Report List</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-36">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="unresolved">Unresolved</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="escalated">Escalated</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search reports..."
                          className="pl-8 w-60"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Area</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Level</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                            </TableCell>
                          </TableRow>
                        ) : paginatedReports.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                              No reports found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedReports.map((report) => (
                            <TableRow key={report.id} className="group">
                              <TableCell className="font-mono text-xs">
                                {report.id.substring(0, 8)}...
                              </TableCell>
                              <TableCell className="max-w-[150px] truncate">
                                {report.address}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{report.noise_type}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`h-2.5 w-2.5 rounded-full ${
                                      report.decibel_level >= 80
                                        ? "bg-red-500"
                                        : report.decibel_level >= 65
                                        ? "bg-orange-500"
                                        : report.decibel_level >= 50
                                        ? "bg-yellow-500"
                                        : "bg-green-500"
                                    }`}
                                  />
                                  <span>{report.decibel_level} dB</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    report.status === "resolved"
                                      ? "default"
                                      : report.status === "in-progress"
                                      ? "secondary"
                                      : report.status === "escalated"
                                      ? "destructive"
                                      : "outline"
                                  }
                                >
                                  {report.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {new Date(report.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <DotsHorizontalIcon className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleViewReport(report)}>
                                      <EyeIcon className="mr-2 h-4 w-4" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => handleStatusChange(report.id, "in-progress")}
                                    >
                                      <Activity className="mr-2 h-4 w-4" />
                                      Mark In Progress
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleStatusChange(report.id, "resolved")}
                                    >
                                      <ActivityIcon className="mr-2 h-4 w-4" />
                                      Mark Resolved
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleStatusChange(report.id, "escalated")}
                                    >
                                      <AlertTriangleIcon className="mr-2 h-4 w-4" />
                                      Escalate
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleFlagToggle(report.id)}>
                                      <Flag className="mr-2 h-4 w-4" />
                                      {report.flagged ? "Remove Flag" : "Flag Report"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                      setSelectedReport(report);
                                      setShowForwardDialog(true);
                                    }}>
                                      <Share2 className="mr-2 h-4 w-4" />
                                      Forward to Department
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

                  {/* Pagination Controls */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {Math.min(1 + (currentPage - 1) * reportsPerPage, filteredReports.length)} to{" "}
                      {Math.min(currentPage * reportsPerPage, filteredReports.length)} of{" "}
                      {filteredReports.length} reports
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
                      <div className="flex items-center">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          // Show pages around current page
                          let pageToShow;
                          if (totalPages <= 5) {
                            pageToShow = i + 1;
                          } else if (currentPage <= 3) {
                            pageToShow = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageToShow = totalPages - 4 + i;
                          } else {
                            pageToShow = currentPage - 2 + i;
                          }
                          
                          return (
                            <Button
                              key={i}
                              variant={currentPage === pageToShow ? "default" : "outline"}
                              size="sm"
                              className="w-8 h-8 mx-0.5"
                              onClick={() => setCurrentPage(pageToShow)}
                            >
                              {pageToShow}
                            </Button>
                          );
                        })}
                        {totalPages > 5 && currentPage < totalPages - 2 && (
                          <>
                            {currentPage < totalPages - 3 && (
                              <span className="mx-1 text-muted-foreground">...</span>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-8 h-8 mx-0.5"
                              onClick={() => setCurrentPage(totalPages)}
                            >
                              {totalPages}
                            </Button>
                          </>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                      <Select
                        value={reportsPerPage.toString()}
                        onValueChange={(value) => {
                          setReportsPerPage(parseInt(value));
                          setCurrentPage(1);
                        }}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue placeholder="Show" />
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
                </CardContent>
              </Card>
            </div>

            <div className="w-full sm:w-1/3 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Report Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="border rounded-md p-3 flex flex-col">
                            <span className="text-sm text-muted-foreground">Total Reports</span>
                            <span className="text-2xl font-semibold">{stats.total}</span>
                          </div>
                          <div className="border rounded-md p-3 flex flex-col">
                            <span className="text-sm text-muted-foreground">Avg. Decibel</span>
                            <span className="text-2xl font-semibold">{stats.avgDecibel} dB</span>
                          </div>
                          <div className="border rounded-md p-3 flex flex-col">
                            <span className="text-sm text-muted-foreground">Flagged</span>
                            <span className="text-2xl font-semibold">{stats.flaggedCount}</span>
                          </div>
                          <div className="border rounded-md p-3 flex flex-col">
                            <span className="text-sm text-muted-foreground">Dangerous Levels</span>
                            <span className="text-2xl font-semibold text-red-500">{stats.dangerousCount}</span>
                          </div>
                        </div>

                        <div className="pt-4">
                          <h3 className="text-sm font-medium mb-3">Noise Level Distribution</h3>
                          <div className="space-y-3">
                            {noiseCategories.map((category, index) => (
                              <div key={index} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span>{category.category}</span>
                                  <span>{category.percentage}%</span>
                                </div>
                                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${category.color}`}
                                    style={{ width: `${category.percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-4">
                          <h3 className="text-sm font-medium mb-2">Common Noise Types</h3>
                          <div className="h-[180px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={Object.entries(stats.noiseTypeCounts).map(([type, count]) => ({
                                    name: type,
                                    value: count
                                  }))}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={45}
                                  outerRadius={70}
                                  fill="#8884d8"
                                  paddingAngle={2}
                                  dataKey="value"
                                  nameKey="name"
                                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                  labelLine={false}
                                >
                                  {Object.entries(stats.noiseTypeCounts).map((_, index) => {
                                    const COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#64748b'];
                                    return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                                  })}
                                </Pie>
                                <Tooltip 
                                  formatter={(value, name) => [value, name]}
                                  contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" onClick={() => exportData('csv')}>
                      <Download className="mr-2 h-4 w-4" />
                      Export All Reports
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => setShowReportGenerator(true)}>
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => setShowAiSearch(true)}>
                      <Brain className="mr-2 h-4 w-4" />
                      AI-Powered Search
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => {
                      const unresolved = noiseReports.filter(report => report.status !== "resolved");
                      setFilteredReports(unresolved);
                      setStatusFilter("all");
                      setSearchTerm("");
                      toast({
                        title: "Filter Applied",
                        description: `Showing ${unresolved.length} unresolved reports`
                      });
                    }}>
                      <AlertTriangleIcon className="mr-2 h-4 w-4" />
                      Show Unresolved
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => {
                      const dangerous = noiseReports.filter(report => report.decibel_level >= 80);
                      setFilteredReports(dangerous);
                      setStatusFilter("all");
                      setSearchTerm("");
                      toast({
                        title: "Filter Applied",
                        description: `Showing ${dangerous.length} dangerous noise level reports`
                      });
                    }}>
                      <Activity className="mr-2 h-4 w-4" />
                      Show Dangerous Levels
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Report View Dialog */}
          <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              {selectedReport && (
                <>
                  <DialogHeader>
                    <div className="flex justify-between items-center">
                      <DialogTitle>Report Details</DialogTitle>
                      <Badge
                        variant={
                          selectedReport.status === "resolved"
                            ? "default"
                            : selectedReport.status === "in-progress"
                            ? "secondary"
                            : selectedReport.status === "escalated"
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {selectedReport.status}
                      </Badge>
                    </div>
                    <DialogDescription>
                      Submitted on {new Date(selectedReport.created_at).toLocaleString()}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium">Noise Information</h3>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div className="border rounded-md p-3">
                            <span className="text-sm text-muted-foreground">Noise Type</span>
                            <div className="font-medium mt-1">{selectedReport.noise_type}</div>
                          </div>
                          <div className="border rounded-md p-3">
                            <span className="text-sm text-muted-foreground">Decibel Level</span>
                            <div className="font-medium mt-1 flex items-center">
                              <div
                                className={`h-2.5 w-2.5 rounded-full mr-2 ${
                                  selectedReport.decibel_level >= 80
                                    ? "bg-red-500"
                                    : selectedReport.decibel_level >= 65
                                    ? "bg-orange-500"
                                    : selectedReport.decibel_level >= 50
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                }`}
                              />
                              {selectedReport.decibel_level} dB
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium">Location Details</h3>
                        <div className="grid grid-cols-1 gap-4 mt-2">
                          <div className="border rounded-md p-3">
                            <span className="text-sm text-muted-foreground">Address</span>
                            <div className="font-medium mt-1">{selectedReport.address}</div>
                          </div>
                          <div className="border rounded-md p-3">
                            <span className="text-sm text-muted-foreground">Coordinates</span>
                            <div className="font-medium mt-1">
                              {selectedReport.latitude.toFixed(6)}, {selectedReport.longitude.toFixed(6)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium">Additional Information</h3>
                        <div className="border rounded-md p-3 mt-2">
                          <span className="text-sm text-muted-foreground">Notes</span>
                          <div className="font-medium mt-1">
                            {selectedReport.notes || "No additional notes provided."}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="border rounded-md overflow-hidden h-48">
                        <NoiseLevelsMap data={[selectedReport]} />
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-2">Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                          <Button variant="outline" size="sm" onClick={() => handleStatusChange(selectedReport.id, "in-progress")}>
                            <Activity className="mr-2 h-4 w-4" />
                            Mark In Progress
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleStatusChange(selectedReport.id, "resolved")}>
                            <ActivityIcon className="mr-2 h-4 w-4" />
                            Mark Resolved
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleStatusChange(selectedReport.id, "escalated")}>
                            <AlertTriangleIcon className="mr-2 h-4 w-4" />
                            Escalate
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleFlagToggle(selectedReport.id)}>
                            <Flag className="mr-2 h-4 w-4" />
                            {selectedReport.flagged ? "Remove Flag" : "Flag Report"}
                          </Button>
                          <Button variant="outline" size="sm" className="col-span-2" onClick={() => {
                            setShowReportModal(false);
                            setShowForwardDialog(true);
                          }}>
                            <Share2 className="mr-2 h-4 w-4" />
                            Forward to Department
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-2">Similar Reports</h3>
                        <ScrollArea className="h-48 border rounded-md p-2">
                          {noiseReports.filter(r => 
                            r.id !== selectedReport.id && 
                            (r.noise_type === selectedReport.noise_type || 
                             Math.abs(r.latitude - selectedReport.latitude) < 0.01)
                          ).slice(0, 5).map(report => (
                            <div key={report.id} className="p-2 hover:bg-muted rounded-md cursor-pointer mb-2" onClick={() => {
                              setSelectedReport(report);
                            }}>
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium text-sm">{report.noise_type}</div>
                                  <div className="text-xs text-muted-foreground truncate max-w-[180px]">{report.address}</div>
                                </div>
                                <Badge variant="outline" className="text-xs">{report.decibel_level} dB</Badge>
                              </div>
                            </div>
                          ))}
                        </ScrollArea>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* AI Search Dialog */}
          <Dialog open={showAiSearch} onOpenChange={setShowAiSearch}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Brain className="mr-2 h-5 w-5 text-primary" />
                  AI-Powered Search
                </DialogTitle>
                <DialogDescription>
                  Ask natural language questions about noise reports
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleAiSearchSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ai-query">Your Query</Label>
                  <Input
                    id="ai-query"
                    placeholder="e.g., 'Find loud noise reports in Koregaon Park after 10pm'"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                  />
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p>Example queries:</p>
                  <ul className="list-disc pl-4 space-y-1 mt-1">
                    <li>High noise levels in residential areas</li>
                    <li>Reports filed last weekend</li>
                    <li>Construction noise near schools</li>
                    <li>Nighttime noise violations</li>
                  </ul>
                </div>
                
                <DialogFooter>
                  <Button type="submit" disabled={isAiSearching}>
                    {isAiSearching ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <SearchIcon className="mr-2 h-4 w-4" />
                        Search
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Notification Settings Card */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Configure how you receive alerts and notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-xs text-muted-foreground">
                        Receive email alerts for high-priority noise events
                      </p>
                    </div>
                    <Switch 
                      id="emailNotifications" 
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({...notificationSettings, emailNotifications: checked})
                      }
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="reportThreshold">Alert Threshold (dB)</Label>
                      <span className="text-sm font-medium">
                        {notificationSettings.reportThreshold} dB
                      </span>
                    </div>
                    <Slider
                      id="reportThreshold"
                      min={60}
                      max={100}
                      step={5}
                      value={[notificationSettings.reportThreshold]}
                      onValueChange={(value) => 
                        setNotificationSettings({...notificationSettings, reportThreshold: value[0]})
                      }
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Notify when noise levels exceed this threshold
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="dailyDigest">Daily Summary</Label>
                      <p className="text-xs text-muted-foreground">
                        Receive a daily digest of all noise reports
                      </p>
                    </div>
                    <Switch 
                      id="dailyDigest" 
                      checked={notificationSettings.dailyDigest}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({...notificationSettings, dailyDigest: checked})
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="alertSound">Alert Sounds</Label>
                      <p className="text-xs text-muted-foreground">
                        Play sound when new reports arrive
                      </p>
                    </div>
                    <Switch 
                      id="alertSound" 
                      checked={notificationSettings.alertSound}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({...notificationSettings, alertSound: checked})
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* System Settings Card */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Settings
                </CardTitle>
                <CardDescription>
                  Configure core system behavior and defaults
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dataRetention">Data Retention (days)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="dataRetention"
                        type="number"
                        min={30}
                        max={365}
                        value={systemSettings.dataRetentionDays}
                        onChange={(e) => 
                          setSystemSettings({
                            ...systemSettings, 
                            dataRetentionDays: parseInt(e.target.value) || 90
                          })
                        }
                      />
                      <span className="text-sm text-muted-foreground">days</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      How long to keep noise report data
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoArchive">Auto-Archive</Label>
                      <p className="text-xs text-muted-foreground">
                        Automatically archive resolved reports
                      </p>
                    </div>
                    <Switch 
                      id="autoArchive" 
                      checked={systemSettings.autoArchive}
                      onCheckedChange={(checked) => 
                        setSystemSettings({...systemSettings, autoArchive: checked})
                      }
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mapDefaultView">Default Map View</Label>
                    <Select 
                      value={systemSettings.mapDefaultView}
                      onValueChange={(value) => 
                        setSystemSettings({...systemSettings, mapDefaultView: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select map view" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="heatmap">Heat Map</SelectItem>
                        <SelectItem value="markers">Markers</SelectItem>
                        <SelectItem value="clusters">Clusters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="defaultZoom">Default Zoom Level</Label>
                      <span className="text-sm font-medium">
                        {systemSettings.defaultZoomLevel}
                      </span>
                    </div>
                    <Slider
                      id="defaultZoom"
                      min={8}
                      max={18}
                      step={1}
                      value={[systemSettings.defaultZoomLevel]}
                      onValueChange={(value) => 
                        setSystemSettings({...systemSettings, defaultZoomLevel: value[0]})
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* AI Settings Card */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5" />
                  AI & Analytics Settings
                </CardTitle>
                <CardDescription>
                  Configure AI-powered insights and analytics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enableAi">Enable AI Insights</Label>
                      <p className="text-xs text-muted-foreground">
                        Use AI to analyze noise patterns and trends
                      </p>
                    </div>
                    <Switch 
                      id="enableAi" 
                      checked={aiSettings.enableAiInsights}
                      onCheckedChange={(checked) => 
                        setAiSettings({...aiSettings, enableAiInsights: checked})
                      }
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="insightFrequency">Insight Frequency</Label>
                    <Select 
                      value={aiSettings.insightFrequency}
                      onValueChange={(value) => 
                        setAiSettings({...aiSettings, insightFrequency: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      How often to generate new AI insights
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="saveQueries">Save Search Queries</Label>
                      <p className="text-xs text-muted-foreground">
                        Save AI search history for better results
                      </p>
                    </div>
                    <Switch 
                      id="saveQueries" 
                      checked={aiSettings.saveSearchQueries}
                      onCheckedChange={(checked) => 
                        setAiSettings({...aiSettings, saveSearchQueries: checked})
                      }
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="aiModel">Preferred AI Model</Label>
                    <Select 
                      value={aiSettings.preferredModel}
                      onValueChange={(value) => 
                        setAiSettings({...aiSettings, preferredModel: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select AI model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                        <SelectItem value="claude">Claude</SelectItem>
                        <SelectItem value="gemini">Gemini</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Export & Reports Card */}
            <Card className="col-span-1 lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Export & Report Settings
                </CardTitle>
                <CardDescription>
                  Configure default export formats and report generation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="defaultFormat">Default Export Format</Label>
                    <Select 
                      value={exportSettings.defaultFormat}
                      onValueChange={(value) => 
                        setExportSettings({...exportSettings, defaultFormat: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <Label htmlFor="includeCharts">Include Charts</Label>
                      <p className="text-xs text-muted-foreground">
                        Include visualizations in reports
                      </p>
                    </div>
                    <Switch 
                      id="includeCharts" 
                      checked={exportSettings.includeCharts}
                      onCheckedChange={(checked) => 
                        setExportSettings({...exportSettings, includeCharts: checked})
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <Label htmlFor="compressFiles">Compress Files</Label>
                      <p className="text-xs text-muted-foreground">
                        Compress exported reports as ZIP
                      </p>
                    </div>
                    <Switch 
                      id="compressFiles" 
                      checked={exportSettings.compressFiles}
                      onCheckedChange={(checked) => 
                        setExportSettings({...exportSettings, compressFiles: checked})
                      }
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="defaultRecipients">Default Recipients</Label>
                    <Input
                      id="defaultRecipients"
                      placeholder="email1@example.com, email2@example.com"
                      value={exportSettings.defaultRecipients}
                      onChange={(e) => 
                        setExportSettings({...exportSettings, defaultRecipients: e.target.value})
                      }
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <Button variant="outline" onClick={() => {
                  // Reset all settings to default
                  setNotificationSettings({
                    emailNotifications: true,
                    reportThreshold: 80,
                    dailyDigest: false,
                    alertSound: true,
                  });
                  setSystemSettings({
                    dataRetentionDays: 90,
                    autoArchive: true,
                    mapDefaultView: "heatmap",
                    defaultZoomLevel: 12,
                  });
                  setAiSettings({
                    enableAiInsights: true,
                    insightFrequency: "weekly",
                    saveSearchQueries: true,
                    preferredModel: "gpt-4",
                  });
                  setExportSettings({
                    defaultFormat: "csv",
                    includeCharts: true,
                    compressFiles: false,
                    defaultRecipients: "",
                  });
                }}>
                  Reset to Default
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button onClick={saveSettings}>
                    Save Settings
                  </Button>
                </div>
              </CardFooter>
            </Card>
            
            {/* Backup & Restore Card */}
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Save className="h-5 w-5" />
                  Backup & Restore
                </CardTitle>
                <CardDescription>
                  Backup your data and settings or restore from backup
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Create Backup</Label>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="w-full" onClick={() => {
                      // Create a backup of all settings and data
                      const backup = {
                        notificationSettings,
                        systemSettings,
                        aiSettings,
                        exportSettings,
                        timestamp: new Date().toISOString(),
                        version: "1.0.0"
                      };
                      
                      // Convert to JSON and create a download link
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup));
                      const downloadAnchorNode = document.createElement('a');
                      downloadAnchorNode.setAttribute("href", dataStr);
                      downloadAnchorNode.setAttribute("download", `noisesense-backup-${new Date().toISOString().slice(0, 10)}.json`);
                      document.body.appendChild(downloadAnchorNode);
                      downloadAnchorNode.click();
                      downloadAnchorNode.remove();
                      
                      toast({
                        title: "Backup created",
                        description: "Your settings have been exported to a JSON file.",
                        duration: 3000,
                      });
                    }}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Settings
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Creates a JSON file with all your settings
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Restore from Backup</Label>
                  <div className="flex flex-col gap-2">
                    <Input
                      id="backupFile"
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            try {
                              const backup = JSON.parse(event.target?.result as string);
                              
                              // Validate backup format
                              if (backup.notificationSettings && backup.systemSettings && 
                                  backup.aiSettings && backup.exportSettings) {
                                // Apply settings from backup
                                setNotificationSettings(backup.notificationSettings);
                                setSystemSettings(backup.systemSettings);
                                setAiSettings(backup.aiSettings);
                                setExportSettings(backup.exportSettings);
                                
                                toast({
                                  title: "Settings restored",
                                  description: `Backup from ${new Date(backup.timestamp).toLocaleDateString()} restored successfully.`,
                                  duration: 3000,
                                });
                              } else {
                                toast({
                                  title: "Invalid backup file",
                                  description: "The file doesn't contain valid settings data.",
                                  variant: "destructive",
                                  duration: 5000,
                                });
                              }
                            } catch (error) {
                              toast({
                                title: "Failed to restore settings",
                                description: "The backup file is corrupted or invalid.",
                                variant: "destructive",
                                duration: 5000,
                              });
                            }
                          };
                          reader.readAsText(file);
                        }
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Restore settings from a previously exported backup file
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Database Management Card */}
            <Card className="col-span-1 lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Management
                </CardTitle>
                <CardDescription>
                  Manage your database and data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Button variant="outline" className="w-full" onClick={() => {
                    // Show confirmation dialog before purging data
                    if (window.confirm("Are you sure you want to clean up old data? This will remove all resolved reports older than the data retention period.")) {
                      // Simulate database cleanup
                      setTimeout(() => {
                        toast({
                          title: "Database cleaned",
                          description: `Old data has been successfully purged.`,
                          duration: 3000,
                        });
                      }, 1500);
                    }
                  }}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clean Old Data
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Remove resolved reports older than {systemSettings.dataRetentionDays} days
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Button variant="outline" className="w-full" onClick={() => {
                    // Show loading state
                    toast({
                      title: "Optimizing database",
                      description: "This may take a few moments...",
                      duration: 2000,
                    });
                    
                    // Simulate database optimization
                    setTimeout(() => {
                      toast({
                        title: "Database optimized",
                        description: "Database indexes and tables have been optimized.",
                        duration: 3000,
                      });
                    }, 3000);
                  }}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Optimize Database
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Optimize database performance and indexes
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Dialogs and other modals will be kept */}
      
      {/* Report Generator Dialog - Completely Redesigned */}
      <Dialog open={showReportGenerator} onOpenChange={setShowReportGenerator}>
        <DialogContent className="max-w-7xl max-h-[90vh] flex flex-col p-0 gap-0 bg-background">
          <div className="sticky top-0 z-[100] bg-background border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl">Analytics Report Builder</DialogTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowReportGenerator(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription className="mt-1">
              Create customized analytics reports for noise pollution data
            </DialogDescription>
          </div>
          
          <div className="grid grid-cols-12 h-full overflow-hidden">
            {/* Left Sidebar - Controls */}
            <div className="col-span-12 md:col-span-3 border-r overflow-y-auto p-4 max-h-[calc(90vh-80px)]">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-medium">Report Type</h3>
                  <div className="grid grid-cols-1 gap-2">
                    <Button 
                      variant={reportType === "summary" ? "default" : "outline"} 
                      size="sm"
                      className="justify-start"
                      onClick={() => setReportType("summary")}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Executive Summary
                    </Button>
                    <Button 
                      variant={reportType === "detailed" ? "default" : "outline"} 
                      size="sm"
                      className="justify-start"
                      onClick={() => setReportType("detailed")}
                    >
                      <BarChart2 className="h-4 w-4 mr-2" />
                      Detailed Analytics
                    </Button>
                    <Button 
                      variant={reportType === "custom" ? "default" : "outline"} 
                      size="sm"
                      className="justify-start"
                      onClick={() => setReportType("custom")}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Custom Report
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="font-medium">Date Filter</h3>
                  <div className="bg-muted/50 p-3 rounded-lg report-date-filter">
                    <div className="text-sm font-medium mb-2 text-center">
                      {reportFilters.dateRange?.from ? (
                        reportFilters.dateRange.to ? (
                          <span>From {format(reportFilters.dateRange.from, "MMM dd")} to {format(reportFilters.dateRange.to, "MMM dd, yyyy")}</span>
                        ) : (
                          <span>Selected: {format(reportFilters.dateRange.from, "MMMM d, yyyy")}</span>
                        )
                      ) : (
                        <span>Select a date range</span>
                      )}
                    </div>
                    <Calendar
                      mode="range"
                      selected={reportFilters.dateRange}
                      onSelect={(range) => setReportFilters({...reportFilters, dateRange: range})}
                      numberOfMonths={1}
                      className="w-full"
                      showOutsideDays={false}
                      fixedWeeks
                      classNames={{
                        months: "flex flex-col space-y-4",
                        month: "space-y-4",
                        caption: "flex justify-center relative items-center",
                        caption_label: "text-sm font-medium",
                        nav: "flex items-center space-x-1",
                        nav_button: "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100",
                        nav_button_previous: "absolute left-1",
                        nav_button_next: "absolute right-1",
                        table: "w-full border-collapse",
                        head_row: "flex",
                        head_cell: "text-muted-foreground w-9 font-normal text-[0.8rem]",
                        row: "flex w-full",
                        cell: "text-center text-sm relative p-0 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                        day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                        day_range_end: "day-range-end",
                        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                        day_today: "bg-accent/50 text-accent-foreground",
                        day_outside: "text-muted-foreground opacity-50",
                        day_disabled: "text-muted-foreground opacity-50",
                        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                        day_hidden: "invisible",
                        caption_dropdowns: "flex justify-center space-x-2 py-2 text-sm",
                      }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // Set to last 7 days
                        const today = new Date();
                        const sevenDaysAgo = new Date();
                        sevenDaysAgo.setDate(today.getDate() - 7);
                        setReportFilters({
                          ...reportFilters,
                          dateRange: {
                            from: sevenDaysAgo,
                            to: today
                          }
                        });
                      }}
                    >
                      Last 7 days
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Clear date range
                        setReportFilters({
                          ...reportFilters,
                          dateRange: undefined
                        });
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h3 className="font-medium">Noise Types</h3>
                  
                  <div className="space-y-2">
                    {["Traffic", "Construction", "Industrial", "Music", "Other"].map(type => (
                      <div key={type} className="flex items-center">
                        <Checkbox 
                          id={`type-${type}`}
                          checked={reportFilters.noiseTypes.includes(type)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setReportFilters({
                                ...reportFilters, 
                                noiseTypes: [...reportFilters.noiseTypes, type]
                              });
                            } else {
                              setReportFilters({
                                ...reportFilters, 
                                noiseTypes: reportFilters.noiseTypes.filter(t => t !== type)
                              });
                            }
                          }}
                        />
                        <label htmlFor={`type-${type}`} className="ml-2 text-sm cursor-pointer">
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h3 className="font-medium">Noise Level</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{reportFilters.minDecibel} dB</span>
                      <span>{reportFilters.maxDecibel} dB</span>
                    </div>
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
                          });
                        }
                      }}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h3 className="font-medium">Report Content</h3>
                  
                  <div className="space-y-2">
                    {[
                      { id: "includeCharts", label: "Charts & Graphs" },
                      { id: "includeLocationData", label: "Location Data" },
                      { id: "includeSummaryStats", label: "Summary Statistics" },
                    ].map(item => (
                      <div key={item.id} className="flex items-center">
                        <Checkbox 
                          id={item.id}
                          checked={reportFilters[item.id]}
                          onCheckedChange={(checked) => {
                            setReportFilters({
                              ...reportFilters, 
                              [item.id]: !!checked
                            });
                          }}
                        />
                        <label htmlFor={item.id} className="ml-2 text-sm cursor-pointer">
                          {item.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button 
                    onClick={generateReport} 
                    disabled={isGeneratingReport}
                    className="w-full"
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
                  
                  <Button 
                    variant="outline"
                    onClick={resetReportFilters}
                    className="w-full mt-2"
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Right Content - Preview */}
            <div className="col-span-12 md:col-span-9 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Report Preview</h2>
                  <Badge variant="outline">{reportType.charAt(0).toUpperCase() + reportType.slice(1)}</Badge>
                </div>
                
                {isGeneratingReport ? (
                  <div className="flex flex-col items-center justify-center h-[40vh]">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">Generating advanced analytics report...</p>
                  </div>
                ) : reportData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[40vh] bg-muted/30 rounded-lg border border-dashed">
                    <FileBarChart2 className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No report data generated yet</p>
                    <p className="text-sm text-muted-foreground mb-4">Set your filters and generate a report</p>
                    <Button onClick={generateReport}>Generate Report</Button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Report Header */}
                    <div className="border-b pb-4">
                      <h1 className="text-2xl font-bold">
                        {reportType === "summary" 
                          ? "Noise Pollution Executive Summary" 
                          : reportType === "detailed"
                          ? "Comprehensive Noise Analytics" 
                          : "Custom Noise Analysis Report"}
                      </h1>
                      <p className="text-muted-foreground mt-1">
                        Based on {reportData.length} noise reports
                        {reportFilters.dateRange?.from && (
                          <> from {format(reportFilters.dateRange.from, "MMMM d, yyyy")}</>
                        )}
                        {reportFilters.dateRange?.to && (
                          <> to {format(reportFilters.dateRange.to, "MMMM d, yyyy")}</>
                        )}
                      </p>
                    </div>
                    
                    {/* Key Metrics */}
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold">Key Metrics</h2>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="p-4">
                          <h3 className="text-sm font-medium text-muted-foreground">Total Reports</h3>
                          <p className="text-3xl font-bold">{reportData.length}</p>
                          {reportData.length > 50 && (
                            <p className="text-xs text-green-600 mt-1">High sample confidence</p>
                          )}
                        </Card>
                        
                        <Card className="p-4">
                          <h3 className="text-sm font-medium text-muted-foreground">Average Noise</h3>
                          <p className="text-3xl font-bold">
                            {Math.round(reportData.reduce((sum, r) => sum + r.decibel_level, 0) / reportData.length)} dB
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {Math.round(reportData.reduce((sum, r) => sum + r.decibel_level, 0) / reportData.length) > 75 ? 
                              "Concerning Level" : "Moderate Level"}
                          </p>
                        </Card>
                        
                        <Card className="p-4">
                          <h3 className="text-sm font-medium text-muted-foreground">Peak Noise</h3>
                          <p className="text-3xl font-bold">
                            {Math.max(...reportData.map(r => r.decibel_level))} dB
                          </p>
                          <p className="text-xs text-red-600 mt-1">
                            {Math.max(...reportData.map(r => r.decibel_level)) > 85 ? 
                              "Hazardous Level" : "High Level"}
                          </p>
                        </Card>
                        
                        <Card className="p-4">
                          <h3 className="text-sm font-medium text-muted-foreground">High Risk Cases</h3>
                          <p className="text-3xl font-bold">
                            {reportData.filter(r => r.decibel_level >= 85).length}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {((reportData.filter(r => r.decibel_level >= 85).length / reportData.length) * 100).toFixed(1)}% of total
                          </p>
                        </Card>
                      </div>
                    </div>
                    
                    {/* Analytics Charts - Only shown for detailed reports */}
                    {reportFilters.includeCharts && (
                      <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Noise Analysis</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Time-series chart */}
                          <Card className="p-4">
                            <h3 className="text-sm font-medium mb-4">Noise Level Over Time</h3>
                            <div className="h-[300px]">
                              <NoiseTimeSeriesChart
                                data={reportData.map((report) => {
                                  const date = new Date(report.created_at);
                                  const timeStr = `${date.getMonth()+1}/${date.getDate()}`;
                                  
                                  return {
                                    time: timeStr,
                                    avgLevel: report.decibel_level,
                                    maxLevel: report.decibel_level + 5,
                                    minLevel: Math.max(report.decibel_level - 8, 0)
                                  };
                                })}
                                height={300}
                              />
                            </div>
                          </Card>
                          
                          {/* Distribution by noise type */}
                          <Card className="p-4">
                            <h3 className="text-sm font-medium mb-4">Noise Type Distribution</h3>
                            <div className="h-[300px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={Object.entries(
                                      reportData.reduce((acc, r) => {
                                        acc[r.noise_type] = (acc[r.noise_type] || 0) + 1;
                                        return acc;
                                      }, {} as Record<string, number>)
                                    ).map(([type, count]) => ({
                                      name: type,
                                      value: count
                                    }))}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={2}
                                    dataKey="value"
                                  >
                                    {Object.entries(
                                      reportData.reduce((acc, r) => {
                                        acc[r.noise_type] = (acc[r.noise_type] || 0) + 1;
                                        return acc;
                                      }, {} as Record<string, number>)
                                    ).map((_, index) => {
                                      const COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#64748b'];
                                      return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                                    })}
                                  </Pie>
                                  <Tooltip
                                    formatter={(value, name) => [`${value} reports`, name]}
                                    contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                                  />
                                  <Legend />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                          </Card>
                          
                          {/* Daily Trends by Hour - Only for detailed reports */}
                          {reportType === "detailed" && (
                            <Card className="p-4 col-span-1 md:col-span-2">
                              <h3 className="text-sm font-medium mb-4">Hourly Noise Distribution</h3>
                              <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart
                                    data={[...Array(24)].map((_, hour) => {
                                      const hourReports = reportData.filter(r => {
                                        const date = new Date(r.created_at);
                                        return date.getHours() === hour;
                                      });
                                      
                                      return {
                                        hour: `${hour}:00`,
                                        count: hourReports.length,
                                        avgDb: hourReports.length > 0
                                          ? Math.round(hourReports.reduce((sum, r) => sum + r.decibel_level, 0) / hourReports.length)
                                          : 0
                                      };
                                    })}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis dataKey="hour" />
                                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                                    <Tooltip
                                      contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                                      formatter={(value, name) => [
                                        value, 
                                        name === "count" ? "Reports" : "Avg. Decibels"
                                      ]}
                                    />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="count" name="Number of Reports" fill="#8884d8" />
                                    <Bar yAxisId="right" dataKey="avgDb" name="Avg. Decibel Level" fill="#82ca9d" />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </Card>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Departmental Analysis - Only for detailed reports */}
                    {reportType === "detailed" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl font-semibold">Departmental Analysis</h2>
                          <Select 
                            value={selectedDepartment || "all"}
                            onValueChange={(value) => setSelectedDepartment(value === "all" ? null : value)}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="All Departments" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Departments</SelectItem>
                              {Object.keys(departmentReports).map(dept => (
                                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Object.entries(departmentReports)
                            .filter(([dept]) => !selectedDepartment || dept === selectedDepartment)
                            .map(([department, reports]) => (
                            <Card key={department} className="overflow-hidden">
                              <CardHeader className="pb-2">
                                <div className="flex justify-between items-center">
                                  <CardTitle className="text-base flex items-center">
                                    {department === "Traffic Department" && <Car className="h-4 w-4 mr-2" />}
                                    {department === "Construction Department" && <HardHat className="h-4 w-4 mr-2" />}
                                    {department === "Industrial Department" && <Factory className="h-4 w-4 mr-2" />}
                                    {department === "Music & Events Department" && <Music className="h-4 w-4 mr-2" />}
                                    {department === "Environment Department" && <Leaf className="h-4 w-4 mr-2" />}
                                    {department}
                                  </CardTitle>
                                  <Badge variant="outline">{reports.length}</Badge>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                      <p className="text-xs text-muted-foreground">Average Level</p>
                                      <p className="text-lg font-semibold">
                                        {reports.length > 0 
                                          ? Math.round(reports.reduce((sum, r) => sum + r.decibel_level, 0) / reports.length)
                                          : 0} dB
                                      </p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-xs text-muted-foreground">Risk Level</p>
                                      <p className="text-lg font-semibold">
                                        {reports.length > 0 
                                          ? Math.round(reports.reduce((sum, r) => sum + r.decibel_level, 0) / reports.length) > 75
                                            ? "High" 
                                            : "Moderate"
                                          : "N/A"}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="pt-2">
                                    <p className="text-xs text-muted-foreground mb-1">Noise Level Distribution</p>
                                    <div className="flex h-2 overflow-hidden rounded-full bg-muted">
                                      {reports.length > 0 && (
                                        <>
                                          <div 
                                            className="bg-green-500 h-full"
                                            style={{ 
                                              width: `${(reports.filter(r => r.decibel_level < 65).length / reports.length) * 100}%` 
                                            }}
                                          />
                                          <div 
                                            className="bg-yellow-500 h-full"
                                            style={{ 
                                              width: `${(reports.filter(r => r.decibel_level >= 65 && r.decibel_level < 85).length / reports.length) * 100}%` 
                                            }}
                                          />
                                          <div 
                                            className="bg-red-500 h-full"
                                            style={{ 
                                              width: `${(reports.filter(r => r.decibel_level >= 85).length / reports.length) * 100}%` 
                                            }}
                                          />
                                        </>
                                      )}
                                    </div>
                                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                      <span>Low</span>
                                      <span>Medium</span>
                                      <span>High</span>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                              <CardFooter className="border-t p-3">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="w-full"
                                  onClick={() => {
                                    // Forward report to department action
                                    toast({
                                      title: "Report Forwarded",
                                      description: `Report sent to ${department}`,
                                    });
                                  }}
                                >
                                  <Share2 className="h-3.5 w-3.5 mr-2" />
                                  Forward to Department
                                </Button>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Recommendations - Show for all report types */}
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold">Recommendations</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="p-4 border-l-4 border-l-blue-500">
                          <h3 className="font-medium">Monitoring Frequency</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {reportData.length < 30 
                              ? "Increase monitoring frequency in areas with high noise levels to gather more data."
                              : "Current monitoring frequency is adequate based on sample size."}
                          </p>
                        </Card>
                        
                        <Card className="p-4 border-l-4 border-l-purple-500">
                          <h3 className="font-medium">Enforcement Focus</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Focus enforcement on {
                              Object.entries(
                                reportData.reduce((acc, r) => {
                                  acc[r.noise_type] = (acc[r.noise_type] || 0) + 1;
                                  return acc;
                                }, {} as Record<string, number>)
                              ).sort((a, b) => b[1] - a[1])[0]?.[0] || "common"
                            } noise sources which constitute the majority of complaints.
                          </p>
                        </Card>
                        
                        <Card className="p-4 border-l-4 border-l-amber-500">
                          <h3 className="font-medium">Time-based Interventions</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {reportType === "detailed" 
                              ? `Schedule enforcement during peak noise hours (${
                                [...Array(24)].map((_, hour) => {
                                  const hourReports = reportData.filter(r => {
                                    const date = new Date(r.created_at);
                                    return date.getHours() === hour;
                                  });
                                  return { hour, count: hourReports.length };
                                }).sort((a, b) => b.count - a.count)[0]?.hour || 0
                              }:00).`
                              : "Consider time-based noise regulations based on daily patterns."}
                          </p>
                        </Card>
                        
                        <Card className="p-4 border-l-4 border-l-green-500">
                          <h3 className="font-medium">Public Awareness</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Launch targeted awareness campaigns about noise pollution health impacts in high-risk areas.
                          </p>
                        </Card>
                      </div>
                    </div>
                    
                    {/* Export Actions */}
                    <div className="flex justify-end space-x-2 pt-6 border-t">
                      <Button variant="outline" size="sm" onClick={() => exportData('pdf')}>
                        <FileIcon className="h-4 w-4 mr-2" />
                        Export as PDF
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => exportData('csv')}>
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Export Raw Data
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => {
                          setShowReportGenerator(false);
                          toast({
                            title: "Report Saved",
                            description: "Report has been saved to your dashboard.",
                          });
                        }}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Report
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Forward Report Dialog */}
      <Dialog open={showForwardDialog} onOpenChange={setShowForwardDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Forward to Department</DialogTitle>
            <DialogDescription>
              Send this noise report to the appropriate department for action
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="department">Select Department</Label>
              <Select 
                value={selectedDepartment} 
                onValueChange={setSelectedDepartment}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Traffic Department">Traffic Department</SelectItem>
                  <SelectItem value="Construction Department">Construction Department</SelectItem>
                  <SelectItem value="Industrial Department">Industrial Department</SelectItem>
                  <SelectItem value="Music & Events Department">Music & Events Department</SelectItem>
                  <SelectItem value="Environment Department">Environment Department</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
              <Textarea 
                id="additionalNotes" 
                placeholder="Add any context or specific instructions for the department"
              />
            </div>
            
            {selectedReport && (
              <div className="border rounded-md p-3 bg-muted/30 space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium">Report Summary</h4>
                  <Badge variant="outline">{selectedReport.noise_type}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Location: {selectedReport.address || 'No address provided'}</p>
                  <p>Decibel Level: {selectedReport.decibel_level} dB</p>
                  <p>Date: {new Date(selectedReport.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowForwardDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={forwardReportToDepartment} 
              disabled={!selectedDepartment || forwardingReport}
            >
              {forwardingReport ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Forward Report
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AdminPortal;
