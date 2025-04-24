import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines tailwind classes safely
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates sample noise report data for development and testing
 */
export function generateSampleData(count = 20) {
  const puneCenter = [18.5204, 73.8567];
  const sampleData = [];
  
  const noiseTypes = [
    'Traffic', 
    'Construction', 
    'Industrial', 
    'Social Event', 
    'Loudspeaker', 
    'Vehicle Horn',
    'Commercial',
    'Residential',
    'Other'
  ];
  
  // Generate random points around Pune
  for (let i = 0; i < count; i++) {
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
    date.setHours(Math.floor(Math.random() * 24));
    date.setMinutes(Math.floor(Math.random() * 60));
    
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
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | string) {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(date);
}

/**
 * Get color based on decibel level
 */
export function getDecibelColor(level: number) {
  if (level >= 80) return "bg-red-500";
  if (level >= 65) return "bg-orange-500";
  if (level >= 50) return "bg-yellow-500";
  return "bg-green-500";
}

/**
 * Format decibel level with severity label
 */
export function formatDecibelLevel(level: number) {
  if (level >= 80) return `${level} dB (Dangerous)`;
  if (level >= 65) return `${level} dB (High)`;
  if (level >= 50) return `${level} dB (Moderate)`;
  return `${level} dB (Low)`;
}
