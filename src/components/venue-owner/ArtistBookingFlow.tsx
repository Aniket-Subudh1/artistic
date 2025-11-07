'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  User, 
  Calendar, 
  DollarSign, 
  Clock, 
  Star, 
  Plus, 
  X, 
  ChevronDown,
  ChevronUp,
  Music,
  Eye,
  CheckCircle2,
  Camera,
  Upload
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { Artist, ArtistService, DateAvailability, PerformanceType } from '@/services/artist.service';

interface ArtistBookingFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onArtistsSelected: (artists: SelectedArtist[]) => void;
  selectedArtists: SelectedArtist[];
  eventDate: string;
  eventStartTime: string;
  eventEndTime: string;
  performanceType: string;
}

export interface SelectedArtist {
  artistId: string;
  artistName: string;
  artistPhoto?: string;
  fee: number;
  isCustomArtist: boolean;
  customArtistName?: string;
  customArtistPhoto?: string;
  customArtistPhotoFile?: File; // Add actual file for upload
  notes?: string;
}

interface ArtistWithAvailability extends Artist {
  isAvailable?: boolean;
  estimatedFee?: number;
  availabilityReason?: string;
}

const PERFORMANCE_TYPE_MAP: Record<string, PerformanceType> = {
  'Music Concert': 'public',
  'Theater': 'public',
  'Dance': 'public',
  'Comedy': 'public',
  'Magic Show': 'public',
  'Opera': 'public',
  'Ballet': 'public',
  'Jazz': 'public',
  'Rock': 'public',
  'Pop': 'public',
  'Classical': 'public',
  'Festival': 'public',
  'Workshop': 'workshop',
  'Conference': 'workshop',
  'Exhibition': 'public',
  'Other': 'public'
};

