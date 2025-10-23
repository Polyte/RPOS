import { Badge } from "./ui/badge";
import { formatZAR } from "../utils/app-helpers";
import { type SystemStatus } from "../utils/app-constants";
import {
  CalendarIcon,
  ClockIcon,
  MonitorIcon,
  TrendingUpIcon,
  UsersIcon,
  PackageIcon,
  ActivityIcon,
  ServerIcon,
  ShieldCheckIcon,
  WifiIcon,
  BarChart3Icon,
} from "lucide-react";

interface RoleSpecificInfoProps {
  role: string;
  currentTime: Date;
  systemStatus: SystemStatus;
}

export function RoleSpecificInfo({ role, currentTime }: RoleSpecificInfoProps) {
  const getCurrentTerminal = () => {
    return localStorage.getItem('roxton-pos-terminal') || 'POS-001';
  };

  switch (role) {
    case 'cashier':
      return (
        <div className="flex items-center gap-4 text-sm animate-slide-right">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-blue-500" />
            <span className="text-gray-600 dark:text-gray-300">
              {currentTime.toLocaleDateString('en-ZA', { 
                weekday: 'short', 
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-green-500" />
            <span className="text-gray-600 dark:text-gray-300 font-mono">
              {currentTime.toLocaleTimeString('en-ZA', { 
                hour: '2-digit', 
                minute: '2-digit'
              })}
            </span>
          </div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="flex items-center gap-2">
            <MonitorIcon className="w-4 h-4 text-purple-600" />
            <span className="text-purple-600 font-medium">{getCurrentTerminal()}</span>
          </div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="flex items-center gap-2">
            <ActivityIcon className="w-4 h-4 text-orange-500" />
            <span className="text-orange-600 font-medium">Active Session</span>
          </div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <Badge variant="outline" className="status-online bg-green-50 border-green-200 text-green-700">
            Online
          </Badge>
        </div>
      );
    case 'manager':
      return (
        <div className="flex items-center gap-4 text-sm animate-slide-right">
          <div className="flex items-center gap-2">
            <TrendingUpIcon className="w-4 h-4 text-green-600" />
            <span className="text-gray-600 dark:text-gray-300">Performance Tracking</span>
          </div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="flex items-center gap-2">
            <UsersIcon className="w-4 h-4 text-blue-600" />
            <span className="text-gray-600 dark:text-gray-300">Team Management</span>
          </div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
            Manager Access
          </Badge>
        </div>
      );
    case 'stock':
      return (
        <div className="flex items-center gap-4 text-sm animate-slide-right">
          <div className="flex items-center gap-2">
            <PackageIcon className="w-4 h-4 text-orange-600" />
            <span className="text-gray-600 dark:text-gray-300">Inventory Control</span>
          </div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="flex items-center gap-2">
            <ActivityIcon className="w-4 h-4 text-purple-600" />
            <span className="text-gray-600 dark:text-gray-300">Stock Management</span>
          </div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700">
            Stock Control
          </Badge>
        </div>
      );
    default:
      return (
        <div className="flex items-center gap-4 text-sm animate-slide-right">
          <div className="flex items-center gap-2">
            <ServerIcon className="w-4 h-4 text-indigo-600" />
            <span className="text-gray-600 dark:text-gray-300">System Administration</span>
          </div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="w-4 h-4 text-green-600" />
            <span className="text-gray-600 dark:text-gray-300">Security: Active</span>
          </div>
        </div>
      );
  }
}

interface RoleSpecificStatsProps {
  role: string;
  systemStatus: SystemStatus;
}

export function RoleSpecificStats({ role, systemStatus }: RoleSpecificStatsProps) {
  // Get real data from localStorage or API with proper fallbacks
  const getDailySalesTotal = () => {
    const saved = localStorage.getItem('roxton-pos-daily-total');
    return saved ? parseFloat(saved) : 0;
  };

  const getTransactionCount = () => {
    const saved = localStorage.getItem('roxton-pos-transaction-count');
    return saved ? parseInt(saved) : 0;
  };

  const getInventoryValue = () => {
    // This would typically come from an API call
    const saved = localStorage.getItem('roxton-pos-inventory-value');
    return saved ? parseFloat(saved) : 15247.50; // Default demo value
  };

  const getSystemUptime = () => {
    return systemStatus.lastSync ? 
      Math.floor((Date.now() - new Date(systemStatus.lastSync).getTime()) / 1000 / 60) : 0;
  };

  switch (role) {
    case 'cashier':
      return (
        <div className="text-right animate-fade-in">
          <p className="text-xs text-gray-500 dark:text-gray-400">Today's Sales</p>
          <p className="text-xl font-bold text-green-600">{formatZAR(getDailySalesTotal())}</p>
          <div className="flex items-center gap-1 mt-1 justify-end">
            <TrendingUpIcon className="w-3 h-3 text-green-500" />
            <span className="text-xs text-green-600">{getTransactionCount()} transactions today</span>
          </div>
        </div>
      );
    case 'manager':
      return (
        <div className="text-right animate-fade-in">
          <p className="text-xs text-gray-500 dark:text-gray-400">Daily Revenue</p>
          <p className="text-xl font-bold text-blue-600">{formatZAR(getDailySalesTotal())}</p>
          <div className="flex items-center gap-1 mt-1 justify-end">
            <BarChart3Icon className="w-3 h-3 text-blue-500" />
            <span className="text-xs text-blue-600">{getTransactionCount()} transactions</span>
          </div>
        </div>
      );
    case 'stock':
      return (
        <div className="text-right animate-fade-in">
          <p className="text-xs text-gray-500 dark:text-gray-400">Inventory Value</p>
          <p className="text-xl font-bold text-purple-600">{formatZAR(getInventoryValue())}</p>
          <div className="flex items-center gap-1 mt-1 justify-end">
            <PackageIcon className="w-3 h-3 text-purple-500" />
            <span className="text-xs text-purple-600">Live Inventory</span>
          </div>
        </div>
      );
    case 'admin':
      return (
        <div className="text-right animate-fade-in">
          <p className="text-xs text-gray-500 dark:text-gray-400">System Health</p>
          <p className="text-xl font-bold text-indigo-600 capitalize">{systemStatus.serverHealth}</p>
          <div className="flex items-center gap-1 mt-1 justify-end">
            <WifiIcon className="w-3 h-3 text-indigo-500" />
            <span className="text-xs text-indigo-600">{getSystemUptime()}min uptime</span>
          </div>
        </div>
      );
    default:
      return null;
  }
}