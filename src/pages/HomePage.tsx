import React, { useState } from 'react';
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

// Loading skeleton components
const CarouselSkeleton = () => (
  <div className="bg-green-100 rounded-2xl shadow-sm mb-6">
    <div className="h-48 sm:h-64 md:h-72 lg:h-80 bg-gradient-to-r from-green-200 to-green-300 animate-pulse flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="animate-spin w-12 h-12 text-green-600 mx-auto mb-3" />
        <p className="text-green-700 font-medium">Loading Carousel...</p>
      </div>
    </div>
  </div>
);

const PostsSkeleton = () => (
  <div className="space-y-6">
    <div className="h-8 bg-green-100 rounded-lg w-48 animate-pulse"></div>
    
    {/* Mobile skeleton */}
    <div className="lg:hidden">
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="flex-shrink-0 w-72 bg-white border border-green-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-green-200 to-green-300 animate-pulse flex items-center justify-center">
                <Loader2 className="animate-spin w-8 h-8 text-green-600" />
              </div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-green-100 rounded animate-pulse"></div>
                <div className="h-3 bg-green-50 rounded animate-pulse w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-green-50 rounded animate-pulse w-1/2"></div>
                  <div className="h-3 bg-green-50 rounded animate-pulse w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Desktop skeleton */}
    <div className="hidden lg:grid lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div key={item} className="bg-white border border-green-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="h-40 bg-gradient-to-br from-green-200 to-green-300 animate-pulse flex items-center justify-center">
            <Loader2 className="animate-spin w-6 h-6 text-green-600" />
          </div>
          <div className="p-4 space-y-3">
            <div className="h-4 bg-green-100 rounded animate-pulse"></div>
            <div className="h-3 bg-green-50 rounded animate-pulse w-3/4"></div>
            <div className="space-y-2">
              <div className="h-8 bg-green-50 rounded animate-pulse"></div>
              <div className="h-8 bg-green-50 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </div>

    <div className="text-center mt-8">
      <p className="text-green-600 font-medium flex items-center justify-center gap-2">
        <Loader2 className="animate-spin w-4 h-4" />
        Loading Posts...
      </p>
    </div>
  </div>
);

const CategoriesSkeleton = () => (
  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 shadow-lg border border-green-100">
    <div className="text-center mb-8">
      <div className="h-8 bg-green-100 rounded-lg w-64 mx-auto mb-2 animate-pulse"></div>
      <div className="h-4 bg-green-50 rounded w-96 mx-auto animate-pulse"></div>
    </div>
    
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-6 max-w-5xl mx-auto">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
        <div key={item} className="flex flex-col items-center">
          <div className="w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-green-200 to-green-400 rounded-2xl mb-4 animate-pulse flex items-center justify-center">
            <Loader2 className="animate-spin w-6 h-6 text-green-600" />
          </div>
          <div className="h-4 bg-green-100 rounded w-20 animate-pulse"></div>
        </div>
      ))}
    </div>
    
    <div className="text-center mt-8">
      <p className="text-green-600 font-medium flex items-center justify-center gap-2">
        <Loader2 className="animate-spin w-4 h-4" />
        Loading Categories...
      </p>
    </div>
  </div>
);

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  
  // Individual loading states
  const [carouselLoaded, setCarouselLoaded] = useState(false);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  const carouselImages = [
    'https://picsum.photos/800/400?random=1',
    'https://picsum.photos/800/400?random=2',
    'https://picsum.photos/800/400?random=3',
    'https://picsum.photos/800/400?random=4'
  ];

  // Simulate carousel loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setCarouselLoaded(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Simulate categories loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setCategoriesLoaded(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Fetch posts (existing React Query)
  const { data: posts = [], isLoading: postsLoading, error, refetch, isFetching } = useQuery({
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

  // Error State (only for critical errors that prevent the entire page from loading)
  if (error && !posts.length && !postsLoading) {
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

  // Empty State for Posts
  const EmptyPostsState = () => (
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
      {/* Carousel Section */}
      {!carouselLoaded ? (
        <CarouselSkeleton />
      ) : (
        <Carousel 
          images={carouselImages}
          autoSlide={true}
          slideInterval={4000}
          className="mb-6"
          onImageClick={(index, url) => console.log('Image clicked:', index, url)}
        />
      )}
      
      <div className="max-w-7xl mx-auto px-4 py-4 space-y-8">
        {/* Posts Section */}
        {postsLoading ? (
          <PostsSkeleton />
        ) : posts.length === 0 ? (
          <EmptyPostsState />
        ) : (
          <CropCardsList posts={posts} onCardClick={handleCardClick} />
        )}
        
        {/* Demand Categories Section */}
        {!categoriesLoaded ? (
          <CategoriesSkeleton />
        ) : (
          <DemandCategories onCategoryClick={handleCategoryClick} />
        )}
      </div>
    </div>
  );
};

export default HomePage;
