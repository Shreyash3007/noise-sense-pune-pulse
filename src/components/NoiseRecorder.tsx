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

import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { env, debug } from "@/lib/env";
import { useNavigate } from "react-router-dom";

// Set Mapbox token from environment with error handling
const MAPBOX_TOKEN = env.MAPBOX_ACCESS_TOKEN;
// Special token specifically for the location confirmation map
const LOCATION_MAP_TOKEN = "pk.eyJ1Ijoic2hyZXlhc2gwNDUiLCJhIjoiY21hNGI5YXhzMDNwcTJqczYyMnR3OWdkcSJ9.aVpyfgys6f-h27ftG_63Zw";
let mapboxInitialized = false;

// Initialize Mapbox immediately
try {
  if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'pk.your-mapbox-token') {
    console.warn("⚠️ Mapbox token is missing or using default value. Using fallback token.");
    mapboxgl.accessToken = LOCATION_MAP_TOKEN;
  } else {
    mapboxgl.accessToken = MAPBOX_TOKEN;
  }
  
  mapboxInitialized = true;
  debug("Mapbox initialized successfully with token: " + mapboxgl.accessToken);
  
  // Don't use dummy container preloading as it might cause issues
} catch (error) {
  console.error("Failed to initialize Mapbox:", error);
  // Try with fallback token
  try {
    mapboxgl.accessToken = LOCATION_MAP_TOKEN;
    mapboxInitialized = true;
    debug("Mapbox initialized with fallback token");
  } catch (fallbackError) {
    console.error("Failed to initialize Mapbox with fallback token:", fallbackError);
  }
}

// Also preload resources for the location confirmation map with the dedicated token
try {
  // Create a dummy map container to initialize mapbox resources with the location map token
  const locationDummyContainer = document.createElement('div');
  locationDummyContainer.style.position = 'absolute';
  locationDummyContainer.style.visibility = 'hidden';
  locationDummyContainer.style.height = '1px';
  locationDummyContainer.style.width = '1px';
  
  // Append to body only briefly to trigger resource loading
  document.body.appendChild(locationDummyContainer);
  
  // Use the dedicated token for this preload
  const originalToken = mapboxgl.accessToken;
  mapboxgl.accessToken = LOCATION_MAP_TOKEN;
  
  try {
    // Create and immediately dispose of a map to preload resources
    const preloadLocationMap = new mapboxgl.Map({
      container: locationDummyContainer,
      style: 'mapbox://styles/mapbox/streets-v11',
      zoom: 0,
      interactive: false
    });
    
    // Dispose after a short delay to allow resource loading
    setTimeout(() => {
      preloadLocationMap.remove();
      document.body.removeChild(locationDummyContainer);
      // Restore the original token
      mapboxgl.accessToken = originalToken;
    }, 500);
  } catch (preloadError) {
    // Ignore preload errors, just clean up
    document.body.removeChild(locationDummyContainer);
    // Restore the original token
    mapboxgl.accessToken = originalToken;
  }
} catch (locationMapError) {
  console.error("Failed to preload location map resources:", locationMapError);
}

