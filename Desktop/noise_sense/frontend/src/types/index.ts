export interface Location {
  lat: number;
  lng: number;
}

export type NoiseCategory = 'traffic' | 'construction' | 'event' | 'industrial' | 'other';

export interface NoiseReport {
  id: string;
  location: Location;
  noiseLevel: number;
  category: NoiseCategory;
  description?: string;
  timestamp: string;
}

export interface MapProps {
  location: Location;
  draggable?: boolean;
  onMarkerDrag?: (location: Location) => void;
}

export interface HeatMapProps {
  data: NoiseReport[];
  center: Location;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string | string[];
    tension?: number;
    borderWidth?: number;
  }[];
} 