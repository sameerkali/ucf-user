import React, { useState, useEffect } from 'react';
import { X, Package, Loader2, CheckCircle } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

interface Crop {
  name: string;
  type: string;
  quantity: string;
  pricePerQuintal: string;
}

interface Post {
  _id: string;
  title: string;
  crops: Crop[];
}

interface FulfillmentCrop {
  name: string;
  quantity: number;
}

interface FulfillmentModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const FulfillmentModal: React.FC<FulfillmentModalProps> = ({
  post,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedCrops, setSelectedCrops] = useState<FulfillmentCrop[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && post.crops.length > 0) {
      // Initialize with first crop and quantity 1
      setSelectedCrops([
        {
          name: post.crops[0].name,
          quantity: 1,
        },
      ]);
    }
  }, [isOpen, post.crops]);

  const handleAddCrop = () => {
    const availableCrops = post.crops.filter(
      crop => !selectedCrops.some(selected => selected.name === crop.name)
    );
    
    if (availableCrops.length > 0) {
      setSelectedCrops([
        ...selectedCrops,
        {
          name: availableCrops[0].name,
          quantity: 1,
        },
      ]);
    }
  };

  const handleRemoveCrop = (index: number) => {
    setSelectedCrops(selectedCrops.filter((_, i) => i !== index));
  };

  const handleCropChange = (index: number, field: keyof FulfillmentCrop, value: string | number) => {
    const updatedCrops = [...selectedCrops];
    if (field === 'name') {
      updatedCrops[index][field] = value as string;
      // Reset quantity when crop changes
      updatedCrops[index].quantity = 1;
    } else {
      updatedCrops[index][field] = value as number;
    }
    setSelectedCrops(updatedCrops);
  };

  const getMaxQuantity = (cropName: string) => {
    const crop = post.crops.find(c => c.name === cropName);
    return crop ? parseInt(crop.quantity) : 1;
  };

  const getAvailableCrops = (currentIndex: number) => {
    return post.crops.filter(crop => {
      const isCurrentSelection = selectedCrops[currentIndex]?.name === crop.name;
      const isAlreadySelected = selectedCrops.some((selected, index) => 
        selected.name === crop.name && index !== currentIndex
      );
      return isCurrentSelection || !isAlreadySelected;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedCrops.length === 0) {
      toast.error('Please select at least one crop');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        postId: post._id,
        crops: selectedCrops,
      };

      const response = await api.post('/api/fulfillments/create', payload);
      
      if (response.data.success || response.status === 200 || response.status === 201) {
        onSuccess();
      } else {
        toast.error(response.data.message || 'Failed to submit fulfillment request');
      }
    } catch (error: any) {
      console.error('Error submitting fulfillment:', error);
      toast.error(error.response?.data?.message || 'Failed to submit fulfillment request');
    }

    setLoading(false);
  };

  const canAddMoreCrops = selectedCrops.length < post.crops.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Request Fulfillment</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded-full transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-blue-100 mt-2 text-sm line-clamp-2">{post.title}</p>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-500" />
                Select Crops & Quantities
              </h3>
              
              <div className="space-y-4">
                {selectedCrops.map((selectedCrop, index) => {
                  const maxQuantity = getMaxQuantity(selectedCrop.name);
                  const availableCrops = getAvailableCrops(index);
                  
                  return (
                    <div key={index} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-gray-700">Crop {index + 1}</span>
                        {selectedCrops.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCrop(index)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        {/* Crop Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Crop Name
                          </label>
                          <select
                            value={selectedCrop.name}
                            onChange={(e) => handleCropChange(index, 'name', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          >
                            {availableCrops.map((crop) => (
                              <option key={crop.name} value={crop.name}>
                                {crop.name} ({crop.quantity} quintals available)
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quantity Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity (Max: {maxQuantity} quintals)
                          </label>
                          <select
                            value={selectedCrop.quantity}
                            onChange={(e) => handleCropChange(index, 'quantity', parseInt(e.target.value))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          >
                            {Array.from({ length: maxQuantity }, (_, i) => i + 1).map((num) => (
                              <option key={num} value={num}>
                                {num} quintal{num > 1 ? 's' : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add More Crops Button */}
              {canAddMoreCrops && (
                <button
                  type="button"
                  onClick={handleAddCrop}
                  className="mt-4 w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-all border-2 border-dashed border-gray-300 hover:border-gray-400"
                >
                  + Add Another Crop
                </button>
              )}
            </div>

            {/* Summary */}
            <div className="bg-blue-50 rounded-xl p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Request Summary</h4>
              <ul className="space-y-1 text-sm">
                {selectedCrops.map((crop, index) => (
                  <li key={index} className="flex justify-between text-blue-700">
                    <span>{crop.name}</span>
                    <span>{crop.quantity} quintal{crop.quantity > 1 ? 's' : ''}</span>
                  </li>
                ))}
              </ul>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 transition-all font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || selectedCrops.length === 0}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Submit Request
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FulfillmentModal;
