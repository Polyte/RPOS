import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { AddressAutocomplete } from "./AddressAutocomplete";
import { TenantLocationMap } from "./TenantLocationMap";
import { useNotifications } from "./NotificationSystem";
import { tenantAPI, type Tenant, type TenantAddress } from "../utils/tenant-api";
import {
  PlusIcon,
  StoreIcon,
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  EditIcon,
  TrashIcon,
  SettingsIcon,
  UsersIcon,
  DollarSignIcon,
  RefreshCwIcon,
  SearchIcon,
  FilterIcon,
  EyeIcon,
  BuildingIcon
} from "lucide-react";

interface TenantManagementProps {
  onTenantSelect?: (tenantId: string) => void;
  selectedTenantId?: string;
}

export function TenantManagement({ onTenantSelect, selectedTenantId }: TenantManagementProps) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<TenantAddress | null>(null);

  const [newTenant, setNewTenant] = useState({
    name: '',
    businessType: '',
    phone: '',
    email: '',
    taxNumber: '',
    subscriptionPlan: 'starter' as const
  });

  const { addNotification } = useNotifications();

  // Load tenants
  const loadTenants = async () => {
    try {
      setIsLoading(true);
      const response = await tenantAPI.getTenants();
      
      if (response.success && response.data) {
        setTenants(response.data);
        addNotification({
          type: 'success',
          title: 'Tenants Loaded',
          message: `${response.data.length} tenants synchronized`,
          duration: 3000
        });
      } else {
        // Demo data fallback
        const demoTenants: Tenant[] = [
          {
            id: 'tenant_1',
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
            subscriptionPlan: 'professional',
            isActive: true,
            settings: {
              currency: 'ZAR',
              vatRate: 0.15,
              timezone: 'Africa/Johannesburg',
              businessHours: {
                open: '08:00',
                close: '18:00',
                days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
              },
              features: ['pos', 'inventory', 'reporting', 'user_management', 'analytics']
            },
            createdAt: '2025-07-01T08:00:00Z',
            updatedAt: '2025-08-11T10:00:00Z'
          },
          {
            id: 'tenant_2',
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
            subscriptionPlan: 'starter',
            isActive: true,
            settings: {
              currency: 'ZAR',
              vatRate: 0.15,
              timezone: 'Africa/Johannesburg',
              businessHours: {
                open: '06:00',
                close: '22:00',
                days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
              },
              features: ['pos', 'inventory', 'basic_reporting']
            },
            createdAt: '2025-07-15T10:00:00Z',
            updatedAt: '2025-08-11T09:30:00Z'
          },
          {
            id: 'tenant_3',
            name: 'Roxton Johannesburg',
            slug: 'roxton-jhb',
            businessType: 'Supermarket',
            address: {
              formattedAddress: '789 Market Square, Sandton, Johannesburg, 2196, South Africa',
              streetNumber: '789',
              streetName: 'Market Square',
              suburb: 'Sandton',
              city: 'Johannesburg',
              province: 'Gauteng',
              country: 'South Africa',
              postalCode: '2196',
              latitude: -26.1076,
              longitude: 28.0567,
              placeId: 'demo_place_3'
            },
            phone: '+27 11 234 5678',
            email: 'jhb@roxtonpos.co.za',
            taxNumber: 'TAX345678901',
            subscriptionPlan: 'enterprise',
            isActive: true,
            settings: {
              currency: 'ZAR',
              vatRate: 0.15,
              timezone: 'Africa/Johannesburg',
              businessHours: {
                open: '07:00',
                close: '21:00',
                days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
              },
              features: ['pos', 'inventory', 'reporting', 'user_management', 'analytics', 'advanced_reporting']
            },
            createdAt: '2025-08-01T12:00:00Z',
            updatedAt: '2025-08-11T14:15:00Z'
          }
        ];
        setTenants(demoTenants);
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
      addNotification({
        type: 'error',
        title: 'Loading Failed',
        message: 'Failed to load tenant data',
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  // Filter tenants
  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.businessType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && tenant.isActive) ||
                         (statusFilter === 'inactive' && !tenant.isActive);
    return matchesSearch && matchesStatus;
  });

  // Handle address selection
  const handleAddressSelect = (address: TenantAddress) => {
    setSelectedAddress(address);
  };

  // Handle add tenant
  const handleAddTenant = async () => {
    if (!newTenant.name || !newTenant.email || !selectedAddress) {
      addNotification({
        type: 'error',
        title: 'Invalid Data',
        message: 'Please fill in all required fields including address',
        duration: 4000
      });
      return;
    }

    try {
      const tenantData = {
        ...newTenant,
        slug: newTenant.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        address: selectedAddress,
        isActive: true,
        settings: {
          currency: 'ZAR',
          vatRate: 0.15,
          timezone: 'Africa/Johannesburg',
          businessHours: {
            open: '08:00',
            close: '18:00',
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
          },
          features: newTenant.subscriptionPlan === 'starter' 
            ? ['pos', 'inventory'] 
            : newTenant.subscriptionPlan === 'professional'
            ? ['pos', 'inventory', 'reporting', 'user_management']
            : ['pos', 'inventory', 'reporting', 'user_management', 'analytics', 'advanced_reporting']
        }
      };

      const response = await tenantAPI.createTenant(tenantData);
      
      if (response.success && response.data) {
        setTenants(prev => [...prev, response.data!]);
        setShowAddDialog(false);
        resetForm();
        
        addNotification({
          type: 'success',
          title: 'Tenant Created Successfully',
          message: `${response.data.name} has been added to the system`,
          duration: 4000
        });
      } else {
        throw new Error(response.error || 'Failed to create tenant');
      }
    } catch (error) {
      console.error('Error creating tenant:', error);
      addNotification({
        type: 'error',
        title: 'Creation Failed',
        message: error instanceof Error ? error.message : 'Failed to create tenant',
        duration: 5000
      });
    }
  };

  // Reset form
  const resetForm = () => {
    setNewTenant({
      name: '',
      businessType: '',
      phone: '',
      email: '',
      taxNumber: '',
      subscriptionPlan: 'starter'
    });
    setSelectedAddress(null);
  };

  // Handle tenant toggle
  const handleToggleTenant = async (tenantId: string) => {
    try {
      const tenant = tenants.find(t => t.id === tenantId);
      if (!tenant) return;

      const response = await tenantAPI.updateTenant(tenantId, { isActive: !tenant.isActive });
      
      if (response.success && response.data) {
        setTenants(prev => prev.map(t => t.id === tenantId ? response.data! : t));
        
        addNotification({
          type: tenant.isActive ? 'warning' : 'success',
          title: `Tenant ${tenant.isActive ? 'Deactivated' : 'Activated'}`,
          message: `${tenant.name} has been ${tenant.isActive ? 'deactivated' : 'activated'}`,
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error toggling tenant:', error);
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update tenant status',
        duration: 4000
      });
    }
  };

  // Format currency
  const formatZAR = (amount: number) => `R${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Store Management</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">Manage store locations and their configurations</p>
        </div>
        <Button 
          onClick={() => setShowAddDialog(true)}
          className="gradient-primary text-white shadow-luxury hover-lift px-6 py-3"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add New Store
        </Button>
      </div>

      {/* Filters */}
      <Card className="glass-card shadow-luxury border-0">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search stores by name, city, or business type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-lg border-2 border-gray-200 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <FilterIcon className="w-5 h-5 text-gray-500" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 h-12 border-2 border-gray-200">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stores</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={loadTenants}
                variant="outline"
                className="h-12 px-4 border-2 border-gray-200"
                disabled={isLoading}
              >
                <RefreshCwIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="list" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-white shadow-elegant p-2 h-16">
          <TabsTrigger value="list" className="flex items-center gap-3 text-base py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white">
            <BuildingIcon className="w-5 h-5" />
            Store List
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-3 text-base py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white">
            <MapPinIcon className="w-5 h-5" />
            Location Map
          </TabsTrigger>
        </TabsList>

        {/* Store List Tab */}
        <TabsContent value="list" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTenants.map((tenant, index) => (
              <Card key={tenant.id} className="glass-card shadow-luxury border-0 hover-lift animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 gradient-primary rounded-xl">
                        <StoreIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{tenant.name}</CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{tenant.businessType}</p>
                      </div>
                    </div>
                    <Badge 
                      className={`px-3 py-1 ${tenant.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {tenant.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPinIcon className="w-4 h-4" />
                      <span className="truncate">{tenant.address.formattedAddress}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <PhoneIcon className="w-4 h-4" />
                      <span>{tenant.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MailIcon className="w-4 h-4" />
                      <span>{tenant.email}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <Badge 
                      variant="outline"
                      className={`capitalize ${tenant.subscriptionPlan === 'enterprise' ? 'border-purple-200 text-purple-700' : tenant.subscriptionPlan === 'professional' ? 'border-blue-200 text-blue-700' : 'border-gray-200 text-gray-700'}`}
                    >
                      {tenant.subscriptionPlan}
                    </Badge>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{tenant.address.city}, {tenant.address.province}</p>
                      <p className="text-xs text-gray-400">Created {new Date(tenant.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={() => onTenantSelect?.(tenant.id)}
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                    >
                      <UsersIcon className="w-4 h-4 mr-2" />
                      Manage
                    </Button>
                    <Button 
                      onClick={() => handleToggleTenant(tenant.id)}
                      variant="outline" 
                      size="sm"
                      className={tenant.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}
                    >
                      {tenant.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button variant="outline" size="sm">
                      <SettingsIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTenants.length === 0 && (
            <Card className="glass-card shadow-luxury border-0">
              <CardContent className="p-12 text-center">
                <StoreIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Stores Found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchTerm || statusFilter !== 'all' 
                    ? "No stores match your current filters" 
                    : "Get started by adding your first store location"}
                </p>
                <Button 
                  onClick={() => setShowAddDialog(true)}
                  className="gradient-primary text-white"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Add Your First Store
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Location Map Tab */}
        <TabsContent value="map" className="space-y-6">
          <TenantLocationMap
            tenants={filteredTenants.map(tenant => ({
              id: tenant.id,
              name: tenant.name,
              address: tenant.address,
              businessType: tenant.businessType,
              isActive: tenant.isActive,
              userCount: Math.floor(Math.random() * 15) + 3, // Mock data
              monthlyRevenue: Math.floor(Math.random() * 200000) + 50000 // Mock data
            }))}
            selectedTenantId={selectedTenantId}
            onTenantSelect={onTenantSelect}
            height="600px"
          />
        </TabsContent>
      </Tabs>

      {/* Add Tenant Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 gradient-primary rounded-lg">
                <StoreIcon className="w-6 h-6 text-white" />
              </div>
              Add New Store
            </DialogTitle>
            <DialogDescription>
              Create a new store location with complete address details and geocoding
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="store-name" className="text-base font-semibold">Store Name *</Label>
                <Input
                  id="store-name"
                  placeholder="e.g., Roxton Main Store"
                  value={newTenant.name}
                  onChange={(e) => setNewTenant(prev => ({ ...prev, name: e.target.value }))}
                  className="h-12 text-lg border-2 border-gray-200 focus:border-blue-500"
                />
              </div>
              
              <div>
                <Label htmlFor="business-type" className="text-base font-semibold">Business Type</Label>
                <Select
                  value={newTenant.businessType}
                  onValueChange={(value) => setNewTenant(prev => ({ ...prev, businessType: value }))}
                >
                  <SelectTrigger className="h-12 border-2 border-gray-200">
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Retail Store">Retail Store</SelectItem>
                    <SelectItem value="Convenience Store">Convenience Store</SelectItem>
                    <SelectItem value="Supermarket">Supermarket</SelectItem>
                    <SelectItem value="Restaurant">Restaurant</SelectItem>
                    <SelectItem value="Cafe">Cafe</SelectItem>
                    <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Address Autocomplete */}
            <AddressAutocomplete
              onAddressSelect={handleAddressSelect}
              placeholder="Start typing the store address..."
              label="Store Address *"
            />

            {selectedAddress && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-green-800">{selectedAddress.formattedAddress}</p>
                      <div className="text-sm text-green-600 mt-1 space-y-1">
                        <p>City: {selectedAddress.city}, {selectedAddress.province}</p>
                        <p>Coordinates: {selectedAddress.latitude.toFixed(4)}, {selectedAddress.longitude.toFixed(4)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="phone" className="text-base font-semibold">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+27 21 123 4567"
                  value={newTenant.phone}
                  onChange={(e) => setNewTenant(prev => ({ ...prev, phone: e.target.value }))}
                  className="h-12 text-lg border-2 border-gray-200 focus:border-blue-500"
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="text-base font-semibold">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="store@roxtonpos.co.za"
                  value={newTenant.email}
                  onChange={(e) => setNewTenant(prev => ({ ...prev, email: e.target.value }))}
                  className="h-12 text-lg border-2 border-gray-200 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="tax-number" className="text-base font-semibold">Tax Number</Label>
                <Input
                  id="tax-number"
                  placeholder="TAX123456789"
                  value={newTenant.taxNumber}
                  onChange={(e) => setNewTenant(prev => ({ ...prev, taxNumber: e.target.value }))}
                  className="h-12 text-lg border-2 border-gray-200 focus:border-blue-500"
                />
              </div>
              
              <div>
                <Label htmlFor="subscription" className="text-base font-semibold">Subscription Plan</Label>
                <Select
                  value={newTenant.subscriptionPlan}
                  onValueChange={(value: 'starter' | 'professional' | 'enterprise') => 
                    setNewTenant(prev => ({ ...prev, subscriptionPlan: value }))
                  }
                >
                  <SelectTrigger className="h-12 border-2 border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter - Basic POS</SelectItem>
                    <SelectItem value="professional">Professional - Full Features</SelectItem>
                    <SelectItem value="enterprise">Enterprise - Advanced Analytics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t">
            <Button
              onClick={() => {
                setShowAddDialog(false);
                resetForm();
              }}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddTenant}
              disabled={!newTenant.name || !newTenant.email || !selectedAddress}
              className="flex-1 gradient-primary text-white"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Store
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}