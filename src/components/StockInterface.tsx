import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Alert, AlertDescription } from "./ui/alert";
import { Progress } from "./ui/progress";
import { AppHeader } from "./AppHeader";
import { BarcodeScanner } from "./BarcodeScanner";
import { useNotifications } from "./NotificationSystem";
import { inventoryAPI, type InventoryItem } from "../utils/inventory-api";
import { cashierAPI } from "../utils/cashier-api";
import { type AppState, type SystemStatus } from "../utils/app-constants";
import { 
  PackageIcon, 
  PlusIcon, 
  EditIcon, 
  TrashIcon, 
  SearchIcon,
  ScanIcon,
  AlertTriangleIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  RefreshCwIcon,
  DownloadIcon,
  UploadIcon,
  BarChart3Icon,
  PieChartIcon,
  DollarSignIcon,
  CheckCircleIcon,
  XCircleIcon,
  LoaderIcon,
  Package2,
  Coffee,
  Sandwich,
  Droplets,
  Zap,
  Heart,
  GlassWater,
  Dumbbell,
  Croissant,
  Milk
} from "lucide-react";

interface StockInterfaceProps {
  onLogout: () => void;
  showHeader?: boolean;
}

interface NewItemForm {
  name: string;
  category: string;
  barcode: string;
  price: number;
  minStock: number;
  maxStock: number;
  currentStock: number;
  reorderLevel: number;
  supplier: string;
  description: string;
  icon: string;
  isActive: boolean;
}

const iconOptions = [
  { name: 'Package2', component: Package2 },
  { name: 'Coffee', component: Coffee },
  { name: 'Sandwich', component: Sandwich },
  { name: 'Droplets', component: Droplets },
  { name: 'Zap', component: Zap },
  { name: 'Heart', component: Heart },
  { name: 'GlassWater', component: GlassWater },
  { name: 'Dumbbell', component: Dumbbell },
  { name: 'Croissant', component: Croissant },
  { name: 'Milk', component: Milk }
];

const categories = [
  'Beverages',
  'Food',
  'Snacks',
  'Household',
  'Personal Care',
  'Electronics',
  'Office Supplies',
  'Health & Beauty',
  'Automotive',
  'General'
];

