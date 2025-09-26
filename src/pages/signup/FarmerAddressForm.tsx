import React from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import type { FormData, FormErrors } from "./signup.type";
import CustomDropdown from "../../components/CustomDropdown";
import { uttarakhandData } from "../../utils/uttarakhandData";

interface FarmerAddressFormProps {
  formData: FormData;
  errors: FormErrors;
  agreeToTerms: boolean;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onAddressFieldChange: (field: string, value: string) => void;
  onPincodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAgreeToTermsChange: (checked: boolean) => void;
  // For controlled updates of district/tehsil/block since now dropdowns
  onDistrictChange: (value: string) => void;
  onTehsilChange: (value: string) => void;
  onBlockChange: (value: string) => void;
}

export const FarmerAddressForm: React.FC<FarmerAddressFormProps> = ({
  formData,
  errors,
  agreeToTerms,
  isLoading,
  onSubmit,
  onPincodeChange,
  onAgreeToTermsChange,
  onDistrictChange,
  onTehsilChange,
  onBlockChange,
}) => {
  const { t } = useTranslation();

  const districtOptions = uttarakhandData.districts;
  const tehsilOptions = formData.district ? (uttarakhandData.tehsils[formData.district] || []) : [];
  const blockOptions = formData.district ? (uttarakhandData.blocks[formData.district] || []) : [];

  const handleDistrictSelect = (value: string) => {
    onDistrictChange(value);
    // Reset dependent fields when district changes
    onTehsilChange("");
    onBlockChange("");
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* State hidden: always Uttarakhand in payload */}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <CustomDropdown
            options={districtOptions}
            value={formData.district}
            onChange={handleDistrictSelect}
            placeholder="Select district"
            error={errors.district}
          />
        </div>

        <div>
          <CustomDropdown
            options={tehsilOptions}
            value={formData.tehsil}
            onChange={onTehsilChange}
            placeholder="Select tehsil"
            error={errors.tehsil}
            disabled={!formData.district}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <CustomDropdown
            options={blockOptions}
            value={formData.block}
            onChange={onBlockChange}
            placeholder="Select block"
            error={errors.block}
            disabled={!formData.district}
          />
        </div>

        <div>
          <input
            type="text"
            placeholder="Pincode"
            value={formData.pincode}
            onChange={onPincodeChange}
            className="w-full px-4 py-3 bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
            style={{ borderRadius: "0.75rem" }}
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
          "Complete Registration"
        )}
      </button>
    </form>
  );
};
