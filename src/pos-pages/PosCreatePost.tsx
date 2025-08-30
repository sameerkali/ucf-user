import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ShoppingCart, Store, Plus, Trash2, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';

interface Crop {
  name: string;
  type: string;
  quantity: number;
  pricePerQuintal: number;
}

const PosCreatePost: FC = () => {
  const navigate = useNavigate();
  const [intent, setIntent] = useState<'buy' | 'sell'>('buy');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requiredByDate: '',
    readyByDate: '',
  });
  const [crops, setCrops] = useState<Crop[]>([{ name: '', type: '', quantity: 0, pricePerQuintal: 0 }]);
  const [files, setFiles] = useState<{ photos: FileList | null; videos: FileList | null }>({ photos: null, videos: null });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const token = localStorage.getItem('token');
      const { data: result } = await api.post('/api/posts/create', data, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      return result;
    },
    onSuccess: () => {
      toast.success(`🎉 ${intent === 'buy' ? 'Buy' : 'Sell'} post created successfully!`);
      navigate('/pos/home');
    },
    onError: (error: any) => {
      toast.error(`❌ ${error?.response?.data?.message || 'Failed to create post'}`);
    }
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCropChange = (index: number, field: keyof Crop, value: string) => {
    setCrops(prev => prev.map((crop, i) => 
      i === index 
        ? { ...crop, [field]: field === 'quantity' || field === 'pricePerQuintal' ? Number(value) || 0 : value }
        : crop
    ));
  };

  const addCrop = () => setCrops(prev => [...prev, { name: '', type: '', quantity: 0, pricePerQuintal: 0 }]);
  const removeCrop = (index: number) => crops.length > 1 && setCrops(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim() || !formData.description.trim()) {
      return toast.error('⚠️ Title and description are required');
    }
    if (intent === 'buy' && !formData.requiredByDate) {
      return toast.error('⚠️ Required by date is needed for buy posts');
    }
    if (intent === 'sell' && !formData.readyByDate) {
      return toast.error('⚠️ Ready by date is needed for sell posts');
    }
    if (crops.some(crop => !crop.name.trim() || !crop.type.trim() || crop.quantity <= 0 || crop.pricePerQuintal <= 0)) {
      return toast.error('⚠️ Please fill all crop details correctly');
    }

    // Build FormData
    const submitData = new FormData();
    submitData.append('intent', intent);
    submitData.append('title', formData.title);
    submitData.append('description', formData.description);
    
    if (intent === 'buy') submitData.append('requiredByDate', formData.requiredByDate);
    if (intent === 'sell') submitData.append('readyByDate', formData.readyByDate);

    crops.forEach((crop, index) => {
      submitData.append(`crops.name[${index}]`, crop.name);
      submitData.append(`crops.type[${index}]`, crop.type);
      submitData.append(`crops.quantity[${index}]`, crop.quantity.toString());
      submitData.append(`crops.pricePerQuintal[${index}]`, crop.pricePerQuintal.toString());
    });

    if (files.photos) Array.from(files.photos).forEach(photo => submitData.append('photos', photo));
    if (files.videos) Array.from(files.videos).forEach(video => submitData.append('videos', video));

    mutation.mutate(submitData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-50 px-4 py-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button 
            onClick={() => navigate('/pos/home')}
            className="mr-4 p-2 hover:bg-white hover:shadow-md rounded-full transition-all duration-200 focus:outline-none"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Create New Post</h1>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
          {/* Intent Selection */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { value: 'buy', icon: ShoppingCart, label: 'Buy Request', desc: 'Looking to purchase crops' },
              { value: 'sell', icon: Store, label: 'Sell Offer', desc: 'Have crops to sell' }
            ].map(({ value, icon: Icon, label, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => setIntent(value as 'buy' | 'sell')}
                className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                  intent === value 
                    ? 'border-green-500 bg-green-50 shadow-md' 
                    : 'border-gray-200 hover:border-green-300 hover:bg-green-25'
                }`}
              >
                <div className="flex items-center justify-center mb-2">
                  <Icon className={`w-8 h-8 ${intent === value ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <h3 className={`font-bold text-lg ${intent === value ? 'text-green-700' : 'text-gray-700'}`}>
                  {label}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{desc}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Post Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder={intent === 'buy' ? 'What crops are you looking to buy?' : 'What crops are you selling?'}
                  className="w-full p-4 border-2 border-green-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Provide detailed information about your requirements or offerings"
                  rows={4}
                  className="w-full p-4 border-2 border-green-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {intent === 'buy' ? 'Required By Date' : 'Ready By Date'}
                </label>
                <input
                  type="date"
                  value={intent === 'buy' ? formData.requiredByDate : formData.readyByDate}
                  onChange={(e) => handleInputChange(intent === 'buy' ? 'requiredByDate' : 'readyByDate', e.target.value)}
                  className="w-full p-4 border-2 border-green-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {/* Crops Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-semibold text-gray-700">Crop Details</label>
                <button
                  type="button"
                  onClick={addCrop}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Crop
                </button>
              </div>

              <div className="space-y-4">
                {crops.map((crop, index) => (
                  <div key={index} className="p-4 border-2 border-gray-200 rounded-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <input
                        type="text"
                        placeholder="Crop Name (e.g., Wheat)"
                        value={crop.name}
                        onChange={(e) => handleCropChange(index, 'name', e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Type (e.g., Grain)"
                        value={crop.type}
                        onChange={(e) => handleCropChange(index, 'type', e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Quantity"
                        min="1"
                        value={crop.quantity || ''}
                        onChange={(e) => handleCropChange(index, 'quantity', e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Price per Quintal"
                        min="1"
                        value={crop.pricePerQuintal || ''}
                        onChange={(e) => handleCropChange(index, 'pricePerQuintal', e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                        required
                      />
                    </div>
                    {crops.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCrop(index)}
                        className="flex items-center gap-2 text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> Remove Crop
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* File Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Photos (Optional)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setFiles(prev => ({ ...prev, photos: e.target.files }))}
                  className="w-full p-4 border-2 border-green-200 rounded-xl focus:border-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Videos (Optional)</label>
                <input
                  type="file"
                  multiple
                  accept="video/*"
                  onChange={(e) => setFiles(prev => ({ ...prev, videos: e.target.files }))}
                  className="w-full p-4 border-2 border-green-200 rounded-xl focus:border-green-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg flex justify-center items-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" />
                  Creating Post...
                </>
              ) : (
                <>
                  {intent === 'buy' ? <ShoppingCart className="w-5 h-5" /> : <Store className="w-5 h-5" />}
                  Create {intent === 'buy' ? 'Buy Request' : 'Sell Offer'}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PosCreatePost;
