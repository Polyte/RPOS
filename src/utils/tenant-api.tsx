import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-ca72a349`;

export interface TenantApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}

export interface TenantAddress {
  formattedAddress: string;
  streetNumber?: string;
  streetName?: string;
  suburb?: string;
  city: string;
  province: string;
  country: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  placeId: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  businessType: string;
  address: TenantAddress;
  phone: string;
  email: string;
  taxNumber: string;
  subscriptionPlan: 'starter' | 'professional' | 'enterprise';
  isActive: boolean;
  settings: {
    currency: string;
    vatRate: number;
    timezone: string;
    businessHours: {
      open: string;
      close: string;
      days: string[];
    };
    features: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface TenantUser {
  id: string;
  tenantId: string;
  userId: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'manager' | 'cashier' | 'stock';
  permissions: string[];
  isActive: boolean;
  lastLogin: string;
  salesThisMonth?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MasterProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  barcode: string;
  alternativeBarcodes?: string[];
  brand?: string;
  manufacturer?: string;
  unitType: 'item' | 'kg' | 'liter' | 'meter';
  standardPrice?: number;
  recommendedPrice?: number;
  taxRate: number;
  icon: string;
  images?: string[];
  specifications?: Record<string, any>;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
}

class TenantApiClient {
  private getHeaders(tenantId?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    };
    
    if (tenantId) {
      headers['X-Tenant-ID'] = tenantId;
    }
    
    return headers;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    tenantId?: string
  ): Promise<TenantApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(tenantId),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('API Error:', response.status, data);
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
          details: data.details
        };
      }

      return data;
    } catch (error) {
      console.error('Network Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // ===== TENANT MANAGEMENT =====

  async getTenants(): Promise<TenantApiResponse<Tenant[]>> {
    return this.makeRequest<Tenant[]>('/tenants');
  }

  async getTenant(tenantId: string): Promise<TenantApiResponse<Tenant>> {
    return this.makeRequest<Tenant>(`/tenants/${tenantId}`);
  }

  async createTenant(tenantData: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Promise<TenantApiResponse<Tenant>> {
    return this.makeRequest<Tenant>('/tenants', {
      method: 'POST',
      body: JSON.stringify(tenantData),
    });
  }

  async updateTenant(tenantId: string, updates: Partial<Tenant>): Promise<TenantApiResponse<Tenant>> {
    return this.makeRequest<Tenant>(`/tenants/${tenantId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteTenant(tenantId: string): Promise<TenantApiResponse<void>> {
    return this.makeRequest<void>(`/tenants/${tenantId}`, {
      method: 'DELETE',
    });
  }

  // ===== USER MANAGEMENT =====

  async getTenantUsers(tenantId: string): Promise<TenantApiResponse<TenantUser[]>> {
    return this.makeRequest<TenantUser[]>(`/tenants/${tenantId}/users`, {}, tenantId);
  }

  async getTenantUser(tenantId: string, userId: string): Promise<TenantApiResponse<TenantUser>> {
    return this.makeRequest<TenantUser>(`/tenants/${tenantId}/users/${userId}`, {}, tenantId);
  }

  async createTenantUser(tenantId: string, userData: Omit<TenantUser, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Promise<TenantApiResponse<TenantUser>> {
    return this.makeRequest<TenantUser>(`/tenants/${tenantId}/users`, {
      method: 'POST',
      body: JSON.stringify(userData),
    }, tenantId);
  }

  async updateTenantUser(tenantId: string, userId: string, updates: Partial<TenantUser>): Promise<TenantApiResponse<TenantUser>> {
    return this.makeRequest<TenantUser>(`/tenants/${tenantId}/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }, tenantId);
  }

  async deleteTenantUser(tenantId: string, userId: string): Promise<TenantApiResponse<void>> {
    return this.makeRequest<void>(`/tenants/${tenantId}/users/${userId}`, {
      method: 'DELETE',
    }, tenantId);
  }

  async getUsersByRole(tenantId: string, role: string): Promise<TenantApiResponse<TenantUser[]>> {
    return this.makeRequest<TenantUser[]>(`/tenants/${tenantId}/users?role=${role}`, {}, tenantId);
  }

  // ===== MASTER PRODUCTS =====

  async getMasterProducts(): Promise<TenantApiResponse<MasterProduct[]>> {
    return this.makeRequest<MasterProduct[]>('/master-products');
  }

  async getMasterProduct(productId: string): Promise<TenantApiResponse<MasterProduct>> {
    return this.makeRequest<MasterProduct>(`/master-products/${productId}`);
  }

  async getMasterProductByBarcode(barcode: string): Promise<TenantApiResponse<MasterProduct>> {
    return this.makeRequest<MasterProduct>(`/master-products/barcode/${barcode}`);
  }

  async searchMasterProducts(query: string): Promise<TenantApiResponse<MasterProduct[]>> {
    return this.makeRequest<MasterProduct[]>(`/master-products/search?q=${encodeURIComponent(query)}`);
  }

  async createMasterProduct(productData: Omit<MasterProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<TenantApiResponse<MasterProduct>> {
    return this.makeRequest<MasterProduct>('/master-products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateMasterProduct(productId: string, updates: Partial<MasterProduct>): Promise<TenantApiResponse<MasterProduct>> {
    return this.makeRequest<MasterProduct>(`/master-products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteMasterProduct(productId: string): Promise<TenantApiResponse<void>> {
    return this.makeRequest<void>(`/master-products/${productId}`, {
      method: 'DELETE',
    });
  }

  async getMasterProductCategories(): Promise<TenantApiResponse<Array<{ name: string; count: number }>>> {
    return this.makeRequest<Array<{ name: string; count: number }>>('/master-products/categories');
  }

  // ===== ENHANCED PRODUCT LOOKUP FOR BARCODE SCANNING =====

  async enhancedProductLookup(barcode: string): Promise<TenantApiResponse<any>> {
    // This method first checks master products, then falls back to tenant-specific products
    return this.makeRequest<any>(`/products/barcode/${barcode}`);
  }

  // ===== TENANT-AWARE TRANSACTIONS =====

  async processTransaction(tenantId: string, transactionData: any): Promise<TenantApiResponse<any>> {
    return this.makeRequest<any>('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    }, tenantId);
  }

  async getDailySales(tenantId: string, date: string): Promise<TenantApiResponse<any>> {
    return this.makeRequest<any>(`/sales/daily/${date}`, {}, tenantId);
  }

  // ===== INVENTORY MANAGEMENT =====

  async getTenantInventory(tenantId: string): Promise<TenantApiResponse<any[]>> {
    return this.makeRequest<any[]>('/inventory', {}, tenantId);
  }

  async createInventoryItem(tenantId: string, itemData: any): Promise<TenantApiResponse<any>> {
    return this.makeRequest<any>('/inventory', {
      method: 'POST',
      body: JSON.stringify(itemData),
    }, tenantId);
  }

  async updateInventoryItem(tenantId: string, itemId: string, updates: any): Promise<TenantApiResponse<any>> {
    return this.makeRequest<any>(`/inventory/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }, tenantId);
  }

  // ===== DAILY TARGETS =====

  async getDailyTargets(tenantId: string, date: string): Promise<TenantApiResponse<any[]>> {
    return this.makeRequest<any[]>(`/daily-targets/${date}`, {}, tenantId);
  }

  async createDailyTarget(tenantId: string, targetData: any): Promise<TenantApiResponse<any>> {
    return this.makeRequest<any>('/daily-targets', {
      method: 'POST',
      body: JSON.stringify(targetData),
    }, tenantId);
  }

  async updateDailyTarget(tenantId: string, targetId: string, updates: any): Promise<TenantApiResponse<any>> {
    return this.makeRequest<any>(`/daily-targets/${targetId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }, tenantId);
  }

  async deleteDailyTarget(tenantId: string, targetId: string): Promise<TenantApiResponse<void>> {
    return this.makeRequest<void>(`/daily-targets/${targetId}`, {
      method: 'DELETE',
    }, tenantId);
  }
}

// Export singleton instance
export const tenantAPI = new TenantApiClient();

// Export helper functions
export const getCurrentTenantId = (): string => {
  // Get from localStorage, URL parameter, or default
  return localStorage.getItem('roxton-pos-tenant-id') || 
         new URLSearchParams(window.location.search).get('tenant') ||
         'tenant_default';
};

export const setCurrentTenantId = (tenantId: string): void => {
  localStorage.setItem('roxton-pos-tenant-id', tenantId);
  
  // Optionally update URL parameter without page reload
  const url = new URL(window.location.href);
  url.searchParams.set('tenant', tenantId);
  window.history.replaceState({}, '', url.toString());
};

export const clearCurrentTenantId = (): void => {
  localStorage.removeItem('roxton-pos-tenant-id');
  
  // Remove URL parameter
  const url = new URL(window.location.href);
  url.searchParams.delete('tenant');
  window.history.replaceState({}, '', url.toString());
};

// Utility functions for role-based permissions
export const hasPermission = (user: TenantUser, permission: string): boolean => {
  return user.permissions.includes(permission) || 
         user.role === 'owner' || 
         user.role === 'admin';
};

export const canManageUsers = (user: TenantUser): boolean => {
  return hasPermission(user, 'user_management');
};

export const canManageTenants = (user: TenantUser): boolean => {
  return hasPermission(user, 'tenant_management') || user.role === 'owner';
};

export const canViewReports = (user: TenantUser): boolean => {
  return hasPermission(user, 'reporting') || hasPermission(user, 'analytics');
};

export const canManageInventory = (user: TenantUser): boolean => {
  return hasPermission(user, 'inventory_management');
};