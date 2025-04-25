import { NoiseReport } from "@/integrations/supabase/types";

// Pune coordinates bounds (approximate)
const PUNE_BOUNDS = {
  lat: { min: 18.45, max: 18.65 },
  lng: { min: 73.75, max: 74.05 }
};

// Common noise types in urban areas
const NOISE_TYPES = [
  "Traffic",
  "Construction",
  "Industrial",
  "Loudspeakers",
  "Restaurant/Bar",
  "Events",
  "Festival",
  "Market",
  "Train",
  "Aircraft",
  "Vehicle Horn",
  "Machinery",
  "Generator",
  "Hawkers",
  "Neighbors"
];

// Popular areas in Pune for more realistic clustering
const PUNE_AREAS = [
  { name: "Koregaon Park", lat: 18.5362, lng: 73.8961, noiseTypes: ["Restaurant/Bar", "Traffic", "Events"] },
  { name: "Hinjewadi IT Park", lat: 18.5913, lng: 73.7389, noiseTypes: ["Traffic", "Construction", "Generator"] },
  { name: "Shivaji Nagar", lat: 18.5308, lng: 73.8478, noiseTypes: ["Traffic", "Market", "Loudspeakers"] },
  { name: "Kothrud", lat: 18.5074, lng: 73.8077, noiseTypes: ["Traffic", "Construction", "Neighbors"] },
  { name: "Hadapsar", lat: 18.4980, lng: 73.9430, noiseTypes: ["Industrial", "Traffic", "Machinery"] },
  { name: "Pune Camp", lat: 18.5157, lng: 73.8759, noiseTypes: ["Market", "Hawkers", "Traffic"] },
  { name: "Sinhagad Road", lat: 18.4673, lng: 73.7999, noiseTypes: ["Traffic", "Construction", "Neighbors"] },
  { name: "Viman Nagar", lat: 18.5679, lng: 73.9143, noiseTypes: ["Aircraft", "Traffic", "Restaurant/Bar"] },
  { name: "Baner", lat: 18.5590, lng: 73.7868, noiseTypes: ["Traffic", "Construction", "Restaurant/Bar"] },
  { name: "MIDC Industrial Area", lat: 18.6207, lng: 73.8567, noiseTypes: ["Industrial", "Machinery", "Generator"] }
];

/**
 * Generate a random number between min and max
 */
function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * Generate a random date within the last 30 days
 */
function randomDate(days: number = 30): string {
  const now = new Date();
  const pastDate = new Date(now.getTime() - randomBetween(0, days * 24 * 60 * 60 * 1000));
  return pastDate.toISOString();
}

/**
 * Generate a random noise level based on the noise type
 */
function getNoiseLevel(noiseType: string): number {
  // Different noise types have different typical ranges
  switch (noiseType) {
    case "Traffic":
      return Math.round(randomBetween(65, 85));
    case "Construction":
      return Math.round(randomBetween(70, 95));
    case "Industrial":
      return Math.round(randomBetween(70, 90));
    case "Loudspeakers":
      return Math.round(randomBetween(75, 100));
    case "Festival":
      return Math.round(randomBetween(80, 105));
    case "Restaurant/Bar":
      return Math.round(randomBetween(65, 85));
    case "Vehicle Horn":
      return Math.round(randomBetween(70, 90));
    case "Machinery":
      return Math.round(randomBetween(75, 95));
    case "Generator":
      return Math.round(randomBetween(70, 90));
    case "Aircraft":
      return Math.round(randomBetween(75, 105));
    case "Train":
      return Math.round(randomBetween(70, 90));
    case "Market":
      return Math.round(randomBetween(65, 85));
    case "Hawkers":
      return Math.round(randomBetween(60, 80));
    case "Neighbors":
      return Math.round(randomBetween(50, 75));
    case "Events":
      return Math.round(randomBetween(70, 95));
    default:
      return Math.round(randomBetween(60, 85));
  }
}

/**
 * Generate coordinates biased towards certain areas of Pune
 */
