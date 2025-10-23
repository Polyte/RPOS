import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import * as kv from './kv_store.tsx';
import { TRANSACTION_CONSTANTS } from './transaction-constants.tsx';
import { 
  generateTransactionId, 
  generateReceiptNumber,
  validateTransactionItems,
  validatePaymentData,
  calculateTransactionTotals,
  validateDateFormat,
  createTransactionData,
  createDefaultDailySales,
  getStorageKeys
} from './transaction-helpers.tsx';
import { processStockUpdates } from './stock-manager.tsx';
import { dailyTargetsRoutes } from './daily-targets.tsx';

export const transactionRoutes = new Hono();

// Enable CORS for all routes
transactionRoutes.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Mount daily targets routes
transactionRoutes.route('/', dailyTargetsRoutes);

// Export function for server index to use
export const processTransaction = async (transactionData: any) => {
  try {
    console.log('Processing transaction with data:', transactionData);
    
    const { items, paymentMethod, paymentReceived, cashier, terminal, tenantId } = transactionData;
    
    // Validate transaction items
    const itemsValidation = validateTransactionItems(items);
    if (!itemsValidation.isValid) {
      return { 
        success: false, 
        error: itemsValidation.error 
      };
    }

    // Validate payment data
    const paymentValidation = validatePaymentData(paymentMethod, paymentReceived);
    if (!paymentValidation.isValid) {
      return { 
        success: false, 
        error: paymentValidation.error 
      };
    }

    // Calculate transaction totals
    const totals = calculateTransactionTotals(items);

    // Validate payment amount for cash transactions
    if (paymentMethod === TRANSACTION_CONSTANTS.PAYMENT_METHODS.CASH && paymentReceived < totals.total) {
      return { 
        success: false, 
        error: TRANSACTION_CONSTANTS.ERRORS.INSUFFICIENT_PAYMENT,
        required: totals.total,
        received: paymentReceived
      };
    }

    // Process stock updates
    const stockResult = await processStockUpdates(items);
    if (!stockResult.success) {
      return { 
        success: false, 
        error: TRANSACTION_CONSTANTS.ERRORS.INSUFFICIENT_STOCK,
        stockErrors: stockResult.errors
      };
    }

    // Generate transaction data
    const transactionId = generateTransactionId();
    const receiptNumber = generateReceiptNumber();
    const transaction = createTransactionData(
      transactionId,
      receiptNumber,
      items,
      totals,
      paymentMethod,
      paymentReceived,
      cashier,
      terminal,
      tenantId
    );

    // Store transaction with tenant awareness
    const today = new Date().toISOString().split('T')[0];
    const { transactionKey, dailyTransactionsKey } = getStorageKeys(transactionId, today, tenantId);
    
    try {
      // Store individual transaction
      await kv.set(transactionKey, transaction);
      
      // Update daily transactions list
      const dailyTransactions = await kv.get(dailyTransactionsKey) || [];
      (dailyTransactions as any[]).push(transactionId);
      await kv.set(dailyTransactionsKey, dailyTransactions);
      
      console.log('Transaction stored successfully:', transactionId);
    } catch (error) {
      console.log('Error storing transaction:', error);
      return { 
        success: false, 
        error: TRANSACTION_CONSTANTS.ERRORS.FAILED_TO_STORE
      };
    }

    // Update daily sales summary
    await updateDailySales(today, totals, paymentMethod, tenantId);

    console.log('Transaction completed successfully:', transactionId);
    
    return {
      success: true,
      data: transaction,
      message: TRANSACTION_CONSTANTS.SUCCESS.TRANSACTION_PROCESSED
    };
    
  } catch (error) {
    console.log('Error processing transaction:', error);
    return { 
      success: false, 
      error: TRANSACTION_CONSTANTS.ERRORS.INTERNAL_ERROR,
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Export function to get daily sales
export const getDailySales = async (date: string, tenantId?: string) => {
  try {
    console.log('Fetching daily sales for date:', date, 'tenant:', tenantId);
    
    if (!date || !validateDateFormat(date)) {
      return { 
        success: false, 
        error: TRANSACTION_CONSTANTS.ERRORS.INVALID_DATE_FORMAT
      };
    }
    
    const { dailySalesKey } = getStorageKeys('', date, tenantId);
    const dailySales = await kv.get(dailySalesKey);
    
    if (!dailySales) {
      // Return empty data structure for dates with no sales
      return {
        success: true,
        data: createDefaultDailySales(date)
      };
    }
    
    return {
      success: true,
      data: dailySales
    };
    
  } catch (error) {
    console.log('Error fetching daily sales:', error);
    return { 
      success: false, 
      error: TRANSACTION_CONSTANTS.ERRORS.FAILED_TO_FETCH_SALES,
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Export function to get transaction by ID
export const getTransaction = async (transactionId: string, tenantId?: string) => {
  try {
    console.log('Fetching transaction with ID:', transactionId, 'tenant:', tenantId);
    
    if (!transactionId) {
      return { 
        success: false, 
        error: TRANSACTION_CONSTANTS.ERRORS.TRANSACTION_ID_REQUIRED
      };
    }
    
    const { transactionKey } = getStorageKeys(transactionId, '', tenantId);
    const transaction = await kv.get(transactionKey);
    
    if (!transaction) {
      console.log('Transaction not found for key:', transactionKey);
      
      return { 
        success: false, 
        error: TRANSACTION_CONSTANTS.ERRORS.TRANSACTION_NOT_FOUND,
        transactionId
      };
    }
    
    return {
      success: true,
      data: transaction
    };
    
  } catch (error) {
    console.log('Error fetching transaction:', error);
    return { 
      success: false, 
      error: TRANSACTION_CONSTANTS.ERRORS.FAILED_TO_FETCH,
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Export function to get daily transaction list
export const getDailyTransactionList = async (date: string, tenantId?: string) => {
  try {
    console.log('Fetching transaction list for date:', date, 'tenant:', tenantId);
    
    if (!date || !validateDateFormat(date)) {
      return { 
        success: false, 
        error: TRANSACTION_CONSTANTS.ERRORS.INVALID_DATE_FORMAT
      };
    }
    
    const { dailyTransactionsKey } = getStorageKeys('', date, tenantId);
    const transactionIds = await kv.get(dailyTransactionsKey) || [];
    
    const transactions = [];
    for (const id of transactionIds as any[]) {
      try {
        const { transactionKey } = getStorageKeys(id, '', tenantId);
        const transaction = await kv.get(transactionKey);
        if (transaction) {
          transactions.push(transaction);
        }
      } catch (error) {
        console.log(`Error fetching transaction ${id}:`, error);
        // Continue with other transactions
      }
    }
    
    return {
      success: true,
      data: transactions,
      count: transactions.length
    };
    
  } catch (error) {
    console.log('Error fetching transaction list:', error);
    return { 
      success: false, 
      error: TRANSACTION_CONSTANTS.ERRORS.FAILED_TO_FETCH_LIST,
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// POST /transactions - Process a new transaction
transactionRoutes.post('/transactions', async (c) => {
  try {
    const body = await c.req.json();
    const tenantId = c.req.header('X-Tenant-ID') || 'tenant_default';
    
    const result = await processTransaction({
      ...body,
      tenantId
    });
    
    if (!result.success) {
      return c.json(result, 400);
    }
    
    return c.json(result);
    
  } catch (error) {
    console.log('Error processing transaction:', error);
    return c.json({ 
      success: false, 
      error: TRANSACTION_CONSTANTS.ERRORS.INTERNAL_ERROR,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// GET /transactions/:id - Get specific transaction
transactionRoutes.get('/transactions/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const tenantId = c.req.header('X-Tenant-ID') || 'tenant_default';
    
    const result = await getTransaction(id, tenantId);
    
    if (!result.success) {
      const statusCode = result.error === TRANSACTION_CONSTANTS.ERRORS.TRANSACTION_NOT_FOUND ? 404 : 400;
      return c.json(result, statusCode);
    }
    
    return c.json(result);
    
  } catch (error) {
    console.log('Error fetching transaction:', error);
    return c.json({ 
      success: false, 
      error: TRANSACTION_CONSTANTS.ERRORS.FAILED_TO_FETCH,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// GET /transactions/daily/:date - Get daily sales summary
transactionRoutes.get('/transactions/daily/:date', async (c) => {
  try {
    const date = c.req.param('date');
    const tenantId = c.req.header('X-Tenant-ID') || 'tenant_default';
    
    const result = await getDailySales(date, tenantId);
    
    if (!result.success) {
      return c.json(result, 400);
    }
    
    return c.json(result);
    
  } catch (error) {
    console.log('Error fetching daily sales:', error);
    return c.json({ 
      success: false, 
      error: TRANSACTION_CONSTANTS.ERRORS.FAILED_TO_FETCH_SALES,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// GET /transactions/list/:date - Get all transactions for a specific date
transactionRoutes.get('/transactions/list/:date', async (c) => {
  try {
    const date = c.req.param('date');
    const tenantId = c.req.header('X-Tenant-ID') || 'tenant_default';
    
    const result = await getDailyTransactionList(date, tenantId);
    
    if (!result.success) {
      return c.json(result, 400);
    }
    
    return c.json(result);
    
  } catch (error) {
    console.log('Error fetching transaction list:', error);
    return c.json({ 
      success: false, 
      error: TRANSACTION_CONSTANTS.ERRORS.FAILED_TO_FETCH_LIST,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Helper function to update daily sales (now tenant-aware)
async function updateDailySales(
  date: string, 
  totals: { total: number; tax: number }, 
  paymentMethod: string,
  tenantId?: string
): Promise<void> {
  try {
    const { dailySalesKey } = getStorageKeys('', date, tenantId);
    const dailySales = await kv.get(dailySalesKey) || createDefaultDailySales(date);

    (dailySales as any).totalSales += totals.total;
    (dailySales as any).totalTransactions += 1;
    (dailySales as any).totalTax += totals.tax;
    
    if ((dailySales as any).paymentMethods[paymentMethod]) {
      (dailySales as any).paymentMethods[paymentMethod] += totals.total;
    } else {
      (dailySales as any).paymentMethods[paymentMethod] = totals.total;
    }

    await kv.set(dailySalesKey, dailySales);
  } catch (error) {
    console.log('Error updating daily sales:', error);
    // Non-critical error, don't throw
  }
}

// Health check endpoint
transactionRoutes.get('/transactions/health', async (c) => {
  return c.json({
    success: true,
    message: 'Transaction service is healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});