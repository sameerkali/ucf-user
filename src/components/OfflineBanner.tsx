import { WifiOff, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import useOnlineStatus from "../hooks/useOnlineStatus";

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const { t } = useTranslation();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isOnline || isDismissed) return null;

  return (
    <div className="bg-orange-500 text-white px-4 py-3 md:py-4 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="p-1.5 md:p-2 bg-white/20 rounded-full">
            <WifiOff className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <span className="text-sm md:text-base font-medium">{t("offline")}</span>
        </div>
        
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1.5 md:p-2 hover:bg-white/10 rounded transition-colors"
          aria-label="Dismiss offline notice"
        >
          <X className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>
    </div>
  );
}