function generateBiasedLocation(): { lat: number, lng: number, address: string, noiseType: string } {
  // 70% chance to be near a defined area, 30% chance to be random within Pune
  if (Math.random() < 0.7) {
    // Pick a random area
    const area = PUNE_AREAS[Math.floor(Math.random() * PUNE_AREAS.length)];
    
    // Generate a location near the area (within ~2km)
    const lat = area.lat + (Math.random() - 0.5) * 0.02;
    const lng = area.lng + (Math.random() - 0.5) * 0.02;
    
    // Pick a noise type common to this area
    const noiseType = area.noiseTypes[Math.floor(Math.random() * area.noiseTypes.length)];
    
    return {
      lat,
      lng,
      address: `Near ${area.name}, Pune`,
      noiseType
    };
  } else {
    // Random location in Pune
    const lat = randomBetween(PUNE_BOUNDS.lat.min, PUNE_BOUNDS.lat.max);
    const lng = randomBetween(PUNE_BOUNDS.lng.min, PUNE_BOUNDS.lng.max);
    
    // Random noise type
    const noiseType = NOISE_TYPES[Math.floor(Math.random() * NOISE_TYPES.length)];
    
    return { 
      lat, 
      lng, 
      address: "Pune, Maharashtra", 
      noiseType 
    };
  }
}

/**
 * Generate a set of random user names for reports
 */
function generateReporterName(): string {
  const firstNames = ["Raj", "Priya", "Amit", "Neha", "Rahul", "Ananya", "Vikram", "Meera", "Arjun", "Pooja", "Sanjay", "Divya"];
  const lastNames = ["Sharma", "Patel", "Singh", "Desai", "Mehta", "Joshi", "Kumar", "Shah", "Verma", "Agarwal", "Kulkarni", "Patil"];
  
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

/**
 * Generate a random note based on noise type
 */
function generateNote(noiseType: string): string {
  const notes = {
    "Traffic": [
      "Heavy traffic noise during rush hour",
      "Constant honking from vehicles",
      "Truck traffic creating vibrations",
      "Bus stand noise throughout day",
      "Two-wheelers with modified silencers",
    ],
    "Construction": [
      "Building construction nearby",
      "Road repair work",
      "Drilling noise from construction site",
      "Late night construction activity",
      "Heavy machinery operating",
    ],
    "Industrial": [
      "Factory noise throughout night",
      "Industrial machinery running after hours",
      "Metallic sounds from workshop",
      "Continuous humming from factory",
      "Industrial exhaust fans",
    ],
    "Loudspeakers": [
      "Loud music from event",
      "Religious gathering with loudspeakers",
      "Political rally with announcements",
      "Street advertisements on loudspeakers",
      "Public address system too loud",
    ],
    "Restaurant/Bar": [
      "Loud music from restaurant",
      "Patrons making noise outside bar",
      "Late night crowd from restaurant",
      "Kitchen exhaust fan noise",
      "Outdoor seating area noise",
    ]
  };

  // Use specific notes if available, otherwise generate a generic one
  if (noiseType in notes) {
    const typeNotes = notes[noiseType as keyof typeof notes];
    return typeNotes[Math.floor(Math.random() * typeNotes.length)];
  }
  
  return `Excessive noise from ${noiseType.toLowerCase()} source`;
}

/**
 * Generate mock noise reports for Pune
 * @param count Number of reports to generate
 * @returns Array of noise reports
 */
export function generatePuneNoiseData(count: number = 500): NoiseReport[] {
  const reports: NoiseReport[] = [];
  
  for (let i = 0; i < count; i++) {
    // Generate location and associated noise type
    const { lat, lng, address, noiseType } = generateBiasedLocation();
    
    // Generate noise level based on type
    const decibelLevel = getNoiseLevel(noiseType);
    
    // Bias toward recent dates (more reports in last week)
    const daysAgo = Math.random() < 0.6 ? 7 : 30;
    
    reports.push({
      id: `report-${i + 1}`,
      latitude: lat,
      longitude: lng,
      decibel_level: decibelLevel,
      noise_type: noiseType,
      created_at: randomDate(daysAgo),
      notes: Math.random() > 0.3 ? generateNote(noiseType) : undefined, // 70% have notes
      address: address,
      reported_by: Math.random() > 0.2 ? generateReporterName() : undefined, // 80% have reporter names
      status: Math.random() < 0.7 ? "pending" : Math.random() < 0.85 ? "resolved" : "investigating", // Mix of statuses
      flagged: Math.random() < 0.15 // 15% are flagged
    });
  }
  
  return reports;
} 