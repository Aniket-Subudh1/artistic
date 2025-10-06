'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, MapPin, Star } from 'lucide-react';
import { Navbar } from '@/components/main/Navbar';
import { Footer } from '@/components/main/Footer';

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoSliding, setIsAutoSliding] = useState(true);

  const carouselSlides = [
    {
      image: '/assets/images/1.jpg',
      title: 'Discover Events in a',
      titleHighlight: 'Whole New Way!',
      subtitle: 'Join amazing events around you with just a few clicks. Explore diverse categories ranging from concerts to art showcases.'
    },
    {
      image: '/assets/images/3.jpg',
      title: 'Experience Live',
      titleHighlight: 'Music Concerts!',
      subtitle: 'Feel the rhythm and energy of live performances from world-class artists and emerging talents.'
    },
    {
      image: '/assets/images/5.jpg',
      title: 'Immerse in',
      titleHighlight: 'Art Exhibitions!',
      subtitle: 'Discover contemporary and classical artworks from renowned galleries and independent artists.'
    },
    {
      image: '/assets/images/7.jpg',
      title: 'Join Creative',
      titleHighlight: 'Workshops!',
      subtitle: 'Learn new skills and techniques from expert instructors in hands-on creative sessions.'
    }
  ];

  const featuredEvents = [
    {
      id: 1,
      image: '/assets/images/event1.jpg',
      category: 'Music',
      title: 'Jazz Fusion Night',
      description: 'Experience an evening of innovative jazz fusion from international artists',
      place: 'Blue Note Hall',
      price: 25,
      rating: 4.8
    },
    {
      id: 2,
      image: '/assets/images/event2.jpg',
      category: 'Art Exhibition',
      title: 'Contemporary Visions',
      description: 'A groundbreaking exhibition featuring works from emerging artists',
      place: 'Modern Art Gallery',
      price: 15,
      rating: 4.9
    },
    {
      id: 3,
      image: '/assets/images/event3.jpg',
      category: 'Theater',
      title: 'The Silent Echo',
      description: 'A powerful performance exploring themes of identity and connection',
      place: 'Aurora Theatre',
      price: 30,
      rating: 4.7
    },
    {
      id: 4,
      image: '/assets/images/event4.jpg',
      category: 'Workshop',
      title: 'Pottery Masterclass',
      description: 'Learn pottery techniques from expert ceramic artists',
      place: 'Creative Studio',
      price: 40,
      rating: 4.6
    }
  ];

  const artists = [
    {
      id: 1,
      image: '/assets/images/artist1.jpg',
      category: 'Photography',
      name: 'Sarah Mitchell',
      location: 'New York, USA',
      price: 150,
      rating: 4.9
    },
    {
      id: 2,
      image: '/assets/images/artist2.jpg',
      category: 'Music',
      name: 'Jazz Ensemble',
      location: 'London, UK',
      price: 200,
      rating: 4.8
    },
    {
      id: 3,
      image: '/assets/images/artist3.jpg',
      category: 'Dance',
      name: 'Modern Dance Troupe',
      location: 'Paris, France',
      price: 180,
      rating: 4.7
    },
    {
      id: 4,
      image: '/assets/images/artist4.jpg',
      category: 'Art',
      name: 'Contemporary Painter',
      location: 'Berlin, Germany',
      price: 120,
      rating: 4.8
    }
  ];

  const equipment = [
    {
      id: 1,
      image: '/assets/images/equipment1.jpg',
      category: 'Music',
      name: 'Grand Piano',
      description: 'Professional Steinway concert grand piano',
      location: 'Music Hall',
      price: 50,
      rating: 4.9
    },
    {
      id: 2,
      image: '/assets/images/equipment2.jpg',
      category: 'Audio',
      name: 'Sound System',
      description: 'Professional PA system with mixing console',
      location: 'Audio Studio',
      price: 35,
      rating: 4.8
    },
    {
      id: 3,
      image: '/assets/images/equipment3.jpg',
      category: 'Lighting',
      name: 'Stage Lighting',
      description: 'Complete LED stage lighting setup',
      location: 'Event Center',
      price: 40,
      rating: 4.7
    },
    {
      id: 4,
      image: '/assets/images/equipment4.jpg',
      category: 'Camera',
      name: 'Professional Camera',
      description: 'High-end video recording equipment',
      location: 'Media Studio',
      price: 45,
      rating: 4.8
    }
  ];

  useEffect(() => {
    if (!isAutoSliding) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoSliding, carouselSlides.length]);

  const nextSlide = () => {
    setIsAutoSliding(false);
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    setTimeout(() => setIsAutoSliding(true), 10000);
  };

  const prevSlide = () => {
    setIsAutoSliding(false);
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
    setTimeout(() => setIsAutoSliding(true), 10000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Carousel */}
      <section className="relative h-[600px] flex items-center justify-center pt-16 overflow-hidden">
        {/* Carousel Images */}
        <div className="absolute inset-0 w-full h-full">
          {carouselSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="w-full h-full bg-gradient-to-r from-purple-600 to-pink-500" />
              <div className="absolute inset-0 bg-black/40" />
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <button 
          onClick={prevSlide}
          className="absolute left-8 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-3 transition-all duration-300 hover:scale-110 z-10"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-8 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-3 transition-all duration-300 hover:scale-110 z-10"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {carouselSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentSlide(index);
                setIsAutoSliding(false);
                setTimeout(() => setIsAutoSliding(true), 10000);
              }}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative text-center text-white max-w-4xl px-4 z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            {carouselSlides[currentSlide].title}{' '}
            <br />
            <span className="text-yellow-300">
              {carouselSlides[currentSlide].titleHighlight}
            </span>
          </h1>
          <p className="text-lg mb-8 text-gray-200 max-w-2xl mx-auto">
            {carouselSlides[currentSlide].subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/join-us"
              className="px-8 py-3 border-2 border-white text-white rounded-full hover:bg-white hover:text-purple-600 transition-all duration-300"
            >
              Join Artistic
            </Link>
            <Link
              href="/events"
              className="px-8 py-3 bg-white text-purple-600 rounded-full hover:bg-yellow-300 transition-all duration-300"
            >
              Explore Events
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Events</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover amazing events happening around you
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {featuredEvents.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`} className="block">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer">
                <div className="relative h-48 bg-gradient-to-br from-purple-400 to-pink-400">
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span className="text-sm font-medium">{event.rating}</span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-xs text-purple-600 font-medium mb-2">{event.category}</div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">{event.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    {event.place}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">KD {event.price}</span>
                    <span className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Book Now
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
            className="inline-block border-2 border-purple-600 text-purple-600 px-8 py-3 rounded-full hover:bg-purple-600 hover:text-white transition-all duration-300 font-medium"
          >
            View All Events
          </Link>
        </div>
      </section>

      {/* Book Your Artist */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Book Your Artist</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find and book talented artists for your next event
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {artists.map((artist) => (
              <Link key={artist.id} href={`/artists/${artist.id}`} className="block">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer border border-gray-100">
                  <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-400">
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                      <span className="text-sm font-medium">{artist.rating}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-purple-600 font-medium mb-2">{artist.category}</div>
                    <h3 className="font-semibold text-gray-900 mb-2">{artist.name}</h3>
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      {artist.location}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">KD {artist.price}/hr</span>
                      <span className="text-sm text-purple-600 hover:text-purple-700">
                        View Details
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
              className="inline-block border-2 border-purple-600 text-purple-600 px-8 py-3 rounded-full hover:bg-purple-600 hover:text-white transition-all duration-300 font-medium"
            >
              View All Artists
            </Link>
          </div>
        </div>
      </section>

      {/* Book Equipment */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Book Equipment</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find the perfect equipment for your next performance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {equipment.map((item) => (
              <Link key={item.id} href={`/equipments/${item.id}`} className="block">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer">
                  <div className="relative h-48 bg-gradient-to-br from-yellow-400 to-orange-400">
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                      <span className="text-sm font-medium">{item.rating}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-purple-600 font-medium mb-2">{item.category}</div>
                    <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      {item.location}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">KD {item.price}/day</span>
                      <span className="text-sm text-purple-600 hover:text-purple-700">
                        Details
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
              className="inline-block border-2 border-purple-600 text-purple-600 px-8 py-3 rounded-full hover:bg-purple-600 hover:text-white transition-all duration-300 font-medium"
            >
              View All Equipment
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-500">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Create Something Extraordinary?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Let our team of experts bring your vision to life. Book a consultation today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/create-event"
              className="px-8 py-3 bg-white text-purple-600 rounded-full font-medium hover:bg-yellow-300 transition-all duration-300"
            >
              Create Event
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3 border-2 border-white text-white rounded-full hover:bg-white hover:text-purple-600 transition-all duration-300 font-medium"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hear from those who have experienced the Artistic difference
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Corporate Event Planner',
                content: 'Artistic transformed our annual corporate gala into something truly memorable. The attention to detail and flawless execution exceeded our expectations.',
                avatar: '/assets/images/testimonial1.jpg',
              },
              {
                name: 'Michael Chen',
                role: 'Wedding Organizer',
                content: 'Our wedding day was absolute perfection thanks to the Artistic team. Every moment was captured beautifully.',
                avatar: '/assets/images/testimonial2.jpg',
              },
              {
                name: 'Emma Rodriguez',
                role: 'Art Gallery Director',
                content: 'Artistic not only met but exceeded our standards. The space design complemented our artwork perfectly.',
                avatar: '/assets/images/testimonial3.jpg',
              },
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-purple-50 p-6 rounded-xl">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-lg">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-700 italic text-sm mb-4">
                  "{testimonial.content}"
                </p>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}