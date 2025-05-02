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
  // API Keys with values from the .env file or fallbacks
  MAPBOX_ACCESS_TOKEN: getEnvVar('MAPBOX_ACCESS_TOKEN', 'pk.eyJ1Ijoic2hyZXlhc2gwNDU1MyIsImEiOiJjbTl1MzBiYzUwNHF5MmlzYWIwNGtxcWd3In0.PulE0Yanu2kaNNYPGEgnlw'),
  SUPABASE_URL: getEnvVar('SUPABASE_URL', 'https://obolgajchkvvpvkxyoya.supabase.co'),
  SUPABASE_ANON_KEY: getEnvVar('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ib2xnYWpjaGt2dnB2a3h5b3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0MjA3NzAsImV4cCI6MjA2MDk5Njc3MH0.wAPBgM1FNfw1J0GRawXZDOhlI6orGsR1gK50FnA9xLw'),
  OPENROUTER_API_KEY: getEnvVar('OPENROUTER_API_KEY', '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'),
  
  // Feature flags
  ENABLE_ANALYTICS: parseBool(getEnvVar('ENABLE_ANALYTICS', 'false')),
  DEBUG_MODE: parseBool(getEnvVar('DEBUG_MODE', 'true')),
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
