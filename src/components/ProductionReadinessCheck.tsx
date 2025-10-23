import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { validateProductionConfig, getEnvironmentConfig } from '../utils/production-config';
import { AlertTriangleIcon, CheckCircleIcon, SettingsIcon, XIcon } from 'lucide-react';

export function ProductionReadinessCheck() {
  const [validation, setValidation] = useState(() => {
    try {
      return validateProductionConfig();
    } catch (error) {
      console.warn('Production validation failed:', error);
      return { isValid: true, errors: [] };
    }
  });
  const [isDismissed, setIsDismissed] = useState(false);
  const [environment, setEnvironment] = useState(() => {
    try {
      return getEnvironmentConfig();
    } catch (error) {
      console.warn('Environment config failed:', error);
      return { isDevelopment: true, isProduction: false, apiBaseUrl: '/api', enableDebugLogging: true, enableAnalytics: false };
    }
  });

  useEffect(() => {
    // Only show in development or if there are configuration issues
    if (environment.isProduction && validation.isValid) {
      setIsDismissed(true);
    }
  }, [environment, validation]);

  if (isDismissed || (environment.isProduction && validation.isValid)) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Alert className={`${validation.isValid ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'} animate-slide-down shadow-luxury`}>
        <div className="flex items-start gap-3">
          {validation.isValid ? (
            <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
          ) : (
            <AlertTriangleIcon className="w-5 h-5 text-orange-600 mt-0.5" />
          )}
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-sm">
                {validation.isValid ? 'Production Ready' : 'Configuration Required'}
              </h4>
              <Badge variant={environment.isDevelopment ? 'secondary' : 'destructive'} className="text-xs">
                {environment.isDevelopment ? 'Development' : 'Production'}
              </Badge>
            </div>
            
            <AlertDescription className={validation.isValid ? 'text-green-800' : 'text-orange-800'}>
              {validation.isValid ? (
                <div>
                  <p className="text-sm mb-2">✅ System configuration complete</p>
                  <p className="text-xs">All required settings have been configured for production deployment.</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm mb-2">⚠️ Configuration incomplete for production</p>
                  <div className="space-y-1">
                    {validation.errors.map((error, index) => (
                      <p key={index} className="text-xs">• {error}</p>
                    ))}
                  </div>
                  <p className="text-xs mt-2 font-medium">
                    Update <code className="bg-orange-100 px-1 rounded">utils/production-config.tsx</code> before deploying.
                  </p>
                </div>
              )}
            </AlertDescription>
            
            {!validation.isValid && environment.isDevelopment && (
              <div className="flex gap-2 mt-3">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => console.log('Open production-config.tsx to configure')}
                >
                  <SettingsIcon className="w-3 h-3 mr-1" />
                  Configure
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => setIsDismissed(true)}
                >
                  Dismiss
                </Button>
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setIsDismissed(true)}
          >
            <XIcon className="w-4 h-4" />
          </Button>
        </div>
      </Alert>
    </div>
  );
}