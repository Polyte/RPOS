import { TRANSACTION_CONSTANTS } from './transaction-constants.tsx';
import * as kv from './kv_store.tsx';

export interface StockUpdateError {
  productId: string;
  productName: string;
  requestedQuantity: number;
  availableStock: number;
  error?: string;
}

export interface StockUpdate {
  productIndex: number;
  product: any;
  quantityToReduce: number;
  newStock: number;
}

// Check stock availability for all items
export const checkStockAvailability = async (items: any[]): Promise<{
  isAvailable: boolean;
  stockUpdates: StockUpdate[];
  errors: StockUpdateError[];
}> => {
  const products = await kv.get(TRANSACTION_CONSTANTS.STORAGE_KEYS.CASHIER_PRODUCTS) || [];
  const stockUpdates: StockUpdate[] = [];
  const errors: StockUpdateError[] = [];

  for (const item of items) {
    const productIndex = (products as any[]).findIndex((product: any) => product.id === item.id);
    
    if (productIndex === -1) {
      errors.push({
        productId: item.id,
        productName: item.name,
        requestedQuantity: item.quantity,
        availableStock: 0,
        error: TRANSACTION_CONSTANTS.ERRORS.PRODUCT_NOT_FOUND
      });
      continue;
    }

    const product = (products as any[])[productIndex];
    
    if (product.stock >= item.quantity) {
      stockUpdates.push({
        productIndex,
        product,
        quantityToReduce: item.quantity,
        newStock: product.stock - item.quantity
      });
    } else {
      errors.push({
        productId: item.id,
        productName: item.name,
        requestedQuantity: item.quantity,
        availableStock: product.stock
      });
    }
  }

  return {
    isAvailable: errors.length === 0,
    stockUpdates,
    errors
  };
};

// Apply stock reductions
export const applyStockReductions = async (stockUpdates: StockUpdate[]): Promise<void> => {
  const products = await kv.get(TRANSACTION_CONSTANTS.STORAGE_KEYS.CASHIER_PRODUCTS) || [];
  
  for (const update of stockUpdates) {
    (products as any[])[update.productIndex].stock = update.newStock;
    (products as any[])[update.productIndex].lastUpdated = new Date().toISOString();
    
    // Track low stock warnings
    if (update.newStock <= TRANSACTION_CONSTANTS.CONFIG.LOW_STOCK_THRESHOLD) {
      (products as any[])[update.productIndex].lowStockAlert = true;
    }
  }
  
  await kv.set(TRANSACTION_CONSTANTS.STORAGE_KEYS.CASHIER_PRODUCTS, products);
};

// Update global products inventory
export const updateGlobalProducts = async (stockUpdates: StockUpdate[]): Promise<void> => {
  try {
    const globalProducts = await kv.get(TRANSACTION_CONSTANTS.STORAGE_KEYS.PRODUCTS) || [];
    
    for (const update of stockUpdates) {
      const globalIndex = (globalProducts as any[]).findIndex((p: any) => p.id === update.product.id);
      if (globalIndex !== -1) {
        (globalProducts as any[])[globalIndex].stock = update.newStock;
        (globalProducts as any[])[globalIndex].lastUpdated = new Date().toISOString();
        
        if (update.newStock <= TRANSACTION_CONSTANTS.CONFIG.LOW_STOCK_THRESHOLD) {
          (globalProducts as any[])[globalIndex].lowStockAlert = true;
        }
      }
    }
    
    await kv.set(TRANSACTION_CONSTANTS.STORAGE_KEYS.PRODUCTS, globalProducts);
  } catch (error) {
    console.log('Error updating global product inventory:', error);
    // Non-critical error, don't throw
  }
};

// Update inventory items
export const updateInventoryItems = async (items: any[]): Promise<void> => {
  try {
    const inventoryItems = await kv.get(TRANSACTION_CONSTANTS.STORAGE_KEYS.INVENTORY_ITEMS) || [];
    const updatedInventoryItems = [...(inventoryItems as any[])];
    
    for (const item of items) {
      // Try to match by name first, then by ID
      const inventoryIndex = (inventoryItems as any[]).findIndex((invItem: any) => 
        invItem.name === item.name || invItem.id === item.id
      );
      
      if (inventoryIndex !== -1) {
        const currentStock = updatedInventoryItems[inventoryIndex].currentStock || 0;
        const newStock = Math.max(0, currentStock - item.quantity);
        
        updatedInventoryItems[inventoryIndex] = {
          ...updatedInventoryItems[inventoryIndex],
          currentStock: newStock,
          lastUpdated: new Date().toISOString().split('T')[0],
          lastSale: new Date().toISOString(),
          totalSold: (updatedInventoryItems[inventoryIndex].totalSold || 0) + item.quantity,
          lowStockAlert: newStock <= (updatedInventoryItems[inventoryIndex].minStock || TRANSACTION_CONSTANTS.CONFIG.LOW_STOCK_THRESHOLD)
        };
      } else {
        // Create new inventory item if it doesn't exist
        const newInventoryItem = {
          id: item.id,
          name: item.name,
          currentStock: Math.max(0, item.quantity || 0),
          minStock: TRANSACTION_CONSTANTS.CONFIG.LOW_STOCK_THRESHOLD,
          maxStock: 100,
          reorderLevel: 20,
          totalSold: item.quantity,
          lastSale: new Date().toISOString(),
          lastUpdated: new Date().toISOString().split('T')[0],
          lowStockAlert: true
        };
        updatedInventoryItems.push(newInventoryItem);
      }
    }
    
    await kv.set(TRANSACTION_CONSTANTS.STORAGE_KEYS.INVENTORY_ITEMS, updatedInventoryItems);
    
    // Also update manager inventory
    await updateManagerInventory(items);
    
  } catch (error) {
    console.log('Error updating inventory:', error);
    // Non-critical error, don't throw
  }
};

// Update manager inventory
export const updateManagerInventory = async (items: any[]): Promise<void> => {
  try {
    const managerInventory = await kv.get(TRANSACTION_CONSTANTS.STORAGE_KEYS.MANAGER_INVENTORY) || [];
    const updatedManagerInventory = [...(managerInventory as any[])];
    
    for (const item of items) {
      const managerIndex = (managerInventory as any[]).findIndex((invItem: any) => 
        invItem.name === item.name || invItem.productId === item.id
      );
      
      if (managerIndex !== -1) {
        const currentStock = updatedManagerInventory[managerIndex].currentStock || 0;
        updatedManagerInventory[managerIndex] = {
          ...updatedManagerInventory[managerIndex],
          currentStock: Math.max(0, currentStock - item.quantity),
          lastUpdated: new Date().toISOString(),
          totalSold: (updatedManagerInventory[managerIndex].totalSold || 0) + item.quantity
        };
      }
    }
    
    await kv.set(TRANSACTION_CONSTANTS.STORAGE_KEYS.MANAGER_INVENTORY, updatedManagerInventory);
  } catch (error) {
    console.log('Error updating manager inventory:', error);
    // Non-critical error, don't throw
  }
};

// Complete stock update process
export const processStockUpdates = async (items: any[]): Promise<{
  success: boolean;
  errors?: StockUpdateError[];
}> => {
  // Check stock availability
  const { isAvailable, stockUpdates, errors } = await checkStockAvailability(items);
  
  if (!isAvailable) {
    return { success: false, errors };
  }
  
  // Apply all stock updates
  await applyStockReductions(stockUpdates);
  await updateGlobalProducts(stockUpdates);
  await updateInventoryItems(items);
  
  return { success: true };
};