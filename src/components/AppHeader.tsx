import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ThemeToggle } from "./ThemeProvider";
import { useNotifications } from "./NotificationSystem";
import { SupportRequestButton } from "./SupportRequestButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { type AppState, type SystemStatus } from "../utils/app-constants";
import { 
  ShieldIcon, 
  UsersIcon, 
  DollarSignIcon,
  TrendingUpIcon,
  SettingsIcon,
  LogOutIcon,
  BellIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  WifiIcon,
  ActivityIcon,
  ClockIcon,
  ServerIcon,
  DatabaseIcon,
  Terminal,
  Calendar,
  User
} from "lucide-react";

interface AppHeaderProps {
  appState: AppState;
  systemStatus: SystemStatus;
  currentTime: Date;
  onLogout: () => void;
}

export function AppHeader({ appState, systemStatus, currentTime, onLogout }: AppHeaderProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    autoRefresh: true,
    currency: 'ZAR',
    language: 'en-ZA',
    vatRate: 15,
    autoLogout: 30,
    soundEnabled: true,
    compactMode: false,
    showCurrency: true,
    twentyFourHour: true
  });

  const { addNotification } = useNotifications();

  // Load settings from localStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('roxton-pos-settings');
      if (savedSettings) {
        setSettings({ ...settings, ...JSON.parse(savedSettings) });
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = (newSettings: typeof settings) => {
    try {
      setSettings(newSettings);
      localStorage.setItem('roxton-pos-settings', JSON.stringify(newSettings));
      
      addNotification({
        type: 'success',
        title: 'Settings Saved',
        message: 'Your preferences have been updated successfully',
        duration: 3000
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Save Failed',
        message: 'Unable to save settings. Please try again.',
        duration: 4000
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return ShieldIcon;
      case 'manager': return TrendingUpIcon;
      case 'cashier': return UsersIcon;
      case 'supervisor': return ClockIcon;
      case 'multitenant_manager': return ServerIcon;
      case 'stock': return DatabaseIcon;
      default: return UsersIcon;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'gradient-danger';
      case 'manager': return 'gradient-accent';
      case 'cashier': return 'gradient-primary';
      case 'supervisor': return 'gradient-warning';
      case 'multitenant_manager': return 'gradient-danger';
      case 'stock': return 'gradient-secondary';
      default: return 'gradient-primary';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-ZA', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: !settings.twentyFourHour
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-ZA', { 
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    if (!settings.showCurrency) return amount.toFixed(2);
    return `R${amount.toFixed(2)}`;
  };

  const dailyTotal = localStorage.getItem('roxton-pos-daily-total');
  const transactionCount = localStorage.getItem('roxton-pos-transaction-count');
  
  const totalSales = dailyTotal ? parseFloat(dailyTotal) : 0;
  const totalTransactions = transactionCount ? parseInt(transactionCount) : 0;

  const RoleIcon = getRoleIcon(appState.currentRole || 'cashier');
  const roleColorClass = getRoleColor(appState.currentRole || 'cashier');

  return (
    <div className="w-full bg-gradient-to-r from-white/95 via-blue-50/90 to-purple-50/95 dark:from-gray-900/95 dark:via-blue-900/90 dark:to-purple-900/95 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/20 shadow-luxury sticky top-0 z-50 my-[5px] mx-[0px] mt-[0px] mr-[0px] mb-[20px] ml-[0px] rounded-l-[30px] rounded-r-[0px] bg-[rgba(90,86,86,1)]">
      <div className="w-full px-4 md:px-6 lg:px-8 py-3">
        {/* Main Header Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Left Section - Brand & User */}
          <div className="flex items-center gap-3 md:gap-6 min-w-0 flex-1">
            {/* Brand Logo */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="relative">
                <div className={`p-2 md:p-3 ${roleColorClass} rounded-xl md:rounded-2xl shadow-luxury animate-float`}>
                  <RoleIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-bounce-soft border-2 border-white dark:border-gray-900"></div>
              </div>
              
              <div className="min-w-0 flex-1">
                <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">
                  Roxton POS Pro
                </h1>
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                  <span className="capitalize font-medium">
                    {appState.user?.name || appState.currentRole || 'User'}
                  </span>
                  <div className="w-1 h-1 bg-gray-400 rounded-full hidden sm:block"></div>
                  <Badge variant="outline" className="text-xs px-2 py-0.5 bg-white/50 dark:bg-gray-800/50">
                    {appState.currentRole?.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Center Section - Stats (Hidden on mobile) */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
            {/* Daily Sales */}
            <div className="flex items-center gap-2 px-3 py-2 glass-card-weak rounded-xl">
              <div className="p-1.5 gradient-secondary rounded-lg">
                <DollarSignIcon className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Today's Sales</p>
                <p className="text-sm font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(totalSales)}
                </p>
              </div>
            </div>

            {/* Transactions */}
            <div className="flex items-center gap-2 px-3 py-2 glass-card-weak rounded-xl">
              <div className="p-1.5 gradient-primary rounded-lg">
                <ActivityIcon className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Transactions</p>
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{totalTransactions}</p>
              </div>
            </div>

            {/* System Status */}
            <div className="flex items-center gap-2 px-3 py-2 glass-card-weak rounded-xl">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <WifiIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-left">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">System</p>
                <p className="text-sm font-bold text-green-600 dark:text-green-400">Online</p>
              </div>
            </div>
          </div>

          {/* Right Section - Time, Actions */}
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            {/* Date & Time */}
            <div className="hidden sm:flex flex-col items-end text-right">
              <div className="flex items-center gap-1 text-sm md:text-base font-bold text-gray-900 dark:text-white">
                <ClockIcon className="w-3 h-3 md:w-4 md:h-4 text-gray-600 dark:text-gray-400" />
                {formatTime(currentTime)}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                <Calendar className="w-3 h-3" />
                {formatDate(currentTime)}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* Support Request Button - Only show for non-multitenant managers */}
              {appState.currentRole !== 'multitenant_manager' && appState.user && (
                <SupportRequestButton
                  userRole={appState.user.role}
                  userName={appState.user.name}
                  userId={appState.user.id}
                  tenantId="default_tenant"
                  tenantName="Default Tenant"
                  variant="outline"
                  size="sm"
                  className="glass-card-weak hover-lift border-0 p-2 md:px-3"
                />
              )}
              
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Settings */}
              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="glass-card-weak hover-lift border-0 p-2 md:px-3"
                  >
                    <SettingsIcon className="w-4 h-4" />
                    <span className="hidden md:inline ml-1">Settings</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card border-0 max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 gradient-primary rounded-lg">
                        <SettingsIcon className="w-6 h-6 text-white" />
                      </div>
                      System Settings
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-6 mt-6">
                    {/* Display Settings */}
                    <Card className="glass-card-weak border-0">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Display & Interface</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Compact Mode
                          </Label>
                          <Switch
                            checked={settings.compactMode}
                            onCheckedChange={(checked) => 
                              saveSettings({ ...settings, compactMode: checked })
                            }
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2">
                            <DollarSignIcon className="w-4 h-4" />
                            Show Currency Symbol
                          </Label>
                          <Switch
                            checked={settings.showCurrency}
                            onCheckedChange={(checked) => 
                              saveSettings({ ...settings, showCurrency: checked })
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2">
                            <ClockIcon className="w-4 h-4" />
                            24-Hour Time Format
                          </Label>
                          <Switch
                            checked={settings.twentyFourHour}
                            onCheckedChange={(checked) => 
                              saveSettings({ ...settings, twentyFourHour: checked })
                            }
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* System Settings */}
                    <Card className="glass-card-weak border-0">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">System Preferences</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2">
                            <BellIcon className="w-4 h-4" />
                            Notifications
                          </Label>
                          <Switch
                            checked={settings.notifications}
                            onCheckedChange={(checked) => 
                              saveSettings({ ...settings, notifications: checked })
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2">
                            <ActivityIcon className="w-4 h-4" />
                            Auto Refresh Data
                          </Label>
                          <Switch
                            checked={settings.autoRefresh}
                            onCheckedChange={(checked) => 
                              saveSettings({ ...settings, autoRefresh: checked })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Auto Logout (minutes)</Label>
                          <Select
                            value={settings.autoLogout.toString()}
                            onValueChange={(value) => 
                              saveSettings({ ...settings, autoLogout: parseInt(value) })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="15">15 minutes</SelectItem>
                              <SelectItem value="30">30 minutes</SelectItem>
                              <SelectItem value="60">1 hour</SelectItem>
                              <SelectItem value="120">2 hours</SelectItem>
                              <SelectItem value="0">Never</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>VAT Rate (%)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="50"
                            step="0.1"
                            value={settings.vatRate}
                            onChange={(e) => 
                              saveSettings({ ...settings, vatRate: parseFloat(e.target.value) || 15 })
                            }
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Language & Currency */}
                    <Card className="glass-card-weak border-0">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Localization</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Language</Label>
                          <Select
                            value={settings.language}
                            onValueChange={(value) => 
                              saveSettings({ ...settings, language: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en-ZA">English (South Africa)</SelectItem>
                              <SelectItem value="af-ZA">Afrikaans</SelectItem>
                              <SelectItem value="zu-ZA">isiZulu</SelectItem>
                              <SelectItem value="xh-ZA">isiXhosa</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Currency</Label>
                          <Select
                            value={settings.currency}
                            onValueChange={(value) => 
                              saveSettings({ ...settings, currency: value })
                            }
                          >
                            <SelectTrigger>
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
                      </CardContent>
                    </Card>

                    {/* Reset Settings */}
                    <div className="pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => {
                          localStorage.removeItem('roxton-pos-settings');
                          setSettings({
                            darkMode: false,
                            notifications: true,
                            autoRefresh: true,
                            currency: 'ZAR',
                            language: 'en-ZA',
                            vatRate: 15,
                            autoLogout: 30,
                            soundEnabled: true,
                            compactMode: false,
                            showCurrency: true,
                            twentyFourHour: true
                          });
                          addNotification({
                            type: 'info',
                            title: 'Settings Reset',
                            message: 'All settings have been reset to defaults',
                            duration: 3000
                          });
                        }}
                        className="w-full"
                      >
                        Reset to Defaults
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Logout */}
              <Button
                onClick={onLogout}
                variant="outline"
                size="sm"
                className="glass-card-weak hover-lift border-0 text-red-600 hover:text-red-700 p-2 md:px-3"
              >
                <LogOutIcon className="w-4 h-4" />
                <span className="hidden lg:inline ml-1">Logout</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Stats Row */}
        <div className="flex lg:hidden items-center justify-center gap-4 mt-3 pt-3 border-t border-white/10 dark:border-gray-700/10">
          <div className="flex items-center gap-2 text-xs">
            <DollarSignIcon className="w-3 h-3 text-green-600" />
            <span className="text-gray-600 dark:text-gray-400">Sales:</span>
            <span className="font-bold text-green-600">{formatCurrency(totalSales)}</span>
          </div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="flex items-center gap-2 text-xs">
            <ActivityIcon className="w-3 h-3 text-blue-600" />
            <span className="text-gray-600 dark:text-gray-400">Transactions:</span>
            <span className="font-bold text-blue-600">{totalTransactions}</span>
          </div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-bold text-green-600">Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}