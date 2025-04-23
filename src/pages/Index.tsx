
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import NoiseRecorder from "@/components/NoiseRecorder";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Help Monitor Noise Pollution in Pune
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Use your device to measure and report noise levels in your area. Your contributions help create a quieter, healthier city.
          </p>
        </div>
        <div className="max-w-xl mx-auto">
          <Card className="p-6">
            <NoiseRecorder />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
