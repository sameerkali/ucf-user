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
  clearRecaptcha,
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

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      clearRecaptcha();
    };
  }, []);

  const [errors, setErrors] = useState<{
    phone: string;
    otp?: string;
  }>({
    phone: "",
    otp: "",
  });

  const [formData, setFormData] = useState<{
    phone: string;
    otp: string;
  }>({
    phone: "",
    otp: "",
  });

  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [step, setStep] = useState<Step>("credentials");

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, phone: value }));
    setErrors((prev) => ({
      ...prev,
      phone: value.length > 0 && value.length < 10 ? t("phoneError") || "Invalid phone number" : "",
    }));
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setFormData((prev) => ({ ...prev, otp: value }));
    setErrors((prev) => ({
      ...prev,
      otp: value.length > 0 && value.length < 6 ? t("otpError") || "Invalid OTP" : "",
    }));
  };

  // Send OTP function
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.phone.length !== 10 || errors.phone) {
      setErrors((prev) => ({
        ...prev,
        phone: t("phoneError") || "Please enter a valid 10-digit phone number",
      }));
      return;
    }

    setIsLoading(true);
    try {
      // Setup invisible reCAPTCHA
      setupRecaptcha("recaptcha-container");
      
      // Send OTP
      const confirmation = await sendOTP(formData.phone);
      setConfirmationResult(confirmation);
      
      toast.success(t("otpSent") || "OTP sent successfully!");
      setStep("otp");
      
    } catch (error: any) {
      console.error("Firebase sendOTP error:", error);
      
      let errorMessage = t("otpSendError") || "Failed to send OTP. Please try again.";
      
      // Handle specific Firebase errors
      if (error?.code === "auth/too-many-requests") {
        errorMessage = "Too many requests. Please try again later.";
      } else if (error?.code === "auth/invalid-phone-number") {
        errorMessage = "Invalid phone number. Please check and try again.";
      } else if (error?.code === "auth/quota-exceeded") {
        errorMessage = "SMS quota exceeded. Please try again later.";
      }
      
      toast.error(errorMessage);
      
      // Clear and reset reCAPTCHA on error
      clearRecaptcha();
    }
    setIsLoading(false);
  };

  // Verify OTP function
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!confirmationResult || !formData.otp || formData.otp.length !== 6 || errors.otp) {
      setErrors((prev) => ({
        ...prev,
        otp: t("otpError") || "Please enter a valid 6-digit OTP",
      }));
      return;
    }

    setIsLoading(true);
    try {
      // Verify OTP with Firebase
      const userCredential = await verifyOTP(confirmationResult, formData.otp);
      const firebaseUser = userCredential.user;
      const idToken = await getIdTokenFromUser(firebaseUser);

      // Send idToken to backend for session creation
      const { data, status } = await api.post("/api/farmer/login", {
        mobile: formData.phone,
        idToken,
      });

      if (status === 200 && data.success) {
        // Store user session
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.result));
        
        const { bankVerified, otherDetailsVerified } = data.result;
        
        toast.success(t("loginSuccess") || "Login successful!");
        
        // Navigate based on profile completion status
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
      console.error("OTP verification error:", error);
      
      let errorMessage = t("networkError") || "Network error. Please try again.";
      
      if (error?.code === "auth/invalid-verification-code") {
        errorMessage = "Invalid OTP. Please check and try again.";
      } else if (error?.code === "auth/code-expired") {
        errorMessage = "OTP has expired. Please request a new one.";
      }
      
      setErrors((prev) => ({
        ...prev,
        otp: errorMessage,
      }));
    }
    setIsLoading(false);
  };

  // Resend OTP function
  const handleResendOtp = () => {
    setStep("credentials");
    setFormData((prev) => ({ ...prev, otp: "" }));
    setConfirmationResult(null);
    setErrors({ phone: "", otp: "" });
    clearRecaptcha();
  };

  // Form rendering
  const renderForm = () => {
    if (role === "kisaan" && step === "credentials") {
      return (
        <>
          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-gray-900 mb-2">
              {t("login") || "Login"}
            </h2>
            <p className="text-gray-600 text-sm">
              {t("createKisaanAccount") || "Enter your phone number to continue"}
            </p>
          </div>
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("phoneNumber") || "Phone Number"}
              </label>
              <input
                type="tel"
                placeholder={t("phoneNumberPlaceholder") || "Enter 10-digit phone number"}
                value={formData.phone}
                onChange={handlePhoneChange}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
                style={{ borderRadius: "0.75rem" }}
                required
                maxLength={10}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isLoading || formData.phone.length !== 10}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:from-green-600 hover:to-emerald-600 focus:outline-none transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderRadius: "0.75rem" }}
            >
              {isLoading ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                t("sendOtp") || "Send OTP"
              )}
            </button>
            
            {/* Invisible reCAPTCHA container - hidden from view */}
            <div id="recaptcha-container" style={{ display: "none" }}></div>
          </form>
        </>
      );
    }
    
    if (role === "kisaan" && step === "otp") {
      return (
        <>
          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-gray-900 mb-2">
              {t("verifyOTP") || "Verify OTP"}
            </h2>
            <p className="text-gray-600 text-sm mb-2">
              {t("otpDescription") || "We've sent a 6-digit code to your phone"}
            </p>
            <p className="text-gray-900 font-medium">
              +91 {formData.phone}
            </p>
          </div>
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("otpCode") || "Enter OTP"}
              </label>
              <input
                type="text"
                placeholder="000000"
                value={formData.otp}
                onChange={handleOtpChange}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors text-center text-lg font-mono tracking-widest"
                style={{ borderRadius: "0.75rem" }}
                maxLength={6}
                required
                autoComplete="one-time-code"
              />
              {errors.otp && (
                <p className="text-red-500 text-xs mt-1">{errors.otp}</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isLoading || formData.otp.length !== 6}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:from-green-600 hover:to-emerald-600 focus:outline-none transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderRadius: "0.75rem" }}
            >
              {isLoading ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                t("verifyLogin") || "Verify & Login"
              )}
            </button>
            
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isLoading}
              className="w-full text-green-600 hover:text-green-500 text-sm transition-colors disabled:opacity-50"
            >
              {t("resendOTP") || "Didn't receive code? Resend"}
            </button>
          </form>
        </>
      );
    }
    
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
                {t("notMember") || "Don't have an account?"}{" "}
                <button
                  onClick={() => navigate(`/signup?role=${role}`)}
                  className="text-green-600 hover:text-green-500 font-medium transition-colors"
                >
                  {t("createAccount") || "Sign up"}
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
          <div className="max-w-md">
            <h1 className="text-5xl font-light mb-6 leading-tight">
              {t("leftTitle") || "Welcome"} <br />
              {t("leftSubtitle") || "Back to"}
              <span className="font-bold text-green-600">
                {" "}
                {t("leftHighlight") || "Your Farm"}
              </span>
            </h1>
            <p className="text-lg text-green-900 opacity-90">
              {t("leftDescription") || "Connect with your farming community and grow together"}
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
              {t("notMember") || "Don't have an account?"}{" "}
              <button
                onClick={() => navigate(`/signup?role=${role}`)}
                className="text-green-600 hover:text-green-500 font-medium transition-colors"
              >
                {t("createAccount") || "Sign up"}
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
