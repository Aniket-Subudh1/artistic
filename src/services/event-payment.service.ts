import { eventService } from './event.service';
import { PaymentService } from './payment.service';
import { API_CONFIG } from '../lib/api-config';
import { SelectedArtist } from '@/components/venue-owner/ArtistBookingFlow';
import { SelectedEquipment } from '@/components/venue-owner/EquipmentRentalFlow';

export interface EventPaymentRequest {
  eventData: any;
  coverPhoto?: File;
  token?: string;
  userRole: 'admin' | 'venue_owner';
  selectedArtists: SelectedArtist[];
  selectedEquipment: SelectedEquipment[];
}

export interface EventPaymentResponse {
  paymentRequired: boolean;
  eventId?: string;
  paymentLink?: string;
  trackId?: string;
  comboBookingId?: string;
  totalAmount?: number;
}

export class EventPaymentService {
  /**
   * Determine if payment is required based on user role and selections
   */
  static requiresPayment(
    userRole: 'admin' | 'venue_owner',
    selectedArtists: SelectedArtist[],
    selectedEquipment: SelectedEquipment[]
  ): boolean {
    // Admin never pays for events
    if (userRole === 'admin') {
      return false;
    }

    // Venue owner pays for ANY artists or equipment (both custom and non-custom with fees)
    const hasPayableArtists = selectedArtists.some(artist => 
      artist.fee && artist.fee > 0
    );
    
    const hasPayableEquipment = selectedEquipment.some(equipment => 
      equipment.totalPrice && equipment.totalPrice > 0
    );

    return hasPayableArtists || hasPayableEquipment;
  }

  /**
   * Calculate total cost for venue owner
   */
  static calculateEventCost(
    selectedArtists: SelectedArtist[],
    selectedEquipment: SelectedEquipment[]
  ): number {
    let total = 0;

    // Add cost for ALL artists with fees (both custom and non-custom)
    selectedArtists.forEach(artist => {
      if (artist.fee && artist.fee > 0) {
        total += artist.fee;
      }
    });

    // Add cost for ALL equipment with prices
    selectedEquipment.forEach(equipment => {
      if (equipment.totalPrice && equipment.totalPrice > 0) {
        total += equipment.totalPrice;
      }
    });

    return total;
  }

  /**
   * Convert File to base64 string
   */
  static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Store event data temporarily on backend before payment
   */
  static async storeEventDataBeforePayment(
    comboBookingId: string,
    eventData: any,
    selectedArtists: SelectedArtist[],
    selectedEquipment: SelectedEquipment[],
    coverPhoto: File | null,
    token: string
  ): Promise<{ success: boolean }> {
    try {
      // Convert cover photo to base64 if provided
      let coverPhotoBase64 = null;
      if (coverPhoto) {
        coverPhotoBase64 = await this.fileToBase64(coverPhoto);
      }

      const payloadData = {
        eventData,
        selectedArtists,
        selectedEquipment,
        coverPhotoBase64,
        coverPhoto: coverPhoto ? {
          name: coverPhoto.name,
          size: coverPhoto.size,
          type: coverPhoto.type
        } : null,
        token,
        timestamp: new Date().toISOString()
      };

      const response = await fetch(`${API_CONFIG.BASE_URL}/events/store-pending-event-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          comboBookingId,
          data: payloadData
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        console.error('Store event data failed:', errorMessage, errorData);
        throw new Error(`Failed to store event data: ${errorMessage}`);
      }

      const result = await response.json();
      return { success: result.success };
    } catch (error) {
      console.error('Error storing event data:', error);
      throw error instanceof Error ? error : new Error('Failed to store event data before payment');
    }
  }

  /**
   * Create event with payment handling
   */
  static async createEventWithPayment(request: EventPaymentRequest): Promise<EventPaymentResponse> {
    const { eventData, coverPhoto, token, userRole, selectedArtists, selectedEquipment } = request;

    // Check if payment is required
    if (!this.requiresPayment(userRole, selectedArtists, selectedEquipment)) {
      // No payment required - create event directly
      const createdEvent = userRole === 'admin'
        ? await eventService.createEventAsAdmin(eventData, coverPhoto, token)
        : await eventService.createEventAsVenueOwner(eventData, coverPhoto, token);

      return {
        paymentRequired: false,
        eventId: createdEvent._id
      };
    }

    // Payment required - prepare payment
    const totalAmount = this.calculateEventCost(selectedArtists, selectedEquipment);
    
    // Generate a unique combo booking ID for this event creation
    const comboBookingId = `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    if (totalAmount === 0) {
      // Fallback - no payment needed, create event directly
      const createdEvent = await eventService.createEventAsVenueOwner(eventData, coverPhoto, token);
      return {
        paymentRequired: false,
        eventId: createdEvent._id
      };
    }

    try {
      // Store event data on backend before payment
      await this.storeEventDataBeforePayment(
        comboBookingId,
        eventData,
        selectedArtists,
        selectedEquipment,
        coverPhoto || null,
        token!
      );

     
      const paymentResponse = await PaymentService.initiatePayment({
        bookingId: comboBookingId,
        type: 'artist', 
        amount: totalAmount,
        description: `Event creation: ${eventData.name || 'New Event'} (Artists & Equipment)`
      });

      return {
        paymentRequired: true,
        paymentLink: paymentResponse.paymentLink,
        trackId: paymentResponse.trackId,
        comboBookingId,
        totalAmount
      };
    } catch (error) {
      console.error('Payment initiation failed:', error);
      throw new Error('Failed to initiate payment. Please try again.');
    }
  }

  /**
   * Complete event creation after successful payment
   */
  static async handlePaymentSuccess(
    trackId: string,
    comboBookingId: string,
    token: string
  ): Promise<string> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/events/create-event-after-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          comboBookingId,
          trackId
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to create event after payment');
      }

      const result = await response.json();
      return result.eventId || result._id;
    } catch (error) {
      console.error('Event creation after payment failed:', error);
      throw new Error('Payment successful but event creation failed. Please contact support.');
    }
  }

  /**
   * Check if a payment callback is for event creation
   */
  static isEventPayment(bookingId: string, type: string): boolean {
    // Event payments start with 'event-' prefix, can be type 'artist' or 'combo'
    return bookingId.startsWith('event-');
  }
}