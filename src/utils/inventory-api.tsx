import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-ca72a349`;

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  barcode: string;
  unitPrice: number;
  minStock: number;
  maxStock: number;
  currentStock: number;
  reorderLevel: number;
  supplier?: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  createdAt?: string;
  lastUpdated: string;
  totalSold?: number;
  lowStockAlert: boolean;
}

export interface InventoryStatus {
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
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
  count?: number;
  message?: string;
}

class InventoryAPI {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const maxRetries = 3;
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Inventory API Request (Attempt ${attempt}):`, url, options);
        
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
          console.log(`Inventory API Error Response (${response.status}):`, errorText);
          
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
              details: errorData.details || 'The requested inventory resource could not be found'
            };
          }

          if (response.status >= 500) {
            lastError = new Error(`Server error: ${errorData.error || response.statusText}`);
            if (attempt < maxRetries) {
              console.log(`Server error, retrying in ${attempt * 1000}ms...`);
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
        console.log('Inventory API Response:', data);
        
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
        console.log(`Inventory request failed (Attempt ${attempt}):`, lastError.message);
        
        if (attempt < maxRetries) {
          console.log(`Retrying in ${attempt * 1000}ms...`);
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

  // Inventory Status and Sync
  async getInventoryStatus(): Promise<ApiResponse<InventoryStatus>> {
    try {
      const result = await this.makeRequest<InventoryStatus>('/inventory/status');
      
      // Fallback to localStorage if API fails
      if (!result.success) {
        console.log('Inventory status API failed, using localStorage fallback');
        const cachedStatus = this.getInventoryStatusFromCache();
        if (cachedStatus) {
          return {
            success: true,
            data: cachedStatus
          };
        }
      } else {
        // Cache successful results
        if (result.data) {
          this.cacheInventoryStatus(result.data);
        }
      }
      
      return result;
    } catch (error) {
      console.log('Error in getInventoryStatus:', error);
      return {
        success: false,
        error: 'Failed to fetch inventory status',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
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

  // Inventory Items Management
  async getInventoryItems(): Promise<ApiResponse<InventoryItem[]>> {
    try {
      const result = await this.makeRequest<InventoryItem[]>('/inventory/items');
      
      // Fallback to localStorage if API fails
      if (!result.success) {
        console.log('Inventory items API failed, using localStorage fallback');
        const cachedItems = this.getInventoryItemsFromCache();
        if (cachedItems.length > 0) {
          return {
            success: true,
            data: cachedItems,
            count: cachedItems.length
          };
        }
      } else {
        // Cache successful results
        if (result.data) {
          this.cacheInventoryItems(result.data);
        }
      }
      
      return result;
    } catch (error) {
      console.log('Error in getInventoryItems:', error);
      return {
        success: false,
        error: 'Failed to fetch inventory items',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async createInventoryItem(itemData: {
    name: string;
    category: string;
    barcode?: string;
    price: number;
    minStock?: number;
    maxStock?: number;
    currentStock: number;
    reorderLevel?: number;
    supplier?: string;
    description?: string;
    icon?: string;
    isActive?: boolean;
    unitPrice?: number;
    lastUpdated?: string;
  }): Promise<ApiResponse<InventoryItem>> {
    try {
      // Validate required fields
      if (!itemData.name || !itemData.category || itemData.price === undefined || itemData.currentStock === undefined) {
        return {
          success: false,
          error: 'Missing required fields: name, category, price, currentStock'
        };
      }

      // Prepare data for API
      const apiData = {
        name: itemData.name.trim(),
        category: itemData.category.trim(),
        barcode: itemData.barcode || '',
        price: itemData.unitPrice || itemData.price,
        minStock: itemData.minStock || 10,
        maxStock: itemData.maxStock || 100,
        currentStock: itemData.currentStock,
        reorderLevel: itemData.reorderLevel || 20,
        supplier: itemData.supplier || '',
        description: itemData.description || '',
        icon: itemData.icon || 'Package2',
        isActive: itemData.isActive !== false
      };

      const result = await this.makeRequest<InventoryItem>('/inventory/items', {
        method: 'POST',
        body: JSON.stringify(apiData),
      });

      // If creation succeeds, update cache
      if (result.success && result.data) {
        this.addItemToCache(result.data);
      }

      return result;
    } catch (error) {
      console.log('Error in createInventoryItem:', error);
      return {
        success: false,
        error: 'Failed to create inventory item',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async updateInventoryItem(id: string, itemData: Partial<InventoryItem>): Promise<ApiResponse<InventoryItem>> {
    if (!id) {
      return {
        success: false,
        error: 'Item ID is required'
      };
    }

    try {
      const result = await this.makeRequest<InventoryItem>(`/inventory/items/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(itemData),
      });

      // If update succeeds, update cache
      if (result.success && result.data) {
        this.updateItemInCache(result.data);
      }

      return result;
    } catch (error) {
      console.log('Error in updateInventoryItem:', error);
      return {
        success: false,
        error: 'Failed to update inventory item',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async deleteInventoryItem(id: string): Promise<ApiResponse<InventoryItem>> {
    if (!id) {
      return {
        success: false,
        error: 'Item ID is required'
      };
    }

    try {
      const result = await this.makeRequest<InventoryItem>(`/inventory/items/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      // If deletion succeeds, remove from cache
      if (result.success) {
        this.removeItemFromCache(id);
      }

      return result;
    } catch (error) {
      console.log('Error in deleteInventoryItem:', error);
      return {
        success: false,
        error: 'Failed to delete inventory item',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Specialized Inventory Queries
  async getLowStockItems(): Promise<ApiResponse<InventoryItem[]>> {
    return this.makeRequest<InventoryItem[]>('/inventory/low-stock');
  }

  async getInventoryCategories(): Promise<ApiResponse<Array<{ name: string; count: number }>>> {
    return this.makeRequest<Array<{ name: string; count: number }>>('/inventory/categories');
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse<{ message: string; timestamp: string; version: string }>> {
    return this.makeRequest('/inventory/health');
  }

  // Local Storage Cache Methods
  private getInventoryStatusFromCache(): InventoryStatus | null {
    try {
      const cached = localStorage.getItem('roxton-pos-inventory-status-cache');
      const timestamp = localStorage.getItem('roxton-pos-inventory-status-cache-time');
      
      if (cached && timestamp) {
        const cacheTime = new Date(timestamp);
        const now = new Date();
        const fiveMinutes = 5 * 60 * 1000;
        
        // Use cache if less than 5 minutes old
        if (now.getTime() - cacheTime.getTime() < fiveMinutes) {
          return JSON.parse(cached);
        }
      }
      
      return null;
    } catch {
      return null;
    }
  }

  private cacheInventoryStatus(status: InventoryStatus): void {
    try {
      localStorage.setItem('roxton-pos-inventory-status-cache', JSON.stringify(status));
      localStorage.setItem('roxton-pos-inventory-status-cache-time', new Date().toISOString());
    } catch (error) {
      console.log('Failed to cache inventory status:', error);
    }
  }

  private getInventoryItemsFromCache(): InventoryItem[] {
    try {
      const cached = localStorage.getItem('roxton-pos-inventory-items-cache');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  }

  private cacheInventoryItems(items: InventoryItem[]): void {
    try {
      localStorage.setItem('roxton-pos-inventory-items-cache', JSON.stringify(items));
      localStorage.setItem('roxton-pos-inventory-items-cache-time', new Date().toISOString());
    } catch (error) {
      console.log('Failed to cache inventory items:', error);
    }
  }

  private addItemToCache(item: InventoryItem): void {
    try {
      const cached = this.getInventoryItemsFromCache();
      cached.push(item);
      this.cacheInventoryItems(cached);
    } catch (error) {
      console.log('Failed to add item to cache:', error);
    }
  }

  private updateItemInCache(updatedItem: InventoryItem): void {
    try {
      const cached = this.getInventoryItemsFromCache();
      const index = cached.findIndex(item => item.id === updatedItem.id);
      if (index !== -1) {
        cached[index] = updatedItem;
        this.cacheInventoryItems(cached);
      }
    } catch (error) {
      console.log('Failed to update item in cache:', error);
    }
  }

  private removeItemFromCache(id: string): void {
    try {
      const cached = this.getInventoryItemsFromCache();
      const filtered = cached.filter(item => item.id !== id);
      this.cacheInventoryItems(filtered);
    } catch (error) {
      console.log('Failed to remove item from cache:', error);
    }
  }
}

export const inventoryAPI = new InventoryAPI();