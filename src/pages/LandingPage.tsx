import { useNavigate } from "react-router-dom";
import { User, Store } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ backgroundColor: '#FAF9F6' }}>
      {/* Kisaan Section */}
      <div
        onClick={() => navigate("/kisaan-auth")}
        className="flex-1 bg-gradient-to-br from-green-50 to-green-100 p-8 flex flex-col justify-center items-center cursor-pointer hover:from-green-100 hover:to-green-200 transition-all"
      >
        <div className="text-center max-w-sm">
          <div className="p-4 bg-white rounded-full shadow-sm mb-6 inline-block">
            <User className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Kisaan Login</h2>
          <p className="text-gray-700 mb-6">Access your farming dashboard and agricultural tools</p>
         
        </div>
      </div>

      {/* POS Section */}
      <div
        onClick={() => navigate("/pos-auth")}
        className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100 p-8 flex flex-col justify-center items-center cursor-pointer hover:from-blue-100 hover:to-blue-200 transition-all"
      >
        <div className="text-center max-w-sm">
          <div className="p-4 bg-white rounded-full shadow-sm mb-6 inline-block">
            <Store className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">POS Login</h2>
          <p className="text-gray-700 mb-6">Manage your retail operations and point of sale system</p>
          
        </div>
      </div>
    </div>
  );
}
