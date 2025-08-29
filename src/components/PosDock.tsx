import { NavLink } from "react-router-dom";
import { Home, CreditCard, Settings, HelpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

const POS_DOCK_ITEMS = [
  { labelKey: "home", to: "/pos/home", icon: Home },
  { labelKey: "transactions", to: "/pos/transactions", icon: CreditCard },
  { labelKey: "helpSupport", to: "/pos/help", icon: HelpCircle },
  { labelKey: "settings", to: "/pos/settings", icon: Settings }
];

export default function PosDock() {
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full bg-white border-t border-gray-200 shadow-sm flex items-center justify-around px-1 py-2 md:hidden">
      {POS_DOCK_ITEMS.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            "flex flex-col items-center justify-center text-xs transition-colors duration-150 py-1 px-2 border-b-2 " +
            (isActive
              ? "text-blue-600 border-blue-600"
              : "text-gray-500 hover:text-gray-700 border-transparent hover:border-blue-400")
          }
        >
          <item.icon className="h-6 w-6 mb-0.5" />
          <span>{t(item.labelKey)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
