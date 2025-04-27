import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Volume2, Map as MapIcon, AlertTriangle, Calendar, RefreshCw } from "lucide-react";
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
  address?: string;
  reported_by?: string;
  status?: string;
  flagged?: boolean;
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

interface NoiseLevelsMapProps {
  data?: NoiseReport[];
}

export const NoiseLevelsMap: React.FC<NoiseLevelsMapProps> = ({ data }) => {
  // Use the theme from context instead of hardcoding to light theme
  const { resolvedTheme } = useTheme();
  const [mapTheme, setMapTheme] = useState(resolvedTheme === 'dark' ? 'dark' : 'light');
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapInitialized, setMapInitialized] = useState<boolean>(false);
  const [mapError, setMapError] = useState<string | null>(null);
  
  // Use provided data or fetch sample data
  const { data: fetchedReports, isLoading } = useQuery({
    queryKey: ["noise-reports-simple"],
    queryFn: async () => {
      // If data is provided as prop, use it and skip API call
      if (data && data.length > 0) {
        return data;
      }
      
      // Generate sample data
      return generateSampleData();
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
    // Skip the query if data is provided
    enabled: !data || data.length === 0,
  });

  // Use provided data or fetched data
  const reports = data || fetchedReports;

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
        mapboxgl.accessToken = env.MAPBOX_ACCESS_TOKEN || '';
        
        if (!mapboxgl.accessToken) {
          throw new Error("Mapbox access token is missing");
        }
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
        antialias: true, // Enable antialiasing for smoother rendering
        preserveDrawingBuffer: true, // Important for some mobile browsers
        failIfMajorPerformanceCaveat: false, // Allow lower performance on mobile
      });
      
      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Add custom attribution
      map.current.addControl(new mapboxgl.AttributionControl({
        customAttribution: 'NoiseSense Pune'
      }));
      
      // Add support for touch events on mobile devices
      map.current.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserLocation: true,
        showAccuracyCircle: true,
        fitBoundsOptions: {
          maxZoom: 15
        }
      }));
      
      // Handle geolocation errors
      const geolocateControl = map.current._controls.find(control => control instanceof mapboxgl.GeolocateControl);
      if (geolocateControl) {
        geolocateControl.on('error', (err) => {
          console.warn('Geolocation error:', err);
          // Don't show error toast to avoid disrupting user experience
          // Just log to console for debugging
        });
      }
      
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
              // Color gradient adjusted based on theme
              "heatmap-color": [
                "interpolate", ["linear"], ["heatmap-density"],
                0, mapTheme === 'dark' ? "rgba(0, 128, 255, 0)" : "rgba(0, 128, 0, 0)",
                0.1, mapTheme === 'dark' ? "rgba(0, 128, 255, 0.6)" : "rgba(0, 128, 0, 0.6)",
                0.3, mapTheme === 'dark' ? "rgba(0, 170, 255, 0.7)" : "rgba(0, 200, 0, 0.7)",
                0.5, mapTheme === 'dark' ? "rgba(0, 212, 255, 0.8)" : "rgba(255, 255, 0, 0.8)",
                0.7, mapTheme === 'dark' ? "rgba(100, 240, 255, 0.9)" : "rgba(255, 170, 0, 0.9)",
                0.9, mapTheme === 'dark' ? "rgba(200, 255, 255, 0.9)" : "rgba(255, 85, 0, 0.9)",
                1.0, mapTheme === 'dark' ? "rgba(255, 255, 255, 1)" : "rgba(255, 0, 0, 1)"
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
      
    } catch (error) {
      console.error("Map initialization error:", error);
      setMapError(`Failed to initialize map: ${error.message}`);
      setMapInitialized(false);
    }
  };

  // Update map when reports data changes
  useEffect(() => {
    if (reports && reports.length > 0) {
      initializeMap();
    }
  }, [reports, mapTheme]);

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

  // Render error state
  const renderErrorState = () => {
    if (mapError) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-muted/20 rounded-md p-6">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Map Loading Error</h3>
          <p className="text-muted-foreground text-center mb-4">{mapError}</p>
          <Button 
            variant="outline" 
            onClick={initializeMap}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Loading
          </Button>
        </div>
      );
    }
    
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-background/50 rounded-md">
          <BrandedLoader size="lg" />
          <p className="text-muted-foreground mt-4">Loading map data...</p>
        </div>
      );
    }
    
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <BrandedLoader size="md" text="Loading noise data..." />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {renderErrorState()}
      <div className="relative h-full">
        <div id="map" ref={mapContainer} className="w-full h-full rounded-lg" />
        {!mapInitialized && !mapError && reports && reports.length > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <BrandedLoader size="md" text="Initializing map..." />
          </div>
        )}
      </div>
    </div>
  );
};

// Also keep default export for backwards compatibility
export default NoiseLevelsMap;
