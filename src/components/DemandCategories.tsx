import React, { useState } from "react";
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
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { BASE_URL } from "../utils/urls";

interface Category {
  id: string;
  name: string;
  image: string;
  icon: React.ReactNode;
}

interface DemandCategoriesProps {
  onCategoryClick?: (category: Category) => void;
}

interface FormData {
  itemType: string;
  quantity: string;
  unit: string;
  customRequest: string;
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
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    itemType: "",
    quantity: "",
    unit: "kg",
    customRequest: "",
  });

  const unitOptions = [
    { value: "gm", label: "Grams (gm)" },
    { value: "kg", label: "Kilograms (kg)" },
    { value: "quintal", label: "Quintals (quintal)" },
    { value: "liter", label: "Liters (liter)" },
    { value: "ml", label: "Milliliters (ml)" },
    { value: "piece", label: "Pieces (piece)" }
  ];

  const categories: Category[] = [
    {
      id: "seeds",
      name: "Seeds",
      image: "https://picsum.photos/120/120?random=10",
      icon: <Sprout className="w-8 h-8" />,
    },
    {
      id: "fertilizers",
      name: "Fertilizers",
      image: "https://picsum.photos/120/120?random=11",
      icon: <Package className="w-8 h-8" />,
    },
    {
      id: "pesticides",
      name: "Pesticides",
      image: "https://picsum.photos/120/120?random=12",
      icon: <Shield className="w-8 h-8" />,
    },
    {
      id: "hardware",
      name: "Hardware Equipments",
      image: "https://picsum.photos/120/120?random=13",
      icon: <Wrench className="w-8 h-8" />,
    },
    {
      id: "irrigation",
      name: "Irrigation Systems",
      image: "https://picsum.photos/120/120?random=15",
      icon: <Droplets className="w-8 h-8" />,
    },
    {
      id: "transport",
      name: "Transportation",
      image: "https://picsum.photos/120/120?random=16",
      icon: <Truck className="w-8 h-8" />,
    },
    {
      id: "other",
      name: "Other",
      image: "https://picsum.photos/120/120?random=14",
      icon: <Lightbulb className="w-8 h-8" />,
    },
  ];

  // Get user data from localStorage
  const getUserData = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        return JSON.parse(userStr);
      }
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
    }
    return null;
  };

  // Get auth token from localStorage
  const getAuthToken = (): string | null => {
    try {
      // Try different possible token storage keys
      const token =
        localStorage.getItem("authToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("jwt");
      return token;
    } catch (error) {
      console.error("Error getting auth token:", error);
    }
    return null;
  };

  // Generate ready by date (3 days from now)
  const getReadyByDate = (): string => {
    const date = new Date();
    date.setDate(date.getDate() + 3); // 3 days from now
    return date.toISOString().split("T")[0]; // Format: YYYY-MM-DD
  };

  // Map category ID to API name format
  const getCategoryApiName = (categoryId: string): string => {
    switch (categoryId) {
      case "seeds":
        return "seed";
      case "fertilizers":
        return "fertilizer";
      case "pesticides":
        return "pesticide";
      case "hardware":
        return "equipment";
      case "irrigation":
        return "irrigation";
      case "transport":
        return "transport";
      default:
        return categoryId;
    }
  };

  const getItemTypePlaceholder = (categoryId: string): string => {
    switch (categoryId) {
      case "seeds":
        return "e.g., Wheat seeds, Rice seeds, Mustard seeds";
      case "fertilizers":
        return "e.g., Organic compost, NPK fertilizer, Urea";
      case "pesticides":
        return "e.g., Insecticide, Herbicide, Fungicide";
      case "hardware":
        return "e.g., Tractor, Plough, Harvester";
      case "irrigation":
        return "e.g., Drip irrigation kit, Sprinkler system";
      case "transport":
        return "e.g., Truck rental, Tractor transport";
      default:
        return "Specify what you need";
    }
  };

  const getItemTypeLabel = (categoryId: string): string => {
    switch (categoryId) {
      case "seeds":
        return "What kind of seeds do you need?";
      case "fertilizers":
        return "What type of fertilizer do you need?";
      case "pesticides":
        return "What type of pesticide do you need?";
      case "hardware":
        return "What equipment do you need?";
      case "irrigation":
        return "What irrigation system do you need?";
      case "transport":
        return "What transportation service do you need?";
      default:
        return "Item specification";
    }
  };

  const handleCategoryClick = (category: Category) => {
    console.log("Category clicked:", category); // Debug log
    setSelectedCategory(category);
    setFormData({
      itemType: "",
      quantity: "",
      unit: "kg",
      customRequest: "",
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmitRequest = async () => {
    console.log("Submit request called"); // Debug log
    console.log("Selected category:", selectedCategory); // Debug log

    // Better error checking with specific messages
    if (!selectedCategory) {
      console.error("No category selected");
      toast.error("Please select a category first");
      return;
    }

    const userData = getUserData();
    console.log("User data:", userData); // Debug log

    if (!userData || !userData._id) {
      toast.error("Please login to submit request");
      return;
    }

    const authToken = getAuthToken();
    console.log("Auth token found:", !!authToken); // Debug log (don't log actual token)

    if (!authToken) {
      toast.error("Authentication token not found. Please login again.");
      return;
    }

    // Validate form data based on category
    if (selectedCategory.id === "other") {
      if (!formData.customRequest.trim()) {
        toast.error("Please describe your custom request");
        return;
      }
    } else {
      if (!formData.itemType.trim()) {
        toast.error(
          "Please specify what type of " +
            selectedCategory.name.toLowerCase() +
            " you need"
        );
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
    }

    setIsSubmitting(true);
    try {
      // Create FormData for multipart/form-data request
      const submitFormData = new FormData();

      // Add common fields
      submitFormData.append("readyByDate", getReadyByDate());
      submitFormData.append("intent", "help");
      submitFormData.append("title", "NA");

      if (selectedCategory.id === "other") {
        submitFormData.append("help[name]", "other");
        submitFormData.append("help[demand]", formData.customRequest);
        submitFormData.append("help[quantity]", "0");
        submitFormData.append("help[unit]", "unit");
      } else {
        submitFormData.append(
          "help[name]",
          getCategoryApiName(selectedCategory.id)
        );
        submitFormData.append("help[demand]", formData.itemType);
        submitFormData.append("help[quantity]", formData.quantity);
        submitFormData.append("help[unit]", formData.unit);
      }

      // Debug log the form data
      console.log("Form data being sent:");
      for (let pair of submitFormData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }

      // Use normal axios.post instead of api.post
      const response = await axios.post(
        `${BASE_URL}api/posts/create`,
        submitFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      console.log("API Response:", response); // Debug log

      // Check for successful response
      if (
        response.data &&
        response.data.message === "Post created successfully"
      ) {
        toast.success("Request submitted successfully!");
        console.log("Request submitted successfully:", response.data);

        // Reset form
        setFormData({
          itemType: "",
          quantity: "",
          unit: "kg",
          customRequest: "",
        });
        setIsModalOpen(false);
        setSelectedCategory(null);

        // Call callback if provided
        if (onCategoryClick) {
          onCategoryClick(selectedCategory);
        }
      } else {
        throw new Error(response.data?.message || "Failed to submit request");
      }
    } catch (error: any) {
      console.error("Failed to submit request:", error);
      console.error("Error response:", error.response); // Debug log

      let errorMessage = "Failed to submit request. Please try again.";

      if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
      } else if (error.response?.status === 403) {
        errorMessage =
          "Permission denied. Please check your account permissions.";
      } else if (error.response?.status === 400) {
        errorMessage =
          error.response?.data?.message ||
          "Invalid request data. Please check your inputs.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
    setFormData({
      itemType: "",
      quantity: "",
      unit: "kg",
      customRequest: "",
    });
  };

  const isFormValid = (): boolean => {
    if (!selectedCategory) return false;

    if (selectedCategory.id === "other") {
      return formData.customRequest.trim().length > 0;
    } else {
      return (
        formData.itemType.trim().length > 0 &&
        formData.quantity.trim().length > 0 &&
        !isNaN(parseFloat(formData.quantity)) &&
        parseFloat(formData.quantity) > 0
      );
    }
  };

  // Debug: Show component mount status
  React.useEffect(() => {
    console.log("DemandCategories component mounted");
    console.log("API Base URL:", BASE_URL);
  }, []);

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
              Can't find what you're looking for? Click on "Other" to send us a
              custom request!
            </p>
          </div>
        </div>
      </div>

      {isModalOpen && selectedCategory && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full mx-4 shadow-2xl transform transition-all duration-300">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-t-3xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">
                    {selectedCategory.id === "other"
                      ? "Custom Request"
                      : selectedCategory.name}
                  </h3>
                  <p className="text-green-100 text-sm mt-1">
                    {selectedCategory.id === "other"
                      ? "Tell us exactly what you need"
                      : `Specify your ${selectedCategory.name.toLowerCase()} requirements`}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {selectedCategory.id === "other" ? (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Describe your requirements
                  </label>
                  <textarea
                    value={formData.customRequest}
                    onChange={(e) =>
                      handleInputChange("customRequest", e.target.value)
                    }
                    placeholder="e.g., Looking for organic wheat seeds for 10 acres, need drip irrigation system for vegetable farming, require pest control consultation..."
                    className="w-full h-36 p-4 border-2 border-gray-200 rounded-2xl resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200 text-gray-700"
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center text-sm mt-2">
                    <span className="text-gray-500">
                      💡 Be as specific as possible for better results
                    </span>
                    <span
                      className={`${
                        formData.customRequest.length > 450
                          ? "text-red-500"
                          : "text-gray-400"
                      }`}
                    >
                      {formData.customRequest.length}/500
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {getItemTypeLabel(selectedCategory.id)} *
                    </label>
                    <input
                      type="text"
                      value={formData.itemType}
                      onChange={(e) =>
                        handleInputChange("itemType", e.target.value)
                      }
                      placeholder={getItemTypePlaceholder(selectedCategory.id)}
                      className="w-full p-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200 text-gray-700"
                      maxLength={150}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        value={formData.quantity}
                        onChange={(e) =>
                          handleInputChange("quantity", e.target.value)
                        }
                        placeholder="0"
                        min="0"
                        step="0.01"
                        className="w-full p-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200 text-gray-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Unit *
                      </label>
                      <select
                        value={formData.unit}
                        onChange={(e) =>
                          handleInputChange("unit", e.target.value)
                        }
                        className="w-full p-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200 text-gray-700 bg-white"
                      >
                        {unitOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                 
                </div>
              )}
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
                disabled={!isFormValid() || isSubmitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
              >
                {isSubmitting ? (
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                {isSubmitting ? "Sending..." : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DemandCategories;
