import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { BGS, GLOBLE, ILLUSTRATIONS } from "../assets/assets";
import { useTranslation } from "react-i18next";
import api from "../api/axios";
import toast from "react-hot-toast";
import {
  sendOTP,
  verifyOTP,
  getIdTokenFromUser,
  setupRecaptcha,
} from "../firebaseConfig";
import type { ConfirmationResult } from "firebase/auth";

type Step = "credentials" | "otp";

export default function LoginPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [role, setRole] = useState<"kisaan" | "pos">(() => {
    const urlRole = searchParams.get("role");
    return urlRole === "pos" || urlRole === "kisaan" ? urlRole : "kisaan";
  });

  useEffect(() => {
    const urlRole = searchParams.get("role");
    if (urlRole === "pos" || urlRole === "kisaan") {
      setRole(urlRole);
    }
  }, [searchParams]);

  // const [showPassword, setShowPassword] = useState(false);
  // const [rememberMe, setRememberMe] = useState(false);

  const [errors, setErrors] = useState<{
    phone: string;
    userId?: string;
    password?: string;
    otp?: string;
  }>({
    phone: "",
    // userId: "",
    // password: "",
    otp: "",
  });

  const [formData, setFormData] = useState<{
    phone: string;
    userId?: string;
    password?: string;
    otp: string;
  }>({
    phone: "",
    // userId: "",
    // password: "",
    otp: "",
  });

  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const [step, setStep] = useState<Step>("credentials");

  // const sanitizeInput = (value: string) => value.replace(/[<>"'&]/g, "");

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, phone: value }));
    setErrors((prev) => ({
      ...prev,
      phone: value.length > 0 && value.length < 10 ? t("phoneError") : "",
    }));
  };

  // const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = sanitizeInput(e.target.value);
  //   setFormData((prev) => ({ ...prev, userId: value }));
  //   setErrors((prev) => ({
  //     ...prev,
  //     userId: value.length > 0 && value.length < 3 ? t("userIdError") : "",
  //   }));
  // };

  // const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = sanitizeInput(e.target.value).slice(0, 16);
  //   setFormData((prev) => ({ ...prev, password: value }));
  //   setErrors((prev) => ({
  //     ...prev,
  //     password: value.length > 0 && value.length < 6 ? t("passwordError") : "",
  //   }));
  // };

  // Farmer OTP SEND (step 1)
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.phone.length !== 10 || errors.phone) {
      setErrors((prev) => ({
        ...prev,
        phone: t("phoneError"),
      }));
      return;
    }
    setIsLoading(true);
    try {
      // Reset reCAPTCHA if exists
      const recaptchaContainer = document.getElementById("recaptcha-container");
      if (recaptchaContainer) {
        recaptchaContainer.innerHTML = "";
      }
      setupRecaptcha("recaptcha-container");
      const confirmation = await sendOTP(formData.phone);
      setConfirmationResult(confirmation);
      toast.success(t("otpSent") || "OTP sent successfully!");
      setStep("otp");
    } catch (error: any) {
      console.error("Firebase sendOTP error:", error);
      toast.error(
        t("otpSendError") ||
          error?.message ||
          "Failed to send OTP. Try again later."
      );
    }
    setIsLoading(false);
  };

  // Farmer OTP VERIFY (step 2)
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !confirmationResult ||
      !formData.otp ||
      formData.otp.length !== 6 ||
      errors.otp
    )
      return;

    setIsLoading(true);
    try {
      const userCredential = await verifyOTP(confirmationResult, formData.otp);
      const firebaseUser = userCredential.user;
      const idToken = await getIdTokenFromUser(firebaseUser);

      // Send idToken & mobile to backend for session
      const { data, status } = await api.post("/api/farmer/login", {
        mobile: formData.phone,
        idToken,
      });

      if (status === 200 && data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.result));
        const { bankVerified, otherDetailsVerified } = data.result;
        toast.success(t("loginSuccess") || "Login successful!");
        if (bankVerified && otherDetailsVerified) {
          navigate("/home");
        } else if (bankVerified) {
          navigate("/complete-profile?role=kisaan&step=2");
        } else {
          navigate("/complete-profile?role=kisaan&step=1");
        }
      } else {
        setErrors((prev) => ({
          ...prev,
          otp: data.message || t("loginFailed") || "Login failed",
        }));
      }
    } catch (error: any) {
      setErrors((prev) => ({
        ...prev,
        otp:
          error.response?.data?.message ||
          error?.message ||
          t("networkError") ||
          "Network error. Please try again.",
      }));
    }
    setIsLoading(false);
  };

  // POS OTP logic (commented; for future use)
  // const handleCredentialsSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (role === "pos") {
  //     if (
  //       formData.userId &&
  //       formData.userId.length >= 3 &&
  //       formData.password &&
  //       formData.password.length >= 6 &&
  //       !errors.userId &&
  //       !errors.password
  //     ) {
  //       setStep("otp");
  //     }
  //   }
  // };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setFormData((prev) => ({ ...prev, otp: value }));
    setErrors((prev) => ({
      ...prev,
      otp: value.length > 0 && value.length < 6 ? t("otpError") : "",
    }));
  };

  const handleResendOtp = () => {
    setStep("credentials");
    setFormData((prev) => ({ ...prev, otp: "" }));
    setConfirmationResult(null);
  };

  // const handleBack = () => {
  //   if (step === "otp") {
  //     setStep("credentials");
  //   } else {
  //     navigate(-1);
  //   }
  // };

  // const renderPOSForm = () => {
  //   if (step === "credentials") {
  //     return (
  //       <>
  //         <div className="mb-8">
  //           <h2 className="text-3xl font-semibold text-gray-900 mb-2">
  //             {t("login")}
  //           </h2>
  //           <p className="text-gray-600 text-sm">{t("createPosAccount")}</p>
  //         </div>
  //         <form onSubmit={handleCredentialsSubmit} className="space-y-6">
  //           <div>
  //             <label className="block text-sm font-medium text-gray-700 mb-2">
  //               {t("email")}
  //             </label>
  //             <input
  //               type="text"
  //               placeholder={t("emailPlaceholder")}
  //               value={formData.userId}
  //               onChange={handleUserIdChange}
  //               className="w-full px-4 py-3 bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
  //               style={{ borderRadius: "0.75rem" }}
  //               required
  //             />
  //             {errors.userId && (
  //               <p className="text-red-500 text-xs mt-1">{errors.userId}</p>
  //             )}
  //           </div>
  //           <div>
  //             <label className="block text-sm font-medium text-gray-700 mb-2">
  //               {t("password")}
  //             </label>
  //             <div className="relative">
  //               <input
  //                 type={showPassword ? "text" : "password"}
  //                 placeholder={t("passwordPlaceholder")}
  //                 value={formData.password}
  //                 onChange={handlePasswordChange}
  //                 className="w-full px-4 py-3 bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors pr-12"
  //                 style={{ borderRadius: "0.75rem" }}
  //                 required
  //               />
  //               <button
  //                 type="button"
  //                 onClick={() => setShowPassword(!showPassword)}
  //                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
  //               >
  //                 {showPassword ? (
  //                   <EyeOff className="w-5 h-5" />
  //                 ) : (
  //                   <Eye className="w-5 h-5" />
  //                 )}
  //               </button>
  //             </div>
  //             {errors.password && (
  //               <p className="text-red-500 text-xs mt-1">{errors.password}</p>
  //             )}
  //           </div>
  //           <div className="flex items-center">
  //             <input
  //               type="checkbox"
  //               id="remember"
  //               checked={rememberMe}
  //               onChange={(e) => setRememberMe(e.target.checked)}
  //               className="w-4 h-4 text-green-500 bg-gray-100 border-gray-400 focus:ring-green-500"
  //               style={{ borderRadius: "0.25rem" }}
  //             />
  //             <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
  //               {t("rememberMe")}
  //             </label>
  //           </div>
  //           <button
  //             type="submit"
  //             disabled={isLoading}
  //             className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:from-green-600 hover:to-emerald-600 focus:outline-none transition-all duration-200 flex items-center justify-center"
  //             style={{ borderRadius: "0.75rem" }}
  //           >
  //             {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : t("login")}
  //           </button>
  //         </form>
  //       </>
  //     );
  //   }
  //   // ...other POS OTP step
  // };

  // KISAAN (farmer) form (active)
  const renderForm = () => {
    if (role === "kisaan" && step === "credentials") {
      return (
        <>
          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-gray-900 mb-2">
              {t("login")}
            </h2>
            <p className="text-gray-600 text-sm">{t("createKisaanAccount")}</p>
          </div>
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("phoneNumber")}
              </label>
              <input
                type="tel"
                placeholder={t("phoneNumberPlaceholder")}
                value={formData.phone}
                onChange={handlePhoneChange}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
                style={{ borderRadius: "0.75rem" }}
                required
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>
            {/* Password logic commented */}
            {/* <div> ...password field etc. </div> */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:from-green-600 hover:to-emerald-600 focus:outline-none transition-all duration-200 flex items-center justify-center"
              style={{ borderRadius: "0.75rem" }}
            >
              {isLoading ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                t("sendOtp")
              )}
            </button>
            <div id="recaptcha-container"></div>
          </form>
        </>
      );
    }
    if (role === "kisaan" && step === "otp") {
      return (
        <>
          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-gray-900 mb-2">
              {t("verifyOTP")}
            </h2>
            <p className="text-gray-600 text-sm mb-2">{t("otpDescription")}</p>
            <p className="text-gray-900 font-medium">{t("registeredNumber")}</p>
          </div>
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("otpCode")}
              </label>
              <input
                type="text"
                placeholder="000000"
                value={formData.otp ?? ""}
                onChange={handleOtpChange}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors text-center text-lg font-mono tracking-widest"
                style={{ borderRadius: "0.75rem" }}
                maxLength={6}
                required
              />
              {errors.otp && (
                <p className="text-red-500 text-xs mt-1">{errors.otp}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:from-green-600 hover:to-emerald-600 focus:outline-none transition-all duration-200"
              style={{ borderRadius: "0.75rem" }}
            >
              {isLoading ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                t("verifyLogin")
              )}
            </button>
            <button
              type="button"
              onClick={handleResendOtp}
              className="w-full text-green-600 hover:text-green-500 text-sm transition-colors"
            >
              {t("resendOTP")}
            </button>
          </form>
        </>
      );
    }
    // POS login for future (commented)
    // return role === "pos" ? renderPOSForm() : null;
    return null;
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
            {renderForm()}
            <div className="mt-8 text-center">
              <p className="text-gray-600 text-sm">
                {t("notMember")}{" "}
                <button
                  onClick={() => navigate(`/signup?role=${role}`)}
                  className="text-green-600 hover:text-green-500 font-medium transition-colors"
                >
                  {t("createAccount")}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Desktop: Left Side */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden shadow-lg">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${BGS.login_bg})`,
            borderTopRightRadius: "2.5rem",
            borderBottomRightRadius: "2.5rem",
          }}
        />
        <div className="relative z-10 flex flex-col justify-center items-start p-12 text-gray-900">
          {/* <button
            onClick={handleBack}
            className="absolute top-8 left-8 p-2 hover:bg-gray-100 rounded-full transition-colors"
            style={{ borderRadius: "0.5rem" }}
          >
            <ArrowLeft className="w-6 h-6 text-gray-800" />
          </button> */}
          <div className="max-w-md">
            <h1 className="text-5xl font-light mb-6 leading-tight">
              {t("leftTitle")} <br />
              {t("leftSubtitle")}
              <span className="font-bold text-green-600">
                {" "}
                {t("leftHighlight")}
              </span>
            </h1>
            <p className="text-lg text-green-900 opacity-90">
              {t("leftDescription")}
            </p>
          </div>
        </div>
      </div>
      {/* Desktop: Right/Form Side */}
      <div className="hidden lg:flex w-full lg:w-1/2 items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md px-6">
          {renderForm()}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              {t("notMember")}{" "}
              <button
                onClick={() => navigate(`/signup?role=${role}`)}
                className="text-green-600 hover:text-green-500 font-medium transition-colors"
              >
                {t("createAccount")}
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
