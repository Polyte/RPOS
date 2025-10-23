import { TRANSACTION_CONSTANTS } from './transaction-constants.tsx';

// Helper function to generate transaction ID
export const generateTransactionId = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `TXN-${timestamp}-${random.toString().padStart(4, '0')}`;
};

// Helper function to generate receipt number
export const generateReceiptNumber = (): string => {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '');
  const random = Math.floor(Math.random() * 1000);
  return `RCP-${dateStr}-${timeStr}-${random.toString().padStart(3, '0')}`;
};

// Helper function to generate target ID
export const generateTargetId = (): string => {
  return `target_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Helper function to validate transaction items
export const validateTransactionItems = (items: any[]): { isValid: boolean; error?: string } => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return { isValid: false, error: TRANSACTION_CONSTANTS.ERRORS.INVALID_ITEMS };
  }

  if (items.length > TRANSACTION_CONSTANTS.VALIDATION.MAX_ITEMS_PER_TRANSACTION) {
    return { isValid: false, error: `Too many items. Maximum ${TRANSACTION_CONSTANTS.VALIDATION.MAX_ITEMS_PER_TRANSACTION} allowed` };
  }

  for (const item of items) {
    if (!item.id || !item.name || typeof item.price !== 'number' || typeof item.quantity !== 'number') {
      return { isValid: false, error: 'Invalid item data. Each item must have id, name, price, and quantity' };
    }

    if (item.price < 0 || item.quantity <= 0) {
      return { isValid: false, error: 'Invalid item values. Price and quantity must be positive' };
    }
  }

  return { isValid: true };
};

// Helper function to validate payment data
export const validatePaymentData = (paymentMethod: string, paymentReceived: number): { isValid: boolean; error?: string } => {
  if (!paymentMethod) {
    return { isValid: false, error: TRANSACTION_CONSTANTS.ERRORS.PAYMENT_METHOD_REQUIRED };
  }

  if (!paymentReceived || paymentReceived <= 0) {
    return { isValid: false, error: TRANSACTION_CONSTANTS.ERRORS.PAYMENT_AMOUNT_INVALID };
  }

  if (paymentReceived < TRANSACTION_CONSTANTS.VALIDATION.MIN_PAYMENT_AMOUNT) {
    return { isValid: false, error: `Payment amount too small. Minimum ${TRANSACTION_CONSTANTS.VALIDATION.MIN_PAYMENT_AMOUNT}` };
  }

  return { isValid: true };
};

// Helper function to calculate transaction totals
export const calculateTransactionTotals = (items: any[]) => {
  const subtotal = items.reduce((sum: number, item: any) => 
    sum + (item.price * item.quantity), 0
  );
  
  const tax = items.reduce((sum: number, item: any) => 
    sum + (item.price * item.quantity * (item.taxRate || TRANSACTION_CONSTANTS.CONFIG.DEFAULT_TAX_RATE)), 0
  );
  
  const total = subtotal + tax;

  return { subtotal, tax, total };
};

// Helper function to validate date format
export const validateDateFormat = (date: string): boolean => {
  return TRANSACTION_CONSTANTS.VALIDATION.DATE_PATTERN.test(date);
};

// Helper function to create transaction data structure (now tenant-aware)
export const createTransactionData = (
  transactionId: string,
  receiptNumber: string,
  items: any[],
  totals: { subtotal: number; tax: number; total: number },
  paymentMethod: string,
  paymentReceived: number,
  cashier: string,
  terminal: string,
  tenantId?: string
) => {
  return {
    id: transactionId,
    receiptNumber,
    timestamp: new Date().toISOString(),
    tenantId: tenantId || 'tenant_default',
    items: items.map((item: any) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      total: item.price * item.quantity,
      barcode: item.barcode,
      taxRate: item.taxRate || TRANSACTION_CONSTANTS.CONFIG.DEFAULT_TAX_RATE
    })),
    subtotal: totals.subtotal,
    tax: totals.tax,
    total: totals.total,
    paymentMethod,
    paymentReceived,
    change: paymentMethod === TRANSACTION_CONSTANTS.PAYMENT_METHODS.CASH ? paymentReceived - totals.total : 0,
    cashier: cashier || TRANSACTION_CONSTANTS.CONFIG.DEFAULT_CASHIER,
    terminal: terminal || TRANSACTION_CONSTANTS.CONFIG.DEFAULT_TERMINAL,
    status: TRANSACTION_CONSTANTS.CONFIG.TRANSACTION_STATUS_COMPLETED
  };
};

// Helper function to create default daily sales structure
export const createDefaultDailySales = (date: string) => {
  return {
    date,
    totalSales: 0,
    totalTransactions: 0,
    totalTax: 0,
    paymentMethods: { ...TRANSACTION_CONSTANTS.DEFAULT_PAYMENT_METHODS }
  };
};

// Helper function to create target data structure
export const createTargetData = (
  targetType: string,
  targetValue: number,
  description: string,
  date: string
) => {
  return {
    id: generateTargetId(),
    targetType,
    targetValue: parseFloat(targetValue.toString()),
    description: description || '',
    date,
    createdAt: new Date().toISOString(),
    progress: 0,
    status: TRANSACTION_CONSTANTS.CONFIG.TARGET_STATUS_ACTIVE,
    isActive: true
  };
};

// Helper function to get storage keys (now tenant-aware)
export const getStorageKeys = (transactionId: string, date: string, tenantId?: string) => {
  const tenantPrefix = tenantId ? `${tenantId}:` : '';
  
  return {
    transactionKey: `${tenantPrefix}${TRANSACTION_CONSTANTS.STORAGE_KEYS.TRANSACTION_PREFIX}${transactionId}`,
    dailyTransactionsKey: `${tenantPrefix}${TRANSACTION_CONSTANTS.STORAGE_KEYS.DAILY_TRANSACTIONS_PREFIX}${date}`,
    dailySalesKey: `${tenantPrefix}${TRANSACTION_CONSTANTS.STORAGE_KEYS.DAILY_SALES_PREFIX}${date}`,
    dailyTargetsKey: `${tenantPrefix}${TRANSACTION_CONSTANTS.STORAGE_KEYS.DAILY_TARGETS_PREFIX}${date}`
  };
};