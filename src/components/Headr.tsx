import { NavLink } from "react-router-dom";

const MENU_ITEMS = [
  { label: "Home", to: "/" },
  { label: "Post", to: "/post" },
  { label: "Help & Support", to: "/help" },
  { label: "Settings", to: "/settings" }
];

export default function Header() {
  return (
    <header className="hidden md:flex w-full items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow z-50">
      <div className="font-bold text-xl text-gray-900">MyApp</div>
      <nav className="flex gap-8">
        {MENU_ITEMS.map(item => (
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
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
