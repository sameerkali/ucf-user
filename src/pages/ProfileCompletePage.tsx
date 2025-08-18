import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { BGS } from "../assets/assets";
import Modal from "../components/Modal";
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";
import api from "../api/axios";

export default function ProfileComplete() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  // Read initial step from URL query parameter
  const initialStep = Number(searchParams.get("step")) === 2 ? 2 : 1;
  const [step, setStep] = useState(initialStep);
  const [showErrors, setShowErrors] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);

  // cropsList: fetched from backend for user selection
  const [cropsList, setCropsList] = useState<string[]>([]);
  const [cropsLoading, setCropsLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    bankAccount: "",
    accountHolder: "",
    bankName: "",
    bankBranch: "",
    ifsc: "",
    landHoldings: "",
    annualProduction: "",
    annualConsumption: "",
    crops: [] as string[],
    seedArea: "",
    irrigatedArea: "",
    rainfedArea: "",
    aadhaarFront: null as File | null,
    aadhaarBack: null as File | null,
    aadhaarFrontUrl: "",
    aadhaarBackUrl: "",
  });

  const sanitize = (v: string) =>
    v.replace(/<[^>]*>/g, "")
      .replace(/["'&]/g, "")
      .replace(/\s+/g, " ")
      .trimStart();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: sanitize(value) }));
  };

  const handleCropChange = (crop: string) => {
    setFormData(prev => ({
      ...prev,
      crops: prev.crops.includes(crop)
        ? prev.crops.filter(c => c !== crop)
        : [...prev.crops, crop],
    }));
  };

  const handleFile = async (field: "aadhaarFront" | "aadhaarBack", file: File | null) => {
    if (file && file.type.startsWith("image/")) {
      setFormData(prev => ({ ...prev, [field]: file }));

      // TODO: Replace this mock with your own upload endpoint!
      const mockUpload = async () => {
        await new Promise(res => setTimeout(res, 1200));
        return `uploads/${file.name}`;
      };
      const uploadedPath = await mockUpload();
      setFormData(prev => ({
        ...prev,
        [field + "Url"]: uploadedPath,
      }));
    }
  };

  // Fetch crops with Authorization token using axios
  useEffect(() => {
    const fetchCrops = async () => {
      setCropsLoading(true);
      try {
        const { data } = await api.get("/api/admin/get-all-crop");
        
        if (data.success && data.crops) {
          setCropsList(data.crops.map((crop: any) => crop.name));
        } else {
          setCropsList(["no", "api", "call", "its", "mocked"]);
        }
      } catch (error) {
        console.error('Error fetching crops:', error);
        setCropsList([]);
        toast.error('Failed to load crops');
      } finally {
        setCropsLoading(false);
      }
    };

    fetchCrops();
  }, []);

  const validateStep = () => {
    const errors: Record<string, boolean> = {};
    if (step === 1) {
      if (!formData.bankAccount) errors.bankAccount = true;
      if (!formData.bankName) errors.bankName = true;
      if (!formData.accountHolder) errors.accountHolder = true;
      if (!formData.bankBranch) errors.bankBranch = true;
      if (!formData.ifsc) errors.ifsc = true;
    } else if (step === 2) {
      if (!formData.landHoldings) errors.landHoldings = true;
      if (!formData.annualProduction) errors.annualProduction = true;
      if (!formData.annualConsumption) errors.annualConsumption = true;
      if (!formData.crops || formData.crops.length === 0) errors.crops = true;
      if (!formData.seedArea) errors.seedArea = true;
      if (!formData.irrigatedArea) errors.irrigatedArea = true;
      if (!formData.rainfedArea) errors.rainfedArea = true;
      if (!formData.aadhaarFrontUrl) errors.aadhaarFront = true;
      if (!formData.aadhaarBackUrl) errors.aadhaarBack = true;
    }
    return errors;
  };

  const isStepValid = () => Object.keys(validateStep()).length === 0;

  const handleSkip = () => {
    setShowSkipModal(true);
  };

  const handleSkipConfirm = () => {
    setShowSkipModal(false);
    navigate("/home");
  };

  const nextStep = async () => {
    setShowErrors(true);
    if (step === 1) {
      if (isStepValid()) {
        setIsLoading(true);
        
        // Submit bank details using axios
        try {
          const { data } = await api.post("/api/bank/addDetail", {
            bankName: formData.bankName,
            accountHolderName: formData.accountHolder,
            accountNumber: formData.bankAccount,
            ifscCode: formData.ifsc,
            branch: formData.bankBranch,
          });
          
          if (data.success) {
            toast.success("Bank details saved successfully!");
            setStep(2);
            setShowErrors(false);
          } else {
            toast.error(data.message || "Failed to save bank details");
          }
        } catch (error: any) {
          toast.error(error?.response?.data?.message || "Failed to save bank details");
        }
        setIsLoading(false);
      }
    }
  };

  const prevStep = () => {
    setShowErrors(false);
    setStep(s => s - 1);
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(true);
    if (isStepValid()) {
      setIsLoading(true);
      
      // Submit farm & docs using axios
      try {
        const payload = {
          landHoldings: formData.landHoldings,
          annualProduction: Number(formData.annualProduction),
          annualConsumption: Number(formData.annualConsumption),
          crops: formData.crops,
          seedArea: Number(formData.seedArea),
          rainfedArea: Number(formData.rainfedArea),
          irrigatedArea: Number(formData.irrigatedArea),
          aadhaarFront: formData.aadhaarFrontUrl,
          aadhaarBack: formData.aadhaarBackUrl,
        };
        
        const { data } = await api.post("/api/other-details/add", payload);
        
        if (data.success) {
          toast.success(t("profileSubmitted"));
          navigate("/home");
        } else {
          toast.error(data.message || "Failed to save farm details");
        }
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to save farm details");
      }
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return t("bankingInformation");
      case 2: return t("farmDocuments");
      default: return t("profileSetup");
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1: return t("bankingStepDesc");
      case 2: return t("farmStepDesc");
      default: return "";
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
            {t(placeholder)}
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
          {hasError && <p className="text-red-400 text-xs mt-1">{t("pleaseUpload")} {t(placeholder).toLowerCase()}</p>}
        </div>
      );
    }
    return (
      <div>
        <label className={`block text-sm font-medium mb-2 ${hasError ? "text-red-400" : "text-gray-300"}`}>
          {t(placeholder)}
        </label>
        <input
          type={type}
          placeholder={`${t("enter")} ${t(placeholder).toLowerCase()}`}
          value={(formData[name as keyof typeof formData] as string) || ""}
          onChange={e => handleChange(name, e.target.value)}
          className={`w-full px-4 py-3 bg-gray-800 border text-white placeholder-gray-500 focus:outline-none transition-colors ${
            hasError ? "border-red-500" : "border-gray-700 focus:border-green-500"
          }`}
          style={{ borderRadius: '0.75rem' }}
        />
        {hasError && <p className="text-red-400 text-xs mt-1">{t("pleaseEnter")} {t(placeholder).toLowerCase()}</p>}
      </div>
    );
  };

  // For crops multi-select, uses checkboxes
  const renderCropsSelector = () => (
    <div>
      <label className={`block text-sm font-medium mb-2 ${showErrors && (!formData.crops || formData.crops.length === 0) ? "text-red-400" : "text-gray-300"}`}>
        {t("cropsGrown")}
      </label>
      {cropsLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="animate-spin w-5 h-5 text-green-500 mr-2" />
          <span className="text-gray-400">{t("loading")}...</span>
        </div>
      ) : cropsList.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto bg-gray-800 p-3 rounded-lg border border-gray-700">
          {cropsList.map(crop => (
            <label key={crop} className="flex items-center cursor-pointer hover:bg-gray-700 p-1 rounded">
              <input
                type="checkbox"
                checked={formData.crops.includes(crop)}
                onChange={() => handleCropChange(crop)}
                className="w-4 h-4 text-green-600 bg-gray-800 border-gray-600 focus:ring-green-500 rounded mr-2"
              />
              <span className="text-white text-sm">{crop}</span>
            </label>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-sm">No crops available</p>
      )}
      {showErrors && (!formData.crops || formData.crops.length === 0) &&
        <p className="text-red-400 text-xs mt-1">{t("pleaseSelect")} {t("cropsGrown").toLowerCase()}</p>}
    </div>
  );

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
                {t("completeYour")}<br />
                <span className="font-bold text-green-300">{t("farmerProfile")}</span>
              </h1>
              <p className="text-lg text-green-100 opacity-90">
                {t("profileDescription")}
              </p>
              
              <div className="mt-8">
                <div className="flex items-center space-x-4">
                  {[1, 2].map((stepNum) => (
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
                <p className="text-green-200 text-sm mt-2">{t("step")} {step} {t("of")} 2</p>
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
                {t("step")} {step} {t("of")} 2 - {getStepDescription()}
              </p>
            </div>

            <form onSubmit={submitForm} className="space-y-6">
              {step === 1 && (
                <>
                  {renderInput("bankAccount", "bankAccountNumber")}
                  {renderInput("accountHolder", "accountHolderName")}
                  {renderInput("bankName", "bankName")}
                  {renderInput("bankBranch", "bankBranch")}
                  {renderInput("ifsc", "ifscCode")}
                  
                  <div className="flex justify-between pt-6">
                    <button 
                      type="button" 
                      onClick={handleSkip} 
                      className="px-6 py-3 bg-gray-700 text-white font-semibold hover:bg-gray-600 focus:outline-none transition-all duration-200"
                      style={{ borderRadius: '0.75rem' }}
                    >
                      {t("skipForNow")}
                    </button>
                    <button 
                      type="button" 
                      onClick={nextStep} 
                      disabled={isLoading}
                      className="ml-auto px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:from-green-700 hover:to-emerald-700 focus:outline-none transition-all duration-200 flex items-center justify-center"
                      style={{ borderRadius: '0.75rem' }}
                    >
                      {isLoading ? (
                        <Loader2 className="animate-spin w-5 h-5" />
                      ) : (
                        t("nextStep")
                      )}
                    </button>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  {renderInput("landHoldings", "landHoldings")}
                  {renderInput("annualProduction", "annualProduction", "number")}
                  {renderInput("annualConsumption", "annualConsumption", "number")}
                  {renderCropsSelector()}
                  {renderInput("seedArea", "seedArea", "number")}
                  {renderInput("irrigatedArea", "irrigatedArea", "number")}
                  {renderInput("rainfedArea", "rainfedArea", "number")}
                  
                  <div className="grid grid-cols-1 gap-6">
                    {renderInput("aadhaarFront", "aadhaarFrontImage", "file", true)}
                    {renderInput("aadhaarBack", "aadhaarBackImage", "file", true)}
                  </div>
                  
                  <div className="flex justify-between pt-6">
                    <button 
                      type="button" 
                      onClick={prevStep} 
                      className="px-6 py-3 bg-gray-700 text-white font-semibold hover:bg-gray-600 focus:outline-none transition-all duration-200"
                      style={{ borderRadius: '0.75rem' }}
                    >
                      {t("back")}
                    </button>
                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="ml-auto px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:from-green-700 hover:to-emerald-700 focus:outline-none transition-all duration-200 flex items-center justify-center"
                      style={{ borderRadius: '0.75rem' }}
                    >
                      {isLoading ? (
                        <Loader2 className="animate-spin w-5 h-5" />
                      ) : (
                        t("completeProfile")
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
            
            <div className="lg:hidden mt-8 flex justify-center">
              <div className="flex items-center space-x-2">
                {[1, 2].map((stepNum) => (
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
        title={t("skipProfileCompletion")}
        isOpen={showSkipModal}
        onClose={() => setShowSkipModal(false)}
        onConfirm={handleSkipConfirm}
        message={t("skipConfirmMessage")}
      />
    </>
  );
}
