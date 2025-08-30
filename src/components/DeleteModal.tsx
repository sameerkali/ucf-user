import { AlertTriangle, Loader2, Trash2 } from "lucide-react";


// Delete Modal Component
interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  postTitle: string;
  isDeleting: boolean;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, onConfirm, postTitle, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full mx-4 p-6 shadow-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Delete Post</h3>
            <p className="text-sm text-gray-500">This action cannot be undone</p>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700 mb-2">
            Are you sure you want to delete this post?
          </p>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="font-medium text-gray-900 truncate">"{postTitle}"</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete Post
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;