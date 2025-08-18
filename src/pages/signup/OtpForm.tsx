import React from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import type { FormData } from "./signup.type";

interface OtpFormProps {
  formData: FormData;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onOtpChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBackToSignup: () => void;
}

export const OtpForm: React.FC<OtpFormProps> = ({
  formData,
  isLoading,
  onSubmit,
  onOtpChange,
  onBackToSignup,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-white mb-2">
          {t("verifyOTP")}
        </h2>
        <p className="text-gray-400 text-sm mb-2">{t("otpDescription")}</p>
        <p className="text-white font-medium">{formData.email}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <input
            type="text"
            placeholder="000000"
            value={formData.otp}
            onChange={onOtpChange}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors text-center text-lg font-mono tracking-widest"
            style={{ borderRadius: "0.75rem" }}
            maxLength={6}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:from-green-700 hover:to-emerald-700 focus:outline-none transition-all duration-200 flex items-center justify-center"
          style={{ borderRadius: "0.75rem" }}
        >
          {isLoading ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : (
            t("createAccount")
          )}
        </button>

        <button
          type="button"
          onClick={onBackToSignup}
          className="w-full text-green-500 hover:text-green-400 text-sm transition-colors"
        >
          {t("resendOTP")}
        </button>
      </form>
    </>
  );
};