'use client';

import React, { useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';
import { MapPin, Star, Clock, Eye, User, SlidersHorizontal, X, DollarSign, Calendar } from 'lucide-react';
import { ArtistService, Artist } from '@/services/artist.service';
import Image from 'next/image';
import { TranslatedDataWrapper } from '@/components/ui/TranslatedDataWrapper';
import { TranslatableText } from '@/components/ui/TranslatableText';

interface PublicArtistsProps {
  limit?: number;
  showHeader?: boolean;
}

export default function PublicArtists({ limit = 8, showHeader = true }: PublicArtistsProps) {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [selectedDate, setSelectedDate] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setLoading(true);
        const response = await ArtistService.getAllArtists();
        // Filter only active and visible artists
        const activeArtists = response.filter(
          (artist) => 
            artist.user.isActive && 
            artist.user.role === 'ARTIST'
        );
        setArtists(activeArtists);
        setFilteredArtists(activeArtists);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(activeArtists.map(artist => artist.category).filter(Boolean))];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error('Error fetching artists:', err);
        setError('Failed to load artists');
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  // Apply filters whenever filter states change
  useEffect(() => {
    let filtered = artists;

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

    // Date filter (availability - this is a simplified check)
    // Note: Full date availability would require checking artist availability API
    if (selectedDate) {
      // For now, we'll keep all artists as we don't have availability data here
      // In a real scenario, you'd call an availability check API
    }

    setFilteredArtists(filtered);
  }, [artists, selectedCategory, priceRange, selectedDate]);

  const clearFilters = () => {
    setSelectedCategory('');
    setPriceRange({ min: 0, max: 1000 });
    setSelectedDate('');
  };

  const displayArtists = limit ? filteredArtists.slice(0, limit) : filteredArtists;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#391C71]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (artists.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">No active artists available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {showHeader && (
        <div className="text-center mb-8">
          <h2 className="text-5xl font-bold text-gray-900 mb-6 relative">
            <TranslatableText>Book Your Artist</TranslatableText>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-[#391C71] rounded-full" />
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            <TranslatableText>Discover talented artists ready to bring magic to your events</TranslatableText>
          </p>
        </div>
      )}

      {/* Category Filter - Always Visible */}
      <div className="mb-6">
        {/* Results count */}
        {(selectedCategory || priceRange.min > 0 || priceRange.max < 1000 || selectedDate) && (
          <div className="text-sm text-gray-600 mb-3 flex items-center gap-2">
            <span className="font-medium">Showing {filteredArtists.length} of {artists.length} artists</span>
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                {selectedCategory}
              </span>
            )}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <TranslatableText>Category</TranslatableText>
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 bg-white/80 border border-[#391C71]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#391C71]/50 text-gray-700"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white rounded-xl hover:from-[#5B2C87] hover:to-[#391C71] transition-all duration-300 shadow-lg"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>{showFilters ? 'Hide Filters' : 'More Filters'}</span>
            </button>
            
            {(selectedCategory || priceRange.min > 0 || priceRange.max < 1000 || selectedDate) && (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors duration-300"
                title="Clear all filters"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Additional Filters Panel */}
      {showFilters && (
        <div className="bg-gradient-to-r from-[#391C71]/5 to-purple-50 rounded-2xl p-6 border border-[#391C71]/20 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Price Range */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <TranslatableText>Price Range (KWD/hour)</TranslatableText>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                  className="w-1/2 px-3 py-2 bg-white/80 border border-[#391C71]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#391C71]/50"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                  className="w-1/2 px-3 py-2 bg-white/80 border border-[#391C71]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#391C71]/50"
                />
              </div>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <TranslatableText>Available Date</TranslatableText>
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 bg-white/80 border border-[#391C71]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#391C71]/50"
              />
            </div>
          </div>
        </div>
      )}

    <TranslatedDataWrapper 
      data={displayArtists}
      translateFields={['bio', 'description', 'specialization', 'category', 'performPreference', 'skills', 'about', 'musicLanguages', 'awards', 'genres', 'stageName']}
      preserveFields={['pricePerHour', 'country', 'profileImage', 'likeCount', '_id', 'user', 'yearsOfExperience', 'youtubeLink', 'createdAt', 'updatedAt']}
      showLoadingOverlay={false}
    >
      {(translatedArtists, isTranslating) => (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {(translatedArtists as Artist[]).map((artist, index) => (
              <Link key={artist._id} href={`/artist-profile/${artist._id}`} className="block group">
                <div
                  className="bg-white rounded-3xl border border-gray-100 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[#391C71]/10 cursor-pointer transform hover:-translate-y-2 hover:scale-105 h-[480px] flex flex-col"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Artist Image */}
                  <div className="relative h-56 bg-gradient-to-br from-blue-500 to-[#391C71] overflow-hidden flex-shrink-0">
                    {artist.profileImage ? (
                      <Image
                        src={artist.profileImage}
                        alt={artist.stageName}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-[#391C71] flex items-center justify-center">
                        <User className="w-16 h-16 text-white" />
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    
                    {/* Like Count Badge */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full flex items-center shadow-lg border border-white/20">
                      <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                      <span className="text-sm font-semibold text-gray-700">
                        {artist.likeCount || 0}
                      </span>
                    </div>

                    {/* Hover Effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </div>
                  </div>

                  {/* Artist Details */}
                  <div className="p-6 flex flex-col flex-1">
                    {/* Category Badge */}
                    <div className="mb-3">
                      <span className="inline-block bg-gradient-to-r from-[#391C71]/10 to-purple-100 text-[#391C71] px-3 py-1 rounded-full text-xs font-semibold border border-[#391C71]/20">
                        <TranslatableText>{artist.category || 'Artist'}</TranslatableText>
                      </span>
                    </div>

                    {/* Stage Name */}
                    <h3 className="font-bold text-gray-900 mb-3 text-xl group-hover:text-[#391C71] transition-colors duration-300 line-clamp-1">
                      {artist.stageName}
                    </h3>

                    {/* Performance Preference - Fixed height container */}
                    <div className="mb-3 h-6 flex-shrink-0">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-2 text-[#391C71] flex-shrink-0" />
                        <span className="capitalize line-clamp-1">
                          {artist.performPreference?.length > 0 
                            ? artist.performPreference.join(', ')
                            : <TranslatableText>Available</TranslatableText>}
                        </span>
                      </div>
                    </div>

                    {/* Location - Fixed height container */}
                    <div className="mb-5 h-6 flex-shrink-0">
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="w-4 h-4 mr-2 text-[#391C71] flex-shrink-0" />
                        <span className="line-clamp-1">
                          <TranslatableText>{artist.country || 'Kuwait'}</TranslatableText>
                        </span>
                      </div>
                    </div>

                    {/* Spacer to push footer content to bottom */}
                    <div className="flex-1"></div>

                    {/* Price and Action */}
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900 text-lg">
                        {artist.pricePerHour} <TranslatableText>KWD/hour</TranslatableText>
                      </span>
                      <span className="text-sm text-[#391C71] hover:text-[#5B2C87] font-semibold transition-colors duration-300 flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        <TranslatableText>View Details</TranslatableText>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {showHeader && (translatedArtists as Artist[]).length > 0 && (
            <div className="text-center mt-12">
              <Link
                href="/artists"
                className="inline-block bg-white border-2 border-[#391C71] text-[#391C71] px-10 py-4 rounded-full hover:bg-[#391C71] hover:text-white transition-all duration-500 font-medium shadow-xl hover:shadow-2xl hover:shadow-[#391C71]/20 hover:scale-105"
              >
                <TranslatableText>View All Artists</TranslatableText>
              </Link>
            </div>
          )}
        </>
      )}
    </TranslatedDataWrapper>
    </div>
  );
}