import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { TooltipProvider } from "./components/ui/tooltip";
import { LoadingScreen } from "./components/LoadingScreen";
import { SimpleLoadingScreen } from "./components/SimpleLoadingScreen";
import { LoginScreen } from "./components/LoginScreen";
import { AppHeader } from "./components/AppHeader";
import { NotificationProvider, useNotifications } from "./components/NotificationSystem";
import { ThemeProvider, ThemeToggle } from "./components/ThemeProvider";
import { AppTransitionOverlay } from "./components/AppTransitionOverlay";
import { ErrorBoundary } from "./components/ErrorBoundary";
import {
  type AppState,
  type SystemStatus,
  STORAGE_KEYS,
  LOADING_DURATION,
  TRANSITION_DURATION,
} from "./utils/app-constants";
import {
  getDisplayName,
  createUserData,
} from "./utils/app-helpers";
import { systemLogger, safeLog } from "./utils/system-logger";

// Lazy load heavy components for better performance
const CashierInterface = lazy(() => 
  import("./components/CashierInterface").then(module => ({ 
    default: module.CashierInterface 
  }))
);
const AdminInterface = lazy(() => 
  import("./components/AdminInterface").then(module => ({ 
    default: module.AdminInterface 
  }))
);
const ManagerInterface = lazy(() => 
  import("./components/ManagerInterface").then(module => ({ 
    default: module.ManagerInterface 
  }))
);
const StockInterface = lazy(() => 
  import("./components/StockInterface").then(module => ({ 
    default: module.StockInterface 
  }))
);
const SupervisorInterface = lazy(() => 
  import("./components/SupervisorInterface").then(module => ({ 
    default: module.SupervisorInterface 
  }))
);
const MultitenantManagerInterface = lazy(() => 
  import("./components/MultitenantManagerInterface").then(module => ({ 
    default: module.MultitenantManagerInterface 
  }))
);
const ProductionReadinessCheck = lazy(() => 
  import("./components/ProductionReadinessCheck").then(module => ({ 
    default: module.ProductionReadinessCheck 
  }))
);

// Simple mobile setup without complex performance monitoring
const setupMobileViewport = () => {
  // Set viewport height variable for mobile browsers
  const setVH = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  setVH();
  
  // Update on resize and orientation change
  let resizeTimer: number;
  const handleResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(setVH, 100);
  };
  
  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', () => setTimeout(setVH, 200));
  
  // Add essential mobile meta tags
  const viewport = document.querySelector('meta[name="viewport"]') || document.createElement('meta');
  viewport.setAttribute('name', 'viewport');
  viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
  if (!document.querySelector('meta[name="viewport"]')) {
    document.head.appendChild(viewport);
  }
  
  // Return cleanup function
  return () => {
    window.removeEventListener('resize', handleResize);
    clearTimeout(resizeTimer);
  };
};

// Safe localStorage utilities
const safeLocalStorage = {
  get: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },
  remove: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }
};

// Memoized interface component without header (header is now separate)
const InterfaceComponent = React.memo<{ role: string; onLogout: () => void }>(({ role, onLogout }) => {
  const fallback = <SimpleLoadingScreen message={`Loading ${role.charAt(0).toUpperCase() + role.slice(1)} Interface...`} />;
  
  // Remove header from interfaces since it's now handled at app level
  const interfaceProps = { onLogout, showHeader: false };
  
  switch (role) {
    case 'cashier':
      return (
        <Suspense fallback={fallback}>
          <CashierInterface {...interfaceProps} />
        </Suspense>
      );
    case 'admin':
      return (
        <Suspense fallback={fallback}>
          <AdminInterface {...interfaceProps} />
        </Suspense>
      );
    case 'manager':
      return (
        <Suspense fallback={fallback}>
          <ManagerInterface {...interfaceProps} />
        </Suspense>
      );
    case 'stock':
      return (
        <Suspense fallback={fallback}>
          <StockInterface {...interfaceProps} />
        </Suspense>
      );
    case 'supervisor':
      return (
        <Suspense fallback={fallback}>
          <SupervisorInterface {...interfaceProps} />
        </Suspense>
      );
    case 'multitenant_manager':
      return (
        <Suspense fallback={fallback}>
          <MultitenantManagerInterface {...interfaceProps} />
        </Suspense>
      );
    default:
      return null;
  }
});

