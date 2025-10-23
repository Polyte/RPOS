import { useState, useEffect } from "react";
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
import { useNotifications } from "./NotificationSystem";
import { type AppState, type SystemStatus } from "../utils/app-constants";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import {
  BuildingIcon,
  UsersIcon,
  ServerIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MapPinIcon,
  ShieldCheckIcon,
  UserCheckIcon,
  UserXIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  RefreshCwIcon,
  SearchIcon,
  FilterIcon,
  EyeIcon,
  BellIcon,
  TargetIcon,
  TruckIcon,
  ScanLineIcon,
  QrCodeIcon,
  BarChart3Icon,
  CalendarIcon,
  FileTextIcon,
  SettingsIcon,
  UserPlusIcon,
  PackageSearchIcon,
  ActivityIcon,
  ListChecksIcon,
  TimerIcon,
  StarIcon,
  TrendingDownIcon,
  AlertCircleIcon,
  DatabaseIcon,
  GlobeIcon,
  PhoneIcon,
  MailIcon,
  CreditCardIcon,
  MonitorIcon,
  ShoppingCartIcon,
  TrendingUpIcon,
  DollarSignIcon,
  HelpCircleIcon,
  MessageSquareIcon,
  ZapIcon,
  WifiIcon,
  CpuIcon,
  HardDriveIcon,
  MemoryStickIcon,
  NetworkIcon,
  LogInIcon,
  LogOutIcon,
  MousePointerClickIcon,
  PlayCircleIcon,
  PauseCircleIcon,
  StopCircleIcon,
  RadioIcon,
  WifiOffIcon
} from "lucide-react";

interface MultitenantManagerInterfaceProps {
  onLogout: () => void;
  showHeader?: boolean;
}

interface Tenant {
  id: string;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  country: string;
  postalCode: string;
  coordinates?: { lat: number; lng: number };
  status: 'active' | 'inactive' | 'suspended' | 'trial';
  plan: 'basic' | 'standard' | 'premium' | 'enterprise';
  subscriptionEnd: string;
  createdAt: string;
  lastLogin: string;
  activeUsers: number;
  totalTransactions: number;
  monthlyRevenue: number;
  systemHealth: 'excellent' | 'good' | 'poor';
  features: string[];
  limits: {
    users: number;
    locations: number;
    transactions: number;
    storage: number;
  };
  usage: {
    users: number;
    locations: number;
    transactions: number;
    storage: number;
  };
}

interface Vendor {
  id: string;
  name: string;
  category: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  tenantsUsing: string[];
  status: 'active' | 'inactive' | 'pending';
  integrationStatus: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  totalOrders: number;
  totalValue: number;
  rating: number;
  supportLevel: 'basic' | 'premium' | 'enterprise';
}

interface SystemLog {
  id: string;
  timestamp: string;
  tenantId: string;
  tenantName: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  description: string;
  category: 'login' | 'logout' | 'transaction' | 'system' | 'error' | 'security' | 'inventory' | 'user_management';
  severity: 'info' | 'warning' | 'error' | 'critical';
  ipAddress: string;
  userAgent: string;
  metadata?: any;
}

interface SupportTicket {
  id: string;
  tenantId: string;
  tenantName: string;
  userId: string;
  userName: string;
  userRole: string;
  subject: string;
  description: string;
  category: 'technical' | 'billing' | 'feature_request' | 'bug_report' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  responses: SupportResponse[];
  attachments: string[];
}

interface SupportResponse {
  id: string;
  ticketId: string;
  responderId: string;
  responderName: string;
  message: string;
  timestamp: string;
  isInternal: boolean;
}

interface RealTimeMetrics {
  activeUsers: number;
  activeTenants: number;
  onlineUsers: number;
  systemLoad: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  errorRate: number;
  transactionsPerMinute: number;
  supportTicketsOpen: number;
  serverStatus: 'online' | 'maintenance' | 'offline';
  databaseConnections: number;
  cacheHitRate: number;
}

