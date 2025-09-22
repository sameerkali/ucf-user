import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast"; // or your toast library
import {
  X,
  Send,
  Sprout,
  Package,
  Wrench,
  Truck,
  Droplets,
  Shield,
  Lightbulb,
  Leaf,
  Bug,
  Zap,
} from "lucide-react";
import api from "../api/axios";

// API Data Interfaces
interface SubCategory {
  name: string;
  productId: string;
}

interface ApiCategory {
  category: string;
  subCategories: SubCategory[];
}

interface ApiResponse {
  status_code: number;
  data: ApiCategory[];
}

// Order API interfaces
interface OrderRequest {
  productId: string;
  quantity: number;
}

interface OrderResponse {
  status_code: number;
  data: {
    _id: string;
    createdBy: string;
    createdByModel: string;
    product: string;
    quantity: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}

// Component Interfaces
interface Category {
  id: string;
  name: string;
  image: string;
  icon: React.ReactNode;
  subCategories: SubCategory[];
  originalCategory: string;
}

interface DemandCategoriesProps {
  onCategoryClick?: (category: Category) => void;
}

interface FormData {
  subCategory: string;
  productId: string;
  quantity: string;
  unit: string;
  category: string;
  originalCategory: string;
}

const CategoryImageWithFallback: React.FC<{
  src: string;
  alt: string;
  icon: React.ReactNode;
  className?: string;
}> = ({ src, alt, icon, className = "" }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {!imageError && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      )}
      {(imageError || !imageLoaded) && (
        <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
          <div className="text-white text-2xl">{icon}</div>
        </div>
      )}
    </div>
  );
};

