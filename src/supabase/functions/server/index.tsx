import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';

// Import existing services
import * as transactionService from './transactions.tsx';
import * as productService from './products.tsx';
import * as inventoryService from './inventory.tsx';
import * as dailyTargetsService from './daily-targets.tsx';

// Import new multi-tenant services
import { TenantService, TenantUserService, initializeDemoTenants } from './tenants.tsx';
import { MasterProductService, initializeDemoMasterProducts } from './master-products.tsx';

const app = new Hono();

// Simple logging middleware function
const logRequest = async (c: any, next: any) => {
  const start = Date.now();
  await next();
  const end = Date.now();
  console.log(`${c.req.method} ${c.req.url} - ${c.res.status} - ${end - start}ms`);
};

// Middleware
app.use('*', logRequest);
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
  exposeHeaders: ['*'],
  credentials: false,
}));

// Initialize demo data on startup
let initialized = false;
async function initializeData() {
  if (initialized) return;
  try {
    await Promise.all([
      initializeDemoTenants(),
      initializeDemoMasterProducts(),
      productService.initializeDemoProducts(),
      inventoryService.initializeDemoInventory()
    ]);
    initialized = true;
    console.log('Demo data initialized successfully');
  } catch (error) {
    console.error('Failed to initialize demo data:', error);
  }
}

// Health check
app.get('/make-server-ca72a349/health', (c) => {
  return c.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: ['transactions', 'products', 'inventory', 'daily-targets', 'tenants', 'master-products']
  });
});

// ===== TENANT MANAGEMENT ROUTES =====

// Get all tenants
app.get('/make-server-ca72a349/tenants', async (c) => {
  await initializeData();
  
  try {
    const tenants = await TenantService.getAllTenants();
    return c.json({ success: true, data: tenants });
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return c.json({ success: false, error: 'Failed to fetch tenants' }, 500);
  }
});

// Create new tenant
app.post('/make-server-ca72a349/tenants', async (c) => {
  try {
    const tenantData = await c.req.json();
    const tenant = await TenantService.createTenant(tenantData);
    return c.json({ success: true, data: tenant });
  } catch (error) {
    console.error('Error creating tenant:', error);
    return c.json({ success: false, error: 'Failed to create tenant' }, 500);
  }
});

// Get specific tenant
app.get('/make-server-ca72a349/tenants/:id', async (c) => {
  try {
    const tenantId = c.req.param('id');
    const tenant = await TenantService.getTenant(tenantId);
    
    if (!tenant) {
      return c.json({ success: false, error: 'Tenant not found' }, 404);
    }
    
    return c.json({ success: true, data: tenant });
  } catch (error) {
    console.error('Error fetching tenant:', error);
    return c.json({ success: false, error: 'Failed to fetch tenant' }, 500);
  }
});

// Update tenant
app.put('/make-server-ca72a349/tenants/:id', async (c) => {
  try {
    const tenantId = c.req.param('id');
    const updates = await c.req.json();
    const tenant = await TenantService.updateTenant(tenantId, updates);
    
    if (!tenant) {
      return c.json({ success: false, error: 'Tenant not found' }, 404);
    }
    
    return c.json({ success: true, data: tenant });
  } catch (error) {
    console.error('Error updating tenant:', error);
    return c.json({ success: false, error: 'Failed to update tenant' }, 500);
  }
});

// ===== TENANT USER MANAGEMENT ROUTES =====

// Get all users for a tenant
app.get('/make-server-ca72a349/tenants/:tenantId/users', async (c) => {
  try {
    const tenantId = c.req.param('tenantId');
    const users = await TenantUserService.getTenantUsers(tenantId);
    return c.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching tenant users:', error);
    return c.json({ success: false, error: 'Failed to fetch users' }, 500);
  }
});

// Create new user for a tenant
app.post('/make-server-ca72a349/tenants/:tenantId/users', async (c) => {
  try {
    const tenantId = c.req.param('tenantId');
    const userData = await c.req.json();
    const user = await TenantUserService.createUser(tenantId, userData);
    return c.json({ success: true, data: user });
  } catch (error) {
    console.error('Error creating tenant user:', error);
    return c.json({ success: false, error: 'Failed to create user' }, 500);
  }
});