export function MultitenantManagerInterface({ onLogout, showHeader = true }: MultitenantManagerInterfaceProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddTenantDialog, setShowAddTenantDialog] = useState(false);
  const [showSupportTicketDialog, setShowSupportTicketDialog] = useState(false);
  const [selectedSupportTicket, setSelectedSupportTicket] = useState<SupportTicket | null>(null);

  const [newTenant, setNewTenant] = useState({
    name: '',
    businessName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    plan: 'basic' as const
  });

  const { addNotification } = useNotifications();

  // Create app state for header
  const appState: AppState = {
    currentRole: 'multitenant_manager',
    isLoading: false,
    user: {
      id: 'mtm-1',
      name: localStorage.getItem('roxton-pos-user') ? JSON.parse(localStorage.getItem('roxton-pos-user')!).name || 'Multitenant Manager' : 'Multitenant Manager',
      role: 'multitenant_manager',
      email: 'manager@roxtonpos-enterprise.co.za',
      permissions: ['tenant_management', 'system_monitoring', 'support_management', 'analytics', 'vendor_oversight'],
      isActive: true
    }
  };

  const systemStatus: SystemStatus = {
    isOnline: true,
    serverHealth: 'excellent',
    systemLoad: realTimeMetrics?.systemLoad || Math.floor(Math.random() * 25) + 15,
    lastSync: new Date(),
    activeSessions: realTimeMetrics?.activeUsers || 24,
    pendingTasks: supportTickets.filter(t => t.status === 'open').length
  };

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Load demo data and start real-time updates
  useEffect(() => {
    loadDemoData();
    startRealTimeUpdates();
  }, []);

  // Real-time metrics updates
  const startRealTimeUpdates = () => {
    const updateMetrics = () => {
      setRealTimeMetrics({
        activeUsers: Math.floor(Math.random() * 50) + 20,
        activeTenants: Math.floor(Math.random() * 15) + 8,
        onlineUsers: Math.floor(Math.random() * 200) + 150,
        systemLoad: Math.floor(Math.random() * 30) + 15,
        memoryUsage: Math.floor(Math.random() * 25) + 55,
        diskUsage: Math.floor(Math.random() * 15) + 25,
        networkLatency: Math.floor(Math.random() * 20) + 15,
        errorRate: Math.random() * 2,
        transactionsPerMinute: Math.floor(Math.random() * 100) + 50,
        supportTicketsOpen: Math.floor(Math.random() * 10) + 5,
        serverStatus: 'online',
        databaseConnections: Math.floor(Math.random() * 50) + 100,
        cacheHitRate: Math.floor(Math.random() * 10) + 85
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 10000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  };

  const loadDemoData = () => {
    // Demo tenants
    setTenants([
      {
        id: 'tenant_1',
        name: 'Urban Fresh Market',
        businessName: 'Urban Fresh Market (Pty) Ltd',
        email: 'admin@urbanfresh.co.za',
        phone: '+27 11 123 4567',
        address: '123 Main Street',
        city: 'Johannesburg',
        province: 'Gauteng',
        country: 'South Africa',
        postalCode: '2001',
        coordinates: { lat: -26.2041, lng: 28.0473 },
        status: 'active',
        plan: 'premium',
        subscriptionEnd: '2025-08-11',
        createdAt: '2024-01-15',
        lastLogin: '2024-08-11 14:30',
        activeUsers: 8,
        totalTransactions: 15420,
        monthlyRevenue: 125000.00,
        systemHealth: 'excellent',
        features: ['multi_location', 'advanced_analytics', 'inventory_management', 'api_access'],
        limits: { users: 25, locations: 5, transactions: 50000, storage: 50 },
        usage: { users: 8, locations: 3, transactions: 15420, storage: 12 }
      },
      {
        id: 'tenant_2',
        name: 'Tech Solutions Store', 
        businessName: 'Tech Solutions CC',
        email: 'info@techsolutions.co.za',
        phone: '+27 21 456 7890',
        address: '456 Loop Street',
        city: 'Cape Town',
        province: 'Western Cape',
        country: 'South Africa',
        postalCode: '8001',
        coordinates: { lat: -33.9249, lng: 18.4241 },
        status: 'active',
        plan: 'standard',
        subscriptionEnd: '2025-06-15',
        createdAt: '2024-03-01',
        lastLogin: '2024-08-11 13:45',
        activeUsers: 4,
        totalTransactions: 8750,
        monthlyRevenue: 65000.00,
        systemHealth: 'good',
        features: ['inventory_management', 'basic_analytics'],
        limits: { users: 10, locations: 2, transactions: 25000, storage: 25 },
        usage: { users: 4, locations: 2, transactions: 8750, storage: 8 }
      },
      {
        id: 'tenant_3',
        name: 'Corner Cafe',
        businessName: 'Corner Cafe & Bistro',
        email: 'owner@cornercafe.co.za',
        phone: '+27 31 789 0123',
        address: '789 Beach Road',
        city: 'Durban',
        province: 'KwaZulu-Natal',
        country: 'South Africa',
        postalCode: '4001',
        coordinates: { lat: -29.8587, lng: 31.0218 },
        status: 'trial',
        plan: 'basic',
        subscriptionEnd: '2024-09-11',
        createdAt: '2024-07-20',
        lastLogin: '2024-08-11 12:15',
        activeUsers: 2,
        totalTransactions: 1250,
        monthlyRevenue: 18000.00,
        systemHealth: 'good',
        features: ['basic_pos'],
        limits: { users: 3, locations: 1, transactions: 5000, storage: 5 },
        usage: { users: 2, locations: 1, transactions: 1250, storage: 2 }
      },
      {
        id: 'tenant_4',
        name: 'Fashion Hub',
        businessName: 'Fashion Hub Retailers',
        email: 'contact@fashionhub.co.za',
        phone: '+27 12 345 6789',
        address: '321 Fashion Avenue',
        city: 'Pretoria',
        province: 'Gauteng',
        country: 'South Africa',
        postalCode: '0002',
        status: 'suspended',
        plan: 'standard',
        subscriptionEnd: '2024-05-15',
        createdAt: '2023-11-10',
        lastLogin: '2024-07-25 16:20',
        activeUsers: 0,
        totalTransactions: 12500,
        monthlyRevenue: 0.00,
        systemHealth: 'poor',
        features: ['inventory_management'],
        limits: { users: 10, locations: 2, transactions: 25000, storage: 25 },
        usage: { users: 6, locations: 1, transactions: 12500, storage: 15 }
      }
    ]);

    // Demo vendors
    setVendors([
      {
        id: 'vendor_1',
        name: 'FreshProduce Suppliers',
        category: 'Food & Beverage',
        contactEmail: 'orders@freshproduce.co.za',
        contactPhone: '+27 11 555 0001',
        address: 'Johannesburg Fresh Produce Market',
        tenantsUsing: ['tenant_1', 'tenant_3'],
        status: 'active',
        integrationStatus: 'connected',
        lastSync: '2024-08-11 14:45',
        totalOrders: 1250,
        totalValue: 2500000.00,
        rating: 4.8,
        supportLevel: 'premium'
      },
      {
        id: 'vendor_2',
        name: 'TechGear Distributors',
        category: 'Electronics',
        contactEmail: 'sales@techgear.co.za',
        contactPhone: '+27 21 555 0002',
        address: 'Cape Town Electronics Hub',
        tenantsUsing: ['tenant_2'],
        status: 'active',
        integrationStatus: 'connected',
        lastSync: '2024-08-11 13:30',
        totalOrders: 850,
        totalValue: 4200000.00,
        rating: 4.6,
        supportLevel: 'enterprise'
      },
      {
        id: 'vendor_3',
        name: 'Fashion Wholesalers',
        category: 'Clothing & Accessories',
        contactEmail: 'info@fashionwholesale.co.za',
        contactPhone: '+27 12 555 0003',
        address: 'Pretoria Fashion District',
        tenantsUsing: ['tenant_4'],
        status: 'inactive',
        integrationStatus: 'disconnected',
        lastSync: '2024-07-25 10:15',
        totalOrders: 320,
        totalValue: 850000.00,
        rating: 3.9,
        supportLevel: 'basic'
      }
    ]);

    // Demo system logs
    setSystemLogs([
      {
        id: 'log_1',
        timestamp: '2024-08-11 14:45:23',
        tenantId: 'tenant_1',
        tenantName: 'Urban Fresh Market',
        userId: 'user_001',
        userName: 'Alice Johnson',
        userRole: 'cashier',
        action: 'LOGIN',
        description: 'User logged into cashier terminal',
        category: 'login',
        severity: 'info',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        metadata: { terminalId: 'TERM_001', sessionId: 'sess_12345' }
      },
      {
        id: 'log_2',
        timestamp: '2024-08-11 14:40:15',
        tenantId: 'tenant_2',
        tenantName: 'Tech Solutions Store',
        userId: 'user_002',
        userName: 'Bob Smith',
        userRole: 'manager',
        action: 'INVENTORY_UPDATE',
        description: 'Updated stock levels for 15 products',
        category: 'inventory',
        severity: 'info',
        ipAddress: '192.168.2.50',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
        metadata: { productsUpdated: 15, totalValue: 25000 }
      },
      {
        id: 'log_3',
        timestamp: '2024-08-11 14:35:08',
        tenantId: 'tenant_1',
        tenantName: 'Urban Fresh Market',
        userId: 'user_003',
        userName: 'Carol Davis',
        userRole: 'admin',
        action: 'USER_CREATED',
        description: 'Created new user account for Jane Doe',
        category: 'user_management',
        severity: 'info',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Linux; Android 10)',
        metadata: { newUserId: 'user_004', newUserRole: 'stock_controller' }
      },
      {
        id: 'log_4',
        timestamp: '2024-08-11 14:30:45',
        tenantId: 'tenant_3',
        tenantName: 'Corner Cafe',
        userId: 'system',
        userName: 'System',
        userRole: 'system',
        action: 'SYSTEM_ERROR',
        description: 'Database connection timeout occurred',
        category: 'error',
        severity: 'error',
        ipAddress: '192.168.3.25',
        userAgent: 'System Process',
        metadata: { errorCode: 'DB_TIMEOUT', duration: 30000 }
      },
      {
        id: 'log_5',
        timestamp: '2024-08-11 14:25:30',
        tenantId: 'tenant_2',
        tenantName: 'Tech Solutions Store',
        userId: 'user_005',
        userName: 'David Wilson',
        userRole: 'supervisor',
        action: 'TRANSACTION_VOID',
        description: 'Voided transaction #TXN123456789',
        category: 'transaction',
        severity: 'warning',
        ipAddress: '192.168.2.51',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0)',
        metadata: { transactionId: 'TXN123456789', voidReason: 'Customer request', amount: 125.50 }
      }
    ]);

    // Demo support tickets
    setSupportTickets([
      {
        id: 'ticket_1',
        tenantId: 'tenant_1',
        tenantName: 'Urban Fresh Market',
        userId: 'user_001',
        userName: 'Alice Johnson',
        userRole: 'cashier',
        subject: 'Barcode scanner not working',
        description: 'The barcode scanner on terminal 3 is not reading QR codes properly. It works for regular barcodes but fails on QR codes.',
        category: 'technical',
        priority: 'high',
        status: 'open',
        createdAt: '2024-08-11 13:45:00',
        updatedAt: '2024-08-11 13:45:00',
        responses: [],
        attachments: []
      },
      {
        id: 'ticket_2',
        tenantId: 'tenant_2',
        tenantName: 'Tech Solutions Store',
        userId: 'user_002',
        userName: 'Bob Smith',
        userRole: 'manager',
        subject: 'Need access to advanced analytics',
        description: 'We would like to upgrade to premium plan to access advanced analytics features for better business insights.',
        category: 'feature_request',
        priority: 'medium',
        status: 'in_progress',
        assignedTo: 'support_agent_1',
        createdAt: '2024-08-11 10:30:00',
        updatedAt: '2024-08-11 12:15:00',
        responses: [
          {
            id: 'response_1',
            ticketId: 'ticket_2',
            responderId: 'support_agent_1',
            responderName: 'Sarah Support',
            message: 'Hi Bob, I can help you upgrade to our premium plan. Let me send you the pricing details and feature comparison.',
            timestamp: '2024-08-11 12:15:00',
            isInternal: false
          }
        ],
        attachments: []
      },
      {
        id: 'ticket_3',
        tenantId: 'tenant_3',
        tenantName: 'Corner Cafe',
        userId: 'user_006',
        userName: 'Emma Brown',
        userRole: 'manager',
        subject: 'Help with VAT calculation setup',
        description: 'I need help setting up VAT calculations correctly for our menu items. Some items should be VAT exempt.',
        category: 'general',
        priority: 'medium',
        status: 'resolved',
        assignedTo: 'support_agent_2',
        createdAt: '2024-08-10 14:20:00',
        updatedAt: '2024-08-11 09:30:00',
        responses: [
          {
            id: 'response_2',
            ticketId: 'ticket_3',
            responderId: 'support_agent_2',
            responderName: 'Mike Support',
            message: 'I can help you configure the VAT settings. Let me walk you through the process step by step.',
            timestamp: '2024-08-10 15:45:00',
            isInternal: false
          },
          {
            id: 'response_3',
            ticketId: 'ticket_3',
            responderId: 'user_006',
            responderName: 'Emma Brown',
            message: 'Thank you Mike! The VAT setup is working perfectly now.',
            timestamp: '2024-08-11 09:30:00',
            isInternal: false
          }
        ],
        attachments: []
      }
    ]);
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'trial':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'premium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'standard':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'basic':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'low':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const handleAddTenant = () => {
    if (!newTenant.name || !newTenant.email) {
      addNotification({
        type: 'error',
        title: 'Invalid Data',
        message: 'Please fill in all required fields',
        duration: 4000
      });
      return;
    }

    const tenant: Tenant = {
      id: `tenant_${Date.now()}`,
      ...newTenant,
      country: 'South Africa',
      postalCode: '0000',
      status: 'trial',
      subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      lastLogin: 'Never',
      activeUsers: 0,
      totalTransactions: 0,
      monthlyRevenue: 0,
      systemHealth: 'good',
      features: ['basic_pos'],
      limits: { users: 3, locations: 1, transactions: 5000, storage: 5 },
      usage: { users: 0, locations: 0, transactions: 0, storage: 0 }
    };

    setTenants(prev => [...prev, tenant]);
    setShowAddTenantDialog(false);
    setNewTenant({
      name: '',
      businessName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      province: '',
      plan: 'basic'
    });

    addNotification({
      type: 'success',
      title: 'Tenant Added',
      message: `${tenant.name} has been added successfully`,
      duration: 4000
    });
  };

  const formatZAR = (amount: number) => `R${amount.toFixed(2)}`;

  // Chart data
  const tenantGrowthData = [
    { month: 'Jan', tenants: 5, revenue: 45000 },
    { month: 'Feb', tenants: 8, revenue: 72000 },
    { month: 'Mar', tenants: 12, revenue: 108000 },
    { month: 'Apr', tenants: 15, revenue: 135000 },
    { month: 'May', tenants: 18, revenue: 162000 },
    { month: 'Jun', tenants: 22, revenue: 198000 },
    { month: 'Jul', tenants: 25, revenue: 225000 }
  ];

  const planDistributionData = [
    { name: 'Basic', value: 8, color: '#94a3b8' },
    { name: 'Standard', value: 12, color: '#3b82f6' },
    { name: 'Premium', value: 6, color: '#f59e0b' },
    { name: 'Enterprise', value: 3, color: '#8b5cf6' }
  ];

  const systemMetricsData = [
    { name: '00:00', cpu: 45, memory: 62, network: 78 },
    { name: '04:00', cpu: 35, memory: 58, network: 65 },
    { name: '08:00', cpu: 65, memory: 72, network: 85 },
    { name: '12:00', cpu: 78, memory: 85, network: 92 },
    { name: '16:00', cpu: 85, memory: 89, network: 95 },
    { name: '20:00', cpu: 72, memory: 75, network: 88 },
    { name: '24:00', cpu: 55, memory: 68, network: 82 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900 dark:to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-indigo-600/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-cyan-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
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
                <MonitorIcon className="w-5 h-5" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="tenants" className="flex items-center gap-3 text-base py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white">
                <BuildingIcon className="w-5 h-5" />
                Tenants
              </TabsTrigger>
              <TabsTrigger value="vendors" className="flex items-center gap-3 text-base py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white">
                <TruckIcon className="w-5 h-5" />
                Vendors
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex items-center gap-3 text-base py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white">
                <FileTextIcon className="w-5 h-5" />
                System Logs
              </TabsTrigger>
              <TabsTrigger value="support" className="flex items-center gap-3 text-base py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white">
                <HelpCircleIcon className="w-5 h-5" />
                Support
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-3 text-base py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                <BarChart3Icon className="w-5 h-5" />
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8 animate-slide-up">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Multitenant Manager Dashboard</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">Comprehensive oversight of all tenants, vendors, and system operations</p>
              </div>

              {/* Real-time Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="glass-card shadow-luxury border-0 hover-lift animate-scale-in">
                  <CardContent className="p-8 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Active Tenants</p>
                        <p className="text-4xl font-bold text-blue-600">{realTimeMetrics?.activeTenants || tenants.filter(t => t.status === 'active').length}</p>
                        <p className="text-sm text-blue-500 mt-1">Currently online</p>
                      </div>
                      <div className="p-4 bg-blue-100 dark:bg-blue-900/50 rounded-2xl">
                        <BuildingIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card shadow-luxury border-0 hover-lift animate-scale-in" style={{ animationDelay: '100ms' }}>
                  <CardContent className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Online Users</p>
                        <p className="text-4xl font-bold text-green-600">{realTimeMetrics?.onlineUsers || 156}</p>
                        <p className="text-sm text-green-500 mt-1">Across all tenants</p>
                      </div>
                      <div className="p-4 bg-green-100 dark:bg-green-900/50 rounded-2xl">
                        <UsersIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card shadow-luxury border-0 hover-lift animate-scale-in" style={{ animationDelay: '200ms' }}>
                  <CardContent className="p-8 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Support Tickets</p>
                        <p className="text-4xl font-bold text-orange-600">{supportTickets.filter(t => t.status === 'open').length}</p>
                        <p className="text-sm text-orange-500 mt-1">Need attention</p>
                      </div>
                      <div className="p-4 bg-orange-100 dark:bg-orange-900/50 rounded-2xl">
                        <HelpCircleIcon className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card shadow-luxury border-0 hover-lift animate-scale-in" style={{ animationDelay: '300ms' }}>
                  <CardContent className="p-8 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">System Health</p>
                        <p className="text-4xl font-bold text-purple-600">{realTimeMetrics?.systemLoad || 18}%</p>
                        <p className="text-sm text-purple-500 mt-1">System load</p>
                      </div>
                      <div className="p-4 bg-purple-100 dark:bg-purple-900/50 rounded-2xl">
                        <ServerIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Real-time System Monitoring */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="glass-card shadow-luxury border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <div className="p-2 gradient-primary rounded-lg">
                        <ActivityIcon className="w-6 h-6 text-white" />
                      </div>
                      Real-time System Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CpuIcon className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold">CPU Usage</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress value={realTimeMetrics?.systemLoad || 18} className="w-32" />
                          <span className="text-sm font-semibold">{realTimeMetrics?.systemLoad || 18}%</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <MemoryStickIcon className="w-5 h-5 text-green-600" />
                          <span className="font-semibold">Memory</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress value={realTimeMetrics?.memoryUsage || 62} className="w-32" />
                          <span className="text-sm font-semibold">{realTimeMetrics?.memoryUsage || 62}%</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <HardDriveIcon className="w-5 h-5 text-purple-600" />
                          <span className="font-semibold">Disk Usage</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress value={realTimeMetrics?.diskUsage || 35} className="w-32" />
                          <span className="text-sm font-semibold">{realTimeMetrics?.diskUsage || 35}%</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <NetworkIcon className="w-5 h-5 text-orange-600" />
                          <span className="font-semibold">Network</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-green-600">{realTimeMetrics?.networkLatency || 28}ms</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <ZapIcon className="w-5 h-5 text-yellow-600" />
                          <span className="font-semibold">Transactions/min</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-blue-600">{realTimeMetrics?.transactionsPerMinute || 73}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card shadow-luxury border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <div className="p-2 gradient-secondary rounded-lg">
                        <BellIcon className="w-6 h-6 text-white" />
                      </div>
                      Recent System Events
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {systemLogs.slice(0, 5).map((log, index) => (
                        <div key={log.id} className="flex items-start gap-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                          <div className={`w-3 h-3 rounded-full mt-2 ${
                            log.severity === 'error' || log.severity === 'critical' ? 'bg-red-500' :
                            log.severity === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}></div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">{log.tenantName}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{log.userName} • {log.userRole}</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{log.description}</p>
                              </div>
                              <div className="text-right">
                                <Badge className={`px-2 py-1 text-xs ${getSeverityColor(log.severity)}`}>
                                  {log.severity}
                                </Badge>
                                <p className="text-xs text-gray-500 mt-1">{new Date(log.timestamp).toLocaleTimeString()}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tenants Tab */}
            <TabsContent value="tenants" className="space-y-8 animate-slide-up">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Tenant Management</h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">Monitor and manage all tenant accounts</p>
                </div>
                <Button 
                  onClick={() => setShowAddTenantDialog(true)}
                  className="gradient-primary text-white shadow-luxury hover-lift px-6 py-3"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Add Tenant
                </Button>
              </div>

              {/* Tenant Filters */}
              <Card className="glass-card shadow-elegant border-0">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <SearchIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search tenants..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="trial">Trial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Tenants Table */}
              <Card className="glass-card shadow-luxury border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 gradient-primary rounded-lg">
                      <BuildingIcon className="w-6 h-6 text-white" />
                    </div>
                    Tenants ({filteredTenants.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 dark:bg-gray-800">
                          <TableHead className="py-4 font-bold">Tenant Details</TableHead>
                          <TableHead className="py-4 font-bold">Status</TableHead>
                          <TableHead className="py-4 font-bold">Plan</TableHead>
                          <TableHead className="py-4 font-bold">Usage</TableHead>
                          <TableHead className="py-4 font-bold">Revenue</TableHead>
                          <TableHead className="py-4 font-bold">Health</TableHead>
                          <TableHead className="py-4 font-bold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTenants.map((tenant, index) => (
                          <TableRow key={tenant.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                            <TableCell className="py-6">
                              <div>
                                <p className="font-bold text-lg text-gray-900 dark:text-white">{tenant.name}</p>
                                <p className="text-gray-600 dark:text-gray-400">{tenant.businessName}</p>
                                <p className="text-sm text-gray-500">{tenant.email}</p>
                                <p className="text-xs text-gray-500">{tenant.city}, {tenant.province}</p>
                              </div>
                            </TableCell>
                            
                            <TableCell className="py-6">
                              <Badge className={`px-3 py-1 ${getStatusColor(tenant.status)}`}>
                                {tenant.status}
                              </Badge>
                              <p className="text-xs text-gray-500 mt-1">
                                Last login: {tenant.lastLogin !== 'Never' ? new Date(tenant.lastLogin).toLocaleDateString() : 'Never'}
                              </p>
                            </TableCell>
                            
                            <TableCell className="py-6">
                              <Badge className={`px-3 py-1 ${getPlanColor(tenant.plan)}`}>
                                {tenant.plan}
                              </Badge>
                              <p className="text-xs text-gray-500 mt-1">
                                Expires: {new Date(tenant.subscriptionEnd).toLocaleDateString()}
                              </p>
                            </TableCell>
                            
                            <TableCell className="py-6">
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Users:</span>
                                  <span>{tenant.usage.users}/{tenant.limits.users}</span>
                                </div>
                                <Progress value={(tenant.usage.users / tenant.limits.users) * 100} className="h-2" />
                                <div className="flex justify-between text-sm">
                                  <span>Transactions:</span>
                                  <span>{tenant.totalTransactions.toLocaleString()}</span>
                                </div>
                              </div>
                            </TableCell>
                            
                            <TableCell className="py-6">
                              <p className="font-bold text-green-600">{formatZAR(tenant.monthlyRevenue)}</p>
                              <p className="text-xs text-gray-500">{tenant.totalTransactions.toLocaleString()} transactions</p>
                            </TableCell>
                            
                            <TableCell className="py-6">
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${
                                  tenant.systemHealth === 'excellent' ? 'bg-green-500' :
                                  tenant.systemHealth === 'good' ? 'bg-yellow-500' : 'bg-red-500'
                                }`}></div>
                                <span className="text-sm capitalize">{tenant.systemHealth}</span>
                              </div>
                            </TableCell>
                            
                            <TableCell className="py-6">
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="hover:bg-blue-50 dark:hover:bg-blue-900">
                                  <EyeIcon className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline" className="hover:bg-green-50 dark:hover:bg-green-900">
                                  <EditIcon className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline" className="hover:bg-red-50 dark:hover:bg-red-900">
                                  <TrashIcon className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Vendors Tab */}
            <TabsContent value="vendors" className="space-y-8 animate-slide-up">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Vendor Management</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">Monitor all vendors across all tenants</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {vendors.map((vendor, index) => (
                  <Card key={vendor.id} className="glass-card shadow-luxury border-0 hover-lift animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">{vendor.name}</CardTitle>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{vendor.category}</p>
                        </div>
                        <Badge className={`px-3 py-1 ${getStatusColor(vendor.status)}`}>
                          {vendor.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <MailIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-400">{vendor.contactEmail}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <PhoneIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-400">{vendor.contactPhone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPinIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-400">{vendor.address}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3 pt-4 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Total Orders</span>
                          <span className="font-semibold">{vendor.totalOrders.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Total Value</span>
                          <span className="font-semibold text-green-600">{formatZAR(vendor.totalValue)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Rating</span>
                          <div className="flex items-center gap-1">
                            <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="font-semibold">{vendor.rating}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Tenants Using</span>
                          <span className="font-semibold">{vendor.tenantsUsing.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Integration</span>
                          <Badge className={`px-2 py-1 text-xs ${
                            vendor.integrationStatus === 'connected' ? 'bg-green-100 text-green-800' :
                            vendor.integrationStatus === 'error' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {vendor.integrationStatus}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* System Logs Tab */}
            <TabsContent value="logs" className="space-y-8 animate-slide-up">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">System Activity Logs</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">Monitor all user activities across all tenants</p>
              </div>

              <Card className="glass-card shadow-luxury border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 gradient-primary rounded-lg">
                      <FileTextIcon className="w-6 h-6 text-white" />
                    </div>
                    Recent Activity Logs
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 dark:bg-gray-800">
                          <TableHead className="py-4 font-bold">Timestamp</TableHead>
                          <TableHead className="py-4 font-bold">Tenant</TableHead>
                          <TableHead className="py-4 font-bold">User</TableHead>
                          <TableHead className="py-4 font-bold">Action</TableHead>
                          <TableHead className="py-4 font-bold">Description</TableHead>
                          <TableHead className="py-4 font-bold">Severity</TableHead>
                          <TableHead className="py-4 font-bold">IP Address</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {systemLogs.map((log, index) => (
                          <TableRow key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                            <TableCell className="py-4">
                              <div className="text-sm font-mono">
                                {new Date(log.timestamp).toLocaleString()}
                              </div>
                            </TableCell>
                            
                            <TableCell className="py-4">
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">{log.tenantName}</p>
                                <p className="text-xs text-gray-500">{log.tenantId}</p>
                              </div>
                            </TableCell>
                            
                            <TableCell className="py-4">
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">{log.userName}</p>
                                <p className="text-xs text-gray-500 capitalize">{log.userRole.replace('_', ' ')}</p>
                              </div>
                            </TableCell>
                            
                            <TableCell className="py-4">
                              <Badge className={`px-2 py-1 text-xs ${
                                log.category === 'error' ? 'bg-red-100 text-red-800' :
                                log.category === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                log.category === 'security' ? 'bg-purple-100 text-purple-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {log.action}
                              </Badge>
                            </TableCell>
                            
                            <TableCell className="py-4 max-w-md">
                              <p className="text-sm text-gray-700 dark:text-gray-300 truncate" title={log.description}>
                                {log.description}
                              </p>
                            </TableCell>
                            
                            <TableCell className="py-4">
                              <Badge className={`px-2 py-1 text-xs ${getSeverityColor(log.severity)}`}>
                                {log.severity}
                              </Badge>
                            </TableCell>
                            
                            <TableCell className="py-4">
                              <code className="text-sm font-mono text-gray-600 dark:text-gray-400">
                                {log.ipAddress}
                              </code>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Support Tab */}
            <TabsContent value="support" className="space-y-8 animate-slide-up">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Support Management</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">Handle support requests from all tenants</p>
              </div>

              {/* Support Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="glass-card shadow-luxury border-0 hover-lift">
                  <CardContent className="p-6 text-center">
                    <HelpCircleIcon className="w-10 h-10 text-orange-600 mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-orange-600">{supportTickets.filter(t => t.status === 'open').length}</h3>
                    <p className="text-gray-600 dark:text-gray-400">Open Tickets</p>
                  </CardContent>
                </Card>

                <Card className="glass-card shadow-luxury border-0 hover-lift">
                  <CardContent className="p-6 text-center">
                    <ActivityIcon className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-blue-600">{supportTickets.filter(t => t.status === 'in_progress').length}</h3>
                    <p className="text-gray-600 dark:text-gray-400">In Progress</p>
                  </CardContent>
                </Card>

                <Card className="glass-card shadow-luxury border-0 hover-lift">
                  <CardContent className="p-6 text-center">
                    <CheckCircleIcon className="w-10 h-10 text-green-600 mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-green-600">{supportTickets.filter(t => t.status === 'resolved').length}</h3>
                    <p className="text-gray-600 dark:text-gray-400">Resolved</p>
                  </CardContent>
                </Card>

                <Card className="glass-card shadow-luxury border-0 hover-lift">
                  <CardContent className="p-6 text-center">
                    <TimerIcon className="w-10 h-10 text-purple-600 mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-purple-600">2.4h</h3>
                    <p className="text-gray-600 dark:text-gray-400">Avg Response</p>
                  </CardContent>
                </Card>
              </div>

              {/* Support Tickets */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {supportTickets.map((ticket, index) => (
                  <Card key={ticket.id} className="glass-card shadow-luxury border-0 hover-lift animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{ticket.tenantName}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={`px-2 py-1 text-xs ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                          </Badge>
                          <Badge className={`px-2 py-1 text-xs ${
                            ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {ticket.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{ticket.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <UserCheckIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {ticket.userName} • {ticket.userRole.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CalendarIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-400">
                            Created: {new Date(ticket.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {ticket.assignedTo && (
                          <div className="flex items-center gap-2 text-sm">
                            <UserCheckIcon className="w-4 h-4 text-blue-500" />
                            <span className="text-blue-600 dark:text-blue-400">
                              Assigned to: {ticket.assignedTo}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {ticket.responses.length > 0 && (
                        <div className="pt-4 border-t">
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Latest Response:
                          </p>
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {ticket.responses[ticket.responses.length - 1].message}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {ticket.responses[ticket.responses.length - 1].responderName} • 
                              {new Date(ticket.responses[ticket.responses.length - 1].timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-2 pt-4">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setSelectedSupportTicket(ticket)}
                        >
                          <MessageSquareIcon className="w-4 h-4 mr-2" />
                          Respond
                        </Button>
                        <Button size="sm" variant="outline">
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-8 animate-slide-up">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Enterprise Analytics</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">Comprehensive insights across all tenants</p>
              </div>

              {/* Analytics Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="glass-card shadow-luxury border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <TrendingUpIcon className="w-6 h-6 text-blue-600" />
                      Tenant Growth & Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={tenantGrowthData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="tenants" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                        <Area type="monotone" dataKey="revenue" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="glass-card shadow-luxury border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <PieChart className="w-6 h-6 text-purple-600" />
                      Plan Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={planDistributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {planDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="glass-card shadow-luxury border-0 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <MonitorIcon className="w-6 h-6 text-green-600" />
                      System Performance Over Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={systemMetricsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={3} name="CPU %" />
                        <Line type="monotone" dataKey="memory" stroke="#10b981" strokeWidth={3} name="Memory %" />
                        <Line type="monotone" dataKey="network" stroke="#f59e0b" strokeWidth={3} name="Network %" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Add Tenant Dialog */}
        <Dialog open={showAddTenantDialog} onOpenChange={setShowAddTenantDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 gradient-primary rounded-lg">
                  <BuildingIcon className="w-6 h-6 text-white" />
                </div>
                Add New Tenant
              </DialogTitle>
              <DialogDescription>
                Create a new tenant account in the system
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="tenant-name" className="text-base font-semibold">Tenant Name *</Label>
                  <Input
                    id="tenant-name"
                    placeholder="Urban Fresh Market"
                    value={newTenant.name}
                    onChange={(e) => setNewTenant(prev => ({ ...prev, name: e.target.value }))}
                    className="h-12 text-lg"
                  />
                </div>
                
                <div>
                  <Label htmlFor="business-name" className="text-base font-semibold">Business Name *</Label>
                  <Input
                    id="business-name"
                    placeholder="Urban Fresh Market (Pty) Ltd"
                    value={newTenant.businessName}
                    onChange={(e) => setNewTenant(prev => ({ ...prev, businessName: e.target.value }))}
                    className="h-12 text-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="tenant-email" className="text-base font-semibold">Email Address *</Label>
                  <Input
                    id="tenant-email"
                    type="email"
                    placeholder="admin@example.co.za"
                    value={newTenant.email}
                    onChange={(e) => setNewTenant(prev => ({ ...prev, email: e.target.value }))}
                    className="h-12 text-lg"
                  />
                </div>
                
                <div>
                  <Label htmlFor="tenant-phone" className="text-base font-semibold">Phone Number</Label>
                  <Input
                    id="tenant-phone"
                    placeholder="+27 11 123 4567"
                    value={newTenant.phone}
                    onChange={(e) => setNewTenant(prev => ({ ...prev, phone: e.target.value }))}
                    className="h-12 text-lg"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tenant-address" className="text-base font-semibold">Address</Label>
                <Input
                  id="tenant-address"
                  placeholder="123 Main Street"
                  value={newTenant.address}
                  onChange={(e) => setNewTenant(prev => ({ ...prev, address: e.target.value }))}
                  className="h-12 text-lg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="tenant-city" className="text-base font-semibold">City</Label>
                  <Input
                    id="tenant-city"
                    placeholder="Johannesburg"
                    value={newTenant.city}
                    onChange={(e) => setNewTenant(prev => ({ ...prev, city: e.target.value }))}
                    className="h-12 text-lg"
                  />
                </div>
                
                <div>
                  <Label htmlFor="tenant-province" className="text-base font-semibold">Province</Label>
                  <Input
                    id="tenant-province"
                    placeholder="Gauteng"
                    value={newTenant.province}
                    onChange={(e) => setNewTenant(prev => ({ ...prev, province: e.target.value }))}
                    className="h-12 text-lg"
                  />
                </div>
                
                <div>
                  <Label htmlFor="tenant-plan" className="text-base font-semibold">Plan</Label>
                  <Select
                    value={newTenant.plan}
                    onValueChange={(value: 'basic' | 'standard' | 'premium' | 'enterprise') => 
                      setNewTenant(prev => ({ ...prev, plan: value }))
                    }
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic - R299/month</SelectItem>
                      <SelectItem value="standard">Standard - R599/month</SelectItem>
                      <SelectItem value="premium">Premium - R999/month</SelectItem>
                      <SelectItem value="enterprise">Enterprise - R1999/month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t">
              <Button
                onClick={() => setShowAddTenantDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddTenant}
                disabled={!newTenant.name || !newTenant.email}
                className="flex-1 gradient-primary text-white"
              >
                <BuildingIcon className="w-5 h-5 mr-2" />
                Add Tenant
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}