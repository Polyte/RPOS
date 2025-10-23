import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import * as kv from './kv_store.tsx';

export const productRoutes = new Hono();

// Enable CORS for all routes
productRoutes.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Default products for cashier interface
const defaultProducts = [
  {
    id: "prod_001",
    name: "Premium Coffee",
    price: 25.50,
    barcode: "7894561230123",
    category: "Beverages",
    stock: 45,
    image: "/images/coffee.jpg",
    icon: "Coffee",
    color: "text-amber-600",
    taxRate: 0.15,
    description: "Rich, aromatic premium coffee blend"
  },
  {
    id: "prod_002", 
    name: "Artisan Sandwich",
    price: 45.90,
    barcode: "7894561230124",
    category: "Food",
    stock: 28,
    image: "/images/sandwich.jpg",
    icon: "Sandwich",
    color: "text-orange-600",
    taxRate: 0.15,
    description: "Fresh artisan sandwich with premium ingredients"
  },
  {
    id: "prod_003",
    name: "Spring Water",
    price: 8.50,
    barcode: "7894561230125",
    category: "Beverages", 
    stock: 120,
    image: "/images/water.jpg",
    icon: "Droplets",
    color: "text-blue-600",
    taxRate: 0.15,
    description: "Pure natural spring water"
  },
  {
    id: "prod_004",
    name: "Gourmet Chips",
    price: 18.90,
    barcode: "7894561230126",
    category: "Snacks",
    stock: 35,
    image: "/images/chips.jpg",
    icon: "Package2",
    color: "text-yellow-600",
    taxRate: 0.15,
    description: "Crispy gourmet potato chips"
  },
  {
    id: "prod_005",
    name: "Energy Boost",
    price: 22.90,
    barcode: "7894561230127",
    category: "Beverages",
    stock: 8,
    image: "/images/energy.jpg",
    icon: "Zap",
    color: "text-green-600",
    taxRate: 0.15,
    description: "Natural energy drink with vitamins"
  },
  {
    id: "prod_006",
    name: "Dark Chocolate",
    price: 28.50,
    barcode: "7894561230128",
    category: "Snacks",
    stock: 5,
    image: "/images/chocolate.jpg",
    icon: "Heart",
    color: "text-red-600",
    taxRate: 0.15,
    description: "Premium dark chocolate bar"
  },
  {
    id: "prod_007",
    name: "Fresh Smoothie",
    price: 38.90,
    barcode: "7894561230129",
    category: "Beverages",
    stock: 22,
    image: "/images/smoothie.jpg",
    icon: "GlassWater",
    color: "text-pink-600",
    taxRate: 0.15,
    description: "Fresh fruit smoothie blend"
  },
  {
    id: "prod_008",
    name: "Protein Bar",
    price: 19.90,
    barcode: "7894561230130",
    category: "Snacks",
    stock: 42,
    image: "/images/protein.jpg",
    icon: "Dumbbell",
    color: "text-purple-600",
    taxRate: 0.15,
    description: "High-protein energy bar"
  },
  {
    id: "prod_009",
    name: "Fresh Croissant",
    price: 15.50,
    barcode: "7894561230131",
    category: "Food",
    stock: 18,
    image: "/images/croissant.jpg",
    icon: "Croissant",
    color: "text-yellow-700",
    taxRate: 0.15,
    description: "Buttery fresh-baked croissant"
  },
  {
    id: "prod_010",
    name: "Organic Milk",
    price: 12.90,
    barcode: "7894561230132",
    category: "Beverages",
    stock: 25,
    image: "/images/milk.jpg",
    icon: "Milk",
    color: "text-blue-500",
    taxRate: 0.15,
    description: "Fresh organic whole milk"
  }
];

// Initialize default products if not exists
const initializeProducts = async () => {
  try {
    const existingProducts = await kv.get('cashier_products');
    if (!existingProducts) {
      await kv.set('cashier_products', defaultProducts);
      console.log('Initialized default cashier products');
    }
  } catch (error) {
    console.log('Error initializing products:', error);
  }
};

// Export functions for server initialization
export const initializeDemoProducts = async () => {
  return await initializeProducts();
};

export const getProducts = async () => {
  try {
    const products = await kv.get('cashier_products') || defaultProducts;
    const inventoryItems = await kv.get('inventory_items') || [];
    const managerInventory = await kv.get('manager_inventory') || [];
    
    // Sync stock levels across all systems for accurate inventory
    const syncedProducts = products.map((product: any) => {
      // Find corresponding inventory items
      const inventoryItem = inventoryItems.find((item: any) => 
        item.id === product.id || item.name === product.name
      );
      
      const managerItem = managerInventory.find((item: any) => 
        item.productId === product.id || item.name === product.name
      );
      
      // Use the most restrictive stock level (lowest) for accuracy
      let syncedStock = product.stock || 0;
      
      if (inventoryItem && inventoryItem.currentStock !== undefined) {
        syncedStock = Math.min(syncedStock, inventoryItem.currentStock);
      }
      
      if (managerItem && managerItem.currentStock !== undefined) {
        syncedStock = Math.min(syncedStock, managerItem.currentStock);
      }
      
      return {
        ...product,
        stock: Math.max(0, syncedStock), // Ensure non-negative stock
        lowStockAlert: syncedStock <= 10,
        lastSync: new Date().toISOString(),
        totalSold: (inventoryItem?.totalSold || 0) + (managerItem?.totalSold || 0),
        lastUpdated: new Date().toISOString()
      };
    });
    
    // Update the synced stock levels back to storage
    await kv.set('cashier_products', syncedProducts);
    
    // Calculate summary statistics with synced data
    const totalProducts = syncedProducts.length;
    const totalValue = syncedProducts.reduce((sum: number, product: any) => sum + (product.stock * product.price), 0);
    const lowStockProducts = syncedProducts.filter((product: any) => product.stock <= 10).length;
    const outOfStockProducts = syncedProducts.filter((product: any) => product.stock === 0).length;
    
    return {
      success: true,
      data: {
        products: syncedProducts,
        summary: {
          totalProducts,
          totalValue,
          lowStockProducts,
          outOfStockProducts,
          lastInventorySync: new Date().toISOString()
        }
      }
    };
  } catch (error) {
    console.log('Error fetching products:', error);
    return { success: false, error: 'Failed to fetch products' };
  }
};

