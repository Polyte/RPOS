import React from 'react';
import { PERFORMANCE_CONFIG } from '../utils/performance-config';

interface OptimizedLoadingScreenProps {
  onComplete?: () => void;
  message?: string;
  showProgress?: boolean;
  timeout?: number;
}

export const OptimizedLoadingScreen: React.FC<OptimizedLoadingScreenProps> = React.memo(({
  onComplete,
  message = "Loading Roxton POS Pro...",
  showProgress = true,
  timeout = PERFORMANCE_CONFIG.LOADING_TIMEOUT
}) => {
  const [progress, setProgress] = React.useState(0);
  const [isComplete, setIsComplete] = React.useState(false);
  const timeoutRef = React.useRef<number>();
  const progressRef = React.useRef<number>();

  React.useEffect(() => {
    if (showProgress) {
      // Smooth progress animation
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / timeout) * 100, 90);
        
        setProgress(progress);
        
        if (progress < 90) {
          progressRef.current = requestAnimationFrame(animate);
        } else {
          setProgress(100);
          setTimeout(() => setIsComplete(true), 200);
        }
      };
      
      progressRef.current = requestAnimationFrame(animate);
    }

    // Auto-complete timeout
    timeoutRef.current = window.setTimeout(() => {
      setProgress(100);
      setIsComplete(true);
    }, timeout);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (progressRef.current) cancelAnimationFrame(progressRef.current);
    };
  }, [showProgress, timeout]);

  React.useEffect(() => {
    if (isComplete && onComplete) {
      // Small delay for smooth transition
      const completeTimeout = setTimeout(onComplete, 300);
      return () => clearTimeout(completeTimeout);
    }
  }, [isComplete, onComplete]);

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= PERFORMANCE_CONFIG.MOBILE_BREAKPOINT;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      {/* Background gradient - simplified for mobile */}
      <div className={`absolute inset-0 ${isMobile ? 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950'}`} />
      
      {/* Loading content */}
      <div className="relative z-10 text-center space-y-8 px-6">
        {/* Logo/Icon */}
        <div className="relative">
          <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-2xl flex items-center justify-center ${isMobile ? '' : 'animate-pulse-glow'}`}>
            <div className="text-white font-bold text-2xl">RP</div>
          </div>
          {!isMobile && (
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-xl animate-pulse" />
          )}
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

        {/* Loading message */}
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground animate-pulse">
            {message}
          </p>

          {/* Progress bar */}
          {showProgress && (
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
          )}

          {/* Loading dots - simplified for mobile */}
          {!showProgress && (
            <div className="flex justify-center space-x-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`w-2 h-2 bg-blue-600 rounded-full ${isMobile ? 'animate-pulse' : 'animate-bounce'}`}
                  style={{ 
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: isMobile ? '1s' : '0.6s'
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Status indicators */}
        <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground max-w-sm mx-auto">
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span>System</span>
          </div>
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span>Database</span>
          </div>
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span>Security</span>
          </div>
        </div>
      </div>

      {/* Completion fade effect */}
      {isComplete && (
        <div className="absolute inset-0 bg-background animate-fade-in z-20" />
      )}
    </div>
  );
});

OptimizedLoadingScreen.displayName = 'OptimizedLoadingScreen';