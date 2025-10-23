import { generateBuildNumber, generateUptime, generateMemoryUsage } from "../utils/app-helpers";

export function AppSystemStats() {
  return (
    <div className="fixed bottom-2 left-2 z-30 opacity-0 hover:opacity-100 transition-opacity duration-300">
      <div className="glass-card-weak p-2 rounded-lg text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <div>Build: {generateBuildNumber()}</div>
        <div>Uptime: {generateUptime()}</div>
        <div>Memory: {generateMemoryUsage()}</div>
      </div>
    </div>
  );
}