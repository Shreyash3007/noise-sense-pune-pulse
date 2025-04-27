/**
 * Environment configuration with fallbacks for essential values
 * This centralizes all environmental configuration with type safety
 */

interface EnvConfig {
  // API Keys
  MAPBOX_ACCESS_TOKEN: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  OPENROUTER_API_KEY: string;
  
  // Feature flags
  ENABLE_ANALYTICS: boolean;
  DEBUG_MODE: boolean;
  USE_REAL_AI_API: boolean;
}

// Helper function to get environment variables with type safety
function getEnvVar(key: string, defaultValue: string = ''): string {
  // Check Vite-style imports
  const viteValue = import.meta.env?.[`VITE_${key}`];
  if (viteValue !== undefined) return String(viteValue);
  
  // Check raw Vite env
  const rawValue = import.meta.env?.[key];
  if (rawValue !== undefined) return String(rawValue);
  
  console.log(`Using default value for ${key}`);
  return defaultValue;
}

// Helper function to parse boolean
function parseBool(value: string | undefined): boolean {
  if (value === undefined) return false;
  return ['true', '1', 'yes', 'y'].includes(value.toLowerCase());
}

// Create and export the environment configuration
export const env: EnvConfig = {
  // API Keys - using static values for demonstration
  MAPBOX_ACCESS_TOKEN: getEnvVar('MAPBOX_ACCESS_TOKEN', 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA'),
  SUPABASE_URL: getEnvVar('SUPABASE_URL', 'https://your-supabase-project.supabase.co'),
  SUPABASE_ANON_KEY: getEnvVar('SUPABASE_ANON_KEY', 'your-supabase-anon-key'),
  OPENROUTER_API_KEY: "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",
  
  // Feature flags
  ENABLE_ANALYTICS: parseBool(getEnvVar('ENABLE_ANALYTICS', 'false')),
  DEBUG_MODE: parseBool(getEnvVar('DEBUG_MODE', 'false')),
  USE_REAL_AI_API: parseBool(getEnvVar('USE_REAL_AI_API', 'true')),
};

// Validate critical environment variables
function validateEnv() {
  const missingVars: string[] = [];
  
  if (!env.MAPBOX_ACCESS_TOKEN) {
    missingVars.push('MAPBOX_ACCESS_TOKEN');
  }
  
  if (!env.OPENROUTER_API_KEY) {
    missingVars.push('OPENROUTER_API_KEY');
  }
  
  if (missingVars.length > 0) {
    console.warn(`⚠️ Missing environment variables: ${missingVars.join(', ')}`);
  }
}

// Run validation (can be commented out in production if needed)
validateEnv();

// Export a debug function that only logs in debug mode
export function debug(...args: any[]) {
  if (env.DEBUG_MODE) {
    console.log('[DEBUG]', ...args);
  }
} 