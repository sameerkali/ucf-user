import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, MapPin, Package, IndianRupee, Camera, Video, Loader2, ShoppingCart } from 'lucide-react';
import { ILLUSTRATIONS } from '../assets/assets';
import api from '../api/axios';
import toast from 'react-hot-toast';
import FulfillmentModal from '../components/FulfillmentModal';
import Carousel from '../components/Carousel';

// Shared interfaces - consistent with FulfillmentModal
interface Crop {
  name: string;
  type: string;
  quantity: number; // Changed to number for consistency
  pricePerQuintal: number; // Changed to number for consistency
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

  // carousel
    const dummyImages = [
    'https://picsum.photos/800/400?random=1',
    'https://picsum.photos/800/400?random=2',
    'https://picsum.photos/800/400?random=3',
    'https://picsum.photos/800/400?random=4'
  ];
    // carousel


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

  const handleFulfillmentClick = (post: Post): void => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    setSelectedPost(null);
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
        className="h-64 md:h-96 "
         onImageClick={(index, url) => console.log('Product image clicked:',index, url)}
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
            {/* Stats Bar */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{posts.length}</div>
                  <div className="text-gray-600 font-medium">Total Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {posts.filter((post: Post) => post.status === 'active').length}
                  </div>
                  <div className="text-gray-600 font-medium">Active Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {posts.reduce((acc: number, post: Post) => acc + (post.crops?.length || 0), 0)}
                  </div>
                  <div className="text-gray-600 font-medium">Crop Varieties</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {posts.reduce((acc: number, post: Post) => acc + (post.photos?.length || 0) + (post.videos?.length || 0), 0)}
                  </div>
                  <div className="text-gray-600 font-medium">Media Files</div>
                </div>
              </div>
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {posts.map((post: Post) => (
                <div
                  key={post._id}
                  className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                >
                  {/* Post Header */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
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
                    
                    <h3 className="font-bold text-gray-900 text-xl mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                      {post.description}
                    </p>
                  </div>

                  {/* Post Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>Ready: {formatDate(post.readyByDate)}</span>
                    </div>
                    
                    <div className="flex items-start gap-2 text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{formatLocation(post.location)}</span>
                    </div>
                  </div>

                  {/* Crop Details */}
                  {post.crops && post.crops.length > 0 ? (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-4">
                      <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Crop Details
                      </h4>
                      <div className="space-y-3">
                        {post.crops.map((crop: Crop, index: number) => (
                          <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                              <h5 className="font-semibold text-green-800">{crop.name}</h5>
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                {crop.type}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center gap-2">
                                <Package className="w-3 h-3 text-green-600" />
                                <span className="text-gray-700">{crop.quantity} quintals</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <IndianRupee className="w-3 h-3 text-green-600" />
                                <span className="text-gray-700">₹{crop.pricePerQuintal}/quintal</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-4 mb-4 text-center">
                      <p className="text-gray-500 text-sm italic">No crop details available</p>
                    </div>
                  )}

                  {/* Media Indicators */}
                  {(post.photos.length > 0 || post.videos.length > 0) && (
                    <div className="flex items-center gap-4 pt-4 border-t border-gray-100 mb-4">
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

                  {/* Fulfillment Button */}
                  {post.status === 'active' && post.crops && post.crops.length > 0 && (
                    <div className="mb-4">
                      <button
                        onClick={() => handleFulfillmentClick(post)}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Request Fulfillment
                      </button>
                    </div>
                  )}

                  {/* Post Footer */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Posted {formatDate(post.createdAt)}</span>
                      <span>By {post.createdBy.role}</span>
                    </div>
                  </div>
                </div>
              ))}
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
