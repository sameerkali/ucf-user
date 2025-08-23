import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import type { ConfirmationResult, User } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

export const setupRecaptcha = (containerId = "recaptcha-container") => {
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
    window.recaptchaVerifier = undefined;
  }
  window.recaptchaVerifier = new RecaptchaVerifier(
    auth,
    containerId,
    {
      size: "normal", // visible reCAPTCHA
      callback: (response: any) => {
        // Optional callback - can handle after captcha solved
      },
      "expired-callback": () => {
        // Optional on expire - user has to solve again
      },
    }
  );
  window.recaptchaVerifier.render(); // explicitly render the captcha
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
