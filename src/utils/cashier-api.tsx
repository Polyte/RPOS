import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-ca72a349`;

export interface Product {
  id: string;
  name: string;
  price: number;
  barcode: string;
  category: string;
  stock: number;
  image: string;
  icon: string;
  color: string;
  taxRate: number;
  description: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  barcode: string;
  taxRate: number;
}

export interface Transaction {
  id: string;
  receiptNumber: string;
  timestamp: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    total: number;
    barcode: string;
    taxRate: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentReceived: number;
  change: number;
  cashier: string;
  terminal: string;
  status: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}

class CashierAPI {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const maxRetries = 3;
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Only log API requests in development mode
        if (process.env.NODE_ENV === 'development') {
          console.log(`API Request (Attempt ${attempt}):`, url, options);
        }
        
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            ...options.headers,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          if (process.env.NODE_ENV === 'development') {
            console.log(`API Error Response (${response.status}):`, errorText);
          }
          
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { error: errorText || `HTTP ${response.status}` };
          }

          // Handle specific error cases
          if (response.status === 404) {
            return {
              success: false,
              error: errorData.error || 'Resource not found',
              details: errorData.details || `The requested resource could not be found`
            };
          }

          if (response.status >= 500) {
            lastError = new Error(`Server error: ${errorData.error || response.statusText}`);
            if (attempt < maxRetries) {
              if (process.env.NODE_ENV === 'development') {
                console.log(`Server error, retrying in ${attempt * 1000}ms...`);
              }
              await new Promise(resolve => setTimeout(resolve, attempt * 1000));
              continue;
            }
          }

          return {
            success: false,
            error: errorData.error || `Request failed with status ${response.status}`,
            details: errorData.details
          };
        }

        const data = await response.json();
        if (process.env.NODE_ENV === 'development') {
          console.log('API Response:', data);
        }
        
        // Handle API responses that indicate failure
        if (data && typeof data === 'object' && 'success' in data && !data.success) {
          return {
            success: false,
            error: data.error || 'API request failed',
            details: data.details
          };
        }
        
        return data as ApiResponse<T>;
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        if (process.env.NODE_ENV === 'development') {
          console.log(`Request failed (Attempt ${attempt}):`, lastError.message);
        }
        
        if (attempt < maxRetries) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`Retrying in ${attempt * 1000}ms...`);
          }
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
          continue;
        }
      }
    }

    // All retries failed
    return {
      success: false,
      error: 'Request failed after multiple attempts',
      details: lastError?.message || 'Network error'
    };
  }

  // Product Management
  async getProducts(): Promise<ApiResponse<{ products: Product[]; summary: any }>> {
    try {
      const result = await this.makeRequest<{ products: Product[]; summary: any }>('/products');
      
      // Fallback to localStorage if API fails
      if (!result.success) {
        if (process.env.NODE_ENV === 'development') {
          console.log('API failed, using localStorage fallback');
        }
        const cachedProducts = this.getProductsFromCache();
        if (cachedProducts.length > 0) {
          return {
            success: true,
            data: {
              products: cachedProducts,
              summary: {
                totalProducts: cachedProducts.length,
                totalValue: cachedProducts.reduce((sum, p) => sum + (p.stock * p.price), 0),
                lowStockProducts: cachedProducts.filter(p => p.stock <= 10).length,
                outOfStockProducts: cachedProducts.filter(p => p.stock === 0).length
              }
            }
          };
        }
      } else {
        // Cache successful results
        if (result.data?.products) {
          this.cacheProducts(result.data.products);
        }
      }
      
      return result;
    } catch (error) {
      console.log('Error in getProducts:', error);
      return {
        success: false,
        error: 'Failed to fetch products',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getProductByBarcode(barcode: string): Promise<ApiResponse<Product>> {
    if (!barcode || !barcode.trim()) {
      return {
        success: false,
        error: 'Barcode is required'
      };
    }

    try {
      const result = await this.makeRequest<Product>(`/products/barcode/${encodeURIComponent(barcode)}`);
      
      // Fallback to cached products if API fails
      if (!result.success) {
        const cachedProducts = this.getProductsFromCache();
        const product = cachedProducts.find(p => p.barcode === barcode);
        if (product) {
          return {
            success: true,
            data: product
          };
        }
      }
      
      return result;
    } catch (error) {
      console.log('Error in getProductByBarcode:', error);
      return {
        success: false,
        error: 'Failed to fetch product by barcode',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getCategories(): Promise<ApiResponse<Array<{ name: string; count: number }>>> {
    return this.makeRequest<Array<{ name: string; count: number }>>('/products/categories');
  }

  // Transaction Management
  async processTransaction(transactionData: {
    items: CartItem[];
    paymentMethod: string;
    paymentReceived: number;
    cashier: string;
    terminal: string;
  }): Promise<ApiResponse<Transaction>> {
    try {
      // Validate transaction data
      if (!transactionData.items || transactionData.items.length === 0) {
        return {
          success: false,
          error: 'Transaction must contain at least one item'
        };
      }

      if (!transactionData.paymentMethod) {
        return {
          success: false,
          error: 'Payment method is required'
        };
      }

      if (!transactionData.paymentReceived || transactionData.paymentReceived <= 0) {
        return {
          success: false,
          error: 'Payment amount must be greater than 0'
        };
      }

      const total = transactionData.items.reduce((sum, item) => {
        const itemTotal = item.price * item.quantity;
        const itemTax = itemTotal * (item.taxRate || 0.15);
        return sum + itemTotal + itemTax;
      }, 0);

      if (transactionData.paymentMethod === 'cash' && transactionData.paymentReceived < total) {
        return {
          success: false,
          error: `Insufficient payment. Required: R${total.toFixed(2)}, Received: R${transactionData.paymentReceived.toFixed(2)}`
        };
      }

      console.log('Processing transaction:', transactionData);
      
      const result = await this.makeRequest<Transaction>('/transactions', {
        method: 'POST',
        body: JSON.stringify(transactionData),
      });

      // If transaction creation fails, try to save to local storage as backup
      if (!result.success) {
        console.log('Transaction API failed, saving to localStorage as backup');
        this.saveTransactionToLocalStorage(transactionData, total);
      }

      return result;
      
    } catch (error) {
      console.log('Error in processTransaction:', error);
      
      // Save transaction locally as fallback
      const total = transactionData.items.reduce((sum, item) => {
        const itemTotal = item.price * item.quantity;
        const itemTax = itemTotal * (item.taxRate || 0.15);
        return sum + itemTotal + itemTax;
      }, 0);
      
      this.saveTransactionToLocalStorage(transactionData, total);
      
      return {
        success: false,
        error: 'Transaction processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getTransaction(id: string): Promise<ApiResponse<Transaction>> {
    if (!id) {
      return {
        success: false,
        error: 'Transaction ID is required'
      };
    }

    try {
      const result = await this.makeRequest<Transaction>(`/transactions/${encodeURIComponent(id)}`);
      
      // Fallback to localStorage if API fails
      if (!result.success && result.error?.includes('not found')) {
        const localTransaction = this.getTransactionFromLocalStorage(id);
        if (localTransaction) {
          return {
            success: true,
            data: localTransaction
          };
        }
      }
      
      return result;
    } catch (error) {
      console.log('Error in getTransaction:', error);
      return {
        success: false,
        error: 'Failed to fetch transaction',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getDailySales(date: string): Promise<ApiResponse<{
    date: string;
    totalSales: number;
    totalTransactions: number;
    totalTax: number;
    paymentMethods: {
      cash: number;
      card: number;
      mobile: number;
    };
  }>> {
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return {
        success: false,
        error: 'Valid date in YYYY-MM-DD format is required'
      };
    }

    try {
      const result = await this.makeRequest(`/transactions/daily/${date}`);
      
      // Fallback to localStorage data if API fails
      if (!result.success) {
        const localData = this.getDailySalesFromLocalStorage(date);
        if (localData) {
          return {
            success: true,
            data: localData
          };
        }
      }
      
      return result;
    } catch (error) {
      console.log('Error in getDailySales:', error);
      return {
        success: false,
        error: 'Failed to fetch daily sales',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Daily Targets Management
  async getDailyTargets(date: string): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>(`/transactions/targets/${date}`);
  }

  async createDailyTarget(targetData: {
    targetType: string;
    targetValue: number;
    description: string;
    date: string;
  }): Promise<ApiResponse<any>> {
    return this.makeRequest('/transactions/targets', {
      method: 'POST',
      body: JSON.stringify(targetData),
    });
  }

  async updateDailyTarget(id: string, targetData: {
    targetType?: string;
    targetValue?: number;
    description?: string;
    date?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<any>> {
    return this.makeRequest(`/transactions/targets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(targetData),
    });
  }

  async deleteDailyTarget(id: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/transactions/targets/${id}`, {
      method: 'DELETE',
    });
  }

  // Inventory Management - Using correct inventory endpoints
  async getInventoryStatus(): Promise<ApiResponse<{
    products: Array<{
      id: string;
      name: string;
      currentStock: number;
      lowStockAlert: boolean;
      lastUpdated: string;
    }>;
    lowStockItems: any[];
    totalProducts: number;
    totalItems: number;
    totalValue: number;
    lastSync: string;
  }>> {
    return this.makeRequest('/inventory/status');
  }

  async syncInventory(): Promise<ApiResponse<{
    syncedItems: number;
    totalStock: number;
    lowStockItems: number;
    lastSync: string;
  }>> {
    return this.makeRequest('/inventory/sync', {
      method: 'POST',
    });
  }

  async getInventoryItems(): Promise<ApiResponse<any[]>> {
    return this.makeRequest('/inventory/items');
  }

  async createInventoryItem(itemData: {
    name: string;
    category: string;
    barcode: string;
    price: number;
    minStock: number;
    maxStock: number;
    currentStock: number;
    reorderLevel: number;
    supplier?: string;
    description?: string;
    icon?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<any>> {
    return this.makeRequest('/inventory/items', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  async updateInventoryItem(id: string, itemData: any): Promise<ApiResponse<any>> {
    return this.makeRequest(`/inventory/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    });
  }

  async deleteInventoryItem(id: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/inventory/items/${id}`, {
      method: 'DELETE',
    });
  }

  async getLowStockItems(): Promise<ApiResponse<any[]>> {
    return this.makeRequest('/inventory/low-stock');
  }

  async getInventoryCategories(): Promise<ApiResponse<Array<{ name: string; count: number }>>> {
    return this.makeRequest('/inventory/categories');
  }

  // Local Storage Fallback Methods
  private getProductsFromCache(): Product[] {
    try {
      const cached = localStorage.getItem('roxton-pos-products-cache');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  }

  private cacheProducts(products: Product[]): void {
    try {
      localStorage.setItem('roxton-pos-products-cache', JSON.stringify(products));
      localStorage.setItem('roxton-pos-products-cache-time', new Date().toISOString());
    } catch (error) {
      console.log('Failed to cache products:', error);
    }
  }

  private saveTransactionToLocalStorage(transactionData: any, total: number): void {
    try {
      const transactionId = `LOCAL_TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const receiptNumber = `LOCAL_RCP_${Date.now()}`;
      
      const transaction: Transaction = {
        id: transactionId,
        receiptNumber,
        timestamp: new Date().toISOString(),
        items: transactionData.items.map((item: CartItem) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity,
          barcode: item.barcode,
          taxRate: item.taxRate || 0.15
        })),
        subtotal: transactionData.items.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0),
        tax: transactionData.items.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity * (item.taxRate || 0.15)), 0),
        total,
        paymentMethod: transactionData.paymentMethod,
        paymentReceived: transactionData.paymentReceived,
        change: transactionData.paymentMethod === 'cash' ? transactionData.paymentReceived - total : 0,
        cashier: transactionData.cashier,
        terminal: transactionData.terminal,
        status: 'completed_offline'
      };
      
      const localTransactions = this.getLocalTransactions();
      localTransactions[transactionId] = transaction;
      localStorage.setItem('roxton-pos-local-transactions', JSON.stringify(localTransactions));
      
      // Update daily totals
      this.updateLocalDailySales(transaction);
      
    } catch (error) {
      console.log('Failed to save transaction to localStorage:', error);
    }
  }

  private getTransactionFromLocalStorage(id: string): Transaction | null {
    try {
      const localTransactions = this.getLocalTransactions();
      return localTransactions[id] || null;
    } catch {
      return null;
    }
  }

  private getLocalTransactions(): Record<string, Transaction> {
    try {
      const saved = localStorage.getItem('roxton-pos-local-transactions');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }

  private getDailySalesFromLocalStorage(date: string): any | null {
    try {
      const saved = localStorage.getItem(`roxton-pos-daily-sales-${date}`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  private updateLocalDailySales(transaction: Transaction): void {
    try {
      const date = transaction.timestamp.split('T')[0];
      const existing = this.getDailySalesFromLocalStorage(date) || {
        date,
        totalSales: 0,
        totalTransactions: 0,
        totalTax: 0,
        paymentMethods: { cash: 0, card: 0, mobile: 0 }
      };

      existing.totalSales += transaction.total;
      existing.totalTransactions += 1;
      existing.totalTax += transaction.tax;
      
      if (existing.paymentMethods[transaction.paymentMethod]) {
        existing.paymentMethods[transaction.paymentMethod] += transaction.total;
      }

      localStorage.setItem(`roxton-pos-daily-sales-${date}`, JSON.stringify(existing));
    } catch (error) {
      console.log('Failed to update local daily sales:', error);
    }
  }
}

export const cashierAPI = new CashierAPI();