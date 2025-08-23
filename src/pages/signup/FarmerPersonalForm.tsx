import React from "react";
import { useTranslation } from "react-i18next";
import type { FormData, FormErrors } from "./signup.type";

interface FarmerPersonalFormProps {
  formData: FormData;
  errors: FormErrors;
  onSubmit: (e: React.FormEvent) => void;
  onNameChange: (field: string, value: string) => void;
  onPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAadharChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onConfirmPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FarmerPersonalForm: React.FC<FarmerPersonalFormProps> = ({
  formData,
  errors,
  onSubmit,
  onNameChange,
  onPhoneChange,
  onAadharChange,
  onPasswordChange,
  onConfirmPasswordChange,
}) => {
  const { t } = useTranslation();

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <input
          type="text"
          placeholder={t("fullName")}
          value={formData.fullName}
          onChange={(e) => onNameChange("fullName", e.target.value)}
          className="w-full px-4 py-3 bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
          style={{ borderRadius: "0.75rem" }}
          required
        />
        {errors.fullName && (
          <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
        )}
      </div>

      <div>
        <input
          type="text"
          placeholder={t("fatherName")}
          value={formData.fatherName}
          onChange={(e) => onNameChange("fatherName", e.target.value)}
          className="w-full px-4 py-3 bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
          style={{ borderRadius: "0.75rem" }}
          required
        />
        {errors.fatherName && (
          <p className="text-red-500 text-xs mt-1">{errors.fatherName}</p>
        )}
      </div>

      <div>
        <input
          type="text"
          placeholder={t("aadharNumber")}
          value={formData.aadhar}
          onChange={onAadharChange}
          className="w-full px-4 py-3 bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
          style={{ borderRadius: "0.75rem" }}
          required
        />
        {errors.aadhar && (
          <p className="text-red-500 text-xs mt-1">{errors.aadhar}</p>
        )}
      </div>

      <div>
        <input
          type="tel"
          placeholder={t("phoneNumber")}
          value={formData.phone}
          onChange={onPhoneChange}
          className="w-full px-4 py-3 bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
          style={{ borderRadius: "0.75rem" }}
          required
        />
        {errors.phone && (
          <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
        )}
      </div>

      <div>
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={onPasswordChange}
          className="w-full px-4 py-3 bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
          style={{ borderRadius: "0.75rem" }}
          required
        />
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password}</p>
        )}
      </div>

      <div>
        <input
          type="password"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={onConfirmPasswordChange}
          className="w-full px-4 py-3 bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
          style={{ borderRadius: "0.75rem" }}
          required
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
        )}
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:from-green-600 hover:to-emerald-600 focus:outline-none transition-all duration-200"
        style={{ borderRadius: "0.75rem" }}
      >
        Next: Address Details
      </button>
    </form>
  );
};