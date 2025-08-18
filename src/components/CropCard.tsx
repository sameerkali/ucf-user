import React from "react";
import FallbackGreenCircle from "../utils/FallbackGreenCircle";

interface CropCardProps {
  title: string;
  description: string;
  status?: string;
  image?: string;
  onTrack: () => void;
  onCancel: () => void;
  onPost: () => void;
}

const CropCard: React.FC<CropCardProps> = ({
  title,
  description,
  status,
  image,
  onTrack,
  onCancel,
  onPost,
}) => {
  const showFallback = !image || image.startsWith("http://localhost:5000");

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start bg-gray-900 rounded-xl p-4 my-2 w-full max-w-xl shadow-md gap-4">
      <div className="shrink-0 flex items-center justify-center w-16 h-16 bg-gray-800 rounded-lg">
        {showFallback ? (
          <FallbackGreenCircle />
        ) : (
          <img
            src={image}
            alt={title}
            className="w-16 h-16 object-cover rounded-lg"
          />
        )}
      </div>
      <div className="flex-1 w-full">
        <div className="flex justify-between items-center w-full">
          <span className="font-semibold text-lg text-white">{title}</span>
          {status ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
              {status}
            </span>
          ) : null}
        </div>
        <div className="text-gray-300 text-sm mt-1">{description}</div>
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <button
            className="w-full sm:w-auto px-4 py-2 rounded bg-green-600 text-white font-semibold flex items-center justify-center gap-1 hover:bg-green-700 transition"
            onClick={onTrack}
            type="button"
          >
            Track <span className="ml-1">&rarr;</span>
          </button>
          <button
            className="w-full sm:w-auto px-4 py-2 rounded bg-gray-800 text-white font-semibold hover:bg-gray-900 transition"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="w-full sm:w-auto px-4 py-2 rounded bg-blue-700 text-white font-semibold hover:bg-blue-800 transition"
            onClick={onPost}
            type="button"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default CropCard;
