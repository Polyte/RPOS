import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import * as kv from './kv_store.tsx';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

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

export class TenantService {
  private static getKey(suffix: string): string {
    return `tenant:${suffix}`;
  }

  static async createTenant(tenantData: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tenant> {
    const tenant: Tenant = {
      id: `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...tenantData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(this.getKey(tenant.id), JSON.stringify(tenant));
    
    // Add to tenant list
    const tenantList = await this.getAllTenants();
    tenantList.push(tenant);
    await kv.set(this.getKey('list'), JSON.stringify(tenantList));

    return tenant;
  }

  static async getTenant(tenantId: string): Promise<Tenant | null> {
    try {
      const data = await kv.get(this.getKey(tenantId));
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  static async getAllTenants(): Promise<Tenant[]> {
    try {
      const data = await kv.get(this.getKey('list'));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static async updateTenant(tenantId: string, updates: Partial<Tenant>): Promise<Tenant | null> {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) return null;

    const updatedTenant = {
      ...tenant,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await kv.set(this.getKey(tenantId), JSON.stringify(updatedTenant));
    
    // Update in tenant list
    const tenantList = await this.getAllTenants();
    const index = tenantList.findIndex(t => t.id === tenantId);
    if (index >= 0) {
      tenantList[index] = updatedTenant;
      await kv.set(this.getKey('list'), JSON.stringify(tenantList));
    }

    return updatedTenant;
  }

  static async deleteTenant(tenantId: string): Promise<boolean> {
    try {
      await kv.del(this.getKey(tenantId));
      
      // Remove from tenant list
      const tenantList = await this.getAllTenants();
      const filteredList = tenantList.filter(t => t.id !== tenantId);
      await kv.set(this.getKey('list'), JSON.stringify(filteredList));

      return true;
    } catch {
      return false;
    }
  }

  static async getTenantBySlug(slug: string): Promise<Tenant | null> {
    const tenants = await this.getAllTenants();
    return tenants.find(t => t.slug === slug) || null;
  }
}

export class TenantUserService {
  private static getKey(tenantId: string, suffix: string): string {
    return `tenant:${tenantId}:user:${suffix}`;
  }

  static async createUser(tenantId: string, userData: Omit<TenantUser, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Promise<TenantUser> {
    const user: TenantUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(this.getKey(tenantId, user.id), JSON.stringify(user));
    
    // Add to tenant user list
    const userList = await this.getTenantUsers(tenantId);
    userList.push(user);
    await kv.set(this.getKey(tenantId, 'list'), JSON.stringify(userList));

    return user;
  }

  static async getUser(tenantId: string, userId: string): Promise<TenantUser | null> {
    try {
      const data = await kv.get(this.getKey(tenantId, userId));
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  static async getTenantUsers(tenantId: string): Promise<TenantUser[]> {
    try {
      const data = await kv.get(this.getKey(tenantId, 'list'));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static async updateUser(tenantId: string, userId: string, updates: Partial<TenantUser>): Promise<TenantUser | null> {
    const user = await this.getUser(tenantId, userId);
    if (!user) return null;

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await kv.set(this.getKey(tenantId, userId), JSON.stringify(updatedUser));
    
    // Update in user list
    const userList = await this.getTenantUsers(tenantId);
    const index = userList.findIndex(u => u.id === userId);
    if (index >= 0) {
      userList[index] = updatedUser;
      await kv.set(this.getKey(tenantId, 'list'), JSON.stringify(userList));
    }

    return updatedUser;
  }

  static async deleteUser(tenantId: string, userId: string): Promise<boolean> {
    try {
      await kv.del(this.getKey(tenantId, userId));
      
      // Remove from user list
      const userList = await this.getTenantUsers(tenantId);
      const filteredList = userList.filter(u => u.id !== userId);
      await kv.set(this.getKey(tenantId, 'list'), JSON.stringify(filteredList));

      return true;
    } catch {
      return false;
    }
  }

  static async getUsersByRole(tenantId: string, role: string): Promise<TenantUser[]> {
    const users = await this.getTenantUsers(tenantId);
    return users.filter(u => u.role === role);
  }

  static async updateUserPermissions(tenantId: string, userId: string, permissions: string[]): Promise<TenantUser | null> {
    return this.updateUser(tenantId, userId, { permissions });
  }
}

// Initialize demo tenants if none exist
export async function initializeDemoTenants() {
  const existingTenants = await TenantService.getAllTenants();
  if (existingTenants.length > 0) return;

  // Create demo tenants with enhanced address data
  const demoTenants = [
    {
      name: 'Roxton Main Store',
      slug: 'roxton-main',
      businessType: 'Retail Store',
      address: {
        formattedAddress: '123 Main Street, Cape Town City Centre, Cape Town, 8001, South Africa',
        streetNumber: '123',
        streetName: 'Main Street',
        suburb: 'Cape Town City Centre',
        city: 'Cape Town',
        province: 'Western Cape',
        country: 'South Africa',
        postalCode: '8001',
        latitude: -33.9249,
        longitude: 18.4241,
        placeId: 'demo_place_1'
      },
      phone: '+27 21 123 4567',
      email: 'main@roxtonpos.co.za',
      taxNumber: 'TAX123456789',
      subscriptionPlan: 'professional' as const,
      isActive: true,
      settings: {
        currency: 'ZAR',
        vatRate: 15,
        timezone: 'Africa/Johannesburg',
        businessHours: {
          open: '08:00',
          close: '18:00',
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        },
        features: ['pos', 'inventory', 'reporting', 'user_management', 'analytics']
      }
    },
    {
      name: 'Roxton Express',
      slug: 'roxton-express',
      businessType: 'Convenience Store',
      address: {
        formattedAddress: '456 Express Lane, Durban Central, Durban, 4001, South Africa',
        streetNumber: '456',
        streetName: 'Express Lane',
        suburb: 'Durban Central',
        city: 'Durban',
        province: 'KwaZulu-Natal',
        country: 'South Africa',
        postalCode: '4001',
        latitude: -29.8587,
        longitude: 31.0218,
        placeId: 'demo_place_2'
      },
      phone: '+27 31 987 6543',
      email: 'express@roxtonpos.co.za',
      taxNumber: 'TAX987654321',
      subscriptionPlan: 'starter' as const,
      isActive: true,
      settings: {
        currency: 'ZAR',
        vatRate: 15,
        timezone: 'Africa/Johannesburg',
        businessHours: {
          open: '06:00',
          close: '22:00',
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        features: ['pos', 'inventory', 'basic_reporting']
      }
    }
  ];

  for (const tenantData of demoTenants) {
    const tenant = await TenantService.createTenant(tenantData);
    
    // Create demo users for each tenant
    const demoUsers = [
      {
        userId: 'owner_1',
        name: 'John Owner',
        email: 'owner@roxtonpos.co.za',
        role: 'owner' as const,
        permissions: ['full_access'],
        isActive: true,
        lastLogin: new Date().toISOString()
      },
      {
        userId: 'manager_1',
        name: 'Sarah Manager',
        email: 'manager@roxtonpos.co.za',
        role: 'manager' as const,
        permissions: ['user_management', 'reporting', 'inventory_management'],
        isActive: true,
        lastLogin: new Date().toISOString(),
        salesThisMonth: 45230.50
      },
      {
        userId: 'cashier_1',
        name: 'Mike Cashier',
        email: 'cashier@roxtonpos.co.za',
        role: 'cashier' as const,
        permissions: ['pos_access', 'transaction_processing'],
        isActive: true,
        lastLogin: new Date().toISOString(),
        salesThisMonth: 28450.75
      }
    ];

    for (const userData of demoUsers) {
      await TenantUserService.createUser(tenant.id, userData);
    }
  }
}