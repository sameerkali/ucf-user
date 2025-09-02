import { AlertTriangle, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useVerificationStatus } from "../hooks/useVerificationStatus";

export default function VerificationPendingBanner() {
  const { t } = useTranslation();
  const isPending = useVerificationStatus();
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const bannerRef = useRef<HTMLDivElement | null>(null);

  // Update CSS variable with banner height
  useEffect(() => {
    if (bannerRef.current && !isDismissed && isPending) {
      const height = bannerRef.current.offsetHeight;
      document.documentElement.style.setProperty("--banner-height", `${height}px`);
    } else {
      document.documentElement.style.setProperty("--banner-height", `0px`);
    }
  }, [isPending, isDismissed]);

  if (!isPending || isDismissed) return null;

  return (
    <div
      ref={bannerRef}
      className="fixed top-0 left-0 right-0 bg-yellow-500 text-white px-4 py-3 md:py-4 shadow-sm z-40"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="p-1.5 md:p-2 bg-white/20 rounded-full">
            <AlertTriangle className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <span className="text-sm md:text-base font-medium">
            {t("verificationPending", "Verification pending from POS")}
          </span>
        </div>

        <button
          onClick={() => setIsDismissed(true)}
          className="p-1.5 md:p-2 hover:bg-white/10 rounded transition-colors"
          aria-label="Dismiss verification notice"
        >
          <X className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>
    </div>
  );
}
