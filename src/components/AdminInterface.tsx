import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Progress } from "./ui/progress";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { AppHeader } from "./AppHeader";
import { ApiStatusMonitor } from "./ApiStatusMonitor";
import { useNotifications } from "./NotificationSystem";
import { cashierAPI } from "../utils/cashier-api";
import { type AppState, type SystemStatus } from "../utils/app-constants";
import { 
  ShieldIcon, 
  UsersIcon, 
  SettingsIcon, 
  PlusIcon, 
  EditIcon, 
  TrashIcon, 
  LockIcon, 
  DatabaseIcon, 
  BellIcon, 
  TrendingUpIcon, 
  TrendingUp,
  ActivityIcon,
  TargetIcon,
  FileTextIcon,
  DownloadIcon,
  Calendar,
  DollarSign,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  LineChart
} from "lucide-react";

interface AdminInterfaceProps {
  onLogout: () => void;
  showHeader?: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string;
  salesThisMonth?: number;
}

interface DailyTarget {
  id: string;
  name: string;
  type: 'sales' | 'transactions' | 'items';
  targetValue: number;
  currentValue: number;
  date: string;
  description: string;
  isActive: boolean;
}

export function AdminInterface({ onLogout, showHeader = true }: AdminInterfaceProps) {
  const [users, setUsers] = useState<User[]>([
    { id: "1", name: "John Doe", email: "john@example.com", role: "cashier", status: "active", lastLogin: "2025-08-01 09:30", salesThisMonth: 45230.50 },
    { id: "2", name: "Jane Smith", email: "jane@example.com", role: "manager", status: "active", lastLogin: "2025-08-01 08:15", salesThisMonth: 78450.20 },
    { id: "3", name: "Bob Wilson", email: "bob@example.com", role: "stock", status: "inactive", lastLogin: "2025-07-30 16:45" },
    { id: "4", name: "Alice Brown", email: "alice@example.com", role: "cashier", status: "active", lastLogin: "2025-08-01 10:20", salesThisMonth: 52180.75 },
    { id: "5", name: "Mike Johnson", email: "mike@example.com", role: "cashier", status: "active", lastLogin: "2025-08-01 07:45", salesThisMonth: 38920.30 },
  ]);

  const [dailyTargets, setDailyTargets] = useState<DailyTarget[]>([
    {
      id: "1",
      name: "Daily Sales Target",
      type: "sales",
      targetValue: 5000,
      currentValue: 2847.50,
      date: new Date().toISOString().split('T')[0],
      description: "Achieve R5,000 in daily sales",
      isActive: true
    },
    {
      id: "2", 
      name: "Transaction Count",
      type: "transactions",
      targetValue: 50,
      currentValue: 23,
      date: new Date().toISOString().split('T')[0],
      description: "Process 50 transactions today",
      isActive: true
    },
    {
      id: "3",
      name: "Items Sold",
      type: "items", 
      targetValue: 200,
      currentValue: 89,
      date: new Date().toISOString().split('T')[0],
      description: "Sell 200 items across all categories",
      isActive: true
    }
  ]);

  const [settings, setSettings] = useState({
    vatRate: 15,
    autoBackup: true,
    notifications: true,
    darkMode: false,
    currency: "ZAR",
    sessionTimeout: 30,
    maxLoginAttempts: 3,
    printerModel: "Thermal 80mm",
    backupFrequency: "daily"
  });

  const [showNewTargetDialog, setShowNewTargetDialog] = useState(false);
  const [newTarget, setNewTarget] = useState({
    name: "",
    type: "sales" as "sales" | "transactions" | "items",
    targetValue: 0,
    description: "",
    date: new Date().toISOString().split('T')[0]
  });

  const [dailySales, setDailySales] = useState({
    totalSales: 0,
    totalTransactions: 0
  });

  const [currentTime, setCurrentTime] = useState(new Date());
  const { addNotification } = useNotifications();

  // Create app state for header
  const appState: AppState = {
    currentRole: 'admin',
    isLoading: false,
    user: {
      id: 'admin-1',
      name: localStorage.getItem('roxton-pos-user') ? JSON.parse(localStorage.getItem('roxton-pos-user')!).name || 'Administrator' : 'Administrator',
      role: 'admin',
      email: 'admin@roxtonpos.co.za',
      permissions: ['full_access', 'user_management', 'system_configuration'],
      isActive: true
    }
  };

  const systemStatus: SystemStatus = {
    isOnline: true,
    serverHealth: 'excellent',
    systemLoad: Math.floor(Math.random() * 15) + 5,
    lastSync: new Date(),
    activeSessions: users.filter(u => u.status === 'active').length,
    pendingTasks: 2
  };

  // Load daily sales data
  const loadDailySales = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await cashierAPI.getDailySales(today);
      
      if (response.success && response.data) {
        setDailySales({
          totalSales: response.data.totalSales,
          totalTransactions: response.data.totalTransactions
        });
        
        // Update targets with real data
        setDailyTargets(prev => prev.map(target => ({
          ...target,
          currentValue: target.type === 'sales' ? response.data.totalSales :
                       target.type === 'transactions' ? response.data.totalTransactions :
                       target.currentValue
        })));
      }
    } catch (error) {
      console.log('Error loading daily sales:', error);
    }
  };

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Auto-refresh data
  useEffect(() => {
    loadDailySales();
    loadDailyTargets();
    
    const interval = setInterval(() => {
      loadDailySales();
      loadDailyTargets();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Load daily targets
  const loadDailyTargets = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await cashierAPI.getDailyTargets(today);
      
      if (response.success && response.data) {
        setDailyTargets(response.data);
      }
    } catch (error) {
      console.log('Error loading daily targets:', error);
    }
  };

  const formatZAR = (amount: number) => `R${amount.toFixed(2)}`;

  // Generate PDF Reports
  const generatePDFReport = async (reportType: string) => {
    try {
      // Create a basic PDF report structure
      const reportData = generateReportData(reportType);
      const blob = createPDFBlob(reportData, reportType);
      downloadBlob(blob, `roxton-pos-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`);
      
      addNotification({
        type: 'success',
        title: 'Report Generated',
        message: `${reportType} report has been downloaded successfully`,
        duration: 4000
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Report Generation Failed',
        message: 'Unable to generate PDF report. Please try again.',
        duration: 5000
      });
    }
  };

  // Generate report data based on type
  const generateReportData = (reportType: string) => {
    const currentDate = new Date().toLocaleDateString('en-ZA');
    
    switch (reportType) {
      case 'daily-sales':
        return {
          title: 'Daily Sales Summary',
          date: currentDate,
          data: [
            `Total Sales: ${formatZAR(dailySales.totalSales)}`,
            `Total Transactions: ${dailySales.totalTransactions}`,
            `Average Transaction: ${formatZAR(dailySales.totalSales / (dailySales.totalTransactions || 1))}`,
            '',
            'Daily Targets Progress:',
            ...dailyTargets.map(target => {
              const progress = Math.round((target.currentValue / target.targetValue) * 100);
              return `${target.name}: ${progress}% (${target.currentValue}/${target.targetValue})`;
            })
          ]
        };
      case 'user-performance':
        return {
          title: 'User Performance Report',
          date: currentDate,
          data: [
            'User Performance Summary:',
            '',
            ...users.filter(user => user.salesThisMonth).map(user => 
              `${user.name} (${user.role}): ${formatZAR(user.salesThisMonth!)}`
            )
          ]
        };
      case 'inventory-summary':
        return {
          title: 'Inventory Summary Report',
          date: currentDate,
          data: [
            'Current inventory status and stock levels',
            'Low stock alerts and reorder requirements',
            'Total Products: 247',
            'Low Stock Items: 12',
            'Inventory Value: R48,572'
          ]
        };
      case 'financial-overview':
        const totalMonthlySales = users.reduce((sum, user) => sum + (user.salesThisMonth || 0), 0);
        return {
          title: 'Financial Overview Report',
          date: currentDate,
          data: [
            `Total Monthly Sales: ${formatZAR(totalMonthlySales)}`,
            `VAT Collected (15%): ${formatZAR(totalMonthlySales * 0.15)}`,
            `Net Sales: ${formatZAR(totalMonthlySales * 0.85)}`
          ]
        };
      default:
        return {
          title: 'System Report',
          date: currentDate,
          data: ['Complete system data export', 'All transactions included', 'User data included', 'Financial records included']
        };
    }
  };

  // Create a simple PDF blob using basic HTML
  const createPDFBlob = (reportData: any, reportType: string) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Roxton POS Pro - ${reportData.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            h1 { color: #1e40af; border-bottom: 3px solid #1e40af; padding-bottom: 10px; }
            h2 { color: #374151; }
            .header { text-align: center; margin-bottom: 30px; }
            .date { color: #6b7280; margin-bottom: 20px; }
            .data-line { margin: 8px 0; }
            .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
            @media print {
              body { margin: 0; }
              .header { margin-bottom: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Roxton POS Pro</h1>
            <h2>${reportData.title}</h2>
            <div class="date">Generated: ${reportData.date}</div>
          </div>
          
          <div class="content">
            ${reportData.data.map((line: string) => 
              line === '' ? '<br>' : `<div class="data-line">${line}</div>`
            ).join('')}
          </div>
          
          <div class="footer">
            <p>Roxton POS Pro - Professional Point of Sale System</p>
            <p>Report generated on ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;
    
    return new Blob([htmlContent], { type: 'text/html' });
  };

  // Download blob as file
  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Legacy PDF generation function (keeping for reference)
  const generatePDFReportLegacy = async (reportType: string) => {
    try {
      // Dynamic import of jsPDF - this might not work in all environments
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Set up document
      doc.setFontSize(20);
      doc.text('Roxton POS Pro - Report', 20, 30);
      
      const currentDate = new Date().toLocaleDateString('en-ZA');
      doc.setFontSize(12);
      doc.text(`Generated: ${currentDate}`, 20, 40);
      doc.text(`Report Type: ${reportType}`, 20, 50);

      let yPos = 70;

      switch (reportType) {
        case 'daily-sales':
          doc.setFontSize(16);
          doc.text('Daily Sales Summary', 20, yPos);
          yPos += 20;
          
          doc.setFontSize(12);
          doc.text(`Total Sales: ${formatZAR(dailySales.totalSales)}`, 20, yPos);
          yPos += 10;
          doc.text(`Total Transactions: ${dailySales.totalTransactions}`, 20, yPos);
          yPos += 10;
          doc.text(`Average Transaction: ${formatZAR(dailySales.totalSales / (dailySales.totalTransactions || 1))}`, 20, yPos);
          yPos += 20;

          // Daily Targets Progress
          doc.text('Daily Targets Progress:', 20, yPos);
          yPos += 10;
          
          dailyTargets.forEach(target => {
            const progress = Math.round((target.currentValue / target.targetValue) * 100);
            doc.text(`${target.name}: ${progress}% (${target.currentValue}/${target.targetValue})`, 30, yPos);
            yPos += 10;
          });
          break;

        case 'user-performance':
          doc.setFontSize(16);
          doc.text('User Performance Report', 20, yPos);
          yPos += 20;
          
          doc.setFontSize(12);
          users.forEach(user => {
            if (user.salesThisMonth) {
              doc.text(`${user.name} (${user.role}): ${formatZAR(user.salesThisMonth)}`, 20, yPos);
              yPos += 10;
            }
          });
          break;

        case 'inventory-summary':
          doc.setFontSize(16);
          doc.text('Inventory Summary Report', 20, yPos);
          yPos += 20;
          
          doc.setFontSize(12);
          doc.text('Current inventory status and stock levels', 20, yPos);
          yPos += 10;
          doc.text('Low stock alerts and reorder requirements', 20, yPos);
          break;

        case 'financial-overview':
          doc.setFontSize(16);
          doc.text('Financial Overview Report', 20, yPos);
          yPos += 20;
          
          const totalSales = users.reduce((sum, user) => sum + (user.salesThisMonth || 0), 0);
          doc.setFontSize(12);
          doc.text(`Total Monthly Sales: ${formatZAR(totalSales)}`, 20, yPos);
          yPos += 10;
          doc.text(`VAT Collected (15%): ${formatZAR(totalSales * 0.15)}`, 20, yPos);
          yPos += 10;
          doc.text(`Net Sales: ${formatZAR(totalSales * 0.85)}`, 20, yPos);
          break;
      }

      // Save the PDF
      doc.save(`roxton-pos-${reportType}-${currentDate.replace(/\//g, '-')}.pdf`);
      
      addNotification({
        type: 'success',
        title: 'Report Generated',
        message: `${reportType} report has been downloaded successfully`,
        duration: 4000
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Report Generation Failed',
        message: 'Unable to generate PDF report. Please try again.',
        duration: 5000
      });
    }
  };

  const addUser = () => {
    const newUser: User = {
      id: Date.now().toString(),
      name: "New User",
      email: "newuser@example.com",
      role: "cashier",
      status: "active",
      lastLogin: "Never"
    };
    setUsers(prev => [...prev, newUser]);
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
  };

  const toggleUserStatus = (id: string) => {
    setUsers(prev => 
      prev.map(user => 
        user.id === id 
          ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
          : user
      )
    );
  };

  const addDailyTarget = async () => {
    if (!newTarget.name || !newTarget.targetValue) {
      addNotification({
        type: 'error',
        title: 'Invalid Target',
        message: 'Please fill in all required fields',
        duration: 3000
      });
      return;
    }

    try {
      const response = await cashierAPI.createDailyTarget(newTarget);
      
      if (response.success && response.data) {
        // Reload targets to get updated data from server
        await loadDailyTargets();
        
        setNewTarget({
          name: "",
          type: "sales",
          targetValue: 0,
          description: "",
          date: new Date().toISOString().split('T')[0]
        });
        setShowNewTargetDialog(false);

        addNotification({
          type: 'success',
          title: 'Target Created',
          message: `New daily target "${newTarget.name}" has been set`,
          duration: 4000
        });
      } else {
        throw new Error(response.error || 'Failed to create target');
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to Create Target',
        message: 'Unable to create the daily target. Please try again.',
        duration: 5000
      });
    }
  };

  const deleteTarget = async (id: string) => {
    try {
      const response = await cashierAPI.deleteDailyTarget(id);
      
      if (response.success) {
        await loadDailyTargets();
        addNotification({
          type: 'info',
          title: 'Target Removed',
          message: 'Daily target has been deleted',
          duration: 3000
        });
      } else {
        throw new Error(response.error || 'Failed to delete target');
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to Delete Target',
        message: 'Unable to delete the target. Please try again.',
        duration: 5000
      });
    }
  };

  const toggleTarget = async (id: string) => {
    try {
      const target = dailyTargets.find(t => t.id === id);
      if (!target) return;

      const response = await cashierAPI.updateDailyTarget(id, { 
        isActive: !target.isActive 
      });
      
      if (response.success) {
        await loadDailyTargets();
      } else {
        throw new Error(response.error || 'Failed to update target');
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to Update Target',
        message: 'Unable to update the target status.',
        duration: 5000
      });
    }
  };

  const roleColors = {
    admin: 'gradient-danger',
    manager: 'gradient-accent',
    cashier: 'gradient-primary',
    stock: 'gradient-secondary'
  };

  const roleIcons = {
    admin: ShieldIcon,
    manager: TrendingUpIcon,
    cashier: UsersIcon,
    stock: DatabaseIcon
  };

  const totalSales = users.reduce((sum, user) => sum + (user.salesThisMonth || 0), 0);
  const activeUsers = users.filter(u => u.status === 'active').length;
  const totalTransactions = dailySales.totalTransactions || 1247;

  const getTargetIcon = (type: string) => {
    switch (type) {
      case 'sales': return DollarSign;
      case 'transactions': return BarChart3;
      case 'items': return PieChart;
      default: return TargetIcon;
    }
  };

  const getTargetProgress = (target: DailyTarget) => {
    return Math.min(Math.round((target.currentValue / target.targetValue) * 100), 100);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 70) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-red-900 dark:to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-red-400/10 to-pink-600/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-red-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container-optimized px-6 py-8 relative z-10">
        {/* Conditional Header */}
        {showHeader && (
          <AppHeader 
            appState={appState}
            systemStatus={systemStatus}
            currentTime={currentTime}
            onLogout={onLogout}
          />
        )}

        <div className="mt-8">
          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="grid w-full grid-cols-5 bg-white shadow-elegant p-2 h-16">
              <TabsTrigger value="overview" className="flex items-center gap-3 text-base py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                <BarChart3 className="w-5 h-5" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="targets" className="flex items-center gap-3 text-base py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white">
                <TargetIcon className="w-5 h-5" />
                Daily Targets
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-3 text-base py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                <FileTextIcon className="w-5 h-5" />
                Reports
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-3 text-base py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">
                <UsersIcon className="w-5 h-5" />
                Users
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-3 text-base py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white">
                <SettingsIcon className="w-5 h-5" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8 animate-slide-up">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">System Overview</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">Comprehensive dashboard for system management and monitoring</p>
              </div>

              {/* Enhanced Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="glass-card shadow-luxury border-0 hover-lift animate-scale-in">
                  <CardContent className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Total Users</p>
                        <p className="text-4xl font-bold text-blue-600">{users.length}</p>
                        <p className="text-sm text-blue-500 mt-1">+2 this month</p>
                      </div>
                      <div className="p-4 bg-blue-100 dark:bg-blue-900/50 rounded-2xl">
                        <UsersIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card shadow-luxury border-0 hover-lift animate-scale-in" style={{ animationDelay: '100ms' }}>
                  <CardContent className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Daily Sales</p>
                        <p className="text-4xl font-bold text-green-600">{formatZAR(dailySales.totalSales)}</p>
                        <p className="text-sm text-green-500 mt-1">Today's total</p>
                      </div>
                      <div className="p-4 bg-green-100 dark:bg-green-900/50 rounded-2xl">
                        <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card shadow-luxury border-0 hover-lift animate-scale-in" style={{ animationDelay: '200ms' }}>
                  <CardContent className="p-8 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Daily Transactions</p>
                        <p className="text-4xl font-bold text-purple-600">{dailySales.totalTransactions}</p>
                        <p className="text-sm text-purple-500 mt-1">Completed today</p>
                      </div>
                      <div className="p-4 bg-purple-100 dark:bg-purple-900/50 rounded-2xl">
                        <BarChart3 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card shadow-luxury border-0 hover-lift animate-scale-in" style={{ animationDelay: '300ms' }}>
                  <CardContent className="p-8 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Active Sessions</p>
                        <p className="text-4xl font-bold text-orange-600">{activeUsers}</p>
                        <p className="text-sm text-orange-500 mt-1">Online now</p>
                      </div>
                      <div className="p-4 bg-orange-100 dark:bg-orange-900/50 rounded-2xl">
                        <ActivityIcon className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Targets Overview */}
              <Card className="glass-card shadow-luxury border-0 animate-slide-up" style={{ animationDelay: '400ms' }}>
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 pb-6">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 gradient-primary rounded-lg">
                      <TargetIcon className="w-6 h-6 text-white" />
                    </div>
                    Today's Targets Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {dailyTargets.filter(target => target.isActive).map((target, index) => {
                      const progress = getTargetProgress(target);
                      const TargetIconComponent = getTargetIcon(target.type);
                      
                      return (
                        <div key={target.id} className="p-6 glass-card-weak rounded-xl hover-lift" style={{ animationDelay: `${index * 100}ms` }}>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 gradient-secondary rounded-lg">
                              <TargetIconComponent className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{target.name}</h3>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Progress</span>
                              <span className="font-semibold text-gray-900 dark:text-white">{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-3" />
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>{target.currentValue}</span>
                              <span>{target.targetValue}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Daily Targets Tab */}
            <TabsContent value="targets" className="space-y-8 animate-slide-up">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Daily Targets Management</h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">Set and monitor daily performance targets across the system</p>
                </div>
                <Dialog open={showNewTargetDialog} onOpenChange={setShowNewTargetDialog}>
                  <DialogTrigger asChild>
                    <Button className="gradient-primary text-white shadow-luxury hover-lift px-6 py-3">
                      <PlusIcon className="w-5 h-5 mr-2" />
                      Add Target
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-card border-0 max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-3 text-xl">
                        <div className="p-2 gradient-primary rounded-lg">
                          <TargetIcon className="w-6 h-6 text-white" />
                        </div>
                        Create New Daily Target
                      </DialogTitle>
                      <DialogDescription>
                        Set up a new daily performance target to track business metrics such as sales goals, transaction counts, or items sold targets.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 mt-6">
                      <div className="space-y-2">
                        <Label htmlFor="targetName">Target Name</Label>
                        <Input
                          id="targetName"
                          placeholder="e.g., Daily Sales Goal"
                          value={newTarget.name}
                          onChange={(e) => setNewTarget(prev => ({ ...prev, name: e.target.value }))}
                          className="h-12"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="targetType">Target Type</Label>
                        <Select value={newTarget.type} onValueChange={(value: any) => setNewTarget(prev => ({ ...prev, type: value }))}>
                          <SelectTrigger className="h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sales">Sales Amount (ZAR)</SelectItem>
                            <SelectItem value="transactions">Transaction Count</SelectItem>
                            <SelectItem value="items">Items Sold</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="targetValue">Target Value</Label>
                        <Input
                          id="targetValue"
                          type="number"
                          placeholder="0"
                          value={newTarget.targetValue || ''}
                          onChange={(e) => setNewTarget(prev => ({ ...prev, targetValue: Number(e.target.value) }))}
                          className="h-12"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="targetDescription">Description</Label>
                        <Textarea
                          id="targetDescription"
                          placeholder="Brief description of this target..."
                          value={newTarget.description}
                          onChange={(e) => setNewTarget(prev => ({ ...prev, description: e.target.value }))}
                          className="min-h-16"
                        />
                      </div>
                      
                      <div className="flex gap-3 pt-4">
                        <Button onClick={addDailyTarget} className="flex-1 gradient-primary text-white hover-lift">
                          Create Target
                        </Button>
                        <Button variant="outline" onClick={() => setShowNewTargetDialog(false)} className="flex-1">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Targets Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {dailyTargets.map((target, index) => {
                  const progress = getTargetProgress(target);
                  const TargetIconComponent = getTargetIcon(target.type);
                  const progressColor = getProgressColor(progress);
                  
                  return (
                    <Card key={target.id} className="glass-card shadow-luxury border-0 hover-lift animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 pb-6">
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-3 gradient-secondary rounded-xl">
                              <TargetIconComponent className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{target.name}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{target.type} target</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={target.isActive}
                              onCheckedChange={() => toggleTarget(target.id)}
                              className="data-[state=checked]:bg-green-500"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteTarget(target.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-8 space-y-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">Progress</span>
                            <div className="text-right">
                              <span className="text-3xl font-bold text-gray-900 dark:text-white">{progress}%</span>
                              <div className="text-sm text-gray-500">
                                {target.type === 'sales' ? formatZAR(target.currentValue) : target.currentValue} / {target.type === 'sales' ? formatZAR(target.targetValue) : target.targetValue}
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Progress value={progress} className="h-4" />
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>0%</span>
                              <span>50%</span>
                              <span>100%</span>
                            </div>
                          </div>
                        </div>
                        
                        {target.description && (
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-700 dark:text-gray-300">{target.description}</p>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(target.date).toLocaleDateString('en-ZA')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>Updates every 30 seconds</span>
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t">
                          {progress >= 100 ? (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle className="w-5 h-5" />
                              <span className="font-semibold">Target Achieved!</span>
                            </div>
                          ) : progress >= 90 ? (
                            <div className="flex items-center gap-2 text-blue-600">
                              <TrendingUp className="w-5 h-5" />
                              <span className="font-semibold">Almost there!</span>
                            </div>
                          ) : progress < 50 ? (
                            <div className="flex items-center gap-2 text-orange-600">
                              <AlertTriangle className="w-5 h-5" />
                              <span className="font-semibold">Needs attention</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-gray-600">
                              <TrendingUp className="w-5 h-5" />
                              <span className="font-semibold">On track</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-8 animate-slide-up">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">Generate and export comprehensive business reports</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Daily Sales Report */}
                <Card className="glass-card shadow-luxury border-0 hover-lift animate-scale-in">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 pb-6">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-3 gradient-secondary rounded-xl">
                        <BarChart3 className="w-6 h-6 text-white" />
                      </div>
                      Daily Sales Report
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Total Sales</span>
                        <span className="font-bold text-green-600">{formatZAR(dailySales.totalSales)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Transactions</span>
                        <span className="font-bold text-blue-600">{dailySales.totalTransactions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Avg. Transaction</span>
                        <span className="font-bold text-purple-600">{formatZAR(dailySales.totalSales / (dailySales.totalTransactions || 1))}</span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => generatePDFReport('daily-sales')}
                      className="w-full gradient-primary text-white hover-lift"
                    >
                      <DownloadIcon className="w-5 h-5 mr-2" />
                      Download PDF
                    </Button>
                  </CardContent>
                </Card>

                {/* User Performance Report */}
                <Card className="glass-card shadow-luxury border-0 hover-lift animate-scale-in" style={{ animationDelay: '100ms' }}>
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 pb-6">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-3 gradient-primary rounded-xl">
                        <UsersIcon className="w-6 h-6 text-white" />
                      </div>
                      User Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Active Users</span>
                        <span className="font-bold text-blue-600">{activeUsers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Total Monthly Sales</span>
                        <span className="font-bold text-green-600">{formatZAR(totalSales)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Top Performer</span>
                        <span className="font-bold text-purple-600">Jane Smith</span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => generatePDFReport('user-performance')}
                      className="w-full gradient-primary text-white hover-lift"
                    >
                      <DownloadIcon className="w-5 h-5 mr-2" />
                      Download PDF
                    </Button>
                  </CardContent>
                </Card>

                {/* Inventory Summary Report */}
                <Card className="glass-card shadow-luxury border-0 hover-lift animate-scale-in" style={{ animationDelay: '200ms' }}>
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 pb-6">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-3 gradient-accent rounded-xl">
                        <DatabaseIcon className="w-6 h-6 text-white" />
                      </div>
                      Inventory Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Total Products</span>
                        <span className="font-bold text-purple-600">247</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Low Stock Items</span>
                        <span className="font-bold text-orange-600">12</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Inventory Value</span>
                        <span className="font-bold text-green-600">R48,572</span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => generatePDFReport('inventory-summary')}
                      className="w-full gradient-primary text-white hover-lift"
                    >
                      <DownloadIcon className="w-5 h-5 mr-2" />
                      Download PDF
                    </Button>
                  </CardContent>
                </Card>

                {/* Financial Overview Report */}
                <Card className="glass-card shadow-luxury border-0 hover-lift animate-scale-in" style={{ animationDelay: '300ms' }}>
                  <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 pb-6">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-3 gradient-warning rounded-xl">
                        <LineChart className="w-6 h-6 text-white" />
                      </div>
                      Financial Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Monthly Revenue</span>
                        <span className="font-bold text-green-600">{formatZAR(totalSales)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">VAT Collected</span>
                        <span className="font-bold text-blue-600">{formatZAR(totalSales * 0.15)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Net Sales</span>
                        <span className="font-bold text-purple-600">{formatZAR(totalSales * 0.85)}</span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => generatePDFReport('financial-overview')}
                      className="w-full gradient-primary text-white hover-lift"
                    >
                      <DownloadIcon className="w-5 h-5 mr-2" />
                      Download PDF
                    </Button>
                  </CardContent>
                </Card>

                {/* Custom Report Builder */}
                <Card className="glass-card shadow-luxury border-0 hover-lift animate-scale-in" style={{ animationDelay: '400ms' }}>
                  <CardHeader className="bg-gradient-to-r from-pink-50 to-red-50 dark:from-pink-900/20 dark:to-red-900/20 pb-6">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-3 gradient-danger rounded-xl">
                        <FileTextIcon className="w-6 h-6 text-white" />
                      </div>
                      Custom Report
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">Build custom reports with specific date ranges and filters</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Date Range</Label>
                        <Input type="date" className="h-12" />
                      </div>
                      <div className="space-y-2">
                        <Label>Report Type</Label>
                        <Select>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select report type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sales">Sales Analysis</SelectItem>
                            <SelectItem value="products">Product Performance</SelectItem>
                            <SelectItem value="customers">Customer Insights</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button className="w-full gradient-danger text-white hover-lift">
                      <FileTextIcon className="w-5 h-5 mr-2" />
                      Generate Custom Report
                    </Button>
                  </CardContent>
                </Card>

                {/* Export All Data */}
                <Card className="glass-card shadow-luxury border-0 hover-lift animate-scale-in" style={{ animationDelay: '500ms' }}>
                  <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 pb-6">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-3 gradient-accent rounded-xl">
                        <DatabaseIcon className="w-6 h-6 text-white" />
                      </div>
                      Complete Export
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">Export all system data including users, transactions, and inventory</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
                        <div>✓ All transactions</div>
                        <div>✓ User data</div>
                        <div>✓ Product catalog</div>
                        <div>✓ Financial records</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Button 
                        onClick={() => generatePDFReport('complete-export')}
                        className="w-full gradient-accent text-white hover-lift"
                      >
                        <DownloadIcon className="w-5 h-5 mr-2" />
                        Export Complete Data
                      </Button>
                      <p className="text-xs text-gray-500 text-center">Large file - may take a few moments</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-8 animate-slide-up">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">Manage user accounts, roles and permissions</p>
                </div>
                <Button onClick={addUser} className="gradient-primary text-white shadow-luxury hover-lift px-6 py-3">
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Add New User
                </Button>
              </div>

              {/* Enhanced User Table */}
              <Card className="glass-card shadow-luxury border-0 animate-slide-up" style={{ animationDelay: '400ms' }}>
                <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 pb-6">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 gradient-primary rounded-lg">
                      <UsersIcon className="w-6 h-6 text-white" />
                    </div>
                    All Users ({users.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 dark:bg-gray-800 border-b-2">
                          <TableHead className="py-4 font-bold">User Details</TableHead>
                          <TableHead className="py-4 font-bold">Role</TableHead>
                          <TableHead className="py-4 font-bold">Status</TableHead>
                          <TableHead className="py-4 font-bold">Performance</TableHead>
                          <TableHead className="py-4 font-bold">Last Login</TableHead>
                          <TableHead className="py-4 font-bold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user, index) => {
                          const RoleIcon = roleIcons[user.role as keyof typeof roleIcons] || UsersIcon;
                          return (
                            <TableRow key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors animate-fade-in border-b" style={{ animationDelay: `${index * 100}ms` }}>
                              <TableCell className="py-6">
                                <div className="flex items-center gap-4">
                                  <div className={`w-12 h-12 rounded-2xl ${roleColors[user.role as keyof typeof roleColors]} flex items-center justify-center text-white font-bold text-lg shadow-elegant`}>
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
                                <div className="flex items-center gap-2">
                                  <RoleIcon className="w-4 h-4" />
                                  <Badge className={`${roleColors[user.role as keyof typeof roleColors]} text-white px-4 py-2 text-sm`}>
                                    {user.role.toUpperCase()}
                                  </Badge>
                                </div>
                              </TableCell>
                              
                              <TableCell className="py-6">
                                <div className="flex items-center gap-3">
                                  <Switch
                                    checked={user.status === 'active'}
                                    onCheckedChange={() => toggleUserStatus(user.id)}
                                    className="data-[state=checked]:bg-green-500"
                                  />
                                  <Badge 
                                    variant={user.status === 'active' ? 'default' : 'secondary'}
                                    className={`px-3 py-1 ${user.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}
                                  >
                                    {user.status.toUpperCase()}
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
                              
                              <TableCell className="py-6 text-gray-600 dark:text-gray-400">{user.lastLogin}</TableCell>
                              
                              <TableCell className="py-6">
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" className="hover:bg-blue-50 dark:hover:bg-blue-900 hover-lift">
                                    <EditIcon className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900 hover-lift"
                                    onClick={() => deleteUser(user.id)}
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
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-8 animate-slide-up">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">System Configuration</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">Configure business rules and system preferences</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* API Status Monitor */}
                <div className="lg:col-span-1">
                  <ApiStatusMonitor />
                </div>

                <div className="lg:col-span-2 grid grid-cols-1 gap-8">
                {/* Business Configuration */}
                <Card className="glass-card shadow-luxury border-0 hover-lift">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 pb-6">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 gradient-primary rounded-lg">
                        <DatabaseIcon className="w-6 h-6 text-white" />
                      </div>
                      Business Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div className="space-y-3">
                      <Label htmlFor="vatRate" className="text-base font-semibold">VAT Rate (%)</Label>
                      <Input 
                        id="vatRate"
                        type="number" 
                        value={settings.vatRate}
                        onChange={(e) => setSettings(prev => ({...prev, vatRate: Number(e.target.value)}))}
                        className="h-12 text-lg border-2 focus:border-blue-500"
                      />
                      <p className="text-sm text-gray-500">Standard South African VAT rate</p>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="currency" className="text-base font-semibold">Currency</Label>
                      <Select value={settings.currency} onValueChange={(value) => setSettings(prev => ({...prev, currency: value}))}>
                        <SelectTrigger className="h-12 text-lg border-2 focus:border-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ZAR">ZAR (R) - South African Rand</SelectItem>
                          <SelectItem value="USD">USD ($) - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
                          <SelectItem value="GBP">GBP (£) - British Pound</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="printerModel" className="text-base font-semibold">Receipt Printer</Label>
                      <Select value={settings.printerModel} onValueChange={(value) => setSettings(prev => ({...prev, printerModel: value}))}>
                        <SelectTrigger className="h-12 text-lg border-2 focus:border-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Thermal 80mm">Thermal 80mm</SelectItem>
                          <SelectItem value="Thermal 58mm">Thermal 58mm</SelectItem>
                          <SelectItem value="Impact Dot Matrix">Impact Dot Matrix</SelectItem>
                          <SelectItem value="Standard Inkjet">Standard Inkjet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* System Preferences */}
                <Card className="glass-card shadow-luxury border-0 hover-lift">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 pb-6">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 gradient-secondary rounded-lg">
                        <BellIcon className="w-6 h-6 text-white" />
                      </div>
                      System Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl hover-lift">
                      <div>
                        <Label htmlFor="autoBackup" className="font-semibold text-lg">Automatic Backup</Label>
                        <p className="text-gray-600 dark:text-gray-400">Daily data backup to secure cloud storage</p>
                      </div>
                      <Switch 
                        id="autoBackup"
                        checked={settings.autoBackup}
                        onCheckedChange={(checked) => setSettings(prev => ({...prev, autoBackup: checked}))}
                        className="data-[state=checked]:bg-green-500"
                      />
                    </div>

                    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl hover-lift">
                      <div>
                        <Label htmlFor="notifications" className="font-semibold text-lg">Push Notifications</Label>
                        <p className="text-gray-600 dark:text-gray-400">Real-time alerts and system notifications</p>
                      </div>
                      <Switch 
                        id="notifications"
                        checked={settings.notifications}
                        onCheckedChange={(checked) => setSettings(prev => ({...prev, notifications: checked}))}
                        className="data-[state=checked]:bg-blue-500"
                      />
                    </div>

                    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl hover-lift">
                      <div>
                        <Label htmlFor="darkMode" className="font-semibold text-lg">Dark Mode Theme</Label>
                        <p className="text-gray-600 dark:text-gray-400">Switch to dark interface theme</p>
                      </div>
                      <Switch 
                        id="darkMode"
                        checked={settings.darkMode}
                        onCheckedChange={(checked) => setSettings(prev => ({...prev, darkMode: checked}))}
                        className="data-[state=checked]:bg-purple-500"
                      />
                    </div>
                  </CardContent>
                </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}