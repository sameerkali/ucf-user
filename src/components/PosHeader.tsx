import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

const POS_MENU_ITEMS = [
  { labelKey: "home", to: "/pos/home" },
  { labelKey: "transactions", to: "/pos/transactions" },
  { labelKey: "helpSupport", to: "/pos/help" },
  { labelKey: "settings", to: "/pos/settings" }
];

export default function PosHeader() {
  const { t } = useTranslation();

  return (
    <header className="hidden md:flex w-full items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow z-50">
        <Link to={`/`}><div className="font-bold text-xl text-gray-900">{t("appName")}</div></Link>
      <nav className="flex gap-8">
        {POS_MENU_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              "px-3 py-2 text-sm font-medium transition-colors duration-150 border-b-2 " +
              (isActive
                ? "text-blue-600 border-blue-600"
                : "text-gray-600 hover:text-blue-500 border-transparent hover:border-blue-300")
            }
          >
            {t(item.labelKey)}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
