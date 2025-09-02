import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ILLUSTRATIONS } from '../assets/assets';
import api from '../api/axios';
import toast from 'react-hot-toast';
import Carousel from '../components/Carousel';
import CropCardsList from '../components/CropCardsList';
import DemandCategories from '../components/DemandCategories';
import type { Post } from '../components/CropCard';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const carouselImages = [
    'https://picsum.photos/800/400?random=1',
    'https://picsum.photos/800/400?random=2',
    'https://picsum.photos/800/400?random=3',
    'https://picsum.photos/800/400?random=4'
  ];

  // Fetch posts
  const { data: posts = [], isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['posts'],
    queryFn: async (): Promise<Post[]> => {
      const { data } = await api.post('/api/posts/list');
      if (data.status_code === 200) {
        return data.data || [];
      }
      throw new Error(data.message || 'Failed to fetch posts');
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const handleCardClick = (post: Post): void => {
    navigate(`/kisaan/crop-details/${post._id}`, { state: { post } });
  };

  const handleCategoryClick = (category: any): void => {
    console.log('Category selected:', category);
    // Handle navigation or filtering based on category
    toast.success(`Selected: ${category.name}`);
  };

  const handleRefresh = async (): Promise<void> => {
    try {
      await refetch();
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

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading latest posts...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <img
            src={ILLUSTRATIONS.kisaan08}
            alt="Error"
            className="w-32 h-32 mx-auto mb-6 object-contain opacity-60"
          />
          <h3 className="text-xl font-semibold text-gray-700 mb-3">Something went wrong</h3>
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

  // Empty State
  const EmptyState = () => (
    <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
      <img
        src={ILLUSTRATIONS.kisaan03}
        alt="No Posts"
        className="w-32 lg:w-40 h-32 lg:h-40 mx-auto mb-8 object-contain opacity-60"
      />
      <h3 className="text-2xl font-semibold text-gray-700 mb-4">No posts available yet</h3>
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
  );

  // Main Render
  return (
    <div className="min-h-screen bg-gray-50">
      <Carousel 
        images={carouselImages}
        autoSlide={true}
        slideInterval={4000}
        className="mb-6"
        onImageClick={(index, url) => console.log('Image clicked:', index, url)}
      />
      
      <div className="max-w-7xl mx-auto px-4 py-4 space-y-8">
        {/* Posts Section */}
        {posts.length === 0 ? (
          <EmptyState />
        ) : (
          <CropCardsList posts={posts} onCardClick={handleCardClick} />
        )}
        
        {/* Demand Categories Section */}
        <DemandCategories onCategoryClick={handleCategoryClick} />
      </div>
    </div>
  );
};

export default HomePage;
