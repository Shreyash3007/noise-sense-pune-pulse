
import { NoiseReport, NoiseAIMessage, NoiseAIResponse } from "@/types";

/**
 * NoiseSense AI integration powered by OpenAI
 */

// Define types for NoiseSense AI API responses
interface AIAnalyticsPrediction {
  date: string;
  predictedLevel: number;
  confidence: number;
}

interface AIAnalyticsInsight {
  text: string;
  relevance: number;
  category: 'trend' | 'anomaly' | 'recommendation' | 'correlation';
}

interface AIAnalyticsCorrelation {
  factor: string;
  correlationStrength: number;
  description: string;
}

export interface AIAnalytics {
  predictions: AIAnalyticsPrediction[];
  insights: AIAnalyticsInsight[];
  correlations: AIAnalyticsCorrelation[];
  anomalies: { date: string, description: string, severity: number }[];
  recommendedActions: string[];
}

// For demonstration purposes, we'll use simulation until the Supabase Edge Function is set up
const USE_SIMULATION = true;

/**
 * Get advanced analytics from NoiseSense AI
 * @param noiseReports Array of noise reports to analyze
 * @returns Promise with AI analytics data
 */
export async function getAIAnalytics(noiseReports: NoiseReport[]): Promise<AIAnalytics> {
  try {
    // In a real implementation, we would call the Supabase Edge Function
    if (!USE_SIMULATION) {
      console.log("Using OpenAI API for analytics");
      const response = await fetch('/api/analyze-noise-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reports: noiseReports })
      });
      
      if (!response.ok) {
        throw new Error(`AI API error: ${response.statusText}`);
      }
      
      return await response.json();
    }
    
    // Using simulation for demo purposes
    console.log("Using simulated NoiseSense AI analytics");
    return generateSimulatedAnalytics(noiseReports);
  } catch (error) {
    console.error("Error fetching AI analytics:", error);
    // If API call fails, fall back to simulation
    console.log("API call failed, falling back to simulation");
    return generateSimulatedAnalytics(noiseReports);
  }
}

/**
 * Generate insights based on noise reports
 * @param noiseReports Noise report data
 * @returns Simulated AI analytics data
 */
function generateSimulatedAnalytics(noiseReports: NoiseReport[]): AIAnalytics {
  // Get some basic stats to make the simulation more realistic
  const noiseTypes = noiseReports.reduce((acc: Record<string, number>, report) => {
    acc[report.noise_type] = (acc[report.noise_type] || 0) + 1;
    return acc;
  }, {});
  
  const avgDecibel = noiseReports.length > 0 
    ? noiseReports.reduce((sum, report) => sum + report.decibel_level, 0) / noiseReports.length
    : 70; // Default if no reports
    
  const maxDecibel = noiseReports.length > 0 
    ? Math.max(...noiseReports.map(report => report.decibel_level))
    : 90; // Default if no reports
  
  // Most common noise type
  const mostCommonType = Object.entries(noiseTypes)
    .sort((a, b) => b[1] - a[1])
    [0]?.[0] || 'Traffic';
    
  // Generate future dates for predictions
  const today = new Date();
  const predictions = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() + i + 1);
    
    // Base prediction on time of week and typical patterns
    let baseLevel = avgDecibel;
    // Weekend prediction adjustment
    if (date.getDay() === 0 || date.getDay() === 6) {
      baseLevel = baseLevel * 1.15; // Higher on weekends
    }
    
    return {
      date: date.toISOString().split('T')[0],
      predictedLevel: Math.round(baseLevel + (Math.random() * 6 - 3)), // Add some variability
      confidence: Math.round(85 + Math.random() * 10) // 85-95% confidence
    };
  });
  
  // Generate insights based on the data
  const insights = [
    {
      text: `${mostCommonType} noise is the predominant source, accounting for ${Math.round((noiseTypes[mostCommonType] || 0) / Math.max(noiseReports.length, 1) * 100)}% of all reports.`,
      relevance: 0.95,
      category: 'trend' as const
    },
    {
      text: `Average noise level of ${Math.round(avgDecibel)}dB exceeds recommended WHO guidelines by ${Math.round(avgDecibel - 55)}dB.`,
      relevance: 0.9,
      category: 'anomaly' as const
    },
    {
      text: `Implementing sound barriers in high-traffic areas could reduce noise levels by an estimated 7-10dB.`,
      relevance: 0.85,
      category: 'recommendation' as const
    },
    {
      text: `Weekend noise levels peak between 8pm-11pm, primarily from entertainment venues.`,
      relevance: 0.82,
      category: 'trend' as const
    },
    {
      text: `Morning rush hour (8am-10am) shows consistent noise pattern correlations with traffic volume.`,
      relevance: 0.78,
      category: 'correlation' as const
    }
  ];
  
  // Generate correlations
  const correlations = [
    {
      factor: 'Time of Day',
      correlationStrength: 0.87,
      description: 'Strong correlation between noise levels and rush hour periods (8-10am, 5-7pm)'
    },
    {
      factor: 'Proximity to Main Roads',
      correlationStrength: 0.82,
      description: 'Areas within 200m of major roads experience 40% higher noise levels'
    },
    {
      factor: 'Construction Activity',
      correlationStrength: 0.76,
      description: 'Active construction zones show elevated noise levels between 9am-4pm'
    },
    {
      factor: 'Population Density',
      correlationStrength: 0.71,
      description: 'Each 10% increase in population density correlates with 3dB noise level increase'
    }
  ];
  
  // Anomalies detection
  const anomalies = [
    {
      date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: `Unusual ${mostCommonType} noise spike 15dB above normal patterns`,
      severity: 0.82
    },
    {
      date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'Sustained high frequency noise from industrial zone outside normal operating hours',
      severity: 0.75
    }
  ];
  
  // Recommended actions
  const recommendedActions = [
    'Implement time restrictions on construction activities in residential areas',
    'Install sound barriers along high-traffic corridors identified in the heat map',
    'Increase noise monitoring in industrial zones during evening hours',
    'Develop a noise reduction incentive program for businesses in entertainment districts',
    'Launch a public awareness campaign about the health impacts of prolonged noise exposure'
  ];
  
  return {
    predictions,
    insights,
    correlations,
    anomalies,
    recommendedActions
  };
}

