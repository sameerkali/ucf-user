import React, { useState, useRef, useEffect } from "react";
import {
  Calendar,
  Camera,
  Video,
  MapPin,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// --- INTERFACES ---

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

export interface Post {
  _id: string;
  type: string;
  title: string;
  description: string;
  crops: Crop[];
  readyByDate: string;
  photos: string[];
  videos: string[];
  location: Location;
  status: "active" | "inactive" | string;
}

interface PostCardProps {
  post: Post;
  onDelete: (postId: string, postTitle: string) => void;
  deletePending: boolean;
}

// --- HELPERS ---

const formatDate = (dateString: string): string =>
  dateString
    ? new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "N/A";

const formatLocation = (loc?: Location): string =>
  loc
    ? `${loc.village}, ${loc.tehsil}, ${loc.district}, ${loc.state}`
    : "Location not specified";

// --- MEDIA CAROUSEL WITH FALLBACKS AND SWIPE ON MOBILE ---

const FALLBACK_IMAGES = [
  "https://placehold.co/600x450/94a3b8/fff?text=Fallback+1",
  "https://placehold.co/600x450/64748b/fff?text=Fallback+2",
  "https://placehold.co/600x450/1e293b/fff?text=Fallback+3",
];

const MediaCarousel: React.FC<{ photos: string[]; videos: string[] }> = ({
  photos,
  videos,
}) => {
  const mediaItems =
    photos.length + videos.length > 0
      ? [
          ...photos.map((url) => ({ type: "photo" as const, url })),
          ...videos.map((url) => ({ type: "video" as const, url })),
        ]
      : FALLBACK_IMAGES.map((url) => ({ type: "photo" as const, url }));

  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Handle swipe on mobile
  const minSwipeDistance = 50; // px

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (
      touchStartX.current !== null &&
      touchEndX.current !== null &&
      Math.abs(touchStartX.current - touchEndX.current) > minSwipeDistance
    ) {
      if (touchStartX.current > touchEndX.current) {
        // Swipe Left
        next();
      } else {
        // Swipe Right
        prev();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const prev = () => setIndex(index === 0 ? mediaItems.length - 1 : index - 1);
  const next = () => setIndex(index === mediaItems.length - 1 ? 0 : index + 1);

  const current = mediaItems[index];

  return (
    <div
      className="relative group bg-black rounded-t-lg md:rounded-l-lg md:rounded-r-none"
      style={{
        flexBasis: window.innerWidth >= 1280 ? "40%" : window.innerWidth >= 768 ? "35%" : undefined,
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="w-full h-48 md:h-full flex items-center justify-center overflow-hidden rounded-t-lg md:rounded-l-lg md:rounded-r-none">
        {current.type === "photo" ? (
          <img
            src={current.url}
            alt={`Media ${index + 1}`}
            className="object-cover w-full h-full"
            onError={(e) => {
              (e.target as HTMLImageElement).onerror = null;
              (e.target as HTMLImageElement).src =
                "https://placehold.co/600x450/e2e8f0/64748b?text=Image+Error";
            }}
          />
        ) : (
          <video src={current.url} controls className="object-cover w-full h-full" />
        )}
      </div>

      {mediaItems.length > 1 && (
        <>
          <button
            onClick={prev}
            className="hidden md:flex absolute top-1/2 left-2 -translate-y-1/2 bg-black/40 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Previous media"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="hidden md:flex absolute top-1/2 right-2 -translate-y-1/2 bg-black/40 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Next media"
          >
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1.5">
            {mediaItems.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-1.5 rounded-full transition-all ${
                  index === i ? "bg-white scale-125" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// --- MAIN POST CARD COMPONENT ---

const PostCard: React.FC<PostCardProps> = ({ post, onDelete, deletePending }) => (
  <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col md:flex-row h-full overflow-hidden max-w-5xl mx-auto">
    <MediaCarousel photos={post.photos} videos={post.videos} />

    <div className="p-4 sm:p-5 flex flex-col flex-1">
      <div className="flex-1">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="font-bold text-gray-800 text-base leading-tight line-clamp-2">
            {post.title}
          </h3>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap capitalize ${
              post.status === "active"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {post.status}
          </span>
        </div>

        <div className="mb-3 text-xs text-gray-500 flex items-start gap-2">
          <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-1">{formatLocation(post.location)}</span>
        </div>

        {post.crops && post.crops.length > 0 ? (
          <div className="space-y-2 mb-4">
            {post.crops.map((crop, i) => (
              <div
                key={i}
                className="bg-gray-50 p-2.5 rounded-md flex justify-between items-center text-xs"
              >
                <span className="font-semibold text-gray-700">{crop.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500">{crop.quantity} q</span>
                  <span className="font-bold text-gray-800">
                    ₹{crop.pricePerQuintal}/q
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 p-2.5 rounded-md text-center text-xs text-gray-500 mb-4">
            No crop details available
          </div>
        )}
      </div>

      <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(post.readyByDate)}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Camera className="w-4 h-4" /> {post.photos.length}
          </div>
          <div className="flex items-center gap-1">
            <Video className="w-4 h-4" /> {post.videos.length}
          </div>
          <button
            onClick={() => onDelete(post._id, post.title)}
            disabled={deletePending}
            className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Delete post"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default PostCard;
