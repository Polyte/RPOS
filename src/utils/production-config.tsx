// Production Configuration
// This file should be updated with actual company details before deployment

export const PRODUCTION_CONFIG = {
  // Company Information
  COMPANY_NAME: 'Roxton POS Pro',
  COMPANY_ADDRESS: '123 Business Plaza, Sandton City, Johannesburg, 2196, South Africa',
  COMPANY_PHONE: '+27 11 123 4567',
  COMPANY_EMAIL: 'support@roxtonpos.co.za',
  COMPANY_VAT_NUMBER: '4123456789',
  COMPANY_REGISTRATION: 'CK2024/123456/23',
  
  // POS System Configuration
  DEFAULT_TERMINAL_PREFIX: 'POS-',
  VAT_RATE: 0.15, // 15% for South Africa
  CURRENCY: 'ZAR',
  CURRENCY_SYMBOL: 'R',
  
  // Business Rules
  MAX_TRANSACTION_ITEMS: 100,
  AUTO_LOGOUT_MINUTES: 30,
  BACKUP_INTERVAL_MINUTES: 15,
  MAX_CASH_AMOUNT: 50000, // Maximum cash transaction amount
  
  // Receipt Configuration
  RECEIPT_FOOTER_TEXT: 'Thank you for your purchase!',
  RETURN_POLICY_DAYS: 30,
  
  // API Configuration
  API_TIMEOUT_MS: 10000,
  RETRY_ATTEMPTS: 3,
  
  // Security Configuration
  SESSION_TIMEOUT_MINUTES: 60,
  PASSWORD_MIN_LENGTH: 8,
  
  // Feature Flags
  ENABLE_BARCODE_SCANNER: true,
  ENABLE_CASH_PAYMENTS: true,
  ENABLE_CARD_PAYMENTS: true,
  ENABLE_EFT_PAYMENTS: true,
  ENABLE_SPLIT_PAYMENTS: true,
  ENABLE_RECEIPT_PRINTING: true,
  ENABLE_INVENTORY_TRACKING: true,
  
  // System Limits
  MAX_PRODUCTS_PER_CATEGORY: 1000,
  MAX_DAILY_TRANSACTIONS: 10000,
  LOW_STOCK_THRESHOLD: 10,
  
  // Date/Time Configuration
  DATE_FORMAT: 'en-ZA',
  TIME_FORMAT: 'en-ZA',
  TIMEZONE: 'Africa/Johannesburg'
} as const;

// Environment-specific configuration with safe fallbacks
export const getEnvironmentConfig = () => {
  // Default to development environment in this runtime
  let isDevelopment = true;
  let isProduction = false;
  let apiBaseUrl = '/api';
  
  // Try to safely access environment variables
  try {
    // Check if we're in a browser environment with process.env
    if (typeof process !== 'undefined' && process.env) {
      isDevelopment = process.env.NODE_ENV === 'development';
      isProduction = process.env.NODE_ENV === 'production';
      apiBaseUrl = process.env.VITE_API_BASE_URL || '/api';
    }
  } catch (error) {
    // Silently fall back to defaults
  }
  
  return {
    isDevelopment: isDevelopment,
    isProduction: isProduction,
    apiBaseUrl: apiBaseUrl,
    enableDebugLogging: isDevelopment,
    enableAnalytics: isProduction
  };
};

// Validation functions for production readiness
export const validateProductionConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check for placeholder values
  if (PRODUCTION_CONFIG.COMPANY_ADDRESS.includes('[Configure')) {
    errors.push('Company address not configured');
  }
  
  if (PRODUCTION_CONFIG.COMPANY_PHONE.includes('[Configure')) {
    errors.push('Company phone number not configured');
  }
  
  if (PRODUCTION_CONFIG.COMPANY_EMAIL.includes('[Configure')) {
    errors.push('Company email not configured');
  }
  
  if (PRODUCTION_CONFIG.COMPANY_VAT_NUMBER.includes('[Configure')) {
    errors.push('VAT number not configured');
  }
  
  if (PRODUCTION_CONFIG.COMPANY_REGISTRATION.includes('[Configure')) {
    errors.push('Company registration not configured');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Helper function to get terminal ID
export const generateTerminalId = (): string => {
  const saved = localStorage.getItem('roxton-pos-terminal');
  if (saved) return saved;
  
  const terminalNumber = Math.floor(Math.random() * 999) + 1;
  const terminalId = `${PRODUCTION_CONFIG.DEFAULT_TERMINAL_PREFIX}${terminalNumber.toString().padStart(3, '0')}`;
  
  localStorage.setItem('roxton-pos-terminal', terminalId);
  return terminalId;
};

// Helper function to ensure production readiness
export const ensureProductionReadiness = () => {
  const validation = validateProductionConfig();
  const environment = getEnvironmentConfig();
  
  if (!validation.isValid) {
    // Only show warnings in development, suppress in production
    if (environment.isDevelopment) {
      console.info('🔧 Development Mode: Production configuration pending');
      console.info('Configuration items to complete:', validation.errors);
      console.info('Update utils/production-config.tsx before deploying to production');
    } else {
      // In production, log errors but don't throw
      console.error('Production Configuration Issues:', validation.errors);
    }
  } else if (environment.isDevelopment) {
    console.info('✅ Production configuration is complete');
  }
  
  return validation;
};