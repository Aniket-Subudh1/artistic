'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Clock, Users, CreditCard, Lock, AlertCircle } from 'lucide-react';
import { seatBookingService, EventLayoutDetails, EventTicketBookingRequest } from '@/services/seat-booking.service';
import { Event } from '@/services/event.service';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SeatBookingInterfaceProps {
  event: Event;
  layoutId?: string;
  onSeatsSelected?: (seats: any[]) => void;
  onBookingComplete?: () => void;
  fullScreen?: boolean;
}

interface SelectedItem {
  id: string;
  type: 'seat' | 'table' | 'booth';
  categoryId: string;
  price: number;
  name?: string;
  position?: { x: number; y: number };
}

export default function SeatBookingInterface({ 
  event, 
  layoutId, 
  onSeatsSelected, 
  onBookingComplete, 
  fullScreen = false 
}: SeatBookingInterfaceProps) {
  const eventId = event?._id;
  
  if (!eventId) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Invalid event information. Unable to load booking interface.
        </AlertDescription>
      </Alert>
    );
  }
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  const [layoutDetails, setLayoutDetails] = useState<EventLayoutDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [bookingStep, setBookingStep] = useState<'selection' | 'details' | 'confirmation'>('selection');
  const [bookingLoading, setBookingLoading] = useState(false);

  // Customer info form
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.firstName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    emergencyContact: '',
    specialRequests: '',
  });

  // Load event layout details
  useEffect(() => {
    loadLayoutDetails();
  }, [eventId]);

  // Call callback when seats are selected
  useEffect(() => {
    if (onSeatsSelected) {
      onSeatsSelected(selectedItems);
    }
  }, [selectedItems, onSeatsSelected]);

  const loadLayoutDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const details = await seatBookingService.getEventLayoutDetails(eventId);
      setLayoutDetails(details);
    } catch (err) {
      console.error('Failed to load event layout:', err);
      setError('Failed to load event details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = useCallback((seatData: any) => {
    if (seatData.bookingStatus !== 'available') return;

    const itemId = seatData.seatId;
    const isSelected = selectedItems.some(item => item.id === itemId);

    if (isSelected) {
      // Deselect
      setSelectedItems(prev => prev.filter(item => item.id !== itemId));
    } else {
      // Select
      const category = layoutDetails?.layout.categories.find(cat => cat.id === seatData.catId);
      const newItem: SelectedItem = {
        id: itemId,
        type: 'seat',
        categoryId: seatData.catId,
        price: seatData.price,
        position: seatData.pos,
      };
      setSelectedItems(prev => [...prev, newItem]);
    }
  }, [selectedItems, layoutDetails]);

  const handleTableClick = useCallback((tableData: any) => {
    if (tableData.bookingStatus !== 'available') return;

    const itemId = tableData.table_id;
    const isSelected = selectedItems.some(item => item.id === itemId);

    if (isSelected) {
      setSelectedItems(prev => prev.filter(item => item.id !== itemId));
    } else {
      const newItem: SelectedItem = {
        id: itemId,
        type: 'table',
        categoryId: tableData.catId,
        price: tableData.price,
        name: tableData.name,
        position: tableData.pos,
      };
      setSelectedItems(prev => [...prev, newItem]);
    }
  }, [selectedItems]);

  const handleBoothClick = useCallback((boothData: any) => {
    if (boothData.bookingStatus !== 'available') return;

    const itemId = boothData.booth_id;
    const isSelected = selectedItems.some(item => item.id !== itemId);

    if (isSelected) {
      setSelectedItems(prev => prev.filter(item => item.id !== itemId));
    } else {
      const newItem: SelectedItem = {
        id: itemId,
        type: 'booth',
        categoryId: boothData.catId,
        price: boothData.price,
        name: boothData.name,
        position: boothData.pos,
      };
      setSelectedItems(prev => [...prev, newItem]);
    }
  }, [selectedItems]);

  const calculateTotal = () => {
    const subtotal = selectedItems.reduce((sum, item) => sum + item.price, 0);
    const serviceFee = event.pricing?.serviceFee || 0;
    const tax = (subtotal * (event.pricing?.taxPercentage || 0)) / 100;
    return {
      subtotal,
      serviceFee,
      tax,
      total: subtotal + serviceFee + tax,
    };
  };

  const handleProceedToDetails = () => {
    if (selectedItems.length === 0) {
      setError('Please select at least one seat, table, or booth.');
      return;
    }
    setBookingStep('details');
  };

  const handleBookingSubmit = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    try {
      setBookingLoading(true);
      setError(null);

      // Validate customer info
      if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
        setError('Please fill in all required fields.');
        return;
      }

      // Prepare booking data
      const bookingData: EventTicketBookingRequest = {
        eventId,
        customerInfo,
        seats: selectedItems
          .filter(item => item.type === 'seat')
          .map(item => ({
            seatId: item.id,
            categoryId: item.categoryId,
            price: item.price,
          })),
        tables: selectedItems
          .filter(item => item.type === 'table')
          .map(item => ({
            tableId: item.id,
            categoryId: item.categoryId,
            price: item.price,
          })),
        booths: selectedItems
          .filter(item => item.type === 'booth')
          .map(item => ({
            boothId: item.id,
            categoryId: item.categoryId,
            price: item.price,
          })),
      };

      const token = localStorage.getItem('authToken') || '';
      const response = await seatBookingService.bookEventTickets(bookingData, token);
      
      // Redirect to payment
      if (response.paymentLink) {
        window.location.href = response.paymentLink;
      } else {
        setBookingStep('confirmation');
      }
    } catch (err: any) {
      console.error('Booking failed:', err);
      setError(err.message || 'Booking failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const renderSeatMap = () => {
    if (!layoutDetails) return null;

    const { layout } = layoutDetails;
    const canvasW = (layout as any).canvasW || 1200;
    const canvasH = (layout as any).canvasH || 700;
    const PADDING = 24; // safe gutter so edge items never get clipped
    
    return (
      <div 
        className={fullScreen 
          ? "w-full h-full bg-gradient-to-br from-purple-50/30 via-white/10 to-pink-50/30 backdrop-blur-sm rounded-3xl overflow-hidden" 
          : "relative bg-white/50 backdrop-blur-sm rounded-xl lg:rounded-2xl border border-white/40 overflow-auto shadow-lg h-full"
        }
        style={{
          height: fullScreen ? '100%' : 'auto'
        }}
      >
        {/* Canvas for seat layout */}
        <div 
          className="relative mx-auto h-full flex items-start justify-start"
          style={{ 
            width: fullScreen ? '100%' : 'auto',
            height: fullScreen ? '100%' : 'auto',
            minHeight: fullScreen ? 'auto' : '400px',
          }}
        >
          {/* Actual seat map container with proper aspect ratio */}
          <div
            className="relative bg-white/30 backdrop-blur-sm rounded-lg lg:rounded-xl border border-white/50 overflow-hidden shadow-sm"
            style={{
              // In fullscreen we keep the aspect approach; otherwise make the canvas its real size plus padding
              width: fullScreen ? '95%' : `${canvasW + PADDING * 2}px`,
              height: fullScreen ? '95%' : `${canvasH + PADDING * 2}px`,
              maxWidth: fullScreen ? 'calc(95vh * 16 / 9)' : 'none',
              maxHeight: fullScreen ? '95vh' : 'none',
              aspectRatio: fullScreen ? '16/9' : 'auto',
              padding: fullScreen ? undefined : `${PADDING}px`
            }}
          >
            {/* Stage label rendering - if present in layout */}
            {layout.items?.find((item) => (item as any).type === 'stage' || (item as any).modelType === 'Stage') && (
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
                <div className="bg-gray-700 text-white px-4 py-2 rounded-lg font-bold text-sm lg:text-base shadow-lg">
                  STAGE / المسرح
                </div>
              </div>
            )}
            
            {/* Render seats */}
            {layout.seats?.map((seat) => {
              const isSelected = selectedItems.some(item => item.id === seat.seatId);
              const isAvailable = seat.bookingStatus === 'available';
              
              return (
                <div
                  key={seat._id}
                  className={`absolute cursor-pointer border-2 rounded flex items-center justify-center text-xs font-medium transition-all hover:scale-110 ${
                    !isAvailable 
                      ? 'bg-red-200 border-red-400 cursor-not-allowed' 
                      : isSelected
                      ? 'bg-[#391C71] border-[#5B2C87] text-white shadow-lg'
                      : 'bg-green-200 border-green-400 hover:bg-green-300 hover:shadow-md'
                  }`}
                  style={{
                    left: `${seat.pos.x}px`,
                    top: `${seat.pos.y}px`,
                    width: `${seat.size.x}px`,
                    height: `${seat.size.y}px`,
                  }}
                  onClick={() => isAvailable && handleSeatClick(seat)}
                  title={`${seat.rl || ''}${seat.sn || ''} - ${seat.price} KWD`}
                >
                  {seat.sn || 'S'}
                </div>
              );
            })}

            {/* Render tables and booths from populated items */}
            {layout.items?.map((item) => {
              if (item.modelType === 'Table') {
                const tableData = item.refId as any; // This would be populated
                const isSelected = selectedItems.some(selectedItem => selectedItem.id === tableData.table_id);
                const isAvailable = tableData.bookingStatus === 'available';
                
                return (
                  <div
                    key={tableData._id}
                    className={`absolute cursor-pointer border-2 rounded-lg flex items-center justify-center text-xs font-medium transition-all hover:scale-105 ${
                      !isAvailable 
                        ? 'bg-red-200 border-red-400 cursor-not-allowed' 
                        : isSelected
                        ? 'bg-[#391C71] border-[#5B2C87] text-white shadow-lg'
                        : 'bg-yellow-200 border-yellow-400 hover:bg-yellow-300 hover:shadow-md'
                    }`}
                    style={{
                      left: `${tableData.pos.x}px`,
                      top: `${tableData.pos.y}px`,
                      width: `${tableData.size.x}px`,
                      height: `${tableData.size.y}px`,
                    }}
                    onClick={() => isAvailable && handleTableClick(tableData)}
                    title={`${tableData.name} - ${tableData.price} KWD`}
                  >
                    T{tableData.ts || ''}
                  </div>
                );
              }

              if (item.modelType === 'Booth') {
                const boothData = item.refId as any; // This would be populated
                const isSelected = selectedItems.some(selectedItem => selectedItem.id === boothData.booth_id);
                const isAvailable = boothData.bookingStatus === 'available';
                
                return (
                  <div
                    key={boothData._id}
                    className={`absolute cursor-pointer border-2 rounded-lg flex items-center justify-center text-xs font-medium transition-all hover:scale-105 ${
                      !isAvailable 
                        ? 'bg-red-200 border-red-400 cursor-not-allowed' 
                        : isSelected
                        ? 'bg-[#391C71] border-[#5B2C87] text-white shadow-lg'
                        : 'bg-purple-200 border-purple-400 hover:bg-purple-300 hover:shadow-md'
                    }`}
                    style={{
                      left: `${boothData.pos.x}px`,
                      top: `${boothData.pos.y}px`,
                      width: `${boothData.size.x}px`,
                      height: `${boothData.size.y}px`,
                    }}
                    onClick={() => isAvailable && handleBoothClick(boothData)}
                    title={`${boothData.name} - ${boothData.price} KWD`}
                  >
                    B
                  </div>
                );
              }

              return null;
            })}
          </div>

          {/* Legend - positioned at bottom for fullscreen, integrated for regular view */}
          {fullScreen && (
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/30 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-200 border border-green-400 rounded"></div>
                <span className="text-gray-700 font-medium">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#391C71] border border-[#5B2C87] rounded"></div>
                <span className="text-gray-700 font-medium">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-200 border border-red-400 rounded"></div>
                <span className="text-gray-700 font-medium">Unavailable</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Legend for non-fullscreen view */}
        {!fullScreen && (
          <div className="absolute bottom-2 right-2 lg:bottom-4 lg:right-4 bg-white/90 backdrop-blur-md rounded-lg lg:rounded-xl p-2 lg:p-3 shadow-lg border border-white/30">
            <div className="flex flex-wrap gap-2 lg:gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 bg-green-200 border border-green-400 rounded"></div>
                <span className="text-gray-700 font-medium">Available</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 bg-[#391C71] border border-[#5B2C87] rounded"></div>
                <span className="text-gray-700 font-medium">Selected</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 bg-red-200 border border-red-400 rounded"></div>
                <span className="text-gray-700 font-medium">Unavailable</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-white/70 backdrop-blur-xl rounded-3xl w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="h-96 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/30"></div>
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/30"></div>
              <div className="h-48 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/30"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !layoutDetails) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Alert variant="destructive" className="bg-white/70 backdrop-blur-xl border border-white/30">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={loadLayoutDetails} variant="outline" className="bg-white/50 backdrop-blur-sm">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!layoutDetails) return null;

  const pricing = calculateTotal();

  return (
    <div className={fullScreen 
      ? "w-full h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 overflow-hidden" 
      : "w-full p-6"
    }>
      {/* Event Header */}
      {!fullScreen && (
        <div className="mb-6 bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-6">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">{event.name}</h1>
          <div className="flex flex-wrap gap-4 text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(event.startDate).toLocaleDateString()} {event.startTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{event.venue.name}, {event.venue.city}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{event.startTime} - {event.endTime}</span>
            </div>
          </div>
        </div>
      )}

      {error && !fullScreen && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={bookingStep} className="space-y-6">
        {!fullScreen && (
          <TabsList className="grid w-full grid-cols-3 bg-white/70 backdrop-blur-xl border border-white/30">
            <TabsTrigger value="selection" disabled={bookingStep !== 'selection'}>
              1. Select Seats
            </TabsTrigger>
            <TabsTrigger value="details" disabled={bookingStep === 'selection'}>
              2. Your Details
            </TabsTrigger>
            <TabsTrigger value="confirmation" disabled={bookingStep !== 'confirmation'}>
              3. Confirmation
            </TabsTrigger>
          </TabsList>
        )}

        <TabsContent value="selection" className=" space-y-6">
          {fullScreen ? (
            // Full-screen seat map with enhanced floating summary
            <div className="h-full w-full">
              {renderSeatMap()}
              {/* Enhanced Floating selection summary for full-screen */}
              {selectedItems.length > 0 && (
                <div className="fixed bottom-4 right-4 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-4 lg:p-6 max-w-sm z-30">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#391C71] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{selectedItems.length}</span>
                    </div>
                    Selected Seats
                  </h3>
                  <div className="space-y-2 text-sm max-h-32 overflow-y-auto mb-4">
                    {selectedItems.slice(0, 3).map((item, index) => (
                      <div key={`${item.type}-${item.id}`} className="flex justify-between bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-white/40">
                        <span className="font-medium text-gray-800">{item.type === 'seat' ? `Seat ${item.id}` : item.name || `${item.type} ${item.id}`}</span>
                        <span className="text-[#391C71] font-bold">{item.price} KWD</span>
                      </div>
                    ))}
                    {selectedItems.length > 3 && (
                      <div className="text-gray-600 text-center bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-white/30">+{selectedItems.length - 3} more items</div>
                    )}
                  </div>
                  <div className="border-t border-white/40 pt-3 mt-3">
                    <div className="flex justify-between font-bold text-lg text-gray-800 mb-3">
                      <span>Total:</span>
                      <span className="text-[#391C71]">{pricing.total.toFixed(2)} KWD</span>
                    </div>
                    <Button 
                      onClick={() => {
                        if (onBookingComplete) onBookingComplete();
                      }}
                      className="w-full bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white font-bold hover:from-[#5B2C87] hover:to-[#391C71] transition-all duration-300"
                      disabled={selectedItems.length === 0}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Continue Booking
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* New Responsive Layout: Seat Map Left, Sidebar Right */}
              <div className="flex flex-col xl:flex-row gap-2 lg:gap-6 h-full">
                {/* Left Side - Seat Map Container (adjustable width based on screen size) */}
                <div className="flex-1 xl:w-[75%] min-h-[70vh]">
                  <div className="bg-white/70 backdrop-blur-xl rounded-2xl lg:rounded-3xl shadow-2xl border border-white/30 p-4 lg:p-6 h-full">
                    <div className="flex items-center justify-between mb-3 lg:mb-4">
                      <h3 className="text-lg lg:text-xl font-bold text-gray-900 flex items-center gap-2">
                        <div className="w-5 h-5 lg:w-6 lg:h-6 bg-[#391C71] rounded-full flex items-center justify-center">
                          <Users className="h-2.5 w-2.5 lg:h-3 lg:w-3 text-white" />
                        </div>
                        <span className="hidden sm:inline">Select Your Seats</span>
                        <span className="sm:hidden">Select Seats</span>
                      </h3>
                      <div className="text-xs lg:text-sm text-gray-600 bg-white/60 px-2 py-1 rounded-lg">
                        {selectedItems.length} selected
                      </div>
                    </div>
                    
                    {/* Seat Map with proper spacing */}
                    <div className="h-[calc(100%-3rem)] lg:h-[calc(100%-4rem)] min-h-[60vh]">
                      {renderSeatMap()}
                    </div>
                  </div>
                </div>

                {/* Right Sidebar - Pricing and Purchase (responsive width) */}
                <div className="w-full xl:w-[25%] xl:min-w-[320px] space-y-4 lg:space-y-6 xl:sticky xl:top-4 self-start">
                  
                  {/* Mobile: Compact Price Legend Card */}
                  <Card className="bg-white/70 backdrop-blur-xl border border-white/30 shadow-xl xl:block">
                    <CardHeader className="pb-2 lg:pb-3">
                      <CardTitle className="flex items-center gap-2 text-gray-800 text-base lg:text-lg">
                        <div className="w-4 h-4 lg:w-5 lg:h-5 bg-gradient-to-r from-[#391C71] to-[#5B2C87] rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">₿</span>
                        </div>
                        <span className="hidden md:inline">Ticket Prices</span>
                        <span className="md:hidden">Prices</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 lg:space-y-3">
                      {/* Price Categories - Mobile optimized */}
                      {layoutDetails?.layout.categories
                        ?.filter(category => category.appliesTo === 'seat')
                        ?.slice(0, 4) // Limit on mobile
                        ?.map((category) => (
                        <div key={category.id} className="flex items-center justify-between p-2 lg:p-3 bg-white/40 backdrop-blur-sm rounded-lg lg:rounded-xl border border-white/30">
                          <div className="flex items-center gap-2 lg:gap-3">
                            <div 
                              className="w-3 h-3 lg:w-4 lg:h-4 rounded-full border-2"
                              style={{ backgroundColor: category.color, borderColor: category.color }}
                            />
                            <span className="font-medium text-gray-800 text-sm lg:text-base truncate">{category.name}</span>
                          </div>
                          <span className="font-bold text-[#391C71] text-sm lg:text-base">{category.price} KWD</span>
                        </div>
                      ))}
                      
                      {/* Show more categories link for mobile */}
                      {layoutDetails?.layout.categories?.filter(category => category.appliesTo === 'seat').length > 4 && (
                        <div className="text-center xl:hidden">
                          <Button variant="ghost" size="sm" className="text-[#391C71] text-xs">
                            +{layoutDetails.layout.categories.filter(category => category.appliesTo === 'seat').length - 4} more
                          </Button>
                        </div>
                      )}
                      
                      {/* Table/Booth Pricing if available - Hidden on small mobile */}
                      <div className="hidden sm:block xl:block">
                        {layoutDetails?.layout.categories
                          ?.filter(category => ['table', 'booth'].includes(category.appliesTo))
                          ?.slice(0, 2)
                          ?.map((category) => (
                          <div key={category.id} className="flex items-center justify-between p-2 lg:p-3 bg-white/40 backdrop-blur-sm rounded-lg lg:rounded-xl border border-white/30">
                            <div className="flex items-center gap-2 lg:gap-3">
                              <div 
                                className="w-3 h-3 lg:w-4 lg:h-4 rounded border-2"
                                style={{ backgroundColor: category.color, borderColor: category.color }}
                              />
                              <span className="font-medium text-gray-800 text-sm lg:text-base truncate">{category.name}</span>
                            </div>
                            <span className="font-bold text-[#391C71] text-sm lg:text-base">{category.price} KWD</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Selected Items Card - Always visible */}
                  <Card className="bg-white/70 backdrop-blur-xl border border-white/30 shadow-xl">
                    <CardHeader className="pb-2 lg:pb-3">
                      <CardTitle className="flex items-center gap-2 text-gray-800 text-base lg:text-lg">
                        <Users className="h-4 w-4 lg:h-5 lg:w-5 text-[#391C71]" />
                        <span className="hidden sm:inline">Selected Items ({selectedItems.length})</span>
                        <span className="sm:hidden">Selected ({selectedItems.length})</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedItems.length === 0 ? (
                        <div className="text-center py-4 lg:py-6">
                          <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 lg:mb-3">
                            <Users className="h-6 w-6 lg:h-8 lg:w-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium text-sm lg:text-base">No seats selected</p>
                          <p className="text-xs lg:text-sm text-gray-400 mt-1 hidden sm:block">Click on available seats to select them</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-32 lg:max-h-48 overflow-y-auto">
                          {selectedItems.map((item, index) => (
                            <div key={`${item.type}-${item.id}`} className="flex justify-between items-center p-2 lg:p-3 bg-white/50 backdrop-blur-sm rounded-lg lg:rounded-xl border border-white/40 shadow-sm hover:bg-white/70 transition-colors">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-800 text-sm lg:text-base truncate">
                                  {item.type === 'seat' ? `Seat ${item.id}` : item.name || `${item.type} ${item.id}`}
                                </div>
                                <div className="text-xs lg:text-sm text-gray-600 truncate">
                                  {item.categoryId}
                                </div>
                              </div>
                              <div className="text-right flex items-center gap-2">
                                <div className="font-bold text-[#391C71] text-sm lg:text-base">{item.price} KWD</div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setSelectedItems(prev => prev.filter((_, i) => i !== index))}
                                  className="text-gray-500 hover:text-red-500 hover:bg-red-50/50 w-6 h-6 lg:w-8 lg:h-8 p-0 text-lg"
                                >
                                  ×
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Pricing Summary & Purchase Card - Sticky on mobile */}
                  {selectedItems.length > 0 && (
                    <Card className="bg-gradient-to-br from-[#391C71]/5 to-[#5B2C87]/5 backdrop-blur-xl border border-[#391C71]/20 shadow-xl sticky bottom-4 xl:static">
                      <CardHeader className="pb-2 lg:pb-3">
                        <CardTitle className="flex items-center gap-2 text-gray-800 text-base lg:text-lg">
                          <CreditCard className="h-4 w-4 lg:h-5 lg:w-5 text-[#391C71]" />
                          <span className="hidden sm:inline">Order Summary</span>
                          <span className="sm:hidden">Total</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 lg:space-y-4">
                        {/* Pricing Breakdown - Collapsible on mobile */}
                        <div className="space-y-2 text-sm">
                          {/* Mobile: Show only total, expandable details */}
                          <div className="block xl:hidden">
                            <div className="flex justify-between p-2 bg-white/40 rounded-lg">
                              <span className="text-gray-700 font-medium">Total ({selectedItems.length} items):</span>
                              <span className="font-bold text-[#391C71]">{pricing.total.toFixed(2)} KWD</span>
                            </div>
                          </div>
                          
                          {/* Desktop: Full breakdown */}
                          <div className="hidden xl:block space-y-2">
                            <div className="flex justify-between p-2 bg-white/40 rounded-lg">
                              <span className="text-gray-700">Subtotal:</span>
                              <span className="font-medium text-gray-800">{pricing.subtotal.toFixed(2)} KWD</span>
                            </div>
                            {pricing.serviceFee > 0 && (
                              <div className="flex justify-between p-2 bg-white/40 rounded-lg">
                                <span className="text-gray-700">Service Fee:</span>
                                <span className="font-medium text-gray-800">{pricing.serviceFee.toFixed(2)} KWD</span>
                              </div>
                            )}
                            {pricing.tax > 0 && (
                              <div className="flex justify-between p-2 bg-white/40 rounded-lg">
                                <span className="text-gray-700">Tax:</span>
                                <span className="font-medium text-gray-800">{pricing.tax.toFixed(2)} KWD</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <hr className="border-white/50 hidden xl:block" />

                        {/* Total - Desktop only (mobile shows in breakdown above) */}
                        <div className="bg-gradient-to-r from-[#391C71]/10 to-[#5B2C87]/10 rounded-xl p-3 lg:p-4 border border-[#391C71]/20 hidden xl:block">
                          <div className="flex justify-between items-center">
                            <span className="text-base lg:text-lg font-bold text-gray-800">Total:</span>
                            <span className="text-xl lg:text-2xl font-bold text-[#391C71]">{pricing.total.toFixed(2)} KWD</span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                          </div>
                        </div>

                        {/* Purchase Button - Responsive sizing */}
                        <Button 
                          className="w-full bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white font-bold text-base lg:text-lg py-4 lg:py-6 rounded-xl lg:rounded-2xl hover:from-[#5B2C87] hover:to-[#391C71] transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                          onClick={handleProceedToDetails}
                          disabled={selectedItems.length === 0}
                        >
                          <CreditCard className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                          <span className="hidden sm:inline">Purchase Tickets</span>
                          <span className="sm:hidden">Purchase</span>
                        </Button>

                        {/* Apply Coupon - Hidden on small mobile */}
                        <div className="pt-2 hidden sm:block">
                          <Button 
                            variant="outline"
                            className="w-full border-[#391C71]/30 text-[#391C71] hover:bg-[#391C71]/10 transition-colors text-sm lg:text-base"
                            onClick={() => {
                              // Add coupon functionality here
                            }}
                          >
                            Apply Coupon
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Event Info Card - Condensed on mobile */}
                  <Card className="bg-white/60 backdrop-blur-xl border border-white/30 shadow-xl hidden lg:block xl:block">
                    <CardHeader className="pb-2 lg:pb-3">
                      <CardTitle className="text-sm font-semibold text-gray-700">Event Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-3 w-3 lg:h-4 lg:w-4" />
                        <span>{new Date(event.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-3 w-3 lg:h-4 lg:w-4" />
                        <span>{event.startTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-3 w-3 lg:h-4 lg:w-4" />
                        <span className="truncate">{event.venue.name}, {event.venue.city}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/70 backdrop-blur-xl border border-white/30 shadow-xl">
              <CardHeader>
                <CardTitle className="text-gray-800">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      value={customerInfo.emergencyContact}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, emergencyContact: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="specialRequests">Special Requests</Label>
                  <Textarea
                    id="specialRequests"
                    value={customerInfo.specialRequests}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, specialRequests: e.target.value }))}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-xl border border-white/30 shadow-xl">
              <CardHeader>
                <CardTitle className="text-gray-800">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 p-3 bg-white/40 backdrop-blur-sm rounded-xl border border-white/30">
                  <h4 className="font-medium text-gray-800">Event Details</h4>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium text-[#391C71]">{event.name}</div>
                    <div>{new Date(event.startDate).toLocaleDateString()} {event.startTime}</div>
                    <div>{event.venue.name}, {event.venue.city}</div>
                  </div>
                </div>

                <div className="space-y-2 p-3 bg-white/40 backdrop-blur-sm rounded-xl border border-white/30">
                  <h4 className="font-medium text-gray-800">Selected Items</h4>
                  {selectedItems.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm p-2 bg-white/30 rounded-lg">
                      <span className="text-gray-700">{item.type === 'seat' ? `Seat ${item.id}` : item.name || `${item.type} ${item.id}`}</span>
                      <span className="font-medium text-[#391C71]">{item.price} KWD</span>
                    </div>
                  ))}
                </div>

                <hr className="border-white/50" />
                
                <div className="space-y-2 text-sm p-3 bg-white/40 backdrop-blur-sm rounded-xl border border-white/30">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Subtotal:</span>
                    <span className="text-gray-800">{pricing.subtotal.toFixed(2)} KWD</span>
                  </div>
                  {pricing.serviceFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Service Fee:</span>
                      <span className="text-gray-800">{pricing.serviceFee.toFixed(2)} KWD</span>
                    </div>
                  )}
                  {pricing.tax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Tax:</span>
                      <span className="text-gray-800">{pricing.tax.toFixed(2)} KWD</span>
                    </div>
                  )}
                </div>

                <hr className="border-white/50" />

                <div className="flex justify-between font-bold p-3 bg-gradient-to-r from-[#391C71]/10 to-[#5B2C87]/10 rounded-xl border border-[#391C71]/20">
                  <span className="text-gray-800">Total:</span>
                  <span className="text-[#391C71]">{pricing.total.toFixed(2)} KWD</span>
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setBookingStep('selection')}
                    className="flex-1 border-white/50 bg-white/30 backdrop-blur-sm hover:bg-white/50"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleBookingSubmit}
                    disabled={bookingLoading}
                    className="flex-1 bg-[#391C71] hover:bg-[#5B2C87] text-white"
                  >
                    {bookingLoading ? (
                      <>
                        <Lock className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Proceed to Payment
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="confirmation">
          <Card className="bg-white/70 backdrop-blur-xl border border-white/30 shadow-xl">
            <CardHeader>
              <CardTitle className="text-gray-800 flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                Booking Confirmed!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-50/70 backdrop-blur-sm rounded-xl border border-green-200/50">
                <p className="text-green-800">Your booking has been confirmed. You will receive a confirmation email shortly.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>  
  );
}