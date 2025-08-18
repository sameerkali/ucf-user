import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LeftPanel } from "./LeftPanel";
import { FarmerPersonalForm } from "./FarmerPersonalForm";
import { FarmerAddressForm } from "./FarmerAddressForm";
import { PosSignupForm } from "./PosSignupForm";
import { OtpForm } from "./OtpForm";
import type { Role } from "./signup.type";
import { useSignupForm } from "../../hooks/useSignupForm";


export default function SignupPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const [role, setRole] = useState<Role>(() => {
    const urlRole = searchParams.get("role");
    return urlRole === "pos" || urlRole === "kisaan" ? urlRole : "kisaan";
  });

  useEffect(() => {
    const urlRole = searchParams.get("role");
    if (urlRole === "pos" || urlRole === "kisaan") {
      setRole(urlRole);
    }
  }, [searchParams]);

  const {
    // State
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

  const handleBack = () => {
    if (step === "otp") {
      setStep("signup");
    } else if (role === "kisaan" && farmerStep === "address") {
      setFarmerStep("personal");
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
          <h2 className="text-3xl font-semibold text-white mb-2">
            {role === "kisaan" ? t("joinAsKisaan") : t("joinAsPos")}
          </h2>
          <p className="text-gray-400 text-sm">
            {role === "kisaan"
              ? farmerStep === "personal"
                ? "Enter your personal details"
                : "Enter your address details"
              : t("createPosAccount")}
          </p>
          {role === "kisaan" && (
            <div className="flex mt-4">
              <div
                className={`w-1/2 h-1 rounded-full ${
                  farmerStep === "personal" ? "bg-green-500" : "bg-green-300"
                }`}
              ></div>
              <div
                className={`w-1/2 h-1 rounded-full ml-2 ${
                  farmerStep === "address" ? "bg-green-500" : "bg-gray-600"
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
              onPincodeChange={handlePincodeChange}
              onAgreeToTermsChange={setAgreeToTerms}
            />
          )
        ) : (
          <PosSignupForm
            formData={formData}
            errors={errors}
            agreeToTerms={agreeToTerms}
            isLoading={isLoading}
            onSubmit={handlePosSignupSubmit}
            onNameChange={handleNameChange}
            onAddressChange={handleAddressChange}
            onEmailChange={handleEmailChange}
            onGstChange={handleGstChange}
            onAgreeToTermsChange={setAgreeToTerms}
          />
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen flex bg-black">
      {/* Left Side - Agricultural Background with Curved Border */}
      <LeftPanel onBack={handleBack} />

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-black overflow-y-auto">
        <div className="w-full max-w-md">
          {renderSignupContent()}

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              {t("alreadyHaveAccount")}{" "}
              <button
                onClick={() => navigate(`/login?role=${role}`)}
                className="text-green-500 hover:text-green-400 font-medium transition-colors"
              >
                {t("signIn")}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
