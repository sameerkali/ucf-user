import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { BGS, GLOBLE, ILLUSTRATIONS } from "../assets/assets";
import { useTranslation } from "react-i18next";
import api from "../api/axios";
import toast from "react-hot-toast";

// Utility: basic email regex (client-side format check only)
const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

export default function LoginPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // role management: unchanged
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

  // errors & form data generalized to handle both roles
  const [errors, setErrors] = useState<{
    phone?: string;
    password?: string;
    email?: string;
    otp?: string;
  }>({});

  const [formData, setFormData] = useState<{
    phone: string;          // farmer only
    password?: string;      // farmer and pos first step
    email?: string;         // pos only
    otp?: string;           // pos after verify step (joined string)
  }>({
    phone: "",
    password: "",
    email: "",
    otp: "",
  });

  const sanitizeInput = (value: string) => value.replace(/[<>"'&]/g, "");

  // Farmer handlers (unchanged)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, phone: value }));
    setErrors((prev) => ({
      ...prev,
      phone:
        value.length > 0 && value.length < 10
          ? t("phoneError") || "Invalid phone number"
          : "",
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = sanitizeInput(e.target.value).slice(0, 16);
    setFormData((prev) => ({ ...prev, password: value }));
    setErrors((prev) => ({
      ...prev,
      password:
        value.length > 0 && value.length < 6
          ? t("passwordError") || "Password must be at least 6 characters"
          : "",
    }));
  };

  const handleFarmerLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      formData.phone.length !== 10 ||
      !formData.password ||
      (formData.password?.length ?? 0) < 6 ||
      errors.phone ||
      errors.password
    ) {
      if (formData.phone.length !== 10) {
        setErrors((prev) => ({
          ...prev,
          phone: t("phoneError") || "Please enter a valid 10-digit phone number",
        }));
      }
      if (!formData.password || (formData.password?.length ?? 0) < 6) {
        setErrors((prev) => ({
          ...prev,
          password: t("passwordError") || "Password must be at least 6 characters",
        }));
      }
      return;
    }

    setIsLoading(true);
    try {
      const { data, status } = await api.post("/api/farmer/login", {
        mobile: formData.phone,
        password: formData.password,
      });

      if (
        status === 200 &&
        data.success &&
        Array.isArray(data.result) &&
        data.result.length > 0
      ) {
        const user = data.result[0];
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("role", "kisaan");

        toast.success(t("loginSuccess") || "Login successful!");

        const { bankVerified, otherDetailsVerified } = user;
        if (bankVerified && otherDetailsVerified) {
          navigate("/home");
        } else if (bankVerified && !otherDetailsVerified) {
          navigate("/complete-profile?role=kisaan&step=2");
        } else {
          navigate("/complete-profile?role=kisaan&step=1");
        }
      } else {
        setErrors((prev) => ({
          ...prev,
          password: data.message || t("loginFailed") || "Login failed",
        }));
      }
    } catch (error: any) {
      setErrors((prev) => ({
        ...prev,
        password:
          error.response?.data?.message ||
          error?.message ||
          (t("networkError") || "Network error. Please try again."),
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // =============== POS Login: Email + Password -> Verify -> OTP ===============

  // POS flow state
  const [posStep, setPosStep] = useState<"credentials" | "otp">("credentials");
  const isPos = role === "pos";

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = sanitizeInput(e.target.value).slice(0, 100);
    setFormData((prev) => ({ ...prev, email: value }));
    setErrors((prev) => ({
      ...prev,
      email:
        value.length > 0 && !emailRegex.test(value)
          ? t("invalidEmail") || "Invalid email format"
          : "",
    }));
  };

  const canSendOtp =
    !!formData.email &&
    emailRegex.test(formData.email || "") &&
    !!formData.password &&
    (formData.password?.length ?? 0) >= 6 &&
    !errors.email &&
    !errors.password;

  const handlePosSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate before calling API
    const nextErrors: typeof errors = {};
    if (!formData.email || !emailRegex.test(formData.email)) {
      nextErrors.email = t("invalidEmail") || "Please enter a valid email";
    }
    if (!formData.password || (formData.password?.length ?? 0) < 6) {
      nextErrors.password =
        t("passwordError") || "Password must be at least 6 characters";
    }
    if (Object.keys(nextErrors).length) {
      setErrors((prev) => ({ ...prev, ...nextErrors }));
      return;
    }

    setIsLoading(true);
    try {
      // API 1: email + password -> sends OTP to email
      const { data, status } = await api.post("/api/pos/login", {
        email: formData.email,
        password: formData.password,
      });

      // Expecting { statusCode: 200, message: "OTP sent to your email" }
      if ((status === 200 || status === 201) && data?.statusCode === 200) {
        toast.success(data?.message || t("otpSent") || "OTP sent to your email");
        setPosStep("otp");
        // Reset OTP
        setOtpDigits(["", "", "", ""]);
        setFormData((prev) => ({ ...prev, otp: "" }));
        // Focus first OTP input slightly later to ensure render
        setTimeout(() => otpRefs.current[0]?.focus(), 50);
      } else {
        setErrors((prev) => ({
          ...prev,
          email: data?.message || t("loginFailed") || "Login failed",
        }));
      }
    } catch (error: any) {
      setErrors((prev) => ({
        ...prev,
        email:
          error?.response?.data?.message ||
          error?.message ||
          (t("networkError") || "Network error. Please try again."),
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // OTP input handling (4-digit)
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", ""]);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Derived value (joined)
  const otpValue = useMemo(() => otpDigits.join(""), [otpDigits]);

  useEffect(() => {
    if (!isPos || posStep !== "otp") return;
    setFormData((prev) => ({ ...prev, otp: otpValue }));
    // Clear otp error as user types
    if (otpValue.length > 0) {
      setErrors((prev) => ({ ...prev, otp: "" }));
    }
  }, [otpValue, isPos, posStep]);

  const handleOtpChange = (idx: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // accept only digits; allow paste multi-digits
    const digitsOnly = raw.replace(/\D/g, "");
    if (!digitsOnly) {
      // if cleared, set empty and stay
      setOtpDigits((prev) => {
        const next = [...prev];
        next[idx] = "";
        return next;
      });
      return;
    }
    // Handle single digit typed
    if (digitsOnly.length === 1) {
      setOtpDigits((prev) => {
        const next = [...prev];
        next[idx] = digitsOnly;
        return next;
      });
      // move to next
      const nextRef = otpRefs.current[idx + 1];
      if (nextRef) nextRef.focus();
      return;
    }
    // Handle paste of multiple digits
    const chars = digitsOnly.split("").slice(0, 4);
    setOtpDigits((prev) => {
      const next = [...prev];
      let pointer = idx;
      for (let c of chars) {
        if (pointer > 3) break;
        next[pointer] = c;
        pointer++;
      }
      return next;
    });
    // focus last filled
    const lastIdx = Math.min(idx + chars.length - 1, 3);
    const lastRef = otpRefs.current[lastIdx];
    if (lastRef) lastRef.focus();
  };

  const handleOtpKeyDown = (idx: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    if (e.key === "Backspace" && !target.value) {
      const prevRef = otpRefs.current[idx - 1];
      if (prevRef) {
        prevRef.focus();
        setOtpDigits((prev) => {
          const next = [...prev];
          next[idx - 1] = "";
          return next;
        });
      }
    } else if (e.key === "ArrowLeft") {
      const prevRef = otpRefs.current[idx - 1];
      if (prevRef) prevRef.focus();
    } else if (e.key === "ArrowRight") {
      const nextRef = otpRefs.current[idx + 1];
      if (nextRef) nextRef.focus();
    }
  };

  const canSubmitOtp = otpValue.length === 4 && !!formData.email;

  const handlePosLoginWithOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmitOtp) {
      setErrors((prev) => ({
        ...prev,
        otp: t("enterOtp") || "Please enter 4-digit OTP",
      }));
      return;
    }

    setIsLoading(true);
    try {
      // API 2: email + otp -> login
      const { data, status } = await api.post("/api/pos/login", {
        email: formData.email,
        otp: otpValue,
      });

      // Success sample: statusCode 200, data: [user], token, message
      if ((status === 200 || status === 201) && data?.statusCode === 200) {
        localStorage.setItem("token", data.token);
        // Backend shows array in data; keep compatibility with earlier code expecting data.data or data.result
        const userObj = Array.isArray(data.data) ? data.data[0] : data.data;
        localStorage.setItem("user", JSON.stringify(userObj));
        localStorage.setItem("role", "pos");

        toast.success(data?.message || t("loginSuccess") || "Login successful!");

        const { bankVerified, otherDetailsVerified } = userObj || {};
        if (bankVerified && otherDetailsVerified) {
          navigate("/home");
        } else if (bankVerified && !otherDetailsVerified) {
          navigate("/complete-profile?role=pos&step=2");
        } else {
          navigate("/complete-profile?role=pos&step=1");
        }
      } else {
        // Wrong OTP sample: { status_code: 400, message: "No OTP found. Please login again." }
        const msg =
          data?.message ||
          t("loginFailed") ||
          "Login failed";
        setErrors((prev) => ({ ...prev, otp: msg }));
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        (t("networkError") || "Network error. Please try again.");
      setErrors((prev) => ({ ...prev, otp: msg }));
    } finally {
      setIsLoading(false);
    }
  };

  // =============== UI Renderers ===============

  const renderPosCredentials = () => (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-900 mb-2">
          {t("posLogin") || "POS Login"}
        </h2>
        <p className="text-gray-600 text-sm">
          {t("createPosAccount") || "Enter email and password to verify"}
        </p>
      </div>
      <form onSubmit={handlePosSendOtp} className="space-y-6" noValidate>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("email") || "Email"}
          </label>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder={t("emailPlaceholder") || "Enter email address"}
            value={formData.email || ""}
            onChange={handleEmailChange}
            className="w-full px-4 py-3 bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
            style={{ borderRadius: "0.75rem" }}
            required
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("password") || "Password"}
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder={t("passwordPlaceholder") || "Enter your password"}
              value={formData.password || ""}
              onChange={handlePasswordChange}
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors pr-12"
              style={{ borderRadius: "0.75rem" }}
              required
              minLength={6}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading || !canSendOtp}
          className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:from-green-600 hover:to-emerald-600 focus:outline-none transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ borderRadius: "0.75rem" }}
        >
          {isLoading ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : (
            t("verify") || "Verify"
          )}
        </button>
      </form>
    </>
  );

  const renderOtpInputs = () => (
    <div className="flex gap-3 justify-between">
      {otpDigits.map((digit, idx) => (
        <input
          key={idx}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          onChange={handleOtpChange(idx)}
          onKeyDown={handleOtpKeyDown(idx)}
          ref={(el) => (otpRefs.current[idx] = el)}
          className="w-14 h-14 text-center text-xl bg-gray-100 border border-gray-300 text-gray-900 focus:outline-none focus:border-green-500 transition-colors"
          style={{ borderRadius: "0.75rem" }}
          autoComplete={idx === 0 ? "one-time-code" : "off"}
        />
      ))}
    </div>
  );

  const renderPosOtp = () => (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-900 mb-2">
          {t("enterOtp") || "Enter OTP"}
        </h2>
        <p className="text-gray-600 text-sm">
          {t("otpSentToEmail") || "We’ve sent a 4-digit OTP to your email"}
        </p>
      </div>
      <form onSubmit={handlePosLoginWithOtp} className="space-y-6" noValidate>
        {renderOtpInputs()}
        {errors.otp && <p className="text-red-500 text-xs">{errors.otp}</p>}
        <button
          type="submit"
          disabled={isLoading || !canSubmitOtp}
          className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:from-green-600 hover:to-emerald-600 focus:outline-none transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ borderRadius: "0.75rem" }}
        >
          {isLoading ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : (
            t("login") || "Login"
          )}
        </button>
        <p className="text-gray-600 text-xs text-center">
          {t("didntReceiveOtp") || "Didn’t receive the OTP?"}{" "}
          <button
            type="button"
            className="text-green-600 hover:text-green-500 font-medium transition-colors"
            onClick={(e) => handlePosSendOtp(e as unknown as React.FormEvent)}
          >
            {t("resendOtp") || "Resend OTP"}
          </button>
        </p>
      </form>
    </>
  );

  const renderPosForm = () => {
    if (posStep === "credentials") return renderPosCredentials();
    if (posStep === "otp") return renderPosOtp();
    return null;
  };

  const renderForm = () => {
    if (role === "kisaan") {
      return (
        <>
          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-gray-900 mb-2">
              {t("login") || "Login"}
            </h2>
            <p className="text-gray-600 text-sm">
              {t("createKisaanAccount") ||
                "Enter your phone number and password to continue"}
            </p>
          </div>
          <form onSubmit={handleFarmerLogin} className="space-y-6" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("phoneNumber") || "Phone Number"}
              </label>
              <input
                type="tel"
                placeholder={
                  t("phoneNumberPlaceholder") || "Enter 10-digit phone number"
                }
                value={formData.phone}
                onChange={handlePhoneChange}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
                style={{ borderRadius: "0.75rem" }}
                maxLength={10}
                required
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("password") || "Password"}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={t("passwordPlaceholder") || "Enter your password"}
                  value={formData.password}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors pr-12"
                  style={{ borderRadius: "0.75rem" }}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={
                isLoading || formData.phone.length !== 10 || !formData.password
              }
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:from-green-600 hover:to-emerald-600 focus:outline-none transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderRadius: "0.75rem" }}
            >
              {isLoading ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                t("login") || "Login"
              )}
            </button>
          </form>
        </>
      );
    }

    if (role === "pos") {
      return renderPosForm();
    }

    return null;
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
              {t("welcome") || "Welcome"} <br />
              {t("leftSubtitle") || "Back to"}
              <span className="font-bold text-green-600"> {t("leftHighlight") || "Your Farm"}</span>
            </h1>
            <p className="text-lg text-green-900 opacity-90">
              {t("leftDescription") ||
                "Connect with your farming community and grow together"}
            </p>
          </div>
        </div>
      </div>

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

      <div
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 z-50 cursor-pointer p-2 rounded-full flex items-center gap-3"
      >
        <ArrowLeft className="h-6 w-6 hover:text-gray-900" />
        <img src={GLOBLE.ucf_logo} alt="Brand Logo" className="h-15 w-auto" />
      </div>
    </div>
  );
}
