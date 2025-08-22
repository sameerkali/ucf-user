import React from "react";
import FallbackGreenCircle from "../utils/FallbackGreenCircle";

interface CropCardProps {
  title: string;
  description: string;
  cropType?: string;
  date?: string;
  image?: string;
  onClick: () => void;
}

const CropCard: React.FC<CropCardProps> = ({
  title,
  description,
  cropType,
  date,
  image,
  onClick,
}) => {
  const showFallback =
    !image || image.startsWith("http://localhost:5000") || image === "";

  return (
    <button
      className="bg-white rounded-xl shadow-md p-5 w-full max-w-md mx-auto transition-shadow hover:shadow-lg cursor-pointer outline-none focus:ring-2 focus:ring-green-400 text-left"
      onClick={onClick}
      type="button"
      tabIndex={0}
      aria-label={title}
    >
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 flex justify-center items-center">
          {showFallback ? (
            <FallbackGreenCircle />
          ) : (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover rounded-lg"
            />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-gray-900 font-semibold text-lg">{title}</h3>
          <div className="flex flex-col gap-1 mt-1 text-left">
            {cropType && (
              <p className="text-green-700 text-sm font-medium">{cropType}</p>
            )}
            {date && <p className="text-gray-500 text-xs">{date}</p>}
          </div>
        </div>
      </div>
      <p className="text-gray-700 text-sm mt-3">{description}</p>
    </button>
  );
};


export default CropCard;
