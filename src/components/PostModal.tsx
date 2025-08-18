import React, { useState } from "react";
import { UploadCloud } from "lucide-react";

interface PostModalProps {
  open: boolean;
  onClose: () => void;
  crop?: {
    title: string;
    cropType?: string;
    date?: string;
    image?: string;
  };
}

const quantityOptions = Array.from({ length: 50 }, (_, i) => `${i + 1} quintal${i === 0 ? '' : 's'}`);

const PostModal: React.FC<PostModalProps> = ({ open, onClose, crop }) => {
  const [quantity, setQuantity] = useState(quantityOptions[0]);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit logic here
    console.log({ quantity, message, file });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/20 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl relative">
        {/* No X icon per request */}

        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          Add Request Details
        </h2>
        {crop && (
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gray-100 rounded flex justify-center items-center overflow-hidden">
              {crop.image ? (
                <img
                  src={crop.image}
                  alt={crop.title}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-green-600 font-bold text-lg">
                  {crop.title[0]}
                </span>
              )}
            </div>
            <div>
              <span className="block font-semibold text-gray-900">
                {crop.title}
              </span>
              {crop.cropType && (
                <span className="text-green-700">{crop.cropType}</span>
              )}
              {crop.date && (
                <span className="text-gray-500 ml-2">{crop.date}</span>
              )}
            </div>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="fileInput"
              className="block text-gray-700 text-sm mb-2 cursor-pointer"
            >
              Photo/Video
            </label>
            <div className="relative border border-gray-300 rounded-md bg-gray-50 hover:border-green-500 transition-colors">
              <input
                type="file"
                id="fileInput"
                accept="image/*,video/*"
                className="w-full h-12 opacity-0 cursor-pointer z-10 relative rounded-md"
                onChange={handleFileChange}
              />
              <div className="absolute inset-0 flex items-center justify-center gap-2 pointer-events-none">
                <UploadCloud className="w-6 h-6 text-green-500" />
                <span className="text-gray-500 select-none truncate max-w-[80%]">
                  {file ? file.name : "Click or drag to upload"}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="quantitySelect"
              className="block text-gray-700 text-sm mb-2"
            >
              Quantity
            </label>
            <div className="relative">
              <select
                id="quantitySelect"
                className="
                  w-full
                  p-3
                  rounded-md
                  border
                  border-gray-300
                  bg-white
                  text-gray-800
                  focus:border-green-500
                  focus:ring-1
                  focus:ring-green-400
                  appearance-none
                  pr-10
                  text-base
                  transition
                  shadow-sm
                  focus:outline-none
                  focus-visible:outline-none
                "
                style={{ maxHeight: 200, overflowY: "auto" }}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              >
                {quantityOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <span className="absolute top-3 right-3 pointer-events-none text-gray-400">
                ▼
              </span>
            </div>
          </div>

          <div>
            <label
              htmlFor="messageInput"
              className="block text-gray-700 text-sm mb-2"
            >
              Message
            </label>
            <textarea
              id="messageInput"
              rows={4}
              placeholder="Enter message"
              className="w-full p-3 rounded-md border border-gray-300 bg-white text-gray-700 shadow-sm focus:border-green-500 focus:ring-1 focus:ring-green-400 focus:outline-none focus-visible:outline-none transition"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700 transition"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostModal;