// Update tenant user
app.put('/make-server-ca72a349/tenants/:tenantId/users/:userId', async (c) => {
  try {
    const tenantId = c.req.param('tenantId');
    const userId = c.req.param('userId');
    const updates = await c.req.json();
    const user = await TenantUserService.updateUser(tenantId, userId, updates);
    
    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }
    
    return c.json({ success: true, data: user });
  } catch (error) {
    console.error('Error updating tenant user:', error);
    return c.json({ success: false, error: 'Failed to update user' }, 500);
  }
});

// Delete tenant user
app.delete('/make-server-ca72a349/tenants/:tenantId/users/:userId', async (c) => {
  try {
    const tenantId = c.req.param('tenantId');
    const userId = c.req.param('userId');
    const success = await TenantUserService.deleteUser(tenantId, userId);
    
    if (!success) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }
    
    return c.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting tenant user:', error);
    return c.json({ success: false, error: 'Failed to delete user' }, 500);
  }
});

// ===== MASTER PRODUCT ROUTES =====

// Get all master products
app.get('/make-server-ca72a349/master-products', async (c) => {
  await initializeData();
  
  try {
    const products = await MasterProductService.getAllProducts();
    return c.json({ success: true, data: products });
  } catch (error) {
    console.error('Error fetching master products:', error);
    return c.json({ success: false, error: 'Failed to fetch master products' }, 500);
  }
});

// Search master products
app.get('/make-server-ca72a349/master-products/search', async (c) => {
  try {
    const query = c.req.query('q') || '';
    const products = await MasterProductService.searchProducts(query);
    return c.json({ success: true, data: products });
  } catch (error) {
    console.error('Error searching master products:', error);
    return c.json({ success: false, error: 'Failed to search products' }, 500);
  }
});

// Get master product by barcode
app.get('/make-server-ca72a349/master-products/barcode/:barcode', async (c) => {
  try {
    const barcode = c.req.param('barcode');
    const product = await MasterProductService.getProductByBarcode(barcode);
    
    if (!product) {
      return c.json({ success: false, error: 'Product not found' }, 404);
    }
    
    return c.json({ success: true, data: product });
  } catch (error) {
    console.error('Error fetching product by barcode:', error);
    return c.json({ success: false, error: 'Failed to fetch product' }, 500);
  }
});

// Create new master product
app.post('/make-server-ca72a349/master-products', async (c) => {
  try {
    const productData = await c.req.json();
    const product = await MasterProductService.createProduct(productData);
    return c.json({ success: true, data: product });
  } catch (error) {
    console.error('Error creating master product:', error);
    return c.json({ success: false, error: 'Failed to create product' }, 500);
  }
});

// Update master product
app.put('/make-server-ca72a349/master-products/:id', async (c) => {
  try {
    const productId = c.req.param('id');
    const updates = await c.req.json();
    const product = await MasterProductService.updateProduct(productId, updates);
    
    if (!product) {
      return c.json({ success: false, error: 'Product not found' }, 404);
    }
    
    return c.json({ success: true, data: product });
  } catch (error) {
    console.error('Error updating master product:', error);
    return c.json({ success: false, error: 'Failed to update product' }, 500);
  }
});

// Get master product categories
app.get('/make-server-ca72a349/master-products/categories', async (c) => {
  try {
    const categories = await MasterProductService.getCategories();
    return c.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return c.json({ success: false, error: 'Failed to fetch categories' }, 500);
  }
});

// ===== EXISTING ROUTES (Updated to support multi-tenancy) =====

