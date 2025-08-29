import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LeftPanel } from "./LeftPanel";
import { FarmerPersonalForm } from "./FarmerPersonalForm";
import { FarmerAddressForm } from "./FarmerAddressForm";
import { PosPersonalForm } from "./PosPersonalForm";
import { PosAddressForm } from "./PosAddressForm";
import { OtpForm } from "./OtpForm";
import type { Role } from "./signup.type";
import { useSignupForm } from "../../hooks/useSignupForm";
import { GLOBLE, ILLUSTRATIONS } from "../../assets/assets";

export default function SignupPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const [role, setRole] = useState<Role>(() => {
    const urlRole = searchParams.get("role");
    return urlRole === "pos" || urlRole === "kisaan" ? urlRole : "kisaan";
  });

  // Add POS step state
  const [posStep, setPosStep] = useState<"personal" | "address">("personal");

  useEffect(() => {
    const urlRole = searchParams.get("role");
    if (urlRole === "pos" || urlRole === "kisaan") {
      setRole(urlRole);
    }
  }, [searchParams]);

  const {
    isLoading,
    farmerStep,
    step,
    agreeToTerms,
    errors,
    formData,

    // Setters
    setFarmerStep,
    setStep,
    setAgreeToTerms,

    // Handlers
    handlePhoneChange,
    handleAadharChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handlePincodeChange,
    handleAddressFieldChange,
    handleEmailChange,
    handleGstChange,
    handleNameChange,
    handleAddressChange,
    handleOtpChange,
    handleFarmerPersonalNext,
    handleFarmerAddressSubmit,
    handlePosSignupSubmit,
    handleOtpSubmit,
  } = useSignupForm({ role, navigate });

  // Enhanced mobile change handler for POS
  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const cleanValue = rawValue.replace(/\D/g, "").slice(0, 10);
    handleNameChange("mobile", cleanValue);
  };

  // Enhanced pincode change handler
  const handleEnhancedPincodeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const rawValue = e.target.value;
    const cleanValue = rawValue.replace(/\D/g, "").slice(0, 6);

    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: cleanValue,
      },
    };

    handlePincodeChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
  };

  // POS validation and navigation handlers
  const validatePosPersonal = () => {
    const newErrors: any = {};

    // Business name validation
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = "Business name must be at least 2 characters long";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Mobile validation
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!formData.mobile || !mobileRegex.test(formData.mobile)) {
      newErrors.mobile = "Please enter a valid 10-digit mobile number";
    }

    // Password validation
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return Object.keys(newErrors).length === 0;
  };

  const handlePosPersonalNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validatePosPersonal()) {
      setPosStep("address");
    }
  };

  const handlePosAddressBack = () => {
    setPosStep("personal");
  };

  const handleBack = () => {
    if (step === "otp") {
      setStep("signup");
    } else if (role === "kisaan" && farmerStep === "address") {
      setFarmerStep("personal");
    } else if (role === "pos" && posStep === "address") {
      setPosStep("personal");
    } else {
      navigate(-1);
    }
  };

  const renderSignupContent = () => {
    if (step === "otp") {
      return (
        <OtpForm
          formData={formData}
          isLoading={isLoading}
          onSubmit={handleOtpSubmit}
          onOtpChange={handleOtpChange}
          onBackToSignup={() => setStep("signup")}
        />
      );
    }

    return (
      <>
        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-gray-900 mb-2">
            {role === "kisaan" ? t("joinAsKisaan") : t("joinAsPos")}
          </h2>
          <p className="text-gray-600 text-sm">
            {role === "kisaan"
              ? farmerStep === "personal"
                ? "Enter your personal details"
                : "Enter your address details"
              : posStep === "personal"
              ? "Enter your business details"
              : "Enter your address details"}
          </p>

          {/* Progress indicators */}
          {role === "kisaan" && (
            <div className="flex mt-4">
              <div
                className={`w-1/2 h-1 rounded-full ${
                  farmerStep === "personal" ? "bg-green-500" : "bg-green-300"
                }`}
              ></div>
              <div
                className={`w-1/2 h-1 rounded-full ml-2 ${
                  farmerStep === "address" ? "bg-green-500" : "bg-gray-300"
                }`}
              ></div>
            </div>
          )}

          {role === "pos" && (
            <div className="flex mt-4">
              <div
                className={`w-1/2 h-1 rounded-full ${
                  posStep === "personal" ? "bg-green-500" : "bg-green-300"
                }`}
              ></div>
              <div
                className={`w-1/2 h-1 rounded-full ml-2 ${
                  posStep === "address" ? "bg-green-500" : "bg-gray-300"
                }`}
              ></div>
            </div>
          )}
        </div>

        {role === "kisaan" ? (
          farmerStep === "personal" ? (
            <FarmerPersonalForm
              formData={formData}
              errors={errors}
              onSubmit={handleFarmerPersonalNext}
              onNameChange={handleNameChange}
              onPhoneChange={handlePhoneChange}
              onAadharChange={handleAadharChange}
              onPasswordChange={handlePasswordChange}
              onConfirmPasswordChange={handleConfirmPasswordChange}
            />
          ) : (
            <FarmerAddressForm
              formData={formData}
              errors={errors}
              agreeToTerms={agreeToTerms}
              isLoading={isLoading}
              onSubmit={handleFarmerAddressSubmit}
              onAddressFieldChange={handleAddressFieldChange}
              onPincodeChange={handleEnhancedPincodeChange}
              onAgreeToTermsChange={setAgreeToTerms}
            />
          )
        ) : posStep === "personal" ? (
          <PosPersonalForm
            formData={formData}
            errors={errors}
            onSubmit={handlePosPersonalNext}
            onNameChange={handleNameChange}
            onEmailChange={handleEmailChange}
            onMobileChange={handleMobileChange}
            onPasswordChange={handlePasswordChange}
            onConfirmPasswordChange={handleConfirmPasswordChange}
          />
        ) : (
          <PosAddressForm
            formData={formData}
            errors={errors}
            agreeToTerms={agreeToTerms}
            isLoading={isLoading}
            onSubmit={handlePosSignupSubmit}
            onAddressFieldChange={handleAddressFieldChange}
            onPincodeChange={handleEnhancedPincodeChange}
            onAgreeToTermsChange={setAgreeToTerms}
            onBack={handlePosAddressBack}
          />
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Mobile: Top Illustration + Centered Form */}
      <div className="block lg:hidden w-full h-screen">
        <div className="flex flex-col items-center justify-center h-full">
          <img
            src={ILLUSTRATIONS.kisaan07}
            alt="illustration"
            className="mb-4 w-44 h-44 object-contain"
          />

          <div className="w-full max-w-md p-6">
            {renderSignupContent()}
            <div className="mt-8 text-center">
              <p className="text-gray-600 text-sm">
                {t("alreadyHaveAccount")}{" "}
                <button
                  onClick={() => navigate(`/login?role=${role}`)}
                  className="text-green-600 hover:text-green-500 font-medium transition-colors"
                >
                  {t("signIn")}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: Left Side */}
      <LeftPanel onBack={handleBack} />

      {/* Desktop: Right/Form Side */}
      <div className="hidden lg:flex w-full lg:w-1/2 items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md px-6">
          {renderSignupContent()}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              {t("alreadyHaveAccount")}{" "}
              <button
                onClick={() => navigate(`/login?role=${role}`)}
                className="text-green-600 hover:text-green-500 font-medium transition-colors"
              >
                {t("signIn")}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Brand Logo */}
      <div className="absolute top-4 left-4 z-50">
        <img src={GLOBLE.ucf_logo} alt="Brand Logo" className="h-30 w-auto" />
      </div>
    </div>
  );
}
