import {
  UserIcon,
  ShieldIcon,
  CrownIcon,
  PackageIcon,
  ShoppingCartIcon,
  TrendingUpIcon,
  ClipboardCheckIcon,
  ServerIcon,
} from "lucide-react";

export interface AppState {
  currentRole: string | null;
  isLoading: boolean;
  user: {
    id: string;
    name: string;
    role: string;
    email: string;
    permissions: string[];
    isActive: boolean;
  } | null;
}

export interface SystemStatus {
  isOnline?: boolean;
  online?: boolean;
  serverStatus?: 'online' | 'offline' | 'maintenance';
  serverHealth?: 'excellent' | 'good' | 'poor';
  databaseStatus?: 'connected' | 'disconnected' | 'error';
  lastSync?: Date;
  version?: string;
  uptime?: string;
  activeUsers?: number;
  activeSessions?: number;
  systemLoad?: number;
  memoryUsage?: number;
  diskSpace?: number;
  pendingTasks?: number;
}

export const ROLE_ICONS = {
  cashier: UserIcon,
  admin: ShieldIcon,
  manager: CrownIcon,
  supervisor: ClipboardCheckIcon,
  multitenant_manager: ServerIcon,
  stock: PackageIcon
} as const;

export const ROLE_DISPLAY_ICONS = {
  cashier: ShoppingCartIcon,
  admin: ShieldIcon,
  manager: TrendingUpIcon,
  supervisor: ClipboardCheckIcon,
  multitenant_manager: ServerIcon,
  stock: PackageIcon
} as const;

export const ROLE_TITLES = {
  cashier: 'Cashier Terminal',
  admin: 'Admin Dashboard',
  manager: 'Manager Portal',
  supervisor: 'Supervisor Dashboard',
  multitenant_manager: 'System Management',
  stock: 'Stock Management'
} as const;

export const STORAGE_KEYS = {
  ROLE: 'roxton-pos-role',
  USER: 'roxton-pos-user',
  CART: 'roxton-pos-cart',
  DAILY_TOTAL: 'roxton-pos-daily-total'
} as const;

export const APP_VERSION = 'v2.1.0';
export const LOADING_DURATION = 2000;
export const TRANSITION_DURATION = 600;

// Production-ready configuration
export const POS_CONFIG = {
  VAT_RATE: 0.15, // 15% VAT for South Africa
  CURRENCY: 'ZAR',
  CURRENCY_SYMBOL: 'R',
  RECEIPT_COMPANY_NAME: 'Roxton POS Pro',
  RECEIPT_TAX_NUMBER: '',
  RECEIPT_ADDRESS: '',
  RECEIPT_PHONE: '',
  MAX_TRANSACTION_ITEMS: 100,
  AUTO_LOGOUT_MINUTES: 30,
  BACKUP_INTERVAL_MINUTES: 15
} as const;

export const TRANSACTION_TYPES = {
  SALE: 'sale',
  RETURN: 'return',
  VOID: 'void'
} as const;

export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  EFT: 'eft',
  SPLIT: 'split'
} as const;