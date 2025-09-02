import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  image: string;
}

interface DemandCategoriesProps {
  onCategoryClick?: (category: Category) => void;
}

const DemandCategories: React.FC<DemandCategoriesProps> = ({ onCategoryClick }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customRequest, setCustomRequest] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories: Category[] = [
    {
      id: 'seeds',
      name: 'Seeds',
      image: 'https://picsum.photos/100/100?random=10'
    },
    {
      id: 'fertilizers',
      name: 'Fertilizers',
      image: 'https://picsum.photos/100/100?random=11'
    },
    {
      id: 'pesticides',
      name: 'Pesticides',
      image: 'https://picsum.photos/100/100?random=12'
    },
    {
      id: 'hardware',
      name: 'Hardware Equipments',
      image: 'https://picsum.photos/100/100?random=13'
    },
    {
      id: 'other',
      name: 'Other',
      image: 'https://picsum.photos/100/100?random=14'
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
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Demand</h2>
        
        {/* Categories Grid */}
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => handleCategoryClick(category)}
            >
              {/* Category Image */}
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-full overflow-hidden mb-3 group-hover:shadow-lg transition-shadow duration-200 border-2 border-gray-200 group-hover:border-green-300">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              
              {/* Category Name */}
              <span className="text-sm font-medium text-gray-700 text-center group-hover:text-green-700 transition-colors duration-200 leading-tight">
                {category.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Other Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full mx-4 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">Custom Request</h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Tell us what you're looking for and we'll help you find it.
              </p>
              
              <textarea
                value={customRequest}
                onChange={(e) => setCustomRequest(e.target.value)}
                placeholder="Describe what you need... (e.g., organic seeds, specific fertilizer brand, etc.)"
                className="w-full h-32 p-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200"
                maxLength={500}
              />
              
              <div className="text-right text-sm text-gray-400 mt-2">
                {customRequest.length}/500
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRequest}
                disabled={!customRequest.trim() || isSubmitting}
                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Send className="w-4 h-4" />
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
