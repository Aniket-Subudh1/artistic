'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ArtistService, Artist } from '@/services/artist.service';
import { TranslatedDataWrapper } from '@/components/ui/TranslatedDataWrapper';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Calendar,
  Music,
  User,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { Navbar } from '@/components/main/Navbar';
import { Footer } from '@/components/main/Footer';

export default function ArtistsPage() {
  const t = useTranslations();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [selectedDate, setSelectedDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Get unique categories for filter
  const [categories, setCategories] = useState<string[]>([]);

  const fetchArtists = async () => {
    try {
      setLoading(true);
      const data = await ArtistService.getAllArtists();
      const visibleArtists = data.filter(artist => artist.user.isActive);
      setArtists(visibleArtists);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(visibleArtists.map(artist => artist.category).filter(Boolean))];
      setCategories(uniqueCategories);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching artists:', err);
      setError('Failed to load artists');
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = artists;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(artist =>
        artist.stageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (artist.about && artist.about.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (artist.skills && artist.skills.some(skill => 
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(artist => artist.category === selectedCategory);
    }

    // Price range filter
    if (priceRange.min > 0 || priceRange.max < 1000) {
      filtered = filtered.filter(artist => {
        const price = artist.pricePerHour;
        return price >= priceRange.min && price <= priceRange.max;
      });
    }

    setFilteredArtists(filtered);
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [artists, searchTerm, selectedCategory, priceRange, selectedDate]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setPriceRange({ min: 0, max: 1000 });
    setSelectedDate('');
  };

  if (loading) {
    return (
      <div className="min-h-screen relative">
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
        <div className="relative z-10 flex flex-col min-h-screen">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#391C71] mx-auto mb-4"></div>
              <p className="text-gray-600">{t('artistsPage.loadingArtists')}</p>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative">
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
        <div className="relative z-10 flex flex-col min-h-screen">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Music className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('artistsPage.unableToLoad')}</h3>
              <p className="text-gray-500">{error}</p>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

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
      
      <div className="relative z-10 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#391C71]/20 to-transparent rounded-bl-full"></div>
              <div className="relative z-10">
                <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
                  <div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-full p-3">
                    <Music className="w-8 h-8 text-white" />
                  </div>
                  {t('artistsPage.title')}
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  {t('artistsPage.subtitle')}
                </p>
                <div className="mt-4 text-sm text-[#391C71] font-semibold">
                  {t('artistsPage.artistsCount', { filtered: filteredArtists.length, total: artists.length })}
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-8">
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-[#391C71]/10 to-transparent rounded-br-full"></div>
              <div className="relative z-10">
                
                {/* Search Bar */}
                <div className="flex flex-col lg:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('artistsPage.searchPlaceholder')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white/80 border border-[#391C71]/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#391C71]/50 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white rounded-2xl hover:from-[#5B2C87] hover:to-[#391C71] transition-all duration-300 shadow-lg"
                  >
                    <SlidersHorizontal className="w-5 h-5" />
                    {t('artistsPage.filters')}
                  </button>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                  <div className="bg-gradient-to-r from-[#391C71]/5 to-purple-50 rounded-2xl p-6 border border-[#391C71]/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      
                      {/* Category Filter */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">{t('artistsPage.category')}</label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full px-4 py-2 bg-white/80 border border-[#391C71]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#391C71]/50"
                        >
                          <option value="">{t('artistsPage.allCategories')}</option>
                          {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>

                      {/* Price Range */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t('artistsPage.priceRange')}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder={t('artistsPage.minPrice')}
                            value={priceRange.min}
                            onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                            className="w-full px-3 py-2 bg-white/80 border border-[#391C71]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#391C71]/50"
                          />
                          <input
                            type="number"
                            placeholder={t('artistsPage.maxPrice')}
                            value={priceRange.max}
                            onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                            className="w-full px-3 py-2 bg-white/80 border border-[#391C71]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#391C71]/50"
                          />
                        </div>
                      </div>

                      {/* Date Filter */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">{t('artistsPage.availableDate')}</label>
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-2 bg-white/80 border border-[#391C71]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#391C71]/50"
                        />
                      </div>

                      {/* Clear Filters */}
                      <div className="flex items-end">
                        <button
                          onClick={clearFilters}
                          className="w-full px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors duration-300 flex items-center justify-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          {t('artistsPage.clear')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Artists Grid */}
          {filteredArtists.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-12">
                <Music className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('artistsPage.noArtistsFound')}</h3>
                <p className="text-gray-500">{t('artistsPage.adjustFilters')}</p>
              </div>
            </div>
          ) : (
            <TranslatedDataWrapper
              data={filteredArtists}
              translateFields={['stageName', 'about', 'skills', 'category', 'bio', 'description', 'specialization', 'experience', 'genre', 'style', 'performPreference', 'musicLanguages', 'awards', 'genres']}
              preserveFields={['_id', 'profileImage', 'pricePerHour', 'yearsOfExperience', 'country', 'user', 'contactNumber', 'email', 'youtubeLink', 'createdAt', 'updatedAt']}
            >
              {(translatedArtists) => (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {translatedArtists.map((artist, index) => (
                <Link 
                  key={artist._id} 
                  href={`/artist-profile/${artist._id}`}
                  className="block group"
                >
                  <div
                    className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/30 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[#391C71]/10 cursor-pointer transform hover:-translate-y-2 hover:scale-105 h-[550px] flex flex-col"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Artist Image */}
                    <div className="relative h-56 overflow-hidden flex-shrink-0">
                      {artist.profileImage ? (
                        <Image
                          src={artist.profileImage}
                          alt={artist.stageName}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#391C71] to-[#5B2C87] flex items-center justify-center">
                          <User className="w-16 h-16 text-white" />
                        </div>
                      )}
                      
                      {/* Overlay effects */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      
                      {/* Hover shimmer effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      </div>
                    </div>

                    {/* Artist Content */}
                    <div className="p-6 flex flex-col flex-1">
                      {/* Category badge - moved outside image */}
                      <div className="mb-3">
                        <span className="inline-block bg-gradient-to-r from-[#391C71]/10 to-purple-100 text-[#391C71] px-3 py-1 rounded-full text-xs font-semibold border border-[#391C71]/20">
                          {artist.category}
                        </span>
                      </div>

                      {/* Stage Name */}
                      <h3 className="font-bold text-gray-900 mb-2 text-xl group-hover:text-[#391C71] transition-colors duration-300 line-clamp-1">
                        {artist.stageName}
                      </h3>
                      
                      {/* About - Fixed height container */}
                      <div className="mb-4 h-10 flex-shrink-0">
                        {artist.about && (
                          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                            {artist.about}
                          </p>
                        )}
                      </div>
                      
                      {/* Skills - Fixed height container */}
                      <div className="mb-4 h-6 flex-shrink-0">
                        {artist.skills && artist.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {artist.skills.slice(0, 2).map((skill, index) => (
                              <span 
                                key={index} 
                                className="inline-block px-2 py-1 bg-gradient-to-r from-[#391C71]/10 to-purple-100 text-[#391C71] text-xs rounded-lg border border-[#391C71]/20"
                              >
                                {skill}
                              </span>
                            ))}
                            {artist.skills.length > 2 && (
                              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                                {t('artistsPage.moreSkills', { count: artist.skills.length - 2 })}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Spacer to push footer content to bottom */}
                      <div className="flex-1"></div>
                      
                      {/* Location */}
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <MapPin className="w-4 h-4 mr-2 text-[#391C71]" />
                        <span>{artist.country || 'Kuwait'}</span>
                      </div>
                      
                      {/* Price and Experience */}
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-bold text-gray-900 text-md">
                            {artist.pricePerHour} KWD/hour
                          </span>
                          <div className="text-xs text-gray-500">
                            {artist.yearsOfExperience} {t('artistsPage.yearsExp')}
                          </div>
                        </div>
                        <span className="bg-[#391C71] text-white px-4 py-2 rounded-full text-sm font-medium group-hover:bg-[#5B2C87] transition-all duration-300 shadow-lg">
                          {t('artistsPage.bookNow')}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
                  ))}
                </div>
              )}
            </TranslatedDataWrapper>
          )}
        </div>
      </div>

      <Footer />
      
      <style jsx>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
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