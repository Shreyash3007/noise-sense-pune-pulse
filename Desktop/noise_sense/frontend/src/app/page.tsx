import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Image from 'next/image';
import Link from 'next/link';
import Logo from '@/components/Logo';

const timelineSteps = [
  {
    title: 'Measure Noise',
    description: 'Use your device\'s microphone to measure noise levels in your surroundings.',
    icon: '🎤',
  },
  {
    title: 'Identify Source',
    description: 'Categorize the source of noise pollution (traffic, construction, events, etc.).',
    icon: '🔍',
  },
  {
    title: 'Generate Report',
    description: 'Get detailed analysis with visualizations and recommendations.',
    icon: '📊',
  },
  {
    title: 'Take Action',
    description: 'Submit reports to authorities and track improvements over time.',
    icon: '✅',
  },
];

const noiseHarms = [
  {
    title: 'Health Impact',
    description: 'Prolonged exposure to noise pollution can lead to stress, sleep disorders, and cardiovascular issues.',
    icon: '🏥',
  },
  {
    title: 'Mental Well-being',
    description: 'High noise levels affect concentration, productivity, and mental health.',
    icon: '🧠',
  },
  {
    title: 'Environmental Effects',
    description: 'Noise pollution disrupts wildlife habitats and natural ecosystems.',
    icon: '🌳',
  },
  {
    title: 'Quality of Life',
    description: 'Excessive noise reduces property values and affects community well-being.',
    icon: '🏠',
  },
];

export default function Home() {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  
  // Transform values for parallax effects
  const y = useTransform(smoothProgress, [0, 1], [0, -100]);
  const opacity = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [1, 0.8, 0.8, 0]);
  const scale = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [1, 0.95, 0.95, 0.9]);
  
  // Phone timeline animation
  const phoneY = useTransform(smoothProgress, [0, 1], [0, -400]);
  const phoneOpacity = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [1, 1, 1, 0.8]);
  
  // Timeline step animations
  const timelineStep1Opacity = useTransform(smoothProgress, [0, 0.1, 0.2], [0, 1, 0]);
  const timelineStep2Opacity = useTransform(smoothProgress, [0.2, 0.3, 0.4], [0, 1, 0]);
  const timelineStep3Opacity = useTransform(smoothProgress, [0.4, 0.5, 0.6], [0, 1, 0]);
  const timelineStep4Opacity = useTransform(smoothProgress, [0.6, 0.7, 0.8], [0, 1, 0]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-8"
          >
            <Logo size="large" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl"
          >
            <span className="block">Monitor and Analyze</span>
            <span className="block text-blue-600 dark:text-blue-400">Noise Pollution</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
          >
            NoiseSense helps you measure, track, and analyze noise levels in your environment. 
            Make data-driven decisions to improve your surroundings.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8"
          >
            <div className="rounded-md shadow">
              <Link
                href="/measure"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                Start Measuring
              </Link>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <Link
                href="/analytics"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
              >
                View Analytics
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Phone Timeline Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50 relative">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Phone Mockup with Timeline */}
              <motion.div 
                className="relative h-[600px]"
                style={{ y: phoneY, opacity: phoneOpacity }}
              >
                <motion.div
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="relative w-[300px] h-[600px] mx-auto">
                    <div className="absolute inset-0 bg-black rounded-[40px] shadow-xl">
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-7 bg-black rounded-b-3xl" />
                    </div>
                    <div className="absolute inset-2 bg-white dark:bg-gray-900 rounded-[35px] overflow-hidden">
                      {/* App Screen Content */}
                      <div className="h-full w-full bg-gradient-to-b from-primary-500/10 to-secondary-500/10">
                        {/* Timeline Steps */}
                        <motion.div style={{ opacity: timelineStep1Opacity }} className="p-4 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center space-x-4">
                            <span className="text-3xl">{timelineSteps[0].icon}</span>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {timelineSteps[0].title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {timelineSteps[0].description}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                        
                        <motion.div style={{ opacity: timelineStep2Opacity }} className="p-4 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center space-x-4">
                            <span className="text-3xl">{timelineSteps[1].icon}</span>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {timelineSteps[1].title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {timelineSteps[1].description}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                        
                        <motion.div style={{ opacity: timelineStep3Opacity }} className="p-4 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center space-x-4">
                            <span className="text-3xl">{timelineSteps[2].icon}</span>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {timelineSteps[2].title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {timelineSteps[2].description}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                        
                        <motion.div style={{ opacity: timelineStep4Opacity }} className="p-4">
                          <div className="flex items-center space-x-4">
                            <span className="text-3xl">{timelineSteps[3].icon}</span>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {timelineSteps[3].title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {timelineSteps[3].description}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Content */}
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-3xl sm:text-4xl font-bold mb-6 bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                    How It Works
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                    Our intuitive app guides you through the process of measuring and reporting noise pollution.
                    Follow these simple steps to make a difference in your community.
                  </p>
                  
                  <div className="space-y-6">
                    {timelineSteps.map((step, index) => (
                      <motion.div
                        key={step.title}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.2 }}
                        viewport={{ once: true }}
                        className="flex items-start space-x-4"
                      >
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-2xl">
                          {step.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                            {step.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300">
                            {step.description}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Noise Pollution Harms Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                Understanding Noise Pollution
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Noise pollution is more than just an annoyance. It has significant impacts on our health,
                well-being, and environment.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {noiseHarms.map((harm, index) => (
                <motion.div
                  key={harm.title}
                  className="card group hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <div className="p-6">
                    <motion.span 
                      className="text-4xl mb-4 block"
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {harm.icon}
                    </motion.span>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors">
                      {harm.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {harm.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                Powerful Features
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Our app provides comprehensive tools to monitor, analyze, and combat noise pollution.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-2xl mb-4">
                  📊
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  Real-time Analytics
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  View noise pollution trends with interactive charts and heatmaps to identify problem areas.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-2xl mb-4">
                  ��
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  Automated Reports
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Generate and send detailed reports to local authorities in multiple formats (CSV, Excel, PDF).
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-2xl mb-4">
                  🤖
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  AI Assistant
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Get help and answers to your questions about noise pollution and how to use the app.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-500 to-secondary-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-white">
                Ready to Make a Difference?
              </h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Join thousands of citizens who are already contributing to a quieter,
                healthier environment.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/measure"
                  className="inline-block bg-white text-primary-500 font-semibold px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Start Measuring Now
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
        
        {/* AI Chat Button */}
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
            🤖
          </motion.button>
        </motion.div>
      </div>
    </main>
  );
} 