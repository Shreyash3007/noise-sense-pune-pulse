'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import Navigation from '@/components/Navigation';
import dynamic from 'next/dynamic';
import { Location, NoiseCategory } from '@/types';
import Logo from '@/components/Logo';

// Dynamic import for react-leaflet components
const Map = dynamic(
  () => import('@/components/Map'),
  { ssr: false }
);

const noiseCategories: { id: NoiseCategory; label: string; icon: string }[] = [
  { id: 'traffic', label: 'Traffic Noise', icon: '🚗' },
  { id: 'construction', label: 'Construction', icon: '🏗️' },
  { id: 'event', label: 'Events & Music', icon: '🎵' },
  { id: 'industrial', label: 'Industrial', icon: '🏭' },
  { id: 'other', label: 'Other', icon: '📝' },
];

const stages = [
  { id: 'location', title: 'Location', description: 'Confirm your location' },
  { id: 'measure', title: 'Measure', description: 'Record noise levels' },
  { id: 'categorize', title: 'Categorize', description: 'Identify noise source' },
  { id: 'submit', title: 'Submit', description: 'Review and submit report' },
];

export default function MeasurePage() {
  const [currentStage, setCurrentStage] = useState('location');
  const [location, setLocation] = useState<Location | null>(null);
  const [measuring, setMeasuring] = useState(false);
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<NoiseCategory | null>(null);
  const [description, setDescription] = useState('');
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [isMarkerDragging, setIsMarkerDragging] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [measurementProgress, setMeasurementProgress] = useState(0);
  const [pulseScale, setPulseScale] = useState(1);
  
  // Scroll progress for animations
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const scale = useTransform(smoothProgress, [0, 0.1, 0.9, 1], [1, 1.05, 1.05, 1]);
  const opacity = useTransform(smoothProgress, [0, 0.1, 0.9, 1], [1, 0.9, 0.9, 1]);

  // Initialize audio context and analyzer
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  // Update progress based on current stage
  useEffect(() => {
    const stageIndex = stages.findIndex(stage => stage.id === currentStage);
    const newProgress = (stageIndex / (stages.length - 1)) * 100;
    setProgress(newProgress);
  }, [currentStage]);

  // Add pulsing animation during measurement
  useEffect(() => {
    if (measuring) {
      const interval = setInterval(() => {
        setPulseScale(prev => prev === 1 ? 1.1 : 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [measuring]);

  // Start noise measurement
  const startMeasuring = async () => {
    if (!audioContextRef.current || !analyserRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      let startTime = Date.now();
      const duration = 10000; // 10 seconds
      
      const measureNoise = () => {
        if (!measuring) return;
        
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        const db = Math.round(20 * Math.log10(average / 128));
        
        setNoiseLevel(Math.max(0, Math.min(100, db)));
        
        const elapsed = Date.now() - startTime;
        const newProgress = (elapsed / duration) * 100;
        setMeasurementProgress(newProgress);
        
        if (elapsed < duration) {
          requestAnimationFrame(measureNoise);
        } else {
          setMeasuring(false);
          stream.getTracks().forEach(track => track.stop());
        }
      };
      
      measureNoise();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setMeasuring(false);
    }
  };

  const handleMarkerDrag = (newLocation: Location) => {
    setLocation(newLocation);
  };

  const handleSubmit = async () => {
    if (!location || !selectedCategory) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location,
          noiseLevel,
          category: selectedCategory,
          description,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      setShowSuccess(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setCurrentStage('location');
        setNoiseLevel(0);
        setSelectedCategory(null);
        setDescription('');
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStageContent = () => {
    switch (currentStage) {
      case 'location':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Confirm Your Location
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              We need your location to accurately record where the noise pollution is occurring.
              You can drag the marker to adjust your position if needed.
            </p>
            {location && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full h-[400px] rounded-lg overflow-hidden"
              >
                <Map
                  location={location}
                  draggable={true}
                  onMarkerDrag={(newLocation) => {
                    setLocation(newLocation);
                    setIsMarkerDragging(true);
                  }}
                />
              </motion.div>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary w-full"
              onClick={() => setCurrentStage('measure')}
              disabled={!location}
            >
              Confirm Location
            </motion.button>
          </motion.div>
        );

      case 'measure':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Measure Noise Level
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              We'll use your device's microphone to measure the noise level for 10 seconds.
              Please ensure you're in the area where you want to measure the noise.
            </p>
            <div className="relative h-64">
              <svg
                className="w-full h-full"
                viewBox="0 0 200 100"
                style={{ transform: 'rotate(-90deg)' }}
              >
                <motion.circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="8"
                />
                <motion.circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  strokeDasharray={`${noiseLevel * 5.65} 565`}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: noiseLevel / 100 }}
                  transition={{ duration: 0.5 }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0ea5e9" />
                    <stop offset="100%" stopColor="#d946ef" />
                  </linearGradient>
                </defs>
              </svg>
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ transform: 'rotate(90deg)' }}
              >
                <div className="text-center">
                  <motion.span 
                    className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent"
                    animate={{ scale: measuring ? [1, 1.1, 1] : 1 }}
                    transition={{ duration: 1, repeat: measuring ? Infinity : 0 }}
                  >
                    {noiseLevel}
                  </motion.span>
                  <span className="text-xl text-gray-600 dark:text-gray-300">dB</span>
                </div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`btn-primary w-full ${measuring ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={startMeasuring}
              disabled={measuring}
            >
              {measuring ? 'Measuring...' : 'Start Measuring'}
            </motion.button>
            {!measuring && noiseLevel > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary w-full"
                onClick={() => setCurrentStage('categorize')}
              >
                Continue
              </motion.button>
            )}
          </motion.div>
        );

      case 'categorize':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Identify Noise Source
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Please select the primary source of the noise you measured.
              This helps authorities understand the type of noise pollution.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {noiseCategories.map((category) => (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-4 rounded-lg border-2 ${
                    selectedCategory === category.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <span className="text-3xl mb-2 block">{category.icon}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {category.label}
                  </span>
                </motion.button>
              ))}
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Additional Details
              </label>
              <textarea
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                rows={4}
                placeholder="Describe the noise situation..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary w-full"
              onClick={() => setCurrentStage('submit')}
              disabled={!selectedCategory}
            >
              Continue
            </motion.button>
          </motion.div>
        );

      case 'submit':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Review and Submit
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Noise Level</span>
                <span className="font-semibold text-gray-900 dark:text-white">{noiseLevel} dB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Category</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {noiseCategories.find(c => c.id === selectedCategory)?.label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Location</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {location?.lat.toFixed(6)}, {location?.lng.toFixed(6)}
                </span>
              </div>
              {description && (
                <div className="mt-4">
                  <span className="text-gray-600 dark:text-gray-300 block mb-2">Description</span>
                  <p className="text-gray-900 dark:text-white">{description}</p>
                </div>
              )}
            </div>
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary flex-1"
                onClick={() => setCurrentStage('categorize')}
              >
                Back
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary flex-1"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </motion.button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <Logo size="medium" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl"
          >
            Measure Noise Levels
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
          >
            Record and report noise levels in your area to help create a quieter environment.
          </motion.p>
        </div>
        
        {/* Enhanced Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between">
            {stages.map((stage, index) => (
              <div
                key={stage.id}
                className={`flex-1 ${index < stages.length - 1 ? 'relative' : ''}`}
              >
                <motion.div
                  className={`h-2 absolute top-3 left-0 right-0 -z-10 ${
                    stages.findIndex(s => s.id === currentStage) >= index
                      ? 'bg-primary-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                />
                <motion.div
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <motion.div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      stages.findIndex(s => s.id === currentStage) >= index
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {stages.findIndex(s => s.id === currentStage) > index ? (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                      >
                        ✓
                      </motion.span>
                    ) : null}
                  </motion.div>
                  <motion.div 
                    className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-300"
                    animate={{ 
                      color: stages.findIndex(s => s.id === currentStage) >= index 
                        ? "rgb(14, 165, 233)" 
                        : "rgb(75, 85, 99)" 
                    }}
                  >
                    {stage.title}
                  </motion.div>
                </motion.div>
              </div>
            ))}
          </div>
          <motion.div 
            className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-4"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="h-full bg-primary-500 rounded-full"
              style={{ scaleX: smoothProgress }}
            />
          </motion.div>
        </div>

        {/* Stage Content */}
        <motion.div 
          className="card"
          style={{ scale, opacity }}
        >
          <AnimatePresence mode="wait">
            {renderStageContent()}
          </AnimatePresence>
        </motion.div>
        
        {/* Enhanced Success Message */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50"
            >
              <div className="flex items-center">
                <motion.span 
                  className="text-2xl mr-2"
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  ✅
                </motion.span>
                <span>Report submitted successfully!</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Enhanced AI Chat Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-16 h-16 rounded-full bg-primary-500 text-white shadow-lg flex items-center justify-center text-2xl"
        >
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          >
            🤖
          </motion.span>
        </motion.button>
      </motion.div>
    </main>
  );
} 