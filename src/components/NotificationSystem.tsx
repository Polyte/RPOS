import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { CheckCircleIcon, XCircleIcon, AlertTriangleIcon, InfoIcon, XIcon } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
}

interface NotificationContextType {
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [exitingNotifications, setExitingNotifications] = useState<Set<string>>(new Set());

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);
    
    if (!notification.persistent) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 5000);
    }
  };

  const removeNotification = (id: string) => {
    // Add to exiting set for animation
    setExitingNotifications(prev => new Set(prev).add(id));
    
    // Remove after animation completes
    setTimeout(() => {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      setExitingNotifications(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }, 300);
  };

  const clearAllNotifications = () => {
    // Add all current notifications to exiting set
    const allIds = notifications.map(n => n.id);
    setExitingNotifications(new Set(allIds));
    
    // Clear all after animation
    setTimeout(() => {
      setNotifications([]);
      setExitingNotifications(new Set());
    }, 300);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return CheckCircleIcon;
      case 'error':
        return XCircleIcon;
      case 'warning':
        return AlertTriangleIcon;
      case 'info':
        return InfoIcon;
      default:
        return InfoIcon;
    }
  };

  const getNotificationStyles = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'notification-success dark:bg-gradient-to-r dark:from-green-900/90 dark:to-emerald-900/90 dark:border-green-500 dark:text-green-100';
      case 'error':
        return 'notification-error dark:bg-gradient-to-r dark:from-red-900/90 dark:to-pink-900/90 dark:border-red-500 dark:text-red-100';
      case 'warning':
        return 'notification-warning dark:bg-gradient-to-r dark:from-yellow-900/90 dark:to-orange-900/90 dark:border-yellow-500 dark:text-yellow-100';
      case 'info':
        return 'notification-info dark:bg-gradient-to-r dark:from-blue-900/90 dark:to-indigo-900/90 dark:border-blue-500 dark:text-blue-100';
      default:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 text-gray-800 dark:from-gray-900/90 dark:to-slate-900/90 dark:border-gray-500 dark:text-gray-100';
    }
  };

  const getIconStyles = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'info':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <NotificationContext.Provider value={{ addNotification, removeNotification, clearAllNotifications }}>
      {children}
      
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-[9999] space-y-4 pointer-events-none max-w-sm min-w-[320px] safe-area-inset">
        {notifications.map((notification, index) => {
          const IconComponent = getNotificationIcon(notification.type);
          const isExiting = exitingNotifications.has(notification.id);
          
          return (
            <div
              key={notification.id}
              className={`pointer-events-auto w-full glass-card-strong border-2 rounded-2xl p-6 shadow-ultimate hover-lift backdrop-blur-lg transition-all duration-300 relative overflow-hidden ${getNotificationStyles(notification.type)} ${
                isExiting 
                  ? 'animate-[notificationSlideOut_0.3s_ease-in-out_forwards]' 
                  : 'animate-[notificationSlideIn_0.5s_ease-out_forwards]'
              }`}
              style={{ animationDelay: isExiting ? '0ms' : `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-xl bg-white/80 dark:bg-black/50 border border-white/20 ${getIconStyles(notification.type)}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-lg mb-1 text-inherit">{notification.title}</h4>
                  {notification.message && (
                    <p className="text-sm opacity-90 leading-relaxed text-inherit">{notification.message}</p>
                  )}
                </div>
                
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="p-1 rounded-lg hover:bg-white/20 dark:hover:bg-black/20 transition-colors duration-200 opacity-60 hover:opacity-100 focus-ring-enhanced flex-shrink-0"
                  aria-label="Close notification"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
              
              {/* Progress bar for non-persistent notifications */}
              {!notification.persistent && (
                <div className="mt-4 h-1.5 bg-white/30 dark:bg-black/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white/60 dark:bg-white/40 rounded-full shadow-sm"
                    style={{ 
                      animation: `notificationProgress ${notification.duration || 5000}ms linear forwards`,
                      transformOrigin: 'right'
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
}