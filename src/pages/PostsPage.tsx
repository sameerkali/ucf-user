import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Video, X, Calendar, Package, IndianRupee, Loader2, Upload, MapPin, Trash2, AlertTriangle } from "lucide-react";
import { ILLUSTRATIONS } from "../assets/assets";
// import { useTranslation } from "react-i18next";
import api from "../api/axios";
import toast from "react-hot-toast";
import DeleteModal from "../components/DeleteModal";

interface Crop {
  name: string;
  type: string;
  quantity: string;
  pricePerQuintal: string;
}

interface Location {
  state: string;
  district: string;
  tehsil: string;
  block: string;
  village: string;
  pincode: string;
}

interface Post {
  _id: string;
  type: string;
  title: string;
  description: string;
  crops: Crop[];
  readyByDate: string;
  photos: string[];
  videos: string[];
  location: Location;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    role: string;
  };
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





export default function PostPage() {
  const navigate = useNavigate();
  // const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"create" | "view">("view");
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [fetchingPosts, setFetchingPosts] = useState(true);
  const [kisaanId, setKisaanId] = useState<string | null>(null);
  
  // Delete modal states
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    postId: "",
    postTitle: "",
    isDeleting: false,
  });

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

  // Initial fetch when kisaanId is available
  useEffect(() => {
    if (kisaanId) {
      fetchPosts();
    }
  }, [kisaanId]);

  // Fetch posts when tab changes to "view"
  useEffect(() => {
    if (activeTab === "view" && kisaanId) {
      fetchPosts();
    }
  }, [activeTab, kisaanId]);

  const sanitizeInput = (value: string) => value.replace(/[<>"'&]/g, "");

  const fetchPosts = async () => {
    if (!kisaanId) return;
    
    setFetchingPosts(true);
    try {
      const { data } = await api.post("/api/posts/details", {
        id: kisaanId
      }, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      if (data.status_code === 200) {
        setPosts(data.data || []);
      }
    } catch (error: any) {
      console.error("Error fetching posts:", error);
    }
    setFetchingPosts(false);
  };

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

  const handleTabChange = (tab: "create" | "view") => {
    setActiveTab(tab);
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

    setIsLoading(true);
    
    try {
      console.log("Creating FormData...");
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("readyByDate", formData.readyByDate);
      formDataToSend.append("kisaanId", kisaanId);

      // Single crop data
      const { crop } = formData;
      formDataToSend.append("crops.name[0]", crop.name);
      formDataToSend.append("crops.type[0]", crop.type);
      formDataToSend.append("crops.quantity[0]", crop.quantity);
      formDataToSend.append("crops.pricePerQuintal[0]", crop.pricePerQuintal);

      // Add photos
      formData.photos.forEach((photo) => {
        formDataToSend.append("photos", photo);
      });

      // Add videos
      formData.videos.forEach((video) => {
        formDataToSend.append("videos", video);
      });

      console.log("Sending API request...");
      const response = await api.post("/api/posts/create", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("API Response:", response);
      console.log("Response data:", response.data);
      console.log("Response status:", response.status);

      // Check for the exact success message from your API
      if (response.data?.message === "Post created successfully") {
        console.log("Post created successfully");
        
        // Show success toast
        toast.success("Post created successfully!", {
          duration: 4000,
          position: 'top-center',
        });
        
        // Reset form
        resetForm();
        
        // Switch to view tab
        setActiveTab("view");
        
        console.log("Success actions completed");
      } else {
        console.log("Unexpected response format:", response.data);
        toast.error(response.data?.message || "Post created but received unexpected response");
        resetForm();
        setActiveTab("view");
      }
      
    } catch (error: any) {
      console.error("Error creating post:", error);
      console.error("Error response:", error.response);
      
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        "Failed to create post. Please try again.";
      
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-center',
      });
    }
    
    setIsLoading(false);
  };

  // Open delete modal
  const openDeleteModal = (postId: string, postTitle: string) => {
    setDeleteModal({
      isOpen: true,
      postId,
      postTitle,
      isDeleting: false,
    });
  };

  // Close delete modal
  const closeDeleteModal = () => {
    if (!deleteModal.isDeleting) {
      setDeleteModal({
        isOpen: false,
        postId: "",
        postTitle: "",
        isDeleting: false,
      });
    }
  };

  // Confirm delete post with the new API
  const confirmDeletePost = async () => {
    if (!deleteModal.postId) return;

    setDeleteModal(prev => ({ ...prev, isDeleting: true }));

    try {
      const response = await api.delete("/api/posts/delete", {
        data: {
          postId: deleteModal.postId
        }
      });

      if (response.data?.success || response.data?.message || response.status === 200) {
        toast.success("Post deleted successfully!", {
          duration: 3000,
          position: 'top-center',
        });
        
        // Remove the post from the local state
        setPosts((prev) => prev.filter((post) => post._id !== deleteModal.postId));
        
        // Close the modal
        closeDeleteModal();
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error: any) {
      console.error("Error deleting post:", error);
      toast.error(
        error.response?.data?.message || 
        error.message || 
        "Failed to delete post. Please try again.", 
        {
          duration: 4000,
          position: 'top-center',
        }
      );
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatLocation = (location: Location) => {
    return `${location.village}, ${location.tehsil}, ${location.district}, ${location.state}`;
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

  const renderCreatePost = () => (
    <div className="max-w-4xl mx-auto">
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

          {/* Desktop Header */}
          <div className="hidden lg:block mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Create New Post
            </h2>
            <p className="text-gray-600">
              Fill in the details below to list your crops for sale
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
                      disabled={formData.photos.length >= 3}
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
                      disabled={formData.videos.length >= 2}
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
                disabled={isLoading}
                className="w-full lg:w-auto lg:min-w-48 py-4 px-8 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
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
  );

  const renderViewPosts = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <img
          src={ILLUSTRATIONS.kisaan03}
          alt="Your Posts"
          className="w-24 lg:w-32 h-24 lg:h-32 mx-auto mb-4 object-contain"
        />
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
          Your Posts
        </h2>
        <p className="text-gray-600 text-sm lg:text-base">
          Manage your crop listings
        </p>
      </div>

      {fetchingPosts ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin w-8 h-8 text-green-500" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-green-50 rounded-2xl border border-gray-200">
          <img
            src={ILLUSTRATIONS.kisaan08}
            alt="No Posts"
            className="w-24 lg:w-32 h-24 lg:h-32 mx-auto mb-6 object-contain opacity-60"
          />
          <h3 className="text-lg lg:text-xl font-semibold text-gray-700 mb-3">
            No posts yet
          </h3>
          <p className="text-gray-500 text-sm lg:text-base mb-6 max-w-md mx-auto">
            Create your first post to start selling your crops and connect with buyers in your area
          </p>
          <button
            onClick={() => handleTabChange("create")}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl"
          >
            Create Your First Post
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div key={post._id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.description}</p>
                  
                  {/* Date and Location */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>Ready: {formatDate(post.readyByDate)}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{formatLocation(post.location)}</span>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      post.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {post.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => openDeleteModal(post._id, post.title)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Crop Details - Show only if crops exist */}
              {post.crops && post.crops.length > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                  {post.crops.map((crop, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-green-800">{crop.name}</h4>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          {crop.type}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-green-600" />
                          <span className="text-gray-700">{crop.quantity} quintals</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <IndianRupee className="w-4 h-4 text-green-600" />
                          <span className="text-gray-700">₹{crop.pricePerQuintal}/quintal</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Show message if no crop data */}
              {(!post.crops || post.crops.length === 0) && (
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-gray-500 text-sm">No crop details available</p>
                </div>
              )}

              {/* Media indicators */}
              {(post.photos.length > 0 || post.videos.length > 0) && (
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                  {post.photos.length > 0 && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Camera className="w-4 h-4" />
                      <span>{post.photos.length} photo{post.photos.length > 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {post.videos.length > 0 && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Video className="w-4 h-4" />
                      <span>{post.videos.length} video{post.videos.length > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-4 lg:py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Enhanced Tab Navigation */}
          <div className="bg-white rounded-2xl shadow-sm mb-8 p-2 flex max-w-md mx-auto lg:max-w-lg">
            <button
              onClick={() => handleTabChange("view")}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === "view"
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Your Posts
            </button>
            <button
              onClick={() => handleTabChange("create")}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === "create"
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Create Post
            </button>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8">
            {activeTab === "create" ? renderCreatePost() : renderViewPosts()}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeletePost}
        postTitle={deleteModal.postTitle}
        isDeleting={deleteModal.isDeleting}
      />
    </>
  );
}
