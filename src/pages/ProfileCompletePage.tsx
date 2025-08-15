import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { BGS } from "../assets/assets";
import Modal from "../components/Modal";
import toast from 'react-hot-toast';

export default function ProfileComplete() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showErrors, setShowErrors] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);

  const [formData, setFormData] = useState({
    gramPanchayat: "",
    district: "",
    state: "",
    bankAccount: "",
    bankName: "",
    bankBranch: "",
    ifsc: "",
    landHoldings: "",
    annualProduction: "",
    annualConsumption: "",
    crops: "",
    seedArea: "",
    irrigatedArea: "",
    rainfedArea: "",
    aadhaarFront: null as File | null,
    aadhaarBack: null as File | null
  });

  const sanitize = (v: string) =>
    v.replace(/<[^>]*>/g, "")
      .replace(/["'&]/g, "")
      .replace(/\s+/g, " ")
      .trimStart();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: sanitize(value) }));
  };

  const handleFile = (field: "aadhaarFront" | "aadhaarBack", file: File | null) => {
    if (file && file.type.startsWith("image/")) {
      setFormData(prev => ({ ...prev, [field]: file }));
    }
  };

  const validateStep = () => {
    const errors: Record<string, boolean> = {};
    if (step === 1) {
      if (!formData.gramPanchayat) errors.gramPanchayat = true;
      if (!formData.district) errors.district = true;
      if (!formData.state) errors.state = true;
    } else if (step === 2) {
      if (!formData.bankAccount) errors.bankAccount = true;
      if (!formData.bankName) errors.bankName = true;
      if (!formData.bankBranch) errors.bankBranch = true;
      if (!formData.ifsc) errors.ifsc = true;
    } else if (step === 3) {
      if (!formData.landHoldings) errors.landHoldings = true;
      if (!formData.annualProduction) errors.annualProduction = true;
      if (!formData.annualConsumption) errors.annualConsumption = true;
      if (!formData.crops) errors.crops = true;
      if (!formData.seedArea) errors.seedArea = true;
      if (!formData.irrigatedArea) errors.irrigatedArea = true;
      if (!formData.rainfedArea) errors.rainfedArea = true;
      if (!formData.aadhaarFront) errors.aadhaarFront = true;
      if (!formData.aadhaarBack) errors.aadhaarBack = true;
    }
    return errors;
  };

  const isStepValid = () => Object.keys(validateStep()).length === 0;

  const handleSkip = () => {
    setShowSkipModal(true);
  };

  const handleSkipConfirm = () => {
    setShowSkipModal(false);
    navigate("/");
  };

  const nextStep = () => {
    setShowErrors(true);
    if (isStepValid()) {
      setStep(s => s + 1);
      setShowErrors(false);
    }
  };

  const prevStep = () => {
    setShowErrors(false);
    setStep(s => s - 1);
  };

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(true);
    if (isStepValid()) {
      toast("Profile submitted successfully!");
      navigate("/");
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return "Location Details";
      case 2: return "Banking Information";
      case 3: return "Farm & Documents";
      default: return "Profile Setup";
    }
  };

  const renderInput = (
    name: string,
    placeholder: string,
    type: string = "text",
    isFileInput = false
  ) => {
    const hasError = showErrors && !formData[name as keyof typeof formData];
    
    if (isFileInput) {
      return (
        <div>
          <label className={`block text-sm font-medium mb-2 ${hasError ? "text-red-400" : "text-gray-300"}`}>
            {placeholder}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={e => handleFile(name as "aadhaarFront" | "aadhaarBack", e.target.files?.[0] ?? null)}
            className={`w-full px-4 py-3 bg-gray-800 border text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-600 file:text-white hover:file:bg-green-700 transition-colors ${
              hasError ? "border-red-500" : "border-gray-700 focus:border-green-500"
            }`}
            style={{ borderRadius: '0.75rem' }}
          />
          {hasError && <p className="text-red-400 text-xs mt-1">Please upload {placeholder.toLowerCase()}</p>}
        </div>
      );
    }

    return (
      <div>
        <label className={`block text-sm font-medium mb-2 ${hasError ? "text-red-400" : "text-gray-300"}`}>
          {placeholder}
        </label>
        <input
          type={type}
          placeholder={`Enter ${placeholder.toLowerCase()}`}
          value={(formData[name as keyof typeof formData] as string) || ""}
          onChange={e => handleChange(name, e.target.value)}
          className={`w-full px-4 py-3 bg-gray-800 border text-white placeholder-gray-500 focus:outline-none transition-colors ${
            hasError ? "border-red-500" : "border-gray-700 focus:border-green-500"
          }`}
          style={{ borderRadius: '0.75rem' }}
        />
        {hasError && <p className="text-red-400 text-xs mt-1">Please enter {placeholder.toLowerCase()}</p>}
      </div>
    );
  };

  return (
    <>
      <div className="min-h-screen flex bg-black">
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${BGS.kisaan_profile})`,
              borderTopRightRadius: '2.5rem',
              borderBottomRightRadius: '2.5rem'
            }}
          >
            <div 
              className="absolute inset-0 bg-gradient-to-br from-green-900/80 via-emerald-800/70 to-teal-900/80"
              style={{
                borderTopRightRadius: '2.5rem',
                borderBottomRightRadius: '2.5rem'
              }}
            ></div>
            
            <div 
              className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
              style={{
                borderTopRightRadius: '2.5rem',
                borderBottomRightRadius: '2.5rem'
              }}
            ></div>
          </div>
          
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
                Complete Your<br />
                <span className="font-bold text-green-300">Farmer Profile</span>
              </h1>
              <p className="text-lg text-green-100 opacity-90">
                Provide your details to unlock all agricultural services and connect with the farming community
              </p>
              
              <div className="mt-8">
                <div className="flex items-center space-x-4">
                  {[1, 2, 3].map((stepNum) => (
                    <div
                      key={stepNum}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        stepNum <= step 
                          ? "bg-green-500 text-white" 
                          : "bg-white/20 text-white/60"
                      }`}
                    >
                      {stepNum}
                    </div>
                  ))}
                </div>
                <p className="text-green-200 text-sm mt-2">Step {step} of 3</p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-black overflow-y-auto">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2 className="text-3xl font-semibold text-white mb-2">
                {getStepTitle()}
              </h2>
              <p className="text-gray-400 text-sm">
                Step {step} of 3 - {step === 1 ? "Tell us about your location" : step === 2 ? "Add your banking details" : "Farm details and documents"}
              </p>
            </div>

            <form onSubmit={submitForm} className="space-y-6">
              {step === 1 && (
                <>
                  {renderInput("gramPanchayat", "Gram Panchayat")}
                  {renderInput("district", "District")}
                  {renderInput("state", "State")}
                </>
              )}

              {step === 2 && (
                <>
                  {renderInput("bankAccount", "Bank Account Number")}
                  {renderInput("bankName", "Bank Name")}
                  {renderInput("bankBranch", "Bank Branch")}
                  {renderInput("ifsc", "IFSC Code")}
                </>
              )}

              {step === 3 && (
                <>
                  {renderInput("landHoldings", "Land Holdings (Hectares)", "number")}
                  {renderInput("annualProduction", "Annual Production (Quintals)", "number")}
                  {renderInput("annualConsumption", "Annual Consumption (Quintals)", "number")}
                  {renderInput("crops", "Crops Grown")}
                  {renderInput("seedArea", "Seed Area (Hectares)", "number")}
                  {renderInput("irrigatedArea", "Irrigated Area (Hectares)", "number")}
                  {renderInput("rainfedArea", "Rainfed Area (Hectares)", "number")}
                  
                  <div className="grid grid-cols-1 gap-6">
                    {renderInput("aadhaarFront", "Aadhaar Front Image", "file", true)}
                    {renderInput("aadhaarBack", "Aadhaar Back Image", "file", true)}
                  </div>
                </>
              )}

              <div className="flex justify-between pt-6">
                {step > 1 && (
                  <button 
                    type="button" 
                    onClick={prevStep} 
                    className="px-6 py-3 bg-gray-700 text-white font-semibold hover:bg-gray-600 focus:outline-none transition-all duration-200"
                    style={{ borderRadius: '0.75rem' }}
                  >
                    Back
                  </button>
                )}
                
                {step < 3 && (
                  <button 
                    type="button" 
                    onClick={nextStep} 
                    className="ml-auto px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:from-green-700 hover:to-emerald-700 focus:outline-none transition-all duration-200"
                    style={{ borderRadius: '0.75rem' }}
                  >
                    Next Step
                  </button>
                )}
                
                {step === 3 && (
                  <button 
                    type="submit" 
                    className="ml-auto px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:from-green-700 hover:to-emerald-700 focus:outline-none transition-all duration-200"
                    style={{ borderRadius: '0.75rem' }}
                  >
                    Complete Profile
                  </button>
                )}
              </div>
            </form>
            
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={handleSkip}
                className="text-gray-400 hover:text-white font-medium transition-colors text-sm underline"
              >
                Skip for now, I'll do this later
              </button>
            </div>

            <div className="lg:hidden mt-8 flex justify-center">
              <div className="flex items-center space-x-2">
                {[1, 2, 3].map((stepNum) => (
                  <div
                    key={stepNum}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      stepNum <= step ? "bg-green-500" : "bg-gray-600"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        title="Skip Profile Completion"
        isOpen={showSkipModal}
        onClose={() => setShowSkipModal(false)}
        onConfirm={handleSkipConfirm}
        message="Are you sure you want to skip profile completion? You can do this later."
      />
    </>
  );
}
