'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, CheckCircle, XCircle, Info, RefreshCw } from 'lucide-react';
import { artistAvailabilityService, UnavailabilitySlot, AvailabilityRecord } from '@/services/artist-availability.service';

interface AvailabilityStatus {
  [key: string]: {
    isFullDayUnavailable: boolean;
    unavailableHours: number[];
  };
}

interface CalendarProps {
  className?: string;
}

type ViewMode = 'month' | 'week';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS_OF_DAY = Array.from({ length: 24 }, (_, i) => i);

export const AvailabilityCalendar: React.FC<CalendarProps> = ({ className = '' }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<number[]>([]);
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isMarkingAvailable, setIsMarkingAvailable] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Get the first day of the current month
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startCalendarDate = new Date(firstDayOfMonth);
  startCalendarDate.setDate(startCalendarDate.getDate() - firstDayOfMonth.getDay());

  // Generate calendar days
  const calendarDays = [];
  const endCalendarDate = new Date(startCalendarDate);
  endCalendarDate.setDate(endCalendarDate.getDate() + 41); // 6 weeks
  
  for (let day = new Date(startCalendarDate); day <= endCalendarDate; day.setDate(day.getDate() + 1)) {
    calendarDays.push(new Date(day));
  }

  const formatDateKey = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const navigateToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPastDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentDate.getMonth();
  };

  const getDayStatus = (date: Date) => {
    const dateKey = formatDateKey(date);
    const status = availabilityStatus[dateKey];
    
    if (!status) return { type: 'available', label: 'Available' };
    
    if (status.isFullDayUnavailable) {
      return { type: 'unavailable', label: 'Unavailable (Full Day)' };
    }
    
    if (status.unavailableHours.length > 0) {
      return { 
        type: 'partial', 
        label: `Unavailable (${status.unavailableHours.length}h)` 
      };
    }
    
    return { type: 'available', label: 'Available' };
  };

  const handleDateClick = (date: Date) => {
    if (isPastDate(date)) return;
    
    setSelectedDate(date);
    const dateKey = formatDateKey(date);
    const status = availabilityStatus[dateKey];
    setSelectedTimeSlots(status?.unavailableHours || []);
  };

  const handleTimeSlotToggle = (hour: number) => {
    setSelectedTimeSlots(prev => {
      if (prev.includes(hour)) {
        return prev.filter(h => h !== hour);
      } else {
        return [...prev, hour].sort((a, b) => a - b);
      }
    });
  };

  const handleSelectAllDay = () => {
    if (selectedTimeSlots.length === 24) {
      setSelectedTimeSlots([]);
    } else {
      setSelectedTimeSlots(HOURS_OF_DAY);
    }
  };

  // Function to load/refresh availability data
  const loadAvailabilityData = async () => {
    setIsLoadingData(true);
    setError(null);
    
    try {
      // Check if user is authenticated
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      
      if (!token || !user) {
        throw new Error('Not authenticated. Please login again.');
      }
      
      const records = await artistAvailabilityService.getMyUnavailability();
      
      if (!Array.isArray(records)) {
        throw new Error('Invalid response format from server');
      }
      
      const statusMap: AvailabilityStatus = {};
      
      records.forEach((record) => {
        // Convert the date to the correct format (YYYY-MM-DD)
        const date = new Date(record.date);
        const dateKey = date.toISOString().split('T')[0];
        
        statusMap[dateKey] = {
          isFullDayUnavailable: record.hours.length === 24,
          unavailableHours: record.hours
        };
      });
      
      setAvailabilityStatus(statusMap);
      setIsBackendConnected(true);
      
      return true;
    } catch (err: any) {
      // Check if it's a backend connection issue
      if (err.message?.includes('Cannot GET') || 
          err.message?.includes('Network error') || 
          err.message?.includes('server unavailable') ||
          err.message?.includes('Failed to fetch') ||
          err.message?.includes('fetch')) {
        setIsBackendConnected(false);
        setError('Backend server is not connected. Please ensure the server is running on port 5000.');
      } else if (err.message?.includes('Not authenticated') || 
                 err.message?.includes('Unauthorized') ||
                 err.message?.includes('401')) {
        setError('Authentication expired. Please login again.');
      } else {
        setError(`Failed to load availability data: ${err.message || 'Unknown error'}`);
      }
      return false;
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSaveAvailability = async () => {
    if (!selectedDate) return;

    if (!isBackendConnected) {
      setError('Backend server is not connected. Please start the server to save your availability.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const dateKey = formatDateKey(selectedDate);
      const unavailabilityData: UnavailabilitySlot = {
        date: dateKey,
        hours: selectedTimeSlots.length === 24 ? undefined : selectedTimeSlots
      };

      await artistAvailabilityService.markUnavailableBulk({
        slots: [unavailabilityData]
      });

      // Refresh data from server instead of just updating local state
      await loadAvailabilityData();

      setSuccess('Availability updated successfully!');
      setSelectedDate(null);
      setSelectedTimeSlots([]);
    } catch (err: any) {
      setError(err.message || 'Failed to update availability');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsAvailable = async () => {
    if (!selectedDate) return;

    if (!isBackendConnected) {
      setError('Backend server is not connected. Please start the server to save your availability.');
      return;
    }

    setIsMarkingAvailable(true);
    setError(null);
    setSuccess(null);

    try {
      const dateKey = formatDateKey(selectedDate);
      const currentStatus = availabilityStatus[dateKey];
      
      if (!currentStatus) return;

      const unavailabilityData: UnavailabilitySlot = {
        date: dateKey,
        hours: selectedTimeSlots.length === 24 || selectedTimeSlots.length === 0 
          ? undefined 
          : selectedTimeSlots
      };

      await artistAvailabilityService.removeUnavailability({
        slots: [unavailabilityData]
      });

      // Refresh data from server instead of manual state management
      await loadAvailabilityData();

      setSuccess('Availability updated successfully!');
      setSelectedDate(null);
      setSelectedTimeSlots([]);
    } catch (err: any) {
      setError(err.message || 'Failed to update availability');
    } finally {
      setIsMarkingAvailable(false);
    }
  };

  // Clear messages after 3 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Load existing unavailability data on component mount
  useEffect(() => {
    loadAvailabilityData();
  }, []);

  const retryConnection = async () => {
    setError(null);
    const success = await loadAvailabilityData();
    if (success) {
      setSuccess('Successfully connected to backend server!');
    } else {
      setError('Still unable to connect to backend server.');
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl border border-gray-100 ${className}`}>
      {/* Header */}
      <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50 via-white to-purple-50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Availability Calendar
                </h2>
                <p className="text-sm text-gray-600 mt-1">Manage your professional schedule</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={navigateToToday}
              className="px-6 py-2.5 text-sm font-semibold text-blue-700 bg-blue-50 rounded-xl hover:bg-blue-100 border border-blue-200 transition-all duration-200 shadow-sm"
            >
              Today
            </button>
            <button
              onClick={loadAvailabilityData}
              disabled={isLoadingData}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-green-700 bg-green-50 rounded-xl hover:bg-green-100 border border-green-200 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin' : ''}`} />
              {isLoadingData ? 'Loading...' : 'Refresh'}
            </button>
            <div className="flex items-center bg-white rounded-xl p-1 shadow-sm border border-gray-200">
              <button
                onClick={() => setViewMode('month')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  viewMode === 'month'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  viewMode === 'week'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Week
              </button>
            </div>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-3 hover:bg-white hover:shadow-md rounded-xl transition-all duration-200 border border-transparent hover:border-gray-200"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <h3 className="text-2xl font-bold text-gray-900">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-3 hover:bg-white hover:shadow-md rounded-xl transition-all duration-200 border border-transparent hover:border-gray-200"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-6 mt-6 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-sm"></div>
            <span className="text-sm font-medium text-gray-700">Available</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-amber-500 rounded-full shadow-sm"></div>
            <span className="text-sm font-medium text-gray-700">Partially Unavailable</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
            <span className="text-sm font-medium text-gray-700">Unavailable</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-gray-400 rounded-full shadow-sm"></div>
            <span className="text-sm font-medium text-gray-700">Past Date</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      {(success || error || !isBackendConnected) && (
        <div className="px-8 py-4 border-b border-gray-100">
          {success && (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-3 shadow-sm">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span className="text-emerald-800 font-medium">{success}</span>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-3 shadow-sm">
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">{error}</span>
            </div>
          )}
          {!isBackendConnected && (
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl shadow-sm">
              <Info className="w-5 h-5 text-amber-600" />
              <div className="text-amber-800">
                <p className="font-semibold">Backend Server Not Connected</p>
                <p className="text-sm mb-3 mt-1">
                  The calendar is working in offline mode. Please start the backend server to save your availability settings.
                  <br />
                  <code className="bg-amber-100 px-2 py-1 rounded text-xs mt-2 inline-block font-mono">
                    cd artistic_backend && npm run start:dev
                  </code>
                </p>
                <button
                  onClick={retryConnection}
                  className="px-4 py-2 text-sm font-semibold text-amber-800 bg-amber-200 rounded-lg hover:bg-amber-300 transition-all duration-200 shadow-sm"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="p-8">
        {/* Main Content - Calendar and Time Selector Side by Side */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Calendar Section */}
          <div className="xl:col-span-2">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-2 mb-3">
              {DAYS_OF_WEEK.map(day => (
                <div key={day} className="p-3 text-center">
                  <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{day}</span>
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((date, index) => {
                const dayStatus = getDayStatus(date);
                const isSelected = selectedDate?.toDateString() === date.toDateString();
                const isPast = isPastDate(date);
                const isCurrent = isCurrentMonth(date);
                const isTodayDate = isToday(date);

                let bgColor = 'bg-white hover:bg-gray-50 border-gray-200';
                let textColor = 'text-gray-900';

                if (isPast) {
                  bgColor = 'bg-gray-50 border-gray-200';
                  textColor = 'text-gray-400';
                } else if (!isCurrent) {
                  textColor = 'text-gray-400';
                  bgColor = 'bg-gray-25 hover:bg-gray-50 border-gray-100';
                } else {
                  switch (dayStatus.type) {
                    case 'unavailable':
                      bgColor = 'bg-red-50 hover:bg-red-100 border-red-200';
                      textColor = 'text-red-900';
                      break;
                    case 'partial':
                      bgColor = 'bg-amber-50 hover:bg-amber-100 border-amber-200';
                      textColor = 'text-amber-900';
                      break;
                    case 'available':
                      bgColor = 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200';
                      textColor = 'text-emerald-900';
                      break;
                  }
                }

                if (isSelected) {
                  bgColor = 'bg-blue-600 border-blue-600';
                  textColor = 'text-white';
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleDateClick(date)}
                    disabled={isPast}
                    className={`
                      aspect-square p-2 border rounded-xl transition-all duration-200 
                      ${bgColor} ${textColor}
                      ${isPast ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-md hover:scale-105'}
                      ${isSelected ? 'ring-4 ring-blue-200 shadow-lg scale-105' : ''}
                      ${isTodayDate && !isSelected ? 'ring-2 ring-blue-400 shadow-md' : ''}
                    `}
                  >
                    <div className="w-full h-full flex flex-col items-center justify-center relative">
                      <span className={`text-sm font-semibold ${isTodayDate && !isSelected ? 'font-bold' : ''}`}>
                        {date.getDate()}
                      </span>
                      {dayStatus.type !== 'available' && !isPast && isCurrent && (
                        <div className={`w-1.5 h-1.5 rounded-full mt-1 ${
                          isSelected ? 'bg-white' : 
                          dayStatus.type === 'unavailable' ? 'bg-red-500' : 'bg-amber-500'
                        }`}></div>
                      )}
                      {isTodayDate && !isSelected && (
                        <div className="absolute -bottom-1 w-full h-0.5 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slot Selector */}
          {selectedDate && (
            <div className="xl:col-span-1">
              <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200 shadow-lg h-fit sticky top-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Time Slots
                      </h3>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {formatDisplayDate(selectedDate)}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSelectAllDay}
                  className="w-full mb-4 px-4 py-3 text-sm font-semibold text-blue-700 bg-blue-50 rounded-xl hover:bg-blue-100 border border-blue-200 transition-all duration-200 shadow-sm"
                >
                  {selectedTimeSlots.length === 24 ? 'Clear All Hours' : 'Select All Day'}
                </button>

                <div className="grid grid-cols-2 gap-2 mb-6 max-h-80 overflow-y-auto">
                  {HOURS_OF_DAY.map(hour => {
                    const isCurrentlyUnavailable = availabilityStatus[formatDateKey(selectedDate)]?.unavailableHours.includes(hour) || false;
                    const isSelected = selectedTimeSlots.includes(hour);
                    
                    let buttonStyle = '';
                    if (isSelected) {
                      buttonStyle = 'bg-blue-600 text-white border-blue-600 shadow-md';
                    } else if (isCurrentlyUnavailable) {
                      buttonStyle = 'bg-red-100 text-red-800 border-red-300';
                    } else {
                      buttonStyle = 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:shadow-sm';
                    }
                    
                    return (
                      <button
                        key={hour}
                        onClick={() => handleTimeSlotToggle(hour)}
                        className={`
                          p-3 text-sm font-semibold rounded-xl border transition-all duration-200
                          ${buttonStyle}
                        `}
                      >
                        <div className="flex flex-col items-center">
                          <span>{hour.toString().padStart(2, '0')}:00</span>
                          {isCurrentlyUnavailable && !isSelected && (
                            <span className="text-xs text-red-600 font-medium mt-1">Unavailable</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 p-3 bg-blue-50 rounded-xl">
                    <Info className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">
                      {selectedTimeSlots.length === 0 
                        ? 'Select hours to mark as unavailable'
                        : selectedTimeSlots.length === 24
                        ? 'Full day marked as unavailable'
                        : `${selectedTimeSlots.length} hour(s) marked as unavailable`
                      }
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => {
                        setSelectedDate(null);
                        setSelectedTimeSlots([]);
                      }}
                      className="w-full px-4 py-3 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 shadow-sm"
                    >
                      Cancel
                    </button>
                    
                    {/* Show Mark Available button if there are currently unavailable slots */}
                    {availabilityStatus[formatDateKey(selectedDate)]?.unavailableHours.length > 0 && (
                      <button
                        onClick={handleMarkAsAvailable}
                        disabled={isMarkingAvailable || selectedTimeSlots.length === 0}
                        className="w-full px-4 py-3 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:bg-gray-400 transition-all duration-200 shadow-md disabled:shadow-none"
                      >
                        {isMarkingAvailable ? 'Updating...' : 'Mark Available'}
                      </button>
                    )}
                    
                    <button
                      onClick={handleSaveAvailability}
                      disabled={isLoading || selectedTimeSlots.length === 0}
                      className="w-full px-4 py-3 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:bg-gray-400 transition-all duration-200 shadow-md disabled:shadow-none"
                    >
                      {isLoading ? 'Saving...' : 'Mark Unavailable'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty state when no date selected */}
          {!selectedDate && (
            <div className="xl:col-span-1">
              <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-200 shadow-lg h-fit text-center">
                <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Clock className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Select a Date</h3>
                <p className="text-sm text-gray-600">
                  Click on any future date in the calendar to manage your availability for that day.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};