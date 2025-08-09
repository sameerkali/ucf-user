import { useTranslation } from "react-i18next";

export default function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "hi" : "en";
    i18n.changeLanguage(newLang);
    localStorage.setItem("appLanguage", newLang);
  };

  return (
    <button className="absolute px-7 py-3 bg-black text-white rounded-2xl bottom-10 right-10 min-w-[10rem]" onClick={toggleLanguage}>
      {i18n.language === "en" ? "हिन्दी" : "English"}
    </button>
  );
}
