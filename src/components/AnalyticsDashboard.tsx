import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useNotifications } from "./NotificationSystem";
import { cashierAPI } from "../utils/cashier-api";
import {
  BarChart3Icon,
  PieChartIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  DollarSignIcon,
  ShoppingCartIcon,
  UsersIcon,
  PackageIcon,
  CalendarIcon,
  DownloadIcon,
  RefreshCwIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ActivityIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from "lucide-react";

interface AnalyticsData {
  dailySales: {
    today: number;
    yesterday: number;
    thisWeek: number;
    thisMonth: number;
    change: number;
  };
  transactions: {
    today: number;
    yesterday: number;
    thisWeek: number;
    thisMonth: number;
    change: number;
  };
  topProducts: Array<{
    name: string;
    sales: number;
    quantity: number;
    revenue: number;
  }>;
  categoryPerformance: Array<{
    category: string;
    sales: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  hourlyData: Array<{
    hour: number;
    sales: number;
    transactions: number;
  }>;
  paymentMethods: Array<{
    method: string;
    amount: number;
    percentage: number;
  }>;
}

interface AnalyticsDashboardProps {
  role?: string;
  dateRange?: string;
}

export function AnalyticsDashboard({ role = 'admin', dateRange = '7d' }: AnalyticsDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(dateRange);
  const { addNotification } = useNotifications();

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      // Get current daily sales
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      const [todayData, yesterdayData] = await Promise.all([
        cashierAPI.getDailySales(today),
        cashierAPI.getDailySales(yesterday)
      ]);

      // Generate mock analytics data (in production, this would come from your analytics API)
      const mockData: AnalyticsData = {
        dailySales: {
          today: todayData.success ? todayData.data.totalSales : 0,
          yesterday: yesterdayData.success ? yesterdayData.data.totalSales : 0,
          thisWeek: (todayData.success ? todayData.data.totalSales : 0) * 5.2,
          thisMonth: (todayData.success ? todayData.data.totalSales : 0) * 23.5,
          change: 12.5
        },
        transactions: {
          today: todayData.success ? todayData.data.totalTransactions : 0,
          yesterday: yesterdayData.success ? yesterdayData.data.totalTransactions : 0,
          thisWeek: (todayData.success ? todayData.data.totalTransactions : 0) * 6.1,
          thisMonth: (todayData.success ? todayData.data.totalTransactions : 0) * 28.3,
          change: 8.3
        },
        topProducts: [
          { name: "Premium Coffee", sales: 156, quantity: 78, revenue: 1989.0 },
          { name: "Artisan Sandwich", sales: 142, quantity: 89, revenue: 4087.8 },
          { name: "Fresh Smoothie", sales: 134, quantity: 67, revenue: 2606.3 },
          { name: "Energy Boost", sales: 98, quantity: 45, revenue: 1030.5 },
          { name: "Dark Chocolate", sales: 87, quantity: 34, revenue: 969.5 }
        ],
        categoryPerformance: [
          { category: "Beverages", sales: 45230, percentage: 38.2, trend: 'up' },
          { category: "Food", sales: 34890, percentage: 29.5, trend: 'up' },
          { category: "Snacks", sales: 28450, percentage: 24.1, trend: 'stable' },
          { category: "Personal Care", sales: 9650, percentage: 8.2, trend: 'down' }
        ],
        hourlyData: [
          { hour: 8, sales: 450, transactions: 12 },
          { hour: 9, sales: 890, transactions: 23 },
          { hour: 10, sales: 1250, transactions: 34 },
          { hour: 11, sales: 1680, transactions: 45 },
          { hour: 12, sales: 2340, transactions: 67 },
          { hour: 13, sales: 2890, transactions: 78 },
          { hour: 14, sales: 2650, transactions: 71 },
          { hour: 15, sales: 2120, transactions: 58 },
          { hour: 16, sales: 1890, transactions: 52 },
          { hour: 17, sales: 1560, transactions: 43 }
        ],
        paymentMethods: [
          { method: "Card", amount: 15678.90, percentage: 68.5 },
          { method: "Cash", amount: 5432.10, percentage: 23.7 },
          { method: "Mobile", amount: 1789.50, percentage: 7.8 }
        ]
      };

      setAnalyticsData(mockData);
      
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Analytics Load Failed',
        message: 'Unable to load analytics data',
        duration: 4000
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const generateReport = async (reportType: string) => {
    try {
      addNotification({
        type: 'info',
        title: 'Generating Report',
        message: `Creating ${reportType} report...`,
        duration: 3000
      });

      // Simulate report generation
      setTimeout(() => {
        addNotification({
          type: 'success',
          title: 'Report Ready',
          message: `${reportType} report has been downloaded`,
          duration: 4000
        });
      }, 2000);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Report Failed',
        message: 'Unable to generate report',
        duration: 4000
      });
    }
  };

  const formatCurrency = (amount: number) => `R${amount.toFixed(2)}`;

  if (isLoading || !analyticsData) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <Card key={i} className="glass-card shadow-luxury border-0 animate-pulse">
            <CardContent className="p-8">
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">Comprehensive business insights and performance metrics</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Today</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 3 Months</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            onClick={loadAnalyticsData}
            variant="outline"
            className="hover-lift"
          >
            <RefreshCwIcon className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          
          <Button
            onClick={() => generateReport('complete-analytics')}
            className="gradient-primary text-white hover-lift"
          >
            <DownloadIcon className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card shadow-luxury border-0 hover-lift animate-scale-in">
          <CardContent className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Today's Sales</p>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(analyticsData.dailySales.today)}</p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUpIcon className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">+{analyticsData.dailySales.change}%</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-2xl">
                <DollarSignIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card shadow-luxury border-0 hover-lift animate-scale-in" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Transactions</p>
                <p className="text-3xl font-bold text-blue-600">{analyticsData.transactions.today}</p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUpIcon className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-600 font-medium">+{analyticsData.transactions.change}%</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-2xl">
                <ShoppingCartIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card shadow-luxury border-0 hover-lift animate-scale-in" style={{ animationDelay: '200ms' }}>
          <CardContent className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Average Order</p>
                <p className="text-3xl font-bold text-purple-600">
                  {formatCurrency(analyticsData.dailySales.today / (analyticsData.transactions.today || 1))}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUpIcon className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-purple-600 font-medium">+3.2%</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-2xl">
                <BarChart3Icon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card shadow-luxury border-0 hover-lift animate-scale-in" style={{ animationDelay: '300ms' }}>
          <CardContent className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Weekly Sales</p>
                <p className="text-3xl font-bold text-orange-600">{formatCurrency(analyticsData.dailySales.thisWeek)}</p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUpIcon className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-orange-600 font-medium">+15.7%</span>
                </div>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-2xl">
                <TrendingUpIcon className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white shadow-elegant p-2 h-16">
          <TabsTrigger value="overview" className="flex items-center gap-3 text-base py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
            <BarChart3Icon className="w-5 h-5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center gap-3 text-base py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white">
            <DollarSignIcon className="w-5 h-5" />
            Sales
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-3 text-base py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
            <PackageIcon className="w-5 h-5" />
            Products
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-3 text-base py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white">
            <ActivityIcon className="w-5 h-5" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 animate-slide-up">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hourly Performance */}
            <Card className="glass-card shadow-luxury border-0 hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 gradient-primary rounded-lg">
                    <ClockIcon className="w-6 h-6 text-white" />
                  </div>
                  Hourly Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {analyticsData.hourlyData.slice(-6).map((data, index) => (
                    <div key={data.hour} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                          {data.hour}:00
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(data.sales)}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{data.transactions} transactions</p>
                        </div>
                      </div>
                      <Progress 
                        value={(data.sales / Math.max(...analyticsData.hourlyData.map(d => d.sales))) * 100} 
                        className="w-24 h-3"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card className="glass-card shadow-luxury border-0 hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 gradient-secondary rounded-lg">
                    <PieChartIcon className="w-6 h-6 text-white" />
                  </div>
                  Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {analyticsData.paymentMethods.map((method, index) => (
                    <div key={method.method} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900 dark:text-white">{method.method}</span>
                        <div className="text-right">
                          <span className="font-bold text-green-600">{formatCurrency(method.amount)}</span>
                          <p className="text-sm text-gray-500">{method.percentage}%</p>
                        </div>
                      </div>
                      <Progress value={method.percentage} className="h-3" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-6 animate-slide-up">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Comparison */}
            <Card className="glass-card shadow-luxury border-0 hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 gradient-primary rounded-lg">
                    <TrendingUpIcon className="w-6 h-6 text-white" />
                  </div>
                  Sales Comparison
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Today</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(analyticsData.dailySales.today)}</p>
                    </div>
                    <CheckCircleIcon className="w-8 h-8 text-green-600" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Yesterday</p>
                      <p className="text-2xl font-bold text-blue-600">{formatCurrency(analyticsData.dailySales.yesterday)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {analyticsData.dailySales.today > analyticsData.dailySales.yesterday ? (
                        <ArrowUpIcon className="w-5 h-5 text-green-600" />
                      ) : (
                        <ArrowDownIcon className="w-5 h-5 text-red-600" />
                      )}
                      <span className={`text-sm font-medium ${analyticsData.dailySales.today > analyticsData.dailySales.yesterday ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(((analyticsData.dailySales.today - analyticsData.dailySales.yesterday) / analyticsData.dailySales.yesterday) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">This Week</p>
                      <p className="text-2xl font-bold text-purple-600">{formatCurrency(analyticsData.dailySales.thisWeek)}</p>
                    </div>
                    <ActivityIcon className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Performance */}
            <Card className="glass-card shadow-luxury border-0 hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 gradient-secondary rounded-lg">
                    <PieChartIcon className="w-6 h-6 text-white" />
                  </div>
                  Category Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {analyticsData.categoryPerformance.map((category, index) => (
                    <div key={category.category} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray-900 dark:text-white">{category.category}</span>
                          <Badge className={`text-xs ${
                            category.trend === 'up' ? 'bg-green-100 text-green-800' :
                            category.trend === 'down' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {category.trend === 'up' ? '↑' : category.trend === 'down' ? '↓' : '→'} {category.trend}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{formatCurrency(category.sales)}</p>
                          <p className="text-sm text-gray-500">{category.percentage}%</p>
                        </div>
                      </div>
                      <Progress value={category.percentage} className="h-3" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6 animate-slide-up">
          <Card className="glass-card shadow-luxury border-0 hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 gradient-primary rounded-lg">
                  <PackageIcon className="w-6 h-6 text-white" />
                </div>
                Top Performing Products
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {analyticsData.topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between p-4 glass-card-weak rounded-lg hover-lift">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{product.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{product.quantity} units sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{formatCurrency(product.revenue)}</p>
                      <p className="text-sm text-gray-500">{product.sales} sales</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Performance Insights */}
            <Card className="glass-card shadow-luxury border-0 hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 gradient-success rounded-lg">
                    <CheckCircleIcon className="w-5 h-5 text-white" />
                  </div>
                  Performance Highlights
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      ✓ Sales up {analyticsData.dailySales.change}% from yesterday
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      ✓ Best sales hour: 1:00 PM
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-sm text-purple-800 dark:text-purple-200">
                      ✓ Top category: Beverages (38.2%)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="glass-card shadow-luxury border-0 hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 gradient-warning rounded-lg">
                    <AlertTriangleIcon className="w-5 h-5 text-white" />
                  </div>
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <p className="text-sm text-orange-800 dark:text-orange-200">
                      ⚠️ Consider restocking Energy Boost
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      💡 Promote combos during 12-2 PM
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-sm text-purple-800 dark:text-purple-200">
                      📈 Focus on Personal Care growth
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="glass-card shadow-luxury border-0 hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 gradient-primary rounded-lg">
                    <ActivityIcon className="w-5 h-5 text-white" />
                  </div>
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <Button 
                  onClick={() => generateReport('daily-summary')}
                  variant="outline" 
                  className="w-full justify-start hover-lift"
                >
                  <DownloadIcon className="w-4 h-4 mr-2" />
                  Daily Summary Report
                </Button>
                <Button 
                  onClick={() => generateReport('product-analysis')}
                  variant="outline" 
                  className="w-full justify-start hover-lift"
                >
                  <PackageIcon className="w-4 h-4 mr-2" />
                  Product Analysis
                </Button>
                <Button 
                  onClick={() => generateReport('financial-overview')}
                  variant="outline" 
                  className="w-full justify-start hover-lift"
                >
                  <DollarSignIcon className="w-4 h-4 mr-2" />
                  Financial Overview
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}