// Transaction system constants
export const TRANSACTION_CONSTANTS = {
  // Error messages
  ERRORS: {
    INVALID_ITEMS: 'Invalid or empty items array',
    PAYMENT_METHOD_REQUIRED: 'Payment method is required',
    PAYMENT_AMOUNT_INVALID: 'Payment received must be greater than 0',
    INSUFFICIENT_PAYMENT: 'Insufficient payment amount',
    TRANSACTION_ID_REQUIRED: 'Transaction ID is required',
    INVALID_DATE_FORMAT: 'Valid date in YYYY-MM-DD format is required',
    TARGET_FIELDS_REQUIRED: 'Target type, value, and date are required',
    TARGET_NOT_FOUND: 'Target not found',
    TRANSACTION_NOT_FOUND: 'Transaction not found',
    TRANSACTION_CORRUPTED: 'Transaction data corrupted',
    INSUFFICIENT_STOCK: 'Insufficient stock for some items',
    PRODUCT_NOT_FOUND: 'Product not found',
    FAILED_TO_STORE: 'Failed to store transaction',
    FAILED_TO_FETCH: 'Failed to fetch transaction',
    FAILED_TO_FETCH_SALES: 'Failed to fetch daily sales',
    FAILED_TO_FETCH_LIST: 'Failed to fetch transaction list',
    FAILED_TO_CREATE_TARGET: 'Failed to create daily target',
    FAILED_TO_UPDATE_TARGET: 'Failed to update daily target',
    FAILED_TO_DELETE_TARGET: 'Failed to delete daily target',
    INTERNAL_ERROR: 'Internal server error during transaction processing'
  },

  // Success messages
  SUCCESS: {
    TRANSACTION_PROCESSED: 'Transaction processed successfully',
    TARGET_CREATED: 'Target created successfully',
    TARGET_UPDATED: 'Target updated successfully',
    TARGET_DELETED: 'Target deleted successfully'
  },

  // Configuration
  CONFIG: {
    DEFAULT_TAX_RATE: 0.15,
    DEFAULT_CASHIER: 'Unknown',
    DEFAULT_TERMINAL: 'POS-001',
    LOW_STOCK_THRESHOLD: 10,
    TARGET_STATUS_ACTIVE: 'active',
    TRANSACTION_STATUS_COMPLETED: 'completed'
  },

  // Validation patterns
  VALIDATION: {
    DATE_PATTERN: /^\d{4}-\d{2}-\d{2}$/,
    MIN_PAYMENT_AMOUNT: 0.01,
    MAX_ITEMS_PER_TRANSACTION: 100
  },

  // Storage keys
  STORAGE_KEYS: {
    TRANSACTION_PREFIX: 'transaction_',
    DAILY_TRANSACTIONS_PREFIX: 'daily_transactions_',
    DAILY_SALES_PREFIX: 'daily_sales_',
    DAILY_TARGETS_PREFIX: 'daily_targets_',
    CASHIER_PRODUCTS: 'cashier_products',
    PRODUCTS: 'products',
    INVENTORY_ITEMS: 'inventory_items',
    MANAGER_INVENTORY: 'manager_inventory'
  },

  // Payment methods
  PAYMENT_METHODS: {
    CASH: 'cash',
    CARD: 'card',
    MOBILE: 'mobile'
  },

  // Default payment structure
  DEFAULT_PAYMENT_METHODS: {
    cash: 0,
    card: 0,
    mobile: 0
  }
} as const;