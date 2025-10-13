import { apiRequest, authenticatedFetch } from '@/lib/api-config';

export interface UnavailabilitySlot {
  date: string; // "2025-10-21"
  hours?: number[]; // [18,19,20] or undefined for full day
}

export interface BulkUnavailabilityDto {
  slots: UnavailabilitySlot[];
}

export interface AvailabilityRecord {
  _id: string;
  date: string;
  hours: number[];
}

export interface AvailableArtist {
  _id: string;
  name: string;
  email: string;
  // Add other artist profile fields as needed
}

export interface AvailabilitySearchParams {
  date: string; // "2025-10-21"
  startHour: number;
  endHour: number;
}

class ArtistAvailabilityService {
  /**
   * Search for available artists on a specific date and time range
   */
  async searchAvailableArtists(params: AvailabilitySearchParams): Promise<AvailableArtist[]> {
    try {
      const queryParams = new URLSearchParams({
        date: params.date,
        startHour: params.startHour.toString(),
        endHour: params.endHour.toString(),
      });
      
      return await apiRequest(`/artist-availability/search?${queryParams}`, {
        method: 'GET',
      });
    } catch (error: any) {
      console.error('Error searching available artists:', error);
      throw new Error(error.message || 'Failed to search available artists');
    }
  }

  /**
   * Mark specific dates/hours as unavailable for the current artist (bulk operation)
   */
  async markUnavailableBulk(unavailabilityData: BulkUnavailabilityDto): Promise<{ message: string }> {
    try {
      return await apiRequest('/artist-availability/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(unavailabilityData),
      });
    } catch (error: any) {
      console.error('Error marking unavailable slots:', error);
      throw new Error(error.message || 'Failed to update availability');
    }
  }

  /**
   * Get current artist's unavailability records
   */
  async getMyUnavailability(): Promise<AvailabilityRecord[]> {
    try {
      return await apiRequest('/artist-availability/my-unavailability', {
        method: 'GET',
      });
    } catch (error: any) {
      console.error('Error fetching unavailability data:', error);
      throw new Error(error.message || 'Failed to fetch availability data');
    }
  }

  /**
   * Remove unavailability (mark as available again) for specific dates/hours
   */
  async removeUnavailability(unavailabilityData: BulkUnavailabilityDto): Promise<{ message: string }> {
    try {
      return await apiRequest('/artist-availability/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(unavailabilityData),
      });
    } catch (error: any) {
      console.error('Error removing unavailable slots:', error);
      throw new Error(error.message || 'Failed to update availability');
    }
  }

  /**
   * Helper method to mark a single date as unavailable
   */
  async markDateUnavailable(date: string, hours?: number[]): Promise<{ message: string }> {
    return this.markUnavailableBulk({
      slots: [{ date, hours }]
    });
  }

  /**
   * Helper method to mark multiple dates as unavailable
   */
  async markDatesUnavailable(dates: string[], hours?: number[]): Promise<{ message: string }> {
    const slots = dates.map(date => ({ date, hours }));
    return this.markUnavailableBulk({ slots });
  }

  /**
   * Helper method to mark time range as unavailable for a specific date
   */
  async markTimeRangeUnavailable(date: string, startHour: number, endHour: number): Promise<{ message: string }> {
    const hours: number[] = [];
    for (let i = startHour; i < endHour; i++) {
      hours.push(i);
    }
    
    return this.markDateUnavailable(date, hours);
  }
}

export const artistAvailabilityService = new ArtistAvailabilityService();