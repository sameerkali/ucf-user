import { User } from "lucide-react";
import { GLOBLE } from "../assets/assets";
import { useNavigate } from "react-router-dom";

export default function MobileHeader() {
  const navigate = useNavigate();

  const handleUserClick = () => {
    navigate("/kisaan/profile");
  };

  const handleAppIconClick = () => {
    console.log("App icon clicked");
  };

  return (
    <header
      className="z-30 md:hidden fixed left-0 right-0 bg-white shadow-md border-b border-gray-200"
      style={{ top: "var(--banner-height, 0px)" }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={handleAppIconClick}
          className="focus:outline-none focus:ring-2 focus:ring-green-500 rounded-lg p-1"
        >
          <img
            src={GLOBLE.ucf_logo}
            alt="App Logo"
            className="w-10 h-10 object-contain"
          />
        </button>
        <button
          onClick={handleUserClick}
          className="focus:outline-none focus:ring-2 focus:ring-green-500 rounded-full p-1"
        >
          <User className="w-8 h-8 text-gray-600" />
        </button>
      </div>
    </header>
  );
}
