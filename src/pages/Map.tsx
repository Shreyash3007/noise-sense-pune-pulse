
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import NoiseLevelsMap from "@/components/NoiseLevelsMap";

const Map = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Noise Pollution Map
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            View noise levels reported across Pune. Areas in red indicate higher noise pollution.
          </p>
        </div>
        <Card className="p-6">
          <NoiseLevelsMap />
        </Card>
      </div>
    </div>
  );
};

export default Map;
