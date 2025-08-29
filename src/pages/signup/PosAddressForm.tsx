import React from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

interface PosAddressFormData {
  state: string;
  district: string;
  tehsil: string;
  block: string;
  village: string;
  pincode: string;
}

interface PosAddressFormProps {
  defaultValues?: Partial<PosAddressFormData>;
  agreeToTerms: boolean;
  isLoading: boolean;
  onSubmit: (data: PosAddressFormData) => Promise<void>;
  onAgreeToTermsChange: (checked: boolean) => void;
  onBack: () => void;
}

export const PosAddressForm: React.FC<PosAddressFormProps> = ({
  defaultValues = {},
  agreeToTerms,
  isLoading,
  onSubmit,
  onAgreeToTermsChange,
  onBack,
}) => {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<PosAddressFormData>({
    mode: "onChange",
    defaultValues,
  });

  const watchedFields = watch();

  const isFormComplete = isValid && 
    agreeToTerms &&
    Object.values(watchedFields).every(value => value && value.toString().trim().length > 0);

  const handleFormSubmit = async (data: PosAddressFormData) => {
    if (!agreeToTerms) {
      alert("Please agree to terms and conditions");
      return;
    }
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <input
            {...register("state", {
              required: "State is required",
              minLength: {
                value: 2,
                message: "State must be at least 2 characters long",
              },
              maxLength: {
                value: 50,
                message: "State cannot exceed 50 characters",
              },
            })}
            type="text"
            placeholder="State"
            className="w-full px-4 py-3 bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
            style={{ borderRadius: "0.75rem" }}
          />
          {errors.state && (
            <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>
          )}
        </div>

        <div>
          <input
            {...register("district", {
              required: "District is required",
              minLength: {
                value: 2,
                message: "District must be at least 2 characters long",
              },
              maxLength: {
                value: 50,
                message: "District cannot exceed 50 characters",
              },
            })}
            type="text"
            placeholder="District"
            className="w-full px-4 py-3 bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
            style={{ borderRadius: "0.75rem" }}
          />
          {errors.district && (
            <p className="text-red-500 text-xs mt-1">{errors.district.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <input
            {...register("tehsil", {
              required: "Tehsil is required",
              minLength: {
                value: 2,
                message: "Tehsil must be at least 2 characters long",
              },
              maxLength: {
                value: 50,
                message: "Tehsil cannot exceed 50 characters",
              },
            })}
            type="text"
            placeholder="Tehsil"
            className="w-full px-4 py-3 bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
            style={{ borderRadius: "0.75rem" }}
          />
          {errors.tehsil && (
            <p className="text-red-500 text-xs mt-1">{errors.tehsil.message}</p>
          )}
        </div>

        <div>
          <input
            {...register("block", {
              required: "Block is required",
              minLength: {
                value: 2,
                message: "Block must be at least 2 characters long",
              },
              maxLength: {
                value: 50,
                message: "Block cannot exceed 50 characters",
              },
            })}
            type="text"
            placeholder="Block"
            className="w-full px-4 py-3 bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
            style={{ borderRadius: "0.75rem" }}
          />
          {errors.block && (
            <p className="text-red-500 text-xs mt-1">{errors.block.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <input
            {...register("village", {
              required: "Village is required",
              minLength: {
                value: 2,
                message: "Village must be at least 2 characters long",
              },
              maxLength: {
                value: 50,
                message: "Village cannot exceed 50 characters",
              },
            })}
            type="text"
            placeholder="Village"
            className="w-full px-4 py-3 bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
            style={{ borderRadius: "0.75rem" }}
          />
          {errors.village && (
            <p className="text-red-500 text-xs mt-1">{errors.village.message}</p>
          )}
        </div>

        <div>
          <input
            {...register("pincode", {
              required: "Pincode is required",
              pattern: {
                value: /^[1-9][0-9]{5}$/,
                message: "Please enter a valid 6-digit pincode (cannot start with 0)",
              },
              minLength: {
                value: 6,
                message: "Pincode must be exactly 6 digits",
              },
              maxLength: {
                value: 6,
                message: "Pincode must be exactly 6 digits",
              },
              onChange: (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
              },
            })}
            type="text"
            placeholder="Pincode"
            className="w-full px-4 py-3 bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
            style={{ borderRadius: "0.75rem" }}
            maxLength={6}
            inputMode="numeric"
          />
          {errors.pincode && (
            <p className="text-red-500 text-xs mt-1">{errors.pincode.message}</p>
          )}
        </div>
      </div>

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
        {!agreeToTerms && (
          <p className="text-red-500 text-xs">You must agree to the terms and conditions</p>
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
          disabled={!isFormComplete || isLoading}
          className={`w-1/2 py-3 font-semibold transition-all duration-200 flex items-center justify-center ${
            isFormComplete && !isLoading
              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 cursor-pointer"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
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
