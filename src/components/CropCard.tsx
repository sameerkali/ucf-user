import React from 'react';
import { Package, IndianRupee } from 'lucide-react';
import { ILLUSTRATIONS } from '../assets/assets';

export interface Crop {
  name: string;
  type: string;
  quantity: number;
  pricePerQuintal: number;
}

export interface Post {
  _id: string;
  type: string;
  title: string;
  crops: Crop[];
  status: string;
}

interface CropCardProps {
  post: Post;
  onClick: (post: Post) => void;
  variant?: 'mobile' | 'desktop';
}

const CropCard: React.FC<CropCardProps> = ({ post, onClick, variant = 'mobile' }) => {
  const crop = post.crops[0]; // Show first crop
  
  if (variant === 'mobile') {
    return (
      <div 
        className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 w-72 cursor-pointer overflow-hidden"
        onClick={() => onClick(post)}
      >
        {/* Image - 40% height */}
        <div className="h-32 w-full">
          <img 
            src={ILLUSTRATIONS.kisaan07} 
            alt="Crop illustration"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Content - 60% */}
        <div className="p-4 h-48 flex flex-col">
          {crop && (
            <div className="flex-1 space-y-3">
              <div>
                <p className="font-bold text-green-800 text-lg">{crop.name}</p>
                <p className="text-sm text-gray-600">{crop.type}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700 font-semibold">{crop.quantity} quintals</span>
                </div>
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-green-600" />
                  <span className="text-green-700 font-bold text-lg">₹{crop.pricePerQuintal}/quintal</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden group"
      onClick={() => onClick(post)}
    >
      {/* Image - 40% height */}
      <div className="h-40 w-full relative">
        <img 
          src={ILLUSTRATIONS.kisaan07} 
          alt="Crop illustration"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
      </div>
      
      {/* Content - 60% */}
      <div className="p-4 h-60 flex flex-col">
        {crop && (
          <div className="flex-1 flex flex-col justify-center space-y-4">
            {/* Crop Name & Type */}
            <div className="text-center">
              <p className="font-bold text-green-800 text-xl mb-1">{crop.name}</p>
              <p className="text-sm text-gray-600 capitalize">{crop.type}</p>
            </div>
            
            {/* Quantity and Price */}
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 p-2 bg-gray-50 rounded-lg">
                <Package className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700 font-semibold">{crop.quantity} quintals</span>
              </div>
              <div className="flex items-center justify-center gap-2 p-2 bg-green-50 rounded-lg">
                <IndianRupee className="w-4 h-4 text-green-600" />
                <span className="text-green-700 font-bold text-lg">₹{crop.pricePerQuintal}/q</span>
              </div>
            </div>

            {/* Additional crops indicator */}
            {post.crops.length > 1 && (
              <div className="text-center">
                <span className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block">
                  +{post.crops.length - 1} more
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CropCard;
