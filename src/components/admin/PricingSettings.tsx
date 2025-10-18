'use client';

import React, { useState } from 'react';
import { Clock, DollarSign, Plus, Trash2, ToggleLeft, ToggleRight, Info } from 'lucide-react';

interface TimeSlotPricing {
  hour: number;
  rate: number;
}

interface PricingEntry {
  hours: number;
  amount: number;
}

interface PricingFormData {
  pricingMode: 'duration' | 'timeslot';
  // Legacy duration-based pricing
  privatePricing: PricingEntry[];
  publicPricing: PricingEntry[];
  workshopPricing: PricingEntry[];
  internationalPricing: PricingEntry[];
  // Time slot pricing
  privateTimeSlotPricing: TimeSlotPricing[];
  publicTimeSlotPricing: TimeSlotPricing[];
  workshopTimeSlotPricing: TimeSlotPricing[];
  internationalTimeSlotPricing: TimeSlotPricing[];
  // Base rates
  basePrivateRate: number;
  basePublicRate: number;
  baseWorkshopRate: number;
  baseInternationalRate: number;
}

interface ArtistSettingsData {
  cooldownPeriodHours: number;
  maximumPerformanceHours: number;
}

interface PricingSettingsProps {
  pricingForm: PricingFormData;
  setPricingForm: React.Dispatch<React.SetStateAction<PricingFormData>>;
  artistSettings: ArtistSettingsData;
  setArtistSettings: React.Dispatch<React.SetStateAction<ArtistSettingsData>>;
  userRole?: 'user' | 'artist' | 'admin'; // Add user role for access control
}

