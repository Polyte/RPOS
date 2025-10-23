import { useState, useEffect } from 'react';
import { Loader2Icon, StoreIcon, SparklesIcon } from 'lucide-react';

interface LoadingScreenProps {
  onComplete?: () => void;
  duration?: number;
  message?: string;
}

export function LoadingScreen({ onComplete, duration = 3000, message = "Initializing Roxton POS Pro..." }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(message);
  
  const loadingMessages = [
    "Initializing Roxton POS Pro...",
    "Loading security protocols...",
    "Connecting to payment systems...",
    "Preparing user interface...",
    "System ready!"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (duration / 100));
        
        // Update message based on progress
        const messageIndex = Math.floor((newProgress / 100) * (loadingMessages.length - 1));
        setCurrentMessage(loadingMessages[messageIndex] || loadingMessages[loadingMessages.length - 1]);
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete?.();
          }, 500);
          return 100;
        }
        
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center z-50 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-green-400/20 to-blue-600/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-2xl animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
        
        {/* Floating particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 text-center max-w-md mx-auto px-8">
        {/* Logo Section */}
        <div className="mb-12 animate-scale-in">
          <div className="relative mx-auto w-32 h-32 mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-ultimate animate-morphing"></div>
            <div className="absolute inset-2 bg-white/10 rounded-2xl backdrop-blur-sm flex items-center justify-center">
              <StoreIcon className="w-16 h-16 text-white animate-pulse-glow" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-bounce-soft flex items-center justify-center">
              <SparklesIcon className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-4 animate-typewriter overflow-hidden whitespace-nowrap border-r-2 border-blue-400">
            Roxton POS Pro
          </h1>
          <p className="text-xl text-blue-200 animate-fade-in" style={{ animationDelay: '1s' }}>
            Professional Point of Sale System
          </p>
        </div>
        
        {/* Loading Section */}
        <div className="space-y-8 animate-slide-up" style={{ animationDelay: '1.5s' }}>
          {/* Spinner */}
          <div className="flex justify-center">
            <div className="relative">
              <Loader2Icon className="w-12 h-12 text-blue-400 animate-spin" />
              <div className="absolute inset-0 rounded-full border-2 border-blue-400/20"></div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full max-w-sm mx-auto">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-blue-200 font-medium">Loading...</span>
              <span className="text-sm text-blue-200 font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out shadow-luxury"
                style={{ width: `${progress}%` }}
              >
                <div className="h-full bg-white/20 animate-shimmer"></div>
              </div>
            </div>
          </div>
          
          {/* Loading Message */}
          <div className="min-h-[2rem] flex items-center justify-center">
            <p className="text-blue-100 text-lg font-medium animate-pulse">
              {currentMessage}
            </p>
          </div>
          
          {/* Loading Dots */}
          <div className="flex justify-center space-x-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 bg-blue-400 rounded-full loading-dots"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-16 animate-fade-in" style={{ animationDelay: '2s' }}>
          <div className="flex items-center justify-center gap-6 text-blue-300 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Secure</span>
            </div>
            <div className="w-1 h-1 bg-blue-300 rounded-full"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <span>Reliable</span>
            </div>
            <div className="w-1 h-1 bg-blue-300 rounded-full"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              <span>Professional</span>
            </div>
          </div>
          
          <p className="text-blue-400 text-sm mt-4 opacity-60">
            © 2025 Roxton POS Pro • Version 2.0
          </p>
        </div>
      </div>
    </div>
  );
}

interface MiniLoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function MiniLoading({ message = "Loading...", size = 'md' }: MiniLoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className="flex items-center gap-3 text-blue-600">
      <Loader2Icon className={`${sizeClasses[size]} animate-spin`} />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}