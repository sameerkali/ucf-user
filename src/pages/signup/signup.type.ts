import type { NavigateFunction } from "react-router-dom";

export type Role = "kisaan" | "pos";
export type Step = "signup" | "otp";
export type FarmerStep = "personal" | "address";

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
  gst: string;
  otp: string;
}

export interface FormErrors {
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
  gst: string;
  otp: string;
  terms: string;
}

export interface UseSignupFormProps {
  role: Role;
  navigate: NavigateFunction;
}
