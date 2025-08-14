import { Link } from "react-router-dom";
import { BGS } from "../assets/assets";

export default function HomePage() {

  return (
    <div
  className="min-h-screen flex flex-col justify-center items-center p-4 antialiased bg-cover bg-center"
  style={{ 
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${BGS.home_bg})`
  }}
    >
      <div className="relative z-10 max-w-4xl w-full mx-auto text-center px-4">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
          Welcome to AgriConnect
        </h1>

        <p className="text-xl text-gray-200 mb-12" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
          Your all-in-one platform for modern agriculture.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link to="/kisaan-login" className="group">
            <div className="h-full flex flex-col justify-between bg-black/40 backdrop-blur-sm rounded-xl shadow-lg p-8 transform transition-all duration-300 ease-in-out border border-gray-400/30 hover:border-green-400 hover:shadow-green-400/30 hover:shadow-2xl hover:-translate-y-2">
              <div>
                <h2 className="text-4xl font-bold text-white mb-3 tracking-wide text-left" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                  Kisaan
                </h2>
                <p className="text-gray-200 text-left mb-6" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                  Access your farmer portal for services and information.
                </p>
              </div>
              <div className="flex justify-end items-center text-green-400 mt-4">
                <span className="font-semibold mr-2 text-lg" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>Enter Portal</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </Link>

          <Link to="/pos-login" className="group">
            <div className="h-full flex flex-col justify-between bg-black/40 backdrop-blur-sm rounded-xl shadow-lg p-8 transform transition-all duration-300 ease-in-out border border-gray-400/30 hover:border-blue-400 hover:shadow-blue-400/30 hover:shadow-2xl hover:-translate-y-2">
              <div>
                <h2 className="text-4xl font-bold text-white mb-3 tracking-wide text-left" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                  POS
                </h2>
                <p className="text-gray-200 text-left mb-6" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                  Login for Point of Sale operators and store managers.
                </p>
              </div>
              <div className="flex justify-end items-center text-blue-400 mt-4">
                <span className="font-semibold mr-2 text-lg" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>Enter Portal</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
