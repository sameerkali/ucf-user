import { Download, X } from "lucide-react";
import { useState } from "react";
import usePWAInstallPrompt from "../hooks/usePWAInstallPrompt";

export default function InstallBanner() {
  const { isInstallable, promptInstall } = usePWAInstallPrompt();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isInstallable || isDismissed) return null;

  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 md:p-4 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 md:gap-4">
        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
          <div className="p-1.5 md:p-2 bg-white/10 rounded-full flex-shrink-0">
            <Download className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-xs md:text-sm truncate">Get the full experience</p>
            <p className="text-xs md:text-sm text-blue-100 truncate">Install our app for faster access and offline use</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          <button
            onClick={promptInstall}
            className="bg-white text-blue-700 px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-medium text-xs md:text-sm hover:bg-blue-50 transition-colors whitespace-nowrap"
          >
            Install Now
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 md:p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-3 h-3 md:w-4 md:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
