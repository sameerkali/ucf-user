import { Link } from "react-router-dom";
import { GLOBLE } from "../assets/assets";

const SuccessPopup = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-sm:h-full max-sm:rounded-none max-sm:flex max-sm:flex-col max-sm:justify-center max-sm:p-6">
        <img
          src={GLOBLE.success}
          alt="Success"
          className="max-w-xs w-full mx-auto mb-8"
        />
        <Link
          to="/kisaan/home"
          className="block text-center px-6 py-3 bg-green-600 text-white font-semibold rounded-md shadow hover:bg-green-700 transition max-sm:mt-auto"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default SuccessPopup;
