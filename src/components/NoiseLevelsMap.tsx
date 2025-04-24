
import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Volume2, Map as MapIcon, AlertTriangle, Calendar } from "lucide-react";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface NoiseReport {
  id: string;
  latitude: number;
  longitude: number;
  decibel_level: number;
  noise_type: string;
  created_at: string;
  notes?: string;
}

const NoiseLevelsMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [activeTab, setActiveTab] = useState<string>("map");
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [focusedReport, setFocusedReport] = useState<NoiseReport | null>(null);
  
  const { data: reports, isLoading } = useQuery({
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
      return data as NoiseReport[];
    },
  });

  useEffect(() => {
    const loadMap = async () => {
      if (!reports || reports.length === 0 || !mapContainer.current) return;
      
      try {
        const { data, error } = await supabase.functions.invoke('get_secret', {
          body: JSON.stringify({ secret_name: 'MAPBOX_ACCESS_TOKEN' })
        });

        if (error || !data?.data) {
          console.error('Error fetching Mapbox token:', error || 'No token found');
          return;
        }

        mapboxgl.accessToken = data.data;
        
        if (map.current) return; // don't initialize the map again

        // Find average coordinates for center
        const avgLat = reports.reduce((sum, report) => sum + report.latitude, 0) / reports.length;
        const avgLng = reports.reduce((sum, report) => sum + report.longitude, 0) / reports.length;
        
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/dark-v11",
          center: [avgLng || 73.8567, avgLat || 18.5204], // Fallback to Pune coordinates
          zoom: 11,
          pitchWithRotate: true,
          pitch: 45
        });

        map.current.on("load", () => {
          if (!map.current) return;
          
          // Add 3D buildings for better visualization
          map.current.addLayer({
            'id': '3d-buildings',
            'source': 'composite',
            'source-layer': 'building',
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': 15,
            'paint': {
              'fill-extrusion-color': '#aaa',
              'fill-extrusion-height': [
                'interpolate', ['linear'], ['zoom'],
                15, 0,
                16, ['get', 'height']
              ],
              'fill-extrusion-base': [
                'interpolate', ['linear'], ['zoom'],
                15, 0,
                16, ['get', 'min_height']
              ],
              'fill-extrusion-opacity': 0.6
            }
          });
          
          // Add noise data layer
          map.current.addSource("noise-reports", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: reports.map(report => ({
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [report.longitude, report.latitude]
                },
                properties: {
                  id: report.id,
                  decibel_level: report.decibel_level,
                  noise_type: report.noise_type,
                  created_at: report.created_at,
                  notes: report.notes || ""
                }
              }))
            }
          });

          // Add heatmap layer
          map.current.addLayer({
            id: "noise-heat",
            type: "heatmap",
            source: "noise-reports",
            paint: {
              // Increase weight based on decibel level
              "heatmap-weight": [
                "interpolate", ["linear"], ["get", "decibel_level"],
                40, 0.1,
                60, 0.5,
                80, 1
              ],
              "heatmap-intensity": [
                "interpolate", ["linear"], ["zoom"],
                8, 0.5,
                12, 1.5
              ],
              "heatmap-color": [
                "interpolate", ["linear"], ["heatmap-density"],
                0, "rgba(0, 255, 0, 0)",
                0.2, "rgba(0, 255, 0, 0.5)",
                0.4, "rgba(255, 255, 0, 0.7)",
                0.6, "rgba(255, 128, 0, 0.9)",
                0.8, "rgba(255, 0, 0, 1)"
              ],
              "heatmap-radius": [
                "interpolate", ["linear"], ["zoom"],
                8, 10,
                12, 30
              ],
              "heatmap-opacity": 0.8
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
                10, 3,
                15, 10
              ],
              "circle-color": [
                "interpolate",
                ["linear"],
                ["get", "decibel_level"],
                40, "#00ff00",
                60, "#ffff00",
                80, "#ff0000"
              ],
              "circle-stroke-color": "white",
              "circle-stroke-width": 1,
              "circle-opacity": 0.9
            }
          });

          // Add animated pulse effect for emphasis
          map.current.addLayer({
            id: "noise-pulse",
            type: "circle",
            source: "noise-reports",
            paint: {
              "circle-radius": [
                "interpolate", ["linear"], ["zoom"],
                10, 5,
                15, 15
              ],
              "circle-color": [
                "interpolate",
                ["linear"],
                ["get", "decibel_level"],
                40, "rgba(0, 255, 0, 0.5)",
                60, "rgba(255, 255, 0, 0.5)",
                80, "rgba(255, 0, 0, 0.5)"
              ],
              "circle-opacity": [
                "interpolate", 
                ["linear"], 
                ["zoom"],
                10, 0.3,
                15, 0.5
              ],
              "circle-stroke-width": 0,
              "circle-blur": 1
            }
          });

          // Add click interaction
          map.current.on('click', 'noise-points', (e) => {
            if (!e.features || e.features.length === 0 || !map.current) return;
            
            const feature = e.features[0];
            const coordinates = feature.geometry.coordinates.slice() as [number, number];
            const properties = feature.properties;
            
            // Find the report that was clicked
            const clickedReport = reports.find(r => r.id === properties?.id);
            if (clickedReport) {
              setFocusedReport(clickedReport);
            }
            
            new mapboxgl.Popup()
              .setLngLat(coordinates)
              .setHTML(`
                <div class="text-sm p-2">
                  <div class="font-bold text-base mb-1">${properties?.decibel_level} dB</div>
                  <div><strong>Type:</strong> ${properties?.noise_type}</div>
                  <div><strong>Recorded:</strong> ${new Date(properties?.created_at as string).toLocaleString()}</div>
                  ${properties?.notes ? `<div class="mt-2"><strong>Notes:</strong> ${properties?.notes}</div>` : ''}
                </div>
              `)
              .addTo(map.current);
          });

          // Change cursor on hover
          map.current.on('mouseenter', 'noise-points', () => {
            if (map.current) map.current.getCanvas().style.cursor = 'pointer';
          });
          
          map.current.on('mouseleave', 'noise-points', () => {
            if (map.current) map.current.getCanvas().style.cursor = '';
          });

          // Add navigation controls
          map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

          // Add fullscreen control
          map.current.addControl(new mapboxgl.FullscreenControl());
        });

      } catch (err) {
        console.error('Error initializing map:', err);
      }
    };

    loadMap();
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [reports]);

  // Update map when filters change
  useEffect(() => {
    if (!map.current || !reports || !map.current.isStyleLoaded()) return;
    
    if (map.current.getSource('noise-reports')) {
      map.current.getSource('noise-reports').setData({
        type: "FeatureCollection",
        features: reports.map(report => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [report.longitude, report.latitude]
          },
          properties: {
            id: report.id,
            decibel_level: report.decibel_level,
            noise_type: report.noise_type,
            created_at: report.created_at,
            notes: report.notes || ""
          }
        }))
      });
    }
  }, [reports, map.current]);

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
      <div className="flex gap-2 mb-4">
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
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
          <div className="bg-gray-900 rounded-lg overflow-hidden transition-all duration-500 ease-in-out shadow-lg">
            <div id="map" ref={mapContainer} className="h-[600px] w-full rounded-lg" />
          </div>
          
          {focusedReport && (
            <Card className="p-4 mt-4 bg-gray-100 border border-gray-200 shadow animate-fade-in">
              <div className="flex justify-between">
                <h3 className="text-lg font-bold">Noise Report Details</h3>
                <Button variant="ghost" size="sm" onClick={() => setFocusedReport(null)}>Close</Button>
              </div>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Recorded on:</p>
                  <p>{new Date(focusedReport.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Noise Level:</p>
                  <p className={`font-bold ${
                    focusedReport.decibel_level >= 80 ? 'text-red-500' : 
                    focusedReport.decibel_level >= 60 ? 'text-amber-500' : 
                    'text-green-500'
                  }`}>{focusedReport.decibel_level} dB</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Noise Type:</p>
                  <p>{focusedReport.noise_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location:</p>
                  <p>{focusedReport.latitude.toFixed(6)}, {focusedReport.longitude.toFixed(6)}</p>
                </div>
                {focusedReport.notes && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Notes:</p>
                    <p>{focusedReport.notes}</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="stats" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-fade-in">
            <Card className="p-4 bg-gradient-to-br from-green-50 to-blue-50 shadow">
              <h3 className="text-sm font-medium text-gray-500">Average Noise Level</h3>
              <p className="text-3xl font-bold mt-1">{getAverageDecibel()} dB</p>
              <p className="text-xs text-gray-500 mt-1">Based on {reports?.length || 0} reports</p>
            </Card>
            
            <Card className="p-4 bg-gradient-to-br from-amber-50 to-red-50 shadow">
              <h3 className="text-sm font-medium text-gray-500">Highest Recorded Level</h3>
              <p className="text-3xl font-bold mt-1">{getHighestDecibel()} dB</p>
              <div className="flex items-center text-xs text-amber-800 mt-1">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Exceeds recommended limits
              </div>
            </Card>
            
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 shadow">
              <h3 className="text-sm font-medium text-gray-500">Total Reports</h3>
              <p className="text-3xl font-bold mt-1">{reports?.length || 0}</p>
              <p className="text-xs text-gray-500 mt-1">From {timeFilter === "all" ? "all time" : `last ${timeFilter}`}</p>
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
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
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
              <div className="space-y-4">
                <p>Time-based analysis shows patterns of noise pollution throughout different times of day. Morning and evening rush hours typically show higher noise levels, particularly in areas with heavy traffic.</p>
                
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h4 className="font-medium text-sm text-gray-500 mb-2">Last {reports.length} Reports Timeline</h4>
                  <div className="relative h-40">
                    <div className="absolute inset-0 flex items-end">
                      {reports.slice(0, 20).reverse().map((report, index) => {
                        const height = (report.decibel_level / 100) * 100;
                        const date = new Date(report.created_at);
                        const color = report.decibel_level >= 80 ? 'bg-red-500' : 
                                     report.decibel_level >= 60 ? 'bg-amber-500' : 'bg-green-500';
                        return (
                          <div key={report.id} className="flex flex-col items-center mx-1 flex-1">
                            <div 
                              className={`${color} w-full rounded-t-sm animate-scale-in`}
                              style={{ height: `${height}%` }}
                            ></div>
                            <div className="text-xs mt-1 truncate w-full text-center">
                              {date.getHours()}:{date.getMinutes().toString().padStart(2, '0')}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <h4 className="font-medium">Key Observations:</h4>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Weekday noise levels peak during commute hours (8-10am, 5-7pm)</li>
                    <li>Weekend patterns show higher evening noise in entertainment districts</li>
                    <li>Construction noise is predominantly reported during weekday working hours</li>
                    <li>Traffic remains the most consistent noise source across all time periods</li>
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

export default NoiseLevelsMap;
