import React from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import CustomDropdown from "../../components/CustomDropdown";
import { uttarakhandData } from "../../utils/uttarakhandData";

interface PosAddressFormData {
  // state removed from UI; fixed in parent payload
  district: string;
  tehsil: string;
  block: string;
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
    setValue,
    formState: { errors, isValid },
  } = useForm<PosAddressFormData>({
    mode: "onChange",
    defaultValues,
  });

  const watchedFields = watch();

  const isFormComplete =
    isValid &&
    agreeToTerms &&
    Object.values(watchedFields).every(value => value && value.toString().trim().length > 0);

  const handleFormSubmit = async (data: PosAddressFormData) => {
    if (!agreeToTerms) {
      alert("Please agree to terms and conditions");
      return;
    }
    await onSubmit(data);
  };

  const districtOptions = uttarakhandData.districts;
  const tehsilOptions = watchedFields.district ? (uttarakhandData.tehsils[watchedFields.district] || []) : [];
  const blockOptions = watchedFields.district ? (uttarakhandData.blocks[watchedFields.district] || []) : [];

  const setDistrict = (val: string) => {
    setValue("district", val, { shouldValidate: true, shouldDirty: true });
    // reset dependents
    setValue("tehsil", "", { shouldValidate: true, shouldDirty: true });
    setValue("block", "", { shouldValidate: true, shouldDirty: true });
  };

  const setTehsil = (val: string) => {
    setValue("tehsil", val, { shouldValidate: true, shouldDirty: true });
  };

  const setBlock = (val: string) => {
    setValue("block", val, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <CustomDropdown
            options={districtOptions}
            value={watchedFields.district || ""}
            onChange={setDistrict}
            placeholder="Select district"
            error={errors.district?.message}
          />
        </div>

        <div>
          <CustomDropdown
            options={tehsilOptions}
            value={watchedFields.tehsil || ""}
            onChange={setTehsil}
            placeholder="Select tehsil"
            error={errors.tehsil?.message}
            disabled={!watchedFields.district}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <CustomDropdown
            options={blockOptions}
            value={watchedFields.block || ""}
            onChange={setBlock}
            placeholder="Select block"
            error={errors.block?.message}
            disabled={!watchedFields.district}
          />
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
