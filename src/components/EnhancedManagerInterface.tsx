import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";
import { AppHeader } from "./AppHeader";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { TenantManagement } from "./TenantManagement";
import { useNotifications } from "./NotificationSystem";
import { type AppState, type SystemStatus } from "../utils/app-constants";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useState, useEffect } from "react";
import * as React from "react";
import { 
  CrownIcon, 
  TrendingUpIcon, 
  DollarSignIcon, 
  ShoppingCartIcon, 
  UsersIcon, 
  PackageIcon, 
  CalendarIcon, 
  DownloadIcon, 
  EyeIcon, 
  TrendingDownIcon, 
  AlertCircleIcon,
  Coffee,
  Sandwich,
  Droplets,
  Package2,
  Zap,
  Heart,
  GlassWater,
  Dumbbell,
  Croissant,
  Milk,
  PlusIcon,
  EditIcon,
  TrashIcon,
  ShieldIcon,
  SettingsIcon,
  BuildingIcon,
  StoreIcon,
  UserCheckIcon,
  UserXIcon,
  KeyIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  RefreshCwIcon,
  SearchIcon,
  FilterIcon,
  MoreHorizontalIcon
} from "lucide-react";

interface ManagerInterfaceProps {
  onLogout: () => void;
  showHeader?: boolean;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
  businessType: string;
  address: string;
  phone: string;
  email: string;
  subscriptionPlan: 'starter' | 'professional' | 'enterprise';
  isActive: boolean;
  userCount: number;
  monthlyRevenue: number;
}

interface TenantUser {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'manager' | 'cashier' | 'stock';
  permissions: string[];
  isActive: boolean;
  lastLogin: string;
  salesThisMonth?: number;
  createdAt: string;
}

interface MasterProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  barcode: string;
  brand?: string;
  standardPrice?: number;
  recommendedPrice?: number;
  taxRate: number;
  icon: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
}

