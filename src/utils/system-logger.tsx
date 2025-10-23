export interface SystemLogEntry {
  id: string;
  timestamp: string;
  tenantId: string;
  tenantName: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  description: string;
  category: 'login' | 'logout' | 'transaction' | 'system' | 'error' | 'security' | 'inventory' | 'user_management' | 'support' | 'api' | 'performance';
  severity: 'info' | 'warning' | 'error' | 'critical';
  ipAddress: string;
  userAgent: string;
  sessionId?: string;
  metadata?: any;
  duration?: number;
  source: 'web' | 'mobile' | 'api' | 'system';
  geolocation?: {
    country?: string;
    region?: string;
    city?: string;
  };
}

export interface LoggerContext {
  tenantId: string;
  tenantName: string;
  userId: string;
  userName: string;
  userRole: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
}

class SystemLogger {
  private context: LoggerContext | null = null;
  private sessionStartTime: number = 0;
  private performanceMetrics: Map<string, number> = new Map();

  /**
   * Initialize the logger with user context
   */
  public initialize(context: LoggerContext): void {
    this.context = context;
    this.sessionStartTime = Date.now();
    
    // Log session start
    this.log('SESSION_START', 'User session initiated', 'login', 'info', {
      sessionStartTime: new Date().toISOString(),
      browserInfo: this.getBrowserInfo()
    });
  }

  /**
   * Log a user action or system event
   */
  public log(
    action: string,
    description: string,
    category: SystemLogEntry['category'],
    severity: SystemLogEntry['severity'] = 'info',
    metadata?: any,
    duration?: number
  ): void {
    if (!this.context) {
      // Fallback logging when context is not available
      this.logWithoutContext(action, description, category, severity, metadata, duration);
      return;
    }

    const logEntry: SystemLogEntry = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      tenantId: this.context.tenantId,
      tenantName: this.context.tenantName,
      userId: this.context.userId,
      userName: this.context.userName,
      userRole: this.context.userRole,
      action: action,
      description: description,
      category: category,
      severity: severity,
      ipAddress: this.context.ipAddress || this.getClientIP(),
      userAgent: this.context.userAgent || navigator.userAgent,
      sessionId: this.context.sessionId || this.generateSessionId(),
      metadata: metadata,
      duration: duration,
      source: 'web',
      geolocation: this.getGeolocation()
    };

    this.persistLog(logEntry);
    this.sendToRealTimeMonitoring(logEntry);
    
