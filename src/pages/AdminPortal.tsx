
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  BarChart2,
  CalendarIcon,
  Download,
  FileText,
  Filter,
  Mail,
  MapPin,
  RefreshCcw,
  Settings,
  Trash2,
  Upload,
  User,
  Users,
  Volume2,
  X
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

const AdminPortal: React.FC = () => {
  // State for tabs, filters, and data
  const [activeTab, setActiveTab] = useState("reports");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [noiseReports, setNoiseReports] = useState<NoiseReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<NoiseReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Detail views
  const [reportDetails, setReportDetails] = useState<NoiseReport | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedReport, setEditedReport] = useState<NoiseReport | null>(null);
  
  // Delete confirmation
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  
  // Filter state
  const [isFiltersApplied, setIsFiltersApplied] = useState(false);
  const [noiseTypeFilter, setNoiseTypeFilter] = useState<string>("");
  const [decibelRangeFilter, setDecibelRangeFilter] = useState<{ min: number; max: number }>({ min: 0, max: 150 });
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showOnlyFlagged, setShowOnlyFlagged] = useState(false);
  
  // Export and email states
  const [exportFormat, setExportFormat] = useState<string>("csv");
  const [exportInProgress, setExportInProgress] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailDetails, setEmailDetails] = useState({
    to: "",
    subject: "Noise Reports Summary",
    message: "Please find attached the noise reports data as requested.",
  });
  
  // User management 
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  
  // Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    reportThreshold: 80,
    dailyDigest: false,
  });
  
  // Responsive
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1023px)");

  // Mock data for demonstration
  const fetchNoiseReports = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock data
      const mockReports: NoiseReport[] = [
        {
          id: "1",
          latitude: 18.5204,
          longitude: 73.8567,
          decibel_level: 75,
          noise_type: "Traffic",
          created_at: "2024-07-15T10:00:00Z",
          notes: "Heavy traffic noise during peak hours.",
          address: "MG Road, Central District",
          reported_by: "user123",
          status: "unresolved",
          flagged: true
        },
        {
          id: "2",
          latitude: 18.5245,
          longitude: 73.8456,
          decibel_level: 82,
          noise_type: "Construction",
          created_at: "2024-07-16T14:30:00Z",
          notes: "Construction work near residential area.",
          address: "Koregaon Park, East District",
          reported_by: "user456",
          status: "in-progress",
          flagged: false
        },
        {
          id: "3",
          latitude: 18.5100,
          longitude: 73.8600,
          decibel_level: 68,
          noise_type: "Music",
          created_at: "2024-07-17T18:45:00Z",
          notes: "Loud music from a nearby event.",
          address: "FC Road, University Area",
          reported_by: "user789",
          status: "resolved",
          flagged: false
        },
        {
          id: "4",
          latitude: 18.5520,
          longitude: 73.7720,
          decibel_level: 92,
          noise_type: "Industrial",
          created_at: "2024-07-18T09:15:00Z",
          notes: "Factory machinery noise exceeding permissible limits.",
          address: "Industrial Zone, West District",
          reported_by: "user101",
          status: "escalated",
          flagged: true
        },
        {
          id: "5",
          latitude: 18.4960,
          longitude: 73.8900,
          decibel_level: 77,
          noise_type: "Traffic",
          created_at: "2024-07-19T12:30:00Z",
          notes: "Heavy vehicles on residential street.",
          address: "Sinhagad Road, South District",
          reported_by: "user202",
          status: "unresolved",
          flagged: false
        },
      ];

      setNoiseReports(mockReports);
      setFilteredReports(mockReports);
    } catch (err: any) {
      setError(err.message || "Failed to fetch noise reports.");
    } finally {
      setLoading(false);
    }
  };

  // Mock users data
  const fetchUsers = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setUsers([
      { id: "user123", name: "Alex Johnson", email: "alex@example.com", reports: 12, role: "contributor" },
      { id: "user456", name: "Sam Carter", email: "sam@example.com", reports: 8, role: "contributor" },
      { id: "user789", name: "Taylor Ross", email: "taylor@example.com", reports: 5, role: "contributor" },
      { id: "user101", name: "Morgan Lee", email: "morgan@example.com", reports: 15, role: "moderator" },
      { id: "user202", name: "Jordan Smith", email: "jordan@example.com", reports: 3, role: "contributor" },
    ]);
  };

  // Effect hook to fetch data initially
  useEffect(() => {
    fetchNoiseReports();
    fetchUsers();
  }, []);

  // Apply filters
  const applyFilters = () => {
    let filtered = [...noiseReports];
    
    // Date range filter
    if (dateRange?.from && dateRange?.to) {
      filtered = filtered.filter(report => {
        const reportDate = new Date(report.created_at);
        return (
          reportDate >= dateRange.from! && 
          reportDate <= dateRange.to!
        );
      });
    }
    
    // Noise type filter
    if (noiseTypeFilter) {
      filtered = filtered.filter(report => report.noise_type === noiseTypeFilter);
    }
    
    // Decibel range filter
    filtered = filtered.filter(
      report => report.decibel_level >= decibelRangeFilter.min && report.decibel_level <= decibelRangeFilter.max
    );
    
    // Location filter
    if (locationFilter) {
      filtered = filtered.filter(report => 
        report.address?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }
    
    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(report => report.status === statusFilter);
    }
    
    // Flagged filter
    if (showOnlyFlagged) {
      filtered = filtered.filter(report => report.flagged);
    }
    
    setFilteredReports(filtered);
    setIsFiltersApplied(true);
    
    toast({
      title: "Filters applied",
      description: `Showing ${filtered.length} of ${noiseReports.length} reports`,
    });
  };

  // Reset all filters
  const resetFilters = () => {
    setDateRange(undefined);
    setNoiseTypeFilter("");
    setDecibelRangeFilter({ min: 0, max: 150 });
    setLocationFilter("");
    setStatusFilter("");
    setShowOnlyFlagged(false);
    setFilteredReports(noiseReports);
    setIsFiltersApplied(false);
  };

  // Handle view details
  const handleViewDetails = (reportId: string) => {
    const report = noiseReports.find(report => report.id === reportId);
    if (report) {
      setReportDetails(report);
      setIsDetailsOpen(true);
    }
  };

  // Handle edit report
  const handleEditReport = (reportId: string) => {
    const report = noiseReports.find(report => report.id === reportId);
    if (report) {
      setEditedReport({ ...report });
      setIsEditMode(true);
    }
  };

  // Handle save edited report
  const handleSaveEditedReport = () => {
    if (!editedReport) return;

    // Update the reports
    const updatedReports = noiseReports.map(report =>
      report.id === editedReport.id ? editedReport : report
    );

    setNoiseReports(updatedReports);
    setFilteredReports(
      filteredReports.map(report =>
        report.id === editedReport.id ? editedReport : report
      )
    );
    
    setEditedReport(null);
    setIsEditMode(false);
    
    toast({
      title: "Success",
      description: "Report updated successfully.",
    });
  };

  // Handle delete report
  const handleDeleteReport = (reportId: string) => {
    setReportToDelete(reportId);
    setIsDeleteConfirmationOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    // For bulk delete
    if (bulkDeleteMode && selectedReports.length > 0) {
      const updatedReports = noiseReports.filter(
        report => !selectedReports.includes(report.id)
      );
      
      const updatedFiltered = filteredReports.filter(
        report => !selectedReports.includes(report.id)
      );
      
      setNoiseReports(updatedReports);
      setFilteredReports(updatedFiltered);
      setSelectedReports([]);
      setBulkDeleteMode(false);
      
      toast({
        title: "Success",
        description: `${selectedReports.length} reports deleted successfully.`,
      });
    } 
    // For single delete
    else if (reportToDelete) {
      const updatedReports = noiseReports.filter(
        report => report.id !== reportToDelete
      );
      
      const updatedFiltered = filteredReports.filter(
        report => report.id !== reportToDelete
      );
      
      setNoiseReports(updatedReports);
      setFilteredReports(updatedFiltered);
    }
    
    setIsDeleteConfirmationOpen(false);
    setReportToDelete(null);
  };

  // Toggle bulk selection mode
  const toggleBulkMode = () => {
    setBulkDeleteMode(!bulkDeleteMode);
    setSelectedReports([]);
  };

  // Toggle report selection
  const toggleReportSelection = (reportId: string) => {
    setSelectedReports(prev => 
      prev.includes(reportId)
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  // Select all visible reports
  const selectAllReports = () => {
    if (selectedReports.length === filteredReports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(filteredReports.map(report => report.id));
    }
  };

  // Export reports
  const handleExportReports = () => {
    setExportInProgress(true);
    
    // Simulate export process
    setTimeout(() => {
      setExportInProgress(false);
      
      toast({
        title: "Export successful",
        description: `Reports exported as ${exportFormat.toUpperCase()}`,
      });
    }, 1500);
  };

  // Send email with reports
  const handleSendEmail = () => {
    // Validate email
    if (!emailDetails.to || !emailDetails.to.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    // Simulate sending email
    setTimeout(() => {
      setEmailDialogOpen(false);
      
      toast({
        title: "Email sent",
        description: `Noise reports sent to ${emailDetails.to}`,
      });
    }, 1500);
  };

  // Update notification settings
  const updateNotificationSettings = () => {
    toast({
      title: "Settings updated",
      description: "Your notification preferences have been saved",
    });
  };

  // Get status badge
  const getStatusBadge = (status: string = 'unresolved') => {
    switch (status) {
      case 'resolved':
        return <Badge className="bg-green-500">Resolved</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case 'escalated':
        return <Badge className="bg-red-500">Escalated</Badge>;
      default:
        return <Badge variant="outline">Unresolved</Badge>;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  // Get decibel level severity class
  const getDecibelSeverityClass = (level: number) => {
    if (level >= 85) return "text-red-500 font-semibold";
    if (level >= 70) return "text-amber-500 font-semibold";
    return "text-green-500 font-semibold";
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          Admin Portal
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage noise reports, users, and application settings
        </p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full md:w-auto grid grid-cols-3 md:flex mb-6">
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> 
            <span className={isMobile ? "hidden" : ""}>Reports</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            <span className={isMobile ? "hidden" : ""}>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className={isMobile ? "hidden" : ""}>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Noise Reports</CardTitle>
                <CardDescription>Manage and analyze submitted noise reports</CardDescription>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className={cn(
                      "flex items-center gap-1",
                      isFiltersApplied && "bg-primary/10"
                    )}>
                      <Filter className="h-3.5 w-3.5" />
                      <span className={isMobile ? "hidden" : ""}>Filters</span>
                      {isFiltersApplied && (
                        <Badge variant="secondary" className="ml-1 h-5 px-1">
                          {filteredReports.length !== noiseReports.length && 
                            `${filteredReports.length}/${noiseReports.length}`
                          }
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <h3 className="font-medium">Filter Reports</h3>
                      
                      <div className="space-y-2">
                        <Label>Date Range</Label>
                        <div className="rounded-md border">
                          <Calendar
                            initialFocus
                            mode="range"
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={isMobile ? 1 : 1}
                            className="rounded-md"
                          />
                        </div>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="noise-type">Noise Type</Label>
                        <Select value={noiseTypeFilter} onValueChange={setNoiseTypeFilter}>
                          <SelectTrigger id="noise-type">
                            <SelectValue placeholder="Select noise type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All Types</SelectItem>
                            <SelectItem value="Traffic">Traffic</SelectItem>
                            <SelectItem value="Construction">Construction</SelectItem>
                            <SelectItem value="Music">Music</SelectItem>
                            <SelectItem value="Industrial">Industrial</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="min-db">Decibel Range</Label>
                          <span className="text-sm text-muted-foreground">
                            {decibelRangeFilter.min} - {decibelRangeFilter.max} dB
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Input
                            id="min-db"
                            type="number"
                            placeholder="Min"
                            className="w-20"
                            value={decibelRangeFilter.min}
                            onChange={(e) => setDecibelRangeFilter({ 
                              ...decibelRangeFilter, 
                              min: Number(e.target.value) 
                            })}
                          />
                          <span>to</span>
                          <Input
                            id="max-db"
                            type="number"
                            placeholder="Max"
                            className="w-20"
                            value={decibelRangeFilter.max}
                            onChange={(e) => setDecibelRangeFilter({ 
                              ...decibelRangeFilter, 
                              max: Number(e.target.value) 
                            })}
                          />
                        </div>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          placeholder="Search by location"
                          value={locationFilter}
                          onChange={(e) => setLocationFilter(e.target.value)}
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger id="status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All Status</SelectItem>
                            <SelectItem value="unresolved">Unresolved</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="escalated">Escalated</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="flagged" 
                          checked={showOnlyFlagged} 
                          onCheckedChange={(checked) => setShowOnlyFlagged(checked === true)}
                        />
                        <Label htmlFor="flagged">Show only flagged reports</Label>
                      </div>
                      
                      <div className="flex justify-between">
                        <Button variant="outline" size="sm" onClick={resetFilters}>
                          Reset
                        </Button>
                        <Button size="sm" onClick={applyFilters}>
                          Apply Filters
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Download className="h-3.5 w-3.5" />
                      <span className={isMobile ? "hidden" : ""}>Export</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56">
                    <div className="space-y-4">
                      <h3 className="font-medium">Export Reports</h3>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="export-format">Format</Label>
                        <Select value={exportFormat} onValueChange={setExportFormat}>
                          <SelectTrigger id="export-format">
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="csv">CSV</SelectItem>
                            <SelectItem value="pdf">PDF</SelectItem>
                            <SelectItem value="excel">Excel</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button 
                        className="w-full" 
                        onClick={handleExportReports}
                        disabled={exportInProgress}
                      >
                        {exportInProgress ? (
                          <>
                            <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                            Exporting...
                          </>
                        ) : (
                          <>
                            <Download className="mr-2 h-4 w-4" />
                            Export {filteredReports.length} Reports
                          </>
                        )}
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      <span className={isMobile ? "hidden" : ""}>Email</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Email Reports</DialogTitle>
                      <DialogDescription>
                        Send the filtered reports to an email address.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="email-to">Recipient Email</Label>
                        <Input
                          id="email-to"
                          placeholder="email@example.com"
                          value={emailDetails.to}
                          onChange={(e) => setEmailDetails({ ...emailDetails, to: e.target.value })}
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="email-subject">Subject</Label>
                        <Input
                          id="email-subject"
                          value={emailDetails.subject}
                          onChange={(e) => setEmailDetails({ ...emailDetails, subject: e.target.value })}
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="email-message">Message</Label>
                        <Textarea
                          id="email-message"
                          rows={3}
                          value={emailDetails.message}
                          onChange={(e) => setEmailDetails({ ...emailDetails, message: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-sm">Attachments</Label>
                        <div className="text-sm text-muted-foreground">
                          Report data will be attached as {exportFormat.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSendEmail}>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Email
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  variant={bulkDeleteMode ? "secondary" : "outline"} 
                  size="sm" 
                  onClick={toggleBulkMode}
                  className="flex items-center gap-1"
                >
                  {bulkDeleteMode ? (
                    <>
                      <X className="h-3.5 w-3.5" />
                      <span>Cancel</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className={isMobile ? "hidden" : ""}>Bulk Delete</span>
                    </>
                  )}
                </Button>
                
                {bulkDeleteMode && selectedReports.length > 0 && (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => setIsDeleteConfirmationOpen(true)}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete ({selectedReports.length})
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <RefreshCcw className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <Alert variant="destructive" className="mb-4">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : filteredReports.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No noise reports found.</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={resetFilters}
                  >
                    Reset Filters
                  </Button>
                </div>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {bulkDeleteMode && (
                            <TableHead className="w-12">
                              <Checkbox 
                                checked={
                                  selectedReports.length > 0 && 
                                  selectedReports.length === filteredReports.length
                                }
                                onCheckedChange={selectAllReports}
                              />
                            </TableHead>
                          )}
                          <TableHead>Date</TableHead>
                          {!isMobile && <TableHead>Location</TableHead>}
                          <TableHead>Level</TableHead>
                          {!isMobile && <TableHead>Type</TableHead>}
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReports.map((report) => (
                          <TableRow key={report.id} className={report.flagged ? "bg-destructive/5" : ""}>
                            {bulkDeleteMode && (
                              <TableCell>
                                <Checkbox 
                                  checked={selectedReports.includes(report.id)}
                                  onCheckedChange={() => toggleReportSelection(report.id)}
                                />
                              </TableCell>
                            )}
                            <TableCell className="font-medium">
                              {formatDate(report.created_at)}
                            </TableCell>
                            {!isMobile && (
                              <TableCell className="max-w-[200px] truncate">
                                {report.address || `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`}
                              </TableCell>
                            )}
                            <TableCell className={getDecibelSeverityClass(report.decibel_level)}>
                              {report.decibel_level} dB
                            </TableCell>
                            {!isMobile && <TableCell>{report.noise_type}</TableCell>}
                            <TableCell>{getStatusBadge(report.status)}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <DotsHorizontalIcon className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => handleViewDetails(report.id)}>
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditReport(report.id)}>
                                    Edit Report
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => handleDeleteReport(report.id)}
                                  >
                                    Delete Report
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="mt-4 text-sm text-muted-foreground text-center">
                    Showing {filteredReports.length} of {noiseReports.length} reports
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Delete All Demo Data</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Remove all sample data to start with a clean database.
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={() => {
                    toast({
                      title: "Demo data deleted",
                      description: "All demo reports have been removed",
                    });
                    setNoiseReports([]);
                    setFilteredReports([]);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Demo Data
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Submit to Authorities</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Forward noise reports to relevant government agencies.
                </p>
                <Select defaultValue="police">
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="police">Police Department</SelectItem>
                    <SelectItem value="environment">Environment Agency</SelectItem>
                    <SelectItem value="transportation">Transportation Authority</SelectItem>
                    <SelectItem value="municipal">Municipal Corporation</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    toast({
                      title: "Reports submitted",
                      description: "Selected reports have been sent to authorities",
                    });
                  }}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Submit Selected Reports
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Data Import</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Import noise reports from external sources.
                </p>
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-gray-500" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">CSV, Excel or JSON</p>
                    </div>
                    <input id="file-upload" type="file" className="hidden" />
                  </label>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant="secondary"
                  onClick={() => {
                    toast({
                      title: "Upload complete",
                      description: "Your data has been processed",
                    });
                  }}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Data
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Noise Analytics Dashboard</CardTitle>
              <CardDescription>
                Detailed analytics and insights from collected noise data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NoiseAnalyticsDashboard data={filteredReports} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {/* User Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-3">Users ({users.length})</h3>
                    <div className="rounded-md border">
                      <ScrollArea className="h-72">
                        <div className="p-2">
                          {users.map((user) => (
                            <div
                              key={user.id}
                              className={cn(
                                "flex items-center justify-between py-2 px-3 rounded-md cursor-pointer",
                                selectedUser?.id === user.id ? "bg-accent" : "hover:bg-accent/50"
                              )}
                              onClick={() => setSelectedUser(user)}
                            >
                              <div className="flex items-center gap-3">
                                <User className="h-8 w-8 text-muted-foreground" />
                                <div>
                                  <p className="font-medium text-sm">{user.name}</p>
                                  <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                              </div>
                              <Badge variant={user.role === "moderator" ? "default" : "outline"}>
                                {user.role}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                  
                  <div>
                    {selectedUser ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{selectedUser.name}</h3>
                            <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                          </div>
                          <Badge variant={selectedUser.role === "moderator" ? "default" : "outline"}>
                            {selectedUser.role}
                          </Badge>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-4">
                          <div>
                            <Label>User Role</Label>
                            <Select 
                              value={selectedUser.role} 
                              onValueChange={(value) => {
                                setUsers(users.map(u => 
                                  u.id === selectedUser.id ? {...u, role: value} : u
                                ));
                                setSelectedUser({...selectedUser, role: value});
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="contributor">Contributor</SelectItem>
                                <SelectItem value="moderator">Moderator</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-1">
                            <Label>User Statistics</Label>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Reports Submitted:</span>
                                <span className="font-medium">{selectedUser.reports}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Account Status:</span>
                                <Badge variant="outline" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                                  Active
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="pt-2 flex justify-between">
                            <Button
                              variant="outline"
                              onClick={() => {
                                toast({
                                  title: "Reset password email sent",
                                  description: `Password reset instructions sent to ${selectedUser.email}`,
                                });
                              }}
                            >
                              Reset Password
                            </Button>
                            
                            <Button
                              variant="destructive"
                              onClick={() => {
                                setUsers(users.filter(u => u.id !== selectedUser.id));
                                setSelectedUser(null);
                                toast({
                                  title: "User removed",
                                  description: `${selectedUser.name} has been removed from the system`,
                                });
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove User
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-center p-4">
                        <div className="space-y-2">
                          <User className="h-12 w-12 mx-auto text-muted-foreground" />
                          <h3 className="font-medium">User Details</h3>
                          <p className="text-sm text-muted-foreground">
                            Select a user from the list to view and manage their details
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications" className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email alerts for high-priority noise reports
                    </p>
                  </div>
                  <Checkbox 
                    id="email-notifications" 
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({
                        ...notificationSettings,
                        emailNotifications: !!checked
                      })
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="report-threshold">Report Threshold (dB)</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when reports exceed this decibel level
                  </p>
                  <div className="flex items-center gap-2">
                    <Input
                      id="report-threshold"
                      type="number"
                      value={notificationSettings.reportThreshold}
                      onChange={(e) => 
                        setNotificationSettings({
                          ...notificationSettings,
                          reportThreshold: Number(e.target.value)
                        })
                      }
                      className="w-24"
                    />
                    <span>dB</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="daily-digest" className="text-base">Daily Digest</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive a summary of all noise reports at the end of each day
                    </p>
                  </div>
                  <Checkbox 
                    id="daily-digest" 
                    checked={notificationSettings.dailyDigest}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({
                        ...notificationSettings,
                        dailyDigest: !!checked
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={updateNotificationSettings} className="ml-auto">
                Save Settings
              </Button>
            </CardFooter>
          </Card>
          
          {/* System Settings */}
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure system-wide settings and defaults
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="data-retention">Data Retention Period</Label>
                  <Select defaultValue="365">
                    <SelectTrigger id="data-retention">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">3 months</SelectItem>
                      <SelectItem value="180">6 months</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                      <SelectItem value="forever">Forever</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Noise reports older than this will be automatically archived
                  </p>
                </div>
                
                <Separator />
                
                <div className="grid gap-2">
                  <Label htmlFor="default-map-view">Default Map View</Label>
                  <Select defaultValue="heatmap">
                    <SelectTrigger id="default-map-view">
                      <SelectValue placeholder="Select map view" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="heatmap">Heatmap View</SelectItem>
                      <SelectItem value="markers">Marker Points</SelectItem>
                      <SelectItem value="clusters">Clustered Markers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Separator />
                
                <div className="grid gap-2">
                  <Label>API Integrations</Label>
                  <div className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-medium">Mapbox API Key</h4>
                        <p className="text-xs text-muted-foreground">
                          Used for maps and location services
                        </p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  toast({
                    title: "Cache cleared",
                    description: "Application cache has been cleared",
                  });
                }}
                className="mr-auto"
              >
                Clear Cache
              </Button>
              
              <Button onClick={() => {
                toast({
                  title: "Settings saved",
                  description: "Your system settings have been updated",
                });
              }}>
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Report Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
          </DialogHeader>
          
          {reportDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Date & Time</h4>
                  <p>{formatDate(reportDetails.created_at)}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                  <div className="mt-1">{getStatusBadge(reportDetails.status)}</div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Location</h4>
                <p>{reportDetails.address || `${reportDetails.latitude}, ${reportDetails.longitude}`}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Noise Type</h4>
                  <p>{reportDetails.noise_type}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Decibel Level</h4>
                  <p className={getDecibelSeverityClass(reportDetails.decibel_level)}>
                    {reportDetails.decibel_level} dB
                  </p>
                </div>
              </div>
              
              {reportDetails.notes && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
                  <p className="text-sm">{reportDetails.notes}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setIsDetailsOpen(false);
                if (reportDetails) {
                  handleEditReport(reportDetails.id);
                }
              }}
            >
              Edit
            </Button>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Report Dialog */}
      <Dialog open={isEditMode} onOpenChange={(open) => !open && setIsEditMode(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Report</DialogTitle>
          </DialogHeader>
          
          {editedReport && (
            <div className="space-y-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="edit-address">Location</Label>
                <Input
                  id="edit-address"
                  value={editedReport.address || ""}
                  onChange={(e) => setEditedReport({...editedReport, address: e.target.value})}
                  placeholder="Address or location description"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-latitude">Latitude</Label>
                  <Input
                    id="edit-latitude"
                    type="number"
                    step="0.000001"
                    value={editedReport.latitude}
                    onChange={(e) => setEditedReport({
                      ...editedReport,
                      latitude: parseFloat(e.target.value)
                    })}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-longitude">Longitude</Label>
                  <Input
                    id="edit-longitude"
                    type="number"
                    step="0.000001"
                    value={editedReport.longitude}
                    onChange={(e) => setEditedReport({
                      ...editedReport,
                      longitude: parseFloat(e.target.value)
                    })}
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-type">Noise Type</Label>
                <Select
                  value={editedReport.noise_type}
                  onValueChange={(value) => setEditedReport({...editedReport, noise_type: value})}
                >
                  <SelectTrigger id="edit-type">
                    <SelectValue placeholder="Select noise type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Traffic">Traffic</SelectItem>
                    <SelectItem value="Construction">Construction</SelectItem>
                    <SelectItem value="Music">Music</SelectItem>
                    <SelectItem value="Industrial">Industrial</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-level">Decibel Level</Label>
                <Input
                  id="edit-level"
                  type="number"
                  value={editedReport.decibel_level}
                  onChange={(e) => setEditedReport({
                    ...editedReport,
                    decibel_level: parseInt(e.target.value)
                  })}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editedReport.status || "unresolved"}
                  onValueChange={(value) => setEditedReport({...editedReport, status: value})}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unresolved">Unresolved</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="escalated">Escalated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={editedReport.notes || ""}
                  onChange={(e) => setEditedReport({...editedReport, notes: e.target.value})}
                  placeholder="Additional details about this noise report"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-flagged"
                  checked={editedReport.flagged || false}
                  onCheckedChange={(checked) => setEditedReport({
                    ...editedReport,
                    flagged: checked === true
                  })}
                />
                <Label htmlFor="edit-flagged">Flag this report for attention</Label>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditMode(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEditedReport}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmationOpen} onOpenChange={setIsDeleteConfirmationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              {bulkDeleteMode 
                ? `Are you sure you want to delete ${selectedReports.length} selected reports? This action cannot be undone.`
                : "Are you sure you want to delete this report? This action cannot be undone."
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmationOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              {bulkDeleteMode ? `Delete ${selectedReports.length} Reports` : "Delete Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPortal;
