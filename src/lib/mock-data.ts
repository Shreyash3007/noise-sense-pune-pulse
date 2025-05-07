// No need for imports - we are self-contained

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
export const PUNE_AREAS = [
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

// Define NoiseReport interface for generated mock data
export interface NoiseReport {
  id: string;
  latitude: number | null;
  longitude: number | null;
  decibel_level: number;
  noise_type: string;
  created_at: string;
  notes?: string;
  address?: string;
  reported_by?: string;
  status?: string;
  flagged?: boolean;
  time_data?: {
    hour: number;
    minute: number;
    formatted_time: string;
    day_of_week: string;
    time_of_day: string;
    timestamp: number;
  };
}

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
    
    // Create date with random hour for better time distribution
    const date = new Date(randomDate(daysAgo));
    const hour = Math.floor(Math.random() * 24); // Random hour between 0-23
    date.setHours(hour);
    
    // Determine time of day
    const timeOfDay = 
      hour >= 5 && hour < 12 ? "Morning" :
      hour >= 12 && hour < 17 ? "Afternoon" :
      hour >= 17 && hour < 22 ? "Evening" : "Night";
    
    // Day of week
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    
    reports.push({
      id: `report-${i + 1}`,
      latitude: lat,
      longitude: lng,
      decibel_level: decibelLevel,
      noise_type: noiseType,
      created_at: date.toISOString(),
      address: address || "Pune, Maharashtra",
      time_data: {
        hour: hour,
        minute: date.getMinutes(),
        formatted_time: `${hour.toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
        day_of_week: dayOfWeek,
        time_of_day: timeOfDay,
        timestamp: date.getTime()
      }
    });
  }
  
  // Ensure we have data in all time periods by adding at least 5 reports in each period
  const periods = ["Morning", "Afternoon", "Evening", "Night"];
  
  periods.forEach(period => {
    const periodReports = reports.filter(r => r.time_data?.time_of_day === period);
    
    if (periodReports.length < 5) {
      const toAdd = 5 - periodReports.length;
      
      for (let i = 0; i < toAdd; i++) {
        // Generate location and associated noise type
        const { lat, lng, address, noiseType } = generateBiasedLocation();
        
        // Generate noise level based on type
        const decibelLevel = getNoiseLevel(noiseType);
        
        // Create date with hour in the right period
        const date = new Date(randomDate(7)); // Recent date
        let hour: number;
        
        if (period === "Morning") hour = 7 + Math.floor(Math.random() * 5); // 7-11
        else if (period === "Afternoon") hour = 12 + Math.floor(Math.random() * 5); // 12-16
        else if (period === "Evening") hour = 17 + Math.floor(Math.random() * 5); // 17-21
        else hour = (22 + Math.floor(Math.random() * 7)) % 24; // 22-23, 0-4
        
        date.setHours(hour);
        
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
        
        reports.push({
          id: `report-${count + reports.length + 1}`,
          latitude: lat,
          longitude: lng,
          decibel_level: decibelLevel,
          noise_type: noiseType,
          created_at: date.toISOString(),
          address: address || "Pune, Maharashtra",
          time_data: {
            hour: hour,
            minute: date.getMinutes(),
            formatted_time: `${hour.toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
            day_of_week: dayOfWeek,
            time_of_day: period,
            timestamp: date.getTime()
          }
        });
      }
    }
  });
  
  return reports;
}

/**
 * Generate mock AI analytics data for the admin portal
 */
