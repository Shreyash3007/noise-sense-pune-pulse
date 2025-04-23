export interface Location {
  lat: number;
  lng: number;
}

export interface NoiseReport {
  id: string;
  location: Location;
  noiseLevel: number;
  category: string;
  description: string;
  timestamp: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

export type NoiseCategory = 'traffic' | 'construction' | 'event' | 'industrial' | 'other';

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