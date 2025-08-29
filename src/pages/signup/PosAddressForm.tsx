import React from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import type { FormData, FormErrors } from "./signup.type";

interface PosAddressFormProps {
  formData: FormData;
  errors: FormErrors;
  agreeToTerms: boolean;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onAddressFieldChange: (field: string, value: string) => void;
  onPincodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAgreeToTermsChange: (checked: boolean) => void;
  onBack: () => void;
}

export const PosAddressForm: React.FC<PosAddressFormProps> = ({
  formData,
  errors,
  agreeToTerms,
  isLoading,
  onSubmit,
  onAddressFieldChange,
  onPincodeChange,
  onAgreeToTermsChange,
  onBack,
}) => {
  const { t } = useTranslation();

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <input
            type="text"
            placeholder="State"
            value={formData.state}
            onChange={(e) => onAddressFieldChange("state", e.target.value)}
            className="w-full px-4 py-3 bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
            style={{ borderRadius: "0.75rem" }}
            required
            maxLength={50}
          />
          {errors.state && (
            <p className="text-red-500 text-xs mt-1">{errors.state}</p>
          )}
        </div>

        <div>
          <input
            type="text"
            placeholder="District"
            value={formData.district}
            onChange={(e) => onAddressFieldChange("district", e.target.value)}
            className="w-full px-4 py-3 bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
            style={{ borderRadius: "0.75rem" }}
            required
            maxLength={50}
          />
          {errors.district && (
            <p className="text-red-500 text-xs mt-1">{errors.district}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <input
            type="text"
            placeholder="Tehsil"
            value={formData.tehsil}
            onChange={(e) => onAddressFieldChange("tehsil", e.target.value)}
            className="w-full px-4 py-3 bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
            style={{ borderRadius: "0.75rem" }}
            required
            maxLength={50}
          />
          {errors.tehsil && (
            <p className="text-red-500 text-xs mt-1">{errors.tehsil}</p>
          )}
        </div>

        <div>
          <input
            type="text"
            placeholder="Block"
            value={formData.block}
            onChange={(e) => onAddressFieldChange("block", e.target.value)}
            className="w-full px-4 py-3 bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
            style={{ borderRadius: "0.75rem" }}
            required
            maxLength={50}
          />
          {errors.block && (
            <p className="text-red-500 text-xs mt-1">{errors.block}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <input
            type="text"
            placeholder="Village"
            value={formData.village}
            onChange={(e) => onAddressFieldChange("village", e.target.value)}
            className="w-full px-4 py-3 bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
            style={{ borderRadius: "0.75rem" }}
            required
            maxLength={50}
          />
          {errors.village && (
            <p className="text-red-500 text-xs mt-1">{errors.village}</p>
          )}
        </div>

        <div>
          <input
            type="text"
            placeholder="Pincode"
            value={formData.pincode}
            onChange={onPincodeChange}
            className="w-full px-4 py-3 bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
            style={{ borderRadius: "0.75rem" }}
            maxLength={6}
            inputMode="numeric"
            pattern="[1-9][0-9]{5}"
            required
          />
          {errors.pincode && (
            <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>
          )}
        </div>
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
            required
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

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="w-1/2 py-3 bg-gray-300 text-gray-700 font-semibold hover:bg-gray-400 focus:outline-none transition-all duration-200 disabled:opacity-50"
          style={{ borderRadius: "0.75rem" }}
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="w-1/2 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:from-green-600 hover:to-emerald-600 focus:outline-none transition-all duration-200 flex items-center justify-center disabled:opacity-50"
          style={{ borderRadius: "0.75rem" }}
        >
          {isLoading ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : (
            t("createAccount")
          )}
        </button>
      </div>
    </form>
  );
};
