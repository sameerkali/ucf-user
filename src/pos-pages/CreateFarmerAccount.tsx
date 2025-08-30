import React, { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';

// TypeScript interfaces
interface Address {
  state: string;
  district: string;
  tehsil: string;
  block: string;
  village: string;
  pincode: string;
}

interface FarmerFormData {
  name: string;
  fatherName: string;
  password: string;
  mobile: string;
  adharNo: string;
  address: Address;
}

const CreateFarmerAccount: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<FarmerFormData>({
    name: '',
    fatherName: '',
    password: '',
    mobile: '',
    adharNo: '',
    address: {
      state: '',
      district: '',
      tehsil: '',
      block: '',
      village: '',
      pincode: '',
    }
  });

  // Validation function with better error messages
  const validate = (): string => {
    if (!formData.name.trim()) return 'Full name is required';
    if (formData.name.trim().length < 2) return 'Name must be at least 2 characters';
    if (!formData.fatherName.trim()) return 'Father\'s name is required';
    if (formData.fatherName.trim().length < 2) return 'Father\'s name must be at least 2 characters';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    if (!/^\d{10}$/.test(formData.mobile)) return 'Mobile number must be exactly 10 digits';
    if (!/^\d{12}$/.test(formData.adharNo)) return 'Aadhar number must be exactly 12 digits';
    if (!formData.address.state.trim()) return 'State is required';
    if (!formData.address.district.trim()) return 'District is required';
    if (!formData.address.tehsil.trim()) return 'Tehsil is required';
    if (!formData.address.block.trim()) return 'Block is required';
    if (!formData.address.village.trim()) return 'Village is required';
    if (!/^\d{6}$/.test(formData.address.pincode)) return 'Pincode must be exactly 6 digits';
    return '';
  };

  // API mutation with proper typing
  const createFarmerMutation = useMutation({
    mutationFn: async (farmerData: FarmerFormData): Promise<any> => {
      const { data } = await api.post('/api/pos/farmers', farmerData);
      return data;
    },
    onSuccess: () => {
      toast.success('🎉 Farmer account created successfully!');
      queryClient.invalidateQueries({ queryKey: ['farmers'] });
      // Reset form
      setFormData({
        name: '', fatherName: '', password: '', mobile: '', adharNo: '',
        address: { state: '', district: '', tehsil: '', block: '', village: '', pincode: '' }
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to create farmer account';
      toast.error(`❌ ${errorMessage}`);
    }
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errorMsg = validate();
    if (errorMsg) {
      toast.error(`⚠️ ${errorMsg}`);
      return;
    }
    createFarmerMutation.mutate(formData);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressKey = name.split('.')[1] as keyof Address;
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [addressKey]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-50 px-4 py-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button 
            onClick={() => navigate('/pos/home')}
            className="mr-4 p-2 hover:bg-white hover:shadow-md rounded-full transition-all duration-200 focus:outline-none"
            aria-label="Back to POS Home"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-full mr-3">
              <UserPlus className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Farmer Account</h1>
              <p className="text-sm text-gray-600">Fill in the details to register a new farmer</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Basic Info Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Personal Information
              </h3>
              <div className="grid gap-4">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="w-full p-4 border-2 border-green-200 rounded-xl bg-gray-50 focus:bg-white focus:border-green-500 focus:outline-none transition-all duration-200 placeholder-gray-500"
                  required
                />
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleChange}
                  placeholder="Father's Name"
                  className="w-full p-4 border-2 border-green-200 rounded-xl bg-gray-50 focus:bg-white focus:border-green-500 focus:outline-none transition-all duration-200 placeholder-gray-500"
                  required
                />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password (minimum 6 characters)"
                  className="w-full p-4 border-2 border-green-200 rounded-xl bg-gray-50 focus:bg-white focus:border-green-500 focus:outline-none transition-all duration-200 placeholder-gray-500"
                  required
                  minLength={6}
                />
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="Mobile Number (10 digits)"
                  className="w-full p-4 border-2 border-green-200 rounded-xl bg-gray-50 focus:bg-white focus:border-green-500 focus:outline-none transition-all duration-200 placeholder-gray-500"
                  required
                  maxLength={10}
                  pattern="\d{10}"
                />
                <input
                  type="text"
                  name="adharNo"
                  value={formData.adharNo}
                  onChange={handleChange}
                  placeholder="Aadhar Number (12 digits)"
                  className="w-full p-4 border-2 border-green-200 rounded-xl bg-gray-50 focus:bg-white focus:border-green-500 focus:outline-none transition-all duration-200 placeholder-gray-500"
                  required
                  maxLength={12}
                  pattern="\d{12}"
                />
              </div>
            </div>

            {/* Address Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Address Details
              </h3>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    placeholder="State"
                    className="w-full p-4 border-2 border-green-200 rounded-xl bg-gray-50 focus:bg-white focus:border-green-500 focus:outline-none transition-all duration-200 placeholder-gray-500"
                    required
                  />
                  <input
                    type="text"
                    name="address.district"
                    value={formData.address.district}
                    onChange={handleChange}
                    placeholder="District"
                    className="w-full p-4 border-2 border-green-200 rounded-xl bg-gray-50 focus:bg-white focus:border-green-500 focus:outline-none transition-all duration-200 placeholder-gray-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="address.tehsil"
                    value={formData.address.tehsil}
                    onChange={handleChange}
                    placeholder="Tehsil"
                    className="w-full p-4 border-2 border-green-200 rounded-xl bg-gray-50 focus:bg-white focus:border-green-500 focus:outline-none transition-all duration-200 placeholder-gray-500"
                    required
                  />
                  <input
                    type="text"
                    name="address.block"
                    value={formData.address.block}
                    onChange={handleChange}
                    placeholder="Block"
                    className="w-full p-4 border-2 border-green-200 rounded-xl bg-gray-50 focus:bg-white focus:border-green-500 focus:outline-none transition-all duration-200 placeholder-gray-500"
                    required
                  />
                </div>
                <input
                  type="text"
                  name="address.village"
                  value={formData.address.village}
                  onChange={handleChange}
                  placeholder="Village"
                  className="w-full p-4 border-2 border-green-200 rounded-xl bg-gray-50 focus:bg-white focus:border-green-500 focus:outline-none transition-all duration-200 placeholder-gray-500"
                  required
                />
                <input
                  type="text"
                  name="address.pincode"
                  value={formData.address.pincode}
                  onChange={handleChange}
                  placeholder="Pincode (6 digits)"
                  className="w-full p-4 border-2 border-green-200 rounded-xl bg-gray-50 focus:bg-white focus:border-green-500 focus:outline-none transition-all duration-200 placeholder-gray-500"
                  required
                  maxLength={6}
                  pattern="\d{6}"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={createFarmerMutation.isPending}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg flex justify-center items-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none"
            >
              {createFarmerMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Farmer Account
                </>
              )}
            </button>
          </form>
        </div>

        {/* Helper Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            All fields are required. Please ensure the information is accurate.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateFarmerAccount;
