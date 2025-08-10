import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center  px-4">
      <div className=" rounded-xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-4 text-blue-700 text-center">
          {t("welcome")}
        </h1>
        <p className="mb-8 text-gray-600 text-center">
          {t("selectOption")}
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link to="/login" className="flex-1">
            <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300">
              {t("login")}
            </button>
          </Link>
          <Link to="/signup" className="flex-1">
            <button className="w-full py-2 px-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors duration-300">
              {t("signup")}
            </button>
          </Link>
          <Link to="/posts" className="flex-1">
            <button className="w-full py-2 px-4 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors duration-300">
              {t("posts")}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
