'use client';

import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Location, NoiseReport } from '@/types';
import { useEffect } from 'react';

interface MapProps {
  location: Location;
  reports?: NoiseReport[];
  onMarkerClick?: (report: NoiseReport) => void;
  onMarkerDrag?: (location: Location) => void;
  draggable?: boolean;
}

interface Point {
  lat: number;
  lng: number;
  intensity: number;
}

const getMarkerIcon = (noiseLevel: number) => {
  const color = noiseLevel > 80 ? '#ef4444' : 
               noiseLevel > 70 ? '#f59e0b' : 
               noiseLevel > 60 ? '#10b981' : '#3b82f6';
  
  return new Icon({
    iconUrl: `/markers/${color.substring(1)}.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
};

function MapUpdater({ location }: { location: Location }) {
  const map = useMap();

  useEffect(() => {
    map.setView([location.lat, location.lng]);
  }, [location, map]);

  return null;
}

const Map = ({ location, reports = [], onMarkerClick, onMarkerDrag, draggable = false }: MapProps) => {
  const points: Point[] = reports.map(report => ({
    lat: report.location.lat,
    lng: report.location.lng,
    intensity: Math.min(report.noiseLevel / 100, 1),
  }));

  return (
    <MapContainer
      center={[location.lat, location.lng]}
      zoom={13}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((point, index) => (
        <CircleMarker
          key={`heat-${index}`}
          center={[point.lat, point.lng]}
          radius={20}
          fillOpacity={point.intensity * 0.6}
          fillColor="#ef4444"
          color="#ef4444"
          weight={0}
        />
      ))}
      {reports.map((report, index) => (
        <Marker
          key={`marker-${index}`}
          position={[report.location.lat, report.location.lng]}
          icon={getMarkerIcon(report.noiseLevel)}
          eventHandlers={{
            click: () => onMarkerClick?.(report),
          }}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold">Noise Level: {report.noiseLevel.toFixed(1)} dB</h3>
              <p className="text-sm">Category: {report.category}</p>
              <p className="text-sm">Time: {new Date(report.timestamp).toLocaleString()}</p>
            </div>
          </Popup>
        </Marker>
      ))}
      {draggable && (
        <Marker
          position={[location.lat, location.lng]}
          icon={getMarkerIcon(70)}
          eventHandlers={{
            dragend: (e) => {
              const marker = e.target;
              const position = marker.getLatLng();
              onMarkerDrag?.({ lat: position.lat, lng: position.lng });
            },
          }}
          draggable={true}
        />
      )}
      <MapUpdater location={location} />
    </MapContainer>
  );
};

export default Map; 