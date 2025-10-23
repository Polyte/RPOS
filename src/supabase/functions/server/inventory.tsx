import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import * as kv from './kv_store.tsx';

export const inventoryRoutes = new Hono();

// Enable CORS for all routes
inventoryRoutes.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Helper function to generate inventory item ID
const generateInventoryId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `INV-${timestamp}-${random.toString().padStart(4, '0')}`;
};

// Demo inventory data
const demoInventoryItems = [
  {
    id: 'INV-001',
    name: 'Premium Coffee',
    category: 'Beverages',
    barcode: '7894561230123',
    unitPrice: 25.50,
    minStock: 10,
    maxStock: 100,
    currentStock: 45,
    reorderLevel: 20,
    supplier: 'Coffee Suppliers Ltd',
    description: 'Rich, aromatic premium coffee blend',
    icon: 'Coffee',
    isActive: true,
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString().split('T')[0],
    totalSold: 155,
    lowStockAlert: false
  },
  {
    id: 'INV-002',
    name: 'Artisan Sandwich',
    category: 'Food',
    barcode: '7894561230124',
    unitPrice: 45.90,
    minStock: 5,
    maxStock: 50,
    currentStock: 28,
    reorderLevel: 10,
    supplier: 'Fresh Foods Co',
    description: 'Fresh artisan sandwich with premium ingredients',
    icon: 'Sandwich',
    isActive: true,
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString().split('T')[0],
    totalSold: 89,
    lowStockAlert: false
  },
  {
    id: 'INV-003',
    name: 'Spring Water',
    category: 'Beverages',
    barcode: '7894561230125',
    unitPrice: 8.50,
    minStock: 20,
    maxStock: 200,
    currentStock: 120,
    reorderLevel: 40,
    supplier: 'Pure Water Systems',
    description: 'Pure natural spring water',
    icon: 'Droplets',
    isActive: true,
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString().split('T')[0],
    totalSold: 267,
    lowStockAlert: false
  }
];

// Initialize demo inventory
const initializeInventory = async () => {
  try {
    const existingItems = await kv.get('inventory_items');
    if (!existingItems || (existingItems as any[]).length === 0) {
      await kv.set('inventory_items', demoInventoryItems);
      console.log('Initialized demo inventory items');
    }
  } catch (error) {
    console.log('Error initializing inventory:', error);
  }
};

// Export functions for server initialization
export const initializeDemoInventory = async () => {
  return await initializeInventory();
};

