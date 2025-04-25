import React, { useState, useEffect } from 'react';
import { Bell, X, Volume2, AlertTriangle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// Define notification types
type NotificationType = 'info' | 'warning' | 'tip';

// Define notification structure
interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  read: boolean;
  date: Date;
}

// Educational notifications about noise pollution awareness
const noiseAwarenessNotifications: Notification[] = [
  {
    id: '1',
    type: 'info',
    title: 'Health Impact of Noise Pollution',
    description: 'Prolonged exposure to noise levels above 70dB can contribute to stress, anxiety, and hearing damage.',
    read: false,
    date: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
  },
  {
    id: '2',
    type: 'warning',
    title: 'Noise Control Regulations',
    description: 'Noise levels in residential areas should not exceed 55dB during the day and 45dB at night as per Pune Municipal guidelines.',
    read: false,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  },
  {
    id: '3',
    type: 'tip',
    title: 'Be a Responsible Citizen',
    description: 'Report excessive noise violations in your area to help authorities maintain a peaceful environment.',
    read: false,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
  },
  {
    id: '4',
    type: 'info',
    title: 'Noise and Sleep Disruption',
    description: 'Nighttime noise can disrupt sleep patterns, affecting memory and cognitive function over time.',
    read: false,
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
  },
  {
    id: '5',
    type: 'tip',
    title: 'Creating Noise Maps',
    description: 'Your noise reports help create accurate city noise maps, allowing for targeted noise reduction policies.',
    read: false,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
  }
];

export const NotificationSystem: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Initialize notifications from local storage or default list
  useEffect(() => {
    const storedNotifications = localStorage.getItem('noiseAwarenessNotifications');
    if (storedNotifications) {
      const parsedNotifications = JSON.parse(storedNotifications).map((note: any) => ({
        ...note,
        date: new Date(note.date)
      }));
      setNotifications(parsedNotifications);
      setUnreadCount(parsedNotifications.filter((n: Notification) => !n.read).length);
    } else {
      setNotifications(noiseAwarenessNotifications);
      setUnreadCount(noiseAwarenessNotifications.length);
      // Save to local storage
      localStorage.setItem('noiseAwarenessNotifications', JSON.stringify(noiseAwarenessNotifications));
    }
  }, []);

  // Mark a notification as read
  const markAsRead = (id: string) => {
    const updatedNotifications = notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    );
    setNotifications(updatedNotifications);
    setUnreadCount(updatedNotifications.filter(n => !n.read).length);
    localStorage.setItem('noiseAwarenessNotifications', JSON.stringify(updatedNotifications));
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({ ...notification, read: true }));
    setNotifications(updatedNotifications);
    setUnreadCount(0);
    localStorage.setItem('noiseAwarenessNotifications', JSON.stringify(updatedNotifications));
  };

  // Get icon based on notification type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'tip':
        return <Info className="h-5 w-5 text-sky-500" />;
      default:
        return <Volume2 className="h-5 w-5 text-primary" />;
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-white">
            {unreadCount}
          </span>
        )}
      </Button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-lg border bg-card shadow-lg sm:w-96"
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="font-medium">Notifications</h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={markAllAsRead}
                    className="text-xs h-8"
                  >
                    Mark all as read
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="max-h-[70vh] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-6">
                  <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-center text-sm text-muted-foreground">
                    No notifications at this time
                  </p>
                </div>
              ) : (
                notifications.map((notification, index) => (
                  <div key={notification.id} className="relative">
                    {index > 0 && <Separator />}
                    <div
                      className={`p-4 ${!notification.read ? 'bg-accent/50' : ''} transition-colors hover:bg-accent/30 cursor-pointer`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 pt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div>
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {notification.title}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(notification.date)}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {notification.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-center border-t p-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs text-muted-foreground"
                asChild
              >
                <a href="/about#noise-pollution" onClick={() => setIsOpen(false)}>
                  Learn more about noise pollution
                </a>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationSystem; 