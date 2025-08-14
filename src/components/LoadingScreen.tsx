import React from "react";
import { useTranslation } from "react-i18next";

const LoadingScreen: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{
        background: "linear-gradient(135deg, #10b981, #059669, #047857)",
      }}
    >
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-2 opacity-0 animate-fadeInUp">
          UCF
        </h1>
        <p
          className="text-emerald-100 text-lg opacity-0 animate-fadeInUp"
          style={{ animationDelay: "0.5s" }}
        >
          {t("digital Agriculture Platform") || "Digital Agriculture Platform"}
        </p>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 1.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
