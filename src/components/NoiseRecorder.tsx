import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Mic, MicOff, Volume2, MapPin, CheckCircle2, AlertTriangle, Loader2, XCircle, Settings, Info, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import NoiseSenseLogo from '@/components/NoiseSenseLogo';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { env, debug, geoDebug } from "@/lib/env";
import { useNavigate } from "react-router-dom";
import type { Map as LeafletMap, Marker } from 'leaflet';

// Add TypeScript declarations for Google Maps API
declare global {
  interface Window {
    google: {
      maps: {
        Map: new (element: HTMLElement, options: GoogleMapOptions) => GoogleMapInstance;
        ControlPosition: {
          RIGHT_TOP: number;
        };
        MapTypeId: {
          ROADMAP: string;
        };
        Animation: {
          DROP: number;
        };
        Marker: new (options: GoogleMarkerOptions) => GoogleMarkerInstance;
        event: {
          trigger: (instance: any, eventName: string, ...args: any[]) => void;
        }
      }
    };
    initGoogleMaps: () => void;
    setTimeout: (handler: TimerHandler, timeout?: number, ...args: any[]) => number;
    clearTimeout: (id: number) => void;
  }
}

// Define types for Google Maps
interface GoogleMap extends google.maps.Map {}

interface GoogleMapOptions {
  center: {lat: number, lng: number};
  zoom: number;
  mapTypeId?: string;
  streetViewControl?: boolean;
  fullscreenControl?: boolean;
  mapTypeControl?: boolean;
  zoomControlOptions?: {
    position: number;
  };
  disableDefaultUI?: boolean;
  gestureHandling?: string;
  clickableIcons?: boolean;
}

interface GoogleMapInstance {
  setCenter(latLng: {lat: number, lng: number}): void;
}

interface GoogleMarkerOptions {
  position: {lat: number, lng: number};
  map: GoogleMapInstance;
  draggable?: boolean;
  animation?: number;
  title?: string;
}

interface GoogleMarkerInstance {
  getPosition(): {
    lat(): number;
    lng(): number;
  };
  addListener(event: string, callback: () => void): void;
}

// ---------- Google Maps API Configuration ----------
// Google Maps API is used for location confirmation only
const GOOGLE_MAPS_API_KEY = "AIzaSyALJsqgMgW-IAGXnnaB3d_oLdeaFxH-AaA";
const GOOGLE_MAPS_LIBRARIES = ["places"];
let googleMapsLoaded = false;

// Enhanced helper to load Google Maps API script with better caching and error handling
const loadGoogleMapsAPI = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded - using a more reliable check
    if (window.google && window.google.maps && window.google.maps.Map) {
      googleMapsLoaded = true;
      resolve();
      return;
    }

    // Check if script is already in process of loading
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      // Script is already loading, wait for it with timeout
      const timeoutId = setTimeout(() => {
        // If still not loaded after timeout, try again from scratch
        if (!googleMapsLoaded) {
          document.head.removeChild(existingScript);
          window.initGoogleMaps = undefined;
          loadGoogleMapsAPI().then(resolve).catch(reject);
        }
      }, 5000); // 5 second timeout
      
      window.initGoogleMaps = () => {
        clearTimeout(timeoutId);
        googleMapsLoaded = true;
        resolve();
      };
      return;
    }

    // Create script element with priority loading
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=${GOOGLE_MAPS_LIBRARIES.join(',')}&callback=initGoogleMaps&v=weekly`; // Add version for better caching
    script.defer = true;
    script.async = true;
    
    // Add priority hint
    if ('fetchPriority' in HTMLScriptElement.prototype) {
      (script as any).fetchPriority = 'high';
    }

    // Set up callback
    window.initGoogleMaps = () => {
      googleMapsLoaded = true;
      resolve();
    };

    // Add timeout for script loading
    const timeoutId = setTimeout(() => {
      if (!googleMapsLoaded && script.parentNode) {
        console.warn('Google Maps script load timeout - retrying');
        document.head.removeChild(script);
        window.initGoogleMaps = undefined;
        // Fall back to static map if multiple failures occur
        reject(new Error('Google Maps load timeout'));
      }
    }, 7000); // 7 second timeout

    // Handle errors with retry
    script.onerror = (error) => {
      clearTimeout(timeoutId);
      console.error('Error loading Google Maps API:', error);
      
      // Remove failed script
      if (script.parentNode) {
        document.head.removeChild(script);
      }
      
      reject(new Error('Failed to load Google Maps API'));
    };

    // Add script to head
    document.head.appendChild(script);
  });
};

// Define frequency ranges for accurate dB measurement
const frequencyRanges = {
  low: { min: 20, max: 200 },     // Low frequency range (bass)
  mid: { min: 200, max: 2000 },   // Mid frequency range
  high: { min: 2000, max: 20000 } // High frequency range
};

// Improved function to calculate dB with A-weighting
const calculateDecibelsWithWeighting = (dataArray: Uint8Array, analyser: AnalyserNode): number => {
  // A-weighting approximation values for different frequency bands (enhanced precision)
  const aWeightFactors = [
    -70.4, -63.4, -56.7, -50.5, -44.7, -39.4, -34.6, -30.2, 
    -26.2, -22.5, -19.1, -16.1, -13.4, -10.9, -8.6, -6.6, 
    -4.8, -3.2, -1.9, -0.8, 0.0, 0.6, 1.0, 1.2, 
    1.3, 1.2, 1.0, 0.5, -0.1, -1.1, -2.5, -4.3,
    -6.0, -8.0, -10.0, -12.0, -14.0, -16.0, -18.0, -20.0  // Extended for higher frequencies
  ];

  // Calculate frequency bin size with higher precision
  const sampleRate = 44100; // Default for most audio contexts
  const frequencyBinCount = analyser.frequencyBinCount;
  const binSize = sampleRate / (2 * frequencyBinCount);

  // Calculate weighted sum with improved algorithm
  let weightedSum = 0;
  let weightTotal = 0;
  let peakAmplitude = 0;
  
  // Process each frequency bin with A-weighting
  for (let i = 0; i < dataArray.length; i++) {
    // Calculate frequency for this bin
    const frequency = i * binSize;
    
    // Find appropriate weight factor with better interpolation
    const weightIndex = Math.min(aWeightFactors.length - 1, Math.floor(frequency * aWeightFactors.length / 20000));
    const weightFactor = weightIndex >= 0 ? Math.pow(10, aWeightFactors[weightIndex] / 20) : 0.0001;
    
    // Apply weight to amplitude
    const amplitude = dataArray[i];
    
    // Track peak amplitude for improved dynamic range
    if (amplitude > peakAmplitude) {
      peakAmplitude = amplitude;
    }
    
    weightedSum += amplitude * amplitude * weightFactor;
    weightTotal += weightFactor;
  }
  
  // Calculate weighted RMS with noise floor compensation
  const noiseFloor = 0.5; // Reduce background noise influence
  const weightedRMS = Math.sqrt((weightedSum + noiseFloor) / Math.max(1, weightTotal * dataArray.length));
  
  // Convert to dB scale with improved calibration factor
  // Based on empirical testing and calibration against reference devices
  const calibrationOffset = 40; // Increased calibration offset for better accuracy
  const dynamicRange = Math.max(0.1, Math.min(1.0, peakAmplitude / 255)); // Dynamic range compensation
  const dbApprox = Math.max(30, Math.round(20 * Math.log10(weightedRMS + 1) * (1 + dynamicRange * 0.1) + calibrationOffset));
  
  return dbApprox;
};

// Simple function to get location
const getLocationAsync = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      geoDebug("Geolocation API not supported");
      reject(new Error("Geolocation not supported"));
      return;
    }
    
    // Try multiple times with increasing timeout
    const tryGetLocation = (attempt = 1) => {
      const options = {
        enableHighAccuracy: true,
        timeout: attempt * 10000, // Increase timeout with each attempt
        maximumAge: 0
      };

      geoDebug(`Attempting to get location (attempt ${attempt}) with timeout ${options.timeout}ms`);
      
      // Create a separate function for the success callback to avoid issues with binding
      const successCallback = (position: GeolocationPosition) => {
        geoDebug(`Successfully got position on attempt ${attempt}`, {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        resolve(position);
      };
      
      // Create a separate function for the error callback
      const errorCallback = (error: GeolocationPositionError) => {
        geoDebug(`Location error on attempt ${attempt}:`, error.message, "Code:", error.code);
        if (attempt < 3 && error.code === 3) { // Timeout error
          geoDebug(`Location attempt ${attempt} timed out, trying again`);
          tryGetLocation(attempt + 1);
        } else {
          reject(error);
        }
      };
      
      // Wrap the actual geolocation call in a try-catch to handle unexpected errors
      try {
        navigator.geolocation.getCurrentPosition(
          successCallback,
          errorCallback,
          options
        );
      } catch (e) {
        geoDebug("Unexpected error calling getCurrentPosition:", e);
        reject(e);
      }
    };
    
    tryGetLocation();
  });
};

// Add a geocoding search function
const geocodeLocation = async (searchQuery: string) => {
  try {
    const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json`;
    const response = await fetch(`${endpoint}?access_token=${env.MAPBOX_ACCESS_TOKEN}&limit=5`);
    
    if (!response.ok) {
      throw new Error('Geocoding API request failed');
    }
    
    const data = await response.json();
    return data.features;
  } catch (error) {
    console.error('Error geocoding location:', error);
    return [];
  }
};

const NoiseRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [decibels, setDecibels] = useState<number | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "fetching" | "success" | "error" | "skipped">("idle");
  const [noiseType, setNoiseType] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [recordingTimeLeft, setRecordingTimeLeft] = useState(10);
  const [recordingStage, setRecordingStage] = useState<"permission" | "recording" | "processing" | "done">("permission");
  const [permissionError, setPermissionError] = useState("");
  const [hideErrors, setHideErrors] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [permissionStep, setPermissionStep] = useState<"mic" | "location">("mic");
  const [showLocationError, setShowLocationError] = useState(false);
  const [manualLatitude, setManualLatitude] = useState("");
  const [manualLongitude, setManualLongitude] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [manualMapVisible, setManualMapVisible] = useState(false);
  const manualMapContainer = useRef<HTMLDivElement>(null);
  const [manualMap, setManualMap] = useState<any>(null);
  const [manualMarker, setManualMarker] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [animationLevel, setAnimationLevel] = useState(0);
  
  const [isLocationMapOpen, setIsLocationMapOpen] = useState(false);
  const mapRef = useRef<HTMLDivElement | null>(null);
  
  // Store audioContext and analyser in refs to prevent garbage collection
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Add a ref to track if the component is still mounted
  const isMountedRef = useRef(true);
  // Add a state to track map loading status
  const [mapLoadingStatus, setMapLoadingStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  
  // State for Google Maps
  const [googleMap, setGoogleMap] = useState<google.maps.Map | null>(null);
  const [googleMarker, setGoogleMarker] = useState<google.maps.Marker | null>(null);
  
  useEffect(() => {
    if (!isRecording) {
      const intervalId = setInterval(() => {
        setAnimationLevel(Math.random() * 20);
      }, 500);
      
      return () => clearInterval(intervalId);
    }
  }, [isRecording]);

  // Clean up audio resources when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
      }
    };
  }, []);

  // Begin preloading Google Maps API when component mounts
  useEffect(() => {
    loadGoogleMapsAPI().catch(err => console.error("Failed to preload Google Maps:", err));
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMountedRef.current = false;
      
      // Clean up audio resources
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
      }
    };
  }, []);

  const noiseCategories = [
    { value: "Traffic", label: "Traffic Noise" },
    { value: "Construction", label: "Construction" },
    { value: "Industrial", label: "Industrial" },
    { value: "Social Event", label: "Social Event/Entertainment" },
    { value: "Loudspeaker", label: "Loudspeaker" },
    { value: "Vehicle Horn", label: "Vehicle Horn" },
    { value: "Commercial", label: "Commercial" },
    { value: "Residential", label: "Residential/Neighbors" },
    { value: "Other", label: "Other" },
  ];
  
  const fetchUserLocation = async () => {
    setLocationStatus("fetching");
    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        geoDebug("Geolocation API not supported in this browser");
        toast({
          title: "Geolocation Not Supported",
          description: "Your browser doesn't support geolocation services. You can still record noise without location data.",
          variant: "destructive",
        });
        setLocationStatus("error");
        setShowLocationError(true);
        return null;
      }

      // Check permissions with more detailed reporting
      if ('permissions' in navigator) {
        try {
          const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
          geoDebug(`Geolocation permission state from API: ${result.state}`);
          
          if (result.state === 'denied') {
            geoDebug("Geolocation permission explicitly denied by user");
            toast({
              title: "Location Access Blocked",
              description: "Please enable location access in your browser settings and try again.",
              variant: "destructive",
            });
            setLocationStatus("skipped");
            setShowLocationError(true);
            return null;
          }
          
          // Add listener for permission changes
          result.onchange = () => {
            geoDebug(`Geolocation permission changed to: ${result.state}`);
            if (result.state === 'granted' && locationStatus === "skipped") {
              // Retry automatically if permissions were just granted
              fetchUserLocation();
            }
          };
        } catch (err) {
          geoDebug("Permission API error:", err);
          // Continue with regular geolocation as fallback
        }
      } else {
        geoDebug("Permissions API not supported, using standard geolocation");
      }

      // Try to get location
      try {
        geoDebug("Attempting to get geolocation...");
        const position = await getLocationAsync();
        
        // Verify we have valid coordinates before proceeding
        if (!position || !position.coords || 
            typeof position.coords.latitude !== 'number' || 
            typeof position.coords.longitude !== 'number') {
          throw new Error("Invalid position data received");
        }
        
        geoDebug(`Successfully got location: ${position.coords.latitude}, ${position.coords.longitude}`);
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationStatus("success");
        setIsLocationMapOpen(true);
        
        return position;
      } catch (error: any) {
        geoDebug("Geolocation error in fetchUserLocation:", error);
        handleLocationError(error);
        return null;
      }
    } catch (error: any) {
      console.error("Unexpected error in location handling:", error);
      geoDebug("Unexpected error in location handling:", error);
      
      toast({
        title: "Location Error",
        description: "An unexpected error occurred. You can continue without location data or try again.",
        variant: "destructive",
      });
      setLocationStatus("error");
      setShowLocationError(true);
      return null;
    }
  };

  // Helper function to handle location errors
  const handleLocationError = (posError: GeolocationPositionError) => {
    geoDebug("Handling location error:", posError.message, "Code:", posError.code);
    
    // Handle specific geolocation errors
    if (posError.code === 1) { // Permission denied
      toast({
        title: "Location Permission Denied",
        description: "You can continue without location or enable location in your browser settings and try again.",
        variant: "destructive",
      });
      setLocationStatus("skipped");
      setShowLocationError(true);
    } else if (posError.code === 2) { // Position unavailable
      toast({
        title: "Location Unavailable",
        description: "Unable to determine your location. Check your connection or try again.",
        variant: "destructive",
      });
      setLocationStatus("error");
      setShowLocationError(true);
    } else if (posError.code === 3) { // Timeout
      toast({
        title: "Location Timeout",
        description: "It's taking too long to get your location. You can continue without location or try again.",
        variant: "destructive",
      });
      setLocationStatus("error");
      setShowLocationError(true);
    } else {
      toast({
        title: "Location Error",
        description: "An unknown error occurred. You can continue without location data or try again.",
        variant: "destructive",
      });
      setLocationStatus("error");
      setShowLocationError(true);
    }
  };

  const requestPermissions = async () => {
    setShowPermissionDialog(true);
    setPermissionStep("mic");
  };

  const handleMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: false 
        } 
      });
      stream.getTracks().forEach(track => track.stop());
      setPermissionStep("location");
    } catch (error) {
      console.error("Microphone permission error:", error);
      setPermissionError("Microphone access was denied. Please grant permission in your browser settings.");
      setShowPermissionDialog(false);
    }
  };

  const handleLocationConfirmation = () => {
    try {
      if (googleMap && googleMarker) {
        const position = googleMarker.getPosition();
        if (position) {
          setLocation({
            latitude: position.lat(),
            longitude: position.lng()
          });
          
          geoDebug(`Location confirmed at ${position.lat()}, ${position.lng()}`);
        }
      } else {
        console.warn("Map or marker not available during confirmation");
      }
      
      setIsLocationMapOpen(false);
      
      toast({
        title: "Location Confirmed",
        description: "Your location has been confirmed and will be used for the noise report.",
        variant: "default",
      });
      
      startRecordingWithPermissions();
    } catch (error) {
      console.error("Error during location confirmation:", error);
      // Continue anyway to avoid blocking the user
      setIsLocationMapOpen(false);
      startRecordingWithPermissions();
    }
  };

  const handleLocationPermission = async () => {
    setShowPermissionDialog(false); // Hide dialog immediately to avoid confusion
    
    const pos = await fetchUserLocation();
    
    if (!pos) {
      // If getLocationAsync failed, we'll handle this in the location error dialog
      geoDebug("Location permission granted but couldn't get position");
    }
  };

  const retryLocationPermission = async () => {
    setShowLocationError(false);
    geoDebug("Retrying location permission...");
    
    // Small delay to ensure UI updates before trying again
    setTimeout(() => {
      fetchUserLocation();
    }, 500);
  };

  const skipLocationAndContinue = () => {
    setLocationStatus("skipped");
    setShowLocationError(false);
    setShowPermissionDialog(false);
    startRecordingWithPermissions();
    
    toast({
      title: "Location Skipped",
      description: "Recording without location data. You can manually describe the location in the notes.",
      variant: "default",
    });
  };

  const startRecordingWithPermissions = async () => {
    try {
      setRecordingStage("permission");
      setPermissionError("");
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Your browser doesn't support audio recording. Please try using a modern browser like Chrome, Firefox, or Edge.");
      }
      
      // Get audio stream with optimized settings for noise measurement
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: false, // Turn OFF for more accurate measurements
          noiseSuppression: false, // Turn OFF for better decibel detection
          autoGainControl: false   // Turn OFF for more accurate readings
        } 
      });
      
      // Save stream to ref for cleanup
      streamRef.current = stream;
        
      // Initialize AudioContext with high sample rate for better frequency resolution
      let audioContext;
      try {
        const AudioContextClass = window.AudioContext || 
          (window as any).webkitAudioContext;
        audioContext = new AudioContextClass({
          sampleRate: 44100,
          latencyHint: 'interactive'
        });
        await audioContext.resume();
        
        // Save to ref for cleanup
        audioContextRef.current = audioContext;
      } catch (audioContextError) {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        throw new Error("Could not initialize audio processing. Please try again or use a different browser.");
      }
      
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      
      // Configure analyser for high-quality readings
      analyser.fftSize = 4096;  // Higher for more detailed frequency analysis
      analyser.minDecibels = -100; // Expand lower range
      analyser.maxDecibels = 0;    // 0 dB is maximum (full scale)
      analyser.smoothingTimeConstant = 0.2; // Less smoothing for more responsive readings
      
      source.connect(analyser);
      
      // Save to ref for cleanup
      analyserRef.current = analyser;
      
      setIsRecording(true);
      setRecordingStage("recording");
      setRecordingProgress(0);
      setRecordingTimeLeft(10);
      
      const progressInterval = setInterval(() => {
        setRecordingProgress(prev => {
          const newValue = prev + 1;
          if (newValue >= 100) {
            clearInterval(progressInterval);
          }
          return newValue;
        });
        
        setRecordingTimeLeft(prev => {
          const newValue = prev - 0.1;
          return newValue > 0 ? parseFloat(newValue.toFixed(1)) : 0;
        });
      }, 100);
      
      // Improved volume visualization
      const visualizerInterval = setInterval(() => {
        if (!analyserRef.current) return;
        
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Calculate RMS for visualization
        let sum = 0;
        for (const amplitude of dataArray) {
          sum += amplitude * amplitude;
        }
        const rms = Math.sqrt(sum / dataArray.length);
        setAnimationLevel(rms * 1.2); // Slightly amplified for better visualization
      }, 50);
      
      // More accurate decibel calculation with multiple frequency bands
      let dbReadings: number[] = [];
      
      const measurementInterval = setInterval(() => {
        if (!analyserRef.current) return;
        
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Get weighted dB measurement
        const dbValue = calculateDecibelsWithWeighting(dataArray, analyserRef.current);
        dbReadings.push(dbValue);
        
        // Log occasional readings for debugging
        if (dbReadings.length % 10 === 0) {
          debug(`Current calibrated dB reading: ${dbValue}`);
        }
      }, 200);
      
      setTimeout(() => {
        clearInterval(visualizerInterval);
        clearInterval(measurementInterval);
        setRecordingStage("processing");
        
        // Calculate final dB value using statistical analysis
        // Remove outliers using interquartile range method
        dbReadings.sort((a, b) => a - b);
        
        const q1Index = Math.floor(dbReadings.length * 0.25);
        const q3Index = Math.floor(dbReadings.length * 0.75);
        const q1 = dbReadings[q1Index];
        const q3 = dbReadings[q3Index];
        const iqr = q3 - q1;
        
        // Filter values within 1.5 * IQR
        const validReadings = dbReadings.filter(
          value => value >= (q1 - 1.5 * iqr) && value <= (q3 + 1.5 * iqr)
        );
        
        // Calculate mean of valid readings
        const sum = validReadings.reduce((acc, val) => acc + val, 0);
        const mean = validReadings.length > 0 ? sum / validReadings.length : 40;
        
        // Round to nearest integer
        const finalDbValue = Math.round(mean);
        
        debug(`Recording complete. Final dB value: ${finalDbValue}, from ${validReadings.length} valid readings`);
        
        setDecibels(finalDbValue);
        setIsRecording(false);
        setRecordingStage("done");
        
        // Properly clean up audio resources
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      }, 10000);
    } catch (error) {
      console.error("Error starting recording:", error);
      setIsRecording(false);
      
      if (error instanceof Error) {
        setPermissionError(error.message);
      } else if (locationStatus === "error") {
        setPermissionError("Location access was denied. You can still record noise without location data.");
      } else {
        setPermissionError("An error occurred while accessing your device. Please check permissions and try again.");
      }
      
      toast({
        title: "Permission Error",
        description: "Could not access microphone. Please check your browser settings.",
        variant: "destructive",
      });
    }
  };

  const startRecording = () => {
    if (location && locationStatus === "success") {
      setIsLocationMapOpen(true);
    } else {
      requestPermissions();
    }
  };

  const submitReport = async () => {
    if (!decibels || !noiseType) {
      toast({
        title: "Missing Information",
        description: "Please complete the measurement and fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Create the new report object with nullish location handling
      const newReport = {
        id: `report-${Date.now()}`, // Generate a unique ID
        latitude: location?.latitude || null,
        longitude: location?.longitude || null,
        decibel_level: decibels,
        noise_type: noiseType,
        notes: notes || null,
        created_at: new Date().toISOString(),
        address: location ? "Pune, Maharashtra" : "No location data", // Default address with location indicator
        status: "unresolved", // Default status
        device_info: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          timestamp: new Date().toISOString(),
        },
      };
      
      // Prepare report data for Supabase with explicit null handling
      const reportData = {
        decibel_level: decibels,
        noise_type: noiseType,
        notes: notes || null,
        // Add default latitude/longitude values that indicate missing location data
        latitude: location?.latitude ?? 0,
        longitude: location?.longitude ?? 0,
        device_info: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          timestamp: new Date().toISOString(),
        },
      };
      
      // Submit to Supabase
      const { error } = await supabase.from("noise_reports").insert(reportData);

      if (error) throw error;
      
      // Also save to localStorage for admin portal
      try {
        // Get existing reports
        const existingReportsJson = localStorage.getItem('noiseReports');
        let existingReports = existingReportsJson ? JSON.parse(existingReportsJson) : [];
        
        // Add new report
        existingReports.unshift(newReport); // Add to beginning for newest first
        
        // Save back to localStorage
        localStorage.setItem('noiseReports', JSON.stringify(existingReports));
        console.log("Report saved to localStorage for admin portal");
      } catch (localStorageError) {
        console.error("Error saving to localStorage:", localStorageError);
        // Continue with submission process even if localStorage fails
      }

      setShowSuccessDialog(true);
      
      // Clear form data after a short delay
      setTimeout(() => {
        setDecibels(null);
        setNoiseType("");
        setNotes("");
        setIsSubmitting(false);
      }, 500);
      
    } catch (error) {
      console.error("Error submitting report:", error);
      setIsSubmitting(false);
      toast({
        title: "Error",
        description: "Could not submit your report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const retryPermissions = () => {
    setPermissionError("");
    requestPermissions();
  };

  const renderNoiseMeter = () => {
    if (!decibels) return null;
    
    const getColor = () => {
      if (decibels >= 85) return "bg-red-500";
      if (decibels >= 70) return "bg-orange-500";
      if (decibels >= 55) return "bg-yellow-500";
      return "bg-green-500";
    };
    
    const getWidthPercentage = () => {
      return Math.min(100, (decibels / 120) * 100);
    };
    
    const getDescription = () => {
      if (decibels >= 85) return "Loud - Potential hearing damage with prolonged exposure";
      if (decibels >= 70) return "Moderate to loud - Comparable to busy street traffic";
      if (decibels >= 55) return "Moderate - Normal conversation level";
      return "Quiet - Background noise level";
    };
    
    return (
      <div className="mt-4 mb-8">
        <h3 className="text-base font-medium mb-2">Measured Noise Level: <span className="font-bold">{decibels} dB</span></h3>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
          <div 
            className={`h-full ${getColor()} transition-all duration-500 ease-out`}
            style={{ width: `${getWidthPercentage()}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{getDescription()}</p>
      </div>
    );
  };
  
  const renderSoundWaves = () => {
    const normalizedLevel = Math.min(100, Math.max(0, animationLevel));
    
    return (
      <div className="flex justify-center items-center h-20 gap-1 my-6">
        {[0.6, 0.8, 1, 0.8, 0.6].map((factor, index) => {
          const height = isRecording ? normalizedLevel * factor : 5 + Math.random() * 15;
          return (
            <div
              key={index}
              className={`w-2 rounded-full ${isRecording ? 'bg-purple-500' : 'bg-gray-400 dark:bg-gray-600'} transition-all duration-75`}
              style={{ height: `${height}%` }}
            ></div>
          );
        })}
      </div>
    );
  };

  const renderLocationErrorDialog = () => {
    const handleManualLocationSubmit = () => {
      if (!manualMap || !manualMarker) {
        toast({
          title: "Map not initialized",
          description: "Please search for a location or wait for the map to load",
          variant: "destructive",
        });
        return;
      }
      
      const position = manualMarker.getLatLng();
      const lat = position.lat;
      const lng = position.lng;
      
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        toast({
          title: "Invalid Coordinates",
          description: "Please select a valid location on the map.",
          variant: "destructive",
        });
        return;
      }
      
      setLocation({
        latitude: lat,
        longitude: lng,
      });
      setLocationStatus("success");
      setShowLocationError(false);
      setShowManualInput(false);
      setManualMapVisible(false);
      
      toast({
        title: "Location Set Manually",
        description: "Your selected location has been saved for this noise report.",
        variant: "default",
      });
      
      startRecordingWithPermissions();
    };
    
    const handleLocationSearch = async () => {
      if (!locationSearchQuery.trim()) {
        toast({
          title: "Empty Search",
          description: "Please enter a location to search",
          variant: "destructive",
        });
        return;
      }
      
      setIsSearching(true);
      setShowSearchResults(true);
      
      try {
        const results = await geocodeLocation(locationSearchQuery);
        setSearchResults(results);
        
        if (results.length === 0) {
          toast({
            title: "No Results",
            description: "No locations found matching your search",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error searching location:", error);
        toast({
          title: "Search Error",
          description: "Error searching for location. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSearching(false);
      }
    };
    
    const selectSearchResult = (result: any) => {
      const [lng, lat] = result.center;
      
      setManualLatitude(lat.toFixed(6));
      setManualLongitude(lng.toFixed(6));
      setShowSearchResults(false);
      
      // Show and initialize map if not already visible
      setManualMapVisible(true);
      
      // Update map position in next rendering cycle
      setTimeout(() => {
        if (manualMap) {
          manualMap.setView([lat, lng], 15);
          if (manualMarker) {
            manualMarker.setLatLng([lat, lng]);
          }
        } else {
          initializeManualMap(lat, lng);
        }
      }, 100);
    };
    
    const initializeManualMap = async (lat: number, lng: number) => {
      if (!manualMapContainer.current) return;
      
      try {
        // Import Leaflet dynamically
        const L = await import('leaflet');
        
        // Ensure CSS is loaded
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          link.crossOrigin = '';
          document.head.appendChild(link);
        }
        
        // Fix for marker icon paths
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });
        
        // Clean up any existing map instance
        if (manualMap) {
          manualMap.remove();
          setManualMap(null);
          setManualMarker(null);
        }
        
        // Initialize map
        const map = L.map(manualMapContainer.current).setView([lat, lng], 15);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        // Add draggable marker with improved drag handling
        const marker = L.marker([lat, lng], {
          draggable: true
        }).addTo(map);
        
        // Use a more efficient event handling for drag
        let dragDebounceTimer: ReturnType<typeof setTimeout>;
        
        // Only update coordinates when drag ends
        marker.on('dragend', function() {
          const position = marker.getLatLng();
          setManualLatitude(position.lat.toFixed(6));
          setManualLongitude(position.lng.toFixed(6));
        });
        
        // Optional: for visual feedback during drag without state updates
        marker.on('drag', function() {
          clearTimeout(dragDebounceTimer);
          dragDebounceTimer = setTimeout(() => {
            const position = marker.getLatLng();
            document.getElementById('manual-lat')?.setAttribute('data-value', position.lat.toFixed(6));
            document.getElementById('manual-lng')?.setAttribute('data-value', position.lng.toFixed(6));
          }, 100);
        });
        
        setManualMap(map);
        setManualMarker(marker);
        
        // Force a resize to ensure proper rendering
        setTimeout(() => {
          map.invalidateSize();
        }, 100);
        
      } catch (error) {
        console.error("Error loading map for manual location:", error);
        toast({
          title: "Map Error",
          description: "Could not load the map. Please try again or enter coordinates manually.",
          variant: "destructive",
        });
      }
    };
    
    // Set up map when manual input is shown
    useEffect(() => {
      if (showManualInput && manualMapVisible && manualMapContainer.current && !manualMap) {
        // Default to Pune coordinates if no location is selected
        const defaultLat = 18.5204;
        const defaultLng = 73.8567;
        
        initializeManualMap(
          manualLatitude ? parseFloat(manualLatitude) : defaultLat,
          manualLongitude ? parseFloat(manualLongitude) : defaultLng
        );
      }
      
      // Cleanup when dialog closes
      return () => {
        if (!showLocationError && manualMap) {
          manualMap.remove();
          setManualMap(null);
          setManualMarker(null);
        }
      };
    }, [showManualInput, manualMapVisible, showLocationError]);
    
    return (
      <Dialog open={showLocationError} onOpenChange={(open) => {
        setShowLocationError(open);
        if (!open) {
          setShowManualInput(false);
          setShowSearchResults(false);
          setManualMapVisible(false);
          setLocationSearchQuery("");
          setSearchResults([]);
        }
      }}>
        <DialogContent className={`${showManualInput ? "sm:max-w-3xl" : "sm:max-w-md"}`}>
          <DialogHeader>
            <DialogTitle>Location Access Issue</DialogTitle>
            <DialogDescription>
              {!showManualInput ? (
                locationStatus === "skipped" 
                  ? "Location access wasn't available. This can happen even when you've granted permissions in your browser."
                  : "We couldn't access your location. This might be due to browser settings or permissions."
              ) : (
                "Search for a location or place the marker directly on the map"
              )}
            </DialogDescription>
          </DialogHeader>
          
          {showManualInput ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-grow">
                  <Input
                    placeholder="Search for a location (e.g. Pune, MG Road)"
                    value={locationSearchQuery}
                    onChange={(e) => setLocationSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLocationSearch()}
                  />
                </div>
                <Button 
                  onClick={handleLocationSearch}
                  disabled={isSearching || !locationSearchQuery.trim()}
                >
                  {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                </Button>
              </div>
              
              {showSearchResults && searchResults.length > 0 && (
                <div className="max-h-48 overflow-y-auto bg-white dark:bg-gray-800 border rounded-md">
                  {searchResults.map((result, index) => (
                    <div 
                      key={result.id || index}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b last:border-b-0"
                      onClick={() => selectSearchResult(result)}
                    >
                      <p className="font-medium">{result.text}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{result.place_name}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {manualMapVisible && (
                <>
                  <div 
                    ref={manualMapContainer} 
                    className="h-[300px] w-full rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 mt-4"
                  ></div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label htmlFor="manual-lat">Latitude</Label>
                      <Input
                        id="manual-lat"
                        value={manualLatitude}
                        onChange={(e) => {
                          setManualLatitude(e.target.value);
                          const lat = parseFloat(e.target.value);
                          const lng = parseFloat(manualLongitude);
                          if (!isNaN(lat) && !isNaN(lng) && manualMarker) {
                            manualMarker.setLatLng([lat, lng]);
                            manualMap.setView([lat, lng]);
                          }
                        }}
                        placeholder="Latitude (e.g. 18.5204)"
                      />
                    </div>
                    <div>
                      <Label htmlFor="manual-lng">Longitude</Label>
                      <Input
                        id="manual-lng"
                        value={manualLongitude}
                        onChange={(e) => {
                          setManualLongitude(e.target.value);
                          const lat = parseFloat(manualLatitude);
                          const lng = parseFloat(e.target.value);
                          if (!isNaN(lat) && !isNaN(lng) && manualMarker) {
                            manualMarker.setLatLng([lat, lng]);
                            manualMap.setView([lat, lng]);
                          }
                        }}
                        placeholder="Longitude (e.g. 73.8567)"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <Button variant="outline" onClick={() => {
                      setShowManualInput(false);
                      setManualMapVisible(false);
                    }}>
                      Back
                    </Button>
                    <Button onClick={handleManualLocationSubmit}>
                      Use This Location
                    </Button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4 py-2">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
                <p className="text-sm text-muted-foreground">
                  Without location data, your noise report won't appear on the map, but we'll still collect the noise level data.
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md">
                <h4 className="font-medium text-sm mb-2">Troubleshooting tips:</h4>
                <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                  <li>Check that location is enabled in your browser settings</li>
                  <li>Some browsers require HTTPS for location access</li>
                  <li>Try a different browser (Chrome or Firefox work best)</li>
                  <li>On mobile, check your device location permissions</li>
                </ul>
              </div>
            </div>
          )}
          
          {!showManualInput && (
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => {
                setShowLocationError(false);
                setShowPermissionDialog(false);
                // Reset location status for future attempts
                setLocationStatus("idle");
              }}>
                Cancel
              </Button>
              <Button variant="default" onClick={skipLocationAndContinue}>
                Continue Without Location
              </Button>
              <Button variant="secondary" onClick={() => {
                setShowManualInput(true);
                setManualMapVisible(true);
              }}>
                Enter Location Manually
              </Button>
              <Button variant="default" onClick={retryLocationPermission}>
                Retry
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    );
  };

  // Initialize Google Maps
  const initializeMap = async () => {
    if (!mapRef.current || !location) return;
    setMapLoadingStatus("loading");
    
    // Immediately show the static map as a placeholder while loading the interactive map
    if (mapRef.current && location) {
      const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${location.latitude},${location.longitude}&zoom=14&size=800x600&scale=2&markers=color:red%7C${location.latitude},${location.longitude}&key=${GOOGLE_MAPS_API_KEY}`;
      
      mapRef.current.style.backgroundImage = `url(${staticMapUrl})`;
      mapRef.current.style.backgroundSize = 'cover';
      mapRef.current.style.backgroundPosition = 'center';
    }
    
    // Set a timeout to prevent indefinite loading state
    const mapLoadTimeout = setTimeout(() => {
      if (mapLoadingStatus === "loading" && isMountedRef.current) {
        console.warn("Map loading timeout - falling back to static map");
        setMapLoadingStatus("success"); // Treat as success to hide loading indicator
      }
    }, 8000); // 8 second timeout
    
    try {
      // Load Google Maps API if not loaded, with a timeout
      if (!googleMapsLoaded) {
        try {
          await Promise.race([
            loadGoogleMapsAPI(),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Map loading timeout")), 5000))
          ]);
        } catch (apiError) {
          console.warn("Google Maps API load timeout, using static map instead");
          clearTimeout(mapLoadTimeout);
          
          // Still consider this a success but use the static map
          if (isMountedRef.current) {
            setMapLoadingStatus("success");
          }
          return null;
        }
      }
      
      // Double-check if the component is still mounted
      if (!isMountedRef.current || !mapRef.current) {
        clearTimeout(mapLoadTimeout);
        return null;
      }
      
      // Get coordinates (with fallback)
      const lat = location?.latitude || 18.5204; // Default to Pune
      const lng = location?.longitude || 73.8567;
      
      geoDebug(`Initializing Google Maps with coordinates: ${lat}, ${lng}`);
      
      // Create map with optimized settings for faster loading
      const mapOptions = {
        center: { lat, lng },
        zoom: 15,
        mapTypeId: window.google?.maps?.MapTypeId?.ROADMAP,
        streetViewControl: false,
        fullscreenControl: false,
        mapTypeControl: false,
        zoomControlOptions: {
          position: window.google?.maps?.ControlPosition?.RIGHT_TOP
        },
        // Performance optimizations
        disableDefaultUI: false,
        gestureHandling: 'cooperative' as any,
        clickableIcons: false,
      };
      
      const map = new window.google.maps.Map(mapRef.current, mapOptions);
      
      // Create marker with simplified animation
      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map,
        draggable: true,
        // Skip animation for faster rendering
        title: "Your location"
      });
      
      // Add event listener for marker drag with debouncing
      let debounceTimeout: number;
      marker.addListener('dragend', () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = window.setTimeout(() => {
          const position = marker.getPosition();
          if (position) {
            geoDebug(`Marker dragged to: ${position.lat()}, ${position.lng()}`);
          }
        }, 100) as unknown as number;
      });
      
      // Hide loading indicator
      clearTimeout(mapLoadTimeout);
      const loadingElement = mapRef.current.querySelector('.map-loading') as HTMLElement;
      if (loadingElement) {
        loadingElement.style.display = 'none';
      }
      
      if (isMountedRef.current) {
        setGoogleMap(map);
        setGoogleMarker(marker);
        setMapLoadingStatus("success");
        
        // Force a rerender of the map if it appears blank
        setTimeout(() => {
          if (map && isMountedRef.current) {
            const currentCenter = map.getCenter();
            if (currentCenter) {
              google.maps.event.trigger(map, 'resize');
              map.setCenter(currentCenter);
            }
          }
        }, 300);
      }
      
      geoDebug("Google Maps initialized successfully");
      return { map, marker };
      
    } catch (error) {
      console.error("Error initializing Google Maps:", error);
      geoDebug("Error initializing Google Maps:", error);
      clearTimeout(mapLoadTimeout);
      
      if (isMountedRef.current) {
        setMapLoadingStatus("success"); // Still mark as success to hide the loading indicator
      }
      
      // Show high-quality static map as fallback
      if (mapRef.current && location) {
        // Display a responsive static map with multiple markers if needed
        const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${location.latitude},${location.longitude}&zoom=15&size=800x600&scale=2&markers=color:red%7C${location.latitude},${location.longitude}&key=${GOOGLE_MAPS_API_KEY}`;
        
        mapRef.current.innerHTML = `
          <div class="relative w-full h-full">
            <img 
              src="${staticMapUrl}" 
              alt="Location map" 
              class="w-full h-full object-cover rounded-md"
            />
            <div class="absolute bottom-4 right-4">
              <button class="px-3 py-1 bg-white/90 dark:bg-gray-800/90 rounded-md shadow-md text-sm" 
                onclick="window.dispatchEvent(new CustomEvent('retry-map-load'))">
                Try Interactive Map
              </button>
            </div>
          </div>
        `;
        
        // Add event listener for retry button with proper cleanup
        const handleRetryMap = () => {
          if (mapRef.current && isMountedRef.current) {
            // Clear the container
            mapRef.current.innerHTML = `
              <div class="absolute inset-0 flex items-center justify-center bg-gray-50/30 dark:bg-gray-900/30 z-10 map-loading">
                <div class="flex flex-col items-center bg-white/80 dark:bg-black/50 p-3 rounded-lg">
                  <div class="h-8 w-8 border-4 border-t-purple-500 rounded-full animate-spin mb-2"></div>
                  <p class="text-sm text-gray-700 dark:text-gray-300">Loading map...</p>
                </div>
              </div>
            `;
            // Try loading the map again
            initializeMap();
          }
        };
        
        // Clean up old listener if it exists
        window.removeEventListener('retry-map-load', handleRetryMap);
        // Add new listener
        window.addEventListener('retry-map-load', handleRetryMap);
        
        // Clean up listener when component unmounts
        return () => {
          window.removeEventListener('retry-map-load', handleRetryMap);
        };
      }
      
      return null;
    }
  };
  
  // Update useEffect for map initialization
  useEffect(() => {
    if (isLocationMapOpen && mapRef.current) {
      // Initialize Google Maps
      initializeMap();
      
      // Cleanup
      return () => {
        setGoogleMap(null);
        setGoogleMarker(null);
        setMapLoadingStatus("idle");
      };
    }
  }, [isLocationMapOpen, mapRef.current]);

  // Update renderLocationConfirmationDialog to use Google Maps
  const renderLocationConfirmationDialog = () => {
    if (!isLocationMapOpen) return null;

    // Generate static map URL for faster initial display
    const generateStaticMapUrl = (lat: number, lng: number) => {
      return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=14&size=400x400&markers=color:red%7C${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
    };

    return (
      <Dialog open={isLocationMapOpen} onOpenChange={(open) => {
        if (!open) {
          setIsLocationMapOpen(false);
          setMapLoadingStatus("idle");
        }
      }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Confirm Your Location</DialogTitle>
            <DialogDescription>
              {locationStatus === "skipped" ? (
                "Location access was denied. You can continue without location data or try again."
              ) : (
                "Please confirm your location on the map. You can drag the red marker to adjust if needed."
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            {locationStatus === "skipped" ? (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-md">
                <p>You can still submit the noise report without location data.</p>
              </div>
            ) : (
              <div 
                ref={mapRef} 
                className="h-[400px] w-full rounded-md overflow-hidden border border-gray-200 dark:border-gray-700"
                style={{ 
                  display: "block",
                  position: "relative",
                  minHeight: "400px",
                  backgroundColor: '#f0f0f0',
                  backgroundImage: location && mapLoadingStatus !== "success" 
                    ? `url(${generateStaticMapUrl(location.latitude, location.longitude)})` 
                    : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  transition: 'background-image 0.3s ease'
                }}
              >
                {/* Loading indicator with more visible spinner */}
                {mapLoadingStatus === "loading" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/50 z-10 map-loading">
                    <div className="flex flex-col items-center bg-white/90 dark:bg-black/70 p-4 rounded-lg shadow-lg">
                      <div className="h-10 w-10 border-4 border-t-purple-500 rounded-full animate-spin mb-3"></div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">Loading map...</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">This may take a few seconds</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter className="mt-4">
            {locationStatus === "skipped" ? (
              <>
                <Button variant="outline" onClick={() => setIsLocationMapOpen(false)}>
                  Continue Without Location
                </Button>
                <Button onClick={retryLocationPermission}>
                  Try Again
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsLocationMapOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleLocationConfirmation}
                  disabled={mapLoadingStatus === "loading"}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Confirm Location
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <Card className="w-full max-w-xl mx-auto p-6 shadow-lg bg-white dark:bg-gray-900 relative">
      <div
        className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none"
        style={{ zIndex: 1 }}
      >
        {isRecording && (
          <div className="pulse-recording animate-pulse-slow"></div>
        )}
      </div>
      
      <div className="relative" style={{ zIndex: 2 }}>
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center">
            <NoiseSenseLogo size="sm" animated={isRecording} className="mr-3" />
            <div>
              <h2 className="text-2xl font-bold flex items-center text-gray-900 dark:text-white">
                Noise Reporter
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Measure and report noise pollution in your area
              </p>
            </div>
          </div>
        </div>

        {permissionError && !hideErrors && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Permission Error</AlertTitle>
            <AlertDescription className="flex flex-col space-y-2">
              <div>{permissionError}</div>
              <Button onClick={retryPermissions} variant="outline" size="sm">
                <RefreshCw className="mr-2 h-3 w-3" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {isRecording && (
            <div className="mb-8 animate-in fade-in-0 duration-300">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-red-500">Recording in progress...</span>
                <span className="text-sm">{recordingTimeLeft}s left</span>
              </div>
              <Progress value={recordingProgress} className="h-2" />
            </div>
          )}

          {!decibels && (
            <Button
              onClick={startRecording}
              disabled={isRecording}
              className="w-full py-6 text-lg bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {isRecording ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-5 w-5" />
                  Start Recording
                </>
              )}
            </Button>
          )}

          {renderNoiseMeter()}

          {location && (
            <div className="flex items-center mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-900">
              <MapPin className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
              <div className="text-sm">
                <span className="font-medium">Location captured:</span> 
                <span className="text-gray-600 dark:text-gray-400 ml-1">
                  {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </span>
              </div>
            </div>
          )}

          {decibels && (
            <div className="space-y-4 animate-in fade-in-50 duration-300">
              <div>
                <Label htmlFor="noise-type">Noise Type</Label>
                <Select 
                  value={noiseType} 
                  onValueChange={setNoiseType}
                >
                  <SelectTrigger id="noise-type">
                    <SelectValue placeholder="Select noise type" />
                  </SelectTrigger>
                  <SelectContent>
                    {noiseCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Describe the noise source or any other relevant details"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
              </div>
              
              <div className="pt-4">
                <Button
                  onClick={submitReport}
                  disabled={isSubmitting || !noiseType}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Submit Noise Report
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{
              permissionStep === "mic" 
                ? "Microphone Access Required" 
                : "Location Access Required"
            }</DialogTitle>
            <DialogDescription>
              {permissionStep === "mic" 
                ? "We need access to your microphone to measure noise levels."
                : "We need your location to map the noise data accurately."
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-center py-6">
            {permissionStep === "mic" ? (
              <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-6 animate-pulse">
                <Mic className="h-12 w-12 text-purple-500" />
              </div>
            ) : (
              <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-6 animate-pulse">
                <MapPin className="h-12 w-12 text-purple-500" />
              </div>
            )}
          </div>
          
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
            {permissionStep === "mic" 
              ? "Your browser will prompt you to allow microphone access."
              : "Your browser will prompt you to share your location."
            }
          </div>
          
          <DialogFooter className="sm:justify-center">
            <Button 
              type="button" 
              variant="default" 
              onClick={permissionStep === "mic" ? handleMicPermission : handleLocationPermission}
              className="w-full sm:w-auto"
            >
              {permissionStep === "mic" ? "Allow Microphone" : "Allow Location"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Report Submitted Successfully!</DialogTitle>
            <DialogDescription>
              Thank you for contributing to our noise pollution monitoring project.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-center py-6">
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-6">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
          </div>
          
          <div className="text-center space-y-2 mb-4">
            <p className="font-medium">Your noise report has been added to our database.</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You can view it on the map along with other noise reports.
            </p>
          </div>
          
          <DialogFooter className="sm:justify-center">
            <Button 
              type="button" 
              variant="default" 
              onClick={() => {
                setShowSuccessDialog(false);
                // Redirect to the About page after closing the dialog
                navigate('/about');
              }}
              className="w-full sm:w-auto"
            >
              Learn More About Noise Pollution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {renderLocationErrorDialog()}

      {renderLocationConfirmationDialog()}
    </Card>
  );
};

export default NoiseRecorder;
