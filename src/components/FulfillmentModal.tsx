import React, { useState, useEffect } from 'react';
import { X, Package, Loader2, CheckCircle, IndianRupee, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

interface Crop {
  name: string;
  type: string;
  quantity: number;
  pricePerQuintal: number;
}

interface Post {
  _id: string;
  title: string;
  crops: Crop[];
}

interface FulfillmentCrop {
  name: string;
  type: string;
  quantity: number;
  pricePerQuintal: number;
}

interface FulfillmentModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  fulfillmentMutation: any;
}

const FulfillmentModal: React.FC<FulfillmentModalProps> = ({
  post,
  isOpen,
  onClose,
  fulfillmentMutation,
}) => {
  const [selectedCrops, setSelectedCrops] = useState<FulfillmentCrop[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && post.crops.length > 0) {
      setTimeout(() => {
        const firstCrop = post.crops[0];
        setSelectedCrops([{ 
          name: firstCrop.name, 
          type: firstCrop.type, 
          quantity: 0, 
          pricePerQuintal: firstCrop.pricePerQuintal 
        }]);
        setIsReady(true);
      }, 50);
    } else {
      setIsReady(false);
      setSelectedCrops([]);
    }
  }, [isOpen, post.crops]);

  useEffect(() => {
    setIsSubmitting(fulfillmentMutation.isPending || fulfillmentMutation.isLoading);
  }, [fulfillmentMutation.isPending, fulfillmentMutation.isLoading]);

  // Generate unique key for crop identification (name + type combination)
  const getCropKey = (crop: FulfillmentCrop | Crop) => `${crop.name}|${crop.type}`;

  const handleAddCrop = () => {
    // Find available crops that are not already selected
    const availableCrops = post.crops.filter(
      crop => !selectedCrops.some(selected => getCropKey(selected) === getCropKey(crop))
    );
    
    if (availableCrops.length > 0) {
      const newCrop = availableCrops[0];
      setSelectedCrops([...selectedCrops, { 
        name: newCrop.name, 
        type: newCrop.type, 
        quantity: 0, 
        pricePerQuintal: newCrop.pricePerQuintal 
      }]);
    }
  };

  const handleRemoveCrop = (index: number) => {
    setSelectedCrops(selectedCrops.filter((_, i) => i !== index));
  };

  const handleCropChange = (index: number, selectedCropKey: string) => {
    const [name, type] = selectedCropKey.split('|');
    const selectedPostCrop = post.crops.find(crop => crop.name === name && crop.type === type);
    
    if (selectedPostCrop) {
      const updatedCrops = [...selectedCrops];
      updatedCrops[index] = {
        name: selectedPostCrop.name,
        type: selectedPostCrop.type,
        quantity: 0,
        pricePerQuintal: selectedPostCrop.pricePerQuintal
      };
      setSelectedCrops(updatedCrops);
    }
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const updatedCrops = [...selectedCrops];
    updatedCrops[index].quantity = quantity;
    setSelectedCrops(updatedCrops);
  };

  const getMaxQuantity = (name: string, type: string) => {
    const crop = post.crops.find(c => c.name === name && c.type === type);
    return crop ? crop.quantity : 1;
  };

  const getAvailableCrops = (currentIndex: number) => {
    return post.crops.filter(crop => {
      const currentSelection = selectedCrops[currentIndex];
      const isCurrentSelection = currentSelection && getCropKey(currentSelection) === getCropKey(crop);
      const isAlreadySelected = selectedCrops.some((selected, index) => 
        getCropKey(selected) === getCropKey(crop) && index !== currentIndex
      );
      return isCurrentSelection || !isAlreadySelected;
    });
  };

  const getQuantityOptions = (maxQuantity: number) => {
    const options = [];
    
    if (maxQuantity <= 100) {
      for (let i = 1; i <= maxQuantity; i++) {
        options.push(i);
      }
    } else {
      for (let i = 1; i <= Math.min(20, maxQuantity); i++) {
        options.push(i);
      }
      
      if (maxQuantity > 20) {
        for (let i = 25; i <= Math.min(100, maxQuantity); i += 5) {
          options.push(i);
        }
      }
      
      if (maxQuantity > 100) {
        for (let i = 110; i <= maxQuantity; i += 10) {
          options.push(i);
        }
      }
    }
    
    return options;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validCrops = selectedCrops.filter(crop => crop.quantity > 0);
    
    if (validCrops.length === 0) {
      toast.error('Please select quantity for at least one crop');
      return;
    }

    setIsSubmitting(true);
    const payload = { 
      postId: post._id, 
      crops: validCrops.map(crop => ({
        name: crop.name,
        type: crop.type,
        quantity: crop.quantity,
        pricePerQuintal: crop.pricePerQuintal
      }))
    };
    
    try {
      await fulfillmentMutation.mutateAsync(payload);
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  const canAddMoreCrops = selectedCrops.length < post.crops.length;
  const hasValidSelection = selectedCrops.some(crop => crop.quantity > 0);
  const totalValue = selectedCrops
    .filter(crop => crop.quantity > 0)
    .reduce((sum, crop) => sum + (crop.quantity * crop.pricePerQuintal), 0);

  if (!isOpen || !isReady) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Request Fulfillment</h2>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-white hover:bg-white/20 p-1 rounded-full transition-all disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-green-100 mt-2 text-sm line-clamp-2">{post.title}</p>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-green-500" />
                Select Crops & Quantities
              </h3>
              
              <div className="space-y-4">
                {selectedCrops.map((selectedCrop, index) => {
                  const maxQuantity = getMaxQuantity(selectedCrop.name, selectedCrop.type);
                  const availableCrops = getAvailableCrops(index);
                  const quantityOptions = getQuantityOptions(maxQuantity);
                  
                  return (
                    <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-gray-700">Crop Selection {index + 1}</span>
                        {selectedCrops.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCrop(index)}
                            disabled={isSubmitting}
                            className="text-red-500 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        {/* Crop Selection Dropdown */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <div className="flex items-center gap-2">
                              <Tag className="w-4 h-4 text-gray-500" />
                              Crop & Type
                            </div>
                          </label>
                          <select
                            value={getCropKey(selectedCrop)}
                            onChange={(e) => handleCropChange(index, e.target.value)}
                            disabled={isSubmitting}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 bg-white"
                            required
                          >
                            {availableCrops.map((crop) => (
                              <option key={getCropKey(crop)} value={getCropKey(crop)}>
                                {crop.name} - {crop.type} ({crop.quantity} quintals available)
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Price Display */}
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <IndianRupee className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">Price Information</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-blue-700">Per Quintal:</span>
                            <span className="font-bold text-blue-700 text-lg">
                              ₹{selectedCrop.pricePerQuintal.toLocaleString('en-IN')}
                            </span>
                          </div>
                          {selectedCrop.quantity > 0 && (
                            <div className="flex justify-between items-center mt-1 pt-2 border-t border-blue-200">
                              <span className="text-blue-700">Total Value:</span>
                              <span className="font-bold text-blue-800 text-lg">
                                ₹{(selectedCrop.quantity * selectedCrop.pricePerQuintal).toLocaleString('en-IN')}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Quantity Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quantity (Max: {maxQuantity} quintals)
                            {selectedCrop.quantity === 0 && (
                              <span className="text-red-500 text-xs ml-1">*Required</span>
                            )}
                          </label>
                          {maxQuantity <= 10 ? (
                            <div className="grid grid-cols-5 gap-2">
                              {quantityOptions.map((num) => (
                                <label
                                  key={num}
                                  className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all ${
                                    selectedCrop.quantity === num
                                      ? 'bg-green-500 text-white border-green-500 shadow-md'
                                      : 'bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:bg-green-50'
                                  } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  <input
                                    type="radio"
                                    name={`quantity-${index}`}
                                    value={num}
                                    checked={selectedCrop.quantity === num}
                                    onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                                    disabled={isSubmitting}
                                    className="sr-only"
                                  />
                                  <span className="text-sm font-medium">{num}</span>
                                </label>
                              ))}
                            </div>
                          ) : (
                            <select
                              value={selectedCrop.quantity}
                              onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                              disabled={isSubmitting}
                              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 bg-white ${
                                selectedCrop.quantity === 0 ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                              required
                            >
                              <option value={0}>Select quantity</option>
                              {quantityOptions.map((num) => (
                                <option key={num} value={num}>
                                  {num} quintal{num > 1 ? 's' : ''}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {canAddMoreCrops && (
                <button
                  type="button"
                  onClick={handleAddCrop}
                  disabled={isSubmitting}
                  className="mt-4 w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-all border-2 border-dashed border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  Add Another Crop Variety
                </button>
              )}
            </div>

            {/* Enhanced Summary Section */}
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Fulfillment Summary
              </h4>
              {hasValidSelection ? (
                <>
                  <div className="space-y-2 text-sm mb-4">
                    {selectedCrops.filter(crop => crop.quantity > 0).map((crop, index) => (
                      <div key={index} className="flex justify-between items-center bg-white p-3 rounded-lg border border-green-100">
                        <div className="flex-1">
                          <div className="font-medium text-green-800">{crop.name} - {crop.type}</div>
                          <div className="text-xs text-green-600 mt-1">
                            {crop.quantity} quintals × ₹{crop.pricePerQuintal.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-green-700">
                            ₹{(crop.quantity * crop.pricePerQuintal).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-green-200 space-y-2">
                    <div className="flex justify-between font-semibold text-green-800">
                      <span>Total Varieties:</span>
                      <span>{selectedCrops.filter(crop => crop.quantity > 0).length}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-green-800">
                      <span>Total Quantity:</span>
                      <span>{selectedCrops.filter(crop => crop.quantity > 0).reduce((sum, crop) => sum + crop.quantity, 0)} quintals</span>
                    </div>
                    <div className="flex justify-between font-bold text-green-800 text-xl pt-2 border-t border-green-300">
                      <span>Total Value:</span>
                      <span>₹{totalValue.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-sm italic">Please select quantities to see summary</p>
              )}
            </div>
          </form>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex gap-3 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !hasValidSelection}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
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
