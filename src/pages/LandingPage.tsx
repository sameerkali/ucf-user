import { Link } from "react-router-dom";
import { BGS } from "../assets/assets";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { useEffect } from "react";
import { preloadImages } from "../utils/preload";

export default function HomePage() {
  const { t, i18n } = useTranslation();

    useEffect(() => {
    console.log("fetching images for preload");
    preloadImages({
      signup_bg: BGS.signup_bg,
      login_bg: BGS.login_bg,
    });
  }, []);


  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'hi' : 'en');
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center p-4 antialiased bg-cover bg-center"
      style={{ 
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${BGS.home_bg})`
      }}
    >
      <div className="absolute top-8 right-8 z-20">
        <button
          onClick={toggleLanguage}
          className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-200"
        >
          <Globe className="w-4 h-4" />
          <span className="font-medium">
            {i18n.language === 'en' ? 'हिंदी' : 'English'}
          </span>
        </button>
      </div>

      <div className="relative z-10 max-w-4xl w-full mx-auto text-center px-4">
        <h1 
          className="text-5xl md:text-6xl font-bold text-white mb-4" 
          style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}
        >
          {t("welcome")}
        </h1>

        <p 
          className="text-xl text-gray-200 mb-12" 
          style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
        >
          {t("subtitle")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link to="/login?role=kisaan" className="group">
            <div className="h-full flex flex-col justify-between bg-black/40 backdrop-blur-sm rounded-xl shadow-lg p-8 transform transition-all duration-300 ease-in-out border border-gray-400/30 hover:border-green-400 hover:shadow-green-400/30 hover:shadow-2xl hover:-translate-y-2">
              <div>
                <h2 
                  className="text-4xl font-bold text-white mb-3 tracking-wide text-left" 
                  style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}
                >
                  {t("kisaan")}
                </h2>
                <p 
                  className="text-gray-200 text-left mb-6" 
                  style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
                >
                  {t("kisaanDesc")}
                </p>
              </div>
              <div className="flex justify-end items-center text-green-400 mt-4">
                <span 
                  className="font-semibold mr-2 text-lg" 
                  style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
                >
                  {t("enterPortal")}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </Link>

          <Link to="/login?role=pos" className="group">
            <div className="h-full flex flex-col justify-between bg-black/40 backdrop-blur-sm rounded-xl shadow-lg p-8 transform transition-all duration-300 ease-in-out border border-gray-400/30 hover:border-blue-400 hover:shadow-blue-400/30 hover:shadow-2xl hover:-translate-y-2">
              <div>
                <h2 
                  className="text-4xl font-bold text-white mb-3 tracking-wide text-left" 
                  style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}
                >
                  {t("pos")}
                </h2>
                <p 
                  className="text-gray-200 text-left mb-6" 
                  style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
                >
                  {t("posDesc")}
                </p>
              </div>
              <div className="flex justify-end items-center text-blue-400 mt-4">
                <span 
                  className="font-semibold mr-2 text-lg" 
                  style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
                >
                  {t("enterPortal")}
                </span>
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
