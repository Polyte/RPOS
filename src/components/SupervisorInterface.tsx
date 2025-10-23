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
  UsersIcon,
  PackageIcon,
  ClipboardCheckIcon,
  TrendingUpIcon,
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
  AlertCircleIcon
} from "lucide-react";

interface SupervisorInterfaceProps {
  onLogout: () => void;
  showHeader?: boolean;
}

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'stock_controller' | 'stock_assistant' | 'inventory_clerk' | 'quality_checker';
  department: string;
  shift: 'morning' | 'afternoon' | 'evening' | 'night';
  status: 'active' | 'on_break' | 'offline' | 'busy';
  currentTask?: string;
  performance: {
    tasksCompleted: number;
    accuracy: number;
    productivity: number;
  };
  lastActivity: string;
  location: string;
  permissions: string[];
  phone: string;
  startDate: string;
}

interface StockItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  location: string;
  lastUpdate: string;
  assignedTo?: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstocked' | 'pending_recount';
  lastAudit: string;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  movementToday: number;
  value: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  dueDate: string;
  createdAt: string;
  estimatedTime: number;
  actualTime?: number;
  category: 'stock_count' | 'quality_check' | 'restocking' | 'audit' | 'maintenance' | 'training';
  location: string;
  items?: string[];
}

