import { useEffect, useState } from 'react';
import { GLOBLE } from "../assets/assets";

interface SuccessPopupProps {
  onClose?: () => void;
}

const SuccessPopup = ({ onClose }: SuccessPopupProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    
    const timer = setTimeout(() => {
      handleClose();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`max-w-sm w-full p-6 transform transition-all duration-300 ease-out max-sm:max-w-xs ${
          isAnimating 
            ? 'scale-100 opacity-100' 
            : 'scale-75 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <img
            src={GLOBLE.success}
            alt="Success"
            className="w-24 h-24 mx-auto mb-4 animate-bounce"
          />
        </div>
      </div>
    </div>
  );
};

export default SuccessPopup;
