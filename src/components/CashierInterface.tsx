import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";
import { Skeleton } from "./ui/skeleton";
import { Label } from "./ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Receipt } from "./Receipt";
import { BarcodeScanner } from "./BarcodeScanner";
import { cashierAPI, type Product, type CartItem, type Transaction, type ApiResponse } from "../utils/cashier-api";
import { useNotifications } from "./NotificationSystem";
import { PRODUCTION_CONFIG, generateTerminalId } from "../utils/production-config";
import { 
  ShoppingCartIcon, 
  PlusIcon, 
  MinusIcon, 
  TrashIcon, 
  CreditCardIcon, 
  DollarSignIcon, 
  PrinterIcon, 
  ScanIcon, 
  XIcon, 
  SparklesIcon,
  SearchIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  LoaderIcon,
  RefreshCwIcon,
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
  ReceiptIcon,
  FileTextIcon,
  ClockIcon,
  FilterIcon,
  TagIcon
} from "lucide-react";

interface CashierInterfaceProps {
  onLogout: () => void;
  showHeader?: boolean;
}

// Icon mapping for products
const iconMap = {
  Coffee,
  Sandwich,
  Droplets,
  Package2,
  Zap,
  Heart,
  GlassWater,
  Dumbbell,
  Croissant,
  Milk
};

