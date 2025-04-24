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
import { env } from "@/lib/env";

// Set Mapbox token directly from environment
mapboxgl.accessToken = env.MAPBOX_ACCESS_TOKEN;

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
  
  // Animation for visualizing sound
  const [animationLevel, setAnimationLevel] = useState(0);
  
  const [isLocationMapOpen, setIsLocationMapOpen] = useState(false);
  const locationMapContainer = useRef<HTMLDivElement>(null);
  const locationMap = useRef<mapboxgl.Map | null>(null);
  const locationMarker = useRef<mapboxgl.Marker | null>(null);
  
  useEffect(() => {
    // Reset audio visualization when not recording
    if (!isRecording) {
      const intervalId = setInterval(() => {
        setAnimationLevel(Math.random() * 20);
      }, 500);
      
      return () => clearInterval(intervalId);
    }
  }, [isRecording]);

  // Get noise category options
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
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, 
          // Custom error handler to avoid throwing actual errors
          (posError) => {
            // Handle the error here without throwing
            setLocationStatus("error");
            setShowLocationError(true);
            // Use a custom object instead of throwing the error
            resolve({ handled: true, error: posError } as any);
          }, 
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
          }
        );
      });
      
      // Check if it's our handled error response
      if (pos && (pos as any).handled) {
        return null;
      }
      
      setLocation({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      setLocationStatus("success");
      
      // Open location confirmation dialog
      setIsLocationMapOpen(true);
      
      return pos;
    } catch (error) {
      // This should now only catch unexpected errors
      console.error("Unexpected error in location handling:", error);
      setLocationStatus("error");
      setShowLocationError(true);
      return null;
    }
  };

  // Handle step-by-step permission requests
  const requestPermissions = async () => {
    setShowPermissionDialog(true);
    setPermissionStep("mic");
  };

  const handleMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop stream immediately after testing permission
      stream.getTracks().forEach(track => track.stop());
      setPermissionStep("location");
    } catch (error) {
      console.error("Microphone permission error:", error);
      setPermissionError("Microphone access was denied. Please grant permission in your browser settings.");
      setShowPermissionDialog(false);
    }
  };

  const handleLocationConfirmation = () => {
    setIsLocationMapOpen(false);
    
    toast({
      title: "Location Confirmed",
      description: "Your location has been confirmed and will be used for the noise report.",
      variant: "default",
    });
    
    // Continue with recording after location is confirmed
    startRecordingWithPermissions();
  };

  const handleLocationPermission = async () => {
    const pos = await getLocationAsync();
    
    if (pos) {
      // Location successfully obtained
      setShowPermissionDialog(false);
      // The startRecordingWithPermissions will be called after location confirmation
    }
    // Otherwise the error dialog is already shown by getLocationAsync
  };

  const skipLocationAndContinue = () => {
    setLocationStatus("skipped");
    setShowLocationError(false);
    setShowPermissionDialog(false);
    // Start recording without location data
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
      
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Your browser doesn't support audio recording. Please try using a modern browser like Chrome, Firefox, or Edge.");
      }
      
      // Request microphone again to start actual recording
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
        
      // Initialize audio processing
      let audioContext;
      try {
        // Use type assertion to handle browser prefixes
        const AudioContextClass = window.AudioContext || 
          (window as any).webkitAudioContext;
        audioContext = new AudioContextClass();
        await audioContext.resume(); // Ensure context is running (needed in some browsers)
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
      
      // Progress bar and timer update
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
      
      // Animate sound levels during recording
      const visualizerInterval = setInterval(() => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        // Calculate average volume for animation
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAnimationLevel(average);
      }, 50);
      
      // Record for 10 seconds
      setTimeout(async () => {
        clearInterval(visualizerInterval);
        setRecordingStage("processing");
        
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        
        // Calculate average volume
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        // Convert to decibels (rough approximation)
        const db = Math.round(average * 0.6);
        
        setDecibels(db);
        setIsRecording(false);
        setRecordingStage("done");
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
      }, 10000);
      
    } catch (error) {
      console.error("Error starting recording:", error);
      setIsRecording(false);
      
      // Handle specific error messages
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
    // First check if we already have permissions
    if (location && locationStatus === "success") {
      // Show location confirmation even if we already have location
      setIsLocationMapOpen(true);
    } else {
      // Request permissions step by step
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

      setShowSuccessDialog(true);
      
      // Reset form after successful submission
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

  // Function to retry permissions
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
    // Normalize animation level to get values between 0 and 100
    const normalizedLevel = Math.min(100, Math.max(0, animationLevel));
    
    // Generate 5 bars with varying heights based on normalizedLevel
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

  // Location error dialog
  const renderLocationErrorDialog = () => {
    return (
      <Dialog open={showLocationError} onOpenChange={setShowLocationError}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Location Access Denied</DialogTitle>
            <DialogDescription>
              You've denied access to your location. While location data helps us map noise pollution accurately, you can continue without it.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
            <p className="text-sm text-muted-foreground">
              Without location data, your noise report won't appear on the map, but we'll still collect the noise level data.
            </p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => {
              setShowLocationError(false);
              setShowPermissionDialog(false);
            }}>
              Cancel
            </Button>
            <Button variant="default" onClick={skipLocationAndContinue}>
              Continue Without Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // Initialize and setup the location confirmation map
  useEffect(() => {
    if (isLocationMapOpen && locationMapContainer.current && location) {
      // Create a new map instance for location confirmation
      locationMap.current = new mapboxgl.Map({
        container: locationMapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [location.longitude, location.latitude],
        zoom: 15,
        attributionControl: false,
      });
      
      // Add navigation controls to the map
      locationMap.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Add a draggable marker to the map at the user's location
      locationMarker.current = new mapboxgl.Marker({
        draggable: true,
        color: "#8B5CF6" // Purple color
      })
        .setLngLat([location.longitude, location.latitude])
        .addTo(locationMap.current);
      
      // Update location state when marker is dragged
      locationMarker.current.on('dragend', () => {
        const lngLat = locationMarker.current.getLngLat();
        setLocation({
          latitude: lngLat.lat,
          longitude: lngLat.lng
        });
      });
      
      // Cleanup function
      return () => {
        if (locationMap.current) {
          locationMap.current.remove();
          locationMap.current = null;
        }
      };
    }
  }, [isLocationMapOpen, location]);

  // Add location confirmation dialog to render method
  const renderLocationConfirmationDialog = () => {
    return (
      <Dialog open={isLocationMapOpen} onOpenChange={setIsLocationMapOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Confirm Your Location</DialogTitle>
            <DialogDescription>
              Drag the marker to adjust your exact location if needed. This helps us accurately map noise pollution data.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mb-4 rounded-md overflow-hidden border">
            <div ref={locationMapContainer} className="h-[300px] w-full"></div>
          </div>
          
          <div className="flex items-center gap-2 mb-4 text-sm bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md border border-blue-200 dark:border-blue-800">
            <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
            <div>
              <p className="font-medium">Your location will be used to:</p>
              <ul className="list-disc ml-5 mt-1">
                <li>Map noise pollution across Pune</li>
                <li>Identify noise hotspots in your neighborhood</li>
                <li>Help authorities target noise reduction efforts</li>
              </ul>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-purple-500" />
            <span className="font-medium">Current coordinates:</span>
            <span className="text-gray-600 dark:text-gray-400">
              {location?.latitude.toFixed(6)}, {location?.longitude.toFixed(6)}
            </span>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsLocationMapOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="default" 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={handleLocationConfirmation}
            >
              <MapPin className="mr-2 h-4 w-4" />
              Confirm Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <Card className="w-full max-w-xl mx-auto p-6 shadow-lg bg-white dark:bg-gray-900 relative">
      {/* Animation for recording */}
      <div
        className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none"
        style={{ zIndex: 1 }}
      >
        {isRecording && (
          <div className="pulse-recording animate-pulse-slow"></div>
        )}
      </div>
      
      <div className="relative" style={{ zIndex: 2 }}>
        {/* Card Content */}
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
          {/* Recording UI */}
          {isRecording && (
            <div className="mb-8 animate-in fade-in-0 duration-300">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-red-500">Recording in progress...</span>
                <span className="text-sm">{recordingTimeLeft}s left</span>
              </div>
              <Progress value={recordingProgress} className="h-2" />
            </div>
          )}

          {/* Recording button */}
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

          {/* Noise measurement display */}
          {renderNoiseMeter()}

          {/* Location display */}
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

          {/* Form fields */}
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
      
      {/* Render dialogs */}
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

      {/* Success dialog */}
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
              onClick={() => setShowSuccessDialog(false)}
              className="w-full sm:w-auto"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add location error dialog */}
      {renderLocationErrorDialog()}

      {/* Add location confirmation dialog */}
      {renderLocationConfirmationDialog()}
    </Card>
  );
};

export default NoiseRecorder;