export const getInventoryItems = async () => {
  try {
    const inventoryItems = await kv.get('inventory_items') || [];
    
    return {
      success: true,
      data: inventoryItems,
      count: (inventoryItems as any[]).length
    };
  } catch (error) {
    console.log('Error fetching inventory items:', error);
    return { 
      success: false, 
      error: 'Failed to fetch inventory items',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const createInventoryItem = async (itemData: any) => {
  try {
    const { name, category, barcode, price, minStock, maxStock, currentStock, reorderLevel, supplier, description, icon, isActive, tenantId } = itemData;
    
    // Validate required fields
    if (!name || !category || price === undefined || currentStock === undefined) {
      return { 
        success: false, 
        error: 'Missing required fields: name, category, price, currentStock' 
      };
    }

    // Generate new inventory item
    const inventoryItem = {
      id: generateInventoryId(),
      name: name.trim(),
      category: category.trim(),
      barcode: barcode || '',
      unitPrice: parseFloat(price) || 0,
      minStock: parseInt(minStock) || 10,
      maxStock: parseInt(maxStock) || 100,
      currentStock: parseInt(currentStock) || 0,
      reorderLevel: parseInt(reorderLevel) || 20,
      supplier: supplier || '',
      description: description || '',
      icon: icon || 'Package2',
      isActive: isActive !== false,
      tenantId: tenantId || 'tenant_default',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString().split('T')[0],
      totalSold: 0,
      lowStockAlert: (parseInt(currentStock) || 0) <= (parseInt(minStock) || 10)
    };

    // Check if item already exists
    const existingItems = await kv.get('inventory_items') || [];
    const itemExists = (existingItems as any[]).some((item: any) => 
      item.name.toLowerCase() === name.toLowerCase().trim() || 
      (barcode && item.barcode === barcode.trim())
    );

    if (itemExists) {
      return { 
        success: false, 
        error: 'Item with this name or barcode already exists' 
      };
    }

    // Add to inventory
    const updatedItems = [...(existingItems as any[]), inventoryItem];
    await kv.set('inventory_items', updatedItems);

    // Also add to cashier products if it doesn't exist
    try {
      const cashierProducts = await kv.get('cashier_products') || [];
      const productExists = (cashierProducts as any[]).some((product: any) => 
        product.name.toLowerCase() === name.toLowerCase().trim()
      );

      if (!productExists) {
        const cashierProduct = {
          id: inventoryItem.id,
          name: inventoryItem.name,
          price: inventoryItem.unitPrice,
          barcode: inventoryItem.barcode,
          category: inventoryItem.category,
          stock: inventoryItem.currentStock,
          image: '/api/placeholder/150/150',
          icon: inventoryItem.icon,
          color: 'text-blue-600',
          taxRate: 0.15,
          description: inventoryItem.description,
          lastUpdated: new Date().toISOString(),
          isActive: inventoryItem.isActive
        };

        const updatedProducts = [...(cashierProducts as any[]), cashierProduct];
        await kv.set('cashier_products', updatedProducts);
      }
    } catch (error) {
      console.log('Warning: Could not sync with cashier products:', error);
    }

    console.log('Inventory item created successfully:', inventoryItem.id);
    
    return {
      success: true,
      data: inventoryItem,
      message: 'Inventory item created successfully'
    };
    
  } catch (error) {
    console.log('Error creating inventory item:', error);
    return { 
      success: false, 
      error: 'Failed to create inventory item',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Initialize on startup
initializeInventory();

// GET /inventory/status - Get real-time inventory status
inventoryRoutes.get('/inventory/status', async (c) => {
  try {
    console.log('Getting inventory status');
    
    const [products, inventoryItems, managerInventory] = await Promise.all([
      kv.get('cashier_products') || [],
      kv.get('inventory_items') || [],
      kv.get('manager_inventory') || []
    ]);
    
    // Compile comprehensive inventory status
    const inventoryStatus = {
      products: (products as any[]).map((product: any) => ({
        id: product.id,
        name: product.name,
        currentStock: product.stock || 0,
        lowStockAlert: (product.stock || 0) <= 10,
        lastUpdated: product.lastUpdated || new Date().toISOString()
      })),
      lowStockItems: (products as any[]).filter((product: any) => (product.stock || 0) <= 10),
      totalProducts: (products as any[]).length,
      totalItems: (products as any[]).reduce((sum: number, product: any) => sum + (product.stock || 0), 0),
      totalValue: (products as any[]).reduce((sum: number, product: any) => sum + ((product.stock || 0) * (product.price || 0)), 0),
      lastSync: new Date().toISOString()
    };
    
    return c.json({
      success: true,
      data: inventoryStatus
    });
  } catch (error) {
    console.log('Error fetching inventory status:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to fetch inventory status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// POST /inventory/sync - Force inventory synchronization
inventoryRoutes.post('/inventory/sync', async (c) => {
  try {
    console.log('Syncing inventory across all systems');
    
    const [products, inventoryItems, managerInventory] = await Promise.all([
      kv.get('cashier_products') || [],
      kv.get('inventory_items') || [],
      kv.get('manager_inventory') || []
    ]);
    
    // Sync inventory across all systems
    const syncedInventory = [];
    
    for (const product of (products as any[])) {
      // Find corresponding inventory items
      const inventoryItem = (inventoryItems as any[]).find((item: any) => 
        item.id === product.id || item.name === product.name
      );
      
      const managerItem = (managerInventory as any[]).find((item: any) => 
        item.productId === product.id || item.name === product.name
      );
      
      const syncedItem = {
        id: product.id,
        name: product.name,
        currentStock: product.stock || 0,
        price: product.price || 0,
        category: product.category || 'General',
        lastUpdated: new Date().toISOString(),
        lowStockAlert: (product.stock || 0) <= 10,
        totalSold: (inventoryItem?.totalSold || 0) + (managerItem?.totalSold || 0),
        reorderLevel: inventoryItem?.reorderLevel || 20,
        minStock: inventoryItem?.minStock || 10
      };
      
      syncedInventory.push(syncedItem);
    }
    
    // Update all inventory systems with synced data
    await kv.set('synced_inventory', syncedInventory);
    
    return c.json({
      success: true,
      data: {
        syncedItems: syncedInventory.length,
        totalStock: syncedInventory.reduce((sum, item) => sum + item.currentStock, 0),
        lowStockItems: syncedInventory.filter(item => item.lowStockAlert).length,
        lastSync: new Date().toISOString()
      },
      message: 'Inventory synchronized successfully'
    });
  } catch (error) {
    console.log('Error syncing inventory:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to sync inventory',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// GET /inventory/items - Get all inventory items
inventoryRoutes.get('/inventory/items', async (c) => {
  try {
    console.log('Getting all inventory items');
    
    const result = await getInventoryItems();
    return c.json(result);
  } catch (error) {
    console.log('Error fetching inventory items:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to fetch inventory items',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// POST /inventory/items - Create new inventory item
inventoryRoutes.post('/inventory/items', async (c) => {
  try {
    const body = await c.req.json();
    console.log('Creating new inventory item:', body);
    
    const result = await createInventoryItem(body);
    
    if (!result.success) {
      return c.json(result, 400);
    }
    
    return c.json(result);
    
  } catch (error) {
    console.log('Error creating inventory item:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to create inventory item',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// PUT /inventory/items/:id - Update inventory item
inventoryRoutes.put('/inventory/items/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    console.log('Updating inventory item:', id, body);
    
    if (!id) {
      return c.json({ 
        success: false, 
        error: 'Item ID is required' 
      }, 400);
    }

    const inventoryItems = await kv.get('inventory_items') || [];
    const itemIndex = (inventoryItems as any[]).findIndex((item: any) => item.id === id);

    if (itemIndex === -1) {
      return c.json({ 
        success: false, 
        error: 'Inventory item not found' 
      }, 404);
    }

    // Update item
    const updatedItem = {
      ...(inventoryItems as any[])[itemIndex],
      ...body,
      lastUpdated: new Date().toISOString().split('T')[0],
      lowStockAlert: (body.currentStock !== undefined ? body.currentStock : (inventoryItems as any[])[itemIndex].currentStock) <= ((inventoryItems as any[])[itemIndex].minStock || 10)
    };

    (inventoryItems as any[])[itemIndex] = updatedItem;
    await kv.set('inventory_items', inventoryItems);

    // Also update cashier products if it exists
    try {
      const cashierProducts = await kv.get('cashier_products') || [];
      const productIndex = (cashierProducts as any[]).findIndex((product: any) => product.id === id);

      if (productIndex !== -1) {
        (cashierProducts as any[])[productIndex] = {
          ...(cashierProducts as any[])[productIndex],
          name: updatedItem.name,
          price: updatedItem.unitPrice,
          stock: updatedItem.currentStock,
          category: updatedItem.category,
          barcode: updatedItem.barcode,
          description: updatedItem.description,
          lastUpdated: new Date().toISOString()
        };

        await kv.set('cashier_products', cashierProducts);
      }
    } catch (error) {
      console.log('Warning: Could not sync with cashier products:', error);
    }
    
    return c.json({
      success: true,
      data: updatedItem,
      message: 'Inventory item updated successfully'
    });
    
  } catch (error) {
    console.log('Error updating inventory item:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to update inventory item',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// DELETE /inventory/items/:id - Delete inventory item
inventoryRoutes.delete('/inventory/items/:id', async (c) => {
  try {
    const id = c.req.param('id');
    console.log('Deleting inventory item:', id);
    
    if (!id) {
      return c.json({ 
        success: false, 
        error: 'Item ID is required' 
      }, 400);
    }

    const inventoryItems = await kv.get('inventory_items') || [];
    const itemIndex = (inventoryItems as any[]).findIndex((item: any) => item.id === id);

    if (itemIndex === -1) {
      return c.json({ 
        success: false, 
        error: 'Inventory item not found' 
      }, 404);
    }

    // Remove item
    const deletedItem = (inventoryItems as any[]).splice(itemIndex, 1)[0];
    await kv.set('inventory_items', inventoryItems);

    // Also remove from cashier products if it exists
    try {
      const cashierProducts = await kv.get('cashier_products') || [];
      const productIndex = (cashierProducts as any[]).findIndex((product: any) => product.id === id);

      if (productIndex !== -1) {
        (cashierProducts as any[]).splice(productIndex, 1);
        await kv.set('cashier_products', cashierProducts);
      }
    } catch (error) {
      console.log('Warning: Could not sync with cashier products:', error);
    }
    
    return c.json({
      success: true,
      data: deletedItem,
      message: 'Inventory item deleted successfully'
    });
    
  } catch (error) {
    console.log('Error deleting inventory item:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to delete inventory item',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// GET /inventory/low-stock - Get low stock items
inventoryRoutes.get('/inventory/low-stock', async (c) => {
  try {
    console.log('Getting low stock items');
    
    const inventoryItems = await kv.get('inventory_items') || [];
    const lowStockItems = (inventoryItems as any[]).filter((item: any) => 
      item.currentStock <= (item.minStock || 10)
    );
    
    return c.json({
      success: true,
      data: lowStockItems,
      count: lowStockItems.length
    });
  } catch (error) {
    console.log('Error fetching low stock items:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to fetch low stock items',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// GET /inventory/categories - Get inventory categories
inventoryRoutes.get('/inventory/categories', async (c) => {
  try {
    console.log('Getting inventory categories');
    
    const inventoryItems = await kv.get('inventory_items') || [];
    const categories = [...new Set((inventoryItems as any[]).map((item: any) => item.category))];
    const categoriesWithCounts = categories.map(category => ({
      name: category,
      count: (inventoryItems as any[]).filter((item: any) => item.category === category).length
    }));
    
    return c.json({
      success: true,
      data: categoriesWithCounts
    });
  } catch (error) {
    console.log('Error fetching inventory categories:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to fetch inventory categories',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Health check endpoint
inventoryRoutes.get('/inventory/health', async (c) => {
  return c.json({
    success: true,
    message: 'Inventory service is healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});