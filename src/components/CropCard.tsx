import React from 'react';
import { Package, IndianRupee } from 'lucide-react';
import { GLOBLE } from '../assets/assets';

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
  const crop = post.crops[0];
  
  if (variant === 'mobile') {
    return (
      <div 
        className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 w-72 cursor-pointer overflow-hidden"
        onClick={() => onClick(post)}
      >
        {/* Image - 60% height with green tint */}
        <div className="h-48 w-full relative">
          <img 
            src={GLOBLE.wheat_placeholder} 
            alt="Crop illustration"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 transition-all duration-300"></div>
        </div>
        
        {/* Content - 40% */}
        <div className="p-4 h-32 flex flex-col justify-center">
          {crop && (
            <div className="space-y-2">
              <div className="text-center">
                <p className="font-bold text-green-800 text-lg leading-tight">{crop.name}</p>
                <p className="text-sm text-gray-600 capitalize">{crop.type}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center justify-center gap-1 p-2 bg-gray-50 rounded-lg">
                  <Package className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-700 font-semibold">{crop.quantity}q</span>
                </div>
                <div className="flex items-center justify-center gap-1 p-2 bg-green-50 rounded-lg">
                  <IndianRupee className="w-3 h-3 text-green-600" />
                  <span className="text-green-700 font-bold">₹{crop.pricePerQuintal}/q</span>
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
      className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
      onClick={() => onClick(post)}
    >
      {/* Image - 60% height with green tint */}
      <div className="h-48 w-full relative overflow-hidden">
        <img 
          src={GLOBLE.wheat_placeholder} 
          alt="Crop illustration"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t  transition-all duration-300"></div>
      </div>
      
      {/* Content - 40% */}
      <div className="p-4 h-32 flex flex-col justify-center">
        {crop && (
          <div className="space-y-3">
            {/* Crop Name & Type */}
            <div className="text-center">
              <p className="font-bold text-green-800 text-xl leading-tight">{crop.name}</p>
              <p className="text-sm text-gray-600 capitalize">{crop.type}</p>
            </div>
            
            {/* Quantity and Price */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-center gap-2 p-2 bg-gray-50 rounded-lg">
                <Package className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700 font-semibold text-sm">{crop.quantity} quintals</span>
              </div>
              <div className="flex items-center justify-center gap-2 p-2 bg-green-50 rounded-lg">
                <IndianRupee className="w-4 h-4 text-green-600" />
                <span className="text-green-700 font-bold text-sm">₹{crop.pricePerQuintal}/q</span>
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
