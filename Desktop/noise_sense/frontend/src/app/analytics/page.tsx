'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '@/components/Navigation';
import dynamic from 'next/dynamic';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { NoiseReport, NoiseCategory, ChartData } from '@/types';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import Logo from '@/components/Logo';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Dynamic import for react-leaflet components
const Map = dynamic(
  () => import('@/components/Map'),
  { ssr: false }
);

// Dynamic import for the heatmap component
const HeatMap = dynamic(
  () => import('@/components/HeatMap'),
  { ssr: false }
);

// Loading skeleton component
const LoadingSkeleton = () => (
  <div className="space-y-8">
    <div className="flex justify-between items-center">
      <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      <div className="flex gap-4">
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      ))}
    </div>
  </div>
);

// Summary statistics component
const SummaryStats = ({ reports }: { reports: NoiseReport[] }) => {
  const stats = {
    totalReports: reports.length,
    averageNoise: reports.reduce((acc, report) => acc + report.noiseLevel, 0) / reports.length || 0,
    mostCommonCategory: Object.entries(
      reports.reduce((acc, report) => {
        acc[report.category] = (acc[report.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {[
        { label: 'Total Reports', value: stats.totalReports },
        { label: 'Average Noise Level', value: `${stats.averageNoise.toFixed(1)} dB` },
        { label: 'Most Common Source', value: stats.mostCommonCategory },
      ].map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
        >
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
        </motion.div>
      ))}
    </div>
  );
};

const getMarkerIcon = (noiseLevel: number) => {
  const color = noiseLevel > 80 ? '#ef4444' : 
               noiseLevel > 70 ? '#f59e0b' : 
               noiseLevel > 60 ? '#10b981' : '#3b82f6';
  
  return new Icon({
    iconUrl: `/markers/${color.substring(1)}.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
};

export default function AnalyticsPage() {
  const [reports, setReports] = useState<NoiseReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [selectedCategory, setSelectedCategory] = useState<NoiseCategory | null>(null);
  const [chartKey, setChartKey] = useState(0); // For forcing chart re-render

  useEffect(() => {
    fetchReports();
  }, [timeRange]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reports?timeRange=${timeRange}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      const data = await response.json();
      setReports(data);
      setChartKey(prev => prev + 1); // Force chart re-render
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeLabels = () => {
    const now = new Date();
    const labels = [];
    const days = timeRange === 'week' ? 7 : 30;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }

    return labels;
  };

  const getNoiseData = () => {
    const labels = getTimeLabels();
    const data = new Array(labels.length).fill(0);
    const counts = new Array(labels.length).fill(0);

    reports.forEach(report => {
      const reportDate = new Date(report.timestamp);
      const today = new Date();
      const diffDays = Math.floor((today.getTime() - reportDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays < (timeRange === 'week' ? 7 : 30)) {
        const index = labels.length - 1 - diffDays;
        if (index >= 0 && index < labels.length) {
          data[index] += report.noiseLevel;
          counts[index]++;
        }
      }
    });

    // Calculate averages
    return data.map((sum, i) => counts[i] > 0 ? sum / counts[i] : 0);
  };

  const getCategoryData = () => {
    const categories: Record<string, number> = {};
    reports.forEach(report => {
      categories[report.category] = (categories[report.category] || 0) + 1;
    });

    return {
      labels: Object.keys(categories).map(cat => 
        cat.charAt(0).toUpperCase() + cat.slice(1)
      ),
      data: Object.values(categories),
    };
  };

  const noiseChartData = {
    labels: getTimeLabels(),
    datasets: [
      {
        label: 'Average Noise Level (dB)',
        data: getNoiseData(),
        borderColor: 'rgb(14, 165, 233)',
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(14, 165, 233)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(14, 165, 233)',
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const categoryChartData = {
    labels: getCategoryData().labels,
    datasets: [
      {
        label: 'Number of Reports',
        data: getCategoryData().data,
        backgroundColor: [
          'rgba(14, 165, 233, 0.7)',
          'rgba(217, 70, 239, 0.7)',
          'rgba(34, 197, 94, 0.7)',
          'rgba(234, 179, 8, 0.7)',
          'rgba(239, 68, 68, 0.7)',
        ],
        borderColor: [
          'rgb(14, 165, 233)',
          'rgb(217, 70, 239)',
          'rgb(34, 197, 94)',
          'rgb(234, 179, 8)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 2,
        borderRadius: 4,
        hoverOffset: 4,
      },
    ],
  };

  const chartOptions: ChartOptions<'line' | 'bar'> = {
    responsive: true,
    animation: {
      duration: 1000,
      easing: 'easeOutQuad',
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#111827',
        bodyColor: '#111827',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: (value) => (typeof value === 'number' ? value.toFixed(1) : value),
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
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
            Noise Analytics
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
          >
            Analyze noise patterns and trends to understand environmental impact.
          </motion.p>
        </div>
        
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingSkeleton />
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Noise Analytics
                </h1>
                <div className="flex gap-4">
                  <select
                    className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 transition-colors duration-200"
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                  >
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                  </select>
                  <select
                    className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 transition-colors duration-200"
                    value={selectedCategory || ''}
                    onChange={(e) => setSelectedCategory(e.target.value as NoiseCategory || null)}
                  >
                    <option value="">All Categories</option>
                    <option value="traffic">Traffic</option>
                    <option value="construction">Construction</option>
                    <option value="event">Events</option>
                    <option value="industrial">Industrial</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <SummaryStats reports={reports} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
                >
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Noise Level Trends
                  </h2>
                  <Line key={chartKey} data={noiseChartData} options={chartOptions} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
                >
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Reports by Category
                  </h2>
                  <Bar key={chartKey} data={categoryChartData} options={chartOptions} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
                >
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Noise Heat Map
                  </h2>
                  <HeatMap reports={reports} />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
} 