import { useState } from "react";
import { useTranslation } from "react-i18next";
import type {
  FormData,
  FormErrors,
  UseSignupFormProps,
  FarmerStep,
  Step,
} from "../pages/signup/signup.type";
import { toast } from "react-hot-toast";
import api from "../api/axios";


export const useSignupForm = ({ role, navigate }: UseSignupFormProps) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [farmerStep, setFarmerStep] = useState<FarmerStep>("personal");
  const [step, setStep] = useState<Step>("signup");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({
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

  const [formData, setFormData] = useState<FormData>({
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

  const sanitizeInput = (value: string) => value.replace(/[<>"'&]/g, "");

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData(prev => ({ ...prev, phone: value }));
    if (value.length > 0 && value.length < 10) {
      setErrors(prev => ({ ...prev, phone: t("phoneError") }));
    } else {
      setErrors(prev => ({ ...prev, phone: "" }));
    }
  };

  const handleAadharChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 12);
    setFormData(prev => ({ ...prev, aadhar: value }));
    if (value.length > 0 && value.length < 12) {
      setErrors(prev => ({ ...prev, aadhar: t("aadharError") }));
    } else {
      setErrors(prev => ({ ...prev, aadhar: "" }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, password: value }));
    if (value.length > 0 && value.length < 6) {
      setErrors(prev => ({ ...prev, password: "Password must be at least 6 characters" }));
    } else {
      setErrors(prev => ({ ...prev, password: "" }));
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, confirmPassword: value }));
    if (value !== formData.password) {
      setErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match" }));
    } else {
      setErrors(prev => ({ ...prev, confirmPassword: "" }));
    }
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setFormData(prev => ({ ...prev, pincode: value }));
    if (value.length > 0 && value.length < 6) {
      setErrors(prev => ({ ...prev, pincode: "Pincode must be 6 digits" }));
    } else {
      setErrors(prev => ({ ...prev, pincode: "" }));
    }
  };

  const handleAddressFieldChange = (field: string, value: string) => {
    const sanitizedValue = sanitizeInput(value);
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    if (sanitizedValue.length > 0 && sanitizedValue.length < 2) {
      setErrors(prev => ({ ...prev, [field]: "This field must be at least 2 characters" }));
    } else {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = sanitizeInput(e.target.value);
    setFormData(prev => ({ ...prev, email: value }));
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value.length > 0 && !emailRegex.test(value)) {
      setErrors(prev => ({ ...prev, email: t("emailError") }));
    } else {
      setErrors(prev => ({ ...prev, email: "" }));
    }
  };

  const handleGstChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = sanitizeInput(e.target.value.toUpperCase()).slice(0, 15);
    setFormData(prev => ({ ...prev, gst: value }));
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (value.length > 0 && value.length === 15 && !gstRegex.test(value)) {
      setErrors(prev => ({ ...prev, gst: t("gstInvalidError") }));
    } else if (value.length > 0 && value.length < 15) {
      setErrors(prev => ({ ...prev, gst: t("gstLengthError") }));
    } else {
      setErrors(prev => ({ ...prev, gst: "" }));
    }
  };

  const handleNameChange = (field: string, value: string) => {
    const sanitizedValue = sanitizeInput(value);
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    if (sanitizedValue.length > 0 && sanitizedValue.length < 2) {
      setErrors(prev => ({ ...prev, [field]: t("nameError") }));
    } else {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = sanitizeInput(e.target.value);
    setFormData(prev => ({ ...prev, address: value }));
    if (value.length > 0 && value.length < 10) {
      setErrors(prev => ({ ...prev, address: t("addressError") }));
    } else {
      setErrors(prev => ({ ...prev, address: "" }));
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setFormData(prev => ({ ...prev, otp: value }));
  };

  const handleFarmerPersonalNext = (e: React.FormEvent) => {
    e.preventDefault();

    const personalErrors: FormErrors = {
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
    };

    if (!formData.fullName || formData.fullName.length < 2) personalErrors.fullName = "Full name is required";
    if (!formData.fatherName || formData.fatherName.length < 2) personalErrors.fatherName = "Father name is required";
    if (formData.aadhar.length !== 12) personalErrors.aadhar = "Aadhar must be 12 digits";
    if (formData.phone.length !== 10) personalErrors.phone = "Phone number must be 10 digits";
    if (formData.password.length < 6) personalErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) personalErrors.confirmPassword = "Passwords do not match";

    setErrors(prev => ({ ...prev, ...personalErrors }));

    const hasPersonalErrors = Object.values(personalErrors).some(error => error !== "");
    if (!hasPersonalErrors) setFarmerStep("address");
  };

  const handleFarmerAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreeToTerms) {
      setErrors(prev => ({ ...prev, terms: t("termsError") }));
      return;
    }
    setErrors(prev => ({ ...prev, terms: "" }));

    const addressErrors: FormErrors = {
      state: "",
      district: "",
      tehsil: "",
      block: "",
      village: "",
      pincode: "",
      fullName: "",
      fatherName: "",
      aadhar: "",
      phone: "",
      password: "",
      confirmPassword: "",
      address: "",
      name: "",
      email: "",
      gst: "",
      otp: "",
      terms: "",
    };

    if (!formData.state || formData.state.length < 2) addressErrors.state = "State is required";
    if (!formData.district || formData.district.length < 2) addressErrors.district = "District is required";
    if (!formData.tehsil || formData.tehsil.length < 2) addressErrors.tehsil = "Tehsil is required";
    if (!formData.block || formData.block.length < 2) addressErrors.block = "Block is required";
    if (!formData.village || formData.village.length < 2) addressErrors.village = "Village is required";
    if (formData.pincode.length !== 6) addressErrors.pincode = "Pincode must be 6 digits";

    setErrors(prev => ({ ...prev, ...addressErrors }));

    const hasAddressErrors = Object.values(addressErrors).some(error => error !== "");

    if (!hasAddressErrors) {
      setIsLoading(true);
      try {
        const { data } = await api.post("/api/farmer/register", {
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
        });

        if (data.success) {
          toast.success(data.message || "Registration successful!");
          navigate(`/login?role=${role}`);  // Navigate directly on success
        } else {
          toast.error(data.message || "Registration failed");
        }
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Network error. Please try again.");
        console.error("Registration error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePosSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreeToTerms) {
      setErrors(prev => ({ ...prev, terms: t("termsError") }));
      return;
    }
    setErrors(prev => ({ ...prev, terms: "" }));

    const hasErrors = Object.values(errors).some(error => error !== "");
    if (hasErrors) return;

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
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.otp.length === 6) {
      toast.success("POS registration successful!");
      navigate("/");
    }
  };

  return {
    // State
    isLoading,
    farmerStep,
    step,
    agreeToTerms,
    errors,
    formData,

    // Setters
    setFarmerStep,
    setStep,
    setAgreeToTerms,

    // Handlers
    handlePhoneChange,
    handleAadharChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handlePincodeChange,
    handleAddressFieldChange,
    handleEmailChange,
    handleGstChange,
    handleNameChange,
    handleAddressChange,
    handleOtpChange,
    handleFarmerPersonalNext,
    handleFarmerAddressSubmit,
    handlePosSignupSubmit,
    handleOtpSubmit,
  };
};
