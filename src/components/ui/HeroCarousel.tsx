import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface Slide {
  bgGradient: string;
  category: string;
  title: string;
  titleHighlight: string;
  subtitle: string;
  ctaLink: string;
  ctaText: string;
}

interface HeroCarouselProps {
  slides?: Slide[];
  autoSlideInterval?: number;
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({ slides = [], autoSlideInterval = 5000 }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoSliding, setIsAutoSliding] = useState(true);

  // Create infinite loop by duplicating slides
  const extendedSlides = [...slides, ...slides, ...slides];
  const startIndex = slides.length; // Start from the middle set
  const [translateX, setTranslateX] = useState(-startIndex * 100);

  useEffect(() => {
    if (!isAutoSliding || slides.length === 0) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, autoSlideInterval);

    return () => clearInterval(interval);
  }, [isAutoSliding, slides.length, autoSlideInterval]);

  const nextSlide = () => {
    setCurrentSlide((prev) => {
      const next = prev + 1;
      if (next >= slides.length) {
        // Reset to beginning but visually seamless
        setTimeout(() => {
          setTranslateX(-startIndex * 100);
          setCurrentSlide(0);
        }, 500);
        return next;
      }
      return next;
    });
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => {
      const next = prev - 1;
      if (next < 0) {
        // Jump to end but visually seamless
        setTimeout(() => {
          setTranslateX(-(startIndex + slides.length - 1) * 100);
          setCurrentSlide(slides.length - 1);
        }, 500);
        return next;
      }
      return next;
    });
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoSliding(false);
    setTimeout(() => setIsAutoSliding(true), 10000);
  };

  const handleNavigation = (direction: 'next' | 'prev') => {
    setIsAutoSliding(false);
    if (direction === 'next') {
      nextSlide();
    } else {
      prevSlide();
    }
    setTimeout(() => setIsAutoSliding(true), 10000);
  };

  useEffect(() => {
    const newTranslateX = -(startIndex + currentSlide) * 100;
    setTranslateX(newTranslateX);
  }, [currentSlide, startIndex]);

  if (!slides || slides.length === 0) {
    return <div className="h-[350px] bg-gray-200 rounded-2xl flex items-center justify-center">No slides available</div>;
  }

  return (
    <div className="relative w-full overflow-hidden">
      {/* Navigation Buttons */}
      <button 
        onClick={() => handleNavigation('prev')}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-20 shadow-xl border border-gray-200 group"
      >
        <ChevronLeft className="w-6 h-6 text-gray-700 group-hover:scale-110 transition-transform duration-300" />
      </button>
      
      <button 
        onClick={() => handleNavigation('next')}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-20 shadow-xl border border-gray-200 group"
      >
        <ChevronRight className="w-6 h-6 text-gray-700 group-hover:scale-110 transition-transform duration-300" />
      </button>

      {/* Slides Container */}
      <div className="relative h-[350px] overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ 
            transform: `translateX(${translateX}%)`,
            width: `${extendedSlides.length * 100}%`
          }}
        >
          {extendedSlides.map((slide, index) => {
            const slideIndex = index % slides.length;
            const isCenter = index === startIndex + currentSlide;
            
            return (
              <div
                key={`${slideIndex}-${Math.floor(index / slides.length)}`}
                className="relative h-full transition-all duration-300"
                style={{ 
                  width: `${100 / extendedSlides.length}%`,
                  transform: isCenter ? 'scale(1)' : 'scale(0.9)',
                  opacity: isCenter ? 1 : 0.7
                }}
              >
                {/* Individual Slide */}
                <div className="h-full mx-2">
                  <div className="relative h-full rounded-2xl overflow-hidden shadow-2xl group cursor-pointer">
                    {/* Background with Dynamic Gradient */}
                    <div 
                      className="w-full h-full relative"
                      style={{ 
                        background: slide.bgGradient
                      }}
                    >
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/60" />
                      
                      {/* Animated Geometric Shapes */}
                      <div className="absolute inset-0 overflow-hidden">
                        <div 
                          className="absolute w-32 h-32 opacity-15 animate-spin-slow"
                          style={{
                            top: '15%',
                            right: '10%',
                            background: `conic-gradient(from 0deg, transparent, rgba(255,255,255,0.3), transparent)`,
                            borderRadius: '50%'
                          }}
                        />
                        <div 
                          className="absolute w-24 h-24 opacity-20 animate-pulse-slow"
                          style={{
                            bottom: '15%',
                            left: '8%',
                            background: `linear-gradient(45deg, transparent, rgba(255,255,255,0.2), transparent)`,
                            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
                          }}
                        />
                      </div>

                      {/* Content */}
                      <div className="absolute inset-0 flex items-center px-8 z-10">
                        <div className="flex w-full items-center justify-between">
                          {/* Left Content */}
                          <div className="text-white max-w-lg">
                            <div className="mb-4">
                              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold tracking-wide uppercase border border-white/30">
                                {slide.category}
                              </span>
                            </div>
                            
                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 leading-tight">
                              <span className="block">
                                {slide.title}
                              </span>
                              <span className="block text-yellow-300">
                                {slide.titleHighlight}
                              </span>
                            </h2>
                            
                            <p className="text-sm md:text-base mb-6 text-gray-200 leading-relaxed line-clamp-2">
                              {slide.subtitle}
                            </p>
                            
                            <Link
                              href={slide.ctaLink}
                              className="inline-block group px-6 py-3 bg-white text-gray-900 rounded-full hover:bg-yellow-300 transition-all duration-500 font-semibold text-sm shadow-xl hover:scale-105"
                            >
                              <span className="group-hover:tracking-wider transition-all duration-300">
                                {slide.ctaText}
                              </span>
                            </Link>
                          </div>

                          {/* Right Visual Element */}
                          <div className="hidden lg:flex items-center justify-center">
                            <div className="relative">
                              <div className="w-40 h-24 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 flex items-center justify-center">
                                <div className="text-white/60 text-center">
                                  <div className="w-12 h-12 bg-white/20 rounded-full mx-auto mb-2 flex items-center justify-center">
                                    <Star className="w-6 h-6" />
                                  </div>
                                  <p className="text-xs font-medium">Featured</p>
                                </div>
                              </div>
                              
                              {/* Floating Elements */}
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-bounce" />
                              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white/60 rounded-full animate-pulse" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Hover Shine Effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      </div>
                    </div>

                    {/* Active Slide Indicator */}
                    {isCenter && (
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/30">
                        <div className="h-full bg-white animate-progress-fill" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="flex justify-center mt-6 gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide 
                ? 'w-8 h-2 bg-[#391C71]' 
                : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.20;
            transform: scale(1);
          }
          50% {
            opacity: 0.30;
            transform: scale(1.05);
          }
        }

        @keyframes progress-fill {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-progress-fill {
          animation: progress-fill 5s linear;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default HeroCarousel;