import React, { useState, useEffect } from 'react';
import { Loader2Icon, StoreIcon } from 'lucide-react';

interface SimpleLoadingScreenProps {
  onComplete?: () => void;
  duration?: number;
  message?: string;
}

export const SimpleLoadingScreen: React.FC<SimpleLoadingScreenProps> = ({
  onComplete,
  duration = 1500,
  message = "Loading Roxton POS Pro..."
}) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (duration / 100));
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsComplete(true);
          setTimeout(() => {
            onComplete?.();
          }, 300);
          return 100;
        }
        
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
      <div className="text-center space-y-8 px-6">
        {/* Logo */}
        <div className="relative mx-auto">
          <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-2xl flex items-center justify-center ${!isMobile ? 'animate-pulse' : ''}`}>
            <StoreIcon className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Roxton POS Pro
          </h1>
          <p className="text-muted-foreground text-lg">
            Professional Point of Sale System
          </p>
        </div>

        {/* Loading */}
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground animate-pulse">
            {message}
          </p>

          {/* Progress bar */}
          <div className="w-64 mx-auto">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {Math.round(progress)}%
            </div>
          </div>

          {/* Loading spinner */}
          <div className="flex justify-center">
            <Loader2Icon className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
        </div>

        {/* Status indicators */}
        <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground max-w-sm mx-auto">
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>System</span>
          </div>
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            <span>Database</span>
          </div>
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
            <span>Security</span>
          </div>
        </div>
      </div>

      {/* Completion fade effect */}
      {isComplete && (
        <div className="absolute inset-0 bg-background opacity-0 animate-fade-in" />
      )}
    </div>
  );
};

export default SimpleLoadingScreen;