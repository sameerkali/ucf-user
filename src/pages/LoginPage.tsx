import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { BGS } from "../assets/assets";
import { useTranslation } from "react-i18next";
import { BASE_URL } from "../utils/urls";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

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

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({
    phone: "",
    userId: "",
    password: "",
  });
  const [formData, setFormData] = useState({
    phone: "",
    userId: "",
    password: "",
    otp: "",
  });

  const sanitizeInput = (value: string) => {
    return value.replace(/[<>"'&]/g, "");
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, phone: value }));
    if (value.length > 0 && value.length < 10) {
      setErrors((prev) => ({ ...prev, phone: t("phoneError") }));
    } else {
      setErrors((prev) => ({ ...prev, phone: "" }));
    }
  };

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = sanitizeInput(e.target.value);
    setFormData((prev) => ({ ...prev, userId: value }));
    if (value.length > 0 && value.length < 3) {
      setErrors((prev) => ({ ...prev, userId: t("userIdError") }));
    } else {
      setErrors((prev) => ({ ...prev, userId: "" }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = sanitizeInput(e.target.value).slice(0, 16);
    setFormData((prev) => ({ ...prev, password: value }));
    if (value.length > 0 && value.length < 6) {
      setErrors((prev) => ({ ...prev, password: t("passwordError") }));
    } else {
      setErrors((prev) => ({ ...prev, password: "" }));
    }
  };

  // Farmer login API call (no OTP logic)
  const handleFarmerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate
    if (
      formData.phone.length === 10 &&
      formData.password.length >= 6 &&
      !errors.phone &&
      !errors.password
    ) {
      setIsLoading(true);
      try {
        const response = await fetch(`${BASE_URL}api/farmer/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mobile: formData.phone,
            password: formData.password,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user) || "{}");
          navigate("/complete-profile?role=kisaan");
        } else {
          const errorData = await response.json();
          setErrors((prev) => ({
            ...prev,
            password: errorData.message || "Login failed",
          }));
        }
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          password: "Network error. Please try again.",
        }));
      }
      setIsLoading(false);
    }
  };

  // POS logic only (remains unchanged, uses step for OTP if needed)
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "pos") {
      if (
        formData.userId.length >= 3 &&
        formData.password.length >= 6 &&
        !errors.userId &&
        !errors.password
      ) {
        setStep("otp");
      }
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only POS uses OTP
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setFormData((prev) => ({ ...prev, otp: value }));
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.otp && formData.otp.length === 6) {
      navigate(`/complete-profile?role=pos`);
    }
  };

  const handleBack = () => {
    if (step === "otp") {
      setStep("credentials");
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen flex bg-black">
      {/* Left Side - Agricultural Background with Curved Border */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${BGS.login_bg})`,
            borderTopRightRadius: "2.5rem",
            borderBottomRightRadius: "2.5rem",
          }}
        >
          <div
            className="absolute inset-0 bg-gradient-to-br from-green-900/80 via-emerald-800/70 to-teal-900/80"
            style={{
              borderTopRightRadius: "2.5rem",
              borderBottomRightRadius: "2.5rem",
            }}
          ></div>
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
            style={{
              borderTopRightRadius: "2.5rem",
              borderBottomRightRadius: "2.5rem",
            }}
          ></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center items-start p-12 text-white">
          <button
            onClick={handleBack}
            className="absolute top-8 left-8 p-2 hover:bg-white/10 rounded-full transition-colors"
            style={{ borderRadius: "0.5rem" }}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="max-w-md">
            <h1 className="text-5xl font-light mb-6 leading-tight">
              {t("leftTitle")}
              <br />
              {t("leftSubtitle")}{" "}
              <span className="font-bold text-green-300">
                {t("leftHighlight")}
              </span>
            </h1>
            <p className="text-lg text-green-100 opacity-90">
              {t("leftDescription")}
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-black">
        <div className="w-full max-w-md">
          {role === "kisaan" ? (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-semibold text-white mb-2">
                  {t("login")}
                </h2>
                <p className="text-gray-400 text-sm">{t("farmerLoginDesc")}</p>
              </div>
              <form onSubmit={handleFarmerLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t("phoneNumber")}
                  </label>
                  <input
                    type="tel"
                    placeholder={t("phoneNumberPlaceholder")}
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                    style={{ borderRadius: "0.75rem" }}
                    required
                  />
                  {errors.phone && (
                    <p className="text-red-400 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t("password")}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder={t("passwordPlaceholder")}
                      value={formData.password}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors pr-12"
                      style={{ borderRadius: "0.75rem" }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:from-green-700 hover:to-emerald-700 focus:outline-none transition-all duration-200 flex items-center justify-center"
                  style={{ borderRadius: "0.75rem" }}
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    t("login")
                  )}
                </button>
              </form>
            </>
          ) : step === "credentials" ? (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-semibold text-white mb-2">
                  {t("login")}
                </h2>
                <p className="text-gray-400 text-sm">
                  {t("credentialsLoginDesc")}
                </p>
              </div>
              <form onSubmit={handleCredentialsSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t("email")}
                  </label>
                  <input
                    type="text"
                    placeholder={t("emailPlaceholder")}
                    value={formData.userId}
                    onChange={handleUserIdChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                    style={{ borderRadius: "0.75rem" }}
                    required
                  />
                  {errors.userId && (
                    <p className="text-red-400 text-xs mt-1">{errors.userId}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t("password")}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder={t("passwordPlaceholder")}
                      value={formData.password}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors pr-12"
                      style={{ borderRadius: "0.75rem" }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-green-500 bg-gray-800 border-gray-600 focus:ring-green-500"
                    style={{ borderRadius: "0.25rem" }}
                  />
                  <label
                    htmlFor="remember"
                    className="ml-2 text-sm text-gray-300"
                  >
                    {t("rememberMe")}
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:from-green-700 hover:to-emerald-700 focus:outline-none transition-all duration-200 flex items-center justify-center"
                  style={{ borderRadius: "0.75rem" }}
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    t("login")
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-semibold text-white mb-2">
                  {t("verifyOTP")}
                </h2>
                <p className="text-gray-400 text-sm mb-2">
                  {t("otpDescription")}
                </p>
                <p className="text-white font-medium">
                  {t("registeredNumber")}
                </p>
              </div>
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t("otpCode")}
                  </label>
                  <input
                    type="text"
                    placeholder="000000"
                    value={formData.otp ?? ""}
                    onChange={handleOtpChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors text-center text-lg font-mono tracking-widest"
                    style={{ borderRadius: "0.75rem" }}
                    maxLength={6}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:from-green-700 hover:to-emerald-700 focus:outline-none transition-all duration-200"
                  style={{ borderRadius: "0.75rem" }}
                >
                  {t("verifyLogin")}
                </button>
                <button
                  type="button"
                  onClick={() => setStep("credentials")}
                  className="w-full text-green-500 hover:text-green-400 text-sm transition-colors"
                >
                  {t("resendOTP")}
                </button>
              </form>
            </>
          )}

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              {t("notMember")}{" "}
              <button
                onClick={() => navigate(`/signup?role=${role}`)}
                className="text-green-500 hover:text-green-400 font-medium transition-colors"
              >
                {t("createAccount")}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
