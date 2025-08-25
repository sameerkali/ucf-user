import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import type { ConfirmationResult, User } from "firebase/auth";

// const firebaseConfig = {
//   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//   authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
//   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
//   storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
//   appId: import.meta.env.VITE_FIREBASE_APP_ID,
// };


const firebaseConfig = {
  apiKey: "AIzaSyDj68zZAmZbIhyYWQJ5dZC-XHcUzRavWpY",
  authDomain: "ucf-proj.firebaseapp.com",
  projectId: "ucf-proj",
  storageBucket: "ucf-proj.firebasestorage.app",
  messagingSenderId: "46350180296",
  appId: "1:46350180296:web:ab3142a324f1d78ec4aafd",
  measurementId: "G-2RBLVRKFEQ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

export const setupRecaptcha = (containerId = "recaptcha-container") => {
  // Clear any existing verifier
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (error) {
      console.log("Error clearing recaptcha:", error);
    }
    window.recaptchaVerifier = undefined;
  }

  // Clear the container
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = "";
  }

  // Create new invisible reCAPTCHA verifier
  window.recaptchaVerifier = new RecaptchaVerifier(
    auth,
    containerId,
    {
      size: "invisible", // invisible reCAPTCHA - no user interaction needed
      callback: (response: any) => {
        // reCAPTCHA solved automatically
        console.log("reCAPTCHA solved", response);
      },
      "expired-callback": () => {
        // reCAPTCHA expired - will need to solve again
        console.log("reCAPTCHA expired");
      },
    }
  );

  return window.recaptchaVerifier;
};

export const sendOTP = (phoneNumber: string): Promise<ConfirmationResult> => {
  const verifier = window.recaptchaVerifier || setupRecaptcha("recaptcha-container");
  return signInWithPhoneNumber(auth, `+91${phoneNumber}`, verifier);
};

export const verifyOTP = (confirmationResult: ConfirmationResult, otp: string) => {
  return confirmationResult.confirm(otp);
};

export const getIdTokenFromUser = (user: User) => {
  return user.getIdToken();
};

export const clearRecaptcha = () => {
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (error) {
      console.log("Error clearing recaptcha:", error);
    }
    window.recaptchaVerifier = undefined;
  }
};
