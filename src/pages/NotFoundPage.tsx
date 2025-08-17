import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-lime-50 text-gray-800 font-sans p-4">
      <div className="text-center">
        <h1 className="text-9xl md:text-[12rem] font-black tracking-widest flex items-center justify-center">
          <span
            className="text-transparent"
            style={{ WebkitTextStroke: "2px #22c55e" }}
          >
            4
          </span>
          <span className="text-green-500 mx-2 animate-pulse">0</span>
          <span
            className="text-transparent"
            style={{ WebkitTextStroke: "2px #22c55e" }}
          >
            4
          </span>
        </h1>

        <p className="mt-4 text-lg text-gray-600 max-w-md mx-auto">
          {t("pageNotFoundMessage")}
        </p>

        <Link
          to="/home"
          className="mt-10 inline-block px-8 py-3 border border-green-500 text-green-600 rounded-lg font-semibold uppercase tracking-widest
                     hover:bg-green-500 hover:text-white 
                     transition-colors duration-300 ease-in-out"
        >
          {t("goToHomepage")}
        </Link>
      </div>
    </div>
  );
}
