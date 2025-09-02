import React from 'react';
import CropCard from './CropCard';
import type { Post } from './CropCard';

interface CropCardsListProps {
  posts: Post[];
  onCardClick: (post: Post) => void;
}

const CropCardsList: React.FC<CropCardsListProps> = ({ posts, onCardClick }) => {
  return (
    <>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Crops</h2>
      
      {/* Mobile: Horizontal Scrolling Cards */}
      <div className="lg:hidden">
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4" style={{ scrollSnapType: 'x mandatory' }}>
            {posts.map((post) => (
              <div key={post._id} className="flex-shrink-0" style={{ scrollSnapAlign: 'start' }}>
                <CropCard 
                  post={post} 
                  onClick={onCardClick} 
                  variant="mobile" 
                />
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
        {posts.map((post) => (
          <CropCard 
            key={post._id} 
            post={post} 
            onClick={onCardClick} 
            variant="desktop" 
          />
        ))}
      </div>
    </>
  );
};

export default CropCardsList;
