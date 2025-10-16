'use client';

import React, { useState } from 'react';
import { Calendar, Package, Users } from 'lucide-react';
import AdminArtistBookingManagement from './AdminArtistBookingManagement';
import AdminEquipmentBookingManagement from './AdminEquipmentBookingManagement';

export default function AdminBookingManagement() {
  const [activeTab, setActiveTab] = useState('artist-bookings');

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600 mt-1">
            Manage all artist and equipment bookings from one place
          </p>
        </div>
      </div>

      {/* Custom Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('artist-bookings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'artist-bookings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="h-4 w-4" />
            Artist Bookings
          </button>
          <button
            onClick={() => setActiveTab('equipment-bookings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'equipment-bookings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Package className="h-4 w-4" />
            Equipment Bookings
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'artist-bookings' && (
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Artist Booking Management
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                View and manage all artist bookings, track performance, and handle booking requests.
              </p>
            </div>
            <div className="p-6">
              <AdminArtistBookingManagement />
            </div>
          </div>
        )}

        {activeTab === 'equipment-bookings' && (
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Equipment Booking Management
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage equipment rentals, packages, and track equipment availability.
              </p>
            </div>
            <div className="p-6">
              <AdminEquipmentBookingManagement />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}