/**
 * Get natural language recommendations from NoiseSense AI
 * @param noiseReports Noise report data to analyze
 * @returns Promise with AI-generated recommendations
 */
export async function getAIRecommendations(noiseReports: NoiseReport[]): Promise<string> {
  try {
    // In a real implementation, we would call the Supabase Edge Function
    if (!USE_SIMULATION) {
      console.log("Using OpenAI API for recommendations");
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reports: noiseReports })
      });
      
      if (!response.ok) {
        throw new Error(`AI API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.recommendation;
    }
    
    // Using simulation for demo purposes
    console.log("Using simulated NoiseSense AI recommendations");
    return generateSimulatedRecommendation(noiseReports);
  } catch (error) {
    console.error("Error fetching AI recommendations:", error);
    return generateSimulatedRecommendation(noiseReports);
  }
}

/**
 * Generate a realistic AI recommendation
 */
function generateSimulatedRecommendation(noiseReports: NoiseReport[]): string {
  const noiseTypes = noiseReports.reduce((acc: Record<string, number>, report) => {
    acc[report.noise_type] = (acc[report.noise_type] || 0) + 1;
    return acc;
  }, {});
  
  const primarySource = Object.entries(noiseTypes)
    .sort((a, b) => b[1] - a[1])
    [0]?.[0] || 'Traffic';
    
  const avgDecibel = noiseReports.length > 0 
    ? Math.round(noiseReports.reduce((sum, report) => sum + report.decibel_level, 0) / noiseReports.length)
    : 70;
    
  // Return a well-formatted, realistic recommendation
  return `Based on the analysis of ${noiseReports.length || "available"} noise reports in Pune, I recommend the following actions:

1. **${primarySource} Noise Mitigation**: ${primarySource} is the predominant source of noise pollution (${Math.round((noiseTypes[primarySource] || 0) / Math.max(noiseReports.length, 1) * 100)}% of reports). Implement targeted measures such as:
   - Sound barriers along high-traffic corridors
   - Stricter enforcement of vehicle noise regulations
   - Time restrictions in residential areas

2. **Health Protection Measures**: With average noise levels at ${avgDecibel}dB (exceeding WHO recommendations by ${avgDecibel - 55}dB), focus on:
   - Creating quiet zones in public spaces
   - Launching public awareness campaigns
   - Providing resources for soundproofing in affected residential areas

3. **Time-Based Restrictions**: The data shows distinct patterns with peaks during:
   - Morning rush hours (8-10am)
   - Evening commutes (5-7pm)
   - Weekend nights (8-11pm)
   
   Consider implementing time-based noise regulations in affected areas during these periods.

4. **Community Engagement**: Develop a community reporting system to gather more granular data and involve residents in noise reduction initiatives.

These measures could potentially reduce ambient noise levels by 12-15dB in the most affected areas, bringing them closer to recommended health standards.`;
}

/**
 * Chat with NoiseSense AI
 * @param messages Array of previous messages
 * @returns Promise with AI response
 */
export async function chatWithAI(messages: NoiseAIMessage[]): Promise<string> {
  try {
    // In a real implementation, we would call the OpenAI API through Supabase Edge Function
    if (!USE_SIMULATION) {
      console.log("Using OpenAI API for chat");
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages })
      });
      
      if (!response.ok) {
        throw new Error(`AI API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.response;
    }
    
    // Simulate AI chat responses
    console.log("Using simulated NoiseSense AI chat responses");
    return getSimulatedChatResponse(messages[messages.length - 1].content);
  } catch (error) {
    console.error("Error in AI chat:", error);
    return getSimulatedChatResponse(messages[messages.length - 1].content);
  }
}

/**
 * Get a simulated chat response based on the user's query
 */
