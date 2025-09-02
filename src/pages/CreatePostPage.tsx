import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, Video, X, Loader2, Upload, ArrowLeft } from "lucide-react";
import { ILLUSTRATIONS } from "../assets/assets";
import api from "../api/axios";
import toast from "react-hot-toast";

interface Crop {
  name: string;
  type: string;
  quantity: string;
  pricePerQuintal: string;
}

interface FormData {
  title: string;
  description: string;
  crop: Crop;
  readyByDate: string;
  photos: File[];
  videos: File[];
}

interface Errors {
  title: string;
  description: string;
  readyByDate: string;
  crop: string;
  photos: string;
  videos: string;
}

interface User {
  _id: string;
  name: string;
  fatherName: string;
  mobile: string;
  address: {
    state: string;
    district: string;
    tehsil: string;
    block: string;
    village: string;
    pincode: string;
  };
  authMethod: string;
  role: string;
  isVerified: boolean;
  mobileVerified: boolean;
  bankVerified: boolean;
  otherDetailsVerified: boolean;
  profileStatus: string;
  createdAt: string;
  updatedAt: string;
}

export default function CreatePostPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [kisaanId, setKisaanId] = useState<string | null>(null);

  const initialFormState: FormData = {
    title: "",
    description: "",
    crop: { name: "", type: "", quantity: "", pricePerQuintal: "" },
    readyByDate: "",
    photos: [],
    videos: [],
  };

  const initialErrorState: Errors = {
    title: "",
    description: "",
    readyByDate: "",
    crop: "",
    photos: "",
    videos: "",
  };

  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [errors, setErrors] = useState<Errors>(initialErrorState);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user: User = JSON.parse(userData);
        setKisaanId(user._id);
      } catch (error) {
        console.error("Error parsing user data:", error);
        toast.error("Invalid user data. Please login again.");
        navigate("/login");
      }
    } else {
      toast.error("Please login to continue");
      navigate("/login");
    }
  }, [navigate]);

  // Create Post Mutation using React Query
  const createPostMutation = useMutation({
    mutationFn: async (postData: FormData) => {
      if (!kisaanId) throw new Error('No user ID available');

      const formDataToSend = new FormData();
      formDataToSend.append("title", postData.title);
      formDataToSend.append("description", postData.description);
      formDataToSend.append("readyByDate", postData.readyByDate);
      formDataToSend.append("kisaanId", kisaanId);

      // Single crop data
      const { crop } = postData;
      formDataToSend.append("crops.name[0]", crop.name);
      formDataToSend.append("crops.type[0]", crop.type);
      formDataToSend.append("crops.quantity[0]", crop.quantity);
      formDataToSend.append("crops.pricePerQuintal[0]", crop.pricePerQuintal);

      // Add photos
      postData.photos.forEach((photo) => {
        formDataToSend.append("photos", photo);
      });

      // Add videos
      postData.videos.forEach((video) => {
        formDataToSend.append("videos", video);
      });

      const response = await api.post("/api/posts/create", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.data;
    },
    onSuccess: (data) => {
      console.log("Post created successfully", data);
      
      // Show success toast
      toast.success("Post created successfully!", {
        duration: 4000,
        position: 'top-center',
      });
      
      // Invalidate the posts query to refetch the latest posts
      queryClient.invalidateQueries({ queryKey: ['user-posts', kisaanId] });
      
      // Reset form
      resetForm();
      
      // Navigate to posts page
      navigate("/kisaan/posts");
    },
    onError: (error: any) => {
      console.error("Error creating post:", error);
      
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        "Failed to create post. Please try again.";
      
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-center',
      });
    }
  });

  const sanitizeInput = (value: string) => value.replace(/[<>"'&]/g, "");

  const resetForm = () => {
    console.log("Resetting form...");
    setFormData({ ...initialFormState });
    setErrors({ ...initialErrorState });
    
    // Clear file inputs
    const photoInput = document.getElementById("photo-upload") as HTMLInputElement;
    const videoInput = document.getElementById("video-upload") as HTMLInputElement;
    if (photoInput) photoInput.value = "";
    if (videoInput) videoInput.value = "";
    
    console.log("Form reset complete");
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    const sanitizedValue = sanitizeInput(value);
    setFormData((prev) => ({ ...prev, [field]: sanitizedValue }));
    
    if (errors[field as keyof Errors]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleCropChange = (field: keyof Crop, value: string) => {
    const sanitizedValue = field === "quantity" || field === "pricePerQuintal" 
      ? value.replace(/\D/g, "") 
      : sanitizeInput(value);
    
    setFormData((prev) => ({
      ...prev,
      crop: { ...prev.crop, [field]: sanitizedValue }
    }));
    
    if (errors.crop) {
      setErrors((prev) => ({ ...prev, crop: "" }));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      if (file.type.startsWith('image/')) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          toast.error(`${file.name} is too large. Maximum size is 5MB.`);
          return false;
        }
        return true;
      }
      toast.error(`${file.name} is not a valid image file.`);
      return false;
    });

    if (formData.photos.length + validFiles.length > 3) {
      toast.error("Maximum 3 photos allowed");
      return;
    }

    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...validFiles]
    }));
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      if (file.type.startsWith('video/')) {
        if (file.size > 20 * 1024 * 1024) { // 20MB limit
          toast.error(`${file.name} is too large. Maximum size is 20MB.`);
          return false;
        }
        return true;
      }
      toast.error(`${file.name} is not a valid video file.`);
      return false;
    });

    if (formData.videos.length + validFiles.length > 2) {
      toast.error("Maximum 2 videos allowed");
      return;
    }

    setFormData(prev => ({
      ...prev,
      videos: [...prev.videos, ...validFiles]
    }));
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const removeVideo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = {
      title: "",
      description: "",
      readyByDate: "",
      crop: "",
      photos: "",
      videos: "",
    };

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.readyByDate) {
      newErrors.readyByDate = "Ready by date is required";
    }

    const { crop } = formData;
    if (!crop.name || !crop.type || !crop.quantity || !crop.pricePerQuintal) {
      newErrors.crop = "All crop fields are required";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Form submission started");
    
    if (!validateForm() || !kisaanId) {
      console.log("Validation failed or kisaanId missing");
      return;
    }

    createPostMutation.mutate(formData);
  };

  if (!kisaanId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin w-8 h-8 text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 lg:py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/kisaan/posts")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Create New Post
            </h1>
            <p className="text-gray-600 text-sm lg:text-base">
              Fill in the details below to list your crops for sale
            </p>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-5 lg:gap-8">
          {/* Left Side - Illustration (Hidden on mobile) */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="sticky top-6">
              <div className="text-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8">
                <img
                  src={ILLUSTRATIONS.kisaan05}
                  alt="Create Post"
                  className="w-48 h-48 mx-auto mb-6 object-contain"
                />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Share Your Harvest
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Connect with buyers, showcase your quality crops, and grow your farming business with our community.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-green-600 font-semibold">Easy Listing</div>
                    <div className="text-gray-500">Quick crop details</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-green-600 font-semibold">Wide Reach</div>
                    <div className="text-gray-500">Connect with buyers</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="lg:col-span-3">
            {/* Mobile Header */}
            <div className="text-center mb-8 lg:hidden">
              <img
                src={ILLUSTRATIONS.kisaan05}
                alt="Create Post"
                className="w-24 h-24 mx-auto mb-4 object-contain"
              />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Create New Post
              </h2>
              <p className="text-gray-600 text-sm">
                Share your crops with the community
              </p>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-8">
              {/* Basic Information Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Post Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Fresh Wheat Ready for Sale"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all rounded-xl"
                      maxLength={100}
                      disabled={createPostMutation.isPending}
                    />
                    {errors.title && (
                      <p className="text-red-500 text-xs mt-2">{errors.title}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Description *
                    </label>
                    <textarea
                      placeholder="Describe your crop quality, farming methods, etc."
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all rounded-xl resize-none"
                      maxLength={500}
                      disabled={createPostMutation.isPending}
                    />
                    {errors.description && (
                      <p className="text-red-500 text-xs mt-2">{errors.description}</p>
                    )}
                  </div>

                  {/* Ready By Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Ready By Date *
                    </label>
                    <input
                      type="date"
                      value={formData.readyByDate}
                      onChange={(e) => handleInputChange("readyByDate", e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all rounded-xl"
                      disabled={createPostMutation.isPending}
                    />
                    {errors.readyByDate && (
                      <p className="text-red-500 text-xs mt-2">{errors.readyByDate}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Crop Information Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Crop Details
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Crop Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Wheat, Rice, Corn"
                      value={formData.crop.name}
                      onChange={(e) => handleCropChange("name", e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all rounded-xl"
                      disabled={createPostMutation.isPending}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Crop Type/Variety *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Basmati, Organic, Hybrid"
                      value={formData.crop.type}
                      onChange={(e) => handleCropChange("type", e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all rounded-xl"
                      disabled={createPostMutation.isPending}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Quantity (Quintals) *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 50"
                      value={formData.crop.quantity}
                      onChange={(e) => handleCropChange("quantity", e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all rounded-xl"
                      disabled={createPostMutation.isPending}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Price per Quintal (₹) *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 2500"
                      value={formData.crop.pricePerQuintal}
                      onChange={(e) => handleCropChange("pricePerQuintal", e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all rounded-xl"
                      disabled={createPostMutation.isPending}
                    />
                  </div>
                </div>

                {errors.crop && (
                  <p className="text-red-500 text-xs mt-4">{errors.crop}</p>
                )}
              </div>

              {/* Media Upload Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Photos & Videos (Optional)
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Photos */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-medium text-gray-700">
                        Photos (Max 3)
                      </label>
                      <span className="text-xs text-gray-500">
                        {formData.photos.length}/3
                      </span>
                    </div>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-400 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="photo-upload"
                        disabled={formData.photos.length >= 3 || createPostMutation.isPending}
                      />
                      <label 
                        htmlFor="photo-upload" 
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <Camera className="w-8 h-8 text-gray-400 mb-3" />
                        <span className="text-sm text-gray-600 mb-1">
                          Click to upload photos
                        </span>
                        <span className="text-xs text-gray-400">
                          PNG, JPG up to 5MB each
                        </span>
                      </label>
                    </div>

                    {/* Photo Preview */}
                    {formData.photos.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        {formData.photos.map((photo, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(photo)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removePhoto(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              disabled={createPostMutation.isPending}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Videos */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-medium text-gray-700">
                        Videos (Max 2)
                      </label>
                      <span className="text-xs text-gray-500">
                        {formData.videos.length}/2
                      </span>
                    </div>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-400 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                        id="video-upload"
                        disabled={formData.videos.length >= 2 || createPostMutation.isPending}
                      />
                      <label 
                        htmlFor="video-upload" 
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <Video className="w-8 h-8 text-gray-400 mb-3" />
                        <span className="text-sm text-gray-600 mb-1">
                          Click to upload videos
                        </span>
                        <span className="text-xs text-gray-400">
                          MP4, MOV up to 20MB each
                        </span>
                      </label>
                    </div>

                    {/* Video Preview */}
                    {formData.videos.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {formData.videos.map((video, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Video className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-700 truncate">
                                {video.name}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeVideo(index)}
                              className="text-red-500 hover:text-red-700 p-1"
                              disabled={createPostMutation.isPending}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="lg:flex lg:justify-end">
                <button
                  type="submit"
                  disabled={createPostMutation.isPending}
                  className="w-full lg:w-auto lg:min-w-48 py-4 px-8 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg hover:shadow-xl"
                >
                  {createPostMutation.isPending ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5 mr-2" />
                      Creating Post...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Create Post
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
