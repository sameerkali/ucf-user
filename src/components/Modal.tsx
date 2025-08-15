import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  message?: string;
}

export default function Modal({ title, isOpen, onClose, onConfirm, message }: ModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/70 bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 transform transition-all duration-200 scale-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600">
            {message || "Are you sure you want to proceed with this action?"}
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-medium"
          >
            Okay
          </button>
        </div>
      </div>
    </div>
  );
}