    // In development, also log to console
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${severity.toUpperCase()}] ${action}: ${description}`, logEntry);
    }
  }

  /**
   * Log user login
   */
  public logLogin(loginMethod: 'password' | 'sso' | 'token' = 'password'): void {
    this.log('USER_LOGIN', `User logged in via ${loginMethod}`, 'login', 'info', {
      loginMethod,
      loginTime: new Date().toISOString(),
      sessionDuration: 0
    });
  }

  /**
   * Log user logout
   */
  public logLogout(reason: 'user_initiated' | 'timeout' | 'forced' = 'user_initiated'): void {
    if (!this.context) {
      console.warn('SystemLogger: Cannot log logout - context not initialized');
      return;
    }
    
    const sessionDuration = Date.now() - this.sessionStartTime;
    this.log('USER_LOGOUT', `User logged out (${reason})`, 'logout', 'info', {
      logoutReason: reason,
      sessionDuration: sessionDuration,
      logoutTime: new Date().toISOString()
    });
  }

  /**
   * Log transaction events
   */
  public logTransaction(
    transactionId: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VOID',
    details: any
  ): void {
    this.log(
      `TRANSACTION_${action}`,
      `Transaction ${action.toLowerCase()}: ${transactionId}`,
      'transaction',
      'info',
      { transactionId, ...details }
    );
  }

  /**
   * Log inventory changes
   */
  public logInventory(
    productId: string,
    action: 'ADD' | 'REMOVE' | 'UPDATE' | 'COUNT',
    details: any
  ): void {
    this.log(
      `INVENTORY_${action}`,
      `Inventory ${action.toLowerCase()} for product ${productId}`,
      'inventory',
      'info',
      { productId, ...details }
    );
  }

  /**
   * Log errors
   */
  public logError(
    error: Error | string,
    context?: string,
    metadata?: any
  ): void {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    this.log(
      'ERROR_OCCURRED',
      `Error: ${errorMessage}${context ? ` in ${context}` : ''}`,
      'error',
      'error',
      {
        errorMessage,
        errorStack,
        context,
        ...metadata
      }
    );
  }

  /**
   * Log security events
   */
  public logSecurity(
    event: 'FAILED_LOGIN' | 'PERMISSION_DENIED' | 'SUSPICIOUS_ACTIVITY' | 'DATA_ACCESS',
    description: string,
    metadata?: any
  ): void {
    this.log(
      `SECURITY_${event}`,
      description,
      'security',
      event === 'FAILED_LOGIN' || event === 'SUSPICIOUS_ACTIVITY' ? 'warning' : 'info',
      metadata
    );
  }

  /**
   * Log user management actions
   */
  public logUserManagement(
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'PERMISSION_CHANGE',
    targetUserId: string,
    targetUserName: string,
    details?: any
  ): void {
    this.log(
      `USER_${action}`,
      `User management: ${action.toLowerCase()} user ${targetUserName}`,
      'user_management',
      'info',
      { targetUserId, targetUserName, ...details }
    );
  }

  /**
   * Log API calls
   */
  public logAPI(
    endpoint: string,
    method: string,
    statusCode: number,
    duration: number,
    metadata?: any
  ): void {
    const severity = statusCode >= 400 ? 'error' : statusCode >= 300 ? 'warning' : 'info';
    
    this.log(
      'API_CALL',
      `${method} ${endpoint} - ${statusCode}`,
      'api',
      severity,
      { endpoint, method, statusCode, ...metadata },
      duration
    );
  }

  /**
   * Start performance measurement
   */
  public startPerformanceTimer(label: string): void {
    this.performanceMetrics.set(label, Date.now());
  }

  /**
   * End performance measurement and log
   */
  public endPerformanceTimer(label: string, description?: string): void {
    const startTime = this.performanceMetrics.get(label);
    if (startTime) {
      const duration = Date.now() - startTime;
      this.performanceMetrics.delete(label);
      
      this.log(
        'PERFORMANCE_METRIC',
        description || `Performance metric: ${label}`,
        'performance',
        duration > 5000 ? 'warning' : 'info',
        { performanceLabel: label },
        duration
      );
    }
  }

  /**
   * Get session statistics
   */
  public getSessionStats(): any {
    const sessionDuration = Date.now() - this.sessionStartTime;
    const logs = this.getLogs();
    const currentSessionLogs = logs.filter(log => 
      log.sessionId === this.context?.sessionId && 
      new Date(log.timestamp).getTime() >= this.sessionStartTime
    );

    return {
      sessionDuration,
      totalActions: currentSessionLogs.length,
      errorCount: currentSessionLogs.filter(log => log.severity === 'error').length,
      warningCount: currentSessionLogs.filter(log => log.severity === 'warning').length,
      categoryBreakdown: this.getCategoryBreakdown(currentSessionLogs),
      averageActionTime: this.getAverageActionTime(currentSessionLogs)
    };
  }

  /**
   * Get all logs (for admin interfaces)
   */
  public getLogs(limit: number = 1000): SystemLogEntry[] {
    try {
      const logs = JSON.parse(localStorage.getItem('roxton-pos-system-logs') || '[]');
      return logs.slice(0, limit);
    } catch (error) {
      console.error('Error retrieving logs:', error);
      return [];
    }
  }

  /**
   * Clear old logs (keep last N logs)
   */
  public cleanupLogs(keepCount: number = 5000): void {
    try {
      const logs = this.getLogs();
      const cleanedLogs = logs.slice(0, keepCount);
      localStorage.setItem('roxton-pos-system-logs', JSON.stringify(cleanedLogs));
      
      this.log('SYSTEM_MAINTENANCE', `Cleaned up logs, kept ${cleanedLogs.length} entries`, 'system', 'info', {
        logsRemoved: logs.length - cleanedLogs.length,
        logsKept: cleanedLogs.length
      });
    } catch (error) {
      console.error('Error cleaning up logs:', error);
    }
  }

  /**
   * Export logs for analysis
   */
  public exportLogs(format: 'json' | 'csv' = 'json'): string {
    const logs = this.getLogs();
    
    if (format === 'csv') {
      const headers = ['Timestamp', 'Tenant', 'User', 'Role', 'Action', 'Description', 'Category', 'Severity'];
      const csvContent = [
        headers.join(','),
        ...logs.map(log => [
          log.timestamp,
          log.tenantName,
          log.userName,
          log.userRole,
          log.action,
          `"${log.description.replace(/"/g, '""')}"`,
          log.category,
          log.severity
        ].join(','))
      ].join('\n');
      
      return csvContent;
    }
    
    return JSON.stringify(logs, null, 2);
  }

  /**
   * Clear logger context (useful for logout)
   */
  public clearContext(): void {
    this.context = null;
    this.sessionStartTime = 0;
    this.performanceMetrics.clear();
  }

  /**
   * Check if logger is initialized
   */
  public isInitialized(): boolean {
    return this.context !== null;
  }

  /**
   * Fallback logging when context is not available
   */
  private logWithoutContext(
    action: string,
    description: string,
    category: SystemLogEntry['category'],
    severity: SystemLogEntry['severity'] = 'info',
    metadata?: any,
    duration?: number
  ): void {
    // Create a minimal log entry for system events without user context
    const logEntry: SystemLogEntry = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      tenantId: 'system',
      tenantName: 'System',
      userId: 'system',
      userName: 'System',
      userRole: 'system',
      action: action,
      description: description,
      category: category,
      severity: severity,
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      sessionId: 'system',
      metadata: metadata,
      duration: duration,
      source: 'web',
      geolocation: this.getGeolocation()
    };

    this.persistLog(logEntry);
    
    // In development, also log to console
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${severity.toUpperCase()}] ${action}: ${description}`, logEntry);
    }
  }

  // Private methods
  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getClientIP(): string {
    // In a real application, this would be determined server-side
    return '192.168.1.100';
  }

  private getGeolocation(): SystemLogEntry['geolocation'] {
    // In a real application, this would use IP geolocation services
    return {
      country: 'South Africa',
      region: 'Gauteng',
      city: 'Johannesburg'
    };
  }

  private getBrowserInfo(): any {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }

  private persistLog(logEntry: SystemLogEntry): void {
    try {
      const existingLogs = JSON.parse(localStorage.getItem('roxton-pos-system-logs') || '[]');
      existingLogs.unshift(logEntry);
      
      // Keep only the last 10,000 logs to prevent storage overflow
      const trimmedLogs = existingLogs.slice(0, 10000);
      localStorage.setItem('roxton-pos-system-logs', JSON.stringify(trimmedLogs));
    } catch (error) {
      console.error('Error persisting log:', error);
    }
  }

  private sendToRealTimeMonitoring(logEntry: SystemLogEntry): void {
    // In a real application, this would send logs to a real-time monitoring service
    // For demo purposes, we'll just store in a separate monitoring queue
    try {
      const monitoringQueue = JSON.parse(localStorage.getItem('roxton-pos-monitoring-queue') || '[]');
      monitoringQueue.unshift(logEntry);
      
      // Keep only the last 100 entries for real-time monitoring
      const trimmedQueue = monitoringQueue.slice(0, 100);
      localStorage.setItem('roxton-pos-monitoring-queue', JSON.stringify(trimmedQueue));
    } catch (error) {
      console.error('Error sending to monitoring:', error);
    }
  }

  private getCategoryBreakdown(logs: SystemLogEntry[]): Record<string, number> {
    return logs.reduce((breakdown, log) => {
      breakdown[log.category] = (breakdown[log.category] || 0) + 1;
      return breakdown;
    }, {} as Record<string, number>);
  }

  private getAverageActionTime(logs: SystemLogEntry[]): number {
    const logsWithDuration = logs.filter(log => log.duration);
    if (logsWithDuration.length === 0) return 0;
    
    const totalDuration = logsWithDuration.reduce((sum, log) => sum + (log.duration || 0), 0);
    return totalDuration / logsWithDuration.length;
  }
}

// Create and export a singleton instance
export const systemLogger = new SystemLogger();

// Helper functions for common logging patterns
export const logUserAction = (action: string, description: string, metadata?: any) => {
  try {
    systemLogger.log(action, description, 'system', 'info', metadata);
  } catch (error) {
    console.warn('Failed to log user action:', error);
  }
};

export const logBusinessAction = (action: string, description: string, metadata?: any) => {
  try {
    systemLogger.log(action, description, 'transaction', 'info', metadata);
  } catch (error) {
    console.warn('Failed to log business action:', error);
  }
};

export const logSecurityEvent = (event: string, description: string, metadata?: any) => {
  try {
    systemLogger.logSecurity(event as any, description, metadata);
  } catch (error) {
    console.warn('Failed to log security event:', error);
  }
};

export const logError = (error: Error | string, context?: string, metadata?: any) => {
  try {
    systemLogger.logError(error, context, metadata);
  } catch (logError) {
    console.warn('Failed to log error:', logError);
    // Fallback to console for error logging
    console.error('Original error:', error, context, metadata);
  }
};

// Safe logging function that doesn't throw errors
export const safeLog = (
  action: string,
  description: string,
  category: SystemLogEntry['category'] = 'system',
  severity: SystemLogEntry['severity'] = 'info',
  metadata?: any
) => {
  try {
    if (systemLogger.isInitialized()) {
      systemLogger.log(action, description, category, severity, metadata);
    } else {
      // Fallback logging to console when logger is not initialized
      console.log(`[${severity.toUpperCase()}] ${action}: ${description}`, metadata);
    }
  } catch (error) {
    console.warn('Failed to log safely:', error);
  }
};

// React hook for easier integration with error handling
export const useSystemLogger = () => {
  const safeCall = (fn: Function, ...args: any[]) => {
    try {
      if (systemLogger.isInitialized()) {
        return fn.apply(systemLogger, args);
      } else {
        console.warn('SystemLogger not initialized');
        return null;
      }
    } catch (error) {
      console.warn('SystemLogger error:', error);
      return null;
    }
  };

  return {
    log: (...args: any[]) => safeCall(systemLogger.log, ...args),
    logLogin: (...args: any[]) => safeCall(systemLogger.logLogin, ...args),
    logLogout: (...args: any[]) => safeCall(systemLogger.logLogout, ...args),
    logTransaction: (...args: any[]) => safeCall(systemLogger.logTransaction, ...args),
    logInventory: (...args: any[]) => safeCall(systemLogger.logInventory, ...args),
    logError: (...args: any[]) => safeCall(systemLogger.logError, ...args),
    logSecurity: (...args: any[]) => safeCall(systemLogger.logSecurity, ...args),
    logUserManagement: (...args: any[]) => safeCall(systemLogger.logUserManagement, ...args),
    logAPI: (...args: any[]) => safeCall(systemLogger.logAPI, ...args),
    startTimer: (...args: any[]) => safeCall(systemLogger.startPerformanceTimer, ...args),
    endTimer: (...args: any[]) => safeCall(systemLogger.endPerformanceTimer, ...args),
    getSessionStats: (...args: any[]) => safeCall(systemLogger.getSessionStats, ...args),
    getLogs: (...args: any[]) => safeCall(systemLogger.getLogs, ...args),
    exportLogs: (...args: any[]) => safeCall(systemLogger.exportLogs, ...args),
    isInitialized: () => systemLogger.isInitialized(),
    safeLog: safeLog
  };
};