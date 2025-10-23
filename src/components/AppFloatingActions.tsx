import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useNotifications } from "./NotificationSystem";
import { type SystemStatus } from "../utils/app-constants";
import { TrendingUpIcon, ZapIcon } from "lucide-react";

interface AppFloatingActionsProps {
  systemStatus: SystemStatus;
}

export function AppFloatingActions({ systemStatus }: AppFloatingActionsProps) {
  const { addNotification } = useNotifications();

  return (
    <div className="fixed bottom-6 right-6 z-40 space-y-3">
      {/* System Health Quick View */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="glass-card p-3 rounded-xl shadow-luxury animate-slide-up cursor-pointer hover-lift-advanced">
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${systemStatus.isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
              <span className="text-gray-700 dark:text-gray-300 font-medium">{systemStatus.todaysTransactions}</span>
              <TrendingUpIcon className="w-3 h-3 text-green-500" />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Today's Transactions: {systemStatus.todaysTransactions}</p>
        </TooltipContent>
      </Tooltip>

      {/* Main Action Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="w-16 h-16 rounded-full gradient-primary shadow-ultimate hover:shadow-premium transition-all duration-300 hover-lift-advanced animate-float group"
            onClick={() => addNotification({
              type: 'info',
              title: 'Quick Action',
              message: 'Advanced features coming soon!',
              duration: 3000
            })}
          >
            <ZapIcon className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Quick Actions Menu</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}