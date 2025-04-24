
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import NoiseRecorder from "@/components/NoiseRecorder";
import { Volume2, Headphones, AlertTriangle, MapPin, BarChart2, ArrowRight, Activity, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [showFeatures, setShowFeatures] = useState(false);
  
  // Get recent statistics
  const { data: stats } = useQuery({
    queryKey: ["noise-stats"],
    queryFn: async () => {
      // Get total reports count
      const { count: totalReports, error: countError } = await supabase
        .from("noise_reports")
        .select("*", { count: "exact", head: true });
        
      if (countError) throw countError;
      
      // Get average decibel level
      const { data: avgData, error: avgError } = await supabase
        .from("noise_reports")
        .select("decibel_level");
        
      if (avgError) throw avgError;
      
      let avgLevel = 0;
      if (avgData && avgData.length) {
        avgLevel = Math.round(
          avgData.reduce((sum, item) => sum + (item.decibel_level || 0), 0) / avgData.length
        );
      }
      
      // Get reports from last 24 hours
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { data: recentReports, error: recentError } = await supabase
        .from("noise_reports")
        .select("*", { count: "exact" })
        .gte("created_at", yesterday.toISOString());
        
      const recentCount = recentReports?.length || 0;
      
      return {
        totalReports,
        avgLevel,
        recentReports: recentCount
      };
    },
  });

  useEffect(() => {
    // Animate features in after a delay
    const timer = setTimeout(() => {
      setShowFeatures(true);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center gap-3 mb-4 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
            <Activity className="h-4 w-4" />
            <span>Join the Movement Against Noise Pollution</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Help Monitor Noise Pollution in Pune
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Use your device to measure and report noise levels. Your contributions help create a quieter, healthier city for everyone.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
              <a href="#record">Start Recording</a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/map" className="group">
                View Noise Map
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Statistics Section */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16 opacity-0 animate-[fade-in_0.6s_ease-out_0.3s_forwards]">
            <Card className="p-6 border-gray-100 bg-gradient-to-br from-blue-50 to-purple-50 shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Reports</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalReports || 0}</p>
                </div>
                <div className="bg-blue-100 p-2 rounded-full">
                  <BarChart2 className="h-5 w-5 text-blue-700" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">From citizens across Pune</p>
            </Card>
            
            <Card className="p-6 border-gray-100 bg-gradient-to-br from-amber-50 to-red-50 shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Average Noise</p>
                  <p className="text-3xl font-bold mt-1">{stats.avgLevel || 0} dB</p>
                </div>
                <div className="bg-amber-100 p-2 rounded-full">
                  <Volume2 className="h-5 w-5 text-amber-700" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Across all measurements</p>
            </Card>
            
            <Card className="p-6 border-gray-100 bg-gradient-to-br from-green-50 to-teal-50 shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Recent Activity</p>
                  <p className="text-3xl font-bold mt-1">{stats.recentReports}</p>
                </div>
                <div className="bg-green-100 p-2 rounded-full">
                  <Activity className="h-5 w-5 text-green-700" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Reports in last 24 hours</p>
            </Card>
          </div>
        )}
        
        {/* Features Section */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 ${showFeatures ? 'opacity-100 transition-all duration-700' : 'opacity-0'}`}>
          <div className="flex flex-col items-center text-center p-6">
            <div className="bg-blue-100 p-3 rounded-full mb-4">
              <Headphones className="h-6 w-6 text-blue-700" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Measure Accurately</h3>
            <p className="text-gray-600">
              Use your device's microphone to capture 10-second noise samples that are automatically analyzed for decibel level.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center p-6">
            <div className="bg-purple-100 p-3 rounded-full mb-4">
              <MapPin className="h-6 w-6 text-purple-700" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Map The City</h3>
            <p className="text-gray-600">
              Your reports are added to a citywide map that reveals noise pollution patterns and helps identify hotspots.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center p-6">
            <div className="bg-green-100 p-3 rounded-full mb-4">
              <AlertTriangle className="h-6 w-6 text-green-700" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Drive Change</h3>
            <p className="text-gray-600">
              Data collected empowers authorities to make evidence-based decisions for noise reduction policies.
            </p>
          </div>
        </div>
        
        <Alert className="mb-12 bg-blue-50 border-blue-100 shadow-sm opacity-0 animate-[fade-in_0.5s_ease-out_1s_forwards]">
          <Info className="h-5 w-5 text-blue-500" />
          <AlertTitle>How does noise affect health?</AlertTitle>
          <AlertDescription>
            <div className="mt-2 text-blue-800 text-sm">
              <p>Prolonged exposure to noise pollution can lead to stress, sleep disturbance, hearing loss, and cardiovascular issues. The World Health Organization recommends noise levels below 70 dB over a 24-hour period to prevent hearing damage.</p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="bg-white bg-opacity-60 p-3 rounded-md">
                  <div className="font-medium mb-1">Normal conversation</div>
                  <div className="inline-flex items-center gap-1 text-gray-600 text-xs">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>~60 dB</span>
                  </div>
                </div>
                <div className="bg-white bg-opacity-60 p-3 rounded-md">
                  <div className="font-medium mb-1">City traffic</div>
                  <div className="inline-flex items-center gap-1 text-gray-600 text-xs">
                    <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                    <span>~80 dB</span>
                  </div>
                </div>
                <div className="bg-white bg-opacity-60 p-3 rounded-md">
                  <div className="font-medium mb-1">Construction site</div>
                  <div className="inline-flex items-center gap-1 text-gray-600 text-xs">
                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                    <span>~100 dB</span>
                  </div>
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>
        
        {/* Recorder Section */}
        <div id="record" className="max-w-xl mx-auto scroll-mt-20">
          <h2 className="text-2xl font-bold text-center mb-6">Record & Report Noise</h2>
          <Card className="p-6 shadow-lg border-gray-100">
            <NoiseRecorder />
          </Card>
          
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Your contributions help build a comprehensive map of noise pollution in Pune</p>
            <p className="mt-1">
              <Link to="/map" className="text-blue-600 hover:underline inline-flex items-center">
                View the map to see all reports
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Call to Action */}
      <div className="mt-24 bg-gradient-to-r from-purple-700 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Join the Movement for a Quieter Pune</h2>
          <p className="text-lg max-w-2xl mx-auto mb-8 opacity-90">
            Every measurement helps create a more complete picture of noise pollution in our city. Together, we can make a difference.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-purple-700 hover:bg-gray-100">
              <a href="#record">Record Noise Now</a>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-white border-white hover:bg-white/10">
              <Link to="/map">View Current Data</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
