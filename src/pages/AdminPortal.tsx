import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { BarChart, Calendar as CalendarIcon, MapPin, Volume2 } from "lucide-react";

interface NoiseReport {
  id: string;
  latitude: number;
  longitude: number;
  decibel_level: number;
  noise_type: string;
  created_at: string;
  notes?: string;
}

const AdminPortal: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [noiseReports, setNoiseReports] = useState<NoiseReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportDetails, setReportDetails] = useState<NoiseReport | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedReport, setEditedReport] = useState<NoiseReport | null>(null);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [noiseTypeFilter, setNoiseTypeFilter] = useState<string>("");
  const [decibelRangeFilter, setDecibelRangeFilter] = useState<{ min: number; max: number }>({ min: 0, max: 150 });
  const [locationFilter, setLocationFilter] = useState<{ latitude: number; longitude: number; radius: number } | null>(null);
  const [showOnlyFlagged, setShowOnlyFlagged] = useState(false);

  // Mock function to simulate fetching noise reports from a database
  const fetchNoiseReports = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock data for demonstration
      const mockReports: NoiseReport[] = [
        {
          id: "1",
          latitude: 18.5204,
          longitude: 73.8567,
          decibel_level: 75,
          noise_type: "Traffic",
          created_at: "2024-07-15T10:00:00Z",
          notes: "Heavy traffic noise during peak hours."
        },
        {
          id: "2",
          latitude: 18.5245,
          longitude: 73.8456,
          decibel_level: 82,
          noise_type: "Construction",
          created_at: "2024-07-16T14:30:00Z",
          notes: "Construction work near residential area."
        },
        {
          id: "3",
          latitude: 18.5100,
          longitude: 73.8600,
          decibel_level: 68,
          noise_type: "Music",
          created_at: "2024-07-17T18:45:00Z",
          notes: "Loud music from a nearby event."
        },
      ];

      setNoiseReports(mockReports);
    } catch (err: any) {
      setError(err.message || "Failed to fetch noise reports.");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle viewing report details
  const handleViewDetails = (reportId: string) => {
    const report = noiseReports.find(report => report.id === reportId);
    if (report) {
      setReportDetails(report);
      setIsDetailsOpen(true);
    }
  };

  // Function to handle editing a report
  const handleEditReport = (reportId: string) => {
    const report = noiseReports.find(report => report.id === reportId);
    if (report) {
      setEditedReport({ ...report });
      setIsEditMode(true);
      setIsDetailsOpen(false);
    }
  };

  // Function to handle saving edited report
  const handleSaveEditedReport = () => {
    if (!editedReport) return;

    // Update the noise reports array with the edited report
    const updatedReports = noiseReports.map(report =>
      report.id === editedReport.id ? editedReport : report
    );

    setNoiseReports(updatedReports);
    setEditedReport(null);
    setIsEditMode(false);
    toast({
      title: "Success",
      description: "Report updated successfully.",
    })
  };

  // Function to handle deleting a report
  const handleDeleteReport = (reportId: string) => {
    setReportToDelete(reportId);
    setIsDeleteConfirmationOpen(true);
  };

  // Function to confirm deletion
  const confirmDelete = () => {
    if (!reportToDelete) return;

    // Filter out the report to be deleted
    const updatedReports = noiseReports.filter(report => report.id !== reportToDelete);

    setNoiseReports(updatedReports);
    setIsDeleteConfirmationOpen(false);
    setReportToDelete(null);
    toast({
      title: "Success",
      description: "Report deleted successfully.",
    })
  };

  // Function to cancel deletion
  const cancelDelete = () => {
    setIsDeleteConfirmationOpen(false);
    setReportToDelete(null);
  };

  // Function to close report details
  const closeReportDetails = () => {
    setIsDetailsOpen(false);
    setReportDetails(null);
  };

  // Function to close edit mode
  const closeEditMode = () => {
    setIsEditMode(false);
    setEditedReport(null);
  };

  // Function to handle date range change
  const isValidDate = (date: any): date is Date => {
    return date && typeof date.getTime === 'function';
  };

  const handleDateRangeChange = (dates: Date[]) => {
    const [start, end] = dates;
    if (isValidDate(start) && isValidDate(end)) {
      setDateRange([start, end]);
    }
  };

  // Function to apply filters
  const applyFilters = () => {
    // Implement filter logic here based on the filter states
    console.log("Applying filters:", {
      dateRange,
      noiseTypeFilter,
      decibelRangeFilter,
      locationFilter,
      showOnlyFlagged
    });
    setIsFiltersOpen(false);
  };

  // Function to clear filters
  const clearFilters = () => {
    setDateRange(undefined);
    setNoiseTypeFilter("");
    setDecibelRangeFilter({ min: 0, max: 150 });
    setLocationFilter(null);
    setShowOnlyFlagged(false);
  };

  // useEffect to fetch noise reports when the component mounts
  useEffect(() => {
    fetchNoiseReports();
  }, []);

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Admin Portal</CardTitle>
          <CardDescription>Manage noise reports and data analysis.</CardDescription>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => setIsFiltersOpen(true)}>
              <BarChart className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <Button variant="outline">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Date Range
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Date Range Picker */}
          <div className="flex justify-center p-4">
            <Calendar
              mode="range"
              defaultMonth={new Date()}
              selected={dateRange}
              onSelect={handleDateRangeChange}
              className="rounded-md border"
            />
          </div>

          {/* Noise Reports Table */}
          {loading && <p>Loading noise reports...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
          {noiseReports.length > 0 ? (
            <Table>
              <TableCaption>A list of your recent noise reports.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Decibel Level</TableHead>
                  <TableHead>Noise Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {noiseReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{new Date(report.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{`${report.latitude}, ${report.longitude}`}</TableCell>
                    <TableCell>{report.decibel_level} dB</TableCell>
                    <TableCell>{report.noise_type}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
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
                          <DropdownMenuItem onClick={() => handleDeleteReport(report.id)}>
                            Delete Report
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>No noise reports found.</p>
          )}
        </CardContent>
      </Card>

      {/* Report Details Modal */}
      {isDetailsOpen && reportDetails && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Report Details</h3>
              <div className="px-7 py-3">
                <p className="text-sm text-gray-500">
                  <strong>Date:</strong> {new Date(reportDetails.created_at).toLocaleDateString()}
                  <br />
                  <strong>Location:</strong> {reportDetails.latitude}, {reportDetails.longitude}
                  <br />
                  <strong>Decibel Level:</strong> {reportDetails.decibel_level} dB
                  <br />
                  <strong>Noise Type:</strong> {reportDetails.noise_type}
                  <br />
                  <strong>Notes:</strong> {reportDetails.notes || "No notes provided."}
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <Button variant="default" onClick={closeReportDetails} className="px-4 py-2 bg-gray-800 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Report Modal */}
      {isEditMode && editedReport && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Report</h3>
              <div className="px-7 py-3">
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      type="number"
                      id="latitude"
                      value={editedReport.latitude.toString()}
                      onChange={(e) => setEditedReport({ ...editedReport, latitude: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      type="number"
                      id="longitude"
                      value={editedReport.longitude.toString()}
                      onChange={(e) => setEditedReport({ ...editedReport, longitude: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="decibel_level">Decibel Level</Label>
                    <Input
                      type="number"
                      id="decibel_level"
                      value={editedReport.decibel_level.toString()}
                      onChange={(e) => setEditedReport({ ...editedReport, decibel_level: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="noise_type">Noise Type</Label>
                    <Select value={editedReport.noise_type} onValueChange={(value) => setEditedReport({ ...editedReport, noise_type: value })}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select noise type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Traffic">Traffic</SelectItem>
                        <SelectItem value="Construction">Construction</SelectItem>
                        <SelectItem value="Music">Music</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={editedReport.notes || ""}
                      onChange={(e) => setEditedReport({ ...editedReport, notes: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="items-center px-4 py-3">
                <Button variant="default" onClick={handleSaveEditedReport} className="mr-2">
                  Save
                </Button>
                <Button variant="ghost" onClick={closeEditMode}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmationOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Confirmation</h3>
              <div className="px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this report?
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <Button variant="destructive" onClick={confirmDelete} className="mr-2">
                  Delete
                </Button>
                <Button variant="ghost" onClick={cancelDelete}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Modal */}
      {isFiltersOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Filters</h3>
              <div className="px-7 py-3">
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="noise_type_filter">Noise Type</Label>
                    <Select value={noiseTypeFilter} onValueChange={(value) => setNoiseTypeFilter(value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select noise type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All</SelectItem>
                        <SelectItem value="Traffic">Traffic</SelectItem>
                        <SelectItem value="Construction">Construction</SelectItem>
                        <SelectItem value="Music">Music</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="decibel_range_min">Decibel Range</Label>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        id="decibel_range_min"
                        placeholder="Min"
                        value={decibelRangeFilter.min.toString()}
                        onChange={(e) => setDecibelRangeFilter({ ...decibelRangeFilter, min: parseInt(e.target.value) })}
                      />
                      <Input
                        type="number"
                        id="decibel_range_max"
                        placeholder="Max"
                        value={decibelRangeFilter.max.toString()}
                        onChange={(e) => setDecibelRangeFilter({ ...decibelRangeFilter, max: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location_filter_latitude">Location (Latitude)</Label>
                    <Input
                      type="number"
                      id="location_filter_latitude"
                      placeholder="Latitude"
                      value={locationFilter?.latitude?.toString() || ""}
                      onChange={(e) => setLocationFilter({ ...locationFilter, latitude: parseFloat(e.target.value) })}
                    />
                    <Label htmlFor="location_filter_longitude">Location (Longitude)</Label>
                    <Input
                      type="number"
                      id="location_filter_longitude"
                      placeholder="Longitude"
                      value={locationFilter?.longitude?.toString() || ""}
                      onChange={(e) => setLocationFilter({ ...locationFilter, longitude: parseFloat(e.target.value) })}
                    />
                    <Label htmlFor="location_filter_radius">Radius (meters)</Label>
                    <Input
                      type="number"
                      id="location_filter_radius"
                      placeholder="Radius"
                      value={locationFilter?.radius?.toString() || ""}
                      onChange={(e) => setLocationFilter({ ...locationFilter, radius: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show_only_flagged"
                      checked={showOnlyFlagged}
                      onCheckedChange={(checked) => setShowOnlyFlagged(!!checked)}
                    />
                    <Label htmlFor="show_only_flagged">Show only flagged</Label>
                  </div>
                </div>
              </div>
              <div className="items-center px-4 py-3">
                <Button variant="default" onClick={applyFilters} className="mr-2">
                  Apply Filters
                </Button>
                <Button variant="ghost" onClick={clearFilters}>
                  Clear Filters
                </Button>
                <Button variant="secondary" onClick={() => setIsFiltersOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPortal;
