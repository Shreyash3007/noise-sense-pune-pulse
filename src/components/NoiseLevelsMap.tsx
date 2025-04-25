
import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Volume2, Map as MapIcon, AlertTriangle, Calendar } from "lucide-react";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { env } from "@/lib/env";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/ui/use-toast";
import { useTheme } from "@/components/ThemeProvider"; 
import { BrandedLoader } from "./ui/loading";

// Set Mapbox token - use the actual token value directly to ensure it's always available
mapboxgl.accessToken = env.MAPBOX_ACCESS_TOKEN;

interface NoiseReport {
  id: string;
  latitude: number;
  longitude: number;
  decibel_level: number;
  noise_type: string;
  created_at: string;
  notes?: string;
}

// Define GeoJSON types for better TypeScript type safety
interface PointGeometry {
  type: "Point";
  coordinates: [number, number]; // longitude, latitude
}

interface NoiseFeature {
  type: "Feature";
  geometry: PointGeometry;
  properties: {
    id: string;
    decibel_level: number;
    noise_type: string;
    created_at: string;
    notes: string;
  };
}

interface NoiseGeoJSON {
  type: "FeatureCollection";
  features: NoiseFeature[];
}

export const NoiseLevelsMap = () => {
  // Use the theme from context instead of hardcoding to light theme
  const { resolvedTheme } = useTheme();
  const [mapTheme, setMapTheme] = useState(resolvedTheme === 'dark' ? 'dark' : 'light');
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [activeTab, setActiveTab] = useState<string>("map");
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [focusedReport, setFocusedReport] = useState<NoiseReport | null>(null);
  const [mapInitialized, setMapInitialized] = useState<boolean>(false);
  const [mapError, setMapError] = useState<string | null>(null);
  
  const { data: reports, isLoading, refetch } = useQuery({
    queryKey: ["noise-reports", timeFilter, typeFilter],
    queryFn: async () => {
      let query = supabase
        .from("noise_reports")
        .select("*");
      
      // Apply time filters
      if (timeFilter === "today") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        query = query.gte('created_at', today.toISOString());
      } else if (timeFilter === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte('created_at', weekAgo.toISOString());
      } else if (timeFilter === "month") {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        query = query.gte('created_at', monthAgo.toISOString());
      }
      
      // Apply type filters
      if (typeFilter !== "all") {
        query = query.eq('noise_type', typeFilter);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      
      // If no data, return sample data for demo purposes
      if (!data || data.length === 0) {
        const sampleData = generateSampleData();
        // Show toast notification about sample data
        toast({
          title: "Using sample data",
          description: "No reports found in the database. Displaying sample data for demonstration.",
          duration: 5000,
        });
        return sampleData;
      }
      
      return data as NoiseReport[];
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  // Generate sample data for demo purposes when no real data exists
  const generateSampleData = (): NoiseReport[] => {
    const puneCenter = [18.5204, 73.8567];
    const sampleData: NoiseReport[] = [];
    
    const noiseTypes = ['Traffic', 'Construction', 'Industrial', 'Social Event', 'Loudspeaker', 'Vehicle Horn'];
    
    // Generate 20 random points around Pune
    for (let i = 0; i < 20; i++) {
      const id = `sample-${i}`;
      // Random coordinates within ~5km of center
      const latitude = puneCenter[0] + (Math.random() - 0.5) * 0.1;
      const longitude = puneCenter[1] + (Math.random() - 0.5) * 0.1;
      // Random decibel between 40 and 90
      const decibel_level = Math.floor(Math.random() * 50) + 40;
      // Random noise type
      const noise_type = noiseTypes[Math.floor(Math.random() * noiseTypes.length)];
      // Random date in the last month
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      
      sampleData.push({
        id,
        latitude,
        longitude,
        decibel_level,
        noise_type,
        created_at: date.toISOString(),
        notes: i % 3 === 0 ? 'Sample note for demonstration purposes' : undefined
      });
    }
    
    return sampleData;
  };

  // Initialize or reinitialize the map
  const initializeMap = () => {
    if (!mapContainer.current || !reports || reports.length === 0) {
      console.log("Cannot initialize map: missing container or data");
      return;
    }
    
    // If map already exists, destroy it to prevent duplicates
    if (map.current) {
      map.current.remove();
      map.current = null;
    }
    
    // Reset any previous errors
    setMapError(null);
    setMapInitialized(false);
    
    try {
      // Find average coordinates for center or use Pune's coordinates
      const avgLat = reports.reduce((sum, report) => sum + report.latitude, 0) / reports.length;
      const avgLng = reports.reduce((sum, report) => sum + report.longitude, 0) / reports.length;
      
      // Ensure Mapbox token is set
      if (!mapboxgl.accessToken) {
        mapboxgl.accessToken = env.MAPBOX_ACCESS_TOKEN;
      }
      
      // Use theme-appropriate map style based on app theme
      const mapStyle = mapTheme === 'dark' 
        ? 'mapbox://styles/mapbox/dark-v11' 
        : 'mapbox://styles/mapbox/light-v11';
      
      // Create the map instance with better defaults
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle,
        center: [avgLng, avgLat], // LngLat format for Mapbox
        zoom: 12,
        pitch: 30,
        attributionControl: false,
        antialias: true // Enable antialiasing for smoother rendering
      });
      
      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Add custom attribution
      map.current.addControl(new mapboxgl.AttributionControl({
        customAttribution: 'NoiseSense Pune'
      }));
      
      // Create GeoJSON data from reports
      const geojsonData: NoiseGeoJSON = {
        type: "FeatureCollection",
        features: reports.map(report => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [report.longitude, report.latitude] // LngLat format for GeoJSON
          },
          properties: {
            id: report.id,
            decibel_level: report.decibel_level,
            noise_type: report.noise_type,
            created_at: report.created_at,
            notes: report.notes || ""
          }
        }))
      };
      
      // Wait for map to load before adding layers
      map.current.on('load', () => {
        if (!map.current) return;
        
        try {
          // Add noise data source
          map.current.addSource("noise-reports", {
            type: "geojson",
            data: geojsonData
          });

          // Improved heatmap layer with better configuration for visibility
          map.current.addLayer({
            id: "noise-heat",
            type: "heatmap",
            source: "noise-reports",
            paint: {
              // Weight increases with decibel level - improved weight distribution
              "heatmap-weight": [
                "interpolate", ["linear"], ["get", "decibel_level"],
                40, 0.5,  // Increased minimum weight for better visibility
                60, 0.8,  // Medium weight
                80, 1.0   // Maximum weight
              ],
              // Increased intensity values for better visibility
              "heatmap-intensity": [
                "interpolate", ["linear"], ["zoom"],
                8, 0.7,    // Increased base intensity
                12, 1.2    // Increased maximum intensity (can go above 1.0)
              ],
              // More vibrant color gradient from green to red
              "heatmap-color": [
                "interpolate", ["linear"], ["heatmap-density"],
                0, "rgba(0, 255, 0, 0)",
                0.1, "rgba(0, 255, 0, 0.6)",  // More visible starting point
                0.3, "rgba(127, 255, 0, 0.7)",
                0.5, "rgba(255, 255, 0, 0.8)",
                0.7, "rgba(255, 170, 0, 0.9)",
                0.9, "rgba(255, 85, 0, 0.9)",
                1.0, "rgba(255, 0, 0, 1)"
              ],
              // Larger radius for better coverage
              "heatmap-radius": [
                "interpolate", ["linear"], ["zoom"],
                0, 4,     // Increased base radius
                10, 20,   // Medium zoom radius increased
                15, 30    // Maximum radius increased
              ],
              // Slightly higher opacity
              "heatmap-opacity": 0.9
            }
          });
          
          // Add circle layer for individual noise points
          map.current.addLayer({
            id: "noise-points",
            type: "circle",
            source: "noise-reports",
            paint: {
              "circle-radius": [
                "interpolate", ["linear"], ["zoom"],
                10, 4,   // Base size
                15, 8    // Maximum size
              ],
              "circle-color": [
                "interpolate",
                ["linear"],
                ["get", "decibel_level"],
                40, "#4BB543",  // Green for safe levels
                60, "#FFD700",  // Yellow for moderate levels
                80, "#FF0000"   // Red for high levels
              ],
              "circle-stroke-color": "white",
              "circle-stroke-width": 1,
              "circle-opacity": 0.9
            }
          });
        } catch (e) {
          console.error("Error adding layers:", e);
          setMapError("Could not add map layers. Please try again.");
        }

        // Add click interaction
        map.current.on('click', 'noise-points', (e) => {
          if (!e.features || e.features.length === 0 || !map.current) return;
          
          const feature = e.features[0] as unknown as NoiseFeature;
          if (!feature.geometry || !feature.geometry.coordinates) return;
          
          const coordinates: [number, number] = [...feature.geometry.coordinates]; // Make a copy to avoid modification
          const properties = feature.properties;
          
          // Find the report that was clicked
          const clickedReport = reports.find(r => r.id === properties?.id);
          if (clickedReport) {
            setFocusedReport(clickedReport);
          }
          
          // Create popup with styling
          const popup = new mapboxgl.Popup({
            closeButton: true,
            maxWidth: '300px',
            offset: 15
          });
          
          // Set popup content with improved formatting
          popup.setLngLat(coordinates);
          popup.setHTML(`
            <div style="font-family: system-ui, -apple-system, sans-serif; padding: 8px;">
              <div style="font-size: 1.5rem; font-weight: bold; margin-bottom: 8px; color: ${
                properties.decibel_level >= 80 ? '#FF0000' : 
                properties.decibel_level >= 60 ? '#FFA500' : 
                '#4BB543'
              };">${properties.decibel_level} dB</div>
              <div style="margin-bottom: 4px; font-weight: 500;"><strong>Source:</strong> ${properties.noise_type}</div>
              <div style="margin-bottom: 4px; font-size: 0.875rem; color: #666;"><strong>Recorded:</strong> ${new Date(properties.created_at).toLocaleString()}</div>
              ${properties.notes ? `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(0,0,0,0.1); font-style: italic; font-size: 0.875rem; color: #666;">${properties.notes}</div>` : ''}
            </div>
          `);
          
          popup.addTo(map.current);
        });

        // Change cursor on hover
        map.current.on('mouseenter', 'noise-points', () => {
          if (map.current) map.current.getCanvas().style.cursor = 'pointer';
        });
        
        map.current.on('mouseleave', 'noise-points', () => {
          if (map.current) map.current.getCanvas().style.cursor = '';
        });

        // Indicate successful map initialization
        setMapInitialized(true);
      });

      // Add error handling
      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setMapError(`An error occurred with the map: ${e.error?.message || 'Unknown error'}`);
      });
      
    } catch (err) {
      console.error('Error initializing map:', err);
      setMapError('Failed to initialize the map. Please check your connection and try again.');
      
      // Reset for retry
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      setMapInitialized(false);
    }
  };

  // Initialize the map when reports are available
  useEffect(() => {
    if (reports && reports.length > 0 && mapContainer.current) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        initializeMap();
      }, 100);
      
      return () => clearTimeout(timer);
    }
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        setMapInitialized(false);
      }
    };
  }, [reports, mapTheme]);

  // Function to manually retry map initialization
  const retryMapInitialization = () => {
    if (reports && reports.length > 0) {
      initializeMap();
    } else {
      refetch().then(() => {
        setTimeout(initializeMap, 500);
      });
    }
  };

  // Helper functions for data analysis
  const getAverageDecibel = () => {
    if (!reports || reports.length === 0) return 0;
    return Math.round(reports.reduce((sum, report) => sum + report.decibel_level, 0) / reports.length);
  };

  const getHighestDecibel = () => {
    if (!reports || reports.length === 0) return 0;
    return Math.max(...reports.map(report => report.decibel_level));
  };

  const getNoiseTypeDistribution = () => {
    if (!reports || reports.length === 0) return {};
    
    const distribution: Record<string, number> = {};
    reports.forEach(report => {
      distribution[report.noise_type] = (distribution[report.noise_type] || 0) + 1;
    });
    
    return distribution;
  };

  // Get time-based analysis data
  const getTimeSeriesData = () => {
    if (!reports || reports.length === 0) return [];
    
    // Group by hour of day
    const hourData: Record<number, { count: number, sum: number }> = {};
    
    reports.forEach(report => {
      const date = new Date(report.created_at);
      const hour = date.getHours();
      
      if (!hourData[hour]) {
        hourData[hour] = { count: 0, sum: 0 };
      }
      
      hourData[hour].count += 1;
      hourData[hour].sum += report.decibel_level;
    });
    
    // Convert to array with averages
    return Array.from({ length: 24 }, (_, hour) => {
      const data = hourData[hour] || { count: 0, sum: 0 };
      return {
        hour,
        count: data.count,
        average: data.count > 0 ? Math.round(data.sum / data.count) : 0
      };
    });
  };

  const renderNoiseTypeFilters = () => {
    if (!reports) return null;
    
    const types = ["all", ...new Set(reports.map(r => r.noise_type))];
    
    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {types.map(type => (
          <Button 
            key={type} 
            size="sm"
            variant={typeFilter === type ? "default" : "outline"}
            onClick={() => setTypeFilter(type)}
          >
            {type === "all" ? "All Types" : type}
          </Button>
        ))}
      </div>
    );
  };

  const renderTimeFilters = () => {
    return (
      <div className="flex flex-wrap gap-2 mb-4">
        <Button 
          size="sm" 
          variant={timeFilter === "all" ? "default" : "outline"}
          onClick={() => setTimeFilter("all")}
        >
          All Time
        </Button>
        <Button 
          size="sm"
          variant={timeFilter === "month" ? "default" : "outline"}
          onClick={() => setTimeFilter("month")}
        >
          Last Month
        </Button>
        <Button 
          size="sm"
          variant={timeFilter === "week" ? "default" : "outline"}
          onClick={() => setTimeFilter("week")}
        >
          Last Week
        </Button>
        <Button 
          size="sm"
          variant={timeFilter === "today" ? "default" : "outline"}
          onClick={() => setTimeFilter("today")}
        >
          Today
        </Button>
      </div>
    );
  };

  // Update map theme when app theme changes
  useEffect(() => {
    setMapTheme(resolvedTheme === 'dark' ? 'dark' : 'light');
    
    // If map is already initialized, we need to reinitialize it with the new theme
    if (map.current && reports && reports.length > 0) {
      // Small delay to ensure DOM is ready for reinitialization
      const timer = setTimeout(() => {
        initializeMap();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [resolvedTheme]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <BrandedLoader size="md" text="Loading noise data..." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="map" className="flex items-center gap-2">
            <MapIcon className="h-4 w-4" />
            Map View
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Noise Stats
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Time Analysis
          </TabsTrigger>
        </TabsList>
        
        {renderTimeFilters()}
        {renderNoiseTypeFilters()}
        
        <TabsContent value="map" className="mt-0">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden transition-all duration-500 ease-in-out shadow-lg">
            {mapError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-t-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div className="flex-1">{mapError}</div>
                <Button size="sm" variant="outline" onClick={retryMapInitialization}>
                  Retry
                </Button>
              </div>
            )}
            <div className="relative">
              <div id="map" ref={mapContainer} className="h-[500px] w-full rounded-lg" />
              {!mapInitialized && !mapError && reports && reports.length > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                  <BrandedLoader size="md" text="Initializing map..." />
                </div>
              )}
            </div>
          </div>
          
          {focusedReport && (
            <Card className="p-4 mt-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow animate-fade-in">
              <div className="flex justify-between">
                <h3 className="text-lg font-bold">Noise Report Details</h3>
                <Button variant="ghost" size="sm" onClick={() => setFocusedReport(null)}>Close</Button>
              </div>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Recorded on:</p>
                  <p>{new Date(focusedReport.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Noise Level:</p>
                  <p className={`font-bold ${
                    focusedReport.decibel_level >= 80 ? 'text-red-500' : 
                    focusedReport.decibel_level >= 60 ? 'text-amber-500' : 
                    'text-green-500'
                  }`}>{focusedReport.decibel_level} dB</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Noise Type:</p>
                  <p>{focusedReport.noise_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Location:</p>
                  <p>{focusedReport.latitude.toFixed(6)}, {focusedReport.longitude.toFixed(6)}</p>
                </div>
                {focusedReport.notes && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Notes:</p>
                    <p>{focusedReport.notes}</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="stats" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-fade-in">
            <Card className="p-4 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 shadow">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Noise Level</h3>
              <p className="text-3xl font-bold mt-1">{getAverageDecibel()} dB</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Based on {reports?.length || 0} reports</p>
            </Card>
            
            <Card className="p-4 bg-gradient-to-br from-amber-50 to-red-50 dark:from-amber-900/20 dark:to-red-900/20 shadow">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Highest Recorded Level</h3>
              <p className="text-3xl font-bold mt-1">{getHighestDecibel()} dB</p>
              <div className="flex items-center text-xs text-amber-800 dark:text-amber-400 mt-1">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Exceeds recommended limits
              </div>
            </Card>
            
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 shadow">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Reports</h3>
              <p className="text-3xl font-bold mt-1">{reports?.length || 0}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">From {timeFilter === "all" ? "all time" : `last ${timeFilter}`}</p>
            </Card>
          </div>
          
          <Card className="p-6 animate-fade-in">
            <h3 className="text-lg font-medium mb-4">Noise Source Distribution</h3>
            <div className="h-64 overflow-hidden">
              {reports && reports.length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(getNoiseTypeDistribution()).map(([type, count]) => {
                    const percentage = Math.round((count / reports.length) * 100);
                    return (
                      <div key={type} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{type}</span>
                          <span className="font-medium">{count} reports ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No data available
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="timeline" className="mt-0">
          <Card className="p-6 animate-fade-in">
            <h3 className="text-lg font-medium mb-4">Time-Based Analysis</h3>
            {reports && reports.length > 0 ? (
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                  <h4 className="font-medium mb-4">Noise Levels by Hour of Day</h4>
                  <div className="relative h-72"> {/* Increased height for better visibility */}
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between h-60"> {/* Increased height */}
                      {getTimeSeriesData().map((hourData, index) => {
                        // Skip hours with no data to avoid empty bars
                        if (hourData.count === 0) return null;
                        
                        const height = hourData.average ? (hourData.average / 100) * 100 : 0;
                        const color = hourData.average >= 80 ? 'bg-red-500 dark:bg-red-600' : 
                                    hourData.average >= 60 ? 'bg-amber-500 dark:bg-amber-600' : 
                                    'bg-green-500 dark:bg-green-600';
                                    
                        return (
                          <div key={index} className="flex flex-col items-center mx-0.5 group" style={{width: `${100 / 24}%`}}>
                            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded px-2 py-1 pointer-events-none z-10 whitespace-nowrap">
                              {hourData.hour}:00 - {hourData.average} dB ({hourData.count} reports)
                            </div>
                            <div 
                              className={`${color} w-full rounded-t-sm transition-all duration-500 hover:brightness-110 cursor-pointer shadow-sm`}
                              style={{ height: `${Math.max(height, 5)}%` }}
                              title={`${hourData.hour}:00 - Average: ${hourData.average} dB from ${hourData.count} reports`}
                            ></div>
                            {/* Show more hour labels for better readability */}
                            {index % 2 === 0 && (
                              <div className="text-[10px] mt-1 text-gray-600 dark:text-gray-400 font-medium">
                                {hourData.hour}:00
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Y-axis labels with grid lines */}
                    <div className="absolute left-0 top-0 h-60 flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400">
                      <div className="relative">
                        <div className="absolute -right-2 transform -translate-y-1/2">100 dB</div>
                        <div className="absolute left-8 right-0 h-px bg-gray-200 dark:bg-gray-700"></div>
                      </div>
                      <div className="relative">
                        <div className="absolute -right-2 transform -translate-y-1/2">75 dB</div>
                        <div className="absolute left-8 right-0 h-px bg-gray-200 dark:bg-gray-700"></div>
                      </div>
                      <div className="relative">
                        <div className="absolute -right-2 transform -translate-y-1/2">50 dB</div>
                        <div className="absolute left-8 right-0 h-px bg-gray-200 dark:bg-gray-700"></div>
                      </div>
                      <div className="relative">
                        <div className="absolute -right-2 transform -translate-y-1/2">25 dB</div>
                        <div className="absolute left-8 right-0 h-px bg-gray-200 dark:bg-gray-700"></div>
                      </div>
                      <div className="relative">
                        <div className="absolute -right-2 transform -translate-y-1/2">0 dB</div>
                        <div className="absolute left-8 right-0 h-px bg-gray-200 dark:bg-gray-700"></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-2 flex justify-center gap-4 text-sm border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                      <div className="h-3 w-3 bg-green-500 dark:bg-green-600 rounded-sm mr-1"></div>
                      <span className="text-gray-600 dark:text-gray-400">Low (&lt;60 dB)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-3 w-3 bg-amber-500 dark:bg-amber-600 rounded-sm mr-1"></div>
                      <span className="text-gray-600 dark:text-gray-400">Moderate (60-80 dB)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-3 w-3 bg-red-500 dark:bg-red-600 rounded-sm mr-1"></div>
                      <span className="text-gray-600 dark:text-gray-400">High (&gt;80 dB)</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h4 className="font-medium mb-2">Peak Noise Hours</h4>
                    <div className="space-y-2 text-sm">
                      {getTimeSeriesData()
                        .filter(data => data.count > 0)
                        .sort((a, b) => b.average - a.average)
                        .slice(0, 5) // Show top 5 instead of 3
                        .map((data, index) => (
                          <div key={index} className="flex justify-between items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                            <span className="flex items-center">
                              <span className="w-6 text-gray-500 dark:text-gray-400">{index + 1}.</span>
                              <span>{data.hour}:00 - {data.hour + 1}:00</span>
                              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">({data.count} reports)</span>
                            </span>
                            <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${
                              data.average >= 80 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 
                              data.average >= 60 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 
                              'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            }`}>{data.average} dB</span>
                          </div>
                        ))}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h4 className="font-medium mb-2">Noise Patterns</h4>
                    <ul className="list-disc pl-5 text-sm space-y-1 text-gray-700 dark:text-gray-300">
                      <li>Morning peak (7-9 AM): Commute traffic</li>
                      <li>Midday dip (1-3 PM): Lower activity period</li>
                      <li>Evening peak (5-7 PM): Return commute</li>
                      <li>Night decrease (10 PM-5 AM): Quiet hours</li>
                      <li>Weekend peaks (8 PM-11 PM): Entertainment</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 text-sm">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300">Noise Trends Analysis:</h4>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-blue-700 dark:text-blue-300">
                    <li>Weekday noise levels peak during commute hours (8-10am, 5-7pm)</li>
                    <li>Weekend patterns show higher evening noise in entertainment districts</li>
                    <li>Construction noise is predominantly reported during weekday working hours</li>
                    <li>Average noise levels exceed WHO recommendations during peak hours</li>
                    <li>Quietest period consistently observed between 2-4 AM daily</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No timeline data available
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Also keep default export for backwards compatibility
export default NoiseLevelsMap;
