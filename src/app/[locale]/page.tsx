'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { MapPin, Star } from 'lucide-react';
import { Navbar } from '@/components/main/Navbar';
import { Footer } from '@/components/main/Footer';
import HeroCarousel from '@/components/ui/HeroCarousel';
import PublicPackages from '@/components/main/PublicPackages';
import PublicArtists from '@/components/main/PublicArtists';
import EventsWidget from '@/components/public/EventsWidget';
import { Iansui } from 'next/font/google';
import Image from 'next/image';
import TitleTag from '@/components/ui/TitleTag';
import { CarouselService } from '@/services/carousel.service';

export default function HomePage() {
  const t = useTranslations();
  const [scrollY, setScrollY] = useState(0);
  const [carouselSlides, setCarouselSlides] = useState<any[]>([]);
  const [isLoadingSlides, setIsLoadingSlides] = useState(true);

  const testimonials = [
    {
      name: t('home.testimonialsData.sarah.name'),
      role: t('home.testimonialsData.sarah.role'),
      content: t('home.testimonialsData.sarah.content'),
      avatar: '/assets/images/testimonial1.jpg',
    },
    {
      name: t('home.testimonialsData.michael.name'),
      role: t('home.testimonialsData.michael.role'),
      content: t('home.testimonialsData.michael.content'),
      avatar: '/assets/images/testimonial2.jpg',
    },
    {
      name: t('home.testimonialsData.emma.name'),
      role: t('home.testimonialsData.emma.role'),
      content: t('home.testimonialsData.emma.content'),
      avatar: '/assets/images/testimonial3.jpg',
    },
  ];

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fallback slides (current hardcoded content)
  const fallbackSlides = [
    {
      image: '/1.jpg',
      title: t('home.heroTitle'),
      titleHighlight: t('home.heroHighlight'),
      subtitle: t('home.heroSubtitle'),
      ctaText: t('nav.joinUs'),
      ctaLink: '/join-us',
      category: 'Featured',
    },
    {
      image: '/3.jpg',
      title: t('home.carousel.slide2.title'),
      titleHighlight: t('home.carousel.slide2.titleHighlight'),
      subtitle: t('home.carousel.slide2.subtitle'),
      ctaText: t('home.carousel.slide2.ctaText'),
      ctaLink: '/coming-soon',
      category: 'Music',
    },
    {
      image: '/5.jpg',
      title: t('home.carousel.slide3.title'),
      titleHighlight: t('home.carousel.slide3.titleHighlight'),
      subtitle: t('home.carousel.slide3.subtitle'),
      ctaText: t('home.carousel.slide3.ctaText'),
      ctaLink: '/coming-soon',
      category: 'Art',
    },
    {
      image: '/7.jpg',
      title: t('home.carousel.slide4.title'),
      titleHighlight: t('home.carousel.slide4.titleHighlight'),
      subtitle: t('home.carousel.slide4.subtitle'),
      ctaText: t('home.carousel.slide4.ctaText'),
      ctaLink: '/coming-soon',
      category: 'Workshop',
    },
    {
      image: '/8.jpg',
      title: t('home.carousel.slide5.title'),
      titleHighlight: t('home.carousel.slide5.titleHighlight'),
      subtitle: t('home.carousel.slide5.subtitle'),
      ctaText: t('home.carousel.slide5.ctaText'),
      ctaLink: '/coming-soon',
      category: 'Movies',
    },
  ];

  // Load carousel slides from API
  useEffect(() => {
    const loadCarouselSlides = async () => {
      try {
        setIsLoadingSlides(true);
        const apiSlides = await CarouselService.getActiveSlides();
        
        if (apiSlides && apiSlides.length > 0) {
          // Convert API slides to hero carousel format
          const heroSlides = CarouselService.convertToHeroSlides(apiSlides);
          setCarouselSlides(heroSlides);
        } else {
          // Use fallback slides if no API slides
          setCarouselSlides(fallbackSlides);
        }
      } catch (error) {
        console.error('Failed to load carousel slides:', error);
        // Use fallback slides on error
        setCarouselSlides(fallbackSlides);
      } finally {
        setIsLoadingSlides(false);
      }
    };

    loadCarouselSlides();
  }, [t]); // Re-run when translations change

  return (
    <div className="min-h-screen bg-white relative">
      <div className="fixed inset-0 pointer-events-none  z-0">
        <div className="absolute inset-0 flex items-center justify-center">
          <Image 
            src="/design.png"
            alt="Background Watermark"
            height={1500}
            width={1200}
            className="select-none opacity-10 max-w-[2000px] relative h-auto"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/3 via-transparent to-white/2"></div>
      </div>
      
      <Navbar />

      {isLoadingSlides ? (
        <section className="py-20 pt-24 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#391C71]"></div>
        </section>
      ) : (
        <HeroCarousel slides={carouselSlides} />
      )}
      
      <TitleTag />


      <section className="py-20 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-purple-50" />
        <div className="max-w-full mx-auto px-6 relative">
          <div className="max-w-7xl mx-auto">
            <PublicArtists limit={12} showHeader={true} />
          </div>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6 relative">
            {t('home.upcomingEvents.title', { default: 'Upcoming Events' })}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-[#391C71] rounded-full" />
          </h2>
          <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
            {t('home.upcomingEvents.description', { default: 'Discover amazing events happening near you and book your tickets today' })}
          </p>
        </div>
        
        <EventsWidget 
          title="" 
          limit={6} 
          showViewAll={true}
          className="events-home-section"
        />
      </section>

      <section className="py-20 max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6 relative">
            {t('home.equipmentPackages.title')}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-[#391C71] rounded-full" />
          </h2>
          <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
            {t('home.equipmentPackages.description')}
          </p>
        </div>

        {/* Dynamic Packages Component */}
        <div className="mb-12">
          <PublicPackages limit={8} showHeader={false} />
        </div>

        <div className="text-center">
          <Link
            href="/packages"
            className="inline-block bg-white border-2 border-[#391C71] text-[#391C71] px-10 py-4 rounded-full hover:bg-[#391C71] hover:text-white transition-all duration-500 font-medium shadow-xl hover:shadow-2xl hover:shadow-[#391C71]/20 hover:scale-105"
          >
            {t('home.equipmentPackages.viewAllPackages')}
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden z-10">
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, #391C71 0%, #5B2C87 25%, #7C3A9D 50%, #9D47B3 75%, #BE54C9 100%)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl font-bold text.white mb-6 leading-tight">
            {t('home.ctaTitle')}
          </h2>
          <p className="text-white/90 text-xl mb-12 max-w-3xl mx-auto leading-relaxed">
            {t('home.ctaSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/artists"
              className="group px-10 py-4 bg-white text-[#391C71] rounded-full font-medium hover:bg-yellow-300 transition-all duration-500 shadow-2xl hover:scale-105 relative z-20"
            >
              <span className="group-hover:tracking-wider transition-all duration-300">
                {t('nav.planEvent')}
              </span>
            </Link>
            <Link
              href="/contact"
              className="group px-10 py-4 bg-white/15 backdrop-blur-xl border border-white/30 text-white rounded-full hover:bg-white/25 transition-all duration-500 font-medium shadow-2xl hover:scale-105 relative z-20"
            >
              <span className="group-hover:tracking-wider transition-all duration-300">
                {t('home.contactUs')}
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-purple-50" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-6 relative">
              {t('home.testimonials')}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-[#391C71] rounded-full" />
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              {t('home.testimonialsDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl hover:shadow-2xl hover:shadow-[#391C71]/10 transition-all duration-500 transform hover:-translate-y-1 group"
                style={{ animationDelay: `${idx * 200}ms` }}
              >
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-full flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white font-bold text-xl">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-lg">
                      {testimonial.name}
                    </div>
                    <div className="text-[#391C71] text-sm font-medium">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 italic text-base mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0px) rotate(0deg) scale(1);
          }
          33% {
            transform: translateY(-20px) rotate(60deg) scale(0.95);
          }
          66% {
            transform: translateY(10px) rotate(120deg) scale(1.05);
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-15px) scale(0.98);
          }
        }
        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px) rotate(0deg) scale(1);
          }
          25% {
            transform: translateY(-25px) rotate(-45deg) scale(0.92);
          }
          50% {
            transform: translateY(-5px) rotate(-90deg) scale(1.08);
          }
          75% {
            transform: translateY(-15px) rotate(-135deg) scale(0.96);
          }
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .events-home-section {
          /* Custom styling for events section on home page */
        }
        .events-home-section .group:hover {
          transform: translateY(-8px);
        }
      `}</style>
    </div>
  );
}