export function SupervisorInterface({ onLogout, showHeader = true }: SupervisorInterfaceProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedStaffMember, setSelectedStaffMember] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddStaffDialog, setShowAddStaffDialog] = useState(false);
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [showStockAuditDialog, setShowStockAuditDialog] = useState(false);

  const [newStaffMember, setNewStaffMember] = useState({
    name: '',
    email: '',
    role: 'stock_assistant' as const,
    department: '',
    shift: 'morning' as const,
    phone: '',
    permissions: [] as string[]
  });

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium' as const,
    dueDate: '',
    estimatedTime: 60,
    category: 'stock_count' as const,
    location: '',
    items: [] as string[]
  });

  const { addNotification } = useNotifications();

  // Create app state for header
  const appState: AppState = {
    currentRole: 'supervisor',
    isLoading: false,
    user: {
      id: 'supervisor-1',
      name: localStorage.getItem('roxton-pos-user') ? JSON.parse(localStorage.getItem('roxton-pos-user')!).name || 'Supervisor' : 'Supervisor',
      role: 'supervisor',
      email: 'supervisor@roxtonpos.co.za',
      permissions: ['staff_management', 'stock_oversight', 'task_assignment', 'quality_control', 'performance_monitoring'],
      isActive: true
    }
  };

  const systemStatus: SystemStatus = {
    isOnline: true,
    serverHealth: 'excellent',
    systemLoad: Math.floor(Math.random() * 25) + 15,
    lastSync: new Date(),
    activeSessions: 8,
    pendingTasks: 12
  };

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Load demo data
  useEffect(() => {
    loadDemoData();
  }, []);

  const loadDemoData = () => {
    // Demo staff members
    setStaffMembers([
      {
        id: 'staff_1',
        name: 'Alice Johnson',
        email: 'alice@roxtonpos.co.za',
        role: 'stock_controller',
        department: 'Warehouse A',
        shift: 'morning',
        status: 'active',
        currentTask: 'Stock count - Electronics',
        performance: {
          tasksCompleted: 23,
          accuracy: 98,
          productivity: 87
        },
        lastActivity: '5 minutes ago',
        location: 'Aisle 5-7',
        permissions: ['stock_management', 'quality_control', 'reporting'],
        phone: '+27 82 123 4567',
        startDate: '2024-01-15'
      },
      {
        id: 'staff_2',
        name: 'Bob Smith',
        email: 'bob@roxtonpos.co.za',
        role: 'stock_assistant',
        department: 'Warehouse B',
        shift: 'afternoon',
        status: 'on_break',
        performance: {
          tasksCompleted: 18,
          accuracy: 95,
          productivity: 82
        },
        lastActivity: '12 minutes ago',
        location: 'Break Room',
        permissions: ['stock_basic', 'scanning'],
        phone: '+27 83 234 5678',
        startDate: '2024-03-01'
      },
      {
        id: 'staff_3',
        name: 'Carol Davis',
        email: 'carol@roxtonpos.co.za',
        role: 'quality_checker',
        department: 'Quality Control',
        shift: 'morning',
        status: 'busy',
        currentTask: 'Quality audit - Food section',
        performance: {
          tasksCompleted: 31,
          accuracy: 99,
          productivity: 93
        },
        lastActivity: '2 minutes ago',
        location: 'QC Lab',
        permissions: ['quality_control', 'audit', 'reporting'],
        phone: '+27 84 345 6789',
        startDate: '2023-11-10'
      },
      {
        id: 'staff_4',
        name: 'David Wilson',
        email: 'david@roxtonpos.co.za',
        role: 'inventory_clerk',
        department: 'Receiving',
        shift: 'evening',
        status: 'offline',
        performance: {
          tasksCompleted: 15,
          accuracy: 91,
          productivity: 78
        },
        lastActivity: '45 minutes ago',
        location: 'Loading Dock',
        permissions: ['receiving', 'documentation'],
        phone: '+27 85 456 7890',
        startDate: '2024-02-20'
      }
    ]);

    // Demo stock items
    setStockItems([
      {
        id: 'stock_1',
        name: 'Premium Coffee Beans',
        category: 'Beverages',
        currentStock: 45,
        minStock: 20,
        maxStock: 100,
        location: 'A1-05',
        lastUpdate: '2 hours ago',
        assignedTo: 'staff_1',
        status: 'in_stock',
        lastAudit: '2024-08-10',
        quality: 'excellent',
        movementToday: -8,
        value: 2250.00
      },
      {
        id: 'stock_2',
        name: 'Organic Pasta',
        category: 'Food',
        currentStock: 12,
        minStock: 15,
        maxStock: 80,
        location: 'B2-12',
        lastUpdate: '1 hour ago',
        assignedTo: 'staff_2',
        status: 'low_stock',
        lastAudit: '2024-08-09',
        quality: 'good',
        movementToday: -5,
        value: 480.00
      },
      {
        id: 'stock_3',
        name: 'Cleaning Supplies',
        category: 'Household',
        currentStock: 0,
        minStock: 10,
        maxStock: 50,
        location: 'C3-08',
        lastUpdate: '30 minutes ago',
        status: 'out_of_stock',
        lastAudit: '2024-08-11',
        quality: 'good',
        movementToday: -10,
        value: 0.00
      },
      {
        id: 'stock_4',
        name: 'Electronics Accessories',
        category: 'Electronics',
        currentStock: 125,
        minStock: 30,
        maxStock: 100,
        location: 'D1-15',
        lastUpdate: '15 minutes ago',
        assignedTo: 'staff_3',
        status: 'overstocked',
        lastAudit: '2024-08-11',
        quality: 'excellent',
        movementToday: +15,
        value: 6250.00
      }
    ]);

    // Demo tasks
    setTasks([
      {
        id: 'task_1',
        title: 'Weekly Stock Count - Electronics',
        description: 'Complete full inventory count for electronics section',
        assignedTo: 'staff_1',
        assignedBy: 'supervisor-1',
        priority: 'high',
        status: 'in_progress',
        dueDate: '2024-08-11 17:00',
        createdAt: '2024-08-11 08:00',
        estimatedTime: 240,
        actualTime: 180,
        category: 'stock_count',
        location: 'Electronics Section',
        items: ['Electronics Accessories', 'Mobile Chargers', 'Headphones']
      },
      {
        id: 'task_2',
        title: 'Quality Check - Food Items',
        description: 'Inspect and verify quality of incoming food deliveries',
        assignedTo: 'staff_3',
        assignedBy: 'supervisor-1',
        priority: 'urgent',
        status: 'completed',
        dueDate: '2024-08-11 12:00',
        createdAt: '2024-08-11 09:00',
        estimatedTime: 120,
        actualTime: 95,
        category: 'quality_check',
        location: 'Receiving Area',
        items: ['Organic Pasta', 'Fresh Vegetables', 'Dairy Products']
      },
      {
        id: 'task_3',
        title: 'Restock Low Inventory Items',
        description: 'Replenish items that have fallen below minimum stock levels',
        assignedTo: 'staff_2',
        assignedBy: 'supervisor-1',
        priority: 'medium',
        status: 'pending',
        dueDate: '2024-08-11 16:00',
        createdAt: '2024-08-11 10:30',
        estimatedTime: 180,
        category: 'restocking',
        location: 'Various',
        items: ['Organic Pasta', 'Cleaning Supplies']
      },
      {
        id: 'task_4',
        title: 'Monthly Audit - Warehouse A',
        description: 'Comprehensive audit of entire Warehouse A section',
        assignedTo: 'staff_1',
        assignedBy: 'supervisor-1',
        priority: 'low',
        status: 'overdue',
        dueDate: '2024-08-10 18:00',
        createdAt: '2024-08-08 14:00',
        estimatedTime: 480,
        category: 'audit',
        location: 'Warehouse A',
        items: []
      }
    ]);
  };

  const filteredStaffMembers = staffMembers.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || staff.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'on_break':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'busy':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'offline':
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

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'overstocked':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'pending_recount':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const handleAddStaffMember = () => {
    if (!newStaffMember.name || !newStaffMember.email) {
      addNotification({
        type: 'error',
        title: 'Invalid Data',
        message: 'Please fill in all required fields',
        duration: 4000
      });
      return;
    }

    const staffMember: StaffMember = {
      id: `staff_${Date.now()}`,
      ...newStaffMember,
      status: 'offline',
      performance: {
        tasksCompleted: 0,
        accuracy: 100,
        productivity: 0
      },
      lastActivity: 'Never',
      location: 'Not assigned',
      startDate: new Date().toISOString().split('T')[0]
    };

    setStaffMembers(prev => [...prev, staffMember]);
    setShowAddStaffDialog(false);
    setNewStaffMember({
      name: '',
      email: '',
      role: 'stock_assistant',
      department: '',
      shift: 'morning',
      phone: '',
      permissions: []
    });

    addNotification({
      type: 'success',
      title: 'Staff Member Added',
      message: `${staffMember.name} has been added to the team`,
      duration: 4000
    });
  };

  const handleAddTask = () => {
    if (!newTask.title || !newTask.assignedTo) {
      addNotification({
        type: 'error',
        title: 'Invalid Task Data',
        message: 'Please fill in all required fields',
        duration: 4000
      });
      return;
    }

    const task: Task = {
      id: `task_${Date.now()}`,
      ...newTask,
      assignedBy: 'supervisor-1',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setTasks(prev => [...prev, task]);
    setShowAddTaskDialog(false);
    setNewTask({
      title: '',
      description: '',
      assignedTo: '',
      priority: 'medium',
      dueDate: '',
      estimatedTime: 60,
      category: 'stock_count',
      location: '',
      items: []
    });

    addNotification({
      type: 'success',
      title: 'Task Assigned',
      message: `Task "${task.title}" has been assigned successfully`,
      duration: 4000
    });
  };

  const formatZAR = (amount: number) => `R${amount.toFixed(2)}`;

  // Performance data for charts
  const performanceData = [
    { name: 'Mon', productivity: 85, accuracy: 92, tasks: 24 },
    { name: 'Tue', productivity: 88, accuracy: 95, tasks: 28 },
    { name: 'Wed', productivity: 82, accuracy: 89, tasks: 22 },
    { name: 'Thu', productivity: 90, accuracy: 97, tasks: 31 },
    { name: 'Fri', productivity: 87, accuracy: 94, tasks: 26 },
    { name: 'Sat', productivity: 83, accuracy: 91, tasks: 20 },
    { name: 'Sun', productivity: 78, accuracy: 88, tasks: 18 }
  ];

  const stockData = [
    { name: 'In Stock', value: 45, color: '#22c55e' },
    { name: 'Low Stock', value: 12, color: '#f59e0b' },
    { name: 'Out of Stock', value: 8, color: '#ef4444' },
    { name: 'Overstocked', value: 5, color: '#3b82f6' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-indigo-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
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
              <TabsTrigger value="overview" className="flex items-center gap-3 text-base py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white">
                <EyeIcon className="w-5 h-5" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="staff" className="flex items-center gap-3 text-base py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white">
                <UsersIcon className="w-5 h-5" />
                Staff
              </TabsTrigger>
              <TabsTrigger value="stock" className="flex items-center gap-3 text-base py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white">
                <PackageIcon className="w-5 h-5" />
                Stock
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center gap-3 text-base py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-500 data-[state=active]:text-white">
                <ClipboardCheckIcon className="w-5 h-5" />
                Tasks
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-3 text-base py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white">
                <TrendingUpIcon className="w-5 h-5" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="quality" className="flex items-center gap-3 text-base py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                <ShieldCheckIcon className="w-5 h-5" />
                Quality
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8 animate-slide-up">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Supervisor Dashboard</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">Comprehensive oversight of staff and stock operations</p>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="glass-card shadow-luxury border-0 hover-lift animate-scale-in">
                  <CardContent className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Active Staff</p>
                        <p className="text-4xl font-bold text-green-600">{staffMembers.filter(s => s.status === 'active').length}</p>
                        <p className="text-sm text-green-500 mt-1">On duty now</p>
                      </div>
                      <div className="p-4 bg-green-100 dark:bg-green-900/50 rounded-2xl">
                        <UsersIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card shadow-luxury border-0 hover-lift animate-scale-in" style={{ animationDelay: '100ms' }}>
                  <CardContent className="p-8 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Stock Alerts</p>
                        <p className="text-4xl font-bold text-orange-600">{stockItems.filter(s => s.status === 'low_stock' || s.status === 'out_of_stock').length}</p>
                        <p className="text-sm text-orange-500 mt-1">Need attention</p>
                      </div>
                      <div className="p-4 bg-orange-100 dark:bg-orange-900/50 rounded-2xl">
                        <AlertTriangleIcon className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card shadow-luxury border-0 hover-lift animate-scale-in" style={{ animationDelay: '200ms' }}>
                  <CardContent className="p-8 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Pending Tasks</p>
                        <p className="text-4xl font-bold text-purple-600">{tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length}</p>
                        <p className="text-sm text-purple-500 mt-1">In progress</p>
                      </div>
                      <div className="p-4 bg-purple-100 dark:bg-purple-900/50 rounded-2xl">
                        <ClipboardCheckIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card shadow-luxury border-0 hover-lift animate-scale-in" style={{ animationDelay: '300ms' }}>
                  <CardContent className="p-8 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Avg Performance</p>
                        <p className="text-4xl font-bold text-blue-600">87%</p>
                        <p className="text-sm text-blue-500 mt-1">Team average</p>
                      </div>
                      <div className="p-4 bg-blue-100 dark:bg-blue-900/50 rounded-2xl">
                        <TrendingUpIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
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
                      <ActivityIcon className="w-6 h-6 text-white" />
                    </div>
                    Quick Supervisor Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Button 
                      onClick={() => setShowAddStaffDialog(true)}
                      className="h-20 gradient-primary text-white shadow-luxury hover-lift flex flex-col gap-2"
                    >
                      <UserPlusIcon className="w-6 h-6" />
                      <span>Add Staff Member</span>
                    </Button>
                    
                    <Button 
                      onClick={() => setShowAddTaskDialog(true)}
                      className="h-20 gradient-secondary text-white shadow-luxury hover-lift flex flex-col gap-2"
                    >
                      <PlusIcon className="w-6 h-6" />
                      <span>Create Task</span>
                    </Button>
                    
                    <Button 
                      onClick={() => setShowStockAuditDialog(true)}
                      className="h-20 gradient-accent text-white shadow-luxury hover-lift flex flex-col gap-2"
                    >
                      <PackageSearchIcon className="w-6 h-6" />
                      <span>Stock Audit</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Live Activity Feed */}
              <Card className="glass-card shadow-luxury border-0 animate-slide-up" style={{ animationDelay: '500ms' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 gradient-secondary rounded-lg">
                      <ActivityIcon className="w-6 h-6 text-white" />
                    </div>
                    Live Activity Feed
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-4">
                    {[
                      { time: '2 min ago', user: 'Alice Johnson', action: 'Completed stock count for Electronics section', type: 'success' },
                      { time: '5 min ago', user: 'Bob Smith', action: 'Started break (15 min)', type: 'info' },
                      { time: '8 min ago', user: 'Carol Davis', action: 'Quality check failed for batch #QC-2024-0811', type: 'error' },
                      { time: '12 min ago', user: 'System', action: 'Low stock alert: Organic Pasta (12 units)', type: 'warning' },
                      { time: '15 min ago', user: 'Alice Johnson', action: 'Updated location to Aisle 5-7', type: 'info' }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                        <div className={`w-3 h-3 rounded-full mt-2 ${
                          activity.type === 'success' ? 'bg-green-500' :
                          activity.type === 'error' ? 'bg-red-500' :
                          activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-gray-900 dark:text-white">{activity.user}</p>
                            <p className="text-sm text-gray-500">{activity.time}</p>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400">{activity.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Staff Tab */}
            <TabsContent value="staff" className="space-y-8 animate-slide-up">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Staff Management</h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">Monitor and manage your team members</p>
                </div>
                <Button 
                  onClick={() => setShowAddStaffDialog(true)}
                  className="gradient-primary text-white shadow-luxury hover-lift px-6 py-3"
                >
                  <UserPlusIcon className="w-5 h-5 mr-2" />
                  Add Staff Member
                </Button>
              </div>

              {/* Staff Filters */}
              <Card className="glass-card shadow-elegant border-0">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <SearchIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search staff members..."
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
                        <SelectItem value="on_break">On Break</SelectItem>
                        <SelectItem value="busy">Busy</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Staff Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredStaffMembers.map((staff, index) => (
                  <Card key={staff.id} className="glass-card shadow-luxury border-0 hover-lift animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-elegant">
                            {staff.name.charAt(0)}
                          </div>
                          <div>
                            <CardTitle className="text-xl">{staff.name}</CardTitle>
                            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{staff.role.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <Badge className={`px-3 py-1 ${getStatusColor(staff.status)}`}>
                          {staff.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <MapPinIcon className="w-4 h-4" />
                          <span>{staff.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <ClockIcon className="w-4 h-4" />
                          <span>Last active: {staff.lastActivity}</span>
                        </div>
                        {staff.currentTask && (
                          <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                            <ListChecksIcon className="w-4 h-4" />
                            <span className="truncate">{staff.currentTask}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-3 pt-4 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Tasks Completed</span>
                          <span className="font-semibold">{staff.performance.tasksCompleted}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Accuracy</span>
                            <span className="font-semibold">{staff.performance.accuracy}%</span>
                          </div>
                          <Progress value={staff.performance.accuracy} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Productivity</span>
                            <span className="font-semibold">{staff.performance.productivity}%</span>
                          </div>
                          <Progress value={staff.performance.productivity} className="h-2" />
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-4">
                        <Button variant="outline" size="sm" className="flex-1">
                          <EditIcon className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Stock Tab */}
            <TabsContent value="stock" className="space-y-8 animate-slide-up">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Stock Overview</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">Monitor inventory levels and stock movements</p>
              </div>

              {/* Stock Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="glass-card shadow-luxury border-0 hover-lift">
                  <CardContent className="p-6 text-center">
                    <CheckCircleIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-green-600">{stockItems.filter(s => s.status === 'in_stock').length}</h3>
                    <p className="text-gray-600 dark:text-gray-400">In Stock</p>
                  </CardContent>
                </Card>

                <Card className="glass-card shadow-luxury border-0 hover-lift">
                  <CardContent className="p-6 text-center">
                    <AlertTriangleIcon className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-yellow-600">{stockItems.filter(s => s.status === 'low_stock').length}</h3>
                    <p className="text-gray-600 dark:text-gray-400">Low Stock</p>
                  </CardContent>
                </Card>

                <Card className="glass-card shadow-luxury border-0 hover-lift">
                  <CardContent className="p-6 text-center">
                    <XCircleIcon className="w-12 h-12 text-red-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-red-600">{stockItems.filter(s => s.status === 'out_of_stock').length}</h3>
                    <p className="text-gray-600 dark:text-gray-400">Out of Stock</p>
                  </CardContent>
                </Card>

                <Card className="glass-card shadow-luxury border-0 hover-lift">
                  <CardContent className="p-6 text-center">
                    <TrendingUpIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-blue-600">{stockItems.filter(s => s.status === 'overstocked').length}</h3>
                    <p className="text-gray-600 dark:text-gray-400">Overstocked</p>
                  </CardContent>
                </Card>
              </div>

              {/* Stock Items Table */}
              <Card className="glass-card shadow-luxury border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 gradient-primary rounded-lg">
                      <PackageIcon className="w-6 h-6 text-white" />
                    </div>
                    Stock Items ({stockItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 dark:bg-gray-800">
                          <TableHead className="py-4 font-bold">Item Details</TableHead>
                          <TableHead className="py-4 font-bold">Stock Level</TableHead>
                          <TableHead className="py-4 font-bold">Status</TableHead>
                          <TableHead className="py-4 font-bold">Location</TableHead>
                          <TableHead className="py-4 font-bold">Assigned To</TableHead>
                          <TableHead className="py-4 font-bold">Value</TableHead>
                          <TableHead className="py-4 font-bold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stockItems.map((item, index) => (
                          <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                            <TableCell className="py-6">
                              <div>
                                <p className="font-bold text-lg text-gray-900 dark:text-white">{item.name}</p>
                                <p className="text-gray-600 dark:text-gray-400">{item.category}</p>
                                <p className="text-xs text-gray-500">Last update: {item.lastUpdate}</p>
                              </div>
                            </TableCell>
                            
                            <TableCell className="py-6">
                              <div className="space-y-1">
                                <p className="font-bold text-lg">{item.currentStock}</p>
                                <p className="text-xs text-gray-500">Min: {item.minStock} | Max: {item.maxStock}</p>
                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      item.currentStock <= item.minStock ? 'bg-red-500' :
                                      item.currentStock >= item.maxStock ? 'bg-blue-500' : 'bg-green-500'
                                    }`}
                                    style={{ width: `${Math.min((item.currentStock / item.maxStock) * 100, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </TableCell>
                            
                            <TableCell className="py-6">
                              <Badge className={`px-3 py-1 ${getStockStatusColor(item.status)}`}>
                                {item.status.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            
                            <TableCell className="py-6 text-gray-600 dark:text-gray-400">
                              {item.location}
                            </TableCell>
                            
                            <TableCell className="py-6">
                              {item.assignedTo ? (
                                <span className="text-blue-600 dark:text-blue-400">
                                  {staffMembers.find(s => s.id === item.assignedTo)?.name || 'Unknown'}
                                </span>
                              ) : (
                                <span className="text-gray-400">Unassigned</span>
                              )}
                            </TableCell>
                            
                            <TableCell className="py-6">
                              <p className="font-bold text-green-600">{formatZAR(item.value)}</p>
                            </TableCell>
                            
                            <TableCell className="py-6">
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="hover:bg-blue-50 dark:hover:bg-blue-900">
                                  <EditIcon className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline" className="hover:bg-green-50 dark:hover:bg-green-900">
                                  <QrCodeIcon className="w-4 h-4" />
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

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="space-y-8 animate-slide-up">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Task Management</h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">Assign and monitor staff tasks</p>
                </div>
                <Button 
                  onClick={() => setShowAddTaskDialog(true)}
                  className="gradient-primary text-white shadow-luxury hover-lift px-6 py-3"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Create Task
                </Button>
              </div>

              {/* Task Status Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="glass-card shadow-luxury border-0 hover-lift">
                  <CardContent className="p-6 text-center">
                    <ClockIcon className="w-10 h-10 text-yellow-600 mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-yellow-600">{tasks.filter(t => t.status === 'pending').length}</h3>
                    <p className="text-gray-600 dark:text-gray-400">Pending</p>
                  </CardContent>
                </Card>

                <Card className="glass-card shadow-luxury border-0 hover-lift">
                  <CardContent className="p-6 text-center">
                    <ActivityIcon className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-blue-600">{tasks.filter(t => t.status === 'in_progress').length}</h3>
                    <p className="text-gray-600 dark:text-gray-400">In Progress</p>
                  </CardContent>
                </Card>

                <Card className="glass-card shadow-luxury border-0 hover-lift">
                  <CardContent className="p-6 text-center">
                    <CheckCircleIcon className="w-10 h-10 text-green-600 mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-green-600">{tasks.filter(t => t.status === 'completed').length}</h3>
                    <p className="text-gray-600 dark:text-gray-400">Completed</p>
                  </CardContent>
                </Card>

                <Card className="glass-card shadow-luxury border-0 hover-lift">
                  <CardContent className="p-6 text-center">
                    <AlertCircleIcon className="w-10 h-10 text-red-600 mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-red-600">{tasks.filter(t => t.status === 'overdue').length}</h3>
                    <p className="text-gray-600 dark:text-gray-400">Overdue</p>
                  </CardContent>
                </Card>
              </div>

              {/* Tasks List */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {tasks.map((task, index) => (
                  <Card key={task.id} className="glass-card shadow-luxury border-0 hover-lift animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{task.title}</CardTitle>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{task.description}</p>
                        </div>
                        <Badge className={`px-3 py-1 ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <UserCheckIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-400">
                            Assigned to: {staffMembers.find(s => s.id === task.assignedTo)?.name || 'Unknown'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPinIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-400">{task.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CalendarIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-400">Due: {new Date(task.dueDate).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <TimerIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-400">
                            Est. {task.estimatedTime} min
                            {task.actualTime && ` | Actual: ${task.actualTime} min`}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t">
                        <Badge className={`px-3 py-1 ${
                          task.status === 'completed' ? 'bg-green-100 text-green-800' :
                          task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          task.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <EditIcon className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <EyeIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-8 animate-slide-up">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Performance Analytics</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">Track team productivity and efficiency metrics</p>
              </div>

              {/* Performance Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="glass-card shadow-luxury border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <BarChart3Icon className="w-6 h-6 text-blue-600" />
                      Weekly Performance Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="productivity" stroke="#3b82f6" strokeWidth={3} />
                        <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="glass-card shadow-luxury border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <PieChart className="w-6 h-6 text-purple-600" />
                      Stock Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={stockData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {stockData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Individual Performance */}
              <Card className="glass-card shadow-luxury border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <StarIcon className="w-6 h-6 text-yellow-600" />
                    Individual Performance Ratings
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {staffMembers.map((staff, index) => (
                      <div key={staff.id} className="space-y-4 p-6 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                            {staff.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{staff.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{staff.role.replace('_', ' ')}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Accuracy</span>
                              <span>{staff.performance.accuracy}%</span>
                            </div>
                            <Progress value={staff.performance.accuracy} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Productivity</span>
                              <span>{staff.performance.productivity}%</span>
                            </div>
                            <Progress value={staff.performance.productivity} className="h-2" />
                          </div>
                          <div className="pt-2 border-t">
                            <p className="text-center text-lg font-bold text-blue-600">{staff.performance.tasksCompleted}</p>
                            <p className="text-center text-xs text-gray-500">Tasks Completed</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Quality Tab */}
            <TabsContent value="quality" className="space-y-8 animate-slide-up">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Quality Control</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">Monitor quality standards and audit results</p>
              </div>

              {/* Quality Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="glass-card shadow-luxury border-0 hover-lift">
                  <CardContent className="p-6 text-center">
                    <ShieldCheckIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-green-600">98.5%</h3>
                    <p className="text-gray-600 dark:text-gray-400">Quality Score</p>
                  </CardContent>
                </Card>

                <Card className="glass-card shadow-luxury border-0 hover-lift">
                  <CardContent className="p-6 text-center">
                    <CheckCircleIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-blue-600">23</h3>
                    <p className="text-gray-600 dark:text-gray-400">Audits Completed</p>
                  </CardContent>
                </Card>

                <Card className="glass-card shadow-luxury border-0 hover-lift">
                  <CardContent className="p-6 text-center">
                    <AlertTriangleIcon className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-yellow-600">2</h3>
                    <p className="text-gray-600 dark:text-gray-400">Issues Found</p>
                  </CardContent>
                </Card>

                <Card className="glass-card shadow-luxury border-0 hover-lift">
                  <CardContent className="p-6 text-center">
                    <TrendingUpIcon className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-purple-600">+5.2%</h3>
                    <p className="text-gray-600 dark:text-gray-400">Improvement</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Quality Checks */}
              <Card className="glass-card shadow-luxury border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <ShieldCheckIcon className="w-6 h-6 text-green-600" />
                    Recent Quality Checks
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-4">
                    {[
                      { item: 'Premium Coffee Beans', checker: 'Carol Davis', result: 'Excellent', score: 98, date: '2024-08-11 14:30' },
                      { item: 'Organic Pasta', checker: 'Carol Davis', result: 'Good', score: 95, date: '2024-08-11 13:15' },
                      { item: 'Electronics Accessories', checker: 'Alice Johnson', result: 'Excellent', score: 99, date: '2024-08-11 11:45' },
                      { item: 'Cleaning Supplies', checker: 'Carol Davis', result: 'Fair', score: 78, date: '2024-08-11 10:20' }
                    ].map((check, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                        <div className="flex items-center gap-4">
                          <div className={`w-4 h-4 rounded-full ${
                            check.score >= 95 ? 'bg-green-500' :
                            check.score >= 85 ? 'bg-blue-500' :
                            check.score >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{check.item}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Checked by {check.checker}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <Badge className={`px-3 py-1 ${
                              check.result === 'Excellent' ? 'bg-green-100 text-green-800' :
                              check.result === 'Good' ? 'bg-blue-100 text-blue-800' :
                              check.result === 'Fair' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {check.result}
                            </Badge>
                            <span className="font-bold text-lg">{check.score}%</span>
                          </div>
                          <p className="text-sm text-gray-500">{new Date(check.date).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Add Staff Dialog */}
        <Dialog open={showAddStaffDialog} onOpenChange={setShowAddStaffDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 gradient-primary rounded-lg">
                  <UserPlusIcon className="w-6 h-6 text-white" />
                </div>
                Add New Staff Member
              </DialogTitle>
              <DialogDescription>
                Add a new team member to your stock management team
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="staff-name" className="text-base font-semibold">Full Name *</Label>
                  <Input
                    id="staff-name"
                    placeholder="John Doe"
                    value={newStaffMember.name}
                    onChange={(e) => setNewStaffMember(prev => ({ ...prev, name: e.target.value }))}
                    className="h-12 text-lg"
                  />
                </div>
                
                <div>
                  <Label htmlFor="staff-email" className="text-base font-semibold">Email Address *</Label>
                  <Input
                    id="staff-email"
                    type="email"
                    placeholder="john@roxtonpos.co.za"
                    value={newStaffMember.email}
                    onChange={(e) => setNewStaffMember(prev => ({ ...prev, email: e.target.value }))}
                    className="h-12 text-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="staff-role" className="text-base font-semibold">Role</Label>
                  <Select
                    value={newStaffMember.role}
                    onValueChange={(value: 'stock_controller' | 'stock_assistant' | 'inventory_clerk' | 'quality_checker') => 
                      setNewStaffMember(prev => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stock_assistant">Stock Assistant</SelectItem>
                      <SelectItem value="stock_controller">Stock Controller</SelectItem>
                      <SelectItem value="inventory_clerk">Inventory Clerk</SelectItem>
                      <SelectItem value="quality_checker">Quality Checker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="staff-department" className="text-base font-semibold">Department</Label>
                  <Input
                    id="staff-department"
                    placeholder="Warehouse A"
                    value={newStaffMember.department}
                    onChange={(e) => setNewStaffMember(prev => ({ ...prev, department: e.target.value }))}
                    className="h-12 text-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="staff-shift" className="text-base font-semibold">Shift</Label>
                  <Select
                    value={newStaffMember.shift}
                    onValueChange={(value: 'morning' | 'afternoon' | 'evening' | 'night') => 
                      setNewStaffMember(prev => ({ ...prev, shift: value }))
                    }
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (06:00 - 14:00)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (14:00 - 22:00)</SelectItem>
                      <SelectItem value="evening">Evening (22:00 - 06:00)</SelectItem>
                      <SelectItem value="night">Night (00:00 - 08:00)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="staff-phone" className="text-base font-semibold">Phone Number</Label>
                  <Input
                    id="staff-phone"
                    placeholder="+27 82 123 4567"
                    value={newStaffMember.phone}
                    onChange={(e) => setNewStaffMember(prev => ({ ...prev, phone: e.target.value }))}
                    className="h-12 text-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t">
              <Button
                onClick={() => setShowAddStaffDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddStaffMember}
                disabled={!newStaffMember.name || !newStaffMember.email}
                className="flex-1 gradient-primary text-white"
              >
                <UserPlusIcon className="w-5 h-5 mr-2" />
                Add Staff Member
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Task Dialog */}
        <Dialog open={showAddTaskDialog} onOpenChange={setShowAddTaskDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 gradient-secondary rounded-lg">
                  <ClipboardCheckIcon className="w-6 h-6 text-white" />
                </div>
                Create New Task
              </DialogTitle>
              <DialogDescription>
                Assign a new task to a team member
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-6">
              <div>
                <Label htmlFor="task-title" className="text-base font-semibold">Task Title *</Label>
                <Input
                  id="task-title"
                  placeholder="Complete stock count for electronics"
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  className="h-12 text-lg"
                />
              </div>

              <div>
                <Label htmlFor="task-description" className="text-base font-semibold">Description</Label>
                <Textarea
                  id="task-description"
                  placeholder="Detailed description of the task..."
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="task-assigned-to" className="text-base font-semibold">Assign To *</Label>
                  <Select
                    value={newTask.assignedTo}
                    onValueChange={(value) => setNewTask(prev => ({ ...prev, assignedTo: value }))}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      {staffMembers.map(staff => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.name} - {staff.role.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="task-priority" className="text-base font-semibold">Priority</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => 
                      setNewTask(prev => ({ ...prev, priority: value }))
                    }
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="task-due-date" className="text-base font-semibold">Due Date</Label>
                  <Input
                    id="task-due-date"
                    type="datetime-local"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="h-12"
                  />
                </div>
                
                <div>
                  <Label htmlFor="task-estimated-time" className="text-base font-semibold">Estimated Time (minutes)</Label>
                  <Input
                    id="task-estimated-time"
                    type="number"
                    min="1"
                    value={newTask.estimatedTime}
                    onChange={(e) => setNewTask(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) || 60 }))}
                    className="h-12"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="task-category" className="text-base font-semibold">Category</Label>
                  <Select
                    value={newTask.category}
                    onValueChange={(value: 'stock_count' | 'quality_check' | 'restocking' | 'audit' | 'maintenance' | 'training') => 
                      setNewTask(prev => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stock_count">Stock Count</SelectItem>
                      <SelectItem value="quality_check">Quality Check</SelectItem>
                      <SelectItem value="restocking">Restocking</SelectItem>
                      <SelectItem value="audit">Audit</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="task-location" className="text-base font-semibold">Location</Label>
                  <Input
                    id="task-location"
                    placeholder="Warehouse A, Aisle 5-7"
                    value={newTask.location}
                    onChange={(e) => setNewTask(prev => ({ ...prev, location: e.target.value }))}
                    className="h-12 text-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t">
              <Button
                onClick={() => setShowAddTaskDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddTask}
                disabled={!newTask.title || !newTask.assignedTo}
                className="flex-1 gradient-secondary text-white"
              >
                <ClipboardCheckIcon className="w-5 h-5 mr-2" />
                Create Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}