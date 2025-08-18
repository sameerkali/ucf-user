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
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${BGS.signup_bg})`,
          borderTopRightRadius: "2.5rem",
          borderBottomRightRadius: "2.5rem",
        }}
      >
        <div
          className="absolute inset-0 bg-gradient-to-br from-green-900/80 via-emerald-800/70 to-teal-900/80"
          style={{
            borderTopRightRadius: "2.5rem",
            borderBottomRightRadius: "2.5rem",
          }}
        ></div>

        <div
          className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
          style={{
            borderTopRightRadius: "2.5rem",
            borderBottomRightRadius: "2.5rem",
          }}
        ></div>
      </div>

      <div className="relative z-10 flex flex-col justify-center items-start p-12 text-white">
        <button
          onClick={onBack}
          className="absolute top-8 left-8 p-2 hover:bg-white/10 rounded-full transition-colors"
          style={{ borderRadius: "0.5rem" }}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="max-w-md">
          <h1 className="text-5xl font-light mb-6 leading-tight">
            {t("signupLeftTitle")}
            <br />
            <span className="font-bold text-green-300">
              {t("signupLeftHighlight")}
            </span>
          </h1>
          <p className="text-lg text-green-100 opacity-90">
            {t("signupLeftDescription")}
          </p>
        </div>
      </div>
    </div>
  );
};