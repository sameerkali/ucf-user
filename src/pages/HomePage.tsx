import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Package, IndianRupee, Camera, Video, Loader2, Sprout } from 'lucide-react';
import { ILLUSTRATIONS } from '../assets/assets';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import toast from 'react-hot-toast';

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

const HomePage = () => {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Using POST method without any body as you specified
      const { data } = await api.post('/api/posts/list');
      
      // Handle different response structures
      if (data.status_code === 200 || data.success) {
        setPosts(data.data || data.posts || []);
      } else if (data.message) {
        setPosts(data.data || []);
      } else {
        setError('Failed to fetch posts');
      }
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      setError(error.response?.data?.message || 'Network error occurred');
      toast.error('Failed to load posts');
    }
    
    setLoading(false);
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
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={fetchPosts}
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
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Sprout className="w-12 h-12 text-green-600 mr-3" />
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
              Farm Fresh Posts
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover quality crops directly from farmers in your area. Connect, buy, and support local agriculture.
          </p>
        </div>

        {/* Posts Section */}
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
              onClick={fetchPosts}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl"
            >
              Refresh Posts
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
                    {posts.filter(post => post.status === 'active').length}
                  </div>
                  <div className="text-gray-600 font-medium">Active Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {posts.reduce((acc, post) => acc + (post.crops?.length || 0), 0)}
                  </div>
                  <div className="text-gray-600 font-medium">Crop Varieties</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {posts.reduce((acc, post) => acc + (post.photos?.length || 0) + (post.videos?.length || 0), 0)}
                  </div>
                  <div className="text-gray-600 font-medium">Media Files</div>
                </div>
              </div>
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {posts.map((post) => (
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
                        {post.crops.map((crop, index) => (
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
                    <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
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

                  {/* Post Footer */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Posted {formatDate(post.createdAt)}</span>
                      <span>By {post.createdBy.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More / Refresh Button */}
            <div className="text-center mt-12">
              <button
                onClick={fetchPosts}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
              >
                <Loader2 className="w-5 h-5" />
                Refresh Posts
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
