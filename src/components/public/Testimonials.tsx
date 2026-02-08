'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { type Testimonial } from '@/services/testimonial.service';
import { Star } from 'lucide-react';
import { useActiveTestimonials } from '@/hooks/useHomePageData';

// Fallback testimonials matching the design from the image
const FALLBACK_TESTIMONIALS: Testimonial[] = [
  {
    _id: 'fallback-1',
    name: 'Sarah Johnson',
    role: 'Corporate Event Planner',
    content: 'Working with this platform has transformed how we book artists and manage events. The seamless integration and professional service exceeded our expectations.',
    avatar: '',
    rating: 5,
    company: 'Elite Events Co.',
    order: 1,
    isActive: true,
    isFeatured: true,
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'fallback-2',
    name: 'Michael Chen',
    role: 'Wedding Organizer',
    content: 'The variety of talented artists and the ease of booking has made our wedding planning process incredibly smooth. Highly recommend to anyone looking for quality entertainment.',
    avatar: '',
    rating: 5,
    company: 'Dream Weddings',
    order: 2,
    isActive: true,
    isFeatured: true,
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'fallback-3',
    name: 'Emma Rodriguez',
    role: 'Art Gallery Director',
    content: 'An exceptional platform that connects us with amazing artists. The booking system is intuitive and the customer support is outstanding. A game-changer for our events.',
    avatar: '',
    rating: 5,
    company: 'Modern Art Gallery',
    order: 3,
    isActive: true,
    isFeatured: true,
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function Testimonials() {
  // Fetch testimonials with React Query caching
  const { data: apiTestimonials, isLoading: loading, error: queryError } = useActiveTestimonials();

  // Use real testimonials if available, otherwise use fallback
  const testimonials = useMemo(() => {
    if (apiTestimonials && apiTestimonials.length > 0) {
      return apiTestimonials;
    }
    return FALLBACK_TESTIMONIALS;
  }, [apiTestimonials]);

  const error = queryError ? 'Unable to load testimonials. Showing default testimonials.' : null;

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1 mb-4">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`w-4 h-4 sm:w-5 sm:h-5 ${
              index < rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-300 text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              What Our Clients Say
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
              Loading testimonials...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            What Our Clients Say
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
            Hear from event organizers, planners, and art enthusiasts who trust our platform
          </p>
          {/* Error notification */}
          {error && (
            <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-lg text-sm max-w-md mx-auto">
              {error}
            </div>
          )}
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial._id}
              className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: 'fadeInUp 0.6s ease-out forwards',
              }}
            >
              {/* Stars */}
              {renderStars(testimonial.rating)}

              {/* Content */}
              <p className="text-gray-700 text-sm sm:text-base lg:text-lg italic mb-6 leading-relaxed">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {testimonial.avatar ? (
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden ring-4 ring-purple-100">
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-base sm:text-lg ring-4 ring-purple-100">
                      {getInitials(testimonial.name)}
                    </div>
                  )}
                </div>

                {/* Name and Role */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base lg:text-lg truncate">
                    {testimonial.name}
                  </h4>
                  <p className="text-purple-600 text-xs sm:text-sm font-medium truncate">
                    {testimonial.role}
                  </p>
                  {testimonial.company && (
                    <p className="text-gray-500 text-xs truncate">
                      {testimonial.company}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
