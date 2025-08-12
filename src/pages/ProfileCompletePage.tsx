import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Building2,
  Landmark,
  CreditCard,
  Home,
  Building,
  FileText,
  Layers,
  TrendingUp,
  PieChart,
  Sprout,
  Droplet,
  CloudRain,
  Upload,
  Navigation2,
} from "lucide-react";

export default function ProfileComplete() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showErrors, setShowErrors] = useState(false);

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

  const handleNum = (field: string, value: string, max: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value.replace(/\D/g, "").slice(0, max)
    }));
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
      alert("Profile submitted successfully!");
      navigate("/");
    }
  };

  const renderInput = (
    name: string,
    placeholder: string,
    icon: React.ReactNode,
    type: string = "text",
    onChangeCb?: (v: string) => void,
    isFileInput = false
  ) => {
    const hasError = showErrors && !formData[name as keyof typeof formData];
    if (isFileInput) {
      return (
        <div>
          <label className={`block font-medium mb-1 ${hasError ? "text-red-500" : "text-gray-700"}`}>
            {placeholder}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={e => handleFile(name as "aadhaarFront" | "aadhaarBack", e.target.files?.[0] ?? null)}
            className={`block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
              ${hasError ? "file:bg-red-500 file:text-white" : "file:bg-gray-900 file:text-white"}`}
          />
        </div>
      );
    }
    return (
      <div>
        <div className="relative">
          <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${hasError ? "text-red-500" : "text-gray-400"}`}>
            {icon}
          </span>
          <input
            type={type}
            placeholder={placeholder}
            value={(formData[name as keyof typeof formData] as string) || ""}
            onChange={e => (onChangeCb ? onChangeCb(e.target.value) : handleChange(name, e.target.value))}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none bg-white
              ${hasError ? "border-red-500 placeholder-red-500 text-red-500" : "border-gray-300 text-gray-900"}`}
            style={{ whiteSpace: "pre-wrap", letterSpacing: "normal" }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ backgroundColor: "#FAF9F6" }}>
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Complete Your Profile ({step}/3)
        </h2>

        <form onSubmit={submitForm} className="space-y-4">
          {step === 1 && (
            <>
              {renderInput("gramPanchayat", "Gram Panchayat", <Navigation2 className="w-4 h-4" />)}
              {renderInput("district", "District", <Building2 className="w-4 h-4" />)}
              {renderInput("state", "State", <Landmark className="w-4 h-4" />)}
            </>
          )}

          {step === 2 && (
            <>
              {renderInput("bankAccount", "Bank Account Number", <CreditCard className="w-4 h-4" />)}
              {renderInput("bankName", "Bank Name", <Home className="w-4 h-4" />)}
              {renderInput("bankBranch", "Bank Branch", <Building className="w-4 h-4" />)}
              {renderInput("ifsc", "IFSC Code", <FileText className="w-4 h-4" />)}
            </>
          )}

          {step === 3 && (
            <>
              {renderInput("landHoldings", "Land Holdings (Hectares)", <Layers className="w-4 h-4" />)}
              {renderInput("annualProduction", "Annual Production (Quintals)", <TrendingUp className="w-4 h-4" />)}
              {renderInput("annualConsumption", "Annual Consumption (Quintals)", <PieChart className="w-4 h-4" />)}
              {renderInput("crops", "Crops Grown", <Sprout className="w-4 h-4" />)}
              {renderInput("seedArea", "Seed Area", <FileText className="w-4 h-4" />)}
              {renderInput("irrigatedArea", "Irrigated Area", <Droplet className="w-4 h-4" />)}
              {renderInput("rainfedArea", "Rainfed Area", <CloudRain className="w-4 h-4" />)}

              {renderInput("aadhaarFront", "Aadhaar Front Image", <Upload className="w-4 h-4" />, "file", undefined, true)}
              {renderInput("aadhaarBack", "Aadhaar Back Image", <Upload className="w-4 h-4" />, "file", undefined, true)}
            </>
          )}

          <div className="flex justify-between pt-4">
            {step > 1 && (
              <button type="button" onClick={prevStep} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                Back
              </button>
            )}
            {step < 3 && (
              <button type="button" onClick={nextStep} className="ml-auto px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
                Next
              </button>
            )}
            {step === 3 && (
              <button type="submit" className="ml-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500">
                Submit Profile
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