export function CashierInterface({ onLogout, showHeader = true }: CashierInterfaceProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Array<{ name: string; count: number }>>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cashReceived, setCashReceived] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [dailySales, setDailySales] = useState({
    totalSales: 0,
    totalTransactions: 0
  });
  const [inventoryStatus, setInventoryStatus] = useState<any>(null);

  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const { addNotification } = useNotifications();

  // Print receipt function
  const printReceipt = () => {
    if (receiptRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Receipt Print</title>
              <style>
                @media print {
                  body {
                    margin: 0;
                    padding: 20px;
                    font-family: monospace;
                    font-size: 12px;
                    line-height: 1.4;
                  }
                  .receipt {
                    max-width: 300px;
                    margin: 0 auto;
                    background: white !important;
                    color: black !important;
                  }
                  .gradient-primary,
                  .gradient-secondary,
                  .gradient-accent {
                    background: black !important;
                    color: white !important;
                  }
                  .glass-card {
                    background: white !important;
                    border: 1px solid black !important;
                    box-shadow: none !important;
                  }
                }
              </style>
            </head>
            <body>
              ${receiptRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        
        printWindow.onload = () => {
          printWindow.print();
          printWindow.close();
        };
        
        addNotification({
          type: 'success',
          title: 'Receipt Sent to Printer',
          message: 'Receipt has been prepared for printing',
          duration: 3000
        });
      }
    }
  };

  const formatZAR = (amount: number) => `${PRODUCTION_CONFIG.CURRENCY_SYMBOL}${amount.toFixed(2)}`;

  // Load products and categories
  const loadProducts = async (showNotification = true) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [productsResponse, categoriesResponse] = await Promise.all([
        cashierAPI.getProducts(),
        cashierAPI.getCategories()
      ]);
      
      if (productsResponse.success && productsResponse.data) {
        setProducts(productsResponse.data.products);
        
        if (showNotification) {
          addNotification({
            type: 'success',
            title: 'Products Loaded',
            message: `${productsResponse.data.products.length} products synchronized`,
            duration: 3000
          });
        }
      } else {
        throw new Error(productsResponse.error || 'Failed to load products');
      }

      if (categoriesResponse.success && categoriesResponse.data) {
        setCategories(categoriesResponse.data);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load products';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Loading Failed',
        message: errorMessage,
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load daily sales
  const loadDailySales = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await cashierAPI.getDailySales(today);
      
      if (response.success && response.data) {
        const salesData = {
          totalSales: response.data.totalSales,
          totalTransactions: response.data.totalTransactions
        };
        
        setDailySales(salesData);
        
        // Update localStorage for header display synchronization
        localStorage.setItem('roxton-pos-daily-total', salesData.totalSales.toString());
        localStorage.setItem('roxton-pos-transaction-count', salesData.totalTransactions.toString());
      }
    } catch (error) {
      console.log('Error loading daily sales:', error);
      
      // Fallback to localStorage if API fails
      const savedTotal = localStorage.getItem('roxton-pos-daily-total');
      const savedCount = localStorage.getItem('roxton-pos-transaction-count');
      
      if (savedTotal && savedCount) {
        setDailySales({
          totalSales: parseFloat(savedTotal),
          totalTransactions: parseInt(savedCount)
        });
      }
    }
  };

  // Filter products based on search and category
  useEffect(() => {
    let filtered = products;
    
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode.includes(searchTerm)
      );
    }
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory]);

  // Load data on component mount
  useEffect(() => {
    loadProducts(false);
    loadDailySales();
    
    // Initialize demo data if no sales data exists
    const existingTotal = localStorage.getItem('roxton-pos-daily-total');
    const existingCount = localStorage.getItem('roxton-pos-transaction-count');
    
    if (!existingTotal && !existingCount) {
      // Set some demo data for a realistic POS experience
      localStorage.setItem('roxton-pos-daily-total', '1247.85');
      localStorage.setItem('roxton-pos-transaction-count', '8');
      localStorage.setItem('roxton-pos-inventory-value', '18456.75');
      
      setDailySales({
        totalSales: 1247.85,
        totalTransactions: 8
      });
    }
  }, []);

  // Load inventory status
  const loadInventoryStatus = async () => {
    try {
      const response = await cashierAPI.getInventoryStatus();
      if (response.success && response.data) {
        setInventoryStatus(response.data);
      }
    } catch (error) {
      console.log('Error loading inventory status:', error);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadProducts(false);
      loadDailySales();
      loadInventoryStatus();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Load inventory status on mount
  useEffect(() => {
    loadInventoryStatus();
  }, []);

  // Handle barcode scanning from camera or manual input
  const handleBarcodeScanning = async (barcode: string) => {
    if (!barcode.trim()) return;
    
    try {
      setIsScanning(true);
      const response = await cashierAPI.getProductByBarcode(barcode);
      
      if (response.success && response.data) {
        addToCart(response.data);
        setBarcodeInput("");
        setShowBarcodeScanner(false);
        
        addNotification({
          type: 'success',
          title: 'Product Scanned Successfully',
          message: `${response.data.name} - ${formatZAR(response.data.price)} added to cart`,
          duration: 4000
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Product Not Found',
          message: `No product found with barcode: ${barcode}`,
          duration: 5000
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Scan Failed',
        message: 'Failed to scan product. Please try again.',
        duration: 5000
      });
    } finally {
      setIsScanning(false);
    }
  };

  // Handle scanner errors
  const handleScannerError = (error: string) => {
    addNotification({
      type: 'error',
      title: 'Scanner Error',
      message: error,
      duration: 5000
    });
  };

  // Add product to cart
  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      addNotification({
        type: 'error',
        title: 'Out of Stock',
        message: `${product.name} is currently out of stock`,
        duration: 5000
      });
      return;
    }

    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      
      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          addNotification({
            type: 'warning',
            title: 'Stock Limit',
            message: `Cannot add more. Only ${product.stock} available`,
            duration: 5000
          });
          return prev;
        }
        
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          barcode: product.barcode,
          taxRate: product.taxRate
        }];
      }
    });
  };

  // Update cart item quantity
  const updateCartQuantity = (productId: string, change: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setCart(prev => {
      return prev.map(item => {
        if (item.id === productId) {
          const newQuantity = item.quantity + change;
          
          if (newQuantity <= 0) {
            return null;
          }
          
          if (newQuantity > product.stock) {
            addNotification({
              type: 'warning',
              title: 'Stock Limit',
              message: `Only ${product.stock} available`,
              duration: 3000
            });
            return item;
          }
          
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  // Remove item from cart
  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  // Clear entire cart
  const clearCart = () => {
    setCart([]);
  };

  // Calculate totals using production config VAT rate
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = cart.reduce((sum, item) => sum + (item.price * item.quantity * (item.taxRate || PRODUCTION_CONFIG.VAT_RATE)), 0);
  const total = subtotal + tax;

  // Process transaction with enhanced error handling
  const processTransaction = async () => {
    if (cart.length === 0) {
      addNotification({
        type: 'error',
        title: 'Empty Cart',
        message: 'Please add items to cart before checkout',
        duration: 5000
      });
      return;
    }

    const cashAmount = parseFloat(cashReceived) || 0;
    
    if (paymentMethod === 'cash' && cashAmount < total) {
      addNotification({
        type: 'error',
        title: 'Insufficient Payment',
        message: `Required: ${formatZAR(total)}, Received: ${formatZAR(cashAmount)}`,
        duration: 5000
      });
      return;
    }

    // Validate stock availability before processing
    for (const item of cart) {
      const product = products.find(p => p.id === item.id);
      if (!product || product.stock < item.quantity) {
        addNotification({
          type: 'error',
          title: 'Stock Unavailable',
          message: `${item.name} - Only ${product?.stock || 0} available`,
          duration: 5000
        });
        return;
      }
    }

    try {
      setIsProcessing(true);
      
      const transactionData = {
        items: cart,
        paymentMethod,
        paymentReceived: paymentMethod === 'cash' ? cashAmount : total,
        cashier: localStorage.getItem('roxton-pos-user') ? JSON.parse(localStorage.getItem('roxton-pos-user')!).name || 'Cashier' : 'Cashier',
        terminal: generateTerminalId()
      };

      console.log('Processing transaction:', transactionData);
      
      const response = await cashierAPI.processTransaction(transactionData);
      
      if (response.success && response.data) {
        // Transaction successful
        setLastTransaction(response.data);
        setShowReceipt(true);
        clearCart();
        setCashReceived("");
        setPaymentMethod("cash");
        
        // Update daily sales
        const newTotalSales = dailySales.totalSales + response.data.total;
        const newTotalTransactions = dailySales.totalTransactions + 1;
        
        setDailySales({
          totalSales: newTotalSales,
          totalTransactions: newTotalTransactions
        });
        
        // Update localStorage for header display
        localStorage.setItem('roxton-pos-daily-total', newTotalSales.toString());
        localStorage.setItem('roxton-pos-transaction-count', newTotalTransactions.toString());
        
        // Refresh products and inventory to update stock
        setTimeout(() => {
          loadProducts(false);
          loadInventoryStatus();
        }, 500);
        
        addNotification({
          type: 'success',
          title: 'Transaction Completed Successfully',
          message: `Receipt #${response.data.receiptNumber} - ${formatZAR(response.data.total)}`,
          duration: 5000
        });
        
      } else {
        // Transaction failed
        console.error('Transaction failed:', response);
        
        let errorTitle = 'Transaction Failed';
        let errorMessage = response.error || 'Transaction could not be processed';
        
        // Handle specific error types
        if (response.error?.includes('Insufficient stock')) {
          errorTitle = 'Stock Error';
          errorMessage = 'Some items are out of stock. Please refresh and try again.';
          // Refresh products to show current stock levels
          loadProducts(true);
        } else if (response.error?.includes('Insufficient payment')) {
          errorTitle = 'Payment Error';
          errorMessage = response.error;
        } else if (response.error?.includes('not found')) {
          errorTitle = 'Product Error';
          errorMessage = 'One or more products could not be found. Please refresh and try again.';
          loadProducts(true);
        }
        
        addNotification({
          type: 'error',
          title: errorTitle,
          message: errorMessage,
          duration: 7000
        });
        
        // If transaction was saved offline, show different message
        if (response.error?.includes('saved locally') || response.details?.includes('offline')) {
          addNotification({
            type: 'warning',
            title: 'Offline Transaction',
            message: 'Transaction saved locally. Will sync when connection is restored.',
            duration: 5000
          });
        }
      }
      
    } catch (error) {
      console.error('Transaction processing error:', error);
      
      // Create fallback offline transaction
      try {
        const offlineTransaction = {
          id: `OFFLINE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          receiptNumber: `OFFLINE_${Date.now()}`,
          timestamp: new Date().toISOString(),
          items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            total: item.price * item.quantity,
            barcode: item.barcode,
            taxRate: item.taxRate || 0.15
          })),
          subtotal: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          tax: cart.reduce((sum, item) => sum + (item.price * item.quantity * (item.taxRate || 0.15)), 0),
          total: total,
          paymentMethod,
          paymentReceived: paymentMethod === 'cash' ? cashAmount : total,
          change: paymentMethod === 'cash' ? cashAmount - total : 0,
          cashier: localStorage.getItem('roxton-pos-user') ? JSON.parse(localStorage.getItem('roxton-pos-user')!).name || 'Cashier' : 'Cashier',
          terminal: generateTerminalId(),
          status: 'offline_pending'
        };
        
        // Save to localStorage as backup
        const offlineTransactions = JSON.parse(localStorage.getItem('roxton-pos-offline-transactions') || '[]');
        offlineTransactions.push(offlineTransaction);
        localStorage.setItem('roxton-pos-offline-transactions', JSON.stringify(offlineTransactions));
        
        setLastTransaction(offlineTransaction);
        setShowReceipt(true);
        clearCart();
        setCashReceived("");
        setPaymentMethod("cash");
        
        addNotification({
          type: 'warning',
          title: 'Offline Transaction Created',
          message: 'Connection failed. Transaction saved offline and will sync later.',
          duration: 7000
        });
        
      } catch (fallbackError) {
        console.error('Fallback transaction creation failed:', fallbackError);
        
        addNotification({
          type: 'error',
          title: 'Transaction Failed',
          message: 'Unable to process transaction. Please check connection and try again.',
          duration: 7000
        });
      }
      
    } finally {
      setIsProcessing(false);
    }
  };

  // Get the icon component
  const getIconComponent = (iconName: string) => {
    return iconMap[iconName as keyof typeof iconMap] || Package2;
  };

  if (isLoading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-slate-900 relative overflow-hidden">
        <div className="container-optimized px-6 py-8 relative z-10">
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center animate-float">
              <LoaderIcon className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Loading Cashier System</h3>
            <p className="text-gray-600 dark:text-gray-400">Synchronizing products and inventory...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-600/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-blue-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container-optimized px-6 py-8 relative z-10">
        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50 animate-slide-down">
            <AlertTriangleIcon className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-3 h-6 px-2 text-red-600 border-red-300"
                onClick={() => loadProducts()}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Fixed Position Print Slip Section */}
        {lastTransaction && (
          <Card className="fixed top-[10px] left-1/2 transform -translate-x-1/2 z-50 w-[95%] max-w-5xl glass-card shadow-ultimate border-0 animate-slide-down bg-gradient-to-r from-green-50/90 to-emerald-50/90 dark:from-green-900/40 dark:to-emerald-900/40 border-2 border-green-200/50 dark:border-green-700/50 backdrop-blur-md">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-2xl">
              <CardTitle className="flex items-center gap-4 text-2xl">
                <div className="p-3 bg-white/20 rounded-xl">
                  <ReceiptIcon className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span>Transaction Receipt</span>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30 animate-pulse">
                      Ready to Print
                    </Badge>
                  </div>
                  <p className="text-green-100 text-sm font-normal mt-1">
                    Receipt #{lastTransaction.receiptNumber} • {formatZAR(lastTransaction.total)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={printReceipt}
                    size="lg"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50 h-14 px-6 font-semibold shadow-luxury"
                  >
                    <PrinterIcon className="w-6 h-6 mr-3" />
                    Print Receipt
                  </Button>
                  <Button
                    onClick={() => setShowReceipt(true)}
                    variant="outline"
                    size="lg"
                    className="bg-white/10 hover:bg-white/20 text-white border-white/30 hover:border-white/50 h-14 px-6"
                  >
                    <FileTextIcon className="w-5 h-5 mr-2" />
                    View
                  </Button>
                  <Button
                    onClick={() => setLastTransaction(null)}
                    variant="ghost"
                    size="lg"
                    className="bg-white/10 hover:bg-white/20 text-white border-white/30 hover:border-white/50 h-14 w-14 p-0"
                  >
                    <XIcon className="w-6 h-6" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-4 p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                  <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
                    <ClockIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Transaction Time</p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {new Date(lastTransaction.timestamp).toLocaleTimeString('en-ZA', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                    <DollarSignIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Payment Method</p>
                    <p className="font-bold text-gray-900 dark:text-white">{lastTransaction.paymentMethod.toUpperCase()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                    <ShoppingCartIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Items</p>
                    <p className="font-bold text-gray-900 dark:text-white">{lastTransaction.items.length} products</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up">
          {/* Left Column - Product Search & Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Barcode Scanner Section */}
            <Card className="glass-card shadow-luxury border-0 hover-lift">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-2xl">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <ScanIcon className="w-6 h-6" />
                  </div>
                  Quick Barcode Scanner
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      ref={barcodeInputRef}
                      type="text"
                      placeholder="Scan or type barcode here..."
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && barcodeInput.trim()) {
                          handleBarcodeScanning(barcodeInput);
                        }
                      }}
                      className="text-lg h-12 focus:ring-2 focus:ring-blue-500"
                      disabled={isScanning}
                    />
                  </div>
                  <Button
                    onClick={() => handleBarcodeScanning(barcodeInput)}
                    disabled={!barcodeInput.trim() || isScanning}
                    className="gradient-primary text-white h-12 px-6 hover-lift"
                  >
                    {isScanning ? (
                      <LoaderIcon className="w-5 h-5 animate-spin" />
                    ) : (
                      <ScanIcon className="w-5 h-5" />
                    )}
                  </Button>
                  <Button
                    onClick={() => setShowBarcodeScanner(true)}
                    variant="outline"
                    className="h-12 px-4 border-2 border-blue-200 hover:bg-blue-50"
                  >
                    📷
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Product Search & Filter Accordion */}
            <Card className="glass-card shadow-luxury border-0">
              <Accordion type="single" collapsible defaultValue="search">
                <AccordionItem value="search" className="border-none">
                  <AccordionTrigger className="px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-2xl hover:no-underline">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <SearchIcon className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-xl font-semibold">Product Search & Filters</h3>
                        <p className="text-purple-100 text-sm">Find products by name, category, or barcode</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 py-6 border-0">
                    <div className="space-y-4">
                      <div className="relative">
                        <SearchIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Search products by name, description, or barcode..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 h-12 text-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                        />
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <FilterIcon className="w-5 h-5 text-gray-500" />
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger className="w-64 h-12 border-2 border-gray-200">
                            <SelectValue placeholder="All Categories" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category.name} value={category.name}>
                                {category.name} ({category.count})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Button
                          onClick={() => loadProducts(true)}
                          variant="outline"
                          className="h-12 px-4 border-2 border-gray-200 hover:bg-gray-50"
                        >
                          <RefreshCwIcon className="w-5 h-5" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <TagIcon className="w-4 h-4" />
                        <span>Showing {filteredProducts.length} of {products.length} products</span>
                        {searchTerm && (
                          <Badge variant="outline" className="ml-2">
                            Search: "{searchTerm}"
                          </Badge>
                        )}
                        {selectedCategory !== "all" && (
                          <Badge variant="outline" className="ml-1">
                            Category: {selectedCategory}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>

            {/* Available Products with overflow auto */}
            <Card className="glass-card shadow-luxury border-0">
              <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-t-2xl">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Package2 className="w-6 h-6" />
                  </div>
                  Available Products
                  <Badge variant="secondary" className="ml-auto bg-white/20 text-white border-white/30">
                    {filteredProducts.length} items
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-96 overflow-auto custom-scrollbar">
                  <div className="p-6">
                    {isLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="p-4 border rounded-xl">
                            <Skeleton className="h-16 w-16 rounded-lg mb-3" />
                            <Skeleton className="h-4 w-32 mb-2" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        ))}
                      </div>
                    ) : filteredProducts.length === 0 ? (
                      <div className="text-center py-12">
                        <Package2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Products Found</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {searchTerm || selectedCategory !== "all" 
                            ? "Try adjusting your search or filter criteria" 
                            : "No products available"}
                        </p>
                        {(searchTerm || selectedCategory !== "all") && (
                          <Button
                            onClick={() => {
                              setSearchTerm("");
                              setSelectedCategory("all");
                            }}
                            variant="outline"
                            className="mt-4"
                          >
                            Clear Filters
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredProducts.map((product, index) => {
                          const IconComponent = getIconComponent(product.icon);
                          return (
                            <Card
                              key={product.id}
                              className="group glass-card-weak hover:glass-card-strong border-0 cursor-pointer transition-all duration-300 hover-lift animate-scale-in"
                              style={{ animationDelay: `${index * 50}ms` }}
                              onClick={() => addToCart(product)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                  <div className={`p-3 rounded-xl bg-gradient-to-br ${product.color || 'from-blue-100 to-blue-200'} flex-shrink-0 transition-all duration-300 group-hover:scale-110`}>
                                    <IconComponent className={`w-8 h-8 ${product.color || 'text-blue-600'}`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                                      {product.name}
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                                      {product.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                      <span className="text-lg font-bold text-green-600">
                                        {formatZAR(product.price)}
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <Badge 
                                          variant={product.stock > 10 ? "default" : product.stock > 0 ? "secondary" : "destructive"}
                                          className="text-xs"
                                        >
                                          Stock: {product.stock}
                                        </Badge>
                                      </div>
                                    </div>
                                    {product.stock <= 10 && product.stock > 0 && (
                                      <div className="flex items-center gap-1 mt-2">
                                        <AlertTriangleIcon className="w-4 h-4 text-amber-500" />
                                        <span className="text-xs text-amber-600">Low stock</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Shopping Cart & Checkout */}
          <div className="space-y-6">
            {/* Shopping Cart with overflow auto */}
            <Card className="glass-card shadow-luxury border-0 sticky top-4">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-t-2xl">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <ShoppingCartIcon className="w-6 h-6" />
                  </div>
                  Shopping Cart
                  <Badge variant="secondary" className="ml-auto bg-white/20 text-white border-white/30">
                    {cart.length} items
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {cart.length === 0 ? (
                  <div className="p-6 text-center">
                    <ShoppingCartIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Cart is Empty</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Scan a barcode or select products to start
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="h-80 overflow-auto custom-scrollbar">
                      <div className="p-6 space-y-4">
                        {cart.map((item, index) => (
                          <div 
                            key={item.id} 
                            className="flex items-center gap-4 p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl animate-scale-in"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                                {item.name}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {formatZAR(item.price)} each
                              </p>
                              <p className="text-sm font-bold text-green-600">
                                Subtotal: {formatZAR(item.price * item.quantity)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateCartQuantity(item.id, -1)}
                                disabled={item.quantity <= 1}
                                className="w-8 h-8 p-0 rounded-full"
                              >
                                <MinusIcon className="w-4 h-4" />
                              </Button>
                              <span className="w-8 text-center font-bold">
                                {item.quantity}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateCartQuantity(item.id, 1)}
                                className="w-8 h-8 p-0 rounded-full"
                              >
                                <PlusIcon className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeFromCart(item.id)}
                                className="w-8 h-8 p-0 rounded-full text-red-600 hover:bg-red-50"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Cart Totals */}
                    <div className="p-6 space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                          <span>Subtotal:</span>
                          <span>{formatZAR(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                          <span>VAT ({(PRODUCTION_CONFIG.VAT_RATE * 100).toFixed(0)}%):</span>
                          <span>{formatZAR(tax)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                          <span>Total:</span>
                          <span className="text-green-600">{formatZAR(total)}</span>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={clearCart} 
                        variant="outline" 
                        className="w-full border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <TrashIcon className="w-4 h-4 mr-2" />
                        Clear Cart
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Payment Section */}
            {cart.length > 0 && (
              <Card className="glass-card shadow-luxury border-0">
                <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-t-2xl">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <CreditCardIcon className="w-6 h-6" />
                    </div>
                    Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="payment-method" className="text-base font-semibold">
                        Payment Method
                      </Label>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger className="h-12 text-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">
                            <div className="flex items-center gap-2">
                              <DollarSignIcon className="w-4 h-4" />
                              Cash
                            </div>
                          </SelectItem>
                          <SelectItem value="card">
                            <div className="flex items-center gap-2">
                              <CreditCardIcon className="w-4 h-4" />
                              Card
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {paymentMethod === 'cash' && (
                      <div className="space-y-2">
                        <Label htmlFor="cash-received" className="text-base font-semibold">
                          Cash Received
                        </Label>
                        <Input
                          id="cash-received"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={cashReceived}
                          onChange={(e) => setCashReceived(e.target.value)}
                          className="h-12 text-lg"
                        />
                        {cashReceived && parseFloat(cashReceived) >= total && (
                          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="text-green-800 dark:text-green-400 font-semibold">Change:</span>
                              <span className="text-xl font-bold text-green-600">
                                {formatZAR(parseFloat(cashReceived) - total)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <Button
                    onClick={processTransaction}
                    disabled={isProcessing || (paymentMethod === 'cash' && parseFloat(cashReceived || '0') < total)}
                    className="w-full h-14 text-lg gradient-primary text-white hover-lift shadow-luxury"
                  >
                    {isProcessing ? (
                      <>
                        <LoaderIcon className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="w-6 h-6 mr-2" />
                        Complete Transaction - {formatZAR(total)}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Receipt Dialog */}
        <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Transaction Receipt</DialogTitle>
              <DialogDescription>
                Print or save this receipt for your records
              </DialogDescription>
            </DialogHeader>
            <div ref={receiptRef}>
              {lastTransaction && <Receipt transaction={lastTransaction} />}
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={printReceipt} className="flex-1 gradient-primary text-white">
                <PrinterIcon className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button onClick={() => setShowReceipt(false)} variant="outline" className="flex-1">
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Barcode Scanner Dialog */}
        <Dialog open={showBarcodeScanner} onOpenChange={setShowBarcodeScanner}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Barcode Scanner</DialogTitle>
              <DialogDescription>
                Point your camera at a barcode to scan it
              </DialogDescription>
            </DialogHeader>
            <BarcodeScanner
              onScan={handleBarcodeScanning}
              onError={handleScannerError}
              isActive={showBarcodeScanner}
            />
            <Button 
              onClick={() => setShowBarcodeScanner(false)} 
              variant="outline" 
              className="w-full mt-4"
            >
              Close Scanner
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}