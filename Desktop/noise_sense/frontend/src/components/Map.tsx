'use client';

import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import { Icon, LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Location, NoiseReport } from '@/types';
import { useEffect, useMemo, useState } from 'react';

interface MapProps {
  location: Location;
  reports?: NoiseReport[];
  onMarkerClick?: (report: NoiseReport) => void;
  onMarkerDrag?: (location: Location) => void;
  onMarkerDragEnd?: () => void;
  draggable?: boolean;
}

interface Point {
  lat: number;
  lng: number;
  intensity: number;
}

interface MarkerDragEvent {
  target: {
    getLatLng: () => LatLng;
  };
}

const getMarkerIcon = (noiseLevel: number): Icon => {
  const color = noiseLevel > 80 ? '#ef4444' : 
               noiseLevel > 70 ? '#f59e0b' : 
               noiseLevel > 60 ? '#10b981' : '#3b82f6';
  
  return new Icon({
    iconUrl: `/markers/${color.substring(1)}.svg`,
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

const Map = ({ location, reports = [], onMarkerClick, onMarkerDrag, onMarkerDragEnd, draggable = false }: MapProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const points: Point[] = useMemo(() => reports.map(report => ({
    lat: report.location.lat,
    lng: report.location.lng,
    intensity: Math.min(report.noiseLevel / 100, 1),
  })), [reports]);

  // Memoize marker icon to prevent unnecessary re-renders
  const markerIcon = useMemo(() => getMarkerIcon(70), []);

  // Memoize event handlers
  const markerEventHandlers = useMemo(() => ({
    dragend: (e: MarkerDragEvent) => {
      try {
        const marker = e.target;
        const position = marker.getLatLng();
        onMarkerDrag?.({ lat: position.lat, lng: position.lng });
        onMarkerDragEnd?.();
      } catch (error) {
        console.error('Error handling marker drag:', error);
        setError('Failed to update location. Please try again.');
      }
    },
  }), [onMarkerDrag, onMarkerDragEnd]);

  const handleMapLoad = () => {
    setIsLoading(false);
  };

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="text-red-500 dark:text-red-400 text-center p-4">
          <p className="font-medium">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-2 text-sm text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-10">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <MapContainer
        center={[location.lat, location.lng]}
        zoom={13}
        className="h-full w-full"
        whenReady={handleMapLoad}
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
            icon={markerIcon}
            eventHandlers={markerEventHandlers}
            draggable={true}
          />
        )}
        <MapUpdater location={location} />
      </MapContainer>
    </div>
  );
};

export default Map; 