import type { NavigateFunction } from "react-router-dom";

export type Role = "kisaan" | "pos";
export type Step = "signup" | "otp";
export type FarmerStep = "personal" | "address";
export type PosStep = "personal" | "address";

export interface FormData {
  fullName: string;
  fatherName: string;
  aadhar: string;
  phone: string;
  password: string;
  confirmPassword: string;
  address: string;
  state: string;
  district: string;
  tehsil: string;
  block: string;
  village: string;
  pincode: string;
  name: string;
  email: string;
  mobile: string;
  gst: string;
  otp: string;
}

export interface FormErrors {
  fullName?: string;
  fatherName?: string;
  aadhar?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  address?: string;
  state?: string;
  district?: string;
  tehsil?: string;
  block?: string;
  village?: string;
  pincode?: string;
  name?: string;
  email?: string;
  mobile?: string;
  gst?: string;
  otp?: string;
  terms?: string;
}

export interface UseSignupFormProps {
  role: Role;
  navigate: NavigateFunction;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const debugLog = (context: string, data: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${context}]`, data);
  }
};
