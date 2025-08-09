import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./english.json";
import hi from "./hindi.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
    },
    fallbackLng: "en", // fallback if nothing found
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"], // check localStorage first
      caches: ["localStorage"], // store language in localStorage
    },
  });

export default i18n;
