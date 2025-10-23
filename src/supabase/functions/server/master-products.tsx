import * as kv from './kv_store.tsx';

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
  specifications?: {
    weight?: number;
    dimensions?: {
      length?: number;
      width?: number;
      height?: number;
    };
    color?: string;
    size?: string;
    material?: string;
  };
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
}

export interface ProductVariant {
  id: string;
  masterProductId: string;
  name: string;
  barcode: string;
  price: number;
  specifications: Record<string, any>;
  isActive: boolean;
}

export class MasterProductService {
  private static getKey(suffix: string): string {
    return `master_product:${suffix}`;
  }

  static async createProduct(productData: Omit<MasterProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<MasterProduct> {
    const product: MasterProduct = {
      id: `mp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(this.getKey(product.id), JSON.stringify(product));
    
    // Add to product list
    const productList = await this.getAllProducts();
    productList.push(product);
    await kv.set(this.getKey('list'), JSON.stringify(productList));

    // Index by barcode
    await kv.set(this.getKey(`barcode:${product.barcode}`), product.id);
    
    // Index alternative barcodes
    if (product.alternativeBarcodes) {
      for (const altBarcode of product.alternativeBarcodes) {
        await kv.set(this.getKey(`barcode:${altBarcode}`), product.id);
      }
    }

    // Index by category
    await this.updateCategoryIndex(product.category, product.id, 'add');

    return product;
  }

  static async getProduct(productId: string): Promise<MasterProduct | null> {
    try {
      const data = await kv.get(this.getKey(productId));
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  static async getProductByBarcode(barcode: string): Promise<MasterProduct | null> {
    try {
      const productId = await kv.get(this.getKey(`barcode:${barcode}`));
      if (!productId) return null;
      return this.getProduct(productId);
    } catch {
      return null;
    }
  }

  static async getAllProducts(): Promise<MasterProduct[]> {
    try {
      const data = await kv.get(this.getKey('list'));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static async searchProducts(query: string): Promise<MasterProduct[]> {
    const allProducts = await this.getAllProducts();
    const searchTerm = query.toLowerCase();
    
    return allProducts.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.brand?.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm) ||
      product.barcode.includes(query) ||
      product.alternativeBarcodes?.some(bc => bc.includes(query)) ||
      product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  static async getProductsByCategory(category: string): Promise<MasterProduct[]> {
    try {
      const categoryData = await kv.get(this.getKey(`category:${category}`));
      if (!categoryData) return [];
      
      const productIds: string[] = JSON.parse(categoryData);
      const products = [];
      
      for (const productId of productIds) {
        const product = await this.getProduct(productId);
        if (product && product.isActive) {
          products.push(product);
        }
      }
      
      return products;
    } catch {
      return [];
    }
  }

  static async updateProduct(productId: string, updates: Partial<MasterProduct>): Promise<MasterProduct | null> {
    const product = await this.getProduct(productId);
    if (!product) return null;

    const updatedProduct = {
      ...product,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await kv.set(this.getKey(productId), JSON.stringify(updatedProduct));
    
    // Update in product list
    const productList = await this.getAllProducts();
    const index = productList.findIndex(p => p.id === productId);
    if (index >= 0) {
      productList[index] = updatedProduct;
      await kv.set(this.getKey('list'), JSON.stringify(productList));
    }

    // Update barcode indices if barcode changed
    if (updates.barcode && updates.barcode !== product.barcode) {
      await kv.del(this.getKey(`barcode:${product.barcode}`));
      await kv.set(this.getKey(`barcode:${updates.barcode}`), productId);
    }

    // Update category index if category changed
    if (updates.category && updates.category !== product.category) {
      await this.updateCategoryIndex(product.category, productId, 'remove');
      await this.updateCategoryIndex(updates.category, productId, 'add');
    }

    return updatedProduct;
  }

  static async deleteProduct(productId: string): Promise<boolean> {
    try {
      const product = await this.getProduct(productId);
      if (!product) return false;

      await kv.del(this.getKey(productId));
      
      // Remove from product list
      const productList = await this.getAllProducts();
      const filteredList = productList.filter(p => p.id !== productId);
      await kv.set(this.getKey('list'), JSON.stringify(filteredList));

      // Remove barcode indices
      await kv.del(this.getKey(`barcode:${product.barcode}`));
      if (product.alternativeBarcodes) {
        for (const altBarcode of product.alternativeBarcodes) {
          await kv.del(this.getKey(`barcode:${altBarcode}`));
        }
      }

      // Remove from category index
      await this.updateCategoryIndex(product.category, productId, 'remove');

      return true;
    } catch {
      return false;
    }
  }

  private static async updateCategoryIndex(category: string, productId: string, action: 'add' | 'remove'): Promise<void> {
    try {
      const key = this.getKey(`category:${category}`);
      const data = await kv.get(key);
      let productIds: string[] = data ? JSON.parse(data) : [];

      if (action === 'add' && !productIds.includes(productId)) {
        productIds.push(productId);
      } else if (action === 'remove') {
        productIds = productIds.filter(id => id !== productId);
      }

      await kv.set(key, JSON.stringify(productIds));
    } catch (error) {
      console.error('Error updating category index:', error);
    }
  }

  static async getCategories(): Promise<Array<{ name: string; count: number }>> {
    const products = await this.getAllProducts();
    const categoryMap = new Map<string, number>();

    products.forEach(product => {
      if (product.isActive) {
        categoryMap.set(product.category, (categoryMap.get(product.category) || 0) + 1);
      }
    });

    return Array.from(categoryMap.entries()).map(([name, count]) => ({ name, count }));
  }

  static async getBrands(): Promise<string[]> {
    const products = await this.getAllProducts();
    const brands = new Set<string>();

    products.forEach(product => {
      if (product.brand && product.isActive) {
        brands.add(product.brand);
      }
    });

    return Array.from(brands).sort();
  }

  static async getPopularProducts(limit: number = 20): Promise<MasterProduct[]> {
    // For now, return most recently created products
    // In a real implementation, you'd track usage/sales statistics
    const products = await this.getAllProducts();
    return products
      .filter(p => p.isActive)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
}

// Initialize demo master products
export async function initializeDemoMasterProducts() {
  const existingProducts = await MasterProductService.getAllProducts();
  if (existingProducts.length > 0) return;

  const demoProducts: Omit<MasterProduct, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      name: 'Premium Coffee Blend',
      description: 'Rich, aromatic coffee blend perfect for any time of day',
      category: 'Beverages',
      subcategory: 'Coffee',
      barcode: '1234567890123',
      brand: 'Roxton Coffee Co.',
      manufacturer: 'Local Coffee Roasters',
      unitType: 'item',
      standardPrice: 45.00,
      recommendedPrice: 55.00,
      taxRate: 0.15,
      icon: 'Coffee',
      specifications: {
        weight: 500,
        material: 'Ground Coffee'
      },
      tags: ['coffee', 'premium', 'blend', 'aromatic'],
      isActive: true,
      createdBy: 'system',
      lastModifiedBy: 'system'
    },
    {
      name: 'Artisan Sandwich',
      description: 'Freshly made gourmet sandwich with premium ingredients',
      category: 'Food',
      subcategory: 'Sandwiches',
      barcode: '2345678901234',
      brand: 'Roxton Deli',
      unitType: 'item',
      standardPrice: 89.00,
      recommendedPrice: 95.00,
      taxRate: 0.15,
      icon: 'Sandwich',
      specifications: {
        weight: 350
      },
      tags: ['sandwich', 'fresh', 'gourmet', 'artisan'],
      isActive: true,
      createdBy: 'system',
      lastModifiedBy: 'system'
    },
    {
      name: 'Natural Spring Water',
      description: 'Pure natural spring water from pristine sources',
      category: 'Beverages',
      subcategory: 'Water',
      barcode: '3456789012345',
      brand: 'Crystal Springs',
      unitType: 'item',
      standardPrice: 18.50,
      recommendedPrice: 22.00,
      taxRate: 0.15,
      icon: 'Droplets',
      specifications: {
        weight: 500,
        material: 'Plastic Bottle'
      },
      tags: ['water', 'natural', 'spring', 'pure'],
      isActive: true,
      createdBy: 'system',
      lastModifiedBy: 'system'
    },
    {
      name: 'Energy Boost Drink',
      description: 'Energizing drink with natural ingredients and vitamins',
      category: 'Beverages',
      subcategory: 'Energy Drinks',
      barcode: '4567890123456',
      brand: 'PowerUp',
      unitType: 'item',
      standardPrice: 35.90,
      recommendedPrice: 39.90,
      taxRate: 0.15,
      icon: 'Zap',
      specifications: {
        weight: 330,
        material: 'Aluminum Can'
      },
      tags: ['energy', 'boost', 'vitamins', 'natural'],
      isActive: true,
      createdBy: 'system',
      lastModifiedBy: 'system'
    },
    {
      name: 'Gourmet Chocolate Bar',
      description: 'Premium dark chocolate bar with 70% cocoa content',
      category: 'Snacks',
      subcategory: 'Chocolate',
      barcode: '5678901234567',
      brand: 'Choco Deluxe',
      unitType: 'item',
      standardPrice: 42.50,
      recommendedPrice: 48.00,
      taxRate: 0.15,
      icon: 'Heart',
      specifications: {
        weight: 100,
        material: '70% Dark Chocolate'
      },
      tags: ['chocolate', 'gourmet', 'dark', 'premium'],
      isActive: true,
      createdBy: 'system',
      lastModifiedBy: 'system'
    },
    {
      name: 'Fresh Smoothie Mix',
      description: 'Healthy smoothie blend with fruits and superfoods',
      category: 'Beverages',
      subcategory: 'Smoothies',
      barcode: '6789012345678',
      brand: 'Health Plus',
      unitType: 'item',
      standardPrice: 65.00,
      recommendedPrice: 72.00,
      taxRate: 0.15,
      icon: 'GlassWater',
      specifications: {
        weight: 400
      },
      tags: ['smoothie', 'healthy', 'fruits', 'superfoods'],
      isActive: true,
      createdBy: 'system',
      lastModifiedBy: 'system'
    }
  ];

  for (const productData of demoProducts) {
    await MasterProductService.createProduct(productData);
  }
}