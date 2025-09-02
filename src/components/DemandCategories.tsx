import React, { useState } from 'react';
import { X, Send, Sprout, Package, Wrench, Truck, Droplets, Shield, Lightbulb, Users } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  image: string;
  icon: React.ReactNode;
}

interface DemandCategoriesProps {
  onCategoryClick?: (category: Category) => void;
}

// Fallback/placeholder component with green background
const CategoryImageWithFallback: React.FC<{
  src: string;
  alt: string;
  icon: React.ReactNode;
  className?: string;
}> = ({ src, alt, icon, className = '' }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {!imageError && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      )}
      {(imageError || !imageLoaded) && (
        <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
          <div className="text-white text-2xl">
            {icon}
          </div>
        </div>
      )}
    </div>
  );
};

const DemandCategories: React.FC<DemandCategoriesProps> = ({ onCategoryClick }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customRequest, setCustomRequest] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories: Category[] = [
    {
      id: 'seeds',
      name: 'Seeds',
      image: 'https://picsum.photos/120/120?random=10',
      icon: <Sprout className="w-8 h-8" />
    },
    {
      id: 'fertilizers',
      name: 'Fertilizers',
      image: 'https://picsum.photos/120/120?random=11',
      icon: <Package className="w-8 h-8" />
    },
    {
      id: 'pesticides',
      name: 'Pesticides',
      image: 'https://picsum.photos/120/120?random=12',
      icon: <Shield className="w-8 h-8" />
    },
    {
      id: 'hardware',
      name: 'Hardware Equipments',
      image: 'https://picsum.photos/120/120?random=13',
      icon: <Wrench className="w-8 h-8" />
    },
    {
      id: 'irrigation',
      name: 'Irrigation Systems',
      image: 'https://picsum.photos/120/120?random=15',
      icon: <Droplets className="w-8 h-8" />
    },
    {
      id: 'transport',
      name: 'Transportation',
      image: 'https://picsum.photos/120/120?random=16',
      icon: <Truck className="w-8 h-8" />
    },
    {
      id: 'other',
      name: 'Other',
      image: 'https://picsum.photos/120/120?random=14',
      icon: <Lightbulb className="w-8 h-8" />
    }
  ];

  const handleCategoryClick = (category: Category) => {
    if (category.id === 'other') {
      setIsModalOpen(true);
    } else {
      onCategoryClick?.(category);
      console.log('Selected category:', category.name);
    }
  };

  const handleSubmitRequest = async () => {
    if (!customRequest.trim()) return;
    
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Custom request submitted:', customRequest);
      setCustomRequest('');
      setIsModalOpen(false);
      // You can add toast notification here
    } catch (error) {
      console.error('Failed to submit request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCustomRequest('');
  };

  return (
    <>
      <div className="bg-green-800 rounded-3xl p-8 shadow-lg border border-green-100 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-200 rounded-full opacity-20 transform translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-200 rounded-full opacity-20 transform -translate-x-12 translate-y-12"></div>
        
        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-100 mb-2">What do you need?</h2>
            <p className="text-gray-100">Browse categories or tell us your specific requirements</p>
          </div>
          
          {/* Mobile: Horizontal Scrolling Grid (2 columns, 2 rows) */}
          <div className="block lg:hidden">
            <div className="grid grid-flow-col auto-cols-[140px] grid-rows-2 gap-4 overflow-x-auto pb-4 scroll-snap-x-mandatory">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex flex-col items-center cursor-pointer group transform transition-all duration-300 hover:scale-105 scroll-snap-align-start"
                  onClick={() => handleCategoryClick(category)}
                >
                  {/* Category Image with enhanced styling */}
                  <div className="relative w-20 h-20 mb-3 group-hover:mb-2 transition-all duration-300">
                    <div className="w-full h-full rounded-full overflow-hidden shadow-lg group-hover:shadow-2xl transition-shadow duration-300 border-2 border-white group-hover:border-green-300">
                      <CategoryImageWithFallback
                        src={category.image}
                        alt={category.name}
                        icon={category.icon}
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                  
                  {/* Category Name */}
                  <span className="text-xs font-semibold text-gray-100 text-center group-hover:text-green-100 transition-colors duration-300 leading-tight px-1 max-w-full">
                    {category.name}
                  </span>
                  
                  {/* Hover indicator */}
                  <div className="w-0 group-hover:w-6 h-0.5 bg-white transition-all duration-300 mt-1"></div>
                </div>
              ))}
            </div>
            
            {/* Scroll indicator for mobile */}
            <div className="text-center mt-4">
              <p className="text-xs text-gray-200">← Scroll to see more categories →</p>
            </div>
          </div>

          {/* Desktop: Regular Grid (unchanged) */}
          <div className="hidden lg:grid lg:grid-cols-4 xl:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex flex-col items-center cursor-pointer group transform transition-all duration-300 hover:scale-105"
                onClick={() => handleCategoryClick(category)}
              >
                {/* Category Image with enhanced styling */}
                <div className="relative w-24 h-24 md:w-28 md:h-28 mb-4 group-hover:mb-3 transition-all duration-300">
                  <div className="w-full h-full rounded-full overflow-hidden shadow-lg group-hover:shadow-2xl transition-shadow duration-300 border-3 border-white group-hover:border-green-300">
                    <CategoryImageWithFallback
                      src={category.image}
                      alt={category.name}
                      icon={category.icon}
                      className="w-full h-full"
                    />
                  </div>
                </div>
                
                {/* Category Name */}
                <span className="text-sm md:text-base font-semibold text-gray-100 text-center group-hover:text-green-100 transition-colors duration-300 leading-tight px-2 max-w-full">
                  {category.name}
                </span>
                
                {/* Hover indicator */}
                <div className="w-0 group-hover:w-8 h-0.5 bg-white transition-all duration-300 mt-1"></div>
              </div>
            ))}
          </div>
          
          {/* Call to action */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-200">
              Can't find what you're looking for? Click on "Other" to send us a custom request!
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Modal (unchanged) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full mx-4 shadow-2xl transform transition-all duration-300">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-t-3xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Custom Request</h3>
                  <p className="text-green-100 text-sm mt-1">Tell us exactly what you need</p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Describe your requirements
                </label>
                <textarea
                  value={customRequest}
                  onChange={(e) => setCustomRequest(e.target.value)}
                  placeholder="e.g., Looking for organic wheat seeds for 10 acres, need drip irrigation system for vegetable farming, require pest control consultation..."
                  className="w-full h-36 p-4 border-2 border-gray-200 rounded-2xl resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200 text-gray-700"
                  maxLength={500}
                />
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">
                  💡 Be as specific as possible for better results
                </span>
                <span className={`${customRequest.length > 450 ? 'text-red-500' : 'text-gray-400'}`}>
                  {customRequest.length}/500
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 rounded-b-3xl flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-6 py-3 text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-2xl font-semibold transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRequest}
                disabled={!customRequest.trim() || isSubmitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
              >
                {isSubmitting ? (
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                {isSubmitting ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DemandCategories;
