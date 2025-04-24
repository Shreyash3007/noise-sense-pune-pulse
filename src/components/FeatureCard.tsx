import React, { ReactNode } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="h-full transition-all duration-200 hover:shadow-lg hover:border-purple-200 dark:hover:border-purple-800">
        <CardHeader className="flex items-center justify-center pb-2">
          <div className="rounded-full p-3 bg-purple-100 dark:bg-purple-900/30 mb-4">
            {icon}
          </div>
          <h3 className="text-xl font-bold text-center">{title}</h3>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}; 