export const getProductByBarcode = async (barcode: string) => {
  try {
    const products = await kv.get('cashier_products') || [];
    
    const product = products.find((product: any) => product.barcode === barcode);
    
    if (!product) {
      return { success: false, error: 'Product not found', data: null };
    }
    
    return { success: true, data: product };
  } catch (error) {
    console.log('Error fetching product by barcode:', error);
    return { success: false, error: 'Failed to fetch product', data: null };
  }
};

export const getCategories = async () => {
  try {
    const products = await kv.get('cashier_products') || [];
    const categories = [...new Set(products.map((product: any) => product.category))];
    
    const categoriesWithCount = categories.map(category => ({
      name: category,
      count: products.filter((product: any) => product.category === category).length
    }));
    
    return {
      success: true,
      data: categoriesWithCount
    };
  } catch (error) {
    console.log('Error fetching categories:', error);
    return { success: false, error: 'Failed to fetch categories' };
  }
};

// Initialize on startup
initializeProducts();

// GET /products - Get all products for cashier with real-time inventory sync
productRoutes.get('/products', async (c) => {
  try {
    const result = await getProducts();
    return c.json(result);
  } catch (error) {
    console.log('Error fetching products:', error);
    return c.json({ success: false, error: 'Failed to fetch products' }, 500);
  }
});

// GET /products/search/:query - Search products by name or barcode
productRoutes.get('/products/search/:query', async (c) => {
  try {
    const query = c.req.param('query').toLowerCase();
    const products = await kv.get('cashier_products') || [];
    
    const matchedProducts = products.filter((product: any) => 
      product.name.toLowerCase().includes(query) ||
      product.barcode.includes(query) ||
      product.category.toLowerCase().includes(query)
    );
    
    return c.json({
      success: true,
      data: matchedProducts,
      count: matchedProducts.length
    });
  } catch (error) {
    console.log('Error searching products:', error);
    return c.json({ success: false, error: 'Failed to search products' }, 500);
  }
});

// GET /products/barcode/:barcode - Get product by barcode
productRoutes.get('/products/barcode/:barcode', async (c) => {
  try {
    const barcode = c.req.param('barcode');
    const result = await getProductByBarcode(barcode);
    
    if (!result.success) {
      return c.json(result, 404);
    }
    
    return c.json(result);
  } catch (error) {
    console.log('Error fetching product by barcode:', error);
    return c.json({ success: false, error: 'Failed to fetch product' }, 500);
  }
});

// GET /products/category/:category - Get products by category
productRoutes.get('/products/category/:category', async (c) => {
  try {
    const category = c.req.param('category');
    const products = await kv.get('cashier_products') || [];
    
    const categoryProducts = products.filter((product: any) => 
      product.category.toLowerCase() === category.toLowerCase()
    );
    
    return c.json({
      success: true,
      data: categoryProducts,
      count: categoryProducts.length
    });
  } catch (error) {
    console.log('Error fetching products by category:', error);
    return c.json({ success: false, error: 'Failed to fetch products' }, 500);
  }
});

// PATCH /products/:id/reduce-stock - Reduce product stock (for sales)
productRoutes.patch('/products/:id/reduce-stock', async (c) => {
  try {
    const id = c.req.param('id');
    const { quantity } = await c.req.json();
    const products = await kv.get('cashier_products') || [];
    
    const productIndex = products.findIndex((product: any) => product.id === id);
    if (productIndex === -1) {
      return c.json({ success: false, error: 'Product not found' }, 404);
    }
    
    const currentProduct = products[productIndex];
    
    if (currentProduct.stock < quantity) {
      return c.json({ 
        success: false, 
        error: 'Insufficient stock',
        availableStock: currentProduct.stock
      }, 400);
    }
    
    const updatedProduct = {
      ...currentProduct,
      stock: currentProduct.stock - quantity
    };
    
    products[productIndex] = updatedProduct;
    await kv.set('cashier_products', products);
    
    // Also update inventory items if they exist
    try {
      const inventoryItems = await kv.get('inventory_items') || [];
      const inventoryIndex = inventoryItems.findIndex((item: any) => item.name === currentProduct.name);
      if (inventoryIndex !== -1) {
        inventoryItems[inventoryIndex].currentStock = Math.max(0, inventoryItems[inventoryIndex].currentStock - quantity);
        inventoryItems[inventoryIndex].lastUpdated = new Date().toISOString().split('T')[0];
        await kv.set('inventory_items', inventoryItems);
      }
    } catch (inventoryError) {
      console.log('Error updating inventory:', inventoryError);
    }
    
    return c.json({ 
      success: true, 
      data: updatedProduct,
      stockReduced: quantity,
      newStock: updatedProduct.stock
    });
  } catch (error) {
    console.log('Error reducing stock:', error);
    return c.json({ success: false, error: 'Failed to reduce stock' }, 500);
  }
});

// GET /products/categories - Get all product categories
productRoutes.get('/products/categories', async (c) => {
  try {
    const result = await getCategories();
    return c.json(result);
  } catch (error) {
    console.log('Error fetching categories:', error);
    return c.json({ success: false, error: 'Failed to fetch categories' }, 500);
  }
});