export function StockInterface({ onLogout, showHeader = true }: StockInterfaceProps) {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [inventoryStats, setInventoryStats] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0
  });

  const [newItem, setNewItem] = useState<NewItemForm>({
    name: "",
    category: "General",
    barcode: "",
    price: 0,
    minStock: 10,
    maxStock: 100,
    currentStock: 0,
    reorderLevel: 20,
    supplier: "",
    description: "",
    icon: "Package2",
    isActive: true
  });

  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const { addNotification } = useNotifications();

  // Create app state for header
  const appState: AppState = {
    currentRole: 'stock',
    isLoading: false,
    user: {
      id: 'stock-1',
      name: localStorage.getItem('roxton-pos-user') ? JSON.parse(localStorage.getItem('roxton-pos-user')!).name || 'Stock Manager' : 'Stock Manager',
      role: 'stock',
      email: 'stock@roxtonpos.co.za',
      permissions: ['inventory_management', 'stock_control'],
      isActive: true
    }
  };

  const systemStatus: SystemStatus = {
    isOnline: true,
    serverHealth: 'excellent',
    systemLoad: Math.floor(Math.random() * 15) + 5,
    lastSync: new Date(),
    activeSessions: 1,
    pendingTasks: 3
  };

  // Load inventory items using the inventory API
  const loadInventoryItems = async () => {
    try {
      setIsLoading(true);
      console.log('Loading inventory items...');
      
      const response = await inventoryAPI.getInventoryItems();
      
      if (response.success && response.data) {
        setInventoryItems(response.data);
        
        // Calculate stats
        const stats = {
          totalItems: response.data.length,
          totalValue: response.data.reduce((sum, item) => sum + (item.currentStock * (item.unitPrice || 0)), 0),
          lowStockCount: response.data.filter(item => item.currentStock <= item.minStock).length,
          outOfStockCount: response.data.filter(item => item.currentStock === 0).length
        };
        setInventoryStats(stats);
        
        addNotification({
          type: 'success',
          title: 'Inventory Loaded',
          message: `${response.data.length} items synchronized successfully`,
          duration: 3000
        });
      } else {
        throw new Error(response.error || 'Failed to load inventory');
      }
    } catch (error) {
      console.error('Error loading inventory items:', error);
      addNotification({
        type: 'error',
        title: 'Loading Failed',
        message: 'Unable to load inventory. Please try again.',
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add new inventory item using the inventory API
  const addInventoryItem = async () => {
    if (!newItem.name || !newItem.category || newItem.price <= 0) {
      addNotification({
        type: 'error',
        title: 'Invalid Item',
        message: 'Please fill in all required fields with valid values',
        duration: 4000
      });
      return;
    }

    try {
      console.log('Creating new inventory item:', newItem);
      
      const response = await inventoryAPI.createInventoryItem({
        name: newItem.name,
        category: newItem.category,
        barcode: newItem.barcode,
        price: newItem.price,
        minStock: newItem.minStock,
        maxStock: newItem.maxStock,
        currentStock: newItem.currentStock,
        reorderLevel: newItem.reorderLevel,
        supplier: newItem.supplier,
        description: newItem.description,
        icon: newItem.icon,
        isActive: newItem.isActive
      });
      
      if (response.success) {
        await loadInventoryItems();
        setShowAddDialog(false);
        setNewItem({
          name: "",
          category: "General",
          barcode: "",
          price: 0,
          minStock: 10,
          maxStock: 100,
          currentStock: 0,
          reorderLevel: 20,
          supplier: "",
          description: "",
          icon: "Package2",
          isActive: true
        });
        
        addNotification({
          type: 'success',
          title: 'Item Added',
          message: `${newItem.name} has been added to inventory`,
          duration: 4000
        });
      } else {
        throw new Error(response.error || 'Failed to create item');
      }
    } catch (error) {
      console.error('Error adding inventory item:', error);
      addNotification({
        type: 'error',
        title: 'Add Failed',
        message: 'Unable to add item. Please try again.',
        duration: 5000
      });
    }
  };

  // Handle barcode scanning
  const handleBarcodeScanning = async (barcode: string) => {
    if (!barcode.trim()) return;

    try {
      setIsScanning(true);
      
      // Check if item already exists
      const existingItem = inventoryItems.find(item => item.barcode === barcode);
      if (existingItem) {
        addNotification({
          type: 'warning',
          title: 'Item Already Exists',
          message: `${existingItem.name} is already in inventory`,
          duration: 4000
        });
        setShowBarcodeScanner(false);
        return;
      }

      // Try to get product info from barcode using cashier API
      const response = await cashierAPI.getProductByBarcode(barcode);
      
      if (response.success && response.data) {
        setNewItem({
          ...newItem,
          name: response.data.name,
          barcode: barcode,
          price: response.data.price,
          category: response.data.category,
          description: response.data.description,
          icon: response.data.icon || "Package2"
        });
        setShowBarcodeScanner(false);
        setShowAddDialog(true);
        
        addNotification({
          type: 'success',
          title: 'Product Found',
          message: 'Product details loaded from barcode scan',
          duration: 3000
        });
      } else {
        // New product - just set barcode
        setNewItem({ ...newItem, barcode: barcode });
        setShowBarcodeScanner(false);
        setShowAddDialog(true);
        
        addNotification({
          type: 'info',
          title: 'New Product',
          message: 'Please fill in the product details',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error processing barcode scan:', error);
      addNotification({
        type: 'error',
        title: 'Scan Failed',
        message: 'Unable to process barcode scan',
        duration: 4000
      });
    } finally {
      setIsScanning(false);
    }
  };

  // Filter and sort items
  useEffect(() => {
    let filtered = inventoryItems;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.barcode && item.barcode.includes(searchTerm))
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "category":
          return a.category.localeCompare(b.category);
        case "stock":
          return b.currentStock - a.currentStock;
        case "value":
          return (b.currentStock * (b.unitPrice || 0)) - (a.currentStock * (a.unitPrice || 0));
        default:
          return 0;
      }
    });

    setFilteredItems(filtered);
  }, [inventoryItems, searchTerm, selectedCategory, sortBy]);

  // Load data on mount
  useEffect(() => {
    loadInventoryItems();
  }, []);

  // Update time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const getIconComponent = (iconName: string) => {
    const iconOption = iconOptions.find(opt => opt.name === iconName);
    return iconOption ? iconOption.component : Package2;
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock === 0) {
      return { status: 'out-of-stock', color: 'text-red-600', bg: 'bg-red-100', label: 'Out of Stock' };
    } else if (item.currentStock <= item.minStock) {
      return { status: 'low-stock', color: 'text-orange-600', bg: 'bg-orange-100', label: 'Low Stock' };
    } else if (item.currentStock <= item.reorderLevel) {
      return { status: 'reorder', color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Reorder Soon' };
    } else {
      return { status: 'in-stock', color: 'text-green-600', bg: 'bg-green-100', label: 'In Stock' };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-green-900 dark:to-slate-900">
        <div className="container-optimized px-6 py-8">
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-100 to-blue-200 rounded-full flex items-center justify-center animate-float">
              <LoaderIcon className="w-10 h-10 text-green-600 animate-spin" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Loading Inventory System</h3>
            <p className="text-gray-600 dark:text-gray-400">Synchronizing stock data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-green-900 dark:to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-green-400/10 to-blue-600/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-green-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
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
          <Tabs defaultValue="inventory" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 bg-white shadow-elegant p-2 h-16">
              <TabsTrigger value="inventory" className="flex items-center gap-3 text-base py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white">
                <PackageIcon className="w-5 h-5" />
                Inventory
              </TabsTrigger>
              <TabsTrigger value="add-items" className="flex items-center gap-3 text-base py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                <PlusIcon className="w-5 h-5" />
                Add Items
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-3 text-base py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                <BarChart3Icon className="w-5 h-5" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-3 text-base py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white">
                <DownloadIcon className="w-5 h-5" />
                Reports
              </TabsTrigger>
            </TabsList>

            {/* Inventory Tab */}
            <TabsContent value="inventory" className="space-y-8 animate-slide-up">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="glass-card shadow-luxury border-0 hover-lift animate-scale-in">
                  <CardContent className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Total Items</p>
                        <p className="text-3xl font-bold text-blue-600">{inventoryStats.totalItems}</p>
                      </div>
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-2xl">
                        <PackageIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card shadow-luxury border-0 hover-lift animate-scale-in" style={{ animationDelay: '100ms' }}>
                  <CardContent className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Inventory Value</p>
                        <p className="text-3xl font-bold text-green-600">R{inventoryStats.totalValue.toFixed(2)}</p>
                      </div>
                      <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-2xl">
                        <DollarSignIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card shadow-luxury border-0 hover-lift animate-scale-in" style={{ animationDelay: '200ms' }}>
                  <CardContent className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Low Stock</p>
                        <p className="text-3xl font-bold text-orange-600">{inventoryStats.lowStockCount}</p>
                      </div>
                      <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-2xl">
                        <AlertTriangleIcon className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card shadow-luxury border-0 hover-lift animate-scale-in" style={{ animationDelay: '300ms' }}>
                  <CardContent className="p-6 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Out of Stock</p>
                        <p className="text-3xl font-bold text-red-600">{inventoryStats.outOfStockCount}</p>
                      </div>
                      <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-2xl">
                        <XCircleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Controls */}
              <Card className="glass-card shadow-luxury border-0 animate-slide-up" style={{ animationDelay: '400ms' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 gradient-primary rounded-lg">
                      <SearchIcon className="w-6 h-6 text-white" />
                    </div>
                    Inventory Management
                    <Button
                      onClick={loadInventoryItems}
                      variant="outline"
                      size="sm"
                      className="ml-auto hover-lift"
                    >
                      <RefreshCwIcon className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search inventory items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-12 text-base border-2 focus:border-green-500"
                      />
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="lg:w-48 h-12 border-2">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="lg:w-48 h-12 border-2">
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="category">Category</SelectItem>
                        <SelectItem value="stock">Stock Level</SelectItem>
                        <SelectItem value="value">Value</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Inventory Table */}
              <Card className="glass-card shadow-luxury border-0 animate-slide-up" style={{ animationDelay: '500ms' }}>
                <CardHeader className="bg-gradient-to-r from-gray-50 to-green-50 dark:from-gray-800 dark:to-green-900/20 pb-6">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 gradient-secondary rounded-lg">
                      <PackageIcon className="w-6 h-6 text-white" />
                    </div>
                    Inventory Items ({filteredItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 dark:bg-gray-800">
                          <TableHead className="py-4 font-bold">Product</TableHead>
                          <TableHead className="py-4 font-bold">Category</TableHead>
                          <TableHead className="py-4 font-bold">Stock Level</TableHead>
                          <TableHead className="py-4 font-bold">Status</TableHead>
                          <TableHead className="py-4 font-bold">Value</TableHead>
                          <TableHead className="py-4 font-bold">Last Updated</TableHead>
                          <TableHead className="py-4 font-bold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredItems.map((item, index) => {
                          const IconComponent = getIconComponent(item.icon || 'Package2');
                          const stockStatus = getStockStatus(item);
                          
                          return (
                            <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors animate-fade-in border-b" style={{ animationDelay: `${index * 50}ms` }}>
                              <TableCell className="py-6">
                                <div className="flex items-center gap-4">
                                  <div className="p-3 gradient-primary rounded-xl shadow-elegant">
                                    <IconComponent className="w-6 h-6 text-white" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-lg text-gray-900 dark:text-white">{item.name}</p>
                                    <p className="text-gray-600 dark:text-gray-400">{item.barcode}</p>
                                    <p className="text-xs text-gray-500">ID: {item.id}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-6">
                                <Badge className="gradient-secondary text-white px-4 py-2">
                                  {item.category}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-6">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                      {item.currentStock}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      / {item.maxStock}
                                    </span>
                                  </div>
                                  <Progress 
                                    value={(item.currentStock / item.maxStock) * 100} 
                                    className="h-2"
                                  />
                                  <div className="flex justify-between text-xs text-gray-500">
                                    <span>Min: {item.minStock}</span>
                                    <span>Reorder: {item.reorderLevel}</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-6">
                                <Badge className={`${stockStatus.bg} ${stockStatus.color} px-3 py-2`}>
                                  {stockStatus.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-6">
                                <div className="space-y-1">
                                  <p className="font-bold text-green-600">
                                    R{((item.unitPrice || 0) * item.currentStock).toFixed(2)}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    @ R{(item.unitPrice || 0).toFixed(2)} each
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="py-6 text-gray-600 dark:text-gray-400">
                                {item.lastUpdated}
                              </TableCell>
                              <TableCell className="py-6">
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" className="hover:bg-blue-50 hover-lift">
                                    <EditIcon className="w-4 h-4" />
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 hover-lift">
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
            </TabsContent>

            {/* Add Items Tab */}
            <TabsContent value="add-items" className="space-y-8 animate-slide-up">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Barcode Scanner */}
                <Card className="glass-card shadow-luxury border-0 hover-lift animate-scale-in">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 pb-6">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <div className="p-2 gradient-primary rounded-lg">
                        <ScanIcon className="w-6 h-6 text-white" />
                      </div>
                      Barcode Scanner
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="text-center">
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Scan product barcodes to automatically add items to inventory
                      </p>
                      
                      <Button
                        onClick={() => setShowBarcodeScanner(true)}
                        className="gradient-primary h-16 text-lg hover-lift flex items-center gap-3 px-8"
                        disabled={isScanning}
                      >
                        <div className="p-2 bg-white/20 rounded-lg">
                          <ScanIcon className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold">Start Camera Scanner</div>
                          <div className="text-sm opacity-90">Real-time barcode detection</div>
                        </div>
                      </Button>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-300 dark:border-gray-700" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white dark:bg-gray-900 px-2 text-gray-500">Or</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Input
                        ref={barcodeInputRef}
                        placeholder="Enter barcode manually..."
                        className="flex-1 h-12 text-base border-2 focus:border-blue-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const value = (e.target as HTMLInputElement).value;
                            if (value) {
                              handleBarcodeScanning(value);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        className="h-12 px-6 hover-lift border-2"
                        onClick={() => {
                          const value = barcodeInputRef.current?.value;
                          if (value) {
                            handleBarcodeScanning(value);
                            if (barcodeInputRef.current) {
                              barcodeInputRef.current.value = '';
                            }
                          }
                        }}
                      >
                        <CheckCircleIcon className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Add Form */}
                <Card className="glass-card shadow-luxury border-0 hover-lift animate-scale-in" style={{ animationDelay: '100ms' }}>
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 pb-6">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <div className="p-2 gradient-secondary rounded-lg">
                        <PlusIcon className="w-6 h-6 text-white" />
                      </div>
                      Quick Add Item
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="quickName">Product Name *</Label>
                        <Input
                          id="quickName"
                          placeholder="Enter product name"
                          value={newItem.name}
                          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                          className="h-12"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="quickCategory">Category</Label>
                        <Select value={newItem.category} onValueChange={(value) => setNewItem({ ...newItem, category: value })}>
                          <SelectTrigger className="h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="quickBarcode">Barcode *</Label>
                        <Input
                          id="quickBarcode"
                          placeholder="Product barcode"
                          value={newItem.barcode}
                          onChange={(e) => setNewItem({ ...newItem, barcode: e.target.value })}
                          className="h-12"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="quickPrice">Unit Price *</Label>
                        <Input
                          id="quickPrice"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={newItem.price || ''}
                          onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
                          className="h-12"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="quickStock">Current Stock</Label>
                        <Input
                          id="quickStock"
                          type="number"
                          min="0"
                          placeholder="0"
                          value={newItem.currentStock || ''}
                          onChange={(e) => setNewItem({ ...newItem, currentStock: parseInt(e.target.value) || 0 })}
                          className="h-12"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="quickMinStock">Min Stock</Label>
                        <Input
                          id="quickMinStock"
                          type="number"
                          min="0"
                          placeholder="10"
                          value={newItem.minStock || ''}
                          onChange={(e) => setNewItem({ ...newItem, minStock: parseInt(e.target.value) || 10 })}
                          className="h-12"
                        />
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <Button
                        onClick={addInventoryItem}
                        className="w-full gradient-secondary text-white hover-lift h-12 text-lg"
                      >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Add to Inventory
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-8 animate-slide-up">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Inventory Analytics</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">Comprehensive insights into your inventory performance</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Stock Level Distribution */}
                <Card className="glass-card shadow-luxury border-0 hover-lift animate-scale-in">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 gradient-primary rounded-lg">
                        <PieChartIcon className="w-6 h-6 text-white" />
                      </div>
                      Stock Level Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-green-500 rounded"></div>
                          <span>In Stock</span>
                        </div>
                        <span className="font-bold">{inventoryItems.filter(item => item.currentStock > item.reorderLevel).length}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                          <span>Reorder Soon</span>
                        </div>
                        <span className="font-bold">{inventoryItems.filter(item => item.currentStock <= item.reorderLevel && item.currentStock > item.minStock).length}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-orange-500 rounded"></div>
                          <span>Low Stock</span>
                        </div>
                        <span className="font-bold">{inventoryStats.lowStockCount}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-red-500 rounded"></div>
                          <span>Out of Stock</span>
                        </div>
                        <span className="font-bold">{inventoryStats.outOfStockCount}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Category Breakdown */}
                <Card className="glass-card shadow-luxury border-0 hover-lift animate-scale-in" style={{ animationDelay: '100ms' }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 gradient-secondary rounded-lg">
                        <BarChart3Icon className="w-6 h-6 text-white" />
                      </div>
                      Category Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      {categories.map((category, index) => {
                        const categoryItems = inventoryItems.filter(item => item.category === category);
                        const categoryValue = categoryItems.reduce((sum, item) => sum + (item.currentStock * (item.unitPrice || 0)), 0);
                        
                        if (categoryItems.length === 0) return null;
                        
                        return (
                          <div key={category} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <p className="font-semibold">{category}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{categoryItems.length} items</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">R{categoryValue.toFixed(2)}</p>
                              <Progress 
                                value={(categoryValue / inventoryStats.totalValue) * 100} 
                                className="w-16 h-2 mt-1"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-8 animate-slide-up">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Inventory Reports</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">Generate detailed reports for inventory analysis</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { title: 'Stock Level Report', description: 'Current stock levels and alerts', icon: PackageIcon },
                  { title: 'Low Stock Report', description: 'Items requiring immediate attention', icon: AlertTriangleIcon },
                  { title: 'Category Analysis', description: 'Performance by product category', icon: PieChartIcon },
                  { title: 'Inventory Valuation', description: 'Total inventory value breakdown', icon: DollarSignIcon },
                  { title: 'Movement Report', description: 'Stock movement and turnover', icon: TrendingUpIcon },
                  { title: 'Supplier Report', description: 'Supplier performance analysis', icon: UploadIcon }
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

        {/* Barcode Scanner Dialog */}
        <Dialog open={showBarcodeScanner} onOpenChange={setShowBarcodeScanner}>
          <DialogContent className="glass-card border-0 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 gradient-primary rounded-lg">
                  <ScanIcon className="w-6 h-6 text-white" />
                </div>
                Barcode Scanner for Inventory
              </DialogTitle>
              <DialogDescription>
                Use your device camera to scan product barcodes and automatically add items to inventory with pre-filled product information.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <BarcodeScanner
                onScanSuccess={handleBarcodeScanning}
                onScanError={(error) => {
                  addNotification({
                    type: 'error',
                    title: 'Scanner Error',
                    message: error,
                    duration: 4000
                  });
                }}
                isActive={showBarcodeScanner}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}