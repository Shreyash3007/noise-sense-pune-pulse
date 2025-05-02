import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { CalendarIcon, Download, Filter, InfoIcon, LineChart, ListFilter, MapPin, PieChart, RefreshCw } from "lucide-react";
import NoiseBarChart from "./NoiseBarChart";
import NoisePieChart from "./NoisePieChart";
import NoiseHeatmapChart from "./NoiseHeatmapChart";
import NoiseTimeSeriesChart from "./NoiseTimeSeriesChart";
import { Skeleton } from "@/components/ui/skeleton";
import { NoiseReport } from "@/types";
import { useMediaQuery } from "@/hooks/use-mobile";

// Mock data for analytics charts when actual data isn't available yet
const mockTimeSeriesData = [
  {
    time: "2025-04-20",
    avgLevel: 65,
    maxLevel: 85,
    minLevel: 45,
    range: 40,
    count: 24,
    primaryNoiseType: "Traffic"
  },
  {
    time: "2025-04-21",
    avgLevel: 62,
    maxLevel: 88,
    minLevel: 47,
    range: 41,
    count: 18,
    primaryNoiseType: "Traffic"
  },
  {
    time: "2025-04-22",
    avgLevel: 58,
    maxLevel: 79,
    minLevel: 42,
    range: 37,
    count: 22,
    primaryNoiseType: "Construction"
  },
  {
    time: "2025-04-23",
    avgLevel: 68,
    maxLevel: 92,
    minLevel: 44,
    range: 48,
    count: 30,
    primaryNoiseType: "Event"
  },
  {
    time: "2025-04-24",
    avgLevel: 64,
    maxLevel: 86,
    minLevel: 48,
    range: 38,
    count: 26,
    primaryNoiseType: "Traffic"
  }
];

const mockNoiseReports = [
  {
    id: "1",
    latitude: 40.7128,
    longitude: -74.0060,
    decibel_level: 75,
    noise_type: "Traffic",
    created_at: "2025-04-24T10:30:00Z",
    notes: "Heavy traffic noise from highway"
  },
  {
    id: "2",
    latitude: 40.7138,
    longitude: -74.0050,
    decibel_level: 85,
    noise_type: "Construction",
    created_at: "2025-04-24T11:45:00Z",
    notes: "Construction site with drilling"
  },
  {
    id: "3",
    latitude: 40.7148,
    longitude: -74.0070,
    decibel_level: 90,
    noise_type: "Event",
    created_at: "2025-04-23T20:15:00Z",
    notes: "Outdoor concert nearby"
  },
  {
    id: "4",
    latitude: 40.7118,
    longitude: -74.0080,
    decibel_level: 65,
    noise_type: "Industrial",
    created_at: "2025-04-22T14:20:00Z",
    notes: "Factory machinery"
  },
  {
    id: "5",
    latitude: 40.7108,
    longitude: -74.0040,
    decibel_level: 70,
    noise_type: "Traffic",
    created_at: "2025-04-21T08:10:00Z",
    notes: "Bus terminal"
  }
];

interface NoiseAnalyticsDashboardProps {
  data?: NoiseReport[];
  isLoading?: boolean;
  error?: any;
  onRefresh?: () => void;
  showTitle?: boolean;
  showDateFilter?: boolean;
  showTabs?: boolean;
  className?: string;
  limit?: number;
}