export function PricingSettings({
  pricingForm,
  setPricingForm,
  artistSettings,
  setArtistSettings,
  userRole = 'admin', // Default to admin for backward compatibility
}: PricingSettingsProps) {
  const [activeTab, setActiveTab] = useState<'private' | 'public' | 'workshop' | 'international'>('private');

  const performanceTypes = [
    { key: 'private', label: 'Private Events', color: 'purple' },
    { key: 'public', label: 'Public Events', color: 'blue' },
    { key: 'workshop', label: 'Workshops', color: 'green' },
    { key: 'international', label: 'International', color: 'orange' },
  ] as const;

  // Filter performance types based on user role
  const getAvailablePerformanceTypes = () => {
    if (userRole === 'user') {
      // Normal users can only book private performances
      return performanceTypes.filter(type => type.key === 'private');
    }
    return performanceTypes; // Artists and admins can see all types
  };

  const availablePerformanceTypes = getAvailablePerformanceTypes();

  const hourLabels = [
    '12 AM', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM', '6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM',
    '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM'
  ];

  const addDurationPricing = (type: string) => {
    const key = `${type}Pricing` as keyof PricingFormData;
    const currentPricing = pricingForm[key] as PricingEntry[];
    setPricingForm(prev => ({
      ...prev,
      [key]: [...currentPricing, { hours: 1, amount: 0 }],
    }));
  };

  const removeDurationPricing = (type: string, index: number) => {
    const key = `${type}Pricing` as keyof PricingFormData;
    const currentPricing = pricingForm[key] as PricingEntry[];
    setPricingForm(prev => ({
      ...prev,
      [key]: currentPricing.filter((_, i) => i !== index),
    }));
  };

  const updateDurationPricing = (type: string, index: number, field: 'hours' | 'amount', value: number) => {
    const key = `${type}Pricing` as keyof PricingFormData;
    const currentPricing = [...(pricingForm[key] as PricingEntry[])];
    currentPricing[index] = { ...currentPricing[index], [field]: value };
    setPricingForm(prev => ({
      ...prev,
      [key]: currentPricing,
    }));
  };

  const updateTimeSlotPricing = (type: string, hour: number, rate: number) => {
    const key = `${type}TimeSlotPricing` as keyof PricingFormData;
    const currentPricing = [...(pricingForm[key] as TimeSlotPricing[])];
    const existingIndex = currentPricing.findIndex(slot => slot.hour === hour);
    
    if (rate === 0 && existingIndex !== -1) {
      // Remove the time slot if rate is 0
      currentPricing.splice(existingIndex, 1);
    } else if (existingIndex !== -1) {
      // Update existing time slot
      currentPricing[existingIndex].rate = rate;
    } else if (rate > 0) {
      // Add new time slot
      currentPricing.push({ hour, rate });
      currentPricing.sort((a, b) => a.hour - b.hour);
    }

    setPricingForm(prev => ({
      ...prev,
      [key]: currentPricing,
    }));
  };

  const getTimeSlotRate = (type: string, hour: number): number => {
    const key = `${type}TimeSlotPricing` as keyof PricingFormData;
    const pricing = pricingForm[key] as TimeSlotPricing[];
    const slot = pricing.find(p => p.hour === hour);
    return slot?.rate || 0;
  };

  const updateBaseRate = (type: string, rate: number) => {
    const key = `base${type.charAt(0).toUpperCase() + type.slice(1)}Rate` as keyof PricingFormData;
    setPricingForm(prev => ({
      ...prev,
      [key]: rate,
    }));
  };

  const getBaseRate = (type: string): number => {
    const key = `base${type.charAt(0).toUpperCase() + type.slice(1)}Rate` as keyof PricingFormData;
    return pricingForm[key] as number;
  };

  return (
    <div className="space-y-8">
      {/* Artist Performance Settings */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              Cooldown Period (hours)
            </label>
            <input
              type="text"
              placeholder="Enter hours (1-24)"
              value={artistSettings.cooldownPeriodHours}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, ''); // Only allow numbers
                const numValue = parseInt(value) || 0;
                if (numValue <= 24) {
                  setArtistSettings(prev => ({
                    ...prev,
                    cooldownPeriodHours: numValue || 1
                  }));
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Hours to wait after a booking before next availability
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              Maximum Performance Hours
            </label>
            <input
              type="text"
              placeholder="Enter hours (1-12)"
              value={artistSettings.maximumPerformanceHours}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, ''); // Only allow numbers
                const numValue = parseInt(value) || 0;
                if (numValue <= 12) {
                  setArtistSettings(prev => ({
                    ...prev,
                    maximumPerformanceHours: numValue || 1
                  }));
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum consecutive hours per booking
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Mode Toggle */}
      <div className="bg-white border border-gray-200 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Pricing Structure</h3>
        <p className="text-sm text-gray-600 mb-4">
          Configure pricing for different types of performances. Each performance type serves different audiences and occasions, so you can set appropriate rates for each category.
        </p>
        <div className="flex items-center space-x-4 mb-6">
          <button
            type="button"
            onClick={() => setPricingForm(prev => ({ ...prev, pricingMode: 'duration' }))}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
              pricingForm.pricingMode === 'duration'
                ? 'bg-purple-100 border-purple-300 text-purple-700'
                : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {pricingForm.pricingMode === 'duration' ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
            <span>Duration-Based Pricing</span>
          </button>
          <button
            type="button"
            onClick={() => setPricingForm(prev => ({ ...prev, pricingMode: 'timeslot' }))}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
              pricingForm.pricingMode === 'timeslot'
                ? 'bg-purple-100 border-purple-300 text-purple-700'
                : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {pricingForm.pricingMode === 'timeslot' ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
            <span>Time Slot Pricing</span>
          </button>
        </div>

        {/* Performance Type Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex space-x-8 overflow-x-auto">
            {availablePerformanceTypes.map((type) => (
              <button
                key={type.key}
                type="button"
                onClick={() => setActiveTab(type.key)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === type.key
                    ? `border-${type.color}-500 text-${type.color}-600`
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
          {userRole === 'user' && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
              <Info className="w-4 h-4 inline mr-1" />
              As a user, you can only book private performances
            </div>
          )}
          
          {/* Performance Type Descriptions */}
          <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded text-sm">
            {activeTab === 'private' && (
              <div className="text-purple-700">
                <strong>Private Events:</strong> One-on-one or small group performances for personal occasions like birthdays, anniversaries, or private parties.
              </div>
            )}
            {activeTab === 'public' && (
              <div className="text-blue-700">
                <strong>Public Events:</strong> Large-scale performances for festivals, concerts, corporate events, or public gatherings with audiences.
              </div>
            )}
            {activeTab === 'workshop' && (
              <div className="text-green-700">
                <strong>Workshops:</strong> Educational sessions, training programs, or interactive learning experiences where you teach your artistic skills.
              </div>
            )}
            {activeTab === 'international' && (
              <div className="text-orange-700">
                <strong>International Events:</strong> Performances that require travel outside the country, including cultural exchanges and international festivals.
              </div>
            )}
          </div>
        </div>

        {/* Pricing Content */}
        {pricingForm.pricingMode === 'duration' ? (
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">
              {availablePerformanceTypes.find(t => t.key === activeTab)?.label} - Duration Pricing
            </h4>
            <div className="space-y-3">
              {(pricingForm[`${activeTab}Pricing`] as PricingEntry[]).map((pricing, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">Hours</label>
                    <input
                      type="number"
                      min="1"
                      value={pricing.hours}
                      onChange={(e) => updateDurationPricing(activeTab, index, 'hours', parseInt(e.target.value) || 1)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">Amount ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={pricing.amount}
                      onChange={(e) => updateDurationPricing(activeTab, index, 'amount', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDurationPricing(activeTab, index)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addDurationPricing(activeTab)}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Duration Tier</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">
              {availablePerformanceTypes.find(t => t.key === activeTab)?.label} - Time Slot Pricing
            </h4>
            
            {/* Base Rate */}
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-2" />
                Base Rate (for unspecified time slots)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={getBaseRate(activeTab)}
                onChange={(e) => updateBaseRate(activeTab, parseFloat(e.target.value) || 0)}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              <p className="text-xs text-gray-600 mt-1">
                This rate applies to time slots without specific pricing
              </p>
            </div>

            {/* Time Slot Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {hourLabels.map((label, hour) => (
                <div key={hour} className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs font-medium text-gray-600 mb-2">{label}</div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Rate"
                    value={getTimeSlotRate(activeTab, hour) || ''}
                    onChange={(e) => updateTimeSlotPricing(activeTab, hour, parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Tip:</strong> Leave time slots empty (or set to 0) to use the base rate. 
                Set specific rates for premium or discounted time periods.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}