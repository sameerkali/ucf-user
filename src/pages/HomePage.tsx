import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Package, IndianRupee, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ILLUSTRATIONS } from '../assets/assets';
import api from '../api/axios';
import toast from 'react-hot-toast';
import Carousel from '../components/Carousel';

// Essential interfaces only
interface Crop {
  name: string;
  type: string;
  quantity: number;
  pricePerQuintal: number;
}

interface Post {
  _id: string;
  type: string;
  title: string;
  crops: Crop[];
  status: string;
}

interface ApiResponse {
  status_code: number;
  message: string;
  data: Post[];
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // Carousel images
  const dummyImages = [
    'https://picsum.photos/800/400?random=1',
    'https://picsum.photos/800/400?random=2',
    'https://picsum.photos/800/400?random=3',
    'https://picsum.photos/800/400?random=4'
  ];

  // Fetch posts
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

  const handleCardClick = (post: Post): void => {
    navigate(`/kisaan/crop-details/${post._id}`, { state: { post } });
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
                      <div 
                        className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 w-72 cursor-pointer overflow-hidden"
                        onClick={() => handleCardClick(post)}
                      >
                        {/* Image - 40% height */}
                        <div className="h-32 w-full">
                          <img 
                            src={ILLUSTRATIONS.kisaan07} 
                            alt="Crop illustration"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Content - 60% */}
                        <div className="p-4 h-48 flex flex-col">
                          
                          
                          {/* Crop Info */}
                          {post.crops && post.crops.length > 0 && (
                            <div className="flex-1 space-y-3">
                              <div>
                                <p className="font-bold text-green-800 text-lg">
                                  {post.crops[0].name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {post.crops[0].type}
                                </p>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Package className="w-4 h-4 text-gray-500" />
                                  <span className="text-gray-700 font-semibold">{post.crops[0].quantity} quintals</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <IndianRupee className="w-4 h-4 text-green-600" />
                                  <span className="text-green-700 font-bold text-lg">₹{post.crops[0].pricePerQuintal}/quintal</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
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
            <div className="hidden lg:grid lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
              {posts.map((post: Post) => (
                <div key={post._id}>
                  <div 
                    className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden group"
                    onClick={() => handleCardClick(post)}
                  >
                    {/* Image - 40% height */}
                    <div className="h-40 w-full relative">
                      <img 
                        src={ILLUSTRATIONS.kisaan07} 
                        alt="Crop illustration"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    
                    {/* Content - 60% */}
                    <div className="p-4 h-60 flex flex-col">
                      {/* Status badges */}
                     
                      
                   
                      
                      {/* Crop Info */}
                      {post.crops && post.crops.length > 0 && (
                        <div className="flex-1 flex flex-col justify-center space-y-4">
                          {/* Crop Name & Type */}
                          <div className="text-center">
                            <p className="font-bold text-green-800 text-xl mb-1">
                              {post.crops[0].name}
                            </p>
                            <p className="text-sm text-gray-600 capitalize">
                              {post.crops[0].type}
                            </p>
                          </div>
                          
                          {/* Quantity and Price */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-center gap-2 p-2 bg-gray-50 rounded-lg">
                              <Package className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-700 font-semibold">{post.crops[0].quantity} quintals</span>
                            </div>
                            <div className="flex items-center justify-center gap-2 p-2 bg-green-50 rounded-lg">
                              <IndianRupee className="w-4 h-4 text-green-600" />
                              <span className="text-green-700 font-bold text-lg">₹{post.crops[0].pricePerQuintal}/q</span>
                            </div>
                          </div>

                          {/* Additional crops indicator */}
                          {post.crops.length > 1 && (
                            <div className="text-center">
                              <span className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block">
                                +{post.crops.length - 1} more
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
