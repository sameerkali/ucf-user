import { NavLink } from "react-router-dom";
import { Home, Pencil, HelpCircle, Settings } from "lucide-react";

const MENU_ITEMS = [
  { label: "Home", to: "/", icon: Home },
  { label: "Post", to: "/post", icon: Pencil },
  { label: "Help & Support", to: "/help", icon: HelpCircle },
  { label: "Settings", to: "/settings", icon: Settings }
];

export default function Header() {
  return (
    <header className="hidden md:flex w-full items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow z-50">
      <div className="font-bold text-xl">MyApp</div>
      <nav className="flex gap-6">
        {MENU_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              "flex items-center gap-1 text-sm transition-colors duration-150 " +
              (isActive
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-300 hover:text-blue-500")
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
