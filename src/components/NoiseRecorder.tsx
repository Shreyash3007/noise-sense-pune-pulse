
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Mic, MicOff, Volume2, MapPin, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const NoiseRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [decibels, setDecibels] = useState<number | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "fetching" | "success" | "error">("idle");
  const [noiseType, setNoiseType] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [recordingTimeLeft, setRecordingTimeLeft] = useState(10);
  const [recordingStage, setRecordingStage] = useState<"permission" | "recording" | "processing" | "done">("permission");
  const [permissionError, setPermissionError] = useState("");
  const { toast } = useToast();
  
  // Animation for visualizing sound
  const [animationLevel, setAnimationLevel] = useState(0);
  
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
    { value: "traffic", label: "Traffic Noise" },
    { value: "construction", label: "Construction" },
    { value: "industrial", label: "Industrial" },
    { value: "entertainment", label: "Entertainment/Events" },
    { value: "aircraft", label: "Aircraft" },
    { value: "residential", label: "Residential/Neighbors" },
    { value: "other", label: "Other" },
  ];
  
  const getLocationAsync = async () => {
    setLocationStatus("fetching");
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });
      
      setLocation({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      setLocationStatus("success");
      return pos;
    } catch (error) {
      console.error("Error getting location:", error);
      setLocationStatus("error");
      throw error;
    }
  };

  const startRecording = async () => {
    try {
      setRecordingStage("permission");
      setPermissionError("");
      
      // Request location permission first
      await getLocationAsync();
      
      // Request microphone permission and start recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
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
      }, 100);
      
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
      
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setPermissionError("Microphone access was denied. Please grant permission to continue.");
      } else if (locationStatus === "error") {
        setPermissionError("Location access was denied. We need your location to map noise data.");
      } else {
        setPermissionError("An error occurred while accessing your device. Please check permissions and try again.");
      }
      
      toast({
        title: "Error",
        description: "Could not access microphone or location. Please check permissions.",
        variant: "destructive",
      });
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

  // Render noise level meter visual
  const renderNoiseMeter = () => {
    if (decibels === null) return null;
    
    const getColor = () => {
      if (decibels >= 80) return "text-red-500";
      if (decibels >= 60) return "text-amber-500";
      return "text-green-500";
    };
    
    const getWidthPercentage = () => {
      return Math.min(100, (decibels / 100) * 100);
    };
    
    const getDescription = () => {
      if (decibels >= 80) return "High - Potentially harmful";
      if (decibels >= 60) return "Moderate - Typical urban noise";
      return "Low - Generally safe levels";
    };
    
    return (
      <div className="mt-4 animate-fade-in">
        <div className="flex justify-between items-center mb-1">
          <p className="text-sm font-medium">Measured Noise Level</p>
          <p className={`font-bold ${getColor()}`}>{decibels} dB</p>
        </div>
        
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${
              decibels >= 80 ? 'bg-red-500' : 
              decibels >= 60 ? 'bg-amber-500' : 
              'bg-green-500'
            }`}
            style={{ width: `${getWidthPercentage()}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0 dB</span>
          <span>{getDescription()}</span>
          <span>100+ dB</span>
        </div>
      </div>
    );
  };

  // Render sound wave animation during recording
  const renderSoundWaves = () => {
    // Create 10 bars with dynamic heights based on animation level
    return (
      <div className="flex justify-center items-center gap-1 h-16 my-4">
        {Array.from({ length: 10 }).map((_, i) => {
          // Calculate a height for each bar based on position and animation level
          const height = isRecording
            ? Math.max(10, Math.min(100, animationLevel * (0.5 + Math.abs(Math.sin((i+1) * 0.7)))))
            : 10 + Math.random() * 10;
            
          return (
            <div
              key={i}
              className={`w-2 rounded-full ${
                isRecording ? 'bg-red-500' : 'bg-gray-300'
              } animate-pulse`}
              style={{
                height: `${height}%`,
                animationDelay: `${i * 0.1}s`,
              }}
            ></div>
          );
        })}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        {isRecording ? (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-red-500 animate-ping opacity-75"></div>
                <div className="relative rounded-full bg-white p-3 shadow-md">
                  <Mic className="h-10 w-10 text-red-500" />
                </div>
              </div>
              <div className="mt-4 text-xl font-semibold text-red-500">
                Recording in progress...
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Please keep quiet and hold your device steady
              </div>
            </div>
            
            {renderSoundWaves()}
            
            <div className="space-y-2">
              <Progress value={recordingProgress} className="h-2" />
              <div className="flex justify-between text-sm text-gray-500">
                <span>Recording...</span>
                <span>{recordingTimeLeft}s remaining</span>
              </div>
            </div>
          </div>
        ) : permissionError ? (
          <Card className="p-4 border-red-200 bg-red-50">
            <div className="flex flex-col items-center space-y-3">
              <AlertTriangle className="h-10 w-10 text-red-500" />
              <h3 className="text-lg font-medium text-red-800">Permission Required</h3>
              <p className="text-center text-red-600">{permissionError}</p>
              <Button 
                onClick={() => {
                  setPermissionError("");
                  startRecording();
                }} 
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                Try Again
              </Button>
            </div>
          </Card>
        ) : decibels ? (
          <div className="space-y-3">
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-white p-3 shadow-md border border-gray-100">
                <Volume2 className={`h-10 w-10 ${
                  decibels >= 80 ? 'text-red-500' : 
                  decibels >= 60 ? 'text-amber-500' : 
                  'text-green-500'
                }`} />
              </div>
              <div className="mt-4 flex items-center justify-center">
                <div className={`text-3xl font-bold ${
                  decibels >= 80 ? 'text-red-500' : 
                  decibels >= 60 ? 'text-amber-500' : 
                  'text-green-500'
                }`}>
                  {decibels} dB
                </div>
                <span className="ml-2 text-gray-500">measured</span>
              </div>
            </div>
            
            {renderNoiseMeter()}
            
            <Alert variant="default" className="bg-blue-50 border-blue-200 mt-4">
              <AlertDescription className="text-sm text-blue-800">
                {decibels >= 80 ? (
                  "This noise level is high and potentially harmful with prolonged exposure."
                ) : decibels >= 60 ? (
                  "This is a moderate noise level, typical in urban environments."
                ) : (
                  "This noise level is generally considered safe."
                )}
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="space-y-4">
            <Button 
              onClick={startRecording} 
              className="w-full relative overflow-hidden group bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
              size="lg"
            >
              <div className="absolute inset-0 w-full h-full transition-all duration-300 scale-x-0 group-hover:scale-x-100 group-hover:bg-white/10"></div>
              <div className="relative flex items-center justify-center gap-2">
                <Mic className="h-5 w-5" />
                Start Measuring Noise
              </div>
            </Button>
            
            <div className="text-sm text-center text-gray-500">
              This will record for 10 seconds to measure the average noise level
            </div>
            
            {renderSoundWaves()}
          </div>
        )}
      </div>

      {decibels !== null && (
        <div className="space-y-4 animate-fade-in">
          <div className="space-y-2">
            <Label htmlFor="noiseType">Type of Noise</Label>
            <Select 
              value={noiseType} 
              onValueChange={setNoiseType}
            >
              <SelectTrigger id="noiseType" className="w-full">
                <SelectValue placeholder="Select noise type" />
              </SelectTrigger>
              <SelectContent>
                {noiseCategories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Input
              id="notes"
              placeholder="Add any relevant details about the noise..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <div className="flex items-center gap-2 mb-3 text-sm">
              <MapPin className="h-4 w-4 text-gray-500" />
              {locationStatus === "success" ? (
                <span className="text-green-600 flex items-center">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Location captured successfully
                </span>
              ) : locationStatus === "fetching" ? (
                <span className="text-amber-600 flex items-center">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Getting location...
                </span>
              ) : locationStatus === "error" ? (
                <span className="text-red-600 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Could not access location
                </span>
              ) : (
                <span className="text-gray-500">Location required for submission</span>
              )}
            </div>
            <Button 
              onClick={submitReport} 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              disabled={!decibels || !location || !noiseType || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Noise Report"
              )}
            </Button>
          </div>
        </div>
      )}
      
      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Report Submitted Successfully
            </DialogTitle>
            <DialogDescription>
              Thank you for contributing to the Noise Sense project!
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <p className="text-green-800">
                Your noise report has been added to our database and will help identify noise pollution patterns in Pune.
              </p>
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Impact of your contribution:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Helps create accurate noise pollution maps</li>
                <li>Supports local authorities in policy decisions</li>
                <li>Contributes to a healthier urban environment</li>
              </ul>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between gap-2">
            <Button variant="outline" onClick={() => setShowSuccessDialog(false)}>
              Close
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                setShowSuccessDialog(false);
                setDecibels(null);
                setNoiseType("");
                setNotes("");
                window.location.href = "/map";
              }}
            >
              View on Map
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NoiseRecorder;
