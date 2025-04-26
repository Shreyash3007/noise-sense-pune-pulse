
import React from "react";
import NoiseRecorder from "@/components/NoiseRecorder";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

const RecordPage = () => {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-6 md:py-8">
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
        
        <div className="mx-auto w-full max-w-xl">
          <NoiseRecorder />
        </div>
        
        <div className="mt-4 max-w-3xl mx-auto w-full">
          <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
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
      </motion.div>
    </div>
  );
};

export default RecordPage;
