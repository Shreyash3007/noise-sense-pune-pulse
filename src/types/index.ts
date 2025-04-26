
// Define shared types for the application

export interface NoiseReport {
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
  user_id?: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface TimeSeriesPoint {
  time: string;
  avgLevel: number;
  maxLevel: number;
  minLevel: number;
  count: number;
  primaryNoiseType: string;
}

export interface NoiseAIResponse {
  text: string;
  timestamp: string;
  source: 'ai' | 'user';
}

export interface NoiseAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