export function EnhancedManagerInterface({ onLogout, showHeader = true }: ManagerInterfaceProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantUsers, setTenantUsers] = useState<TenantUser[]>([]);
  const [masterProducts, setMasterProducts] = useState<MasterProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showAddTenantDialog, setShowAddTenantDialog] = useState(false);
  const [showAddProductDialog, setShowAddProductDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<TenantUser | null>(null);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'cashier' as const,
    permissions: [] as string[],
    isActive: true
  });

  const [newTenant, setNewTenant] = useState({
    name: '',
    businessType: '',
    address: '',
    phone: '',
    email: '',
    subscriptionPlan: 'starter' as const
  });

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: '',
    barcode: '',
    brand: '',
    standardPrice: 0,
    recommendedPrice: 0,
    taxRate: 0.15,
    icon: 'Package2',
    tags: [] as string[]
  });

  const { addNotification } = useNotifications();

  // Create app state for header
  const appState: AppState = {
    currentRole: 'manager',
    isLoading: false,
    user: {
      id: 'manager-1',
      name: localStorage.getItem('roxton-pos-user') ? JSON.parse(localStorage.getItem('roxton-pos-user')!).name || 'Manager' : 'Manager',
      role: 'manager',
      email: 'manager@roxtonpos.co.za',
      permissions: ['view_reports', 'manage_inventory', 'view_analytics', 'user_management', 'tenant_management'],
      isActive: true
    }
  };

  const systemStatus: SystemStatus = {
    isOnline: true,
    serverHealth: 'excellent',
    systemLoad: Math.floor(Math.random() * 25) + 15,
    lastSync: new Date(),
    activeSessions: 3,
    pendingTasks: 5
  };

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Load tenants
  const loadTenants = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/tenants');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTenants(data.data || []);
          // Demo data
          setTenants([
            {
              id: 'tenant_1',
              name: 'Roxton Main Store',
              slug: 'roxton-main',
              businessType: 'Retail Store',
              address: '123 Main Street, Cape Town',
              phone: '+27 21 123 4567',
              email: 'main@roxtonpos.co.za',
              subscriptionPlan: 'professional',
              isActive: true,
              userCount: 8,
              monthlyRevenue: 245780
            },
            {
              id: 'tenant_2',
              name: 'Roxton Express',
              slug: 'roxton-express',
              businessType: 'Convenience Store',
              address: '456 Express Lane, Durban',
              phone: '+27 31 987 6543',
              email: 'express@roxtonpos.co.za',
              subscriptionPlan: 'starter',
              isActive: true,
              userCount: 4,
              monthlyRevenue: 89450
            }
          ]);
        }
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load users for selected tenant
  const loadTenantUsers = async (tenantId: string) => {
    try {
      setIsLoading(true);
      // Demo data for now
      setTenantUsers([
        {
          id: 'user_1',
          tenantId,
          name: 'Sarah Johnson',
          email: 'sarah@roxtonpos.co.za',
          role: 'admin',
          permissions: ['user_management', 'reporting', 'inventory_management', 'settings'],
          isActive: true,
          lastLogin: '2025-08-11 09:30',
          salesThisMonth: 78450.20,
          createdAt: '2025-07-01T08:00:00Z'
        },
        {
          id: 'user_2',
          tenantId,
          name: 'Mike Wilson',
          email: 'mike@roxtonpos.co.za',
          role: 'cashier',
          permissions: ['pos_access', 'transaction_processing'],
          isActive: true,
          lastLogin: '2025-08-11 10:15',
          salesThisMonth: 45230.50,
          createdAt: '2025-07-15T10:00:00Z'
        },
        {
          id: 'user_3',
          tenantId,
          name: 'Alice Brown',
          email: 'alice@roxtonpos.co.za',
          role: 'stock',
          permissions: ['inventory_management', 'stock_control'],
          isActive: true,
          lastLogin: '2025-08-11 08:45',
          createdAt: '2025-08-01T09:00:00Z'
        },
        {
          id: 'user_4',
          tenantId,
          name: 'David Chen',
          email: 'david@roxtonpos.co.za',
          role: 'cashier',
          permissions: ['pos_access', 'transaction_processing'],
          isActive: false,
          lastLogin: '2025-08-05 16:30',
          salesThisMonth: 12890.75,
          createdAt: '2025-06-15T14:00:00Z'
        }
      ]);
    } catch (error) {
      console.error('Error loading tenant users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load master products
  const loadMasterProducts = async () => {
    try {
      setIsLoading(true);
      // Demo data
      setMasterProducts([
        {
          id: 'mp_1',
          name: 'Premium Coffee Blend',
          description: 'Rich, aromatic coffee blend perfect for any time of day',
          category: 'Beverages',
          barcode: '1234567890123',
          brand: 'Roxton Coffee Co.',
          standardPrice: 45.00,
          recommendedPrice: 55.00,
          taxRate: 0.15,
          icon: 'Coffee',
          tags: ['coffee', 'premium', 'blend'],
          isActive: true,
          createdAt: '2025-08-01T10:00:00Z'
        },
        {
          id: 'mp_2',
          name: 'Artisan Sandwich',
          description: 'Freshly made gourmet sandwich with premium ingredients',
          category: 'Food',
          barcode: '2345678901234',
          brand: 'Roxton Deli',
          standardPrice: 89.00,
          recommendedPrice: 95.00,
          taxRate: 0.15,
          icon: 'Sandwich',
          tags: ['sandwich', 'fresh', 'gourmet'],
          isActive: true,
          createdAt: '2025-08-01T10:00:00Z'
        }
      ]);
    } catch (error) {
      console.error('Error loading master products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
    loadMasterProducts();
  }, []);

  useEffect(() => {
    if (selectedTenant) {
      loadTenantUsers(selectedTenant);
    }
  }, [selectedTenant]);

  const formatZAR = (amount: number) => `R${amount.toFixed(2)}`;

  const roleColors = {
    owner: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    admin: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    cashier: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    stock: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
  };

  const roleIcons = {
    owner: CrownIcon,
    admin: ShieldIcon,
    manager: SettingsIcon,
    cashier: DollarSignIcon,
    stock: PackageIcon
  };

  const permissionGroups = {
    pos_access: 'Point of Sale Access',
    transaction_processing: 'Process Transactions',
    inventory_management: 'Inventory Management',
    user_management: 'User Management',
    reporting: 'View Reports',
    analytics: 'Analytics Dashboard',
    settings: 'System Settings',
    tenant_management: 'Tenant Management'
  };

  const filteredUsers = tenantUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleAddUser = async () => {
    if (!selectedTenant || !newUser.name || !newUser.email) {
      addNotification({
        type: 'error',
        title: 'Invalid User Data',
        message: 'Please fill in all required fields',
        duration: 4000
      });
      return;
    }

    const user: TenantUser = {
      id: `user_${Date.now()}`,
      tenantId: selectedTenant,
      ...newUser,
      lastLogin: 'Never',
      createdAt: new Date().toISOString()
    };

    setTenantUsers(prev => [...prev, user]);
    setShowAddUserDialog(false);
    setNewUser({
      name: '',
      email: '',
      role: 'cashier',
      permissions: [],
      isActive: true
    });

    addNotification({
      type: 'success',
      title: 'User Added Successfully',
      message: `${user.name} has been added to the system`,
      duration: 4000
    });
  };

  const handleToggleUserStatus = (userId: string) => {
    setTenantUsers(prev => prev.map(user =>
      user.id === userId ? { ...user, isActive: !user.isActive } : user
    ));

    const user = tenantUsers.find(u => u.id === userId);
    if (user) {
      addNotification({
        type: user.isActive ? 'warning' : 'success',
        title: `User ${user.isActive ? 'Deactivated' : 'Activated'}`,
        message: `${user.name} has been ${user.isActive ? 'deactivated' : 'activated'}`,
        duration: 3000
      });
    }
  };

  const handleDeleteUser = (userId: string) => {
    const user = tenantUsers.find(u => u.id === userId);
    if (user) {
      setTenantUsers(prev => prev.filter(u => u.id !== userId));
      addNotification({
        type: 'info',
        title: 'User Deleted',
        message: `${user.name} has been removed from the system`,
        duration: 3000
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-indigo-600/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10">
        {/* Conditional Header */}
        {showHeader && (
          <AppHeader 
            appState={appState}
            systemStatus={systemStatus}
            currentTime={currentTime}
            onLogout={onLogout}
          />
        )}

        <div className="container-optimized px-6 py-8">
          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="grid w-full grid-cols-6 bg-white shadow-elegant p-2 h-16">
              <TabsTrigger value="overview" className="flex items-center gap-3 text-base py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">
                <EyeIcon className="w-5 h-5" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="tenants" className="flex items-center gap-3 text-base py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white">
                <BuildingIcon className="w-5 h-5" />
                Stores
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-3 text-base py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white">
                <UsersIcon className="w-5 h-5" />
                Users
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center gap-3 text-base py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white">
                <PackageIcon className="w-5 h-5" />
                Products
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-3 text-base py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white">
                <TrendingUpIcon className="w-5 h-5" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-3 text-base py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                <DownloadIcon className="w-5 h-5" />
                Reports
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8 animate-slide-up">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Management Dashboard</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">Comprehensive multi-tenant system overview and management</p>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="glass-card shadow-luxury border-0 hover-lift animate-scale-in">
                  <CardContent className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Active Stores</p>
                        <p className="text-4xl font-bold text-blue-600">{tenants.filter(t => t.isActive).length}</p>
                        <p className="text-sm text-blue-500 mt-1">Total locations</p>
                      </div>
                      <div className="p-4 bg-blue-100 dark:bg-blue-900/50 rounded-2xl">
                        <StoreIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card shadow-luxury border-0 hover-lift animate-scale-in" style={{ animationDelay: '100ms' }}>
                  <CardContent className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Total Users</p>
                        <p className="text-4xl font-bold text-green-600">{tenants.reduce((sum, t) => sum + t.userCount, 0)}</p>
                        <p className="text-sm text-green-500 mt-1">Across all stores</p>
                      </div>
                      <div className="p-4 bg-green-100 dark:bg-green-900/50 rounded-2xl">
                        <UsersIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card shadow-luxury border-0 hover-lift animate-scale-in" style={{ animationDelay: '200ms' }}>
                  <CardContent className="p-8 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Monthly Revenue</p>
                        <p className="text-4xl font-bold text-purple-600">{formatZAR(tenants.reduce((sum, t) => sum + t.monthlyRevenue, 0))}</p>
                        <p className="text-sm text-purple-500 mt-1">All locations</p>
                      </div>
                      <div className="p-4 bg-purple-100 dark:bg-purple-900/50 rounded-2xl">
                        <DollarSignIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card shadow-luxury border-0 hover-lift animate-scale-in" style={{ animationDelay: '300ms' }}>
                  <CardContent className="p-8 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Master Products</p>
                        <p className="text-4xl font-bold text-orange-600">{masterProducts.length}</p>
                        <p className="text-sm text-orange-500 mt-1">In catalog</p>
                      </div>
                      <div className="p-4 bg-orange-100 dark:bg-orange-900/50 rounded-2xl">
                        <PackageIcon className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="glass-card shadow-luxury border-0 animate-slide-up" style={{ animationDelay: '400ms' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 gradient-primary rounded-lg">
                      <SettingsIcon className="w-6 h-6 text-white" />
                    </div>
                    Quick Management Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Button 
                      onClick={() => setShowAddTenantDialog(true)}
                      className="h-20 gradient-primary text-white shadow-luxury hover-lift flex flex-col gap-2"
                    >
                      <StoreIcon className="w-6 h-6" />
                      <span>Add New Store</span>
                    </Button>
                    
                    <Button 
                      onClick={() => setShowAddProductDialog(true)}
                      className="h-20 gradient-secondary text-white shadow-luxury hover-lift flex flex-col gap-2"
                    >
                      <PackageIcon className="w-6 h-6" />
                      <span>Add Master Product</span>
                    </Button>
                    
                    <Button 
                      onClick={loadTenants}
                      variant="outline"
                      className="h-20 border-2 hover:bg-gray-50 dark:hover:bg-gray-800 flex flex-col gap-2"
                    >
                      <RefreshCwIcon className="w-6 h-6" />
                      <span>Refresh Data</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tenants Tab */}
            <TabsContent value="tenants" className="space-y-8 animate-slide-up">
              <TenantManagement 
                onTenantSelect={setSelectedTenant}
                selectedTenantId={selectedTenant}
              />
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-8 animate-slide-up">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">Manage users across all store locations</p>
                </div>
                <div className="flex items-center gap-4">
                  <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select Store" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants.map(tenant => (
                        <SelectItem key={tenant.id} value={tenant.id}>{tenant.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={() => setShowAddUserDialog(true)}
                    disabled={!selectedTenant}
                    className="gradient-primary text-white shadow-luxury hover-lift px-6 py-3"
                  >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Add User
                  </Button>
                </div>
              </div>

              {selectedTenant ? (
                <>
                  {/* User Filters */}
                  <Card className="glass-card shadow-elegant border-0">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                          <SearchIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                          <Input
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filter by role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="owner">Owner</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="cashier">Cashier</SelectItem>
                            <SelectItem value="stock">Stock</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Users Table */}
                  <Card className="glass-card shadow-luxury border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-2xl">
                        <div className="p-2 gradient-primary rounded-lg">
                          <UsersIcon className="w-6 h-6 text-white" />
                        </div>
                        Store Users ({filteredUsers.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 dark:bg-gray-800">
                              <TableHead className="py-4 font-bold">User Details</TableHead>
                              <TableHead className="py-4 font-bold">Role & Permissions</TableHead>
                              <TableHead className="py-4 font-bold">Status</TableHead>
                              <TableHead className="py-4 font-bold">Performance</TableHead>
                              <TableHead className="py-4 font-bold">Last Login</TableHead>
                              <TableHead className="py-4 font-bold">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredUsers.map((user, index) => {
                              const RoleIcon = roleIcons[user.role as keyof typeof roleIcons];
                              return (
                                <TableRow key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                                  <TableCell className="py-6">
                                    <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-elegant">
                                        {user.name.charAt(0)}
                                      </div>
                                      <div>
                                        <p className="font-bold text-lg text-gray-900 dark:text-white">{user.name}</p>
                                        <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                                        <p className="text-xs text-gray-500">ID: {user.id}</p>
                                      </div>
                                    </div>
                                  </TableCell>
                                  
                                  <TableCell className="py-6">
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <RoleIcon className="w-4 h-4" />
                                        <Badge className={`px-3 py-1 ${roleColors[user.role as keyof typeof roleColors]}`}>
                                          {user.role.toUpperCase()}
                                        </Badge>
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {user.permissions.length} permissions
                                      </div>
                                    </div>
                                  </TableCell>
                                  
                                  <TableCell className="py-6">
                                    <div className="flex items-center gap-3">
                                      <Switch
                                        checked={user.isActive}
                                        onCheckedChange={() => handleToggleUserStatus(user.id)}
                                        className="data-[state=checked]:bg-green-500"
                                      />
                                      <Badge 
                                        variant={user.isActive ? 'default' : 'secondary'}
                                        className={`px-3 py-1 ${user.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}
                                      >
                                        {user.isActive ? 'Active' : 'Inactive'}
                                      </Badge>
                                    </div>
                                  </TableCell>
                                  
                                  <TableCell className="py-6">
                                    {user.salesThisMonth ? (
                                      <div className="space-y-1">
                                        <p className="font-bold text-green-600">{formatZAR(user.salesThisMonth)}</p>
                                        <p className="text-xs text-gray-500">This month</p>
                                      </div>
                                    ) : (
                                      <span className="text-gray-400">N/A</span>
                                    )}
                                  </TableCell>
                                  
                                  <TableCell className="py-6 text-gray-600 dark:text-gray-400">
                                    {user.lastLogin}
                                  </TableCell>
                                  
                                  <TableCell className="py-6">
                                    <div className="flex gap-2">
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="hover:bg-blue-50 dark:hover:bg-blue-900 hover-lift"
                                        onClick={() => setEditingUser(user)}
                                      >
                                        <EditIcon className="w-4 h-4" />
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900 hover-lift"
                                        onClick={() => handleDeleteUser(user.id)}
                                      >
                                        <TrashIcon className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="glass-card shadow-elegant border-0">
                  <CardContent className="p-12 text-center">
                    <StoreIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Select a Store</h3>
                    <p className="text-gray-600 dark:text-gray-400">Choose a store from the dropdown above to manage its users</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products" className="space-y-8 animate-slide-up">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Master Product Catalog</h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">Manage the central product database shared across all stores</p>
                </div>
                <Button 
                  onClick={() => setShowAddProductDialog(true)}
                  className="gradient-primary text-white shadow-luxury hover-lift px-6 py-3"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Add Master Product
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {masterProducts.map((product, index) => (
                  <Card key={product.id} className="glass-card shadow-luxury border-0 hover-lift animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-3 gradient-secondary rounded-xl">
                            {product.icon === 'Coffee' && <Coffee className="w-6 h-6 text-white" />}
                            {product.icon === 'Sandwich' && <Sandwich className="w-6 h-6 text-white" />}
                            {!['Coffee', 'Sandwich'].includes(product.icon) && <Package2 className="w-6 h-6 text-white" />}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{product.name}</CardTitle>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{product.category}</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800 px-2 py-1">
                          Active
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {product.description}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Barcode:</span>
                          <span className="font-mono">{product.barcode}</span>
                        </div>
                        {product.brand && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Brand:</span>
                            <span>{product.brand}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Standard:</span>
                          <span className="font-semibold">{formatZAR(product.standardPrice || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Recommended:</span>
                          <span className="font-semibold text-green-600">{formatZAR(product.recommendedPrice || 0)}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 pt-2">
                        {product.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {product.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{product.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex gap-2 pt-4">
                        <Button variant="outline" size="sm" className="flex-1">
                          <EditIcon className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <MoreHorizontalIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-8 animate-slide-up">
              <AnalyticsDashboard role="manager" dateRange="30d" />
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-8 animate-slide-up">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Multi-Tenant Reports</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">Generate comprehensive reports across all store locations</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { title: 'Cross-Store Performance', description: 'Compare performance across all locations', icon: TrendingUpIcon },
                  { title: 'User Activity Report', description: 'Detailed user activity and performance metrics', icon: UsersIcon },
                  { title: 'Product Utilization', description: 'Master product usage across stores', icon: PackageIcon },
                  { title: 'Financial Consolidation', description: 'Consolidated financial reports', icon: DollarSignIcon },
                  { title: 'Tenant Analysis', description: 'Store-by-store analysis and insights', icon: BuildingIcon },
                  { title: 'System Health Report', description: 'Multi-tenant system performance', icon: SettingsIcon }
                ].map((report, index) => {
                  const IconComponent = report.icon;
                  return (
                    <Card key={report.title} className="glass-card shadow-luxury border-0 hover-lift animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg">
                          <div className="p-2 gradient-primary rounded-lg">
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          {report.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">{report.description}</p>
                        <Button className="w-full gradient-secondary text-white hover-lift">
                          <DownloadIcon className="w-4 h-4 mr-2" />
                          Generate Report
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Add User Dialog */}
        <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
          <DialogContent className="glass-card border-0 max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 gradient-primary rounded-lg">
                  <UserCheckIcon className="w-6 h-6 text-white" />
                </div>
                Add New User
              </DialogTitle>
              <DialogDescription>
                Create a new user account for the selected store location with appropriate permissions and access levels.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="userName">Full Name *</Label>
                  <Input
                    id="userName"
                    placeholder="John Doe"
                    value={newUser.name}
                    onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userEmail">Email Address *</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    placeholder="john@store.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="userRole">Role</Label>
                <Select value={newUser.role} onValueChange={(value: any) => setNewUser(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cashier">Cashier</SelectItem>
                    <SelectItem value="stock">Stock Manager</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(permissionGroups).map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={key}
                        checked={newUser.permissions.includes(key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewUser(prev => ({ ...prev, permissions: [...prev.permissions, key] }));
                          } else {
                            setNewUser(prev => ({ ...prev, permissions: prev.permissions.filter(p => p !== key) }));
                          }
                        }}
                        className="rounded"
                      />
                      <Label htmlFor={key} className="text-sm">{label}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button onClick={handleAddUser} className="flex-1 gradient-primary text-white hover-lift">
                  Create User
                </Button>
                <Button variant="outline" onClick={() => setShowAddUserDialog(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Product Dialog */}
        <Dialog open={showAddProductDialog} onOpenChange={setShowAddProductDialog}>
          <DialogContent className="glass-card border-0 max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 gradient-secondary rounded-lg">
                  <PackageIcon className="w-6 h-6 text-white" />
                </div>
                Add Master Product
              </DialogTitle>
              <DialogDescription>
                Create a new product in the master catalog that will be available across all store locations.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name *</Label>
                  <Input
                    id="productName"
                    placeholder="Premium Coffee Blend"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productCategory">Category *</Label>
                  <Select value={newProduct.category} onValueChange={(value) => setNewProduct(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beverages">Beverages</SelectItem>
                      <SelectItem value="Food">Food</SelectItem>
                      <SelectItem value="Snacks">Snacks</SelectItem>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Personal Care">Personal Care</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="productDescription">Description</Label>
                <Textarea
                  id="productDescription"
                  placeholder="Product description..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productBarcode">Barcode *</Label>
                  <Input
                    id="productBarcode"
                    placeholder="1234567890123"
                    value={newProduct.barcode}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, barcode: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productBrand">Brand</Label>
                  <Input
                    id="productBrand"
                    placeholder="Brand name"
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, brand: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="standardPrice">Standard Price</Label>
                  <Input
                    id="standardPrice"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newProduct.standardPrice || ''}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, standardPrice: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recommendedPrice">Recommended Price</Label>
                  <Input
                    id="recommendedPrice"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newProduct.recommendedPrice || ''}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, recommendedPrice: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button className="flex-1 gradient-secondary text-white hover-lift">
                  Create Product
                </Button>
                <Button variant="outline" onClick={() => setShowAddProductDialog(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}