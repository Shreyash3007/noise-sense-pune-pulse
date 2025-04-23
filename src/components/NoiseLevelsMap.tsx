
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface NoiseReport {
  id: string;
  latitude: number;
  longitude: number;
  decibel_level: number;
  noise_type: string;
  created_at: string;
}

const NoiseLevelsMap = () => {
  const { data: reports, isLoading } = useQuery({
    queryKey: ["noise-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("noise_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as NoiseReport[];
    },
  });

  useEffect(() => {
    const loadMap = async () => {
      if (!reports || reports.length === 0) return;
      
      // Load Mapbox GL JS
      const mapboxgl = (await import("mapbox-gl")).default;
      import("mapbox-gl/dist/mapbox-gl.css");

      // Initialize map
      mapboxgl.accessToken = "pk.eyJ1Ijoic2hyZXlhc2gwNDU1MyIsImEiOiJjbTl1MzBiYzUwNHF5MmizYWIwNGtxcWd3In0.PulE0Yanu2kaNNYPGEgnlw";
      
      const map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/light-v11",
        center: [73.8567, 18.5204], // Pune coordinates
        zoom: 11
      });

      // Add reports to map
      map.on("load", () => {
        map.addSource("noise-reports", {
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
                created_at: report.created_at
              }
            }))
          }
        });

        map.addLayer({
          id: "noise-points",
          type: "circle",
          source: "noise-reports",
          paint: {
            "circle-radius": 8,
            "circle-color": [
              "interpolate",
              ["linear"],
              ["get", "decibel_level"],
              40, "#00ff00",
              60, "#ffff00",
              80, "#ff0000"
            ],
            "circle-opacity": 0.8
          }
        });

        // Add popup on click
        map.on('click', 'noise-points', (e) => {
          if (!e.features || e.features.length === 0) return;
          
          const feature = e.features[0];
          const properties = feature.properties;
          
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
              <div class="text-sm">
                <strong>Noise Level:</strong> ${properties?.decibel_level} dB<br>
                <strong>Noise Type:</strong> ${properties?.noise_type}<br>
                <strong>Recorded:</strong> ${new Date(properties?.created_at as string).toLocaleString()}
              </div>
            `)
            .addTo(map);
        });

        // Change cursor to pointer when hovering over noise points
        map.on('mouseenter', 'noise-points', () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        
        map.on('mouseleave', 'noise-points', () => {
          map.getCanvas().style.cursor = '';
        });
      });

      return () => map.remove();
    };

    loadMap();
  }, [reports]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return <div id="map" className="h-[600px] w-full rounded-lg" />;
};

export default NoiseLevelsMap;
