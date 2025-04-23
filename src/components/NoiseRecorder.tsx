
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const NoiseRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [decibels, setDecibels] = useState<number | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [noiseType, setNoiseType] = useState("");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      // Request location permission
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      
      setLocation({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });

      // Request microphone permission and start recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      
      source.connect(analyser);
      analyser.fftSize = 2048;
      
      setIsRecording(true);
      
      // Record for 10 seconds
      setTimeout(async () => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        
        // Calculate average volume
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        // Convert to decibels (rough approximation)
        const db = Math.round(average * 0.6);
        
        setDecibels(db);
        setIsRecording(false);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
      }, 10000);
      
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Error",
        description: "Could not access microphone or location. Please check permissions.",
        variant: "destructive",
      });
      setIsRecording(false);
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
      const { error } = await supabase.from("noise_reports").insert({
        latitude: location.latitude,
        longitude: location.longitude,
        decibel_level: decibels,
        noise_type: noiseType,
        notes: notes || null,
        device_info: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your noise report has been submitted. Thank you for contributing!",
      });

      // Reset form
      setDecibels(null);
      setNoiseType("");
      setNotes("");
      
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "Error",
        description: "Could not submit your report. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        {isRecording ? (
          <div className="space-y-4">
            <div className="animate-pulse text-xl font-semibold text-red-500">
              Recording in progress...
            </div>
            <p>Please keep your device steady for 10 seconds</p>
          </div>
        ) : decibels ? (
          <div className="space-y-2">
            <div className="text-3xl font-bold">{decibels} dB</div>
            <p className="text-gray-600">Measurement complete</p>
          </div>
        ) : (
          <Button 
            onClick={startRecording} 
            className="w-full"
            size="lg"
          >
            Start Measuring
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="noiseType">Type of Noise</Label>
          <Select 
            value={noiseType} 
            onValueChange={setNoiseType}
          >
            <option value="">Select noise type</option>
            <option value="traffic">Traffic</option>
            <option value="construction">Construction</option>
            <option value="industrial">Industrial</option>
            <option value="entertainment">Entertainment/Events</option>
            <option value="other">Other</option>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes</Label>
          <Input
            id="notes"
            placeholder="Add any relevant details..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <Button 
          onClick={submitReport} 
          className="w-full"
          disabled={!decibels || !location || !noiseType}
        >
          Submit Report
        </Button>
      </div>
    </div>
  );
};

export default NoiseRecorder;
