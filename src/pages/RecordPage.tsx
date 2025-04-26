
import React from "react";
import NoiseRecorder from "@/components/NoiseRecorder";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import ChatBox from "@/components/ChatBox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const RecordPage = () => {
  return (
    <div className="container max-w-7xl mx-auto px-4 py-6 md:py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-8"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Record Noise Levels</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-2 max-w-xl mx-auto">
            Measure noise pollution in your area and contribute to our data collection efforts to help make Pune quieter.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <NoiseRecorder />
            
            <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 mt-6">
              <h2 className="text-xl font-semibold mb-4 text-blue-800 dark:text-blue-300">Tips for Accurate Measurements</h2>
              <ul className="list-disc pl-5 space-y-2 text-blue-700 dark:text-blue-400">
                <li>Hold your device at arm's length away from your body</li>
                <li>Avoid covering the microphone with your fingers</li>
                <li>Try to minimize wind or breathing noise during recording</li>
                <li>Record for the full 10 seconds to get the most accurate reading</li>
                <li>Include details about the noise source in your notes</li>
              </ul>
            </Card>
          </div>
          
          <div className="lg:col-span-5">
            <Tabs defaultValue="chat">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="chat" className="flex-1">AI Assistant</TabsTrigger>
                <TabsTrigger value="info" className="flex-1">Noise Info</TabsTrigger>
              </TabsList>
              
              <TabsContent value="chat">
                <ChatBox 
                  initialMessage="Hello! I can help you record noise pollution data correctly. Ask me any questions about how to take accurate measurements or why this data matters." 
                  compact
                />
              </TabsContent>
              
              <TabsContent value="info">
                <Card className="p-6 bg-white dark:bg-gray-800">
                  <h2 className="text-xl font-semibold mb-4">Understanding Noise Levels</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-lg">Decibel Scale:</h3>
                      <ul className="list-disc pl-5 space-y-2">
                        <li><span className="font-bold text-green-600">30-40dB:</span> Quiet library, whisper</li>
                        <li><span className="font-bold text-green-600">40-50dB:</span> Quiet suburb, conversation at home</li>
                        <li><span className="font-bold text-yellow-600">50-60dB:</span> Normal conversation, quiet office</li>
                        <li><span className="font-bold text-yellow-600">60-70dB:</span> Busy traffic, noisy restaurant</li>
                        <li><span className="font-bold text-orange-600">70-80dB:</span> Vacuum cleaner, alarm clock</li>
                        <li><span className="font-bold text-orange-600">80-90dB:</span> Lawn mower, food blender</li>
                        <li><span className="font-bold text-red-600">90-100dB:</span> Motorcycle, car horn</li>
                        <li><span className="font-bold text-red-600">100-120dB:</span> Rock concert, thunder</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-lg">Health Impact:</h3>
                      <p>Exposure to noise levels above 70dB for prolonged periods can lead to:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Hearing damage</li>
                        <li>Sleep disturbance</li>
                        <li>Increased stress levels</li>
                        <li>Cardiovascular problems</li>
                        <li>Impaired cognitive development in children</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RecordPage;
