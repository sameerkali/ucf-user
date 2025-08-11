import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, User, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  
  const role = "kisaan"; // or "kisaan"
  
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    phone: "",
    userId: "",
    password: "",
    otp: ""
  });
  const [formData, setFormData] = useState({
    phone: "",
    userId: "",
    password: "",
    otp: ""
  });

  // Input sanitization to prevent XSS
  const sanitizeInput = (value: string) => {
    return value.replace(/[<>\"'&]/g, '');
  };

  // Phone validation (only numbers, max 10 digits)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData(prev => ({ ...prev, phone: value }));
    
    if (value.length > 0 && value.length < 10) {
      setErrors(prev => ({ ...prev, phone: "Phone number must be 10 digits" }));
    } else {
      setErrors(prev => ({ ...prev, phone: "" }));
    }
  };

  // User ID validation
  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = sanitizeInput(e.target.value);
    setFormData(prev => ({ ...prev, userId: value }));
    
    if (value.length > 0 && value.length < 3) {
      setErrors(prev => ({ ...prev, userId: "User ID must be at least 3 characters" }));
    } else {
      setErrors(prev => ({ ...prev, userId: "" }));
    }
  };

  // Password validation (max 16 chars)
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = sanitizeInput(e.target.value).slice(0, 16);
    setFormData(prev => ({ ...prev, password: value }));
    
    if (value.length > 0 && value.length < 6) {
      setErrors(prev => ({ ...prev, password: "Password must be at least 6 characters" }));
    } else {
      setErrors(prev => ({ ...prev, password: "" }));
    }
  };

  // OTP validation (only numbers, max 6 digits)
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({ ...prev, otp: value }));
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (role === "kisaan") {
      if (formData.phone.length === 10 && !errors.phone) {
        setStep("otp");
      }
    } else if (role === "pos") {
      if (formData.userId.length >= 3 && formData.password.length >= 6 && !errors.userId && !errors.password) {
        setStep("otp");
      }
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.otp.length === 6) {
      alert(`${role === "kisaan" ? "Kisaan" : "POS"} Login Successful!`);
      navigate("/");
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
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#FAF9F6' }}>
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm">
        <div className="flex items-center mb-6">
          <button
            onClick={handleBack}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1 text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {role === "kisaan" ? "Kisaan Login" : "POS Login"}
            </h2>
          </div>
        </div>

        {step === "credentials" ? (
          <>
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600">
                {role === "kisaan" 
                  ? "Enter your phone number to continue" 
                  : "Enter your credentials to continue"
                }
              </p>
            </div>

            <form onSubmit={handleCredentialsSubmit} className="flex flex-col gap-4">
              {role === "kisaan" ? (
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none transition bg-white text-gray-900"
                    required
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
              ) : (
                <>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="User ID"
                      value={formData.userId}
                      onChange={handleUserIdChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none transition bg-white text-gray-900"
                      required
                    />
                    {errors.userId && <p className="text-red-500 text-xs mt-1">{errors.userId}</p>}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={formData.password}
                      onChange={handlePasswordChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none transition bg-white text-gray-900"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 focus:outline-none transition"
              >
                Send OTP
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600 mb-2">
                Enter the 6-digit code sent to
              </p>
              <p className="text-sm font-medium text-gray-900">
                {role === "kisaan" ? `+91 ${formData.phone}` : "your registered number"}
              </p>
            </div>

            <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Enter OTP"
                value={formData.otp}
                onChange={handleOtpChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-lg font-mono tracking-wider focus:outline-none transition bg-white text-gray-900"
                maxLength={6}
                required
              />

              <button
                type="submit"
                className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 focus:outline-none transition"
              >
                Verify & Login
              </button>

              <button
                type="button"
                onClick={() => setStep("credentials")}
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors focus:outline-none"
              >
                Resend OTP
              </button>
            </form>
          </>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-gray-900 hover:text-gray-700 font-medium focus:outline-none"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
