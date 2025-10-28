'use client';

import React, { useState } from 'react';
import { 
  ShoppingCart, 
  X, 
  Calendar,
  Package,
  Wrench,
  Trash2,
  CreditCard,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { 
  equipmentPackageBookingService,
  CreateEquipmentPackageBookingRequest
} from '@/services/equipment-package-booking.service';
import { EquipmentBookingService, EquipmentBookingRequest } from '@/services/equipment-booking.service';
import { useAuthLogic } from '@/hooks/useAuth';
import { EquipmentPackage } from '@/services/equipment-packages.service';
import { CustomEquipmentPackage } from '@/services/custom-equipment-packages.service';
import { CountryCodeDropdown, Country, getDefaultCountry, formatPhoneNumber } from '@/components/ui/CountryCodeDropdown';
import { PaymentInitiateRequest, PaymentService } from '@/services/payment.service';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cartItems, removeFromCart, clearCart, getTotalPrice, getTotalDays } = useCart();
  const { user, isAuthenticated } = useAuthLogic();
  const router = useRouter();

  // Booking form state
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    userDetails: {
      name: user ? `${user.firstName} ${user.lastName}` : '',
      email: user?.email || '',
      phone: '',
    },
    venueDetails: {
      address: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      venueType: '',
      additionalInfo: '',
    },
    eventDescription: '',
    specialRequests: '',
  });

  const [selectedCountry, setSelectedCountry] = useState<Country>(getDefaultCountry());

  const updateFormData = (section: 'userDetails' | 'venueDetails', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const validateForm = () => {
    if (!formData.userDetails.name || !formData.userDetails.email || !formData.userDetails.phone) {
      setError('Please fill in all contact details');
      return false;
    }

    if (!formData.venueDetails.address || !formData.venueDetails.city || 
        !formData.venueDetails.state || !formData.venueDetails.country) {
      setError('Please fill in all venue details');
      return false;
    }

    return true;
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setShowBookingForm(true);
  };

  const processBooking = async () => {
    if (!validateForm()) return;
    
    setSubmitting(true);
    setError('');

    try {
  const formattedPhone = formatPhoneNumber(selectedCountry.code, formData.userDetails.phone);
      
      if (cartItems.length === 0) {
        setError('Your cart is empty');
        return;
      }

      // If multiple items are in the cart, create bookings for all and initiate a single combined payment.
      if (cartItems.length > 1) {
        type BookingBuild = { bookingId: string; type: PaymentInitiateRequest['type']; amount: number; description: string };
        const built: BookingBuild[] = [];

        const getDaysInclusive = (start: string, end: string): number => {
          const s = new Date(start);
          const e = new Date(end);
          const ms = e.getTime() - s.getTime();
          return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
        };

        for (const item of cartItems) {
          if (item.type === 'regular') {
            const days = getDaysInclusive(item.startDate, item.endDate);
            const perDay = (item.package as EquipmentPackage).totalPrice;
            const amountKwd = perDay * days;
            const description = `Equipment Package: ${(item.package as EquipmentPackage).name}`;
            const paymentType: PaymentInitiateRequest['type'] = 'equipment-package';

            const bookingData: CreateEquipmentPackageBookingRequest = {
              packageId: item.package._id,
              startDate: item.startDate,
              endDate: item.endDate,
              userDetails: {
                ...formData.userDetails,
                phone: formattedPhone,
              },
              venueDetails: formData.venueDetails,
              eventDescription: formData.eventDescription,
              specialRequests: formData.specialRequests,
            };

            const response = await equipmentPackageBookingService.createBooking(bookingData);
            const bookingId = (response as any)?.booking?._id || (response as any)?._id || (response as any)?.id || (response as any)?.bookingId;
            if (!bookingId) throw new Error('Unable to determine booking ID for package booking');
            built.push({ bookingId, type: paymentType, amount: amountKwd, description });
          } else {
            const days = getDaysInclusive(item.startDate, item.endDate);
            const perDay = (item.package as CustomEquipmentPackage).totalPricePerDay;
            const amountKwd = perDay * days;
            const description = `Custom Equipment Package: ${(item.package as CustomEquipmentPackage).name}`;
            const paymentType: PaymentInitiateRequest['type'] = 'custom-equipment-package';

            const generateEquipmentDates = (start: string, end: string) => {
              const dates: { date: string; startTime: string; endTime: string }[] = [];
              const s = new Date(start + 'T00:00:00Z');
              const e = new Date(end + 'T00:00:00Z');
              for (let d = new Date(s); d.getTime() <= e.getTime(); d.setUTCDate(d.getUTCDate() + 1)) {
                const iso = d.toISOString().split('T')[0];
                dates.push({ date: iso, startTime: '09:00', endTime: '18:00' });
              }
              return dates;
            };

            const equipmentBooking: EquipmentBookingRequest = {
              userEquipmentPackages: [item.package._id],
              equipments: [],
              packages: [],
              date: item.startDate,
              startTime: '09:00',
              endTime: '18:00',
              totalPrice: amountKwd,
              address: `${formData.venueDetails.address}, ${formData.venueDetails.city}, ${formData.venueDetails.state}, ${formData.venueDetails.country}`,
              isMultiDay: item.startDate !== item.endDate,
              equipmentDates: item.startDate !== item.endDate ? generateEquipmentDates(item.startDate, item.endDate) : undefined,
            };

            const response = await EquipmentBookingService.createEquipmentBooking(equipmentBooking);
            const bookingId = (response as any)?._id || (response as any)?.id || (response as any)?.bookingId || (response as any)?.booking?._id;
            if (!bookingId) throw new Error('Unable to determine booking ID for custom equipment booking');
            built.push({ bookingId, type: paymentType, amount: amountKwd, description });
          }
        }

        const batchPayload = {
          items: built.map((b) => ({ bookingId: b.bookingId, type: b.type, amount: b.amount, description: b.description })),
          customerMobile: formattedPhone,
        };
        const batch = await PaymentService.initiateBatch(batchPayload);
        if (!batch?.paymentLink) throw new Error('Batch payment link not received');

        // Clear cart and redirect
        clearCart();
        PaymentService.redirectToPayment(batch.paymentLink);
        return;
      }

      // Single item flow
      const item = cartItems[0];

      // Helper to compute number of days between start and end (inclusive)
      const getDaysInclusive = (start: string, end: string): number => {
        const s = new Date(start);
        const e = new Date(end);
        const ms = e.getTime() - s.getTime();
        return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
      };

      // Create booking depending on type
      let bookingId = '';
      let amountKwd = 0;
      let paymentType: PaymentInitiateRequest['type'] = 'equipment-package';
      let description = '';

      if (item.type === 'regular') {
        const days = getDaysInclusive(item.startDate, item.endDate);
        const perDay = (item.package as EquipmentPackage).totalPrice;
        amountKwd = perDay * days;
        description = `Equipment Package: ${(item.package as EquipmentPackage).name}`;
        paymentType = 'equipment-package';

        const bookingData: CreateEquipmentPackageBookingRequest = {
          packageId: item.package._id,
          startDate: item.startDate,
          endDate: item.endDate,
          userDetails: {
            ...formData.userDetails,
            phone: formattedPhone,
          },
          venueDetails: formData.venueDetails,
          eventDescription: formData.eventDescription,
          specialRequests: formData.specialRequests,
        };

        const response = await equipmentPackageBookingService.createBooking(bookingData);
        bookingId = (response as any)?.booking?._id || (response as any)?._id || (response as any)?.id || (response as any)?.bookingId;
        if (!bookingId) throw new Error('Unable to determine booking ID for package booking');

        // Prefer server-provided paymentLink if present
        const serverPaymentLink = (response as any)?.paymentLink;
        if (serverPaymentLink) {
          PaymentService.redirectToPayment(serverPaymentLink);
          return;
        }
  } else {
        // Custom package: create equipment booking with userEquipmentPackages
        const days = getDaysInclusive(item.startDate, item.endDate);
        const perDay = (item.package as CustomEquipmentPackage).totalPricePerDay;
        amountKwd = perDay * days;
        description = `Custom Equipment Package: ${(item.package as CustomEquipmentPackage).name}`;
  paymentType = 'custom-equipment-package';

        // Build equipmentDates for multi-day range
        const generateEquipmentDates = (start: string, end: string) => {
          const dates: { date: string; startTime: string; endTime: string }[] = [];
          const s = new Date(start + 'T00:00:00Z');
          const e = new Date(end + 'T00:00:00Z');
          for (let d = new Date(s); d.getTime() <= e.getTime(); d.setUTCDate(d.getUTCDate() + 1)) {
            const iso = d.toISOString().split('T')[0];
            dates.push({ date: iso, startTime: '09:00', endTime: '18:00' });
          }
          return dates;
        };

        const equipmentBooking: EquipmentBookingRequest = {
          userEquipmentPackages: [item.package._id],
          equipments: [],
          packages: [],
          date: item.startDate,
          startTime: '09:00',
          endTime: '18:00',
          totalPrice: amountKwd,
          address: `${formData.venueDetails.address}, ${formData.venueDetails.city}, ${formData.venueDetails.state}, ${formData.venueDetails.country}`,
          isMultiDay: item.startDate !== item.endDate,
          equipmentDates: item.startDate !== item.endDate ? generateEquipmentDates(item.startDate, item.endDate) : undefined,
        };

        const response = await EquipmentBookingService.createEquipmentBooking(equipmentBooking);
        bookingId = (response as any)?._id || (response as any)?.id || (response as any)?.bookingId || (response as any)?.booking?._id;
        if (!bookingId) throw new Error('Unable to determine booking ID for custom equipment booking');

        // Prefer server-provided payment link
        const serverPaymentLink = (response as any)?.paymentLink;
        if (serverPaymentLink) {
          PaymentService.redirectToPayment(serverPaymentLink);
          return;
        }
      }

      // Initiate payment for the created booking
      const paymentData: PaymentInitiateRequest = {
        bookingId,
        amount: amountKwd,
        type: paymentType,
        description,
        customerMobile: formattedPhone,
      };

      const paymentResponse = await PaymentService.initiatePayment(paymentData);
      if (!paymentResponse?.paymentLink) {
        throw new Error('Payment link not received from server');
      }

  // Optionally remove the processed item from cart before redirect
  removeFromCart(item.id);
      PaymentService.redirectToPayment(paymentResponse.paymentLink);
      
    } catch (err: any) {
      console.error('❌ Booking creation failed:', err);
      setError(err.message || 'Failed to create bookings');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#391C71] to-[#5B2C87] p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-6 h-6" />
                <h2 className="text-xl font-bold">Package Cart</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-white/80 text-sm mt-2">
              {cartItems.length} package{cartItems.length !== 1 ? 's' : ''} in cart
            </p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 mb-6">Add packages to get started with your booking</p>
                <button
                  onClick={onClose}
                  className="bg-[#391C71] text-white px-6 py-3 rounded-lg hover:bg-[#2d1659] transition-colors"
                >
                  Browse Packages
                </button>
              </div>
            ) : !showBookingForm ? (
              <>
                {/* Cart Items */}
                <div className="p-6 space-y-4">
                  {cartItems.map((item) => {
                    const days = getTotalDays(item.startDate, item.endDate);
                    const packagePrice = item.type === 'regular' 
                      ? (item.package as EquipmentPackage).totalPrice 
                      : (item.package as CustomEquipmentPackage).totalPricePerDay;
                    const totalPrice = packagePrice * days;

                    return (
                      <div key={item.id} className="bg-gray-50 rounded-2xl p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-full ${
                              item.type === 'regular' 
                                ? 'bg-purple-100 text-[#391C71]' 
                                : 'bg-orange-100 text-orange-500'
                            }`}>
                              {item.type === 'regular' ? (
                                <Package className="w-5 h-5" />
                              ) : (
                                <Wrench className="w-5 h-5" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{item.package.name}</h4>
                              <p className="text-sm text-gray-600 line-clamp-2">{item.package.description}</p>
                              <div className="text-xs text-gray-500 mt-1">
                                {item.type === 'regular' ? 'Provider Package' : 'Custom Package'}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 rounded-full text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="bg-white rounded-xl p-3 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Dates:</span>
                            <span className="font-medium">{item.startDate} to {item.endDate}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Duration:</span>
                            <span className="font-medium">{days} day{days > 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Price per day:</span>
                            <span className="font-medium">{packagePrice} KWD</span>
                          </div>
                          <div className="flex items-center justify-between text-lg font-bold pt-2 border-t">
                            <span>Total:</span>
                            <span className="text-[#391C71]">{totalPrice} KWD</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="border-t bg-white p-6 space-y-4">
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Grand Total:</span>
                    <span className="text-[#391C71]">{getTotalPrice()} KWD</span>
                  </div>
                  
                  <button
                    onClick={() => clearCart()}
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                  >
                    Clear Cart
                  </button>
                  
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white py-4 rounded-2xl font-bold hover:from-[#5B2C87] hover:to-[#391C71] transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    Proceed to Checkout
                  </button>
                </div>
              </>
            ) : (
              /* Booking Form */
              <form onSubmit={(e) => { e.preventDefault(); processBooking(); }} className="p-6 space-y-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Details</h3>
                  <p className="text-gray-600 text-sm">Complete your information to finalize your booking</p>
                </div>

                {/* Contact Details */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Contact Information</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={formData.userDetails.name}
                        onChange={(e) => updateFormData('userDetails', 'name', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71]"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.userDetails.email}
                        onChange={(e) => updateFormData('userDetails', 'email', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71]"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <div className="flex">
                        <CountryCodeDropdown
                          selectedCountry={selectedCountry}
                          onCountrySelect={setSelectedCountry}
                          buttonClassName="border-r-0 h-12 bg-white rounded-r-none"
                        />
                        <input
                          type="tel"
                          value={formData.userDetails.phone}
                          onChange={(e) => updateFormData('userDetails', 'phone', e.target.value)}
                          className="flex-1 px-4 py-3 border border-gray-300 border-l-0 rounded-r-xl focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71]"
                          placeholder="Enter phone number"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Venue Details */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Venue Information</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <input
                        type="text"
                        value={formData.venueDetails.address}
                        onChange={(e) => updateFormData('venueDetails', 'address', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71]"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <input
                          type="text"
                          value={formData.venueDetails.city}
                          onChange={(e) => updateFormData('venueDetails', 'city', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71]"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                        <input
                          type="text"
                          value={formData.venueDetails.state}
                          onChange={(e) => updateFormData('venueDetails', 'state', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71]"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                      <input
                        type="text"
                        value={formData.venueDetails.country}
                        onChange={(e) => updateFormData('venueDetails', 'country', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71]"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Optional Details */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Additional Information (Optional)</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Event Description</label>
                      <textarea
                        value={formData.eventDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, eventDescription: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71]"
                        placeholder="Describe your event..."
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-6">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white py-4 rounded-2xl font-bold hover:from-[#5B2C87] hover:to-[#391C71] transition-all duration-300 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Complete Booking ({getTotalPrice()} KWD)
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="w-full text-gray-600 hover:text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back to Cart
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="absolute bottom-4 left-4 right-4 bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
            <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {success && (
          <div className="absolute bottom-4 left-4 right-4 bg-green-50 border border-green-200 text-green-800 p-4 rounded-2xl flex items-start gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Success</p>
              <p className="text-sm">{success}</p>
            </div>
            <button onClick={() => setSuccess('')} className="text-green-600 hover:text-green-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}