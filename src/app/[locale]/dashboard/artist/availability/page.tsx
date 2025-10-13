'use client';

import React from 'react';
import { AvailabilityCalendar } from '@/components/artist/AvailabilityCalendar';

export default function ArtistAvailabilityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
    
        {/* Calendar Component */}
        <AvailabilityCalendar className="shadow-2xl" />

        {/* Help Section */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            How to Use the Calendar
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">Setting Availability</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-sm font-bold rounded-full flex items-center justify-center">1</span>
                  <span>Click on any future date in the calendar</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-sm font-bold rounded-full flex items-center justify-center">2</span>
                  <span>Select specific hours when you're unavailable, or click "Select All Day"</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-sm font-bold rounded-full flex items-center justify-center">3</span>
                  <span>Click "Save Availability" to confirm your changes</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">Understanding Colors</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-sm"></div>
                  <span><strong className="text-emerald-700">Green:</strong> You are available all day</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-amber-500 rounded-full shadow-sm"></div>
                  <span><strong className="text-amber-700">Amber:</strong> You are partially unavailable</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full shadow-sm"></div>
                  <span><strong className="text-red-700">Red:</strong> You are unavailable all day</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-gray-400 rounded-full shadow-sm"></div>
                  <span><strong className="text-gray-700">Gray:</strong> Past dates (cannot be changed)</span>
                </li>
              </ul>
            </div>
          </div>

         </div>
      </div>
    </div>
  );
}