export const NoiseAnalyticsDashboard: React.FC<NoiseAnalyticsDashboardProps> = ({
  data = [],
  isLoading = false,
  error = null,
  onRefresh,
  showTitle = true,
  showDateFilter = true,
  showTabs = true,
  className = "",
  limit = 0,
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date(),
  });
  const [selectedTab, setSelectedTab] = useState("overview");
  const [noiseTypeFilter, setNoiseTypeFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = limit > 0 ? limit : 10;

  // Filter data by date range
  const filteredData = data.filter((item) => {
    const itemDate = new Date(item.created_at);
    if (dateRange.from && itemDate < dateRange.from) return false;
    if (dateRange.to && itemDate > dateRange.to) return false;
    return true;
  });

  // Filter data by noise type
  const noiseTypeFilteredData = noiseTypeFilter === "all"
    ? filteredData
    : filteredData.filter((item) => item.noise_type === noiseTypeFilter);

  // Sort data by decibel level
  const sortedData = [...noiseTypeFilteredData].sort((a, b) => {
    const decibelA = Number(a.decibel_level);
    const decibelB = Number(b.decibel_level);

    if (isNaN(decibelA) || isNaN(decibelB)) {
      return 0;
    }

    return sortOrder === "asc" ? decibelA - decibelB : decibelB - decibelA;
  });

  // Paginate data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  // Calculate total pages
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // Handlers
  const handleTabChange = (value: string) => {
    setSelectedTab(value);
  };

  const handleNoiseTypeFilterChange = (value: string) => {
    setNoiseTypeFilter(value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleSortOrderChange = (value: "asc" | "desc") => {
    setSortOrder(value);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "";
    return format(date, "PPP");
  };

  const renderOverviewTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="col-span-1 md:col-span-2 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle>Noise Levels Over Time</CardTitle>
          <CardDescription>Trends and patterns in noise pollution</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-[350px] md:h-[400px]">
            {isLoading ? (
              <Skeleton className="h-full" />
            ) : error ? (
              <p className="text-destructive">Error loading chart data.</p>
            ) : (
              <NoiseTimeSeriesChart data={mockTimeSeriesData} />
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle>Noise Type Distribution</CardTitle>
          <CardDescription>Proportion of different noise sources</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-[350px]">
            {isLoading ? (
              <Skeleton className="h-full" />
            ) : error ? (
              <p className="text-destructive">Error loading chart data.</p>
            ) : filteredData.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No data available for the selected filters.</p>
              </div>
            ) : (
              <NoisePieChart data={filteredData} title="" />
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle>Average Noise Levels by Type</CardTitle>
          <CardDescription>Decibel levels for each noise source</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-[350px]">
            {isLoading ? (
              <Skeleton className="h-full" />
            ) : error ? (
              <p className="text-destructive">Error loading chart data.</p>
            ) : filteredData.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No data available for the selected filters.</p>
              </div>
            ) : (
              <NoiseBarChart data={filteredData} title="" />
            )}
          </div>
        </CardContent>
      </Card>
      {renderHeatmapChart()}
    </div>
  );

  const renderHeatmapChart = () => (
    <Card className="col-span-1 md:col-span-2 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle>Noise Hotspots</CardTitle>
        <CardDescription>Noise intensity by time and location</CardDescription>
      </CardHeader>
      <CardContent className="pt-0 overflow-hidden">
        <div className="h-[350px] md:h-[400px]">
          {isLoading ? (
            <Skeleton className="h-full" />
          ) : error ? (
            <p className="text-destructive">Error loading chart data.</p>
          ) : filteredData.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No data available for the selected filters.</p>
            </div>
          ) : (
            <NoiseHeatmapChart 
              data={filteredData} 
              title=""
            />
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`w-full ${className}`}>
      {showTitle && (
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Noise Analytics</h2>
            <p className="text-muted-foreground">
              Explore trends and patterns in noise pollution data.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {onRefresh && (
              <Button variant="outline" size="icon" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {showDateFilter && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 mb-4">
              <CalendarIcon className="h-4 w-4" />
              <span>
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
                    </>
                  ) : (
                    formatDate(dateRange.from)
                  )
                ) : (
                  "Select Date Range"
                )}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={new Date()}
              selected={dateRange}
              onSelect={setDateRange as any}
              numberOfMonths={isMobile ? 1 : 2}
            />
          </PopoverContent>
        </Popover>
      )}

      {showTabs && (
        <Tabs value={selectedTab} onValueChange={handleTabChange} className="mb-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">{renderOverviewTab()}</TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default NoiseAnalyticsDashboard;