const DemandCategories: React.FC<DemandCategoriesProps> = ({
  onCategoryClick,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orderData, setOrderData] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>({
    subCategory: "",
    productId: "",
    quantity: "",
    unit: "kg", // Fixed to kg
    category: "",
    originalCategory: "",
  });

  // Dynamic icon mapping based on category names
  const getCategoryIcon = (categoryName: string): React.ReactNode => {
    const name = categoryName.toLowerCase();
    
    if (name.includes('seed')) {
      return <Sprout className="w-8 h-8" />;
    } else if (name.includes('fertilizer')) {
      return <Package className="w-8 h-8" />;
    } else if (name.includes('pesticide') || name.includes('insecticide')) {
      return <Shield className="w-8 h-8" />;
    } else if (name.includes('hardware') || name.includes('equipment')) {
      return <Wrench className="w-8 h-8" />;
    } else if (name.includes('irrigation') || name.includes('water')) {
      return <Droplets className="w-8 h-8" />;
    } else if (name.includes('transport')) {
      return <Truck className="w-8 h-8" />;
    } else if (name.includes('organic') || name.includes('bio')) {
      return <Leaf className="w-8 h-8" />;
    } else if (name.includes('pest') || name.includes('bug')) {
      return <Bug className="w-8 h-8" />;
    } else if (name.includes('energy') || name.includes('power')) {
      return <Zap className="w-8 h-8" />;
    } else {
      return <Lightbulb className="w-8 h-8" />;
    }
  };

  // Generate category ID from name
  const generateCategoryId = (categoryName: string): string => {
    return categoryName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  };

  // Get relevant image URL based on category
  const getCategoryImage = (categoryName: string): string => {
    const name = categoryName.toLowerCase();
    
    if (name.includes('seed')) {
      return "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop&crop=center"; // Seeds in hands
    } else if (name.includes('fertilizer')) {
      return "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=400&fit=crop&crop=center"; // Fertilizer/soil
    } else if (name.includes('pesticide') || name.includes('insecticide')) {
      return "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=400&h=400&fit=crop&crop=center"; // Plant protection
    } else if (name.includes('hardware') || name.includes('equipment')) {
      return "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop&crop=center"; // Farm equipment
    } else if (name.includes('irrigation') || name.includes('water')) {
      return "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop&crop=center"; // Irrigation system
    } else if (name.includes('transport')) {
      return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center"; // Transportation
    } else if (name.includes('organic') || name.includes('bio')) {
      return "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop&crop=center"; // Organic farming
    } else {
      return "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=400&fit=crop&crop=center"; // Default farming image
    }
  };

  // Convert API categories to UI categories
  const convertApiCategoriesToUICategories = (apiData: ApiCategory[]): Category[] => {
    return apiData.map((apiCategory) => ({
      id: generateCategoryId(apiCategory.category),
      name: apiCategory.category,
      originalCategory: apiCategory.category,
      image: getCategoryImage(apiCategory.category),
      icon: getCategoryIcon(apiCategory.category),
      subCategories: apiCategory.subCategories,
    }));
  };

  // API mutation for creating orders
  const orderMutation = useMutation({
    mutationFn: async (orderData: OrderRequest) => {
      const response = await api.post("/api/order/create", orderData);
      return response.data as OrderResponse;
    },
    onSuccess: (data) => {
      toast.success("Order created successfully!");
      setOrderData(data.data);
      setShowSuccessMessage(true);
      
      // Auto close after 3 seconds and reset form
      setTimeout(() => {
        setFormData({
          subCategory: "",
          productId: "",
          quantity: "",
          unit: "kg",
          category: "",
          originalCategory: "",
        });
        setIsModalOpen(false);
        setSelectedCategory(null);
        setShowSuccessMessage(false);
        setOrderData(null);

        // Call callback if provided
        if (onCategoryClick && selectedCategory) {
          onCategoryClick(selectedCategory);
        }
      }, 3000);
    },
    onError: (error: any) => {
      console.error("Error creating order:", error);
      toast.error(
        error.response?.data?.message || 
        error.message || 
        "Failed to create order. Please try again."
      );
    },
  });

  // Fetch categories data from API
  useEffect(() => {
    const fetchCategoriesData = async () => {
      try {
        setIsLoading(true);
        setApiError(null);
        const response = await api.get("/api/products/dropdown");
        const data: ApiResponse = response.data;
        
        if (data.status_code === 200) {
          const uiCategories = convertApiCategoriesToUICategories(data.data);
          setCategories(uiCategories);
        } else {
          throw new Error(`API error! status_code: ${data.status_code}`);
        }
      } catch (error: any) {
        console.error('Error fetching categories:', error);
        setApiError(
          error.response?.data?.message || 
          error.message || 
          'Failed to load categories'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoriesData();
  }, []);

  const handleCategoryClick = (category: Category) => {
    console.log("Category clicked:", category);
    setSelectedCategory(category);
    setFormData({
      subCategory: "",
      productId: "",
      quantity: "",
      unit: "kg",
      category: category.name,
      originalCategory: category.originalCategory,
    });
    setShowSuccessMessage(false);
    setOrderData(null);
    setIsModalOpen(true);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };

      // If subcategory changes, update productId
      if (field === 'subCategory' && selectedCategory?.subCategories) {
        const selectedSubCat = selectedCategory.subCategories.find(sub => sub.name === value);
        newData.productId = selectedSubCat?.productId || '';
      }

      return newData;
    });
  };

  const handleSubmitRequest = () => {
    if (!selectedCategory) {
      console.error("No category selected");
      return;
    }

    if (!formData.quantity.trim()) {
      toast.error("Please enter the quantity needed");
      return;
    }

    const qty = parseFloat(formData.quantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error("Please enter a valid quantity greater than 0");
      return;
    }

    // Validate subcategory if available
    if (selectedCategory.subCategories && selectedCategory.subCategories.length > 0 && !formData.subCategory) {
      toast.error("Please select a subcategory");
      return;
    }

    if (!formData.productId) {
      toast.error("Product ID is required. Please select a subcategory.");
      return;
    }

    // Prepare order data
    const orderData: OrderRequest = {
      productId: formData.productId,
      quantity: qty
    };

    // Submit the order using mutation
    orderMutation.mutate(orderData);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
    setShowSuccessMessage(false);
    setOrderData(null);
    setFormData({
      subCategory: "",
      productId: "",
      quantity: "",
      unit: "kg",
      category: "",
      originalCategory: "",
    });
  };

  const retryFetchCategories = async () => {
    try {
      setIsLoading(true);
      setApiError(null);
      const response = await api.get("/api/products/dropdown");
      const data: ApiResponse = response.data;
      
      if (data.status_code === 200) {
        const uiCategories = convertApiCategoriesToUICategories(data.data);
        setCategories(uiCategories);
      } else {
        throw new Error(`API error! status_code: ${data.status_code}`);
      }
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      setApiError(
        error.response?.data?.message || 
        error.message || 
        'Failed to load categories'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = (): boolean => {
    if (!selectedCategory) return false;

    const hasSubCategories = selectedCategory.subCategories && selectedCategory.subCategories.length > 0;
    const isSubCategoryValid = !hasSubCategories || (formData.subCategory.trim().length > 0 && formData.productId.trim().length > 0);
    
    return (
      formData.quantity.trim().length > 0 &&
      !isNaN(parseFloat(formData.quantity)) &&
      parseFloat(formData.quantity) > 0 &&
      isSubCategoryValid
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-green-800 rounded-3xl p-8 shadow-lg border border-green-100 relative overflow-hidden">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Categories...</h2>
          <p className="text-green-100">Please wait while we fetch the latest categories</p>
        </div>
      </div>
    );
  }

  // Error state
  if (apiError) {
    return (
      <div className="bg-red-600 rounded-3xl p-8 shadow-lg border border-red-100 relative overflow-hidden">
        <div className="text-center">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Unable to Load Categories</h2>
          <p className="text-red-100 mb-4">{apiError}</p>
          <button
            onClick={retryFetchCategories}
            className="bg-white text-red-600 px-6 py-2 rounded-full font-semibold hover:bg-red-50 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No categories state
  if (categories.length === 0) {
    return (
      <div className="bg-yellow-600 rounded-3xl p-8 shadow-lg border border-yellow-100 relative overflow-hidden">
        <div className="text-center">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No Categories Available</h2>
          <p className="text-yellow-100 mb-4">No product categories found in the system</p>
          <button
            onClick={retryFetchCategories}
            className="bg-white text-yellow-600 px-6 py-2 rounded-full font-semibold hover:bg-yellow-50 transition-colors duration-200"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-green-800 rounded-3xl p-8 shadow-lg border border-green-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-200 rounded-full opacity-20 transform translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-200 rounded-full opacity-20 transform -translate-x-12 translate-y-12"></div>

        <div className="relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-100 mb-2">
              What do you need?
            </h2>
            <p className="text-gray-100">
              Browse categories or tell us your specific requirements
            </p>
            <p className="text-green-200 text-sm mt-2">
              {categories.length} categories available
            </p>
          </div>

          <div className="block lg:hidden">
            <div className="grid grid-flow-col auto-cols-[140px] grid-rows-2 gap-4 overflow-x-auto pb-4 scroll-snap-x-mandatory">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex flex-col items-center cursor-pointer group transform transition-all duration-300 hover:scale-105 scroll-snap-align-start"
                  onClick={() => handleCategoryClick(category)}
                >
                  <div className="relative w-20 h-20 mb-3 group-hover:mb-2 transition-all duration-300">
                    <div className="w-full h-full rounded-full overflow-hidden shadow-lg group-hover:shadow-2xl transition-shadow duration-300 border-2 border-white group-hover:border-green-300">
                      <CategoryImageWithFallback
                        src={category.image}
                        alt={category.name}
                        icon={category.icon}
                        className="w-full h-full"
                      />
                    </div>
                    {/* Show indicator if category has subcategories */}
                    {category.subCategories && category.subCategories.length > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {category.subCategories.length}
                      </div>
                    )}
                  </div>

                  <span className="text-xs font-semibold text-gray-100 text-center group-hover:text-green-100 transition-colors duration-300 leading-tight px-1 max-w-full">
                    {category.name}
                  </span>

                  <div className="w-0 group-hover:w-6 h-0.5 bg-white transition-all duration-300 mt-1"></div>
                </div>
              ))}
            </div>

            <div className="text-center mt-4">
              <p className="text-xs text-gray-200">
                ← Scroll to see more categories →
              </p>
            </div>
          </div>

          <div className="hidden lg:grid lg:grid-cols-4 xl:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex flex-col items-center cursor-pointer group transform transition-all duration-300 hover:scale-105"
                onClick={() => handleCategoryClick(category)}
              >
                <div className="relative w-24 h-24 md:w-28 md:h-28 mb-4 group-hover:mb-3 transition-all duration-300">
                  <div className="w-full h-full rounded-full overflow-hidden shadow-lg group-hover:shadow-2xl transition-shadow duration-300 border-3 border-white group-hover:border-green-300">
                    <CategoryImageWithFallback
                      src={category.image}
                      alt={category.name}
                      icon={category.icon}
                      className="w-full h-full"
                    />
                  </div>
                  {/* Show indicator if category has subcategories */}
                  {category.subCategories && category.subCategories.length > 0 && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 text-white text-sm rounded-full flex items-center justify-center font-bold">
                      {category.subCategories.length}
                    </div>
                  )}
                </div>

                <span className="text-sm md:text-base font-semibold text-gray-100 text-center group-hover:text-green-100 transition-colors duration-300 leading-tight px-2 max-w-full">
                  {category.name}
                </span>

                <div className="w-0 group-hover:w-8 h-0.5 bg-white transition-all duration-300 mt-1"></div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-200">
              Need something specific? Select a category to get started!
            </p>
          </div>
        </div>
      </div>

      {isModalOpen && selectedCategory && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full mx-4 shadow-2xl transform transition-all duration-300 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-t-3xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">
                    {selectedCategory.name}
                  </h3>
                  <p className="text-green-100 text-sm mt-1">
                    Place your order for {selectedCategory.name.toLowerCase()}
                  </p>
                  {selectedCategory.subCategories && selectedCategory.subCategories.length > 0 && (
                    <p className="text-green-100 text-xs mt-1">
                      {selectedCategory.subCategories.length} options available
                    </p>
                  )}
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {showSuccessMessage ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-2">Order Created Successfully!</h4>
                <p className="text-gray-600 mb-4">Your order has been placed and is now being processed.</p>
                {orderData && (
                  <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2">
                    <p className="text-sm"><strong>Order ID:</strong> {orderData._id}</p>
                    <p className="text-sm"><strong>Status:</strong> <span className="capitalize bg-yellow-100 text-yellow-800 px-2 py-1 rounded">{orderData.status}</span></p>
                    <p className="text-sm"><strong>Quantity:</strong> {orderData.quantity} kg</p>
                    <p className="text-sm"><strong>Created:</strong> {new Date(orderData.createdAt).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Subcategory dropdown - only show if subcategories exist */}
                    {selectedCategory.subCategories && selectedCategory.subCategories.length > 0 && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Select Specific Type *
                        </label>
                        <select
                          value={formData.subCategory}
                          onChange={(e) =>
                            handleInputChange("subCategory", e.target.value)
                          }
                          className="w-full p-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200 text-gray-700 bg-white"
                        >
                          <option value="">Select an option</option>
                          {selectedCategory.subCategories.map((subCat) => (
                            <option key={subCat.productId} value={subCat.name}>
                              {subCat.name}
                            </option>
                          ))}
                        </select>
                        {formData.productId && (
                          <p className="text-xs text-gray-500 mt-1">
                            Product ID: {formData.productId}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Quantity input - now full width */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Quantity (kg) *
                      </label>
                      <input
                        type="number"
                        value={formData.quantity}
                        onChange={(e) =>
                          handleInputChange("quantity", e.target.value)
                        }
                        placeholder="Enter quantity in kg"
                        min="0"
                        step="0.01"
                        className="w-full p-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200 text-gray-700"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        💡 Enter the quantity you need in kilograms
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 rounded-b-3xl flex gap-3">
                  <button
                    onClick={closeModal}
                    className="flex-1 px-6 py-3 text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-2xl font-semibold transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitRequest}
                    disabled={!isFormValid() || orderMutation.isPending}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
                  >
                    {orderMutation.isPending ? (
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                    {orderMutation.isPending ? "Creating Order..." : "Place Order"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DemandCategories;
