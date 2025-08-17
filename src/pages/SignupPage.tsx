import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { BGS } from "../assets/assets";
import { useTranslation } from "react-i18next";
import { BASE_URL } from "../utils/urls";
import { Loader2 } from "lucide-react";

export default function SignupPage() {
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

  const [step, setStep] = useState<"signup" | "otp">("signup");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errors, setErrors] = useState({
    fullName: "",
    fatherName: "",
    aadhar: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
    state: "",
    district: "",
    tehsil: "",
    block: "",
    village: "",
    pincode: "",
    name: "",
    email: "",
    gst: "",
    otp: "",
    terms: "",
  });

  const [formData, setFormData] = useState({
    fullName: "",
    fatherName: "",
    aadhar: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
    state: "",
    district: "",
    tehsil: "",
    block: "",
    village: "",
    pincode: "",
    name: "",
    email: "",
    gst: "",
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

  const handleAadharChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 12);
    setFormData((prev) => ({ ...prev, aadhar: value }));

    if (value.length > 0 && value.length < 12) {
      setErrors((prev) => ({ ...prev, aadhar: t("aadharError") }));
    } else {
      setErrors((prev) => ({ ...prev, aadhar: "" }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, password: value }));

    if (value.length > 0 && value.length < 6) {
      setErrors((prev) => ({
        ...prev,
        password: "Password must be at least 6 characters",
      }));
    } else {
      setErrors((prev) => ({ ...prev, password: "" }));
    }
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, confirmPassword: value }));

    if (value !== formData.password) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
    } else {
      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
    }
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setFormData((prev) => ({ ...prev, pincode: value }));

    if (value.length > 0 && value.length < 6) {
      setErrors((prev) => ({ ...prev, pincode: "Pincode must be 6 digits" }));
    } else {
      setErrors((prev) => ({ ...prev, pincode: "" }));
    }
  };

  const handleAddressFieldChange = (field: string, value: string) => {
    const sanitizedValue = sanitizeInput(value);
    setFormData((prev) => ({ ...prev, [field]: sanitizedValue }));

    if (sanitizedValue.length > 0 && sanitizedValue.length < 2) {
      setErrors((prev) => ({
        ...prev,
        [field]: "This field must be at least 2 characters",
      }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // ... (keep other existing handlers like handleEmailChange, handleGstChange, etc.)

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = sanitizeInput(e.target.value);
    setFormData((prev) => ({ ...prev, email: value }));

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value.length > 0 && !emailRegex.test(value)) {
      setErrors((prev) => ({ ...prev, email: t("emailError") }));
    } else {
      setErrors((prev) => ({ ...prev, email: "" }));
    }
  };

  const handleGstChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = sanitizeInput(e.target.value.toUpperCase()).slice(0, 15);
    setFormData((prev) => ({ ...prev, gst: value }));

    const gstRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (value.length > 0 && value.length === 15 && !gstRegex.test(value)) {
      setErrors((prev) => ({ ...prev, gst: t("gstInvalidError") }));
    } else if (value.length > 0 && value.length < 15) {
      setErrors((prev) => ({ ...prev, gst: t("gstLengthError") }));
    } else {
      setErrors((prev) => ({ ...prev, gst: "" }));
    }
  };

  const handleNameChange = (field: string, value: string) => {
    const sanitizedValue = sanitizeInput(value);
    setFormData((prev) => ({ ...prev, [field]: sanitizedValue }));

    if (sanitizedValue.length > 0 && sanitizedValue.length < 2) {
      setErrors((prev) => ({ ...prev, [field]: t("nameError") }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = sanitizeInput(e.target.value);
    setFormData((prev) => ({ ...prev, address: value }));

    if (value.length > 0 && value.length < 10) {
      setErrors((prev) => ({ ...prev, address: t("addressError") }));
    } else {
      setErrors((prev) => ({ ...prev, address: "" }));
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setFormData((prev) => ({ ...prev, otp: value }));
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreeToTerms) {
      setErrors((prev) => ({ ...prev, terms: t("termsError") }));
      return;
    } else {
      setErrors((prev) => ({ ...prev, terms: "" }));
    }

    const hasErrors = Object.values(errors).some((error) => error !== "");
    if (hasErrors) return;

    if (role === "kisaan") {
      // Validate farmer form
      if (
        formData.fullName &&
        formData.fatherName &&
        formData.aadhar.length === 12 &&
        formData.phone.length === 10 &&
        formData.password.length >= 6 &&
        formData.password === formData.confirmPassword &&
        formData.state &&
        formData.district &&
        formData.tehsil &&
        formData.block &&
        formData.village &&
        formData.pincode.length === 6
      ) {
        setIsLoading(true);
        try {
          // Call farmer registration API
          const response = await fetch(`${BASE_URL}api/farmer/register`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: formData.fullName,
              fatherName: formData.fatherName,
              password: formData.password,
              mobile: formData.phone,
              adharNo: formData.aadhar,
              address: {
                state: formData.state,
                district: formData.district,
                tehsil: formData.tehsil,
                block: formData.block,
                village: formData.village,
                pincode: formData.pincode,
              },
              role: "farmer",
            }),
          });

          if (response.ok) {
            setStep("otp");
          } else {
            const errorData = await response.json();
            alert(
              `Registration failed: ${errorData.message || "Unknown error"}`
            );
          }
        } catch (error) {
          alert("Network error. Please try again.");
          console.error("Registration error:", error);
        }
        setIsLoading(false);
      }
    } else if (role === "pos") {
      if (
        formData.name &&
        formData.address.length >= 10 &&
        formData.email &&
        formData.gst.length === 15 &&
        !errors.email &&
        !errors.gst
      ) {
        setStep("otp");
      }
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.otp.length === 6) {
      if (role === "kisaan") {
        alert(t("kisaanSignupSuccess"));
        navigate("/complete-profile");
      } else {
        alert(t("posSignupSuccess"));
        navigate("/");
      }
    }
  };

  const handleBack = () => {
    if (step === "otp") {
      setStep("signup");
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
            backgroundImage: `url(${BGS.signup_bg})`,
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
              {t("signupLeftTitle")}
              <br />
              <span className="font-bold text-green-300">
                {t("signupLeftHighlight")}
              </span>
            </h1>
            <p className="text-lg text-green-100 opacity-90">
              {t("signupLeftDescription")}
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-black overflow-y-auto">
        <div className="w-full max-w-md">
          {step === "signup" ? (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-semibold text-white mb-2">
                  {role === "kisaan" ? t("joinAsKisaan") : t("joinAsPos")}
                </h2>
                <p className="text-gray-400 text-sm">
                  {role === "kisaan"
                    ? t("createKisaanAccount")
                    : t("createPosAccount")}
                </p>
              </div>

              <form onSubmit={handleSignupSubmit} className="space-y-4">
                {role === "kisaan" ? (
                  <>
                    <div>
                      <input
                        type="text"
                        placeholder={t("fullName")}
                        value={formData.fullName}
                        onChange={(e) =>
                          handleNameChange("fullName", e.target.value)
                        }
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                        style={{ borderRadius: "0.75rem" }}
                        required
                      />
                      {errors.fullName && (
                        <p className="text-red-400 text-xs mt-1">
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder={t("fatherName")}
                        value={formData.fatherName}
                        onChange={(e) =>
                          handleNameChange("fatherName", e.target.value)
                        }
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                        style={{ borderRadius: "0.75rem" }}
                        required
                      />
                      {errors.fatherName && (
                        <p className="text-red-400 text-xs mt-1">
                          {errors.fatherName}
                        </p>
                      )}
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder={t("aadharNumber")}
                        value={formData.aadhar}
                        onChange={handleAadharChange}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                        style={{ borderRadius: "0.75rem" }}
                        required
                      />
                      {errors.aadhar && (
                        <p className="text-red-400 text-xs mt-1">
                          {errors.aadhar}
                        </p>
                      )}
                    </div>

                    <div>
                      <input
                        type="tel"
                        placeholder={t("phoneNumber")}
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                        style={{ borderRadius: "0.75rem" }}
                        required
                      />
                      {errors.phone && (
                        <p className="text-red-400 text-xs mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <input
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                        style={{ borderRadius: "0.75rem" }}
                        required
                      />
                      {errors.password && (
                        <p className="text-red-400 text-xs mt-1">
                          {errors.password}
                        </p>
                      )}
                    </div>

                    <div>
                      <input
                        type="password"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                        style={{ borderRadius: "0.75rem" }}
                        required
                      />
                      {errors.confirmPassword && (
                        <p className="text-red-400 text-xs mt-1">
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>

                    {/* Address Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          placeholder="State"
                          value={formData.state}
                          onChange={(e) =>
                            handleAddressFieldChange("state", e.target.value)
                          }
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                          style={{ borderRadius: "0.75rem" }}
                          required
                        />
                        {errors.state && (
                          <p className="text-red-400 text-xs mt-1">
                            {errors.state}
                          </p>
                        )}
                      </div>

                      <div>
                        <input
                          type="text"
                          placeholder="District"
                          value={formData.district}
                          onChange={(e) =>
                            handleAddressFieldChange("district", e.target.value)
                          }
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                          style={{ borderRadius: "0.75rem" }}
                          required
                        />
                        {errors.district && (
                          <p className="text-red-400 text-xs mt-1">
                            {errors.district}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          placeholder="Tehsil"
                          value={formData.tehsil}
                          onChange={(e) =>
                            handleAddressFieldChange("tehsil", e.target.value)
                          }
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                          style={{ borderRadius: "0.75rem" }}
                          required
                        />
                        {errors.tehsil && (
                          <p className="text-red-400 text-xs mt-1">
                            {errors.tehsil}
                          </p>
                        )}
                      </div>

                      <div>
                        <input
                          type="text"
                          placeholder="Block"
                          value={formData.block}
                          onChange={(e) =>
                            handleAddressFieldChange("block", e.target.value)
                          }
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                          style={{ borderRadius: "0.75rem" }}
                          required
                        />
                        {errors.block && (
                          <p className="text-red-400 text-xs mt-1">
                            {errors.block}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          placeholder="Village"
                          value={formData.village}
                          onChange={(e) =>
                            handleAddressFieldChange("village", e.target.value)
                          }
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                          style={{ borderRadius: "0.75rem" }}
                          required
                        />
                        {errors.village && (
                          <p className="text-red-400 text-xs mt-1">
                            {errors.village}
                          </p>
                        )}
                      </div>

                      <div>
                        <input
                          type="text"
                          placeholder="Pincode"
                          value={formData.pincode}
                          onChange={handlePincodeChange}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                          style={{ borderRadius: "0.75rem" }}
                          required
                        />
                        {errors.pincode && (
                          <p className="text-red-400 text-xs mt-1">
                            {errors.pincode}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <input
                        type="text"
                        placeholder={t("businessName")}
                        value={formData.name}
                        onChange={(e) =>
                          handleNameChange("name", e.target.value)
                        }
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                        style={{ borderRadius: "0.75rem" }}
                        required
                      />
                      {errors.name && (
                        <p className="text-red-400 text-xs mt-1">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <textarea
                        placeholder={t("businessAddress")}
                        value={formData.address}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors resize-none"
                        style={{ borderRadius: "0.75rem" }}
                        rows={3}
                        required
                      />
                      {errors.address && (
                        <p className="text-red-400 text-xs mt-1">
                          {errors.address}
                        </p>
                      )}
                    </div>

                    <div>
                      <input
                        type="email"
                        placeholder={t("emailAddress")}
                        value={formData.email}
                        onChange={handleEmailChange}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                        style={{ borderRadius: "0.75rem" }}
                        required
                      />
                      {errors.email && (
                        <p className="text-red-400 text-xs mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder={t("gstNumber")}
                        value={formData.gst}
                        onChange={handleGstChange}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                        style={{ borderRadius: "0.75rem" }}
                        required
                      />
                      {errors.gst && (
                        <p className="text-red-400 text-xs mt-1">
                          {errors.gst}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* Terms and Conditions */}
                <div className="space-y-2">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      className="w-4 h-4 text-green-500 bg-gray-800 border-gray-600 focus:ring-green-500 mt-1"
                      style={{ borderRadius: "0.25rem" }}
                    />
                    <label
                      htmlFor="terms"
                      className="ml-2 text-sm text-gray-300"
                    >
                      {t("agreeToTermsStart")}{" "}
                      <button
                        type="button"
                        className="text-green-500 hover:text-green-400 underline transition-colors"
                        onClick={() => window.open("/terms", "_blank")}
                      >
                        {t("termsAndConditions")}
                      </button>{" "}
                      {t("and")}{" "}
                      <button
                        type="button"
                        className="text-green-500 hover:text-green-400 underline transition-colors"
                        onClick={() => window.open("/privacy", "_blank")}
                      >
                        {t("privacyPolicy")}
                      </button>
                    </label>
                  </div>
                  {errors.terms && (
                    <p className="text-red-400 text-xs">{errors.terms}</p>
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
                    t("register")
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
                  {role === "kisaan" ? `+91 ${formData.phone}` : formData.email}
                </p>
              </div>

              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div>
                  <input
                    type="text"
                    placeholder="000000"
                    value={formData.otp}
                    onChange={handleOtpChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors text-center text-lg font-mono tracking-widest"
                    style={{ borderRadius: "0.75rem" }}
                    maxLength={6}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:from-green-700 hover:to-emerald-700 focus:outline-none transition-all duration-200"
                  style={{ borderRadius: "0.75rem" }}
                >
                  {t("createAccount")}
                </button>

                <button
                  type="button"
                  onClick={() => setStep("signup")}
                  className="w-full text-green-500 hover:text-green-400 text-sm transition-colors"
                >
                  {t("resendOTP")}
                </button>
              </form>
            </>
          )}

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              {t("alreadyHaveAccount")}{" "}
              <button
                onClick={() => navigate("/login")}
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
