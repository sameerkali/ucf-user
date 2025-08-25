import React from "react";
import { ArrowLeft } from "lucide-react";
import { BGS } from "../../assets/assets";
import { useTranslation } from "react-i18next";

interface LeftPanelProps {
  onBack: () => void;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({ onBack }) => {
  const { t } = useTranslation();

  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden shadow-lg">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${BGS.signup_bg})`,
          borderTopRightRadius: "2.5rem",
          borderBottomRightRadius: "2.5rem",
        }}
      />
      <div className="relative z-10 flex flex-col justify-center items-start p-12 text-gray-900">
        <button
          onClick={onBack}
          className="absolute top-8 left-8 p-2 hover:bg-gray-100 rounded-full transition-colors"
          style={{ borderRadius: "0.5rem" }}
        >
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <div className="max-w-md">
          <h1 className="text-5xl font-light mb-6 leading-tight">
            {t("signupLeftTitle")} <br />
            <span className="font-bold text-green-600">
              {t("signupLeftHighlight")}
            </span>
          </h1>
          <p className="text-lg text-green-900 opacity-90">
            {t("signupLeftDescription")}
          </p>
        </div>
      </div>
    </div>
  );
};