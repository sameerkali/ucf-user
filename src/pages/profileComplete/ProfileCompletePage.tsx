import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Loader2, X } from "lucide-react";
import { BGS, GLOBLE } from "../../assets/assets";
import Modal from "../../components/Modal";
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";
import api from "../../api/axios";
import imageCompression from 'browser-image-compression';

const ACCOUNT_NUMBER_REGEX = /^[0-9]{9,18}$/;
const IFSC_REGEX = /^[A-Z]{4}0[0-9A-Z]{6}$/i;

interface CropsResponse {
  success: boolean;
  count: number;
  crops: ApiCrop[];
}

interface ApiCrop {
  _id: string;
  name: string;
  image?: string; // Optional image field
  isVisible?: boolean;
}

export default function ProfileComplete() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  // Get role from URL parameters
  const role = searchParams.get("role") || "kisaan";
  const initialStep = Number(searchParams.get("step")) === 2 ? 2 : 1;
  const [step, setStep] = useState(initialStep);
  const [showErrors, setShowErrors] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);

  // crops as array of objects [{_id, name, image, ...}]
  const [cropsList, setCropsList] = useState<any[]>([]);
  const [cropsLoading, setCropsLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // selected crops by _id
  const [selectedCropIds, setSelectedCropIds] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    bankAccount: "",
    accountHolder: "",
    bankName: "",
    bankBranch: "",
    ifsc: "",
    passbookPhoto: null as File | null,
    passbookPhotoUrl: "",
    passbookPhotoPreview: "", // Added for preview
    // Farmer fields
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
    aadhaarFrontPreview: "", // Added for preview
    aadhaarBackPreview: "", // Added for preview
    // POS fields
    storageArea: "",
    sections: "",
    cropsHandled: [] as string[],
    maxCropCapacity: "",
  });

  useEffect(() => {
    if (role === "kisaan") {
      setFormData(f => ({ ...f, crops: selectedCropIds }));
    } else if (role === "pos") {
      setFormData(f => ({ ...f, cropsHandled: selectedCropIds }));
    }
  }, [selectedCropIds, role]);

  const sanitize = (v: string) =>
    v.replace(/<[^>]*>/g, "")
      .replace(/["'&]/g, "")
      .replace(/\s+/g, " ")
      .trimStart();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: sanitize(value) }));
  };

  const handleCropChange = (cropId: string) => {
    setSelectedCropIds(prev =>
      prev.includes(cropId)
        ? prev.filter(id => id !== cropId)
        : [...prev, cropId]
    );
  };

  // Enhanced file handling with better error handling and preview
  const handleFile = async (field: "aadhaarFront" | "aadhaarBack" | "passbookPhoto", file: File | null) => {
    if (!file) {
      // Clear the file and preview when no file is selected
      setFormData(prev => ({ 
        ...prev, 
        [field]: null,
        [`${field}Preview`]: ""
      }));
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (before compression)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    try {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      
      // Compression options
      const options = {
        maxSizeMB: 5,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: file.type,
      };

      let compressedFile = file;
      
      // Compress image if it's larger than 1MB
      if (file.size > 1024 * 1024) {
        try {
          compressedFile = await imageCompression(file, options);
          console.log(`Image compressed from ${(file.size / 1024 / 1024).toFixed(2)}MB to ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
        } catch (compressionError) {
          console.error("Compression failed:", compressionError);
          toast.error("Failed to compress image, using original");
          compressedFile = file;
        }
      }

      // Final size check after compression
      if (compressedFile.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB after compression");
        URL.revokeObjectURL(previewUrl);
        return;
      }

      // Update form data with file and preview
      setFormData(prev => ({ 
        ...prev, 
        [field]: compressedFile,
        [`${field}Preview`]: previewUrl
      }));

      toast.success("Image uploaded successfully");

    } catch (error) {
      console.error("File handling error:", error);
      toast.error("Failed to process image");
    }
  };

  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      if (formData.passbookPhotoPreview) {
        URL.revokeObjectURL(formData.passbookPhotoPreview);
      }
      if (formData.aadhaarFrontPreview) {
        URL.revokeObjectURL(formData.aadhaarFrontPreview);
      }
      if (formData.aadhaarBackPreview) {
        URL.revokeObjectURL(formData.aadhaarBackPreview);
      }
    };
  }, []);

  useEffect(() => {
    const fetchCrops = async () => {
      setCropsLoading(true);
      try {
        const response = await api.get("/api/admin/get-all-crops");
        const data: CropsResponse = response.data;
        if (data.success && data.crops) {
          // Filter visible crops, image is optional
          setCropsList(data.crops.filter((crop: ApiCrop) => crop.isVisible !== false));
        } else {
          setCropsList([
            { _id: "wheat", name: "Wheat" },
            { _id: "rice", name: "Rice" },
            { _id: "corn", name: "Corn" },
            { _id: "barley", name: "Barley" },
            { _id: "oats", name: "Oats" },
            { _id: "soybean", name: "Soybean" },
            { _id: "cotton", name: "Cotton" },
            { _id: "sugarcane", name: "Sugarcane" }
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch crops:", error);
        setCropsList([
          { _id: "wheat", name: "Wheat" },
          { _id: "rice", name: "Rice" },
          { _id: "corn", name: "Corn" },
          { _id: "barley", name: "Barley" },
          { _id: "oats", name: "Oats" },
          { _id: "soybean", name: "Soybean" },
          { _id: "cotton", name: "Cotton" },
          { _id: "sugarcane", name: "Sugarcane" }
        ]);
        toast.error('Failed to load crops, using default list');
      } finally {
        setCropsLoading(false);
      }
    };
    fetchCrops();
  }, []);

  const validateStep = () => {
    const errors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.bankAccount) errors.bankAccount = "Account number is required.";
      else if (!ACCOUNT_NUMBER_REGEX.test(formData.bankAccount)) errors.bankAccount = "Account number must be 9-18 digits.";
      if (!formData.bankName) errors.bankName = "Bank name is required.";
      if (!formData.accountHolder) errors.accountHolder = "Account holder name is required.";
      if (!formData.bankBranch) errors.bankBranch = "Bank branch is required.";
      if (!formData.ifsc) errors.ifsc = "IFSC code is required.";
      else if (!IFSC_REGEX.test(formData.ifsc)) errors.ifsc = "IFSC code must be in format: AAAA0123456";
      // Removed passbookPhoto validation - now optional
    } else if (step === 2) {
      if (role === "kisaan") {
        if (!formData.landHoldings) errors.landHoldings = "Land holdings is required.";
        if (!formData.annualProduction) errors.annualProduction = "Annual production is required.";
        if (!formData.annualConsumption) errors.annualConsumption = "Annual consumption is required.";
        if (!formData.crops || formData.crops.length === 0) errors.crops = "Select at least one crop.";
        if (!formData.seedArea) errors.seedArea = "Seed area is required.";
        if (!formData.irrigatedArea) errors.irrigatedArea = "Irrigated area is required.";
        if (!formData.rainfedArea) errors.rainfedArea = "Rainfed area is required.";
        // Removed aadhaar photo validations - now optional
      } else if (role === "pos") {
        if (!formData.storageArea) errors.storageArea = "Storage area is required.";
        if (!formData.sections) errors.sections = "Number of sections is required.";
        if (!formData.cropsHandled || formData.cropsHandled.length === 0) errors.cropsHandled = "Select at least one crop handled.";
        if (!formData.maxCropCapacity) errors.maxCropCapacity = "Maximum crop capacity is required.";
      }
    }
    return errors;
  };

  const errors = validateStep();
  const isStepValid = () => Object.keys(errors).length === 0;

  const handleSkipConfirm = () => {
    setShowSkipModal(false);
    navigate("/home");
  };

  const skipToNextStep = () => {
    setStep(2);
    setShowErrors(false);
  };

  function parseBankDetailError(message: string) {
    if (message.includes('accountNumber')) return "Invalid account number";
    if (message.includes('ifscCode')) return "Invalid IFSC code";
    if (message.includes('photos')) return "Invalid passbook photo";
    return "Invalid bank details";
  }

  const nextStep = async () => {
    setShowErrors(true);
    if (step === 1) {
      if (isStepValid()) {
        setIsLoading(true);
        try {
          // Create FormData for file upload
          const bankFormData = new FormData();
          bankFormData.append("bankName", formData.bankName);
          bankFormData.append("accountHolderName", formData.accountHolder);
          bankFormData.append("accountNumber", formData.bankAccount);
          bankFormData.append("ifscCode", formData.ifsc);
          bankFormData.append("branch", formData.bankBranch);
          
          // Add passbook photo to the API payload only if present
          if (formData.passbookPhoto) {
            bankFormData.append("photos", formData.passbookPhoto);
            console.log("Adding passbook photo:", {
              name: formData.passbookPhoto.name,
              size: formData.passbookPhoto.size,
              type: formData.passbookPhoto.type
            });
          }

          // Debug log
          console.log("Sending bank form data:");
          for (let [key, value] of bankFormData.entries()) {
            if (value instanceof File) {
              console.log(`${key}: File - ${value.name} (${value.size} bytes, ${value.type})`);
            } else {
              console.log(`${key}: ${value}`);
            }
          }

          const response = await api.post("/api/bank/addDetail", bankFormData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          if (response.status === 201 || response.status === 200) {
            toast.success(response.data.message || "Bank details saved successfully!");
            setStep(2);
            setShowErrors(false);
          } else {
            toast.error(parseBankDetailError(response.data?.message || ""));
          }
        } catch (error: any) {
          console.error("Bank detail submission error:", error);
          const msg = error?.response?.data?.message || "";
          toast.error(parseBankDetailError(msg) || "Failed to save bank details");
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
      try {
        const formDataObj = new FormData();
        
        if (role === "kisaan") {
          formDataObj.append("landHoldings", formData.landHoldings);
          formDataObj.append("annualProduction", formData.annualProduction);
          formDataObj.append("annualConsumption", formData.annualConsumption);
          formDataObj.append("seedArea", formData.seedArea);
          formDataObj.append("rainfedArea", formData.rainfedArea);
          formDataObj.append("irrigatedArea", formData.irrigatedArea);
          formDataObj.append("crops", JSON.stringify(formData.crops));
          
          // Add aadhaar photos only if present
          if (formData.aadhaarFront) {
            formDataObj.append("aadhaarFront", formData.aadhaarFront);
            console.log("Adding aadhaar front:", {
              name: formData.aadhaarFront.name,
              size: formData.aadhaarFront.size,
              type: formData.aadhaarFront.type
            });
          }
          if (formData.aadhaarBack) {
            formDataObj.append("aadhaarBack", formData.aadhaarBack);
            console.log("Adding aadhaar back:", {
              name: formData.aadhaarBack.name,
              size: formData.aadhaarBack.size,
              type: formData.aadhaarBack.type
            });
          }
        } else if (role === "pos") {
          formDataObj.append("storageArea", formData.storageArea);
          formDataObj.append("sections", formData.sections);
          formDataObj.append("cropsHandled", JSON.stringify(formData.cropsHandled));
          formDataObj.append("maxCropCapacity", formData.maxCropCapacity);
        }

        // Debug log
        console.log("Sending form data:");
        for (let [key, value] of formDataObj.entries()) {
          if (value instanceof File) {
            console.log(`${key}: File - ${value.name} (${value.size} bytes, ${value.type})`);
          } else {
            console.log(`${key}: ${value}`);
          }
        }

        const response = await api.post("/api/other-details/add", formDataObj, { 
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.status === 201 || response.status === 200) {
          toast.success(t("profileSubmitted"));
          navigate("/home");
        } else {
          toast.error(response.data?.message || `Failed to save ${role === "kisaan" ? "farm" : "POS"} details`);
        }
      } catch (error: any) {
        console.error("Form submission error:", error);
        toast.error(error?.response?.data?.message || `Failed to save ${role === "kisaan" ? "farm" : "POS"} details`);
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
      case 2: return role === "kisaan" ? t("farmDocuments") : "POS Details";
      default: return t("profileSetup");
    }
  };
  
  const getStepDescription = () => {
    switch (step) {
      case 1: return t("bankingStepDesc");
      case 2: return role === "kisaan" ? t("farmStepDesc") : "Enter your POS storage and handling details";
      default: return "";
    }
  };

  const renderInput = (
    name: string,
    placeholder: string,
    type: string = "text",
    isFileInput = false
  ) => {
    const hasError = showErrors && errors[name];
    let patternMsg = errors[name] || "";
    
    if (isFileInput) {
      const previewUrl = formData[`${name}Preview` as keyof typeof formData] as string;
      const file = formData[name as keyof typeof formData] as File | null;
      
      return (
        <div>
          <label className={`block text-sm font-medium mb-2 ${hasError ? "text-red-400" : "text-black"}`}>
            {t(placeholder)} <span className="text-gray-400 text-xs">(Optional)</span>
          </label>
          
          {/* File Input */}
          <input
            type="file"
            accept="image/*"
            onChange={e => handleFile(name as "aadhaarFront" | "aadhaarBack" | "passbookPhoto", e.target.files?.[0] ?? null)}
            className={`w-full px-4 py-3 bg-white border text-black file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-600 file:text-white hover:file:bg-green-700 transition-colors ${
              hasError ? "border-red-500" : "border-green-500 focus:border-green-600"
            }`}
            style={{ borderRadius: '0.75rem' }}
          />
          
          {/* Image Preview */}
          {previewUrl && file && (
            <div className="mt-3 relative">
              <img
                src={previewUrl}
                alt={`Preview of ${placeholder}`}
                className="w-full max-w-xs h-32 object-cover rounded-lg border-2 border-green-200"
              />
              <div className="mt-1 text-xs text-gray-600">
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </div>
              <button
                type="button"
                onClick={() => handleFile(name as "aadhaarFront" | "aadhaarBack" | "passbookPhoto", null)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          
          {hasError && <p className="text-red-400 text-xs mt-1">{patternMsg}</p>}
        </div>
      );
    }
    
    return (
      <div>
        <label className={`block text-sm font-medium mb-2 ${hasError ? "text-red-400" : "text-black"}`}>
          {t(placeholder)}
        </label>
        <input
          type={type}
          placeholder={`${t("enter")} ${t(placeholder).toLowerCase()}`}
          value={(formData[name as keyof typeof formData] as string) || ""}
          onChange={e => handleChange(name, e.target.value)}
          className={`w-full px-4 py-3 bg-white border text-black placeholder-gray-500 focus:outline-none transition-colors ${
            hasError ? "border-red-500" : "border-green-500 focus:border-green-600"
          }`}
          style={{ borderRadius: '0.75rem' }}
        />
        {hasError && <p className="text-red-400 text-xs mt-1">{patternMsg}</p>}
      </div>
    );
  };

  const renderCropsSelector = () => {
    const fieldName = role === "kisaan" ? "crops" : "cropsHandled";
    const labelText = role === "kisaan" ? t("cropsGrown") : "Crops Handled";
    
    return (
      <div>
        <label className={`block text-sm font-medium mb-2 ${showErrors && errors[fieldName] ? "text-red-400" : "text-black"}`}>
          {labelText}
        </label>
        {cropsLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="animate-spin w-5 h-5 text-green-500 mr-2" />
            <span className="text-gray-600">{t("loading")}...</span>
          </div>
        ) : cropsList.length > 0 ? (
          <div className="flex flex-wrap gap-3 max-h-32 overflow-y-auto bg-gray-50 p-4 rounded-lg border border-gray-300">
            {cropsList.map((crop: ApiCrop) => {
              const selected = selectedCropIds.includes(crop._id);
              return (
                <div
                  key={crop._id}
                  onClick={() => handleCropChange(crop._id)}
                  className="relative cursor-pointer"
                >
                  <div className={`w-16 h-16 rounded-full bg-white border-2 flex items-center justify-center overflow-hidden transition-all ${
                    selected ? 'border-green-500' : 'border-gray-300'
                  }`}>
                    {/* Image is optional - fallback to default logo if not provided */}
                    <img 
                      src={crop.image || GLOBLE.ucf_logo} 
                      alt={crop.name}
                      className="w-10 h-10 object-cover rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = GLOBLE.ucf_logo;
                      }}
                    />
                  </div>
                  {selected && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                      <X className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <p className="text-xs text-center mt-1 text-gray-700 font-medium truncate">
                    {crop.name}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-600 text-sm">No crops available</p>
        )}
        {showErrors && errors[fieldName] &&
          <p className="text-red-400 text-xs mt-1">{errors[fieldName]}</p>}
      </div>
    );
  };

  return (
    <>
      <div className="min-h-screen flex bg-white">
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
                <span className="font-bold text-green-300">
                  {role === "kisaan" ? t("farmerProfile") : "POS Profile"}
                </span>
              </h1>
              <p className="text-lg text-green-100 opacity-90">
                {role === "kisaan" ? t("profileDescription") : "Complete your Point of Sale profile to get started"}
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
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white overflow-y-auto">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2 className="text-3xl font-semibold text-black mb-2">
                {getStepTitle()}
              </h2>
              <p className="text-gray-600 text-sm">
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
                  {/* Bank Passbook Photo Field - Now Optional */}
                  {renderInput("passbookPhoto", "Bank Passbook Photo", "file", true)}
                  <div className="flex justify-between pt-6">
                    <button
                      type="button"
                      onClick={skipToNextStep}
                      className="px-6 py-3 bg-gray-700 text-white font-semibold hover:bg-gray-600 focus:outline-none transition-all duration-200"
                      style={{ borderRadius: '0.75rem' }}
                    >
                      {t("skipToNextStep")}
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
                  <div className="mb-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="px-3 py-2 bg-gray-700 text-white font-semibold hover:bg-gray-600 focus:outline-none transition-all duration-200 flex items-center"
                      style={{ borderRadius: '0.5rem' }}
                    >
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      {t("back")}
                    </button>
                  </div>
                  
                  {role === "kisaan" ? (
                    <>
                      {renderInput("landHoldings", "landHoldings")}
                      {renderInput("annualProduction", "annualProduction", "number")}
                      {renderInput("annualConsumption", "annualConsumption", "number")}
                      {renderCropsSelector()}
                      {renderInput("seedArea", "seedArea", "number")}
                      {renderInput("irrigatedArea", "irrigatedArea", "number")}
                      {renderInput("rainfedArea", "rainfedArea", "number")}
                      <div className="grid grid-cols-1 gap-6">
                        {/* Aadhaar Photo Fields - Now Optional */}
                        {renderInput("aadhaarFront", "aadhaarFrontImage", "file", true)}
                        {renderInput("aadhaarBack", "aadhaarBackImage", "file", true)}
                      </div>
                    </>
                  ) : (
                    <>
                      {renderInput("storageArea", "Storage Area (e.g., 2000 sqft)")}
                      {renderInput("sections", "Number of Sections", "number")}
                      {renderCropsSelector()}
                      {renderInput("maxCropCapacity", "Maximum Crop Capacity (in tons)", "number")}
                    </>
                  )}
                  
                  <div className="flex justify-between pt-6">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowSkipModal(true)}
                        className="px-6 py-3 bg-gray-700 text-white font-semibold hover:bg-gray-600 focus:outline-none transition-all duration-200"
                        style={{ borderRadius: '0.75rem' }}
                      >
                        {t("skipForNow")}
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:from-green-700 hover:to-emerald-700 focus:outline-none transition-all duration-200 flex items-center justify-center"
                        style={{ borderRadius: '0.75rem' }}
                      >
                        {isLoading ? (
                          <Loader2 className="animate-spin w-5 h-5" />
                        ) : (
                          t("completeProfile")
                        )}
                      </button>
                    </div>
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
