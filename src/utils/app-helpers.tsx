import { 
  ROLE_ICONS, 
  ROLE_DISPLAY_ICONS, 
  ROLE_TITLES,
  POS_CONFIG,
  type SystemStatus
} from './app-constants';

export const getRoleIcon = (role: string) => {
  return ROLE_ICONS[role as keyof typeof ROLE_ICONS] || ROLE_ICONS.cashier;
};

export const getRoleDisplayIcon = (role: string) => {
  return ROLE_DISPLAY_ICONS[role as keyof typeof ROLE_DISPLAY_ICONS] || ROLE_DISPLAY_ICONS.cashier;
};

export const getRoleTitle = (role: string): string => {
  return ROLE_TITLES[role as keyof typeof ROLE_TITLES] || 'Dashboard';
};

export const getDisplayName = (role: string): string => {
  const roleDisplayNames = {
    cashier: 'Cashier',
    admin: 'Administrator', 
    manager: 'Manager',
    supervisor: 'Supervisor',
    multitenant_manager: 'System Manager',
    stock: 'Stock Controller'
  };
  return roleDisplayNames[role as keyof typeof roleDisplayNames] || 'User';
};

export const formatZAR = (amount: number): string => {
  return `${POS_CONFIG.CURRENCY_SYMBOL}${amount.toLocaleString('en-ZA', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};

export const calculateVAT = (amount: number): number => {
  return amount * POS_CONFIG.VAT_RATE;
};

export const calculateSubtotal = (amount: number): number => {
  return amount / (1 + POS_CONFIG.VAT_RATE);
};

export const createUserData = (role: string) => ({
  id: generateRandomId(),
  name: getDisplayName(role),
  role: role,
  email: `${role}@roxtonpos.co.za`,
  permissions: role === 'admin' ? ['all'] : [`${role}_access`],
  isActive: true
});

export const getBreadcrumbItems = (currentRole: string | null) => {
  if (!currentRole) return [];
  
  const RoleIcon = getRoleIcon(currentRole);
  return [
    {
      label: currentRole.charAt(0).toUpperCase() + currentRole.slice(1),
      icon: RoleIcon
    }
  ];
};

export const generateTransactionId = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `TXN${timestamp}${random}`;
};

export const generateReceiptNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const sequence = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `R${year}${month}${day}${sequence}`;
};

export const validatePrice = (price: string): boolean => {
  const numPrice = parseFloat(price);
  return !isNaN(numPrice) && numPrice >= 0 && numPrice < 999999.99;
};

export const validateQuantity = (quantity: string): boolean => {
  const numQuantity = parseInt(quantity);
  return !isNaN(numQuantity) && numQuantity > 0 && numQuantity <= 9999;
};

export const formatDateTime = (date: Date): string => {
  return date.toLocaleString('en-ZA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

export const isValidBarcode = (barcode: string): boolean => {
  // Basic barcode validation - can be enhanced based on specific barcode formats
  return barcode.length >= 8 && barcode.length <= 18 && /^\d+$/.test(barcode);
};

export const getCurrentShift = (): string => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 14) return 'morning';
  if (hour >= 14 && hour < 22) return 'afternoon';
  return 'night';
};

export const generateRandomId = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const calculateChange = (amountPaid: number, total: number): number => {
  return Math.max(0, amountPaid - total);
};

export const roundToNearestCent = (amount: number): number => {
  return Math.round(amount * 100) / 100;
};

export const getSystemHealthColor = (health: 'excellent' | 'good' | 'poor'): string => {
  switch (health) {
    case 'excellent':
      return 'text-green-500';
    case 'good':
      return 'text-yellow-500';
    case 'poor':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
};

export const getSystemHealthBadge = (health: 'excellent' | 'good' | 'poor'): string => {
  switch (health) {
    case 'excellent':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'good':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'poor':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};