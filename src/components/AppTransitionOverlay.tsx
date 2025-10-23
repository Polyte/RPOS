interface AppTransitionOverlayProps {
  isVisible: boolean;
}

export function AppTransitionOverlay({ isVisible }: AppTransitionOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="glass-card-strong p-8 rounded-3xl shadow-ultimate max-w-sm w-full mx-4">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-2 w-12 h-12 border-4 border-purple-500/30 border-b-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Transitioning...</h3>
            <p className="text-gray-600 dark:text-gray-400">Preparing your workspace</p>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-shimmer bg-200%"></div>
          </div>
        </div>
      </div>
    </div>
  );
}