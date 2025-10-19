'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRouter as useI18nRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useAuthLogic } from '@/hooks/useAuth';
import { ArtistService, Artist, PortfolioItem, ArtistPricingData } from '@/services/artist.service';
import { getYouTubeEmbedUrl } from '@/lib/youtube';
import Image from 'next/image';
import { TranslatedDataWrapper } from '@/components/ui/TranslatedDataWrapper';
import { 
  MapPin, 
  Star, 
  Clock, 
  Calendar, 
  Share2, 
  QrCode, 
  Award, 
  Music, 
  Users, 
  Globe,
  Sparkles,
  ChevronLeft,
  Download,
  Camera,
  Video,
  Eye,
  ThumbsUp
} from 'lucide-react';
import { Navbar } from '@/components/main/Navbar';
import { Footer } from '@/components/main/Footer';
import QRCode from 'qrcode';

export default function ArtistProfilePage() {
  const params = useParams();
  const router = useRouter();
  const i18nRouter = useI18nRouter();
  const t = useTranslations();
  const { isAuthenticated, isLoading: authLoading } = useAuthLogic();
  const artistId = params.id as string;
  
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [pricingData, setPricingData] = useState<ArtistPricingData | null>(null);
  const [hasDynamicPricing, setHasDynamicPricing] = useState(false);

  // Function to get display pricing information
  const getPricingDisplay = () => {
    // Always try to get a meaningful price to display
    let mainPrice = 0;
    let subtitle = 'KWD/hour';
    let hasMultiple = false;

    if (hasDynamicPricing && pricingData) {
      hasMultiple = true;
      
      if (pricingData.pricingMode === 'duration') {
        // Use private pricing only
        const privatePricing = pricingData.privatePricing;
        if (privatePricing && privatePricing.length > 0 && privatePricing.some(p => p.amount > 0)) {
          mainPrice = Math.min(...privatePricing.filter(p => p.amount > 0).map(p => p.amount));
        } else if (pricingData.basePrivateRate && pricingData.basePrivateRate > 0) {
          mainPrice = pricingData.basePrivateRate;
        } else {
          // Fall back to artist's basic pricing
          mainPrice = artist?.pricePerHour || 0;
          hasMultiple = false;
        }
      } else {
        // Time slot pricing - private only
        const privateTimeSlots = pricingData.privateTimeSlotPricing;
        if (privateTimeSlots && privateTimeSlots.length > 0 && privateTimeSlots.some(p => p.rate > 0)) {
          mainPrice = Math.min(...privateTimeSlots.filter(p => p.rate > 0).map(p => p.rate));
        } else if (pricingData.basePrivateRate && pricingData.basePrivateRate > 0) {
          mainPrice = pricingData.basePrivateRate;
        } else {
          // Fall back to artist's basic pricing
          mainPrice = artist?.pricePerHour || 0;
          hasMultiple = false;
        }
      }
    } else {
      // No dynamic pricing, use artist's basic rate
      mainPrice = artist?.pricePerHour || 0;
      hasMultiple = false;
    }

    return { mainPrice, subtitle, hasMultiple };
  };

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        setLoading(true);
        const foundArtist = await ArtistService.getArtistById(artistId);
        setArtist(foundArtist);
        
        // Generate QR code for the current URL
        const currentUrl = window.location.href;
        const qrCode = await QRCode.toDataURL(currentUrl, {
          width: 200,
          margin: 1,
          color: {
            dark: '#391C71',
            light: '#ffffff'
          }
        });
        setQrCodeUrl(qrCode);

        // Fetch portfolio items
        setPortfolioLoading(true);
        try {
          const portfolio = await ArtistService.getPublicPortfolioItems(foundArtist._id);
          setPortfolioItems(portfolio);
        } catch (portfolioErr) {
          console.error('Error fetching portfolio:', portfolioErr);
          // Don't set error for portfolio, just log it
        } finally {
          setPortfolioLoading(false);
        }

        // Fetch pricing data
        try {
          console.log('Fetching pricing for artist ID:', foundArtist._id);
          const pricing = await ArtistService.getArtistPricing(foundArtist._id);
          console.log('Pricing response:', pricing);
          if (pricing) {
            setPricingData(pricing);
            setHasDynamicPricing(true);
            console.log('Dynamic pricing set successfully');
          } else {
            console.log('No pricing data returned');
          }
        } catch (pricingErr) {
          console.error('Error fetching pricing:', pricingErr);
          // Don't set error for pricing, just log it
        }
      } catch (err) {
        console.error('Error fetching artist:', err);
        setError(t('artistProfile.failedToLoad'));
      } finally {
        setLoading(false);
      }
    };

    if (artistId) {
      fetchArtist();
    }
  }, [artistId]);

  const handleBookArtist = () => {
    // Don't do anything if auth is still loading
    if (authLoading) {
      return;
    }
    
    // Check if user is authenticated before allowing booking
    if (!isAuthenticated) {
      // Redirect to signin with current page as return URL
      const currentPath = window.location.pathname;
      i18nRouter.push(`/auth/signin?returnUrl=${encodeURIComponent(currentPath)}`);
      return;
    }
    
    // Navigate to booking page
    i18nRouter.push(`/book-artist/${artistId}`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${artist?.stageName} - Artist Profile`,
          text: `Check out ${artist?.stageName}'s amazing performances!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleDownloadQR = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.download = `${artist?.stageName}-profile-qr.png`;
      link.href = qrCodeUrl;
      link.click();
    }
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
        <div className="relative z-10 flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#391C71]"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !artist) {
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
        <div className="relative z-10 text-center py-20">
          <div className="max-w-md mx-auto bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8">
            <p className="text-red-500 text-xl mb-4">{error || t('artistProfile.artistNotFound')}</p>
            <button
              onClick={() => router.back()}
              className="bg-[#391C71] text-white px-6 py-3 rounded-full hover:bg-[#5B2C87] transition-colors"
            >
              {t('artistProfile.goBack')}
            </button>
          </div>
        </div>
        <Footer />
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
      
      {/* Cover Section */}
      <div className="relative z-10 pt-20">
        <div className="h-80 relative overflow-hidden">
          {artist.profileCoverImage ? (
            <Image
              src={artist.profileCoverImage}
              alt={`${artist.stageName} cover`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#391C71] to-[#5B2C87]" />
          )}
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="absolute top-6 left-6 rtl:left-auto rtl:right-6 bg-white/90 backdrop-blur-sm p-3 rounded-full hover:bg-white transition-colors shadow-lg"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700 rtl:rotate-180" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 -mt-20">
        <TranslatedDataWrapper 
          data={artist}
          translateFields={['bio', 'description', 'specialization', 'skills', 'experience', 'about', 'genre', 'style', 'stageName', 'category', 'performPreference', 'musicLanguages', 'awards', 'genres']}
          preserveFields={['pricePerHour', 'profileImage', 'country', 'contactNumber', 'email', '_id', 'user', 'yearsOfExperience', 'youtubeLink', 'createdAt', 'updatedAt']}
          showLoadingOverlay={false}
        >
          {(translatedArtist, isTranslating) => (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Profile Card */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 relative overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 rtl:right-auto rtl:left-0 w-32 h-32 bg-gradient-to-bl rtl:bg-gradient-to-br from-[#391C71]/10 to-transparent rounded-bl-full rtl:rounded-bl-none rtl:rounded-br-full"></div>
              <div className="absolute bottom-0 left-0 rtl:left-auto rtl:right-0 w-24 h-24 bg-gradient-to-tr rtl:bg-gradient-to-tl from-purple-100/50 to-transparent rounded-tr-full rtl:rounded-tr-none rtl:rounded-tl-full"></div>
              
              <div className="flex flex-col lg:flex-row items-start gap-8 relative z-10">
                
                {/* Profile Image */}
                <div className="relative w-40 h-40 flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-3xl transform rotate-3"></div>
                  {artist.profileImage ? (
                    <Image
                      src={artist.profileImage}
                      alt={(translatedArtist as Artist).stageName}
                      fill
                      className="object-cover rounded-3xl border-4 border-white shadow-lg relative z-10"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-[#391C71] rounded-3xl flex items-center justify-center border-4 border-white shadow-lg relative z-10">
                      <span className="text-5xl font-bold text-white">
                        {(translatedArtist as Artist).stageName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  {/* Verified Badge */}
                  <div className="absolute -top-2 -right-2 rtl:-right-auto rtl:-left-2 bg-[#391C71] rounded-full p-2 shadow-lg z-20">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 min-w-0">
                  <div className="mb-6">
                    <h1 className="text-5xl font-bold text-gray-900 mb-3 tracking-tight">
                      {(translatedArtist as Artist).stageName}
                    </h1>
                    
                    
                    {/* Category Badge */}
                    <div className="inline-flex items-center bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg">
                      <Music className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                      {(translatedArtist as Artist).category || 'Artist'}
                    </div>
                  </div>

                  {/* Performance Modes */}
                  <div className="mb-8">
                    <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center">
                      <Music className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2 text-[#391C71]" />
                      {t('artistProfile.performanceModes')}
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {(translatedArtist as Artist).performPreference?.map((pref, index) => (
                        <div
                          key={index}
                          className="group relative"
                        >
                          <div className="bg-gradient-to-r from-[#391C71]/10 to-purple-100 text-[#391C71] px-3 py-2 rounded-2xl text-sm font-semibold border border-[#391C71]/20 hover:scale-105 transition-transform duration-200 shadow-sm capitalize">
                            {pref}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="text-center p-3 bg-gradient-to-r from-[#391C71]/10 to-purple-100 rounded-2xl border border-[#391C71]/20">
                      <div className="text-2xl font-bold text-[#391C71] mb-1">{artist.yearsOfExperience}</div>
                      <div className="text-xs text-gray-600 font-medium">{t('artistProfile.yearsExperienceLabel')}</div>
                      <Clock className="w-4 h-4 text-[#391C71] mx-auto mt-2" />
                    </div>
                    <div className="text-center p-3 bg-gradient-to-r from-[#391C71]/10 to-purple-100 rounded-2xl border border-[#391C71]/20">
                      <div className="text-2xl font-bold text-[#391C71] mb-1">{artist.likeCount || 0}</div>
                      <div className="text-xs text-gray-600 font-medium">{t('artistProfile.likesLabel')}</div>
                      <Star className="w-4 h-4 text-[#391C71] mx-auto mt-2" />
                    </div>
                    <div className="text-center p-3 bg-gradient-to-r from-[#391C71]/10 to-purple-100 rounded-2xl border border-[#391C71]/20">
                      <div className="text-lg font-bold text-[#391C71] mb-1">
                        {getPricingDisplay().mainPrice}
                      </div>
                      <div className="text-xs text-gray-600 font-medium">
                        {t('artistProfile.kwdPerHour')}
                      </div>
                      <div className="text-xs text-[#391C71] font-medium mt-1">{t('artistProfile.priceLabel')}</div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="mb-8">
                    <div className="flex items-center bg-gradient-to-r from-[#391C71]/10 to-purple-100 border border-[#391C71]/20 rounded-2xl p-3">
                      <div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-full p-2 mr-3 rtl:mr-0 rtl:ml-3">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">{t('artistProfile.basedIn')}</div>
                        <div className="text-base font-bold text-gray-900">{artist.country || 'Kuwait'}</div>
                      </div>
                    </div>
                  </div>



                  {/* Enhanced Book Button */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={handleBookArtist}
                      disabled={authLoading}
                      className={`flex-1 ${
                        authLoading 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-[#391C71] to-[#5B2C87] hover:from-[#5B2C87] hover:to-[#391C71] hover:shadow-2xl hover:scale-105'
                      } text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl flex items-center justify-center gap-3 relative overflow-hidden group`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r rtl:bg-gradient-to-l from-white/0 via-white/20 to-white/0 transform -skew-x-12 rtl:skew-x-12 -translate-x-full rtl:translate-x-full group-hover:translate-x-full rtl:group-hover:-translate-x-full transition-transform duration-1000"></div>
                      <Calendar className="w-6 h-6 relative z-10" />
                      <span className="relative z-10">
                        {authLoading ? t('artistProfile.loading') : t('artistProfile.bookNow')}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* About Section */}
            {(translatedArtist as Artist).about && (
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 rtl:left-auto rtl:right-0 w-20 h-20 bg-gradient-to-br rtl:bg-gradient-to-bl from-[#391C71]/20 to-transparent rounded-br-full rtl:rounded-br-none rtl:rounded-bl-full"></div>
                <div className="relative z-10">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-full p-2 mr-3 rtl:mr-0 rtl:ml-3">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    {t('artistProfile.about')} {(translatedArtist as Artist).stageName}
                  </h2>
                  <div className="bg-gradient-to-r from-[#391C71]/10 to-purple-100 rounded-2xl p-4 border border-[#391C71]/20">
                    <p className="text-gray-700 leading-relaxed text-sm">{(translatedArtist as Artist).about}</p>
                  </div>
                </div>
              </div>
            )}

            {(() => {
              
              const hasValidDynamicPricing = hasDynamicPricing && pricingData && (
                (pricingData.privatePricing && pricingData.privatePricing.length > 0 && pricingData.privatePricing.some(p => p.amount > 0)) ||
                (pricingData.privateTimeSlotPricing && pricingData.privateTimeSlotPricing.length > 0 && pricingData.privateTimeSlotPricing.some(p => p.rate > 0)) ||
                (pricingData.basePrivateRate && pricingData.basePrivateRate > 0)
              );
              
              const hasBasicPricing = artist?.pricePerHour && artist.pricePerHour > 0;
              
              // Only render if we have either valid dynamic pricing or basic pricing
              return (hasValidDynamicPricing || hasBasicPricing);
            })() && (
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 rtl:left-auto rtl:right-0 w-20 h-20 bg-gradient-to-br rtl:bg-gradient-to-bl from-[#391C71]/20 to-transparent rounded-br-full rtl:rounded-br-none rtl:rounded-bl-full"></div>
                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-full p-2 mr-3 rtl:mr-0 rtl:ml-3">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                    {t('artistProfile.pricingDetails')}
                  </h3>
                  <div className="bg-gradient-to-r from-[#391C71]/10 to-purple-100 rounded-2xl p-6 border border-[#391C71]/20">
                    {/* Private Performance Pricing */}
                    <div className="bg-white/70 rounded-2xl p-4 mb-4">
                      <h4 className="text-base font-bold text-[#391C71] mb-4 flex items-center">
                        <Users className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                        {t('artistProfile.privatePerformance')}
                      </h4>
                      
                      {(() => {
                        // Check if we have valid dynamic pricing
                        const hasValidDynamicPricing = hasDynamicPricing && pricingData && (
                          (pricingData.privatePricing && pricingData.privatePricing.length > 0 && pricingData.privatePricing.some(p => p.amount > 0)) ||
                          (pricingData.privateTimeSlotPricing && pricingData.privateTimeSlotPricing.length > 0 && pricingData.privateTimeSlotPricing.some(p => p.rate > 0)) ||
                          (pricingData.basePrivateRate && pricingData.basePrivateRate > 0)
                        );

                        if (hasValidDynamicPricing) {
                          // Show Dynamic Pricing
                          return (
                            <div className="space-y-3">
                              {pricingData.pricingMode === 'duration' ? (
                                // Duration-based pricing
                                <>
                                  {pricingData.privatePricing && pricingData.privatePricing.length > 0 && pricingData.privatePricing.some(p => p.amount > 0) ? (
                                    pricingData.privatePricing.filter(p => p.amount > 0).map((price, index) => (
                                      <div key={index} className="flex justify-between items-center py-2 px-3 bg-gradient-to-r from-[#391C71]/5 to-purple-50 rounded-xl border border-[#391C71]/10">
                                        <span className="font-medium text-gray-700">
                                          {t('artistProfile.hoursFormat', { hours: price.hours })}
                                        </span>
                                        <span className="font-bold text-[#391C71] text-lg">
                                          {price.amount} KWD
                                        </span>
                                      </div>
                                    ))
                                  ) : pricingData.basePrivateRate && pricingData.basePrivateRate > 0 ? (
                                    <div className="flex justify-between items-center py-2 px-3 bg-gradient-to-r from-[#391C71]/5 to-purple-50 rounded-xl border border-[#391C71]/10">
                                      <span className="font-medium text-gray-700">Per Hour:</span>
                                      <span className="font-bold text-[#391C71] text-lg">
                                        {pricingData.basePrivateRate} KWD
                                      </span>
                                    </div>
                                  ) : null}
                                </>
                              ) : (
                                // Time-slot based pricing
                                <>
                                  {pricingData.privateTimeSlotPricing && pricingData.privateTimeSlotPricing.length > 0 && pricingData.privateTimeSlotPricing.some(p => p.rate > 0) ? (
                                    pricingData.privateTimeSlotPricing.filter(p => p.rate > 0).map((slot, index) => (
                                      <div key={index} className="flex justify-between items-center py-2 px-3 bg-gradient-to-r from-[#391C71]/5 to-purple-50 rounded-xl border border-[#391C71]/10">
                                        <span className="font-medium text-gray-700">
                                          {slot.hour}:00 - {(slot.hour + 1)}:00:
                                        </span>
                                        <span className="font-bold text-[#391C71] text-lg">
                                          {slot.rate} KWD
                                        </span>
                                      </div>
                                    ))
                                  ) : pricingData.basePrivateRate && pricingData.basePrivateRate > 0 ? (
                                    <div className="flex justify-between items-center py-2 px-3 bg-gradient-to-r from-[#391C71]/5 to-purple-50 rounded-xl border border-[#391C71]/10">
                                      <span className="font-medium text-gray-700">{t('artistProfile.perHourLabel')}</span>
                                      <span className="font-bold text-[#391C71] text-lg">
                                        {pricingData.basePrivateRate} KWD
                                      </span>
                                    </div>
                                  ) : null}
                                </>
                              )}
                              
                            </div>
                          );
                        } else {
                          // Fallback to Basic Pricing from artist profile
                          return (
                            <div className="space-y-3">
                              <div className="flex justify-between items-center py-2 px-3 bg-gradient-to-r from-[#391C71]/5 to-purple-50 rounded-xl border border-[#391C71]/10">
                                <span className="font-medium text-gray-700">{t('artistProfile.oneHour')}</span>
                                <span className="font-bold text-[#391C71] text-lg">
                                  {artist?.pricePerHour || 0} KWD
                                </span>
                              </div>
                              <div className="flex justify-between items-center py-2 px-3 bg-gradient-to-r from-[#391C71]/5 to-purple-50 rounded-xl border border-[#391C71]/10">
                                <span className="font-medium text-gray-700">{t('artistProfile.twoHours')}</span>
                                <span className="font-bold text-[#391C71] text-lg">
                                  {((artist?.pricePerHour || 0) * 2)} KWD
                                </span>
                              </div>
                              <div className="flex justify-between items-center py-2 px-3 bg-gradient-to-r from-[#391C71]/5 to-purple-50 rounded-xl border border-[#391C71]/10">
                                <span className="font-medium text-gray-700">{t('artistProfile.fourHours')}</span>
                                <span className="font-bold text-[#391C71] text-lg">
                                  {((artist?.pricePerHour || 0) * 4)} KWD
                                </span>
                              </div>
                              <div className="flex justify-between items-center py-2 px-3 bg-gradient-to-r from-[#391C71]/5 to-purple-50 rounded-xl border border-[#391C71]/10">
                                <span className="font-medium text-gray-700">{t('artistProfile.eightHours')}</span>
                                <span className="font-bold text-[#391C71] text-lg">
                                  {((artist?.pricePerHour || 0) * 8)} KWD
                                </span>
                              </div>
                              
                            </div>
                          );
                        }
                      })()}
                    </div>
                    
                   
                  </div>
                </div>
              </div>
            )}

            {/* Skills & Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Skills */}
              {(translatedArtist as Artist).skills && (translatedArtist as Artist).skills.length > 0 && (
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 rtl:right-auto rtl:left-0 w-16 h-16 bg-gradient-to-bl rtl:bg-gradient-to-br from-[#391C71]/20 to-transparent rounded-bl-full rtl:rounded-bl-none rtl:rounded-br-full"></div>
                  <div className="relative z-10">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-full p-2 mr-3 rtl:mr-0 rtl:ml-3">
                        <Music className="w-4 h-4 text-white" />
                      </div>
                      {t('artistProfile.skills')}
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {(translatedArtist as Artist).skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-gradient-to-r from-[#391C71]/10 to-purple-100 text-[#391C71] px-3 py-2 rounded-2xl text-sm font-semibold border border-[#391C71]/20 hover:scale-105 transition-transform duration-200 shadow-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Languages */}
              {(translatedArtist as Artist).musicLanguages && (translatedArtist as Artist).musicLanguages.length > 0 && (
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 rtl:right-auto rtl:left-0 w-16 h-16 bg-gradient-to-bl rtl:bg-gradient-to-br from-[#391C71]/20 to-transparent rounded-bl-full rtl:rounded-bl-none rtl:rounded-br-full"></div>
                  <div className="relative z-10">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-full p-2 mr-3 rtl:mr-0 rtl:ml-3">
                        <Globe className="w-4 h-4 text-white" />
                      </div>
                      {t('artistProfile.languages')}
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {(translatedArtist as Artist).musicLanguages.map((language, index) => (
                        <span
                          key={index}
                          className="bg-gradient-to-r from-[#391C71]/10 to-purple-100 text-[#391C71] px-3 py-2 rounded-2xl text-sm font-semibold border border-[#391C71]/20 hover:scale-105 transition-transform duration-200 shadow-sm"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Genres */}
              {(translatedArtist as Artist).genres && (translatedArtist as Artist).genres.length > 0 && (
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 rtl:right-auto rtl:left-0 w-16 h-16 bg-gradient-to-bl rtl:bg-gradient-to-br from-[#391C71]/20 to-transparent rounded-bl-full rtl:rounded-bl-none rtl:rounded-br-full"></div>
                  <div className="relative z-10">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-full p-2 mr-3 rtl:mr-0 rtl:ml-3">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      {t('artistProfile.genres')}
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {(translatedArtist as Artist).genres.map((genre, index) => (
                        <span
                          key={index}
                          className="bg-gradient-to-r from-[#391C71]/10 to-purple-100 text-[#391C71] px-3 py-2 rounded-2xl text-sm font-semibold border border-[#391C71]/20 hover:scale-105 transition-transform duration-200 shadow-sm"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Awards */}
              {(translatedArtist as Artist).awards && (translatedArtist as Artist).awards.length > 0 && (
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#391C71]/20 to-transparent rounded-bl-full"></div>
                  <div className="relative z-10">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-full p-2 mr-3 rtl:mr-0 rtl:ml-3">
                        <Award className="w-4 h-4 text-white" />
                      </div>
                      {t('artistProfile.awards')}
                    </h3>
                    <div className="space-y-3">
                      {(translatedArtist as Artist).awards.map((award, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-r from-[#391C71]/10 to-purple-100 border-l-4 rtl:border-l-0 rtl:border-r-4 border-[#391C71] p-3 rounded-r-2xl rtl:rounded-r-none rtl:rounded-l-2xl shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                          <p className="text-gray-800 font-semibold text-sm flex items-center">
                            <Award className="w-3 h-3 text-[#391C71] mr-2 rtl:mr-0 rtl:ml-2" />
                            {award}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Video */}
            {artist.youtubeLink && getYouTubeEmbedUrl(artist.youtubeLink) && (
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 rtl:left-auto rtl:right-0 w-24 h-24 bg-gradient-to-br rtl:bg-gradient-to-bl from-[#391C71]/20 to-transparent rounded-br-full rtl:rounded-br-none rtl:rounded-bl-full"></div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-full p-2 mr-3 rtl:mr-0 rtl:ml-3">
                      <Music className="w-4 h-4 text-white" />
                    </div>
                    {t('artistProfile.demoVideo')}
                  </h3>
                  <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-inner border-4 border-white">
                    <iframe
                      src={getYouTubeEmbedUrl(artist.youtubeLink)!}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Artist Demo Video"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Portfolio Section */}
            {portfolioItems.length > 0 && (
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 rtl:left-auto rtl:right-0 w-24 h-24 bg-gradient-to-br rtl:bg-gradient-to-bl from-[#391C71]/20 to-transparent rounded-br-full rtl:rounded-br-none rtl:rounded-bl-full"></div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-full p-2 mr-3 rtl:mr-0 rtl:ml-3">
                      <Camera className="w-4 h-4 text-white" />
                    </div>
                    {t('artistProfile.portfolio')}
                    <span className="ml-3 rtl:ml-0 rtl:mr-3 bg-gradient-to-r from-[#391C71]/10 to-purple-100 text-[#391C71] px-3 py-1 rounded-full text-xs font-semibold">
                      {portfolioItems.length} {t('artistProfile.items')}
                    </span>
                  </h3>
                  
                  {portfolioLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#391C71]"></div>
                      <span className="ml-2 rtl:ml-0 rtl:mr-2 text-gray-600">{t('artistProfile.loading')}</span>
                    </div>
                  ) : (
                    <TranslatedDataWrapper
                      data={portfolioItems}
                      translateFields={['title', 'description']}
                      preserveFields={['_id', 'fileUrl', 'thumbnailUrl', 'type', 'views', 'likes', 'status']}
                    >
                      {(translatedPortfolioItems) => (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {translatedPortfolioItems.map((item) => (
                        <div
                          key={item._id}
                          className="group relative bg-gradient-to-r from-[#391C71]/5 to-purple-50 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-[#391C71]/10"
                        >
                          {/* Portfolio Item Content */}
                          {item.type === 'image' ? (
                            <div className="aspect-square relative overflow-hidden">
                              <Image
                                src={item.fileUrl}
                                alt={item.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                              <div className="absolute top-2 left-2 rtl:left-auto rtl:right-2 bg-[#391C71] text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                <Camera className="w-3 h-3" />
                                {t('artistProfile.image')}
                              </div>
                            </div>
                          ) : item.type === 'video' ? (
                            <div className="aspect-video relative overflow-hidden">
                              <video
                                src={item.fileUrl}
                                poster={item.thumbnailUrl}
                                className="w-full h-full object-cover"
                                preload="metadata"
                              />
                              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                                <div className="bg-white/90 rounded-full p-3 group-hover:scale-110 transition-transform duration-300">
                                  <Video className="w-6 h-6 text-[#391C71]" />
                                </div>
                              </div>
                              <div className="absolute top-2 left-2 rtl:left-auto rtl:right-2 bg-[#391C71] text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                <Video className="w-3 h-3" />
                                {t('artistProfile.video')}
                              </div>
                            </div>
                          ) : (
                            <div className="aspect-square bg-gradient-to-br from-[#391C71]/20 to-purple-200 flex items-center justify-center">
                              <Music className="w-12 h-12 text-[#391C71]" />
                              <div className="absolute top-2 left-2 rtl:left-auto rtl:right-2 bg-[#391C71] text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                <Music className="w-3 h-3" />
                                {t('artistProfile.audio')}
                              </div>
                            </div>
                          )}
                          
                          {/* Portfolio Item Info */}
                          <div className="p-3">
                            <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
                              {item.title}
                            </h4>
                            {item.description && (
                              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                {item.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  {item.views}
                                </span>
                                <span className="flex items-center gap-1">
                                  <ThumbsUp className="w-3 h-3" />
                                  {item.likes}
                                </span>
                              </div>
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                                {t('artistProfile.approved')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                        </div>
                      )}
                    </TranslatedDataWrapper>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - QR & Share */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-6 sticky top-24 relative overflow-hidden">
              
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#391C71]/10 to-transparent rounded-bl-full"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-purple-100/50 to-transparent rounded-tr-full"></div>
              
              <div className="relative z-10">
                {/* Share Section */}
                <div className="text-center mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center justify-center">
                    <div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-full p-2 mr-3">
                      <Share2 className="w-4 h-4 text-white" />
                    </div>
                    {t('artistProfile.shareProfile')}
                  </h3>
                  <button
                    onClick={handleShare}
                    className="w-full bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white px-6 py-3 rounded-2xl font-semibold hover:from-[#5B2C87] hover:to-[#391C71] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-3 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <Share2 className="w-4 h-4 relative z-10" />
                    <span className="relative z-10 text-sm">{t('artistProfile.shareProfile')}</span>
                  </button>
                </div>

                {/* QR Code Section */}
                <div className="text-center">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center justify-center">
                    <div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-full p-2 mr-3 rtl:mr-0 rtl:ml-3">
                      <QrCode className="w-4 h-4 text-white" />
                    </div>
                    {t('artistProfile.qrCode')}
                  </h4>
                  {qrCodeUrl && (
                    <div className="bg-white p-6 rounded-2xl shadow-inner mb-6 border-4 border-gray-100">
                      <Image
                        src={qrCodeUrl}
                        alt="QR Code"
                        width={200}
                        height={200}
                        className="mx-auto rounded-xl"
                      />
                    </div>
                  )}
                  <p className="text-xs text-gray-600 mb-4 bg-gradient-to-r from-[#391C71]/10 to-purple-100 p-3 rounded-xl border border-[#391C71]/20">
                    📱 {t('artistProfile.scanInstruction')}
                  </p>
                  
                  {/* QR Actions */}
                  <div className="space-y-3">
                    <button
                      onClick={handleDownloadQR}
                      className="w-full bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white px-4 py-3 rounded-2xl font-semibold hover:from-[#5B2C87] hover:to-[#391C71] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <Download className="w-3 h-3" />
                      <span className="text-sm">{t('artistProfile.downloadQR')}</span>
                    </button>
                    <button
                      onClick={() => {
                        if (qrCodeUrl) {
                          navigator.clipboard.writeText(window.location.href);
                        }
                      }}
                      className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-3 rounded-2xl font-semibold hover:from-gray-600 hover:to-gray-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <QrCode className="w-3 h-3" />
                      <span className="text-sm">{t('artistProfile.copyLink')}</span>
                    </button>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="text-center bg-gradient-to-r from-[#391C71]/10 to-purple-100 p-4 rounded-2xl border border-[#391C71]/20">
                    <p className="text-xs text-gray-600 mb-2 font-medium">🎭 {t('artistProfile.memberSince')}</p>
                    <p className="font-bold text-gray-900 text-sm">
                      {new Date(artist.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
            </div>
          )}
        </TranslatedDataWrapper>
      </div>

      <div className="mt-20">
        <Footer />
      </div>
    </div>
  );
}