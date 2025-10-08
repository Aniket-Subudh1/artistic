'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { MapPin, Star } from 'lucide-react';
import { Navbar } from '@/components/main/Navbar';
import { Footer } from '@/components/main/Footer';
import HeroCarousel from '@/components/ui/HeroCarousel';
import { Iansui } from 'next/font/google';
import Image from 'next/image';
import TitleTag from '@/components/ui/TitleTag';

export default function HomePage() {
  const t = useTranslations();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const carouselSlides = [
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
      title: 'Experience Live',
      titleHighlight: 'Music Concerts!',
      subtitle:
        'Feel the rhythm and energy of live performances from world-class artists and emerging talents.',
      ctaText: 'Book Concert',
      ctaLink: '/events',
      category: 'Music',
    },
    {
      image: '/5.jpg',
      title: 'Immerse in',
      titleHighlight: 'Art Exhibitions!',
      subtitle:
        'Discover contemporary and classical artworks from renowned galleries and independent artists.',
      ctaText: 'Explore Art',
      ctaLink: '/events',
      category: 'Art',
    },
    {
      image: '/7.jpg',
      title: 'Join Creative',
      titleHighlight: 'Workshops!',
      subtitle:
        'Learn new skills and techniques from expert instructors in hands-on creative sessions.',
      ctaText: 'Join Workshop',
      ctaLink: '/events',
      category: 'Workshop',
    },
    {
      image: '/8.jpg',
      title: 'Stream Movies',
      titleHighlight: 'At Home!',
      subtitle:
        'Watch the latest blockbusters and indie films from the comfort of your home.',
      ctaText: 'Stream Now',
      ctaLink: '/stream',
      category: 'Movies',
    },
  ];

  const featuredEvents = [
    {
      id: 1,
      image: '/assets/images/event1.jpg',
      category: t('categories.music'),
      title: 'Jazz Fusion Night',
      description:
        'Experience an evening of innovative jazz fusion from international artists',
      place: 'Blue Note Hall',
      price: 25,
      rating: 4.8,
    },
    {
      id: 2,
      image: '/assets/images/event2.jpg',
      category: t('categories.artExhibition'),
      title: 'Contemporary Visions',
      description:
        'A groundbreaking exhibition featuring works from emerging artists',
      place: 'Modern Art Gallery',
      price: 15,
      rating: 4.9,
    },
    {
      id: 3,
      image: '/assets/images/event3.jpg',
      category: t('categories.theater'),
      title: 'The Silent Echo',
      description:
        'A powerful performance exploring themes of identity and connection',
      place: 'Aurora Theatre',
      price: 30,
      rating: 4.7,
    },
    {
      id: 4,
      image: '/assets/images/event4.jpg',
      category: t('categories.workshop'),
      title: 'Pottery Masterclass',
      description: 'Learn pottery techniques from expert ceramic artists',
      place: 'Creative Studio',
      price: 40,
      rating: 4.6,
    },
  ];

  const artists = [
    {
      id: 1,
      image: '/assets/images/artist1.jpg',
      category: t('categories.photography'),
      name: 'Sarah Mitchell',
      location: 'New York, USA',
      price: 150,
      rating: 4.9,
    },
    {
      id: 2,
      image: '/assets/images/artist2.jpg',
      category: t('categories.music'),
      name: 'Jazz Ensemble',
      location: 'London, UK',
      price: 200,
      rating: 4.8,
    },
    {
      id: 3,
      image: '/assets/images/artist3.jpg',
      category: t('categories.dance'),
      name: 'Modern Dance Troupe',
      location: 'Paris, France',
      price: 180,
      rating: 4.7,
    },
    {
      id: 4,
      image: '/assets/images/artist4.jpg',
      category: t('categories.art'),
      name: 'Contemporary Painter',
      location: 'Berlin, Germany',
      price: 120,
      rating: 4.8,
    },
  ];

  const equipment = [
    {
      id: 1,
      image: '/assets/images/equipment1.jpg',
      category: t('categories.music'),
      name: 'Grand Piano',
      description: 'Professional Steinway concert grand piano',
      location: 'Music Hall',
      price: 50,
      rating: 4.9,
    },
    {
      id: 2,
      image: '/assets/images/equipment2.jpg',
      category: t('categories.audio'),
      name: 'Sound System',
      description: 'Professional PA system with mixing console',
      location: 'Audio Studio',
      price: 35,
      rating: 4.8,
    },
    {
      id: 3,
      image: '/assets/images/equipment3.jpg',
      category: t('categories.lighting'),
      name: 'Stage Lighting',
      description: 'Complete LED stage lighting setup',
      location: 'Event Center',
      price: 40,
      rating: 4.7,
    },
    {
      id: 4,
      image: '/assets/images/equipment4.jpg',
      category: t('categories.camera'),
      name: 'Professional Camera',
      description: 'High-end video recording equipment',
      location: 'Media Studio',
      price: 45,
      rating: 4.8,
    },
  ];

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
        {/* Subtle glass overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/3 via-transparent to-white/2"></div>
      </div>
      
      <Navbar />

      {/* Extracted carousel */}
      <HeroCarousel slides={carouselSlides} />
      <TitleTag />
      {/* Featured Events */}
      <section className="py-20 max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6 relative">
            {t('home.featuredEvents')}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-[#391C71] rounded-full" />
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            {t('home.featuredEventsDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {featuredEvents.map((event, index) => (
            <Link key={event.id} href={`/events/${event.id}`} className="block group">
              <div
                className="bg-white rounded-3xl border border-gray-100 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[#391C71]/10 cursor-pointer transform hover:-translate-y-2 hover:scale-105"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative h-56 bg-gradient-to-br from-[#391C71] to-[#5B2C87] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full flex items-center shadow-lg border border-white/20">
                    <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                    <span className="text-sm font-semibold text-gray-700">
                      {event.rating}
                    </span>
                  </div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-xs text-[#391C71] font-bold mb-3 uppercase tracking-wider">
                    {event.category}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3 text-xl leading-tight group-hover:text-[#391C71] transition-colors duration-300">
                    {event.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mb-5">
                    <MapPin className="w-4 h-4 mr-2 text-[#391C71]" />
                    {event.place}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900 text-xl">KD {event.price}</span>
                    <span className="bg-[#391C71] text-white px-5 py-2 rounded-full text-sm font-medium group-hover:bg-[#5B2C87] transition-all duration-300 shadow-lg">
                      {t('home.bookNow')}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/events"
            className="inline-block bg-white border-2 border-[#391C71] text-[#391C71] px-10 py-4 rounded-full hover:bg-[#391C71] hover:text-white transition-all duration-500 font-medium shadow-xl hover:shadow-2xl hover:shadow-[#391C71]/20 hover:scale-105"
          >
            {t('home.viewAllEvents')}
          </Link>
        </div>
      </section>

      {/* Book Your Artist */}
      <section className="py-20 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-purple-50" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-6 relative">
              {t('home.bookYourArtist')}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-[#391C71] rounded-full" />
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              {t('home.bookYourArtistDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {artists.map((artist, index) => (
              <Link key={artist.id} href={`/artists/${artist.id}`} className="block group">
                <div
                  className="bg-white rounded-3xl border border-gray-100 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[#391C71]/10 cursor-pointer transform hover:-translate-y-2 hover:scale-105"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative h-56 bg-gradient-to-br from-blue-500 to-[#391C71] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full flex items-center shadow-lg border border-white/20">
                      <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                      <span className="text-sm font-semibold text-gray-700">
                        {artist.rating}
                      </span>
                    </div>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="text-xs text-[#391C71] font-bold mb-3 uppercase tracking-wider">
                      {artist.category}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-3 text-xl group-hover:text-[#391C71] transition-colors duration-300">
                      {artist.name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 mb-5">
                      <MapPin className="w-4 h-4 mr-2 text-[#391C71]" />
                      {artist.location}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900 text-lg">
                        KD {artist.price}/{t('home.perHour')}
                      </span>
                      <span className="text-sm text-[#391C71] hover:text-[#5B2C87] font-semibold transition-colors duration-300">
                        {t('home.viewDetails')} →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/artists"
              className="inline-block bg-white border-2 border-[#391C71] text-[#391C71] px-10 py-4 rounded-full hover:bg-[#391C71] hover:text-white transition-all duration-500 font-medium shadow-xl hover:shadow-2xl hover:shadow-[#391C71]/20 hover:scale-105"
            >
              {t('home.viewAllArtists')}
            </Link>
          </div>
        </div>
      </section>

      {/* Book Equipment */}
      <section className="py-20 max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6 relative">
            {t('home.bookEquipment')}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-[#391C71] rounded-full" />
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {equipment.map((item, index) => (
            <Link key={item.id} href={`/equipments/${item.id}`} className="block group">
              <div
                className="bg-white rounded-3xl border border-gray-100 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[#391C71]/10 cursor-pointer transform hover:-translate-y-2 hover:scale-105"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative h-56 bg-gradient-to-br from-orange-400 to-yellow-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full flex items-center shadow-lg border border-white/20">
                    <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                    <span className="text-sm font-semibold text-gray-700">
                      {item.rating}
                    </span>
                  </div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-xs text-[#391C71] font-bold mb-3 uppercase tracking-wider">
                    {item.category}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3 text-xl group-hover:text-[#391C71] transition-colors duration-300">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mb-5">
                    <MapPin className="w-4 h-4 mr-2 text-[#391C71]" />
                    {item.location}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900 text-lg">
                      KD {item.price}/{t('home.perDay')}
                    </span>
                    <span className="text-sm text-[#391C71] hover:text-[#5B2C87] font-semibold transition-colors duration-300">
                      {t('home.details')} →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/equipments"
            className="inline-block bg-white border-2 border-[#391C71] text-[#391C71] px-10 py-4 rounded-full hover:bg-[#391C71] hover:text-white transition-all duration-500 font-medium shadow-xl hover:shadow-2xl hover:shadow-[#391C71]/20 hover:scale-105"
          >
            {t('home.viewAllEquipment')}
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
          <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
            {t('home.ctaTitle')}
          </h2>
          <p className="text-white/90 text-xl mb-12 max-w-3xl mx-auto leading-relaxed">
            {t('home.ctaSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/create-event"
              className="group px-10 py-4 bg-white text-[#391C71] rounded-full font-medium hover:bg-yellow-300 transition-all duration-500 shadow-2xl hover:scale-105 relative z-20"
            >
              <span className="group-hover:tracking-wider transition-all duration-300">
                {t('nav.createEvent')}
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

      {/* Testimonials */}
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
            {[
              {
                name: 'Sarah Johnson',
                role: 'Corporate Event Planner',
                content:
                  'Artistic transformed our annual corporate gala into something truly memorable. The attention to detail and flawless execution exceeded our expectations.',
                avatar: '/assets/images/testimonial1.jpg',
              },
              {
                name: 'Michael Chen',
                role: 'Wedding Organizer',
                content:
                  'Our wedding day was absolute perfection thanks to the Artistic team. Every moment was captured beautifully.',
                avatar: '/assets/images/testimonial2.jpg',
              },
              {
                name: 'Emma Rodriguez',
                role: 'Art Gallery Director',
                content:
                  'Artistic not only met but exceeded our standards. The space design complemented our artwork perfectly.',
                avatar: '/assets/images/testimonial3.jpg',
              },
            ].map((testimonial, idx) => (
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

      {/* Enhanced floating animations for watermark */}
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
      `}</style>
    </div>
  );
}