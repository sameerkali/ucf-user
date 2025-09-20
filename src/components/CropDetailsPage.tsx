import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {  
  Calendar, 
  MapPin, 
  Package, 
  IndianRupee, 
  ShoppingCart,
  ChevronRight,
} from 'lucide-react';
import { GLOBLE } from '../assets/assets';
import api from '../api/axios';
import toast from 'react-hot-toast';
import FulfillmentModal from '../components/FulfillmentModal';
import SuccessPopup from '../components/SuccessPopup';

interface Crop {
  name: string;
  type: string;
  quantity: number;
  pricePerQuintal: number;
}

interface Location {
  state: string;
  district: string;
  tehsil: string;
  block: string;
  village: string;
  pincode: string;
}

interface CreatedBy {
  id: string;
  role: string;
}

interface Post {
  _id: string;
  type: string;
  title: string;
  description: string;
  crops: Crop[];
  readyByDate?: string;
  requiredByDate: string;
  photos: string[];
  videos: string[];
  location: Location;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdBy: CreatedBy;
  __v?: number;
}

interface FulfillmentPayload {
  postId: string;
  crops: Array<{
    name: string;
    type: string;
    quantity: number;
    pricePerQuintal: number;
  }>;
}

const CropDetailsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState<boolean>(false);

  const post: Post | null = location.state?.post || null;

  const fulfillmentMutation = useMutation({
    mutationFn: async (fulfillmentData: FulfillmentPayload): Promise<any> => {
      const { data } = await api.post('/api/fulfillments/create', fulfillmentData);
      return data;
    },
    onSuccess: () => {
      toast.dismiss();
      setIsModalOpen(false);
      setShowSuccessPopup(true);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to submit fulfillment request';
      toast.error(errorMessage);
    }
  });

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatFullLocation = (locationData: Location): string => {
    return `${locationData.village}, ${locationData.block}, ${locationData.tehsil}, ${locationData.district}, ${locationData.state} - ${locationData.pincode}`;
  };

  const handleFulfillmentClick = (): void => {
    if (post) {
      setIsModalOpen(true);
    }
  };

  const handleGoBack = (): void => {
    navigate(-1);
  };

  const handleSuccessPopupClose = (): void => {
    setShowSuccessPopup(false);
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <img
            src={GLOBLE.wheat_placeholder}
            alt="Error"
            className="w-32 h-32 mx-auto mb-6 object-contain opacity-60"
          />
          <h3 className="text-xl font-semibold text-gray-700 mb-3">
            Crop details not found
          </h3>
          <p className="text-gray-500 mb-6">
            The crop you're looking for might have been removed or doesn't exist.
          </p>
          <button
            onClick={handleGoBack}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <nav className="flex items-center text-sm text-gray-600 m-2" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-1 md:space-x-2">
            <li>
              <Link to={`/kisaan/home`}>Home</Link>
            </li>
            <li>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </li>
            <li className="text-gray-900 font-semibold">Crop Details</li>
          </ol>
        </nav>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="h-64 md:h-80">
                <img 
                  src={GLOBLE.wheat_placeholder} 
                  alt="Crop illustration"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {post.title}
              </h2>

              <p className="text-gray-600 leading-relaxed mb-6">
                {post.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-500">Required By</p>
                    <p className="font-semibold text-gray-900">{formatDate(post.requiredByDate)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-semibold text-gray-900">{formatFullLocation(post.location)}</p>
                  </div>
                </div>
              </div>
            </div>

            {post.crops && post.crops.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Package className="w-6 h-6 text-green-600" />
                  Available Crops ({post.crops.length})
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {post.crops.map((crop: Crop, index: number) => (
                    <div key={index} className="border border-green-200 rounded-xl p-6 bg-gradient-to-br from-green-50 to-emerald-50">
                      <div className="text-center mb-4">
                        <h4 className="font-bold text-green-800 text-xl mb-1">{crop.name}</h4>
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium capitalize">
                          {crop.type}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-3 p-3 bg-white rounded-lg">
                          <Package className="w-5 h-5 text-green-600" />
                          <div className="text-center">
                            <p className="text-sm text-gray-500">Quantity</p>
                            <p className="font-bold text-gray-900 text-lg">{crop.quantity} quintals</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-center gap-3 p-3 bg-white rounded-lg">
                          <IndianRupee className="w-5 h-5 text-green-600" />
                          <div className="text-center">
                            <p className="text-sm text-gray-500">Price per Quintal</p>
                            <p className="font-bold text-green-700 text-xl">₹{crop.pricePerQuintal}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-green-200">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-1">Total Value</p>
                          <p className="font-bold text-green-800 text-2xl">
                            ₹{(crop.quantity * crop.pricePerQuintal).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {post.status === 'active' && post.crops && post.crops.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Summary</h3>
                
                <div className="mb-6 p-4 bg-green-50 rounded-xl">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Varieties:</span>
                      <span className="font-bold text-lg">{post.crops.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Quantity:</span>
                      <span className="font-bold text-lg">
                        {post.crops.reduce((sum, crop) => sum + crop.quantity, 0)} quintals
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-green-200">
                      <span className="text-gray-600">Total Value:</span>
                      <span className="font-bold text-green-700 text-xl">
                        ₹{post.crops.reduce((sum, crop) => sum + (crop.quantity * crop.pricePerQuintal), 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleFulfillmentClick}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mb-4"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Request Fulfillment
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Seller {post.createdBy.role}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && post && (
        <FulfillmentModal
          post={post}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {}}
          fulfillmentMutation={fulfillmentMutation}
        />
      )}

      {showSuccessPopup && (
        <SuccessPopup onClose={handleSuccessPopupClose} />
      )}
    </div>
  );
};

export default CropDetailsPage;
