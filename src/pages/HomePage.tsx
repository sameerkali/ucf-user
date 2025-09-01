import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, MapPin, Package, IndianRupee, Camera, Video, Loader2, ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react';
import { ILLUSTRATIONS } from '../assets/assets';
import api from '../api/axios';
import toast from 'react-hot-toast';
import FulfillmentModal from '../components/FulfillmentModal';
import Carousel from '../components/Carousel';

// Shared interfaces - consistent with FulfillmentModal
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
  readyByDate: string;
  requiredByDate?: string;
  photos: string[];
  videos: string[];
  location: Location;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdBy: CreatedBy;
  __v?: number;
}

interface ApiResponse {
  status_code: number;
  message: string;
  data: Post[];
}

interface FulfillmentPayload {
  postId: string;
  crops: Array<{
    name: string;
    quantity: number;
  }>;
}

const HomePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // carousel
  const dummyImages = [
    'https://picsum.photos/800/400?random=1',
    'https://picsum.photos/800/400?random=2',
    'https://picsum.photos/800/400?random=3',
    'https://picsum.photos/800/400?random=4'
  ];

  // React Query for fetching posts
  const {
    data: posts = [],
    isLoading: loading,
    error,
    refetch: fetchPosts,
    isFetching
  } = useQuery({
    queryKey: ['posts'],
    queryFn: async (): Promise<Post[]> => {
      const { data }: { data: ApiResponse } = await api.post('/api/posts/list');
      
      if (data.status_code === 200) {
        return data.data || [];
      } else {
        throw new Error(data.message || 'Failed to fetch posts');
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Fulfillment mutation
  const fulfillmentMutation = useMutation({
    mutationFn: async (fulfillmentData: FulfillmentPayload): Promise<any> => {
      const { data } = await api.post('/api/fulfillments/create', fulfillmentData);
      return data;
    },
    onSuccess: () => {
      toast.success('Fulfillment request submitted successfully!');
      handleCloseModal();
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

  const formatLocation = (location: Location): string => {
    return `${location.village}, ${location.tehsil}, ${location.district}, ${location.state}`;
  };

  const handleFulfillmentClick = (post: Post, e: React.MouseEvent): void => {
    e.stopPropagation();
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  const toggleCardExpansion = (postId: string): void => {
    setExpandedCard(expandedCard === postId ? null : postId);
  };

  const handleRefresh = async (): Promise<void> => {
    try {
      await fetchPosts();
      toast.success('Posts refreshed!');
    } catch (error) {
      toast.error('Failed to refresh posts');
    }
  };

  React.useEffect(() => {
    if (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    }
  }, [error]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading latest posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <img
            src={ILLUSTRATIONS.kisaan08}
            alt="Error"
            className="w-32 h-32 mx-auto mb-6 object-contain opacity-60"
          />
          <h3 className="text-xl font-semibold text-gray-700 mb-3">
            Something went wrong
          </h3>
          <p className="text-gray-500 mb-6">
            {error instanceof Error ? error.message : 'Network error occurred'}
          </p>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 lg:py-8">
      <Carousel 
        images={dummyImages}
        autoSlide={true}
        slideInterval={4000}
        className="h-64 md:h-96 mb-6"
        onImageClick={(index, url) => console.log('Product image clicked:', index, url)}
      />
      
      <div className="max-w-7xl mx-auto px-4">
        {posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <img
              src={ILLUSTRATIONS.kisaan03}
              alt="No Posts"
              className="w-32 lg:w-40 h-32 lg:h-40 mx-auto mb-8 object-contain opacity-60"
            />
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">
              No posts available yet
            </h3>
            <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
              Be the first to share your crops with the farming community. Start connecting with buyers today!
            </p>
            <button
              onClick={handleRefresh}
              disabled={isFetching}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {isFetching ? 'Refreshing...' : 'Refresh Posts'}
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Crops</h2>
            
            {/* Mobile: Horizontal Scrolling Cards */}
            <div className="lg:hidden">
              <div className="overflow-x-auto pb-4">
                <div className="flex gap-4" style={{ scrollSnapType: 'x mandatory' }}>
                  {posts.map((post: Post) => (
                    <div key={post._id} className="flex-shrink-0" style={{ scrollSnapAlign: 'start' }}>
                      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 w-72">
                        {/* Compact Card Header */}
                        <div 
                          className="p-4 cursor-pointer"
                          onClick={() => toggleCardExpansion(post._id)}
                        >
                          <div className="flex gap-3">
                            {/* Image - 40% */}
                            <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden">
                              <img 
                                src={ILLUSTRATIONS.kisaan07} 
                                alt="Crop illustration"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            
                            {/* Content - 60% */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  post.status === 'active' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {post.status}
                                </span>
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                  {post.type.replace('_', ' ')}
                                </span>
                              </div>
                              
                              <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">
                                {post.title}
                              </h3>
                              
                              {/* Crop Info */}
                              {post.crops && post.crops.length > 0 && (
                                <div className="space-y-1">
                                  <p className="text-sm font-semibold text-green-800">
                                    {post.crops[0].name}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {post.crops[0].type}
                                  </p>
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-700">
                                      {post.crops[0].quantity} quintals
                                    </span>
                                    <span className="text-green-700 font-semibold">
                                      ₹{post.crops[0].pricePerQuintal}/q
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Expand/Collapse Indicator */}
                          <div className="flex justify-center mt-3">
                            {expandedCard === post._id ? (
                              <ChevronUp className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedCard === post._id && (
                          <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                            <div className="pt-4 space-y-4">
                              {/* Description */}
                              <div>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                  {post.description}
                                </p>
                              </div>

                              {/* Date & Location */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <Calendar className="w-4 h-4" />
                                  <span>Ready: {formatDate(post.readyByDate)}</span>
                                </div>
                                
                                <div className="flex items-start gap-2 text-sm text-gray-500">
                                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                  <span className="line-clamp-2">{formatLocation(post.location)}</span>
                                </div>
                              </div>

                              {/* All Crops */}
                              {post.crops && post.crops.length > 1 && (
                                <div className="bg-white rounded-xl p-3">
                                  <h4 className="font-semibold text-green-800 mb-2 text-sm flex items-center gap-2">
                                    <Package className="w-4 h-4" />
                                    All Available Crops
                                  </h4>
                                  <div className="space-y-2">
                                    {post.crops.slice(1).map((crop: Crop, index: number) => (
                                      <div key={index} className="bg-green-50 rounded-lg p-2">
                                        <div className="flex justify-between items-center mb-1">
                                          <h5 className="font-semibold text-green-800 text-sm">{crop.name}</h5>
                                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                            {crop.type}
                                          </span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                          <span className="text-gray-700">{crop.quantity} quintals</span>
                                          <span className="text-green-700 font-semibold">₹{crop.pricePerQuintal}/q</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Media Info */}
                              {(post.photos.length > 0 || post.videos.length > 0) && (
                                <div className="flex items-center gap-4 p-3 bg-white rounded-xl">
                                  {post.photos.length > 0 && (
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                      <Camera className="w-4 h-4 text-blue-500" />
                                      <span>{post.photos.length} photo{post.photos.length > 1 ? 's' : ''}</span>
                                    </div>
                                  )}
                                  {post.videos.length > 0 && (
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                      <Video className="w-4 h-4 text-purple-500" />
                                      <span>{post.videos.length} video{post.videos.length > 1 ? 's' : ''}</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Action Button */}
                              {post.status === 'active' && post.crops && post.crops.length > 0 && (
                                <button
                                  onClick={(e) => handleFulfillmentClick(post, e)}
                                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                >
                                  <ShoppingCart className="w-4 h-4" />
                                  Request Fulfillment
                                </button>
                              )}

                              {/* Post Footer */}
                              <div className="pt-2 border-t border-gray-200">
                                <div className="flex items-center justify-between text-xs text-gray-400">
                                  <span>Posted {formatDate(post.createdAt)}</span>
                                  <span>By {post.createdBy.role}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scroll Indicator */}
              <div className="text-center mt-4">
                <p className="text-sm text-gray-500">← Swipe to see more crops →</p>
              </div>
            </div>

            {/* Desktop: Grid Layout */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
                {posts.map((post: Post) => (
                  <div key={post._id} className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200">
                    {/* Desktop Compact Card Header */}
                    <div 
                      className="p-6 cursor-pointer"
                      onClick={() => toggleCardExpansion(post._id)}
                    >
                      <div className="flex gap-6">
                        {/* Image - 40% on large screens */}
                        <div className="w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden">
                          <img 
                            src={ILLUSTRATIONS.kisaan07} 
                            alt="Crop illustration"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Content - 60% */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                post.status === 'active' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                              </span>
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                {post.type.replace('_', ' ')}
                              </span>
                            </div>
                            
                            {/* Expand/Collapse Indicator */}
                            {expandedCard === post._id ? (
                              <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          
                          <h3 className="font-bold text-gray-900 text-xl mb-2">
                            {post.title}
                          </h3>
                          
                          {/* Primary Crop Info */}
                          {post.crops && post.crops.length > 0 && (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                              <div>
                                <p className="text-sm text-gray-500 mb-1">Crop</p>
                                <p className="font-semibold text-green-800">{post.crops[0].name}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500 mb-1">Type</p>
                                <p className="font-medium text-gray-700">{post.crops[0].type}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500 mb-1">Quantity</p>
                                <p className="font-medium text-gray-700">{post.crops[0].quantity} quintals</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500 mb-1">Price</p>
                                <p className="font-semibold text-green-700">₹{post.crops[0].pricePerQuintal}/quintal</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Desktop Expanded Details */}
                    {expandedCard === post._id && (
                      <div className="px-6 pb-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                        <div className="pt-6 space-y-6">
                          {/* Description */}
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
                            <p className="text-gray-600 leading-relaxed">
                              {post.description}
                            </p>
                          </div>

                          {/* Date & Location */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="flex items-center gap-2 text-gray-500">
                              <Calendar className="w-4 h-4" />
                              <span>Ready: {formatDate(post.readyByDate)}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-gray-500">
                              <MapPin className="w-4 h-4" />
                              <span>{formatLocation(post.location)}</span>
                            </div>
                          </div>

                          {/* All Crops Details */}
                          {post.crops && post.crops.length > 0 && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                              <h4 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5" />
                                All Available Crops
                              </h4>
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {post.crops.map((crop: Crop, index: number) => (
                                  <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                                    <div className="flex justify-between items-center mb-3">
                                      <h5 className="font-semibold text-green-800 text-lg">{crop.name}</h5>
                                      <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                                        {crop.type}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
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
                            </div>
                          )}

                          {/* Media Info */}
                          {(post.photos.length > 0 || post.videos.length > 0) && (
                            <div className="flex items-center gap-6 p-4 bg-white rounded-xl">
                              {post.photos.length > 0 && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Camera className="w-4 h-4 text-blue-500" />
                                  <span>{post.photos.length} photo{post.photos.length > 1 ? 's' : ''}</span>
                                </div>
                              )}
                              {post.videos.length > 0 && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Video className="w-4 h-4 text-purple-500" />
                                  <span>{post.videos.length} video{post.videos.length > 1 ? 's' : ''}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Action Button */}
                          {post.status === 'active' && post.crops && post.crops.length > 0 && (
                            <button
                              onClick={(e) => handleFulfillmentClick(post, e)}
                              className="w-full lg:w-auto px-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                            >
                              <ShoppingCart className="w-5 h-5" />
                              Request Fulfillment
                            </button>
                          )}

                          {/* Post Footer */}
                          <div className="pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between text-sm text-gray-400">
                              <span>Posted {formatDate(post.createdAt)}</span>
                              <span>By {post.createdBy.role}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Fulfillment Modal */}
      {isModalOpen && selectedPost && (
        <FulfillmentModal
          post={selectedPost}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSuccess={() => {}}
          fulfillmentMutation={fulfillmentMutation}
        />
      )}
    </div>
  );
};

export default HomePage;
