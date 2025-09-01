import React, { useState, useEffect, useRef } from 'react';

interface CarouselProps {
  images: string[];
  autoSlide?: boolean;
  slideInterval?: number;
  className?: string;
  onSlideChange?: (index: number) => void;
  onImageClick?: (index: number, imageUrl: string) => void;
}

const Carousel: React.FC<CarouselProps> = ({
  images,
  autoSlide = true,
  slideInterval = 3000,
  className = '',
  onSlideChange,
  onImageClick
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Auto-slide functionality
  useEffect(() => {
    if (!autoSlide) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const nextSlide = (prev + 1) % images.length;
        onSlideChange?.(nextSlide);
        return nextSlide;
      });
    }, slideInterval);

    return () => clearInterval(interval);
  }, [autoSlide, slideInterval, images.length, onSlideChange]);

  // Handle dot indicator click
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    onSlideChange?.(index);
  };

  // Handle image click
  const handleImageClick = (index: number) => {
    onImageClick?.(index, images[index]);
  };

  // Touch event handlers for swipe functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const difference = touchStartX.current - touchEndX.current;
    const isLeftSwipe = difference > 50;
    const isRightSwipe = difference < -50;

    if (isLeftSwipe) {
      // Swipe left - go to next slide
      const nextSlide = (currentSlide + 1) % images.length;
      setCurrentSlide(nextSlide);
      onSlideChange?.(nextSlide);
    }

    if (isRightSwipe) {
      // Swipe right - go to previous slide
      const prevSlide = currentSlide === 0 ? images.length - 1 : currentSlide - 1;
      setCurrentSlide(prevSlide);
      onSlideChange?.(prevSlide);
    }

    // Reset touch positions
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        const prevSlide = currentSlide === 0 ? images.length - 1 : currentSlide - 1;
        setCurrentSlide(prevSlide);
        onSlideChange?.(prevSlide);
      } else if (e.key === 'ArrowRight') {
        const nextSlide = (currentSlide + 1) % images.length;
        setCurrentSlide(nextSlide);
        onSlideChange?.(nextSlide);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, images.length, onSlideChange]);

  return (
    <div className={`relative w-full overflow-hidden rounded-lg ${className}`}>
      {/* Main carousel container */}
      <div
        className="relative flex transition-transform duration-500 ease-in-out cursor-pointer"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {images.map((image, index) => (
          <div key={index} className="relative w-full flex-shrink-0">
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              className="w-full h-48 sm:h-64 md:h-72 lg:h-80 object-cover cursor-pointer"
              onClick={() => handleImageClick(index)}
              draggable={false}
            />
            
            {/* Dot indicators - positioned inside each image */}
            {index === currentSlide && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3">
                {images.map((_, dotIndex) => (
                  <button
                    key={dotIndex}
                    onClick={(e) => {
                      e.stopPropagation();
                      goToSlide(dotIndex);
                    }}
                    className={`w-3 h-3 rounded-full transition-all duration-300 transform hover:scale-110 ${
                      currentSlide === dotIndex
                        ? 'bg-white shadow-lg'
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                    aria-label={`Go to slide ${dotIndex + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Carousel;
