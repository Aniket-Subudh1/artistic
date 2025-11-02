'use client';

import React from 'react';
import Image from 'next/image';
import EventListing from '@/components/public/EventListing';
import { Navbar } from '@/components/main/Navbar';
import { Footer } from '@/components/main/Footer';

export default function BoothEventsPage() {
  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/design.png"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 via-white/50 to-pink-50/80"></div>
      </div>
      
      <Navbar />
      
      <div className="relative z-10 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Book Your Booth
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Browse events that offer booth bookings. Events can appear in multiple categories if they support more than one booking type.
            </p>
          </div>
          
          <EventListing showFilters={true} bookingType="booth" disablePagination={true} limit={48} />
        </div>
      </div>
      
      <div className="mt-20">
        <Footer />
      </div>
    </div>
  );
}
