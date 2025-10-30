'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Heart,
  MapPin,
  Star,
  User,
  Music,
  Clock
} from 'lucide-react';
import { Navbar } from '@/components/main/Navbar';
import { Footer } from '@/components/main/Footer';
import { CalendarService, LikedArtist } from '@/services/calendar.service';
import { useAuthLogic } from '@/hooks/useAuth';
import { Link } from '@/i18n/routing';
import Image from 'next/image';

export default function CalendarPage() {
  const t = useTranslations();
  const { isAuthenticated, user } = useAuthLogic();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [likedArtists, setLikedArtists] = useState<LikedArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Calendar navigation
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

  // Fetch liked artists
  const fetchLikedArtists = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await CalendarService.getUserLikedArtists();
      if (response.success) {
        // Ensure we have valid artist data
        const validArtists = response.data.filter(artist => 
          artist && 
          artist._id && 
          artist.stageName && 
          typeof artist.stageName === 'string'
        );
        setLikedArtists(validArtists);
      } else {
        setError('Failed to load liked artists');
      }
    } catch (err) {
      console.error('Error fetching liked artists:', err);
      setError('Failed to load liked artists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLikedArtists();
  }, [isAuthenticated]);

  // Get calendar data
  const calendarDays = CalendarService.getCalendarDays(currentDate);
  const monthName = CalendarService.getMonthName(currentDate);
  const year = CalendarService.getYear(currentDate);
  const daysOfWeek = CalendarService.getDaysOfWeek();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white fade-in-up">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -left-10 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" style={{backgroundColor: 'rgb(57, 28, 113)'}}></div>
          <div className="absolute -top-10 -right-10 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" style={{backgroundColor: 'rgb(57, 28, 113)'}}></div>
          <div className="absolute -bottom-10 left-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" style={{backgroundColor: 'rgb(57, 28, 113)'}}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 rounded-2xl shadow-lg" style={{backgroundColor: 'rgb(57, 28, 113)'}}>
                <CalendarIcon className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6" style={{color: 'rgb(57, 28, 113)'}}>
              Your Calendar
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stay organized and keep track of your bookings with your favorite artists
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Calendar Section */}
            <div className="lg:col-span-3">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-2xl font-bold" style={{color: 'rgb(57, 28, 113)'}}>
                      {monthName} {year}
                    </h2>
                    <button
                      onClick={navigateToToday}
                      className="px-4 py-2 text-white rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105"
                      style={{backgroundColor: 'rgb(57, 28, 113)'}}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(47, 23, 93)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(57, 28, 113)'}
                    >
                      Today
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigateMonth('prev')}
                      className="p-2 rounded-lg border transition-colors duration-200"
                      style={{borderColor: 'rgb(57, 28, 113)', color: 'rgb(57, 28, 113)'}}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgb(57, 28, 113)';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'rgb(57, 28, 113)';
                      }}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => navigateMonth('next')}
                      className="p-2 rounded-lg border transition-colors duration-200"
                      style={{borderColor: 'rgb(57, 28, 113)', color: 'rgb(57, 28, 113)'}}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgb(57, 28, 113)';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'rgb(57, 28, 113)';
                      }}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Days of Week */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {daysOfWeek.map((day) => (
                    <div key={day} className="text-center py-3 text-sm font-medium" style={{color: 'rgb(57, 28, 113)'}}>
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => {
                    const isToday = CalendarService.isToday(day);
                    const isCurrentMonth = CalendarService.isCurrentMonth(day, currentDate);
                    const isPast = CalendarService.isPastDate(day);
                    const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();

                    let buttonStyle = {};
                    let className = "aspect-square p-2 text-sm rounded-lg transition-all duration-200 relative group calendar-day";

                    if (isToday) {
                      buttonStyle = {backgroundColor: 'rgb(57, 28, 113)', color: 'white'};
                      className += " shadow-lg ring-2 pulse-glow";
                    } else if (isSelected) {
                      buttonStyle = {backgroundColor: 'rgba(57, 28, 113, 0.1)', color: 'rgb(57, 28, 113)'};
                      className += " ring-2";
                    } else if (isCurrentMonth) {
                      buttonStyle = {color: 'rgb(57, 28, 113)'};
                      className += " hover:bg-gray-100";
                    } else {
                      buttonStyle = {color: '#9CA3AF'};
                      className += " hover:bg-gray-50";
                    }

                    if (isPast && !isToday) {
                      className += " opacity-50";
                    }

                    return (
                      <button
                        key={`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`}
                        onClick={() => setSelectedDate(day)}
                        className={className}
                        style={buttonStyle}
                      >
                        <span className={`${isToday ? 'font-bold' : 'font-medium'}`}>
                          {day.getDate()}
                        </span>
                        
                        {/* Event indicator dot (you can add logic for actual events here) */}
                        {isCurrentMonth && !isPast && Math.random() > 0.8 && (
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full" style={{backgroundColor: 'rgb(57, 28, 113)'}}></div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Selected Date Info */}
                {selectedDate && (
                  <div className="mt-8 p-6 rounded-2xl border" style={{backgroundColor: 'rgba(57, 28, 113, 0.05)', borderColor: 'rgba(57, 28, 113, 0.2)'}}>
                    <h3 className="text-lg font-semibold mb-2" style={{color: 'rgb(57, 28, 113)'}}>
                      {CalendarService.formatCalendarDate(selectedDate)}
                    </h3>
                    <p className="text-gray-600">
                      No events scheduled for this date. Book an artist to get started!
                    </p>
                    <div className="mt-4">
                      <Link
                        href="/artists"
                        className="inline-flex items-center px-4 py-2 text-white rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105"
                        style={{backgroundColor: 'rgb(57, 28, 113)'}}
                      >
                        <Music className="w-4 h-4 mr-2" />
                        Browse Artists
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Liked Artists Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 sticky top-24">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 rounded-lg" style={{backgroundColor: 'rgb(57, 28, 113)'}}>
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold" style={{color: 'rgb(57, 28, 113)'}}>Liked Artists</h3>
                </div>

                {!isAuthenticated ? (
                  <div className="text-center py-8">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Please sign in to see your liked artists</p>
                    <Link
                      href="/auth/signin"
                      className="inline-flex items-center px-4 py-2 text-white rounded-lg text-sm font-medium transition-all duration-300"
                      style={{backgroundColor: 'rgb(57, 28, 113)'}}
                    >
                      Sign In
                    </Link>
                  </div>
                ) : loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button
                      onClick={fetchLikedArtists}
                      className="font-medium"
                      style={{color: 'rgb(57, 28, 113)'}}
                    >
                      Try Again
                    </button>
                  </div>
                ) : likedArtists.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No liked artists yet</p>
                    <Link
                      href="/artists"
                      className="font-medium"
                      style={{color: 'rgb(57, 28, 113)'}}
                    >
                      Discover Artists
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {likedArtists.map((artist) => (
                        <Link
                          key={artist._id}
                          href={`/artist-profile/${artist._id}`}
                          className="block group"
                        >
                        <div 
                          className="flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 border border-transparent artist-card"
                          style={{
                            '--hover-bg': 'rgba(57, 28, 113, 0.05)',
                            '--hover-border': 'rgba(57, 28, 113, 0.2)'
                          } as any}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(57, 28, 113, 0.05)';
                            e.currentTarget.style.borderColor = 'rgba(57, 28, 113, 0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.borderColor = 'transparent';
                          }}
                        >
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full overflow-hidden" style={{backgroundColor: 'rgb(57, 28, 113)'}}>
                              {artist.profileImage ? (
                                <Image
                                  src={artist.profileImage}
                                  alt={artist.stageName}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <User className="w-6 h-6 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{backgroundColor: 'rgb(57, 28, 113)'}}>
                              <Heart className="w-2 h-2 text-white fill-current" />
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate transition-colors" style={{color: 'rgb(57, 28, 113)'}}>
                              {artist.stageName}
                            </h4>
                            {artist.location && (
                              <p className="text-xs text-gray-500 flex items-center mt-1">
                                <MapPin className="w-3 h-3 mr-1" />
                                {artist.location}
                              </p>
                            )}
                            {artist.likeCount && artist.likeCount > 0 && (
                              <p className="text-xs text-gray-500 flex items-center mt-1">
                                <Star className="w-3 h-3 mr-1 fill-current text-yellow-400" />
                                {artist.likeCount} likes
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}