InterfaceComponent.displayName = 'InterfaceComponent';

function AppContent() {
  const [appState, setAppState] = useState<AppState>({
    currentRole: null,
    isLoading: true,
    user: null
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobileReady, setIsMobileReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const { addNotification } = useNotifications();

  // Update current time every minute
  useEffect(() => {
    const updateTime = () => setCurrentTime(new Date());
    const interval = setInterval(updateTime, 60000); // Update every minute
    updateTime(); // Set initial time
    
    return () => clearInterval(interval);
  }, []);

  // Initialize mobile viewport on mount
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    try {
      cleanup = setupMobileViewport();
      setIsMobileReady(true);
    } catch (error) {
      console.warn('Mobile setup failed:', error);
      setIsMobileReady(true); // Continue anyway
    }
    
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  // Load saved session
  useEffect(() => {
    if (!isMobileReady) return;
    
    // Log app initialization (this will use fallback logging since no user context yet)
    safeLog('APP_INITIALIZED', 'Roxton POS Pro application started', 'system', 'info', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    });
    
    const loadSession = () => {
      try {
        const savedRole = safeLocalStorage.get(STORAGE_KEYS.ROLE);
        const savedUserJson = safeLocalStorage.get(STORAGE_KEYS.USER);
        
        if (savedRole && savedUserJson) {
          const userData = JSON.parse(savedUserJson);
          if (userData?.name && userData?.role) {
            // Initialize system logger for existing session
            systemLogger.initialize({
              tenantId: 'default_tenant',
              tenantName: 'Default Tenant',
              userId: userData.id,
              userName: userData.name,
              userRole: userData.role,
              sessionId: `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              ipAddress: '192.168.1.100',
              userAgent: navigator.userAgent
            });
            
            // Log session restoration
            safeLog('SESSION_RESTORED', 'User session restored from storage', 'login', 'info', {
              restoredRole: savedRole,
              restoredUser: userData.name
            });
            
            setAppState({
              currentRole: savedRole,
              isLoading: false,
              user: userData
            });
            return;
          }
        }
      } catch (error) {
        console.warn('Session load error:', error);
        // Log the session load error
        safeLog('SESSION_LOAD_ERROR', `Failed to load saved session: ${error}`, 'error', 'warning', {
          error: error instanceof Error ? error.message : String(error)
        });
        // Clear corrupted data
        safeLocalStorage.remove(STORAGE_KEYS.ROLE);
        safeLocalStorage.remove(STORAGE_KEYS.USER);
      }
      
      // No valid session found, finish loading
      setTimeout(() => {
        setAppState(prev => ({ ...prev, isLoading: false }));
      }, Math.min(LOADING_DURATION, 1500));
    };
    
    loadSession();
  }, [isMobileReady]);

  // Handle role selection
  const handleRoleSelect = useCallback((role: string) => {
    setIsTransitioning(true);
    const userData = createUserData(role);

    setTimeout(() => {
      setAppState({
        currentRole: role,
        isLoading: false,
        user: userData
      });
      setIsTransitioning(false);
      
      // Save session
      safeLocalStorage.set(STORAGE_KEYS.ROLE, role);
      safeLocalStorage.set(STORAGE_KEYS.USER, JSON.stringify(userData));
      
      // Initialize system logger
      systemLogger.initialize({
        tenantId: 'default_tenant',
        tenantName: 'Default Tenant',
        userId: userData.id,
        userName: userData.name,
        userRole: userData.role,
        sessionId: `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ipAddress: '192.168.1.100', // In real app, this would come from server
        userAgent: navigator.userAgent
      });
      
      // Log the login
      systemLogger.logLogin('password');
      
      addNotification({
        type: 'success',
        title: 'Welcome to Roxton POS Pro',
        message: `Successfully logged in as ${getDisplayName(role)}`,
        duration: 3000
      });
    }, Math.min(TRANSITION_DURATION, 800));
  }, [addNotification]);

  // Handle logout
  const handleLogout = useCallback(() => {
    setIsTransitioning(true);
    
    // Log the logout if logger is initialized
    if (systemLogger.isInitialized()) {
      systemLogger.logLogout('user_initiated');
    }
    
    addNotification({
      type: 'info',
      title: 'Logging out...',
      message: 'Your session has been ended securely',
      duration: 2000
    });

    setTimeout(() => {
      setAppState({
        currentRole: null,
        isLoading: false,
        user: null
      });
      setIsTransitioning(false);
      
      // Clear logger context
      systemLogger.clearContext();
      
      // Clear session
      safeLocalStorage.remove(STORAGE_KEYS.ROLE);
      safeLocalStorage.remove(STORAGE_KEYS.USER);
    }, Math.min(TRANSITION_DURATION, 800));
  }, [addNotification]);

  // Memoized container classes
  const containerClasses = useMemo(() => {
    const baseClasses = "min-h-screen min-h-[100vh] min-h-[calc(var(--vh,1vh)*100)] transition-all duration-300";
    const transitionClasses = isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100';
    return `${baseClasses} ${transitionClasses}`;
  }, [isTransitioning]);

  // Check if desktop for production readiness check
  const isDesktop = useMemo(() => 
    typeof window !== 'undefined' && window.innerWidth > 768,
    []
  );

  // Create mock system status for header
  const systemStatus: SystemStatus = useMemo(() => ({
    online: true,
    serverStatus: 'online',
    databaseStatus: 'connected',
    lastSync: new Date(),
    version: '1.0.0',
    uptime: '24h 15m',
    activeUsers: 3,
    systemLoad: 45,
    memoryUsage: 62,
    diskSpace: 78
  }), []);

  // Show loading screen while initializing
  if (!isMobileReady || appState.isLoading) {
    return (
      <SimpleLoadingScreen 
        onComplete={() => setAppState(prev => ({ ...prev, isLoading: false }))}
        duration={1500}
        message="Initializing Roxton POS Pro..."
      />
    );
  }

  // Show login screen
  if (!appState.currentRole) {
    return (
      <div className={containerClasses}>
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <LoginScreen onRoleSelect={handleRoleSelect} />
      </div>
    );
  }

  // Main application interface with header
  return (
    <TooltipProvider>
      <div className={containerClasses}>
        {/* Production check only on desktop */}
        {isDesktop && (
          <Suspense fallback={null}>
            <ProductionReadinessCheck />
          </Suspense>
        )}
        
        {/* Full-Width Header */}
        <AppHeader 
          appState={appState}
          systemStatus={systemStatus}
          currentTime={currentTime}
          onLogout={handleLogout}
        />
        
        {/* Main Content Container */}
        <div className="relative animate-fade-in">
          <ErrorBoundary maxRetries={2}>
            <div className="animate-slide-up">
              {/* Main content without top padding since header is sticky */}
              <div className="w-full">
                <InterfaceComponent role={appState.currentRole} onLogout={handleLogout} />
              </div>
            </div>
          </ErrorBoundary>
        </div>

        {/* Loading Overlay for Transitions */}
        <AppTransitionOverlay isVisible={isTransitioning} />
      </div>
    </TooltipProvider>
  );
}

// Memoized main app component
const MemoizedAppContent = React.memo(AppContent);

// Main App component
export default function App() {
  return (
    <ErrorBoundary 
      maxRetries={3}
      onError={(error, errorInfo) => {
        // Simple error logging
        if (process.env.NODE_ENV === 'development') {
          console.error('App Error:', {
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            timestamp: new Date().toISOString(),
            userAgent: navigator?.userAgent || 'Unknown'
          });
        }
      }}
    >
      <ThemeProvider>
        <NotificationProvider>
          <div className="theme-transition custom-scrollbar">
            <MemoizedAppContent />
          </div>
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}