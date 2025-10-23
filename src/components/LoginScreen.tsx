import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { UserIcon, ShieldIcon, CrownIcon, PackageIcon, SparklesIcon, StoreIcon, ClipboardCheckIcon, ServerIcon } from "lucide-react";

interface LoginScreenProps {
  onRoleSelect: (role: string) => void;
}

export function LoginScreen({ onRoleSelect }: LoginScreenProps) {
  const roles = [
    {
      id: 'cashier',
      title: 'Cashier',
      description: 'Process sales transactions and customer payments',
      icon: UserIcon,
      gradient: 'gradient-primary',
      shadowColor: 'shadow-blue-500/30',
      delay: 100
    },
    {
      id: 'admin',
      title: 'Administrator',
      description: 'Manage users, settings and system configuration',
      icon: ShieldIcon,
      gradient: 'gradient-danger',
      shadowColor: 'shadow-red-500/30',
      delay: 200
    },
    {
      id: 'manager',
      title: 'Manager',
      description: 'Access reports, analytics and business insights',
      icon: CrownIcon,
      gradient: 'gradient-accent',
      shadowColor: 'shadow-purple-500/30',
      delay: 300
    },
    {
      id: 'supervisor',
      title: 'Supervisor',
      description: 'Oversee staff performance and stock operations',
      icon: ClipboardCheckIcon,
      gradient: 'gradient-warning',
      shadowColor: 'shadow-orange-500/30',
      delay: 400
    },
    {
      id: 'multitenant_manager',
      title: 'System Manager',
      description: 'Oversee all tenants, vendors, and system operations',
      icon: ServerIcon,
      gradient: 'gradient-danger',
      shadowColor: 'shadow-red-500/30',
      delay: 500
    },
    {
      id: 'stock',
      title: 'Stock Controller',
      description: 'Manage inventory, stock levels and warehouse operations',
      icon: PackageIcon,
      gradient: 'gradient-secondary',
      shadowColor: 'shadow-green-500/30',
      delay: 600
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-green-400/20 to-blue-600/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-2xl animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="container-optimized relative z-10 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-16 animate-slide-down">
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <div className="p-6 bg-white rounded-3xl shadow-luxury animate-morphing">
                <StoreIcon className="w-16 h-16 text-blue-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-bounce-soft"></div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent animate-shimmer bg-300% animate-typewriter animate-bounce-from-top overflow-hidden whitespace-nowrap border-r-2 border-blue-600 pr-2">
              Roxton POS Pro
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.5s' }}>
              Welcome to your comprehensive Point of Sale solution. Choose your role to access your personalized dashboard and begin managing your business with ease.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 animate-fade-in" style={{ animationDelay: '0.7s' }}>
              <SparklesIcon className="w-4 h-4" />
              <span>Powered by Advanced Technology</span>
              <SparklesIcon className="w-4 h-4" />
            </div>
          </div>
        </div>
        
        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-6">
          {roles.map((role) => {
            const IconComponent = role.icon;
            return (
              <Card 
                key={role.id} 
                className={`group cursor-pointer glass-card border-0 hover-lift hover-glow relative overflow-hidden animate-slide-up`}
                style={{ animationDelay: `${role.delay}ms` }}
                onClick={() => onRoleSelect(role.id)}
              >
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <CardHeader className="text-center pb-4 relative z-10">
                  <div className={`w-24 h-24 rounded-2xl ${role.gradient} flex items-center justify-center mx-auto mb-6 shadow-luxury group-hover:scale-110 transition-all duration-500 relative overflow-hidden`}>
                    <IconComponent className="w-12 h-12 text-white relative z-10" />
                    <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <CardTitle className="text-2xl mb-3 group-hover:text-blue-600 transition-colors duration-300 font-semibold">
                    {role.title}
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                    {role.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0 relative z-10 m-[10px] mx-[10px] my-[20px]">
                  <Button 
                    className={`w-full ${role.gradient} text-white shadow-luxury hover:shadow-premium transition-all duration-500 px-6 py-5 text-base font-medium relative overflow-hidden group/button`}
                  >
                    <span className="relative z-10">Access {role.title} Portal</span>
                    <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover/button:scale-x-100 transition-transform duration-500 origin-left"></div>
                  </Button>
                </CardContent>
                
                {/* Hover effect overlay */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full transform translate-x-16 -translate-y-16 group-hover:translate-x-8 group-hover:-translate-y-8 transition-transform duration-700"></div>
              </Card>
            );
          })}
        </div>
        
        {/* Footer Section */}
        <div className="text-center mt-16 space-y-4 animate-fade-in" style={{ animationDelay: '1s' }}>
          <div className="flex items-center justify-center gap-6 text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Secure</span>
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <span>Reliable</span>
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              <span>Professional</span>
            </div>
          </div>
          
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Optimized for South African businesses • ZAR Currency Support • VAT Compliant
          </p>
        </div>
      </div>
    </div>
  );
}