// Custom GeolocationControl that handles errors gracefully
function createMapWithGeolocation(container, initialLocation) {
  // If Mapbox failed to initialize, try again
  if (!mapboxInitialized) {
    try {
      mapboxgl.accessToken = env.MAPBOX_ACCESS_TOKEN;
      mapboxInitialized = true;
      debug("Mapbox re-initialized in createMapWithGeolocation");
    } catch (error) {
      console.error("Failed to initialize Mapbox:", error);
      const errorDiv = document.createElement('div');
      errorDiv.className = 'p-4 text-center bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md';
      errorDiv.innerHTML = 'Map unavailable - check Mapbox token configuration';
      if (container) container.appendChild(errorDiv);
      return null;
    }
  }

  try {
    // Ensure container is ready
    if (!container) {
      console.error("Map container is not available");
      return null;
    }

    // Create map instance
    const map = new mapboxgl.Map({
      container: container,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [initialLocation?.longitude || 73.8567, initialLocation?.latitude || 18.5204], // Default to Pune if no location
      zoom: initialLocation ? 15 : 12,
      attributionControl: false,
    });
    
    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Add geolocation with error handling
    if (map) {
      const geolocateControl = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserLocation: true,
        showAccuracyCircle: true,
      });
      
      map.addControl(geolocateControl);
      
      // Handle geolocation errors silently
      geolocateControl.on('error', (err) => {
        console.warn('Geolocation error in NoiseRecorder:', err);
      });
    }
    
    // Force resize after map initialization to ensure proper rendering
    setTimeout(() => {
      if (map) {
        map.resize();
        debug("Map resize called in createMapWithGeolocation");
      }
    }, 300);
    
    return map;
  } catch (error) {
    console.error("Failed to create map:", error);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'p-4 text-center bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md';
    errorDiv.innerHTML = 'Map failed to load - please try again later';
    if (container) container.appendChild(errorDiv);
    return null;
  }
}

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
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [animationLevel, setAnimationLevel] = useState(0);
  
  const [isLocationMapOpen, setIsLocationMapOpen] = useState(false);
  const locationMapContainer = useRef<HTMLDivElement>(null);
  const locationMap = useRef<mapboxgl.Map | null>(null);
  const locationMarker = useRef<mapboxgl.Marker | null>(null);
  
  useEffect(() => {
    if (!isRecording) {
      const intervalId = setInterval(() => {
        setAnimationLevel(Math.random() * 20);
      }, 500);
      
      return () => clearInterval(intervalId);
    }
  }, [isRecording]);

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
  
  const getLocationAsync = async () => {
    setLocationStatus("fetching");
    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        toast({
          title: "Geolocation Not Supported",
          description: "Your browser doesn't support geolocation services. You can still record noise without location data.",
          variant: "destructive",
        });
        setLocationStatus("error");
        setShowLocationError(true);
        return null;
      }

      // Optional secondary permissions check for Chrome and other browsers
      // This helps identify if location permission has been granted but is being blocked
      try {
        const permResult = await navigator.permissions?.query({ name: 'geolocation' });
        debug(`Geolocation permission state: ${permResult?.state}`);
        
        if (permResult?.state === 'denied') {
          toast({
            title: "Location Access Blocked",
            description: "Your browser settings are blocking location access. Please check your browser settings.",
            variant: "destructive",
          });
          setLocationStatus("skipped");
          setShowLocationError(true);
          return null;
        }
      } catch (permError) {
        // Permissions API not supported, continue with regular geolocation
        debug("Permissions API not supported, using standard geolocation");
      }

      // Try alternate methods if available
      let useHighAccuracy = true;
      let timeout = 15000;
      
      // First attempt with high accuracy
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          const geoWatchId = navigator.geolocation.watchPosition(
            (position) => {
              navigator.geolocation.clearWatch(geoWatchId);
              resolve(position);
            },
            (posError) => {
              if (posError.code === 1) { // Permission denied
                // Let the next handler deal with it
                reject({ handled: false, error: posError });
              } else if (posError.code === 2 || posError.code === 3) { // Position unavailable or timeout
                // Try again with lower accuracy in the catch block
                reject({ handled: false, error: posError, tryAgain: true });
              } else {
                reject({ handled: false, error: posError });
              }
            },
            {
              enableHighAccuracy: useHighAccuracy,
              timeout: timeout,
              maximumAge: 0
            }
          );
          
          // Clear watch after timeout to prevent resource leaks
          setTimeout(() => {
            navigator.geolocation.clearWatch(geoWatchId);
          }, timeout + 1000);
        });
        
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLocationStatus("success");
        setIsLocationMapOpen(true);
        
        return pos;
      } catch (geoError: any) {
        // If we should try again with lower accuracy
        if (geoError?.tryAgain) {
          debug("Retrying geolocation with lower accuracy");
          useHighAccuracy = false;
          timeout = 20000; // Longer timeout
          
          try {
            const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(
                resolve,
                (posError) => {
                  console.error("Location error on retry:", posError.message);
                  handleLocationError(posError);
                  reject({ handled: true, error: posError });
                },
                {
                  enableHighAccuracy: useHighAccuracy,
                  timeout: timeout,
                  maximumAge: 60000 // Allow cached position
                }
              );
            });
            
            setLocation({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            });
            setLocationStatus("success");
            setIsLocationMapOpen(true);
            
            return pos;
          } catch (retryError) {
            // Already handled by the error callback
            return null;
          }
        } else if (!geoError?.handled) {
          // If we haven't tried to handle this error yet
          if (geoError?.error) {
            handleLocationError(geoError.error);
          } else {
            console.error("Unexpected error in location handling:", geoError);
            toast({
              title: "Location Error",
              description: "An unexpected error occurred. You can continue without location data or try again.",
              variant: "destructive",
            });
            setLocationStatus("error");
            setShowLocationError(true);
          }
        }
        
        return null;
      }
    } catch (error: any) {
      // Only log error if it wasn't already handled
      if (!error?.handled) {
        console.error("Unexpected error in location handling:", error);
        
        toast({
          title: "Location Error",
          description: "An unexpected error occurred. You can continue without location data or try again.",
          variant: "destructive",
        });
        setLocationStatus("error");
        setShowLocationError(true);
      }
      
      return null;
    }
  };

  // Helper function to handle location errors
  const handleLocationError = (posError: GeolocationPositionError) => {
    console.error("Location error:", posError.message, "Code:", posError.code);
    
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
        description: "Unable to determine your location. Check your connection or try again later.",
        variant: "destructive",
      });
      setLocationStatus("error");
      setShowLocationError(true);
    } else if (posError.code === 3) { // Timeout
      toast({
        title: "Location Request Timeout",
        description: "Location request timed out. Please try again.",
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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
      if (locationMap.current && locationMarker.current) {
        const finalPosition = locationMarker.current.getLngLat();
        setLocation({
          latitude: finalPosition.lat,
          longitude: finalPosition.lng
        });
        
        debug(`Location confirmed at ${finalPosition.lat}, ${finalPosition.lng}`);
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
    
    const pos = await getLocationAsync();
    
    if (!pos) {
      // If getLocationAsync failed, we'll handle this in the location error dialog
      debug("Location permission granted but couldn't get position");
    }
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
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
        
      let audioContext;
      try {
        const AudioContextClass = window.AudioContext || 
          (window as any).webkitAudioContext;
        audioContext = new AudioContextClass();
        await audioContext.resume();
      } catch (audioContextError) {
        stream.getTracks().forEach(track => track.stop());
        throw new Error("Could not initialize audio processing. Please try again or use a different browser.");
      }
      
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      
      source.connect(analyser);
      analyser.fftSize = 2048;
      
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
      
      const visualizerInterval = setInterval(() => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAnimationLevel(average);
      }, 50);
      
      setTimeout(async () => {
        clearInterval(visualizerInterval);
        setRecordingStage("processing");
        
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        const db = Math.round(average * 0.6);
        
        setDecibels(db);
        setIsRecording(false);
        setRecordingStage("done");
        
        stream.getTracks().forEach(track => track.stop());
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
    if (!decibels || !location || !noiseType) {
      toast({
        title: "Missing Information",
        description: "Please complete the measurement and fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Create the new report object
      const newReport = {
        id: `report-${Date.now()}`, // Generate a unique ID
        latitude: location.latitude,
        longitude: location.longitude,
        decibel_level: decibels,
        noise_type: noiseType,
        notes: notes || null,
        created_at: new Date().toISOString(),
        address: "Pune, Maharashtra", // Default address (would be geocoded in production)
        status: "unresolved", // Default status
        device_info: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          timestamp: new Date().toISOString(),
        },
      };
      
      // Submit to Supabase
      const { error } = await supabase.from("noise_reports").insert({
        latitude: location.latitude,
        longitude: location.longitude,
        decibel_level: decibels,
        noise_type: noiseType,
        notes: notes || null,
        device_info: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          timestamp: new Date().toISOString(),
        },
      });

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
    return (
      <Dialog open={showLocationError} onOpenChange={setShowLocationError}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Location Access Issue</DialogTitle>
            <DialogDescription>
              {locationStatus === "skipped" 
                ? "Location access wasn't available. This can happen even when you've granted permissions in your browser."
                : "We couldn't access your location. This might be due to browser settings or permissions."}
            </DialogDescription>
          </DialogHeader>
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
            <Button variant="default" onClick={retryPermissions}>
              Retry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  useEffect(() => {
    if (isLocationMapOpen && locationMapContainer.current && location) {
      try {
        // Clear any previous map instance
        if (locationMap.current) {
          locationMap.current.remove();
          locationMap.current = null;
        }
        
        // Find the wrapper element - with proper TypeScript handling
        const mapWrapper = locationMapContainer.current.querySelector('#mapbox-container-wrapper') as HTMLDivElement;
        const loadingIndicator = locationMapContainer.current.querySelector('.map-loading') as HTMLDivElement;
        
        if (!mapWrapper) {
          console.error("Map wrapper element not found");
          return;
        }
        
        // Always use the dedicated token for the confirmation map
        mapboxgl.accessToken = LOCATION_MAP_TOKEN;
        
        // Create simplified map with minimal options
        try {
          locationMap.current = new mapboxgl.Map({
            container: mapWrapper,
            style: "mapbox://styles/mapbox/streets-v11",
            center: [location.longitude, location.latitude],
            zoom: 15,
            attributionControl: false,
            preserveDrawingBuffer: true // Help with rendering issues
          });
          
          // Hide loading indicator when map is loaded
          locationMap.current.on('load', () => {
            debug("Map fully loaded in location dialog");
            if (loadingIndicator) {
              loadingIndicator.style.display = 'none';
            }
            
            // Only add marker after map is fully loaded
            locationMarker.current = new mapboxgl.Marker({
              draggable: true,
              color: "#8B5CF6"
            })
            .setLngLat([location.longitude, location.latitude])
            .addTo(locationMap.current);
            
            // Handle marker drag end
            locationMarker.current.on('dragend', () => {
              if (!locationMarker.current) return;
              
              const lngLat = locationMarker.current.getLngLat();
              setLocation({
                latitude: lngLat.lat,
                longitude: lngLat.lng
              });
            });
          });
          
          // Force resize for proper rendering
          setTimeout(() => {
            if (locationMap.current) {
              locationMap.current.resize();
              debug("Forced resize of location confirmation map");
            }
          }, 100);
        } catch (mapError) {
          console.error("Error creating map instance:", mapError);
          if (loadingIndicator) {
            loadingIndicator.innerHTML = '<div class="p-4 bg-red-50 dark:bg-red-900/20 text-red-500 text-center">Failed to create map</div>';
          }
        }
        
        // Add backup timeout for loading indicator and marker
        setTimeout(() => {
          if (loadingIndicator && loadingIndicator.style.display !== 'none') {
            loadingIndicator.style.display = 'none';
          }
          
          // If marker wasn't added, try to add it now
          if (!locationMarker.current && locationMap.current) {
            try {
              locationMarker.current = new mapboxgl.Marker({
                draggable: true,
                color: "#8B5CF6"
              })
              .setLngLat([location.longitude, location.latitude])
              .addTo(locationMap.current);
            } catch (markerError) {
              console.error("Error adding marker after timeout:", markerError);
            }
          }
        }, 3000);
        
        // Show error if map fails to load
        if (locationMap.current) {
          locationMap.current.on('error', (e) => {
            console.error("Mapbox error:", e);
            
            if (loadingIndicator) {
              loadingIndicator.innerHTML = '<div class="p-4 bg-red-50 dark:bg-red-900/20 text-red-500 text-center">Map failed to load</div>';
            }
          });
        }
      } catch (error) {
        console.error("Error initializing map:", error);
        
        // Still try to show a basic message
        const loadingIndicator = locationMapContainer.current?.querySelector('.map-loading') as HTMLDivElement;
        if (loadingIndicator) {
          loadingIndicator.innerHTML = '<div class="p-4 bg-red-50 dark:bg-red-900/20 text-red-500 text-center">Map initialization failed</div>';
        }
      }
      
      return () => {
        if (locationMap.current) {
          locationMap.current.remove();
          locationMap.current = null;
        }
        if (locationMarker.current) {
          locationMarker.current = null;
        }
      };
    }
  }, [isLocationMapOpen, location]);

  const renderLocationConfirmationDialog = () => {
    if (!isLocationMapOpen) return null;

    // Generate static map URL for faster initial display
    const generateStaticMapUrl = (lat: number, lng: number) => {
      // Use the dedicated token for the static map as well
      return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+8B5CF6(${lng},${lat})/${lng},${lat},14,0/400x400@2x?access_token=${LOCATION_MAP_TOKEN}`;
    };

    return (
      <Dialog open={isLocationMapOpen} onOpenChange={(open) => {
        if (!open) {
          // Clean up map when dialog closes
          if (locationMap.current) {
            locationMap.current.remove();
            locationMap.current = null;
          }
          setIsLocationMapOpen(false);
        }
      }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Confirm Your Location</DialogTitle>
            <DialogDescription>
              {locationStatus === "skipped" ? (
                "Location access was denied. You can continue without location data or try again."
              ) : (
                "Please confirm your location on the map. You can drag the marker to adjust if needed."
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
                ref={locationMapContainer} 
                className="h-[400px] w-full rounded-md overflow-hidden border border-gray-200 dark:border-gray-700"
                style={{ 
                  display: "block",
                  position: "relative",
                  minHeight: "400px",
                  backgroundImage: location ? `url(${generateStaticMapUrl(location.latitude, location.longitude)})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {/* Fallback loading indicator */}
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50/30 dark:bg-gray-900/30 z-10 map-loading">
                  <div className="flex flex-col items-center bg-white/80 dark:bg-black/50 p-3 rounded-lg">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500 mb-2" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">Loading interactive map...</p>
                  </div>
                </div>

                {/* This wrapper ensures the map renders correctly */}
                <div className="absolute inset-0 w-full h-full" id="mapbox-container-wrapper"></div>
              </div>
            )}
          </div>
          
          <DialogFooter className="mt-4">
            {locationStatus === "skipped" ? (
              <>
                <Button variant="outline" onClick={() => setIsLocationMapOpen(false)}>
                  Continue Without Location
                </Button>
                <Button onClick={retryPermissions}>
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
