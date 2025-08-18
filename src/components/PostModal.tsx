import React from "react";

interface PostModalProps {
  open: boolean;
  onClose: () => void;
}

const PostModal: React.FC<PostModalProps> = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center">
      <div className="bg-gray-900 rounded-xl p-6 w-11/12 max-w-md shadow-xl">
        <h2 className="text-xl font-semibold mb-4 text-white">Post Update</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-white text-sm mb-2" htmlFor="fileInput">
              Photo/Video
            </label>
            <input
              id="fileInput"
              type="file"
              className="w-full p-2 rounded bg-gray-800 text-white"
            />
          </div>
          <div>
            <label className="block text-white text-sm mb-2" htmlFor="quantityInput">
              Quantity
            </label>
            <input
              id="quantityInput"
              type="number"
              placeholder="Enter quantity"
              className="w-full p-2 rounded bg-gray-800 text-white"
            />
          </div>
          <div>
            <label className="block text-white text-sm mb-2" htmlFor="messageInput">
              Message
            </label>
            <textarea
              id="messageInput"
              rows={3}
              placeholder="Enter message"
              className="w-full p-2 rounded bg-gray-800 text-white"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-700 text-white"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700"
            >
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostModal;
