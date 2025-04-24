
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import NoiseLevelsMap from "@/components/NoiseLevelsMap";
import { Volume2, MapPin, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Map = () => {
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    // Animation for page entrance
    const timer = setTimeout(() => {
      setShowInfo(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Volume2 className="h-8 w-8 text-purple-500 dark:text-purple-400" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Noise Pollution Map
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Visualize noise levels reported across Pune. Areas in red indicate higher noise pollution that may exceed safe thresholds.
          </p>
        </div>
        
        <div className="mb-6 opacity-0 animate-[fade-in_0.5s_ease-out_0.5s_forwards]">
          <Alert variant="default" className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
            <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            <AlertTitle className="text-gray-900 dark:text-white">About this map</AlertTitle>
            <AlertDescription className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center text-gray-700 dark:text-gray-300">
              <span>This map displays crowdsourced noise data collected by citizens across Pune.</span>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="whitespace-nowrap">
                    Learn More
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Understanding Noise Pollution</DialogTitle>
                    <DialogDescription className="pt-4">
                      <div className="space-y-4 text-sm">
                        <p>Noise pollution is measured in decibels (dB). Here's what different levels mean:</p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-green-500"></div>
                            <span><strong>Below 60 dB:</strong> Generally safe. Normal conversation is about 60 dB.</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                            <span><strong>60-80 dB:</strong> Moderate. City traffic from inside a car is about 80 dB.</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-red-500"></div>
                            <span><strong>Above 80 dB:</strong> Potentially harmful with prolonged exposure.</span>
                          </div>
                        </div>
                        
                        <p>The WHO recommends noise levels below 70 dB over 24 hours to prevent hearing damage.</p>
                        
                        <div className="bg-amber-50 dark:bg-amber-900/30 p-3 rounded-md border border-amber-200 dark:border-amber-800">
                          <div className="flex gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400 shrink-0" />
                            <div>
                              <p className="font-medium">Health impacts of noise pollution include:</p>
                              <ul className="list-disc pl-5 pt-1 space-y-1">
                                <li>Stress and anxiety</li>
                                <li>Sleep disturbance</li>
                                <li>Cardiovascular issues</li>
                                <li>Reduced cognitive performance</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </AlertDescription>
          </Alert>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card className="p-6 shadow-lg border-gray-100 dark:border-gray-700 dark:bg-gray-800">
              <NoiseLevelsMap />
            </Card>
          </div>
          
          <div className={`space-y-6 ${showInfo ? 'opacity-100 transition-opacity duration-700' : 'opacity-0'}`}>
            <Card className="p-4 border-gray-100 dark:border-gray-700 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
              <h3 className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-200 mb-3">
                <MapPin className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                Map Legend
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Below 60 dB - Safe levels</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">60-80 dB - Moderate levels</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Above 80 dB - High levels</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-8 rounded-md bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 opacity-60"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Heatmap intensity</span>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 border-gray-100 dark:border-gray-700 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
              <h3 className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-200 mb-3">
                <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                Noise Thresholds
              </h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <p>According to CPCB guidelines for Pune:</p>
                <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                  <div className="grid grid-cols-2 gap-1">
                    <span className="text-gray-600 dark:text-gray-400">Residential:</span>
                    <span>55 dB (day) / 45 dB (night)</span>
                  </div>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                  <div className="grid grid-cols-2 gap-1">
                    <span className="text-gray-600 dark:text-gray-400">Commercial:</span>
                    <span>65 dB (day) / 55 dB (night)</span>
                  </div>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                  <div className="grid grid-cols-2 gap-1">
                    <span className="text-gray-600 dark:text-gray-400">Industrial:</span>
                    <span>75 dB (day) / 70 dB (night)</span>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 border-gray-100 dark:border-gray-700 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
              <h3 className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-200 mb-3">
                <Info className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                Taking Action
              </h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <p>If you notice excessive noise in your area:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Report to Pune Municipal Corporation</li>
                  <li>Contact local police</li>
                  <li>Organize community awareness</li>
                </ul>
                <Button variant="outline" size="sm" className="w-full mt-2">
                  View Guidelines
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