export const getAIAnalytics = async (reports: any[]) => {
  // Simulate analytics generation delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const categories = ['Traffic', 'Construction', 'Industrial', 'Loudspeakers', 'Events']
    .map(cat => {
      const count = reports.filter(r => r.noise_type.includes(cat)).length;
      return {
        category: cat,
        count,
        percentage: Math.round((count / reports.length) * 100),
        predictionNextMonth: Math.round(count * (0.8 + Math.random() * 0.4)),
        riskScore: Math.round(Math.random() * 100)
      };
    })
    .sort((a, b) => b.count - a.count);

  const timeDistribution = [
    { period: 'Morning (6-12)', count: Math.round(reports.length * 0.25) },
    { period: 'Afternoon (12-17)', count: Math.round(reports.length * 0.2) },
    { period: 'Evening (17-22)', count: Math.round(reports.length * 0.45) },
    { period: 'Night (22-6)', count: Math.round(reports.length * 0.1) },
  ];
  
  const anomalies = [
    {
      title: 'Unusual increase in construction noise',
      description: 'Construction noise reports have increased by 35% in Kothrud area',
      impact: 'high',
      date: new Date().toLocaleDateString()
    },
    {
      title: 'Traffic noise pattern change',
      description: 'Traffic noise shifting to later hours in Baner area',
      impact: 'medium',
      date: new Date().toLocaleDateString()
    },
    {
      title: 'Unexpected events noise',
      description: 'Multiple reports of loud events in no-event zone in Viman Nagar',
      impact: 'high',
      date: new Date().toLocaleDateString()
    }
  ];
  
  const correlations = [
    {
      factor: 'Traffic Density',
      correlationStrength: 0.85,
      description: 'Strong correlation between traffic volume and noise levels'
    },
    {
      factor: 'Time of Day',
      correlationStrength: 0.72,
      description: 'Peak noise levels align with rush hours (9 AM and 6 PM)'
    },
    {
      factor: 'Construction Activity',
      correlationStrength: 0.68,
      description: 'Areas with active construction show elevated noise levels'
    },
    {
      factor: 'Population Density',
      correlationStrength: 0.64,
      description: 'Higher population areas generally report more noise issues'
    },
    {
      factor: 'Commercial Zoning',
      correlationStrength: 0.59,
      description: 'Commercial zones show higher noise levels after business hours'
    }
  ];
  
  return {
    categories,
    timeDistribution,
    anomalies,
    correlations,
    totalReportsAnalyzed: reports.length,
    averageNoiseLevel: Math.round(reports.reduce((acc, r) => acc + r.decibel_level, 0) / reports.length),
    noiseLevelTrend: Math.random() > 0.5 ? 'increasing' : 'decreasing',
    hottestTimeOfDay: '18:00 - 20:00',
    hottestDayOfWeek: 'Friday',
    generatedAt: new Date().toISOString()
  };
};

/**
 * Generate mock AI recommendations based on the report data
 */
export const getAIRecommendations = async (reports: any[]) => {
  // Simulate recommendations generation delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Find the most common noise type
  const noiseTypes: Record<string, number> = {};
  reports.forEach(report => {
    const type = report.noise_type;
    noiseTypes[type] = (noiseTypes[type] || 0) + 1;
  });
  
  const mostCommonType = Object.entries(noiseTypes)
    .sort((a, b) => b[1] - a[1])
    .map(([type]) => type)[0];
  
  // Get areas with highest noise
  const areaNoiseMap: Record<string, { total: number, count: number }> = {};
  reports.forEach(report => {
    const area = report.address?.split(',')[0] || 'Unknown';
    if (!areaNoiseMap[area]) {
      areaNoiseMap[area] = { total: 0, count: 0 };
    }
    areaNoiseMap[area].total += report.decibel_level;
    areaNoiseMap[area].count += 1;
  });
  
  const highNoiseAreas = Object.entries(areaNoiseMap)
    .map(([area, data]) => ({
      area,
      avgNoise: data.total / data.count,
      reportCount: data.count
    }))
    .sort((a, b) => b.avgNoise - a.avgNoise)
    .slice(0, 3);
  
  // Generate recommendations
  const recommendations = [
    {
      title: `Increase enforcement for ${mostCommonType} noise`,
      description: `As ${mostCommonType} is the most reported noise type, consider increasing monitoring and enforcement in affected areas.`,
      priority: 'high',
      estimatedImpact: 'Potential 25-30% reduction in citizen complaints.'
    },
    {
      title: `Deploy sound barriers in ${highNoiseAreas[0]?.area}`,
      description: `${highNoiseAreas[0]?.area} has the highest average noise level at ${Math.round(highNoiseAreas[0]?.avgNoise || 0)}dB. Sound barriers could significantly reduce noise pollution.`,
      priority: 'high',
      estimatedImpact: 'Reduction of 8-12dB in ambient noise levels.'
    },
    {
      title: 'Time-based noise regulations',
      description: 'Implement stricter noise limits during evening hours (17:00-22:00) when most complaints occur.',
      priority: 'medium',
      estimatedImpact: 'Could address 45% of current complaints.'
    },
    {
      title: 'Public awareness campaign',
      description: 'Launch educational program about noise pollution impacts and regulations.',
      priority: 'medium',
      estimatedImpact: 'Long-term reduction in community-generated noise.'
    },
    {
      title: 'Mobile monitoring stations',
      description: `Deploy mobile noise monitoring in ${highNoiseAreas.map(a => a.area).join(', ')} with real-time alerts.`,
      priority: 'medium',
      estimatedImpact: 'Improved response time to noise violations by 65%.'
    }
  ];
  
  // Policy impact analysis
  const policyImpact = {
    noiseReduction: {
      overall: '15-20%',
      traffic: '25-30%',
      construction: '20-25%',
      events: '30-40%'
    },
    healthBenefits: [
      'Potential reduction in stress-related health issues',
      'Improved sleep quality for residents',
      'Reduced risk of noise-induced hearing problems'
    ],
    economicImpact: [
      'Increased property values in currently high-noise areas',
      'Potential savings in healthcare costs',
      'Improved productivity in work-from-home environments'
    ],
    implementationChallenges: [
      'Requires coordination across multiple departments',
      'Initial resistance from construction and entertainment industries',
      'Monitoring technology investment required'
    ]
  };
  
  // Future projections
  const timeframe = 12; // months
  const currentAvgLevel = reports.reduce((acc, r) => acc + r.decibel_level, 0) / reports.length;
  
  const projections = {
    noActionProjection: {
      months: timeframe,
      expectedNoiseLevel: Math.round(currentAvgLevel * 1.15), // 15% increase
      complaintRate: 'Increasing by 30%',
      healthImpact: 'Negative - potential increase in stress-related conditions'
    },
    recommendedActionProjection: {
      months: timeframe,
      expectedNoiseLevel: Math.round(currentAvgLevel * 0.8), // 20% decrease
      complaintRate: 'Decreasing by 35%',
      healthImpact: 'Positive - improved urban livability scores'
    }
  };
  
  return {
    recommendations,
    policyImpact,
    projections,
    analysisTimeframe: `${timeframe} months`,
    highImpactAreas: highNoiseAreas.map(a => a.area),
    generatedAt: new Date().toISOString()
  };
};

