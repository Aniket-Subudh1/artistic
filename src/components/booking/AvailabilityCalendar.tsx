'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, DollarSign, AlertCircle, Info } from 'lucide-react';
import { ArtistService, DateAvailability, PerformanceType } from '@/services/artist.service';

interface AvailabilityData {
  [date: string]: number[]; 
}

interface TimeSlotInfo {
  hour: number;
  isAvailable: boolean;
  price: number;
  reason?: string;
  isSelected: boolean;
}

interface AvailabilityCalendarProps {
  // Legacy props (for backward compatibility)
  availability?: AvailabilityData;
  selectedDate: string;
  selectedStartTime: string;
  selectedEndTime: string;
  onDateSelect: (date: string) => void;
  onTimeSelect: (startTime: string, endTime: string, totalCost?: number) => void;
  onMonthChange: (month: number, year: number) => void;
  
  // New props for dynamic pricing
  artistProfileId?: string;
  performanceType?: PerformanceType;
  maxDuration?: number;
  showPricing?: boolean; // Whether to show pricing information
  userRole?: 'user' | 'artist' | 'admin'; // User role for access control
}

export function AvailabilityCalendar({
  availability: legacyAvailability,
  selectedDate,
  selectedStartTime,
  selectedEndTime,
  onDateSelect,
  onTimeSelect,
  onMonthChange,
  artistProfileId,
  performanceType = 'private', // Default to private for normal users
  maxDuration = 8,
  showPricing = true,
  userRole = 'user',
}: AvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<number[]>([]);
  const [dateAvailability, setDateAvailability] = useState<DateAvailability | null>(null);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [useDynamicPricing, setUseDynamicPricing] = useState(false);

  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);

  // Determine if we should use dynamic pricing or legacy availability
  useEffect(() => {
    setUseDynamicPricing(!!artistProfileId && showPricing);
  }, [artistProfileId, showPricing]);

  // Load dynamic availability for selected date
  useEffect(() => {
    if (selectedDate && artistProfileId && useDynamicPricing) {
      loadDateAvailability(selectedDate);
    }
  }, [selectedDate, artistProfileId, performanceType, useDynamicPricing]);

  // Legacy availability logging (keep for backward compatibility)
  useEffect(() => {
    if (!useDynamicPricing && legacyAvailability) {
      // Note: Availability data received
    }
  }, [legacyAvailability, selectedDate, useDynamicPricing]);

  // Update selected time slots when time selection changes
  useEffect(() => {
    if (selectedStartTime && selectedEndTime) {
      const startHour = parseInt(selectedStartTime.split(':')[0]);
      const endHour = parseInt(selectedEndTime.split(':')[0]);
      const slots = [];
      for (let hour = startHour; hour < endHour; hour++) {
        slots.push(hour);
      }
      setSelectedTimeSlots(slots);
      if (useDynamicPricing) {
        calculateTotalCost(slots);
      }
    } else {
      setSelectedTimeSlots([]);
      setTotalCost(0);
    }
  }, [selectedStartTime, selectedEndTime, dateAvailability, useDynamicPricing]);

  const loadDateAvailability = useCallback(async (date: string) => {
    if (!artistProfileId) return;
    
    // Prevent duplicate calls for the same date
    if (dateAvailability && dateAvailability.date === date) {
      return;
    }
    
    setIsLoadingAvailability(true);
    try {
      const availability = await ArtistService.getDateAvailability(
        artistProfileId,
        date,
        performanceType
      );
      
      setDateAvailability(availability);
    } catch (error) {
      console.error('Failed to load date availability');
      setDateAvailability(null);
    } finally {
      setIsLoadingAvailability(false);
    }
  }, [artistProfileId, performanceType, dateAvailability]);

  const calculateTotalCost = (timeSlots: number[]) => {
    if (!dateAvailability) {
      setTotalCost(0);
      return;
    }

    let cost = 0;
    timeSlots.forEach(hour => {
      const slot = dateAvailability.timeSlots.find(s => s.hour === hour);
      if (slot) {
        cost += slot.price;
      }
    });
    setTotalCost(cost);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    const today = new Date();
    
    if (direction === 'prev') {
      newDate.setMonth(currentMonth - 1);
      // Don't allow going to months before current month
      if (newDate.getFullYear() < today.getFullYear() || 
          (newDate.getFullYear() === today.getFullYear() && newDate.getMonth() < today.getMonth())) {
        return; // Don't navigate to past months
      }
    } else {
      newDate.setMonth(currentMonth + 1);
    }
    
    setCurrentDate(newDate);
    onMonthChange(newDate.getMonth() + 1, newDate.getFullYear());
  };

  const isDateAvailable = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const targetDate = new Date(dateStr + 'T00:00:00');
    const now = new Date();
    
    // Check if date is in the past
    if (targetDate < today) {
      return false;
    }
    
    // Check if date is within 24 hours from now
    const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    if (targetDate < twentyFourHoursLater) {
      return false;
    }
    
    // Use dynamic availability if artistProfileId is provided and date is selected
    if (useDynamicPricing && selectedDate === dateStr && dateAvailability) {
      const availableSlots = dateAvailability.timeSlots.filter(slot => slot.isAvailable);
      if (availableSlots.length === 0) {
        return false;
      }
      return true;
    }
    
    // Fallback to legacy availability check
    const unavailableHours = legacyAvailability?.[dateStr] || [];
    
    // If this date has unavailable hours, check if ALL hours are unavailable
    if (unavailableHours.length > 0) {
      // If all 24 hours are unavailable, the entire date is unavailable
      if (unavailableHours.length >= 24) {
        return false;
      } else {
        // Date is still selectable if some hours are available
        return true;
      }
    }
    
    return true;
  };

  const getAvailableTimeSlots = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const unavailableHours = legacyAvailability?.[dateStr] || [];
    const targetDate = new Date(dateStr);
    const now = new Date();
    
    // Filter out slots that are within 24 hours or unavailable
    return timeSlots.filter(hour => {
      // Check if this specific hour slot is unavailable
      if (unavailableHours.includes(hour)) {
        return false;
      }
      
      // Check if this specific hour is within 24 hours from now
      const slotDateTime = new Date(targetDate);
      slotDateTime.setHours(hour, 0, 0, 0);
      const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      if (slotDateTime < twentyFourHoursLater) {
        return false;
      }
      
      return true;
    });
  };

  const handleDateClick = (day: number) => {
    if (!isDateAvailable(day)) return;
    
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onDateSelect(dateStr);
    setSelectedTimeSlots([]);
  };

  const handleTimeSlotClick = async (hour: number) => {
    if (!selectedDate) return;
    
    // Check availability using dynamic data if available, otherwise use legacy
    let isUnavailable = false;
    let isWithin24Hours = false;
    
    if (useDynamicPricing && dateAvailability) {
      // Use dynamic availability data
      const slot = dateAvailability.timeSlots.find(s => s.hour === hour);
      isUnavailable = !slot?.isAvailable;
    } else {
      // Use legacy availability data
      const unavailableHours = legacyAvailability?.[selectedDate] || [];
      isUnavailable = unavailableHours.includes(hour);
    }
    
    // Check 24-hour rule regardless of availability source
    const targetDate = new Date(selectedDate);
    const slotDateTime = new Date(targetDate);
    slotDateTime.setHours(hour, 0, 0, 0);
    const now = new Date();
    const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    isWithin24Hours = slotDateTime < twentyFourHoursLater;
    
    // Don't allow selection if unavailable or within 24 hours
    if (isUnavailable || isWithin24Hours) {
      return;
    }

    let newSelectedSlots = [...selectedTimeSlots];
    
    if (newSelectedSlots.includes(hour)) {
      // Remove hour if already selected
      newSelectedSlots = newSelectedSlots.filter(h => h !== hour);
    } else {
      // Add hour to selection
      newSelectedSlots.push(hour);
      
      // Check maximum performance hours constraint
      if (useDynamicPricing && dateAvailability?.maxPerformanceHours) {
        if (newSelectedSlots.length > dateAvailability.maxPerformanceHours) {
          return; // Don't allow selection beyond max hours
        }
      }
    }
    
    // Sort and ensure contiguous selection
    newSelectedSlots.sort((a, b) => a - b);
    
    if (newSelectedSlots.length > 0) {
      const minHour = Math.min(...newSelectedSlots);
      const maxHour = Math.max(...newSelectedSlots);
      
      // Check if selection is contiguous and all slots are available
      const isContiguous = newSelectedSlots.length === (maxHour - minHour + 1);
      const allSlotsAvailable = newSelectedSlots.every(h => {
        const slotTime = new Date(targetDate);
        slotTime.setHours(h, 0, 0, 0);
        
        if (useDynamicPricing && dateAvailability) {
          const slot = dateAvailability.timeSlots.find(s => s.hour === h);
          return slot?.isAvailable && slotTime >= twentyFourHoursLater;
        } else {
          const unavailableHours = legacyAvailability?.[selectedDate] || [];
          return !unavailableHours.includes(h) && slotTime >= twentyFourHoursLater;
        }
      });
      
      if (isContiguous && allSlotsAvailable) {
        // Additional validation for consecutive booking constraints
        if (useDynamicPricing && artistProfileId) {
          try {
            const validation = await ArtistService.validateConsecutiveBooking(
              artistProfileId,
              selectedDate,
              minHour,
              newSelectedSlots.length
            );
            
            if (!validation.isValid) {
              return;
            }
          } catch (error) {
            console.error('Validation error');
            return;
          }
        }
        
        setSelectedTimeSlots(newSelectedSlots);
        const startTime = `${String(minHour).padStart(2, '0')}:00`;
        const endTime = `${String(maxHour + 1).padStart(2, '0')}:00`;
        
        // Pass total cost if using dynamic pricing
        if (useDynamicPricing && totalCost > 0) {
          onTimeSelect(startTime, endTime, totalCost);
        } else {
          onTimeSelect(startTime, endTime);
        }
      }
    } else {
      setSelectedTimeSlots([]);
      onTimeSelect('', '');
    }
  };

  const getSlotAvailability = (hour: number) => {
    if (useDynamicPricing && dateAvailability) {
      const slot = dateAvailability.timeSlots.find(s => s.hour === hour);
      return {
        isUnavailable: !slot?.isAvailable,
        reason: slot?.reason,
        price: slot?.price || 0
      };
    } else {
      const unavailableHours = legacyAvailability?.[selectedDate] || [];
      return {
        isUnavailable: unavailableHours.includes(hour),
        reason: undefined,
        price: 0
      };
    }
  };

  const formatTimeSlot = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const formatTime24 = (hour: number) => {
    return `${String(hour).padStart(2, '0')}:00`;
  };

  const isSlotWithin24Hours = (hour: number) => {
    if (!selectedDate) return false;
    const targetDate = new Date(selectedDate);
    const slotDateTime = new Date(targetDate);
    slotDateTime.setHours(hour, 0, 0, 0);
    const now = new Date();
    const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    return slotDateTime < twentyFourHoursLater;
  };

  const getTimeSlotClass = (hour: number, isUnavailable: boolean, isSelected: boolean, isWithin24Hours: boolean = false) => {
    if (isSelected) {
      return 'bg-purple-600 text-white border-purple-600 shadow-md';
    }
    
    if (isUnavailable || isWithin24Hours) {
      return 'bg-red-50 text-red-500 border-red-200 cursor-not-allowed opacity-75';
    }
    
    // Different colors for different time periods
    if (hour >= 6 && hour < 12) {
      // Morning slots - light blue
      return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300';
    } else if (hour >= 12 && hour < 18) {
      // Afternoon slots - light green
      return 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300';
    } else if (hour >= 18 && hour < 22) {
      // Evening slots - light orange
      return 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 hover:border-orange-300';
    } else {
      // Night/early morning slots - light gray
      return 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
      {/* Calendar Header */}
      <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Select Date & Time</h3>
            <p className="text-sm text-gray-600 mt-1">Choose your preferred booking slot</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-white hover:shadow-md rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              disabled={
                currentMonth === today.getMonth() && 
                currentYear === today.getFullYear()
              }
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
              <span className="text-sm font-semibold text-gray-800">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-white hover:shadow-md rounded-lg transition-all duration-200"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Calendar Grid */}
        <div className="mb-8">
          <div className="grid grid-cols-7 gap-1 mb-3">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
              <div key={day} className="text-center text-sm font-semibold text-gray-600 py-3">
                <div className="hidden sm:block">{day}</div>
                <div className="sm:hidden">{day.slice(0, 3)}</div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth(currentDate).map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="p-3"></div>;
              }
              
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isAvailable = isDateAvailable(day);
              const isSelected = selectedDate === dateStr;
              const availableSlots = getAvailableTimeSlots(day);
              const hasAvailability = availableSlots.length > 0;
              const isToday = new Date().toDateString() === new Date(dateStr).toDateString();
              
              // Check if completely unavailable
              const unavailableHours = legacyAvailability?.[dateStr] || [];
              const isCompletelyUnavailable = unavailableHours.length >= 24;
              
              return (
                <button
                  key={`day-${currentYear}-${currentMonth}-${day}`}
                  onClick={() => handleDateClick(day)}
                  disabled={!isAvailable || !hasAvailability}
                  className={`
                    p-3 text-sm rounded-xl transition-all duration-200 relative
                    ${isSelected 
                      ? 'bg-purple-600 text-white shadow-lg transform scale-105' 
                      : isAvailable && hasAvailability
                        ? 'hover:bg-purple-100 text-gray-900 hover:shadow-md hover:transform hover:scale-105'
                        : isCompletelyUnavailable
                          ? 'bg-red-100 text-red-600 cursor-not-allowed border border-red-300'
                          : 'text-gray-400 cursor-not-allowed'
                    }
                    ${!hasAvailability && isAvailable && !isCompletelyUnavailable ? 'bg-red-50 text-red-400' : ''}
                    ${isToday && !isSelected ? 'bg-blue-50 border-2 border-blue-200 font-semibold' : ''}
                  `}
                  title={isCompletelyUnavailable ? 'Artist is not available on this date' : undefined}
                >
                  <span className="block">{day}</span>
                  {isCompletelyUnavailable && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✕</span>
                    </div>
                  )}
                  {isToday && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Slots */}
        {selectedDate && (
          <div>
            {/* Dynamic Pricing Info Banner */}
            {useDynamicPricing && showPricing && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <Info className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-sm text-blue-800">
                    Dynamic pricing active - prices may vary by time slot. Artist availability includes performance constraints and cooldown periods.
                  </span>
                </div>
                {isLoadingAvailability && (
                  <div className="mt-2 flex items-center text-sm text-blue-600">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                    Loading availability and pricing...
                  </div>
                )}
              </div>
            )}
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">
                  Available time slots for {new Date(selectedDate).toLocaleDateString()}
                </span>
              </div>
              
              {/* Legend */}
              <div className="flex items-center space-x-3 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded mr-1"></div>
                  <span className="text-gray-600">Morning</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-100 border border-green-200 rounded mr-1"></div>
                  <span className="text-gray-600">Afternoon</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-100 border border-orange-200 rounded mr-1"></div>
                  <span className="text-gray-600">Evening</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-100 border border-red-200 rounded mr-1"></div>
                  <span className="text-gray-600">Unavailable</span>
                </div>
              </div>
            </div>
            
            {/* 24-hour notice */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center text-blue-800">
                <Clock className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">
                  Bookings must be made at least 24 hours in advance
                </span>
              </div>
            </div>
            
            {/* Time Grid - organized by time periods */}
            <div className="space-y-4">
              
              {/* Night/Early Morning (00:00 - 05:00) */}
              <div>
                <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                  Night/Early Morning (12:00 AM - 5:00 AM)
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {timeSlots.slice(0, 6).map(hour => {
                    const slotInfo = getSlotAvailability(hour);
                    const isSelected = selectedTimeSlots.includes(hour);
                    const isWithin24Hours = isSlotWithin24Hours(hour);
                    const isDisabled = slotInfo.isUnavailable || isWithin24Hours;
                    
                    return (
                      <button
                        key={hour}
                        onClick={() => handleTimeSlotClick(hour)}
                        disabled={isDisabled}
                        className={`
                          p-3 text-xs rounded-lg border-2 transition-all duration-200 font-medium relative
                          ${getTimeSlotClass(hour, slotInfo.isUnavailable, isSelected, isWithin24Hours)}
                        `}
                      >
                        <div className="text-center">
                          <div className="font-semibold">{formatTime24(hour)}</div>
                          <div className="text-[10px] opacity-75">{formatTimeSlot(hour)}</div>
                          {showPricing && slotInfo.price > 0 && (
                            <div className="text-[9px] text-green-600 font-bold">
                              {slotInfo.price} KWD
                            </div>
                          )}
                          {slotInfo.isUnavailable && !isWithin24Hours && (
                            <div className="absolute top-0 right-0 w-2 h-2 bg-red-600 rounded-full"></div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Morning (06:00 - 11:00) */}
              <div>
                <h4 className="text-xs font-medium text-blue-600 mb-2 uppercase tracking-wide">
                  Morning (6:00 AM - 11:00 AM)
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {timeSlots.slice(6, 12).map(hour => {
                    const slotInfo = getSlotAvailability(hour);
                    const isSelected = selectedTimeSlots.includes(hour);
                    const isWithin24Hours = isSlotWithin24Hours(hour);
                    const isDisabled = slotInfo.isUnavailable || isWithin24Hours;
                    
                    return (
                      <button
                        key={hour}
                        onClick={() => handleTimeSlotClick(hour)}
                        disabled={isDisabled}
                        className={`
                          p-3 text-xs rounded-lg border-2 transition-all duration-200 font-medium
                          ${getTimeSlotClass(hour, slotInfo.isUnavailable, isSelected, isWithin24Hours)}
                        `}
                      >
                        <div className="text-center">
                          <div className="font-semibold">{formatTime24(hour)}</div>
                          <div className="text-[10px] opacity-75">{formatTimeSlot(hour)}</div>
                          {showPricing && slotInfo.price > 0 && (
                            <div className="text-[9px] text-green-600 font-bold">
                              {slotInfo.price} KWD
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Afternoon (12:00 - 17:00) */}
              <div>
                <h4 className="text-xs font-medium text-green-600 mb-2 uppercase tracking-wide">
                  Afternoon (12:00 PM - 5:00 PM)
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {timeSlots.slice(12, 18).map(hour => {
                    const slotInfo = getSlotAvailability(hour);
                    const isSelected = selectedTimeSlots.includes(hour);
                    const isWithin24Hours = isSlotWithin24Hours(hour);
                    const isDisabled = slotInfo.isUnavailable || isWithin24Hours;
                    
                    return (
                      <button
                        key={hour}
                        onClick={() => handleTimeSlotClick(hour)}
                        disabled={isDisabled}
                        className={`
                          p-3 text-xs rounded-lg border-2 transition-all duration-200 font-medium
                          ${getTimeSlotClass(hour, slotInfo.isUnavailable, isSelected, isWithin24Hours)}
                        `}
                      >
                        <div className="text-center">
                          <div className="font-semibold">{formatTime24(hour)}</div>
                          <div className="text-[10px] opacity-75">{formatTimeSlot(hour)}</div>
                          {showPricing && slotInfo.price > 0 && (
                            <div className="text-[9px] text-green-600 font-bold">
                              {slotInfo.price} KWD
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Evening (18:00 - 21:00) */}
              <div>
                <h4 className="text-xs font-medium text-orange-600 mb-2 uppercase tracking-wide">
                  Evening (6:00 PM - 9:00 PM)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {timeSlots.slice(18, 22).map(hour => {
                    const slotInfo = getSlotAvailability(hour);
                    const isSelected = selectedTimeSlots.includes(hour);
                    const isWithin24Hours = isSlotWithin24Hours(hour);
                    const isDisabled = slotInfo.isUnavailable || isWithin24Hours;
                    
                    return (
                      <button
                        key={hour}
                        onClick={() => handleTimeSlotClick(hour)}
                        disabled={isDisabled}
                        className={`
                          p-3 text-xs rounded-lg border-2 transition-all duration-200 font-medium
                          ${getTimeSlotClass(hour, slotInfo.isUnavailable, isSelected, isWithin24Hours)}
                        `}
                      >
                        <div className="text-center">
                          <div className="font-semibold">{formatTime24(hour)}</div>
                          <div className="text-[10px] opacity-75">{formatTimeSlot(hour)}</div>
                          {showPricing && slotInfo.price > 0 && (
                            <div className="text-[9px] text-green-600 font-bold">
                              {slotInfo.price} KWD
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Late Night (22:00 - 23:00) */}
              <div>
                <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                  Late Night (10:00 PM - 11:00 PM)
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {timeSlots.slice(22, 24).map(hour => {
                    const slotInfo = getSlotAvailability(hour);
                    const isSelected = selectedTimeSlots.includes(hour);
                    const isWithin24Hours = isSlotWithin24Hours(hour);
                    const isDisabled = slotInfo.isUnavailable || isWithin24Hours;
                    
                    return (
                      <button
                        key={hour}
                        onClick={() => handleTimeSlotClick(hour)}
                        disabled={isDisabled}
                        className={`
                          p-3 text-xs rounded-lg border-2 transition-all duration-200 font-medium
                          ${getTimeSlotClass(hour, slotInfo.isUnavailable, isSelected, isWithin24Hours)}
                        `}
                      >
                        <div className="text-center">
                          <div className="font-semibold">{formatTime24(hour)}</div>
                          <div className="text-[10px] opacity-75">{formatTimeSlot(hour)}</div>
                          {showPricing && slotInfo.price > 0 && (
                            <div className="text-[9px] text-green-600 font-bold">
                              {slotInfo.price} KWD
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {selectedTimeSlots.length > 0 && (
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-800">
                      Selected Time Slot
                    </p>
                    <p className="text-lg font-bold text-purple-900">
                      {formatTimeSlot(Math.min(...selectedTimeSlots))} - {formatTimeSlot(Math.max(...selectedTimeSlots) + 1)}
                    </p>
                    <p className="text-xs text-purple-600">
                      Duration: {selectedTimeSlots.length} hour{selectedTimeSlots.length > 1 ? 's' : ''}
                      {useDynamicPricing && dateAvailability?.maxPerformanceHours && (
                        <span className="ml-2 text-xs">
                          (Max: {dateAvailability.maxPerformanceHours} hours)
                        </span>
                      )}
                      {useDynamicPricing && dateAvailability?.maxPerformanceHours && 
                       selectedTimeSlots.length === dateAvailability.maxPerformanceHours && (
                        <span className="ml-2 text-xs text-amber-600 font-medium">
                          ⚠️ Maximum reached
                        </span>
                      )}
                    </p>
                    {useDynamicPricing && totalCost > 0 && (
                      <p className="text-lg font-bold text-green-600 mt-2">
                        <DollarSign className="w-4 h-4 inline mr-1" />
                        Total: {totalCost} KWD
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}