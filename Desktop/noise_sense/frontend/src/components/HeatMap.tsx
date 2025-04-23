'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { NoiseReport } from '@/types';

interface HeatMapProps {
  reports: NoiseReport[];
  center?: [number, number];
  zoom?: number;
}

function HeatmapLayer({ reports }: { reports: NoiseReport[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !reports.length) return;

    // Convert reports to heatmap data format [lat, lng, intensity]
    const heatData = reports.map(report => [
      report.location.lat,
      report.location.lng,
      Math.min(report.noiseLevel / 100, 1) // Normalize noise level to 0-1 range
    ]);

    // @ts-ignore - leaflet.heat types are not available
    const heatLayer = L.heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 10,
      max: 1.0,
      gradient: {
        0.4: 'blue',
        0.6: 'lime',
        0.8: 'yellow',
        1.0: 'red'
      }
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, reports]);

  return null;
}

export default function HeatMap({ reports, center = [18.5204, 73.8567], zoom = 13 }: HeatMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-full w-full"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <HeatmapLayer reports={reports} />
    </MapContainer>
  );
} 