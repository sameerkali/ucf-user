import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";


export default function SignupPage() {
  const navigate = useNavigate();
  
  const [role] = useState<"kisaan" | "pos">("kisaan"); // or "pos"  
  const [step, setStep] = useState<"signup" | "otp">("signup");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errors, setErrors] = useState({
    fullName: "",
    fatherName: "",
    aadhar: "",
    phone: "",
    address: "",
    name: "",
    email: "",
    gst: "",
    otp: "",
    terms: ""
  });
  const [formData, setFormData] = useState({
    fullName: "",
    fatherName: "",
    aadhar: "",
    phone: "",
    address: "",
    name: "",
    email: "",
    gst: "",
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

  // Aadhar validation (only numbers, max 12 digits)
  const handleAadharChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 12);
    setFormData(prev => ({ ...prev, aadhar: value }));
    
    if (value.length > 0 && value.length < 12) {
      setErrors(prev => ({ ...prev, aadhar: "Aadhar number must be 12 digits" }));
    } else {
      setErrors(prev => ({ ...prev, aadhar: "" }));
    }
  };

  // Email validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = sanitizeInput(e.target.value);
    setFormData(prev => ({ ...prev, email: value }));
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value.length > 0 && !emailRegex.test(value)) {
      setErrors(prev => ({ ...prev, email: "Please enter a valid email address" }));
    } else {
      setErrors(prev => ({ ...prev, email: "" }));
    }
  };

  // GST validation (alphanumeric, 15 characters)
  const handleGstChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = sanitizeInput(e.target.value.toUpperCase()).slice(0, 15);
    setFormData(prev => ({ ...prev, gst: value }));
    
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (value.length > 0 && value.length === 15 && !gstRegex.test(value)) {
      setErrors(prev => ({ ...prev, gst: "Please enter a valid GST number" }));
    } else if (value.length > 0 && value.length < 15) {
      setErrors(prev => ({ ...prev, gst: "GST number must be 15 characters" }));
    } else {
      setErrors(prev => ({ ...prev, gst: "" }));
    }
  };

  // Name validation
  const handleNameChange = (field: string, value: string) => {
    const sanitizedValue = sanitizeInput(value);
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    
    if (sanitizedValue.length > 0 && sanitizedValue.length < 2) {
      setErrors(prev => ({ ...prev, [field]: "Name must be at least 2 characters" }));
    } else {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // Address validation
  const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = sanitizeInput(e.target.value);
    setFormData(prev => ({ ...prev, address: value }));
    
    if (value.length > 0 && value.length < 10) {
      setErrors(prev => ({ ...prev, address: "Address must be at least 10 characters" }));
    } else {
      setErrors(prev => ({ ...prev, address: "" }));
    }
  };

  // OTP validation (only numbers, max 6 digits)
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({ ...prev, otp: value }));
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check terms and conditions
    if (!agreeToTerms) {
      setErrors(prev => ({ ...prev, terms: "You must agree to the terms and conditions" }));
      return;
    } else {
      setErrors(prev => ({ ...prev, terms: "" }));
    }
    
    const hasErrors = Object.values(errors).some(error => error !== "");
    if (hasErrors) return;
    
    if (role === "kisaan") {
      if (formData.fullName && formData.fatherName && formData.aadhar.length === 12 && 
          formData.phone.length === 10 && formData.address.length >= 10) {
        setStep("otp");
      }
    } else if (role === "pos") {
      if (formData.name && formData.address.length >= 10 && formData.email && 
          formData.gst.length === 15 && !errors.email && !errors.gst) {
        setStep("otp");
      }
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.otp.length === 6) {
      if (role === "kisaan") {
        alert("Kisaan Signup Successful! Please complete your profile");
        navigate("/complete-profile");
      } else {
        alert("POS Signup Successful! Admin verification required");
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
            backgroundImage: 'url(https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)',
            borderTopRightRadius: '2.5rem',
            borderBottomRightRadius: '2.5rem'
          }}
        >
          {/* Gradient Overlay */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-green-900/80 via-emerald-800/70 to-teal-900/80"
            style={{
              borderTopRightRadius: '2.5rem',
              borderBottomRightRadius: '2.5rem'
            }}
          ></div>
          
          {/* Additional Gradient Effects */}
          <div 
            className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
            style={{
              borderTopRightRadius: '2.5rem',
              borderBottomRightRadius: '2.5rem'
            }}
          ></div>
        </div>
        
        {/* Left Content */}
        <div className="relative z-10 flex flex-col justify-center items-start p-12 text-white">
          <button
            onClick={handleBack}
            className="absolute top-8 left-8 p-2 hover:bg-white/10 rounded-full transition-colors"
            style={{ borderRadius: '0.5rem' }}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="max-w-md">
            <h1 className="text-5xl font-light mb-6 leading-tight">
              Join the Future of<br />
              <span className="font-bold text-green-300">Agriculture</span>
            </h1>
            <p className="text-lg text-green-100 opacity-90">
              Connect with thousands of farmers and revolutionize your agricultural journey with modern technology
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
                  {role === "kisaan" ? "Join as Kisaan" : "Join as POS"}
                </h2>
                <p className="text-gray-400 text-sm">
                  {role === "kisaan" 
                    ? "Create your farmer account to get started" 
                    : "Create your POS account to get started"
                  }
                </p>
              </div>

              <form onSubmit={handleSignupSubmit} className="space-y-4">
                {role === "kisaan" ? (
                  <>
                    <div>
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={formData.fullName}
                        onChange={(e) => handleNameChange("fullName", e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                        style={{ borderRadius: '0.75rem' }}
                        required
                      />
                      {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>}
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Father's Name"
                        value={formData.fatherName}
                        onChange={(e) => handleNameChange("fatherName", e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                        style={{ borderRadius: '0.75rem' }}
                        required
                      />
                      {errors.fatherName && <p className="text-red-400 text-xs mt-1">{errors.fatherName}</p>}
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Aadhar Number"
                        value={formData.aadhar}
                        onChange={handleAadharChange}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                        style={{ borderRadius: '0.75rem' }}
                        required
                      />
                      {errors.aadhar && <p className="text-red-400 text-xs mt-1">{errors.aadhar}</p>}
                    </div>

                    <div>
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                        style={{ borderRadius: '0.75rem' }}
                        required
                      />
                      {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                      <textarea
                        placeholder="Address"
                        value={formData.address}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors resize-none"
                        style={{ borderRadius: '0.75rem' }}
                        rows={3}
                        required
                      />
                      {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <input
                        type="text"
                        placeholder="Business Name"
                        value={formData.name}
                        onChange={(e) => handleNameChange("name", e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                        style={{ borderRadius: '0.75rem' }}
                        required
                      />
                      {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <textarea
                        placeholder="Business Address"
                        value={formData.address}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors resize-none"
                        style={{ borderRadius: '0.75rem' }}
                        rows={3}
                        required
                      />
                      {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
                    </div>

                    <div>
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleEmailChange}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                        style={{ borderRadius: '0.75rem' }}
                        required
                      />
                      {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="GST Number"
                        value={formData.gst}
                        onChange={handleGstChange}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                        style={{ borderRadius: '0.75rem' }}
                        required
                      />
                      {errors.gst && <p className="text-red-400 text-xs mt-1">{errors.gst}</p>}
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
                      style={{ borderRadius: '0.25rem' }}
                    />
                    <label htmlFor="terms" className="ml-2 text-sm text-gray-300">
                      I agree to the{" "}
                      <button
                        type="button"
                        className="text-green-500 hover:text-green-400 underline transition-colors"
                        onClick={() => window.open('/terms', '_blank')}
                      >
                        Terms and Conditions
                      </button>
                      {" "}and{" "}
                      <button
                        type="button"
                        className="text-green-500 hover:text-green-400 underline transition-colors"
                        onClick={() => window.open('/privacy', '_blank')}
                      >
                        Privacy Policy
                      </button>
                    </label>
                  </div>
                  {errors.terms && <p className="text-red-400 text-xs">{errors.terms}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:from-green-700 hover:to-emerald-700 focus:outline-none transition-all duration-200"
                  style={{ borderRadius: '0.75rem' }}
                >
                  Send OTP
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-semibold text-white mb-2">Verify OTP</h2>
                <p className="text-gray-400 text-sm mb-2">
                  Enter the 6-digit code sent to
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
                    style={{ borderRadius: '0.75rem' }}
                    maxLength={6}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:from-green-700 hover:to-emerald-700 focus:outline-none transition-all duration-200"
                  style={{ borderRadius: '0.75rem' }}
                >
                  Create Account
                </button>

                <button
                  type="button"
                  onClick={() => setStep("signup")}
                  className="w-full text-green-500 hover:text-green-400 text-sm transition-colors"
                >
                  Resend OTP
                </button>
              </form>
            </>
          )}

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-green-500 hover:text-green-400 font-medium transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