// Transactions - now tenant-aware
app.post('/make-server-ca72a349/transactions', async (c) => {
  await initializeData();
  
  try {
    const transactionData = await c.req.json();
    const tenantId = c.req.header('X-Tenant-ID') || 'tenant_default';
    
    const result = await transactionService.processTransaction({
      ...transactionData,
      tenantId
    });
    
    return c.json(result);
  } catch (error) {
    console.error('Error processing transaction:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to process transaction',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Products - Enhanced with master product integration
app.get('/make-server-ca72a349/products', async (c) => {
  await initializeData();
  
  try {
    const tenantId = c.req.header('X-Tenant-ID') || 'tenant_default';
    const result = await productService.getProducts();
    return c.json(result);
  } catch (error) {
    console.error('Error fetching products:', error);
    return c.json({ success: false, error: 'Failed to fetch products' }, 500);
  }
});

// Enhanced barcode lookup - checks master products first
app.get('/make-server-ca72a349/products/barcode/:barcode', async (c) => {
  try {
    const barcode = c.req.param('barcode');
    
    // First check master products
    const masterProduct = await MasterProductService.getProductByBarcode(barcode);
    if (masterProduct) {
      // Convert master product to local product format
      const localProduct = {
        id: masterProduct.id,
        name: masterProduct.name,
        description: masterProduct.description,
        price: masterProduct.recommendedPrice || masterProduct.standardPrice || 0,
        category: masterProduct.category,
        barcode: masterProduct.barcode,
        stock: 0, // Will be set when added to inventory
        taxRate: masterProduct.taxRate,
        icon: masterProduct.icon,
        brand: masterProduct.brand,
        isMasterProduct: true
      };
      
      return c.json({ success: true, data: localProduct });
    }
    
    // Fallback to local products
    const result = await productService.getProductByBarcode(barcode);
    return c.json(result);
  } catch (error) {
    console.error('Error fetching product by barcode:', error);
    return c.json({ success: false, error: 'Failed to fetch product' }, 500);
  }
});

// Existing routes continue...
app.get('/make-server-ca72a349/products/categories', async (c) => {
  await initializeData();
  
  try {
    const result = await productService.getCategories();
    return c.json(result);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return c.json({ success: false, error: 'Failed to fetch categories' }, 500);
  }
});

// Daily sales
app.get('/make-server-ca72a349/sales/daily/:date', async (c) => {
  await initializeData();
  
  try {
    const date = c.req.param('date');
    const tenantId = c.req.header('X-Tenant-ID') || 'tenant_default';
    const result = await transactionService.getDailySales(date, tenantId);
    return c.json(result);
  } catch (error) {
    console.error('Error fetching daily sales:', error);
    return c.json({ success: false, error: 'Failed to fetch daily sales' }, 500);
  }
});

// Inventory routes
app.get('/make-server-ca72a349/inventory', async (c) => {
  await initializeData();
  
  try {
    const tenantId = c.req.header('X-Tenant-ID') || 'tenant_default';
    const result = await inventoryService.getInventoryItems();
    return c.json(result);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return c.json({ success: false, error: 'Failed to fetch inventory' }, 500);
  }
});

app.post('/make-server-ca72a349/inventory', async (c) => {
  try {
    const itemData = await c.req.json();
    const tenantId = c.req.header('X-Tenant-ID') || 'tenant_default';
    
    // If this is based on a master product, link it
    if (itemData.masterProductId) {
      const masterProduct = await MasterProductService.getProduct(itemData.masterProductId);
      if (masterProduct) {
        itemData.name = itemData.name || masterProduct.name;
        itemData.description = itemData.description || masterProduct.description;
        itemData.category = itemData.category || masterProduct.category;
        itemData.barcode = itemData.barcode || masterProduct.barcode;
        itemData.icon = itemData.icon || masterProduct.icon;
      }
    }
    
    const result = await inventoryService.createInventoryItem({
      ...itemData,
      tenantId
    });
    return c.json(result);
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return c.json({ success: false, error: 'Failed to create inventory item' }, 500);
  }
});

// Daily targets
app.get('/make-server-ca72a349/daily-targets/:date', async (c) => {
  await initializeData();
  
  try {
    const date = c.req.param('date');
    const tenantId = c.req.header('X-Tenant-ID') || 'tenant_default';
    const result = await dailyTargetsService.getDailyTargets(date, tenantId);
    return c.json(result);
  } catch (error) {
    console.error('Error fetching daily targets:', error);
    return c.json({ success: false, error: 'Failed to fetch daily targets' }, 500);
  }
});

app.post('/make-server-ca72a349/daily-targets', async (c) => {
  try {
    const targetData = await c.req.json();
    const tenantId = c.req.header('X-Tenant-ID') || 'tenant_default';
    const result = await dailyTargetsService.createDailyTarget({
      ...targetData,
      tenantId
    });
    return c.json(result);
  } catch (error) {
    console.error('Error creating daily target:', error);
    return c.json({ success: false, error: 'Failed to create daily target' }, 500);
  }
});

// Catch-all for unmatched routes
app.all('*', (c) => {
  console.log('Route not found:', c.req.method, c.req.url);
  return c.json({ 
    success: false, 
    error: 'Route not found',
    method: c.req.method,
    path: c.req.url 
  }, 404);
});

// ===== GEOCODING SERVICES ROUTES =====

// Geocode address using Google Places API
app.post('/make-server-ca72a349/geocode/address', async (c) => {
  try {
    const { input, sessionToken } = await c.req.json();
    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    
    if (!apiKey) {
      return c.json({ 
        success: false, 
        error: 'Google Places API key not configured' 
      }, 500);
    }

    if (!input || input.length < 3) {
      return c.json({ 
        success: false, 
        error: 'Input must be at least 3 characters' 
      }, 400);
    }

    // Use Google Places Autocomplete API
    const autocompleteUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?` +
      `input=${encodeURIComponent(input)}&` +
      `key=${apiKey}&` +
      `components=country:za&` +
      `types=address|establishment|geocode&` +
      `sessiontoken=${sessionToken || ''}`;

    const response = await fetch(autocompleteUrl);
    const data = await response.json();

    if (data.status !== 'OK') {
      return c.json({ 
        success: false, 
        error: `Google Places API error: ${data.status}`,
        details: data.error_message 
      }, 400);
    }

    return c.json({ 
      success: true, 
      data: data.predictions || []
    });
  } catch (error) {
    console.error('Error geocoding address:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to geocode address',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Get place details using place ID
app.post('/make-server-ca72a349/geocode/place-details', async (c) => {
  try {
    const { placeId } = await c.req.json();
    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    
    if (!apiKey) {
      return c.json({ 
        success: false, 
        error: 'Google Places API key not configured' 
      }, 500);
    }

    if (!placeId) {
      return c.json({ 
        success: false, 
        error: 'Place ID is required' 
      }, 400);
    }

    // Use Google Places Details API
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?` +
      `place_id=${encodeURIComponent(placeId)}&` +
      `fields=formatted_address,address_components,geometry,name,place_id&` +
      `key=${apiKey}`;

    const response = await fetch(detailsUrl);
    const data = await response.json();

    if (data.status !== 'OK') {
      return c.json({ 
        success: false, 
        error: `Google Places API error: ${data.status}`,
        details: data.error_message 
      }, 400);
    }

    // Parse address components
    const place = data.result;
    const components = place.address_components || [];
    
    let streetNumber = '';
    let streetName = '';
    let suburb = '';
    let city = '';
    let province = '';
    let country = '';
    let postalCode = '';

    components.forEach((component: any) => {
      const types = component.types;
      
      if (types.includes('street_number')) {
        streetNumber = component.long_name;
      } else if (types.includes('route')) {
        streetName = component.long_name;
      } else if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
        suburb = component.long_name;
      } else if (types.includes('locality')) {
        city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        province = component.long_name;
      } else if (types.includes('country')) {
        country = component.long_name;
      } else if (types.includes('postal_code')) {
        postalCode = component.long_name;
      }
    });

    const addressDetails = {
      formattedAddress: place.formatted_address || '',
      streetNumber: streetNumber || undefined,
      streetName: streetName || undefined,
      suburb: suburb || undefined,
      city: city || 'Unknown',
      province: province || 'Unknown',
      country: country || 'South Africa',
      postalCode: postalCode || undefined,
      latitude: place.geometry?.location?.lat || 0,
      longitude: place.geometry?.location?.lng || 0,
      placeId: place.place_id || ''
    };

    return c.json({ 
      success: true, 
      data: addressDetails
    });
  } catch (error) {
    console.error('Error getting place details:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to get place details',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ 
    success: false, 
    error: 'Internal server error',
    details: err instanceof Error ? err.message : 'Unknown error'
  }, 500);
});

// Initialize and start server
await initializeData();

Deno.serve(app.fetch);