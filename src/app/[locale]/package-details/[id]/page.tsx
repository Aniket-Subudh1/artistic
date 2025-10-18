'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { equipmentPackagesService, EquipmentPackage } from '@/services/equipment-packages.service';
import Image from 'next/image';
import { 
  Package, 
  User, 
  Calendar, 
  Share2, 
  QrCode, 
  Clock, 
  Star,
  ChevronLeft,
  Download,
  Eye,
  MapPin,
  Tag
} from 'lucide-react';
import { Navbar } from '@/components/main/Navbar';
import { Footer } from '@/components/main/Footer';
import { TranslatedDataWrapper } from '@/components/ui/TranslatedDataWrapper';
import QRCode from 'qrcode';

export default function PackageDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const packageId = params.id as string;
  
  const [packageData, setPackageData] = useState<EquipmentPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        setLoading(true);
        const foundPackage = await equipmentPackagesService.getPackageById(packageId);
        setPackageData(foundPackage);
        
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
      } catch (err) {
        console.error('Error fetching package:', err);
        setError('Failed to load package details');
      } finally {
        setLoading(false);
      }
    };

    if (packageId) {
      fetchPackage();
    }
  }, [packageId]);

  const handleBookPackage = () => {
    // Navigate to the equipment package booking page
    router.push(`/book-package/${packageId}`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: packageData?.name,
          text: packageData?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleDownloadQR = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.download = `${packageData?.name || 'package'}-qr-code.png`;
      link.href = qrCodeUrl;
      link.click();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#391C71] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading package details...</p>
        </div>
      </div>
    );
  }

  if (error || !packageData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Package not found</h2>
          <p className="text-gray-600 mb-6">{error || 'The package you are looking for does not exist.'}</p>
          <button
            onClick={() => router.back()}
            className="bg-[#391C71] text-white px-6 py-3 rounded-lg hover:bg-[#5B2C87] transition-colors"
          >
            Go Back
          </button>
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
      
      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 bg-white/90 backdrop-blur-sm p-3 rounded-full px-4 text-center justify-center items-center hover:bg-white transition-colors shadow-lg flex items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
          <span className="text-gray-700 font-medium">Back</span>
        </button>

        <TranslatedDataWrapper 
          data={packageData}
          translateFields={['name', 'description', 'category', 'features', 'specifications', 'adminNotes']}
          preserveFields={['totalPrice', 'coverImage', 'imageUrl', '_id', 'createdBy', 'status', 'visibility', 'roleRef', 'createdAt', 'updatedAt', 'pricePerDay', 'quantity', 'images']}
          showLoadingOverlay={false}
        >
          {(translatedPackage, isTranslating) => (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column - Main Info */}
              <div className="lg:col-span-2 space-y-6">
            
            {/* Package Profile Card */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#391C71]/20 to-transparent rounded-bl-full"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-purple-100/50 to-transparent rounded-tr-full"></div>
              
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  
                  {/* Package Image */}
                  <div className="lg:w-48 lg:h-48 w-32 h-32 mx-auto lg:mx-0 relative overflow-hidden rounded-3xl shadow-2xl border-4 border-white group">
                    {translatedPackage.coverImage || translatedPackage.imageUrl ? (
                      <Image
                        src={translatedPackage.coverImage || translatedPackage.imageUrl || ''}
                        alt={translatedPackage.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#391C71] to-[#5B2C87] flex items-center justify-center">
                        <Package className="w-16 h-16 text-white" />
                      </div>
                    )}
                  </div>
                  
                  {/* Package Info */}
                  <div className="flex-1 text-center lg:text-left">
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">
                      {translatedPackage.name}
                    </h1>
                    
                    <p className="text-gray-600 mb-4 text-base leading-relaxed">
                      {translatedPackage.description}
                    </p>
                    
                    {/* Category Badge */}
                    <div className="inline-flex items-center bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg mb-6">
                      <Package className="w-4 h-4 mr-2" />
                      Equipment Package
                    </div>
                  </div>
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="text-center p-3 bg-gradient-to-r from-[#391C71]/10 to-purple-100 rounded-2xl border border-[#391C71]/20">
                    <div className="text-2xl font-bold text-[#391C71] mb-1">{translatedPackage.items.length}</div>
                    <div className="text-xs text-gray-600 font-medium">Equipment Items</div>
                    <Package className="w-4 h-4 text-[#391C71] mx-auto mt-2" />
                  </div>
                  <div className="text-center p-3 bg-gradient-to-r from-[#391C71]/10 to-purple-100 rounded-2xl border border-[#391C71]/20">
                    <div className="text-2xl font-bold text-[#391C71] mb-1">{translatedPackage.totalPrice}</div>
                    <div className="text-xs text-gray-600 font-medium">KWD Per Day</div>
                    <div className="text-base text-[#391C71] mx-auto mt-1">💰</div>
                  </div>
                </div>

                {/* Provider Info */}
                <div className="mb-8">
                  <div className="flex items-center bg-gradient-to-r from-[#391C71]/10 to-purple-100 border border-[#391C71]/20 rounded-2xl p-3">
                    <div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-full p-2 mr-3">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Created by</div>
                      <div className="text-base font-bold text-gray-900">
                        {translatedPackage.createdBy.firstName} {translatedPackage.createdBy.lastName}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Book Button */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleBookPackage}
                    className="flex-1 bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-[#5B2C87] hover:to-[#391C71] transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-3 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <Calendar className="w-6 h-6 relative z-10" />
                    <span className="relative z-10">Book Package - {translatedPackage.totalPrice} KWD/day</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Equipment Items Section */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-[#391C71]/20 to-transparent rounded-br-full"></div>
              <div className="relative z-10">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-full p-2 mr-3">
                    <Package className="w-4 h-4 text-white" />
                  </div>
                  Equipment Items ({translatedPackage.items.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {translatedPackage.items.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-[#391C71]/5 to-purple-50 rounded-2xl p-4 border border-[#391C71]/10 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex items-center gap-4">
                        {/* Equipment Image */}
                        <div className="w-16 h-16 bg-gradient-to-br from-[#391C71]/20 to-purple-200 rounded-xl flex items-center justify-center">
                          {item.equipmentId.images && item.equipmentId.images.length > 0 ? (
                            <Image
                              src={item.equipmentId.images[0]}
                              alt={item.equipmentId.name}
                              width={64}
                              height={64}
                              className="object-cover rounded-xl"
                            />
                          ) : (
                            <Package className="w-6 h-6 text-[#391C71]" />
                          )}
                        </div>
                        
                        {/* Equipment Info */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm">{item.equipmentId.name}</h3>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Tag className="w-3 h-3" />
                            <span>{item.equipmentId.category}</span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs font-semibold text-[#391C71]">
                              {item.equipmentId.pricePerDay} KWD/day
                            </span>
                            <span className="bg-[#391C71] text-white px-2 py-1 rounded-full text-xs">
                              Qty: {item.quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Package Images Gallery */}
            {translatedPackage.images && translatedPackage.images.length > 0 && (
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-[#391C71]/20 to-transparent rounded-br-full"></div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-full p-2 mr-3">
                      <Eye className="w-4 h-4 text-white" />
                    </div>
                    Package Gallery
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {translatedPackage.images.map((image, index) => (
                      <div
                        key={index}
                        className="aspect-square relative overflow-hidden rounded-2xl border-2 border-white shadow-lg hover:shadow-xl transition-shadow duration-300"
                      >
                        <Image
                          src={image}
                          alt={`${packageData.name} image ${index + 1}`}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
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
                    Share Package
                  </h3>
                  <button
                    onClick={handleShare}
                    className="w-full bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white px-6 py-3 rounded-2xl font-semibold hover:from-[#5B2C87] hover:to-[#391C71] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-3 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <Share2 className="w-4 h-4 relative z-10" />
                    <span className="relative z-10 text-sm">Share Package</span>
                  </button>
                </div>

                {/* QR Code Section */}
                <div className="text-center">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center justify-center">
                    <div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-full p-2 mr-3">
                      <QrCode className="w-4 h-4 text-white" />
                    </div>
                    QR Code
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
                    📱 Scan to view this package instantly
                  </p>
                  
                  {/* QR Actions */}
                  <div className="space-y-3">
                    <button
                      onClick={handleDownloadQR}
                      className="w-full bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white px-4 py-3 rounded-2xl font-semibold hover:from-[#5B2C87] hover:to-[#391C71] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <Download className="w-3 h-3" />
                      <span className="text-sm">Download QR</span>
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
                      <span className="text-sm">Copy Link</span>
                    </button>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="text-center bg-gradient-to-r from-[#391C71]/10 to-purple-100 p-4 rounded-2xl border border-[#391C71]/20">
                    <p className="text-xs text-gray-600 mb-2 font-medium">📦 Created on</p>
                    <p className="font-bold text-gray-900 text-sm">
                      {new Date(translatedPackage.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
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