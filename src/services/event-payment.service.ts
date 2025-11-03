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

    // Venue owner pays only for non-custom artists and actual equipment
    const hasPayableArtists = selectedArtists.some(artist => 
      !artist.isCustomArtist && artist.artistId && artist.artistId.trim() !== ''
    );
    
    const hasPayableEquipment = selectedEquipment.some(equipment => 
      equipment.equipmentId && equipment.equipmentId.trim() !== ''
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

    // Add cost for non-custom artists only
    selectedArtists.forEach(artist => {
      if (!artist.isCustomArtist && artist.artistId && artist.artistId.trim() !== '') {
        total += artist.fee || 0;
      }
    });

    // Add cost for actual equipment only
    selectedEquipment.forEach(equipment => {
      if (equipment.equipmentId && equipment.equipmentId.trim() !== '') {
        total += equipment.totalPrice || 0;
      }
    });

    return total;
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
      const payloadData = {
        eventData,
        selectedArtists,
        selectedEquipment,
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
        throw new Error('Failed to store event data');
      }

      const result = await response.json();
      return { success: result.success };
    } catch (error) {
      console.error('Error storing event data:', error);
      throw new Error('Failed to store event data before payment');
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

      // Initiate payment with combo booking ID
      const paymentResponse = await PaymentService.initiateBatch({
        items: [{
          bookingId: comboBookingId,
          type: 'combo',
          amount: totalAmount,
          description: `Event creation payment for ${eventData.eventTitle || 'event'}`
        }]
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
    return type === 'combo' && bookingId.startsWith('event-');
  }
}