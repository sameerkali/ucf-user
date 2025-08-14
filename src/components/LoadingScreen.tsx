import React from 'react';
import { useTranslation } from 'react-i18next';

const LoadingScreen: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div 
      className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{ backgroundColor: '#FAF9F6' }}
    >
      {/* Logo/Brand Section */}
      <div className="mb-8">
        <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-4">
          <span className="text-white text-2xl font-bold">K</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 text-center">Kisaan App</h1>
      </div>

      {/* Loading Animation */}
      <div className="relative">
        {/* Spinning Circle */}
        <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
        
        {/* Pulsing Dots */}
        <div className="flex space-x-2 mt-6 justify-center">
          <div className="w-3 h-3 bg-gray-900 rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-gray-900 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-gray-900 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>

      {/* Loading Text */}
      <p className="text-gray-600 mt-6 text-sm animate-pulse">
        {t("loadingApp") || "Loading your farming dashboard..."}
      </p>

      {/* Progress Bar */}
      <div className="w-64 bg-gray-200 rounded-full h-1 mt-4">
        <div className="bg-gray-900 h-1 rounded-full animate-pulse" style={{ width: '100%' }}></div>
      </div>
    </div>
  );
};

export default LoadingScreen;