export default function ArtistBookingFlow({
  isOpen,
  onClose,
  onArtistsSelected,
  selectedArtists,
  eventDate,
  eventStartTime,
  eventEndTime,
  performanceType
}: ArtistBookingFlowProps) {
  const [artists, setArtists] = useState<ArtistWithAvailability[]>([]);
  const [filteredArtists, setFilteredArtists] = useState<ArtistWithAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  
  // Selection states
  const [tempSelectedArtists, setTempSelectedArtists] = useState<SelectedArtist[]>(selectedArtists);
  const [showArtistDetails, setShowArtistDetails] = useState<string | null>(null);
  const [showCustomArtistForm, setShowCustomArtistForm] = useState(false);
  
  // Custom artist form
  const [customArtistForm, setCustomArtistForm] = useState({
    name: '',
    fee: '',
    notes: '',
    description: ''
  });
  const [customArtistPhoto, setCustomArtistPhoto] = useState<File | null>(null);
  const [customArtistPhotoPreview, setCustomArtistPhotoPreview] = useState<string>('');

  // Load artists and check availability
  useEffect(() => {
    if (isOpen) {
      loadArtistsWithAvailability();
    }
  }, [isOpen, eventDate, eventStartTime, eventEndTime, performanceType]);

  // Sync tempSelectedArtists with selectedArtists prop when dialog opens
  useEffect(() => {
    if (isOpen) {
      setTempSelectedArtists(selectedArtists);
    }
  }, [isOpen, selectedArtists]);

  // Filter artists based on search and filters
  useEffect(() => {
    let filtered = [...artists];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(artist => 
        artist.stageName.toLowerCase().includes(term) ||
        artist.user.firstName.toLowerCase().includes(term) ||
        artist.user.lastName.toLowerCase().includes(term) ||
        artist.category.toLowerCase().includes(term) ||
        artist.skills.some(skill => skill.toLowerCase().includes(term))
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(artist => artist.category === categoryFilter);
    }

    // Availability filter
    if (availabilityFilter === 'available') {
      filtered = filtered.filter(artist => artist.isAvailable);
    } else if (availabilityFilter === 'unavailable') {
      filtered = filtered.filter(artist => !artist.isAvailable);
    }

    // Price range filter
    if (priceRange.min || priceRange.max) {
      filtered = filtered.filter(artist => {
        const fee = artist.estimatedFee || artist.pricePerHour;
        const min = parseFloat(priceRange.min) || 0;
        const max = parseFloat(priceRange.max) || Infinity;
        return fee >= min && fee <= max;
      });
    }

    setFilteredArtists(filtered);
  }, [artists, searchTerm, categoryFilter, availabilityFilter, priceRange]);

  const loadArtistsWithAvailability = async () => {
    if (!eventDate || !eventStartTime || !eventEndTime) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get artists by performance preference
      const performanceTypeKey = PERFORMANCE_TYPE_MAP[performanceType] || 'public';
      const allArtists = await ArtistService.getArtistsByPerformanceType(performanceTypeKey);

      console.log('[ArtistBooking] Raw artists from API:', allArtists.map(a => ({
        name: a.stageName,
        pricePerHour: a.pricePerHour,
        pricePerHourType: typeof a.pricePerHour,
        pricePerHourValue: JSON.stringify(a.pricePerHour)
      })));

      // Check availability and calculate pricing for each artist
      const artistsWithAvailability = await Promise.all(
        allArtists.map(async (artist) => {
          try {
            // Calculate event duration in hours
            const startTime = new Date(`${eventDate}T${eventStartTime}`);
            const endTime = new Date(`${eventDate}T${eventEndTime}`);
            const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
            const durationHours = Math.max(1, Math.ceil(duration)); // Minimum 1 hour

            // Check availability
            const availability = await ArtistService.checkAvailability(
              artist._id,
              eventDate,
              startTime.getHours(),
              durationHours
            );

            // Calculate cost - use at least 1 hour to ensure we show the base rate
            let estimatedFee = Number(artist.pricePerHour) * durationHours;
            
            if (availability.isAvailable) {
              try {
                const costCalculation = await ArtistService.calculateBookingCost(
                  artist._id,
                  performanceTypeKey,
                  startTime.getHours(),
                  durationHours
                );
                // Ensure we have a valid cost
                estimatedFee = costCalculation.totalCost > 0 ? Number(costCalculation.totalCost) : estimatedFee;
              } catch (costError) {
                // Fallback to basic calculation if cost API fails
                console.warn('Cost calculation failed, using fallback:', costError);
              }
            }

            return {
              ...artist,
              pricePerHour: Number(artist.pricePerHour), // Ensure it's a number
              isAvailable: availability.isAvailable,
              estimatedFee,
              availabilityReason: availability.reason
            };
          } catch (error) {
            console.warn(`Failed to check availability for artist ${artist._id}:`, error);
            return {
              ...artist,
              pricePerHour: Number(artist.pricePerHour), // Ensure it's a number
              isAvailable: false,
              estimatedFee: Number(artist.pricePerHour) * 2, // Fallback estimate
              availabilityReason: 'Unable to check availability'
            };
          }
        })
      );

      console.log('[ArtistBooking] Artists loaded with pricing:', artistsWithAvailability.map(a => ({
        name: a.stageName,
        pricePerHour: a.pricePerHour,
        estimatedFee: a.estimatedFee,
        isAvailable: a.isAvailable
      })));

      setArtists(artistsWithAvailability);
    } catch (err: any) {
      console.error('Failed to load artists:', err);
      setError(err.message || 'Failed to load artists. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleArtistToggle = (artist: ArtistWithAvailability) => {
    // Validate artist data
    if (!artist._id || !artist.stageName) {
      setError('Invalid artist data. Please refresh and try again.');
      return;
    }

    const isSelected = tempSelectedArtists.some(a => a.artistId === artist._id);
    
    if (isSelected) {
      setTempSelectedArtists(prev => prev.filter(a => a.artistId !== artist._id));
    } else {
      const selectedArtist: SelectedArtist = {
        artistId: artist._id,
        artistName: artist.stageName,
        artistPhoto: artist.profileImage,
        fee: artist.estimatedFee || artist.pricePerHour,
        isCustomArtist: false
      };
      setTempSelectedArtists(prev => [...prev, selectedArtist]);
    }
  };

  const handleCustomArtistPhotoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setCustomArtistPhoto(file);
    setCustomArtistPhotoPreview(URL.createObjectURL(file));
  }, []);

  const handleAddCustomArtist = () => {
    if (!customArtistForm.name.trim() || !customArtistForm.fee) {
      return;
    }

    const customArtist: SelectedArtist = {
      artistId: `custom-${Date.now()}`,
      artistName: '',
      customArtistName: customArtistForm.name,
      customArtistPhoto: customArtistPhotoPreview,
      customArtistPhotoFile: customArtistPhoto || undefined, // Store the actual file
      fee: parseFloat(customArtistForm.fee),
      isCustomArtist: true,
      notes: customArtistForm.notes
    };

    setTempSelectedArtists(prev => [...prev, customArtist]);
    setCustomArtistForm({ name: '', fee: '', notes: '', description: '' });
    setCustomArtistPhoto(null);
    setCustomArtistPhotoPreview('');
    setShowCustomArtistForm(false);
  };

  const handleRemoveArtist = (artistId: string) => {
    setTempSelectedArtists(prev => prev.filter(a => a.artistId !== artistId));
  };

  const handleConfirmSelection = () => {
    onArtistsSelected(tempSelectedArtists);
    onClose();
  };

  const getUniqueCategories = () => {
    const categories = artists.map(artist => artist.category);
    return [...new Set(categories)].filter(Boolean);
  };

  const renderArtistCard = (artist: ArtistWithAvailability) => {
    const isSelected = tempSelectedArtists.some(a => a.artistId === artist._id);
    
    return (
      <Card 
        key={artist._id} 
        className={`bg-white cursor-pointer transition-all hover:shadow-md ${
          isSelected ? 'ring-2 ring-primary' : ''
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Artist Photo */}
            <div className="relative">
              <img
                src={artist.profileImage || '/placeholder-artist.jpg'}
                alt={artist.stageName}
                className="w-16 h-16 rounded-full object-cover bg-gray-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-artist.jpg';
                }}
              />
              {isSelected && (
                <div className="absolute -top-1 -right-1 bg-primary text-white rounded-full p-1">
                  <CheckCircle2 className="h-3 w-3" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 truncate">
                    {artist.stageName}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {artist.user.firstName} {artist.user.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{artist.category}</p>
                </div>

                <div className="text-right">
                  <div className="font-semibold text-primary">
                    ${((artist.estimatedFee ?? artist.pricePerHour) || 0).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">estimated</div>
                </div>
              </div>

              {/* Availability Status */}
              <div className="mt-2">
                {artist.isAvailable ? (
                  <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                    Available
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-red-700 border-red-200 bg-red-50">
                    Unavailable
                  </Badge>
                )}
                {artist.availabilityReason && (
                  <p className="text-xs text-gray-500 mt-1">{artist.availabilityReason}</p>
                )}
              </div>

              {/* Skills */}
              <div className="mt-2">
                <div className="flex flex-wrap gap-1">
                  {artist.skills.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {artist.skills.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{artist.skills.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Experience */}
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {artist.yearsOfExperience} years
                </div>
                <div className="flex items-center gap-1">
                  <Music className="h-3 w-3" />
                  {artist.performPreference.join(', ')}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => handleArtistToggle(artist)}
                  disabled={!artist.isAvailable}
                  className="flex-1"
                >
                  {isSelected ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Selected
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-1" />
                      Select
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowArtistDetails(artist._id)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSelectedArtists = () => {
    if (tempSelectedArtists.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Music className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No artists selected yet</p>
        </div>
      );
    }

    const totalFee = tempSelectedArtists.reduce((sum, artist) => sum + artist.fee, 0);

    return (
      <div className="space-y-3">
        {tempSelectedArtists.map((artist, index) => (
          <Card key={artist.artistId} className="bg-white border-primary/20">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {artist.isCustomArtist ? (
                    artist.customArtistPhoto ? (
                      <img
                        src={artist.customArtistPhoto}
                        alt={artist.customArtistName}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-artist.jpg';
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                    )
                  ) : (
                    <img
                      src={artist.artistPhoto || '/placeholder-artist.jpg'}
                      alt={artist.artistName || artist.customArtistName}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-artist.jpg';
                      }}
                    />
                  )}
                  <div>
                    <div className="font-medium">
                      {artist.isCustomArtist ? artist.customArtistName : artist.artistName}
                    </div>
                    <div className="text-sm text-gray-600">
                      ${artist.fee.toFixed(2)}
                      {artist.isCustomArtist && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Custom
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveArtist(artist.artistId)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="bg-gray-50 rounded-lg p-3 border-2 border-dashed border-gray-300">
          <div className="flex items-center justify-between font-semibold">
            <span>Total Artist Fees:</span>
            <span className="text-primary">${totalFee.toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-7xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Book Artists for Your Event
          </DialogTitle>
          <DialogDescription>
            Select artists based on their availability for {eventDate} from {eventStartTime} to {eventEndTime}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 overflow-hidden">
          {/* Artists List */}
          <div className="lg:col-span-2 flex flex-col space-y-4 min-h-0">
            {/* Filters */}
            <Card className="bg-white shrink-0">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search artists..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all">All Categories</SelectItem>
                      {getUniqueCategories().map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Availability" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all">All Artists</SelectItem>
                      <SelectItem value="available">Available Only</SelectItem>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Min $"
                      type="number"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      className="w-full"
                    />
                    <Input
                      placeholder="Max $"
                      type="number"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Found {filteredArtists.length} artists
                    {availabilityFilter === 'available' && ` available`}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCustomArtistForm(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Custom Artist
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Artists Grid */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-2">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : filteredArtists.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Music className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No artists found matching your criteria</p>
                </div>
              ) : (
                filteredArtists.map(renderArtistCard)
              )}
            </div>
          </div>

          {/* Selected Artists Sidebar */}
          <div className="lg:col-span-1 border-l border-gray-200 pl-6 flex flex-col min-h-0">
            <h3 className="font-semibold mb-4 flex items-center gap-2 shrink-0">
              <CheckCircle2 className="h-4 w-4" />
              Selected Artists ({tempSelectedArtists.length})
            </h3>
            
            <div className="flex-1 min-h-0 overflow-y-auto pr-2">
              {renderSelectedArtists()}
            </div>
          </div>
        </div>

        <DialogFooter className="shrink-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirmSelection}>
            Confirm Selection ({tempSelectedArtists.length})
          </Button>
        </DialogFooter>

        {/* Custom Artist Form Modal */}
        {showCustomArtistForm && (
          <Dialog open={showCustomArtistForm} onOpenChange={setShowCustomArtistForm}>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Add Custom Artist</DialogTitle>
                <DialogDescription>
                  Add an artist that's not in our system
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="customName">Artist Name *</Label>
                  <Input
                    id="customName"
                    value={customArtistForm.name}
                    onChange={(e) => setCustomArtistForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter artist name"
                    className="mt-1"
                  />
                </div>

                {/* Photo Upload */}
                <div>
                  <Label>Artist Photo</Label>
                  <div className="mt-2 space-y-3">
                    {!customArtistPhotoPreview ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                        <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <label className="cursor-pointer">
                          <span className="text-sm font-medium text-gray-700">
                            Upload artist photo
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG up to 5MB
                          </p>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleCustomArtistPhotoSelect}
                          />
                        </label>
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={customArtistPhotoPreview}
                          alt="Artist photo preview"
                          className="w-24 h-24 rounded-full object-cover mx-auto border"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setCustomArtistPhoto(null);
                            setCustomArtistPhotoPreview('');
                          }}
                          className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="customDescription">Description</Label>
                  <Textarea
                    id="customDescription"
                    value={customArtistForm.description}
                    onChange={(e) => setCustomArtistForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the artist..."
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="customFee">Performance Fee *</Label>
                  <Input
                    id="customFee"
                    type="number"
                    step="0.01"
                    min="0"
                    value={customArtistForm.fee}
                    onChange={(e) => setCustomArtistForm(prev => ({ ...prev, fee: e.target.value }))}
                    placeholder="Enter fee amount"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="customNotes">Additional Notes</Label>
                  <Textarea
                    id="customNotes"
                    value={customArtistForm.notes}
                    onChange={(e) => setCustomArtistForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any additional notes or requirements..."
                    rows={2}
                    className="mt-1"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCustomArtistForm(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddCustomArtist}
                  disabled={!customArtistForm.name.trim() || !customArtistForm.fee}
                >
                  Add Artist
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Artist Details Modal */}
        {showArtistDetails && (
          <Dialog open={!!showArtistDetails} onOpenChange={() => setShowArtistDetails(null)}>
            <DialogContent className="bg-white max-w-3xl max-h-[90vh] overflow-y-auto">
              {(() => {
                const artist = artists.find(a => a._id === showArtistDetails);
                if (!artist) return null;

                return (
                  <>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Artist Details
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                      {/* Artist Header */}
                      <div className="flex items-start gap-4">
                        <img
                          src={artist.profileImage || '/placeholder-artist.jpg'}
                          alt={artist.stageName}
                          className="w-24 h-24 rounded-full object-cover bg-gray-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-artist.jpg';
                          }}
                        />
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-900">{artist.stageName}</h3>
                          <p className="text-gray-600">
                            {artist.user.firstName} {artist.user.lastName}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary">{artist.category}</Badge>
                            {artist.isAvailable ? (
                              <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                                Available
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-red-700 border-red-200 bg-red-50">
                                Unavailable
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            ${((artist.estimatedFee ?? artist.pricePerHour) || 0).toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">estimated fee</div>
                        </div>
                      </div>

                      {/* Bio */}
                      {(artist as any).bio && (
                        <div>
                          <h4 className="font-semibold mb-2">About</h4>
                          <p className="text-gray-700">{(artist as any).bio}</p>
                        </div>
                      )}

                      {/* Skills */}
                      <div>
                        <h4 className="font-semibold mb-2">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {artist.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Experience & Details */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">Experience</h4>
                          <p className="text-gray-700">{artist.yearsOfExperience} years</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Performance Type</h4>
                          <p className="text-gray-700">{artist.performPreference.join(', ')}</p>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div>
                        <h4 className="font-semibold mb-2">Pricing Information</h4>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Base Rate (per hour):</span>
                            <span className="font-medium">${(artist.pricePerHour || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Estimated Fee for Event:</span>
                            <span className="font-bold text-primary">${((artist.estimatedFee ?? artist.pricePerHour) || 0).toFixed(2)}</span>
                          </div>
                          {artist.availabilityReason && (
                            <div className="pt-2 border-t border-gray-200">
                              <p className="text-sm text-gray-600">{artist.availabilityReason}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Portfolio/Social Links if available */}
                      {(artist as any).socialLinks && Object.keys((artist as any).socialLinks).length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Social Links</h4>
                          <div className="flex gap-2">
                            {Object.entries((artist as any).socialLinks).map(([platform, url]: [string, any]) => (
                              url && (
                                <a
                                  key={platform}
                                  href={url as string}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline text-sm"
                                >
                                  {platform}
                                </a>
                              )
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowArtistDetails(null)}>
                        Close
                      </Button>
                      {artist.isAvailable && (
                        <Button onClick={() => {
                          handleArtistToggle(artist);
                          setShowArtistDetails(null);
                        }}>
                          {tempSelectedArtists.some(a => a.artistId === artist._id) ? 'Remove' : 'Select Artist'}
                        </Button>
                      )}
                    </DialogFooter>
                  </>
                );
              })()}
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}