/**
 * Function to simulate AI chat for the NoiseSense system
 */
export const chatWithAI = async (messages: { role: string, content: string }[]) => {
  // Simulate chat API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const userMessage = messages[messages.length - 1].content.toLowerCase();
  
  // Simple pattern matching for demo purposes
  if (userMessage.includes('help') || userMessage.includes('what can you do')) {
    return `I can help you analyze noise data, find patterns, and provide recommendations for noise reduction. Try asking me questions like:
- "Show me highest noise areas in Pune"
- "What are the trends in traffic noise?"
- "Analyze construction noise reports"
- "Recommend solutions for noise in Koregaon Park"`;
  }
  
  if (userMessage.includes('high') || userMessage.includes('dangerous')) {
    return `I'll help you search for high noise level areas. Here are the results:

{
  "results": [
    {
      "id": "NR-2023-578",
      "location": "Hinjewadi IT Park",
      "decibel": 92,
      "type": "Construction"
    },
    {
      "id": "NR-2023-423",
      "location": "Koregaon Park",
      "decibel": 88,
      "type": "Loudspeakers"
    },
    {
      "id": "NR-2023-187",
      "location": "MIDC Industrial Area",
      "decibel": 95,
      "type": "Industrial"
    }
  ],
  "count": 3
}`;
  }
  
  if (userMessage.includes('traffic')) {
    return `I'll help you search for traffic noise reports. Here are the results:

{
  "results": [
    {
      "id": "NR-2023-142",
      "location": "Baner Road",
      "decibel": 78,
      "type": "Traffic"
    },
    {
      "id": "NR-2023-256",
      "location": "Sinhagad Road",
      "decibel": 75,
      "type": "Traffic"
    },
    {
      "id": "NR-2023-321",
      "location": "Shivaji Nagar",
      "decibel": 82,
      "type": "Traffic"
    }
  ],
  "count": 3
}`;
  }
  
  if (userMessage.includes('night') || userMessage.includes('evening')) {
    return `I'll help you search for noise reports during evening/night hours. Here are the results:

{
  "results": [
    {
      "id": "NR-2023-198",
      "location": "Koregaon Park",
      "decibel": 83,
      "type": "Restaurant/Bar"
    },
    {
      "id": "NR-2023-302",
      "location": "Viman Nagar",
      "decibel": 72,
      "type": "Events"
    },
    {
      "id": "NR-2023-476",
      "location": "Baner",
      "decibel": 68,
      "type": "Restaurant/Bar"
    }
  ],
  "count": 3
}`;
  }
  
  // Default response for other queries
  return `I'll help you search for: ${userMessage}. Here are the results:

{
  "results": [
    {
      "id": "NR-2023-142",
      "location": "Baner Road",
      "decibel": 78,
      "type": "Traffic"
    },
    {
      "id": "NR-2023-256",
      "location": "Sinhagad Road",
      "decibel": 75,
      "type": "Construction"
    },
    {
      "id": "NR-2023-321",
      "location": "Shivaji Nagar",
      "decibel": 82,
      "type": "Industrial"
    }
  ],
  "count": 3
}`;
}; 