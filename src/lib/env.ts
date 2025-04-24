/**
 * Environment variables used throughout the application.
 * In production, these should be set through proper environment variables.
 */

export const env = {
  /** 
   * Mapbox access token
   * This is a public token for development only. In production, use environment variables. 
   */
  MAPBOX_ACCESS_TOKEN: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 
    'pk.eyJ1Ijoic2hyZXlhc2gwNDU1MyIsImEiOiJjbTl1MzBiYzUwNHF5MmlzYWIwNGtxcWd3In0.PulE0Yanu2kaNNYPGEgnlw'
}; 