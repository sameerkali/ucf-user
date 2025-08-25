import React from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import type { FormData, FormErrors } from "./signup.type";

interface PosSignupFormProps {
  formData: FormData;
  errors: FormErrors;
  agreeToTerms: boolean;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onNameChange: (field: string, value: string) => void;
  onAddressChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGstChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAgreeToTermsChange: (checked: boolean) => void;
}

export const PosSignupForm: React.FC<PosSignupFormProps> = ({
  formData,
  errors,
  agreeToTerms,
  isLoading,
  onSubmit,
  onNameChange,
  onAddressChange,
  onEmailChange,
  onGstChange,
  onAgreeToTermsChange,
}) => {
  const { t } = useTranslation();

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <input
          type="text"
          placeholder={t("businessName")}
          value={formData.name}
          onChange={(e) => onNameChange("name", e.target.value)}
          className="w-full px-4 py-3 bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
          style={{ borderRadius: "0.75rem" }}
          required
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name}</p>
        )}
      </div>

      <div>
        <textarea
          placeholder={t("businessAddress")}
          value={formData.address}
          onChange={onAddressChange}
          className="w-full px-4 py-3 bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors resize-none"
          style={{ borderRadius: "0.75rem" }}
          rows={3}
          required
        />
        {errors.address && (
          <p className="text-red-500 text-xs mt-1">{errors.address}</p>
        )}
      </div>

      <div>
        <input
          type="email"
          placeholder={t("emailAddress")}
          value={formData.email}
          onChange={onEmailChange}
          className="w-full px-4 py-3 bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
          style={{ borderRadius: "0.75rem" }}
          required
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email}</p>
        )}
      </div>

      <div>
        <input
          type="text"
          placeholder={t("gstNumber")}
          value={formData.gst}
          onChange={onGstChange}
          className="w-full px-4 py-3 bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
          style={{ borderRadius: "0.75rem" }}
          required
        />
        {errors.gst && (
          <p className="text-red-500 text-xs mt-1">{errors.gst}</p>
        )}
      </div>

      {/* Terms and Conditions */}
      <div className="space-y-2">
        <div className="flex items-start">
          <input
            type="checkbox"
            id="terms"
            checked={agreeToTerms}
            onChange={(e) => onAgreeToTermsChange(e.target.checked)}
            className="w-4 h-4 text-green-500 bg-gray-100 border-gray-400 focus:ring-green-500 mt-1"
            style={{ borderRadius: "0.25rem" }}
          />
          <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
            {t("agreeToTermsStart")}{" "}
            <button
              type="button"
              className="text-green-600 hover:text-green-500 underline transition-colors"
              onClick={() => window.open("/terms", "_blank")}
            >
              {t("termsAndConditions")}
            </button>{" "}
            {t("and")}{" "}
            <button
              type="button"
              className="text-green-600 hover:text-green-500 underline transition-colors"
              onClick={() => window.open("/privacy", "_blank")}
            >
              {t("privacyPolicy")}
            </button>
          </label>
        </div>
        {errors.terms && (
          <p className="text-red-500 text-xs">{errors.terms}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:from-green-600 hover:to-emerald-600 focus:outline-none transition-all duration-200 flex items-center justify-center"
        style={{ borderRadius: "0.75rem" }}
      >
        {isLoading ? (
          <Loader2 className="animate-spin w-5 h-5" />
        ) : (
          t("sendOTP")
        )}
      </button>
    </form>
  );
};