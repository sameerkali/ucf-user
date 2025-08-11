import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, User, Lock, Shield } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  
  // Mock role - you can change this to test different UI
  const role = "pos"; // or "pos"
  
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [formData, setFormData] = useState({
    phone: "",
    userId: "",
    password: "",
    otp: ""
  });

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation - just check if fields have values
    if (role === "kisaan" && formData.phone) {
      setStep("otp");
    } else if (role === "pos" && formData.userId && formData.password) {
      setStep("otp");
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.otp) {
      // For now, just show alert and navigate
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
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
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
              <div className="p-3 bg-gray-100 rounded-full inline-block mb-3">
                {role === "kisaan" ? (
                  <Phone className="w-6 h-6 text-gray-600" />
                ) : (
                  <User className="w-6 h-6 text-gray-600" />
                )}
              </div>
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
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                </div>
              ) : (
                <>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="User ID"
                      value={formData.userId}
                      onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      required
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
              >
                Send OTP
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="p-3 bg-green-100 rounded-full inline-block mb-3">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Enter the 6-digit code sent to
              </p>
              <p className="text-sm font-medium text-gray-900">
                {role === "kisaan" ? formData.phone : "your registered number"}
              </p>
            </div>

            <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Enter OTP"
                value={formData.otp}
                onChange={(e) => setFormData(prev => ({ ...prev, otp: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-lg font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                maxLength={6}
                required
              />

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
              >
                Verify & Login
              </button>

              <button
                type="button"
                onClick={() => setStep("credentials")}
                className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
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
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
