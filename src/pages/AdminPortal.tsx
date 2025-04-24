// Import the missing Volume2 icon
import { Lock, User, BarChart2, Map, Calendar, FileDown, Loader2, Filter, Download, RefreshCw, AlertTriangle, Info, Volume2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

// Define the noise report schema for form validation
const noiseReportSchema = z.object({
  latitude: z.number().min(-90, { message: "Latitude must be greater than or equal to -90." }).max(90, { message: "Latitude must be less than or equal to 90." }),
  longitude: z.number().min(-180, { message: "Longitude must be greater than or equal to -180." }).max(180, { message: "Longitude must be less than or equal to 180." }),
  decibel_level: z.number().min(0, { message: "Decibel level must be greater than or equal to 0." }).max(150, { message: "Decibel level must be less than or equal to 150." }),
  noise_type: z.string().min(2, { message: "Noise type must be at least 2 characters." }),
  notes: z.string().optional(),
  created_at: z.date(),
});

// Define the type for the form values based on the schema
type NoiseReportFormValues = z.infer<typeof noiseReportSchema>;

const AdminPortal = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { toast } = useToast();

  // React Hook Form setup
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

  // Function to fetch noise reports from Supabase
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
      }
    } catch (err) {
      setError("Failed to fetch noise reports");
    } finally {
      setLoading(false);
    }
  };

  // Fetch reports on component mount
  useEffect(() => {
    fetchReports();
  }, []);

  // Function to handle form submission
  const onSubmit = async (values: NoiseReportFormValues) => {
    try {
      const { data, error } = await supabase
        .from("noise_reports")
        .insert([values])
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

  // Function to handle report update
  const updateReport = async (values: NoiseReportFormValues) => {
    if (!selectedReport) return;

    try {
      const { error } = await supabase
        .from("noise_reports")
        .update(values)
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
        setSelectedReport(null); // Clear selected report
        form.reset(); // Reset the form
      }
    } catch (err) {
      toast({
        title: "Error updating report",
        description: "Failed to update noise report.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <Toaster />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Volume2 className="h-8 w-8 text-purple-500" />
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Portal - Noise Reports
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            Manage noise reports submitted by users.
          </p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <Button onClick={() => setShowForm(true)}>
            <AlertTriangle className="mr-2 h-4 w-4" />
            Create Noise Report
          </Button>
          <Button variant="outline" onClick={fetchReports}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Reports
          </Button>
        </div>

        {/* Create Noise Report Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create Noise Report</CardTitle>
              <CardDescription>
                Fill out the form below to submit a new noise report.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter latitude" type="number" {...field} />
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
                          <Input placeholder="Enter longitude" type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Longitude of the noise report.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="decibel_level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Decibel Level</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter decibel level" type="number" {...field} />
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
                          <Input placeholder="Enter noise type" {...field} />
                        </FormControl>
                        <FormDescription>
                          Type of noise (e.g., traffic, construction).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Additional notes"
                            className="resize-none"
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
                            <Calendar
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
                  <div className="flex justify-end">
                    <Button type="submit">Submit</Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowForm(false)}
                      className="ml-2"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Noise Reports Table */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableCaption>A list of your recent noise reports.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Date</TableHead>
                  <TableHead>Latitude</TableHead>
                  <TableHead>Longitude</TableHead>
                  <TableHead>Decibel Level</TableHead>
                  <TableHead>Noise Type</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report: any) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{new Date(report.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{report.latitude}</TableCell>
                    <TableCell>{report.longitude}</TableCell>
                    <TableCell>{report.decibel_level}</TableCell>
                    <TableCell>{report.noise_type}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={() => editReport(report)}>
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
                    <TableCell colSpan={6} className="text-center">
                      No reports found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Edit Noise Report Drawer */}
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline">Open</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Edit Noise Report</DrawerTitle>
              <DrawerDescription>
                Make changes to your noise report here. Click save when you're done.
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-6 pb-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(updateReport)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter latitude" type="number" {...field} />
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
                          <Input placeholder="Enter longitude" type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Longitude of the noise report.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="decibel_level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Decibel Level</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter decibel level" type="number" {...field} />
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
                          <Input placeholder="Enter noise type" {...field} />
                        </FormControl>
                        <FormDescription>
                          Type of noise (e.g., traffic, construction).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Additional notes"
                            className="resize-none"
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
                            <Calendar
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
                  <DrawerFooter>
                    <Button type="submit">Update Report</Button>
                    <DrawerClose>
                      <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </form>
              </Form>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
};

export default AdminPortal;