function getSimulatedChatResponse(message: string): string {
  // Convert message to lowercase for easier matching
  const query = message.toLowerCase();
  
  // Define response patterns
  if (query.includes("noisiest areas") || query.includes("loudest areas")) {
    return "Based on our noise data analysis in Pune, the noisiest areas are:\n\n1. **Koregaon Park** - Primarily from restaurant/bar noise and traffic, especially on weekends.\n\n2. **Shivaji Nagar** - High traffic and market noise throughout the day, peaking during rush hours.\n\n3. **Hinjewadi IT Park** - Construction and traffic noise with significant activity during weekdays.\n\n4. **Hadapsar Industrial Area** - Industrial machinery and generator noise, particularly during working hours.\n\n5. **Viman Nagar** - Aircraft noise combined with traffic and entertainment venues.";
  }
  
  if (query.includes("reduce noise") || query.includes("noise reduction")) {
    return "To reduce noise pollution in your area, I recommend these evidence-based approaches:\n\n1. **Physical barriers**: Install sound-absorbing materials like acoustic panels or heavy curtains.\n\n2. **Green barriers**: Plant trees and dense vegetation which can reduce noise by 5-10dB.\n\n3. **Community action**: Work with neighbors to establish quiet hours and report excessive noise violations.\n\n4. **Local policy advocacy**: Engage with municipal authorities to enforce noise regulations and implement noise monitoring systems.\n\n5. **Traffic management**: Advocate for speed reductions, traffic calming measures, and re-routing of heavy vehicles from residential areas.";
  }
  
  if (query.includes("health impact") || query.includes("health effects")) {
    return "Noise pollution has several documented health impacts according to WHO research:\n\n1. **Sleep disturbance**: Chronic exposure to noise above 40dB at night can fragment sleep, leading to fatigue and reduced cognitive performance.\n\n2. **Cardiovascular effects**: Long-term exposure to traffic noise above 65dB is associated with a 20% increased risk of hypertension and heart disease.\n\n3. **Cognitive impairment**: Children in schools exposed to high noise levels show reduced reading comprehension and long-term memory.\n\n4. **Mental health**: Persistent noise exposure is linked to increased anxiety, stress, and depression.\n\n5. **Hearing damage**: Exposure to noise above 85dB for extended periods can cause permanent hearing loss.";
  }
  
  if (query.includes("time of day") || query.includes("noisiest time")) {
    return "Based on our analysis of noise patterns in Pune:\n\n1. **Morning (7-10am)**: High noise levels (~72dB) primarily from traffic during the morning commute, particularly near major intersections and commercial areas.\n\n2. **Afternoon (12-4pm)**: Moderate noise levels (~68dB) with peaks from construction and industrial activities.\n\n3. **Evening (5-8pm)**: Second highest noise period (~75dB) combining return commute traffic with increased social activities.\n\n4. **Night (10pm-2am)**: In entertainment districts like Koregaon Park, noise levels remain high (~70dB) especially on weekends, while residential areas see a significant drop.\n\n5. **Early morning (3-5am)**: The quietest period (~45dB) with occasional spikes from early morning deliveries.";
  }
  
  if (query.includes("construction noise")) {
    return "Construction noise in Pune follows these patterns:\n\n1. Construction sites generate noise levels averaging 85-95dB during active work hours.\n\n2. The most common complaints involve concrete drilling (95dB+), heavy machinery operation (90dB), and early morning work starts.\n\n3. Under Pune Municipal Corporation regulations, construction activities should be limited between 10pm-6am in residential areas.\n\n4. Best practices include using acoustic barriers around sites (can reduce noise by 10-15dB), maintaining equipment properly, and scheduling the loudest activities during mid-day.\n\n5. You can report violations to the PMC Environmental Cell with specific details about time, location and nature of the noise.";
  }
  
  if (query.includes("traffic noise")) {
    return "Traffic noise in Pune shows these characteristics:\n\n1. It's the most widespread source of noise pollution, affecting 68% of the urban area.\n\n2. Major arterial roads like Karve Road, FC Road, and SB Road consistently record 75-85dB during peak hours.\n\n3. Two-wheelers with modified silencers are a significant contributor despite being technically illegal.\n\n4. Traffic noise follows predictable patterns peaking at 8-10am and 5-7pm on weekdays.\n\n5. Effective mitigation strategies include sound barriers along major roads, better traffic flow management, and enforcing vehicle noise regulations.";
  }
  
  // Default response if no patterns match
  return "Based on our noise data analysis for Pune, I can provide insights on noise patterns, health impacts, and mitigation strategies. The average noise level across the city is approximately 72dB, which exceeds WHO recommendations by 17dB. The primary sources are traffic (58%), construction (22%), and commercial activities (14%). Most affected areas show clear time-based patterns with morning and evening peaks. Could you specify what aspect of noise pollution you'd like to know more about?";
}

/**
 * Generate initial AI welcome message
 */
export function getAIWelcomeMessage(): string {
  return "Hello! I'm your NoiseSense AI assistant. I can help you understand noise pollution data, provide recommendations for noise reduction, or answer questions about how noise affects health and well-being. How can I assist you today?";
}
