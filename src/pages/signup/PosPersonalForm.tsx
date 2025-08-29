import React from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";

interface PosPersonalFormData {
  name: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
}

interface PosPersonalFormProps {
  defaultValues?: Partial<PosPersonalFormData>;
  onNext: (data: PosPersonalFormData) => void;
}

export const PosPersonalForm: React.FC<PosPersonalFormProps> = ({
  defaultValues = {},
  onNext,
}) => {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<PosPersonalFormData>({
    mode: "onChange",
    defaultValues,
  });

  const password = watch("password", "");

  const onSubmit = (data: PosPersonalFormData) => {
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <input
          {...register("name", {
            required: "Business name is required",
            minLength: {
              value: 2,
              message: "Business name must be at least 2 characters long",
            },
            maxLength: {
              value: 100,
              message: "Business name cannot exceed 100 characters",
            },
            pattern: {
              value: /^[a-zA-Z\s&.-]+$/,
              message: "Business name can only contain letters, spaces, and basic punctuation",
            },
          })}
          type="text"
          placeholder={t("businessName")}
          className="w-full px-4 py-3 bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
          style={{ borderRadius: "0.75rem" }}
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <input
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
              message: "Please enter a valid email address",
            },
          })}
          type="email"
          placeholder={t("emailAddress")}
          className="w-full px-4 py-3 bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
          style={{ borderRadius: "0.75rem" }}
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <input
          {...register("mobile", {
            required: "Mobile number is required",
            pattern: {
              value: /^[6-9]\d{9}$/,
              message: "Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9",
            },
            minLength: {
              value: 10,
              message: "Mobile number must be exactly 10 digits",
            },
            maxLength: {
              value: 10,
              message: "Mobile number must be exactly 10 digits",
            },
            onChange: (e) => {
              e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
            },
          })}
          type="tel"
          placeholder={t("mobileNumber")}
          className="w-full px-4 py-3 bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
          style={{ borderRadius: "0.75rem" }}
          maxLength={10}
          inputMode="numeric"
        />
        {errors.mobile && (
          <p className="text-red-500 text-xs mt-1">{errors.mobile.message}</p>
        )}
      </div>

      <div>
        <input
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters long",
            },
            maxLength: {
              value: 50,
              message: "Password cannot exceed 50 characters",
            },
          })}
          type="password"
          placeholder="Password"
          className="w-full px-4 py-3 bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
          style={{ borderRadius: "0.75rem" }}
          autoComplete="new-password"
        />
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
        )}
      </div>

      <div>
        <input
          {...register("confirmPassword", {
            required: "Please confirm your password",
            validate: (value) =>
              value === password || "Passwords do not match",
          })}
          type="password"
          placeholder="Confirm Password"
          className="w-full px-4 py-3 bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
          style={{ borderRadius: "0.75rem" }}
          autoComplete="new-password"
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={!isValid}
        className={`w-full py-3 font-semibold transition-all duration-200 ${
          isValid
            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 cursor-pointer"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
        style={{ borderRadius: "0.75rem" }}
      >
        Next: Address Details
      </button>
    </form>
  );
};
