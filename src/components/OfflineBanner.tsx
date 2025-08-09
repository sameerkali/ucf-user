import { useTranslation } from "react-i18next";
import useOnlineStatus from "../hooks/useOnlineStatus";

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const { t } = useTranslation();

  if (isOnline) return null;

  return (
    <div style={{ background: "orange", padding: "8px", textAlign: "center" }}>
      ⚠️ {t("offline")}
    </div>
  );
}
