import { tenantAPI, getCurrentTenantId } from './tenant-api';

export class EnhancedCashierAPI {
  private tenantId: string;

  constructor() {
    this.tenantId = getCurrentTenantId();
  }

  // Enhanced barcode scanning that checks master products first
  async getProductByBarcode(barcode: string) {
    try {
      console.log('Enhanced barcode lookup for:', barcode);
      
      // Use the enhanced lookup that checks master products first
      const response = await tenantAPI.enhancedProductLookup(barcode);
      
      if (response.success && response.data) {
        console.log('Product found:', response.data);
        return response;
      }
      
      // If not found, return the error
      return {
        success: false,
        error: `Product with barcode ${barcode} not found in database`,
        data: null
      };
    } catch (error) {
      console.error('Enhanced barcode lookup error:', error);
      return {
        success: false,
        error: 'Failed to lookup product by barcode',
        data: null
      };
    }
  }

  // Get all products (enhanced with master product integration)
  async getProducts() {
    try {
      // Get both local products and master products that might be relevant
      const [localResponse, masterResponse] = await Promise.all([
        fetch(`/api/products`, {
          headers: { 'X-Tenant-ID': this.tenantId }
        }),
        tenantAPI.getMasterProducts()
      ]);

      const products = [];
      
      // Add local products
      if (localResponse.ok) {
        const localData = await localResponse.json();
        if (localData.success && localData.data?.products) {
          products.push(...localData.data.products);
        }
      }
      
      // Add master products that might be useful for discovery
      if (masterResponse.success && masterResponse.data) {
        const masterProducts = masterResponse.data.map(mp => ({
          id: `master_${mp.id}`,
          name: mp.name,
          description: mp.description,
          price: mp.recommendedPrice || mp.standardPrice || 0,
          category: mp.category,
          barcode: mp.barcode,
          stock: 0, // Master products don't have stock in local inventory
          taxRate: mp.taxRate,
          icon: mp.icon,
          brand: mp.brand,
          isMasterProduct: true,
          masterProductId: mp.id
        }));
        
        // Only add master products that aren't already in local inventory
        const localBarcodes = new Set(products.map(p => p.barcode));
        const uniqueMasterProducts = masterProducts.filter(mp => 
          !localBarcodes.has(mp.barcode)
        );
        
        products.push(...uniqueMasterProducts);
      }

      return {
        success: true,
        data: { products },
        error: null
      };
    } catch (error) {
      console.error('Enhanced products fetch error:', error);
      return {
        success: false,
        error: 'Failed to fetch products',
        data: null
      };
    }
  }

  // Get categories (enhanced with master product categories)
  async getCategories() {
    try {
      const [localResponse, masterResponse] = await Promise.all([
        fetch(`/api/categories`, {
          headers: { 'X-Tenant-ID': this.tenantId }
        }),
        tenantAPI.getMasterProductCategories()
      ]);

      const categories = new Set();
      
      // Add local categories
      if (localResponse.ok) {
        const localData = await localResponse.json();
        if (localData.success && localData.data) {
          localData.data.forEach(cat => categories.add(cat.name));
        }
      }
      
      // Add master product categories
      if (masterResponse.success && masterResponse.data) {
        masterResponse.data.forEach(cat => categories.add(cat.name));
      }

      const categoryList = Array.from(categories).map(name => ({ 
        name: name as string, 
        count: 1 
      }));

      return {
        success: true,
        data: categoryList,
        error: null
      };
    } catch (error) {
      console.error('Enhanced categories fetch error:', error);
      return {
        success: false,
        error: 'Failed to fetch categories',
        data: null
      };
    }
  }

  // Process transaction (tenant-aware)
  async processTransaction(transactionData: any) {
    try {
      return await tenantAPI.processTransaction(this.tenantId, transactionData);
    } catch (error) {
      console.error('Enhanced transaction processing error:', error);
      return {
        success: false,
        error: 'Failed to process transaction',
        data: null
      };
    }
  }

  // Get daily sales (tenant-aware)
  async getDailySales(date: string) {
    try {
      return await tenantAPI.getDailySales(this.tenantId, date);
    } catch (error) {
      console.error('Enhanced daily sales fetch error:', error);
      return {
        success: false,
        error: 'Failed to fetch daily sales',
        data: null
      };
    }
  }

  // Get inventory status
  async getInventoryStatus() {
    try {
      return await tenantAPI.getTenantInventory(this.tenantId);
    } catch (error) {
      console.error('Enhanced inventory status fetch error:', error);
      return {
        success: false,
        error: 'Failed to fetch inventory status',
        data: null
      };
    }
  }

  // Create daily target
  async createDailyTarget(targetData: any) {
    try {
      return await tenantAPI.createDailyTarget(this.tenantId, targetData);
    } catch (error) {
      console.error('Enhanced create daily target error:', error);
      return {
        success: false,
        error: 'Failed to create daily target',
        data: null
      };
    }
  }

  // Update daily target
  async updateDailyTarget(targetId: string, updates: any) {
    try {
      return await tenantAPI.updateDailyTarget(this.tenantId, targetId, updates);
    } catch (error) {
      console.error('Enhanced update daily target error:', error);
      return {
        success: false,
        error: 'Failed to update daily target',
        data: null
      };
    }
  }

  // Delete daily target
  async deleteDailyTarget(targetId: string) {
    try {
      return await tenantAPI.deleteDailyTarget(this.tenantId, targetId);
    } catch (error) {
      console.error('Enhanced delete daily target error:', error);
      return {
        success: false,
        error: 'Failed to delete daily target',
        data: null
      };
    }
  }

  // Get daily targets
  async getDailyTargets(date: string) {
    try {
      return await tenantAPI.getDailyTargets(this.tenantId, date);
    } catch (error) {
      console.error('Enhanced daily targets fetch error:', error);
      return {
        success: false,
        error: 'Failed to fetch daily targets',
        data: null
      };
    }
  }
}

// Export singleton instance
export const enhancedCashierAPI = new EnhancedCashierAPI();

// Also update the existing cashier API to use enhanced version
export const cashierAPI = enhancedCashierAPI;