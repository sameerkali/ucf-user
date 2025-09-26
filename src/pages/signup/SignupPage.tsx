import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LeftPanel } from "./LeftPanel";
import { FarmerPersonalForm } from "./FarmerPersonalForm";
import { FarmerAddressForm } from "./FarmerAddressForm";
import { PosPersonalForm } from "./PosPersonalForm";
import { PosAddressForm } from "./PosAddressForm";
import { OtpForm } from "./OtpForm";
import type { Role, PosRegistrationData } from "./signup.type";
import { useSignupForm } from "../../hooks/useSignupForm";
import { GLOBLE, ILLUSTRATIONS } from "../../assets/assets";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function SignupPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const [role, setRole] = useState<Role>(() => {
    const urlRole = searchParams.get("role");
    return urlRole === "pos" || urlRole === "kisaan" ? urlRole : "kisaan";
  });

  const [posStep, setPosStep] = useState<'personal' | 'address'>('personal');
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [posFormData, setPosFormData] = useState<Partial<PosRegistrationData>>({});

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
    setFarmerStep,
    setStep,
    setAgreeToTerms,
    handlePhoneChange,
    handleAadharChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handlePincodeChange,
    handleAddressFieldChange,
    handleNameChange,
    handleOtpChange,
    handleFarmerPersonalNext,
    handleFarmerAddressSubmit,
    handleOtpSubmit,
  } = useSignupForm({ role, navigate });

  // Local setters for dropdown controlled fields in Farmer form
  const setFarmerDistrict = (value: string) => {
    handleAddressFieldChange("district", value);
  };
  const setFarmerTehsil = (value: string) => {
    handleAddressFieldChange("tehsil", value);
  };
  const setFarmerBlock = (value: string) => {
    handleAddressFieldChange("block", value);
  };

  const handlePosPersonalNext = (data: any) => {
    setPosFormData(prev => ({ ...prev, ...data }));
    setPosStep('address');
  };

  const handlePosAddressSubmit = async (addressData: any): Promise<void> => {
    setIsApiLoading(true);

    try {
      const payload: PosRegistrationData = {
        name: posFormData.name || "",
        email: posFormData.email || "",
        password: posFormData.password || "",
        mobile: posFormData.mobile || "",
        address: {
          state: "Uttarakhand",
          district: addressData.district,
          tehsil: addressData.tehsil,
          block: addressData.block,
          pincode: addressData.pincode,
        }
      };

      const { data } = await api.post('/api/pos/register', payload);
console.log("data: ", data);
      toast.success('POS registration successful!');
      navigate('/login?role=pos');

    } catch (error: any) {
      let errorMessage = 'Registration failed. Please try again.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      if (error.response?.status === 400) {
        if (error.response.data?.field) {
          errorMessage = `${error.response.data.field}: ${error.response.data.message}`;
        }
      } else if (error.response?.status === 409) {
        errorMessage = 'Email or mobile number already exists';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }

      toast.error(errorMessage);
    } finally {
      setIsApiLoading(false);
    }
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

          {role === "kisaan" && (
            <div className="flex mt-4">
              <div className={`w-1/2 h-1 rounded-full ${farmerStep === "personal" ? "bg-green-500" : "bg-green-300"}`}></div>
              <div className={`w-1/2 h-1 rounded-full ml-2 ${farmerStep === "address" ? "bg-green-500" : "bg-gray-300"}`}></div>
            </div>
          )}

          {role === "pos" && (
            <div className="flex mt-4">
              <div className={`w-1/2 h-1 rounded-full ${posStep === "personal" ? "bg-green-500" : "bg-green-300"}`}></div>
              <div className={`w-1/2 h-1 rounded-full ml-2 ${posStep === "address" ? "bg-green-500" : "bg-gray-300"}`}></div>
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
              onDistrictChange={setFarmerDistrict}
              onTehsilChange={setFarmerTehsil}
              onBlockChange={setFarmerBlock}
            />
          )
        ) : (
          posStep === "personal" ? (
            <PosPersonalForm
              defaultValues={posFormData}
              onNext={handlePosPersonalNext}
            />
          ) : (
            <PosAddressForm
              defaultValues={{
                district: posFormData.address?.district || "",
                tehsil: posFormData.address?.tehsil || "",
                block: posFormData.address?.block || "",
                pincode: posFormData.address?.pincode || "",
              }}
              agreeToTerms={agreeToTerms}
              isLoading={isApiLoading}
              onSubmit={handlePosAddressSubmit}
              onAgreeToTermsChange={setAgreeToTerms}
              onBack={() => setPosStep('personal')}
            />
          )
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
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
                {t("alreadyHaveAccount")}{""}
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

      <LeftPanel onBack={handleBack} />

      <div className="hidden lg:flex w-full lg:w-1/2 items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md px-6">
          {renderSignupContent()}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              {t("alreadyHaveAccount")}{""}
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

      <div className="absolute top-4 left-4 z-50">
        <img src={GLOBLE.ucf_logo} alt="Brand Logo" className="h-30 w-auto" />
      </div>
    </div>
  );
}
