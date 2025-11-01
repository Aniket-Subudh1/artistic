import { apiRequest, authenticatedFetch } from '@/lib/api-config';

export interface UnavailabilitySlot {
  date: string; 
  hours?: number[]; 
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
}

export interface AvailabilitySearchParams {
  date: string; 
  startHour: number;
  endHour: number;
}


class ArtistAvailabilityService {
 
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

 
  async getMyUnavailability(): Promise<AvailabilityRecord[]> {
    try {
      return await apiRequest<AvailabilityRecord[]>('/artist-availability/my-unavailability', {
        method: 'GET',
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch availability data');
    }
  }

 
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

 
  async markDateUnavailable(date: string, hours?: number[]): Promise<{ message: string }> {
    return this.markUnavailableBulk({
      slots: [{ date, hours }]
    });
  }


  async markDatesUnavailable(dates: string[], hours?: number[]): Promise<{ message: string }> {
    const slots = dates.map(date => ({ date, hours }));
    return this.markUnavailableBulk({ slots });
  }

  async markTimeRangeUnavailable(date: string, startHour: number, endHour: number): Promise<{ message: string }> {
    const hours: number[] = [];
    for (let i = startHour; i < endHour; i++) {
      hours.push(i);
    }
    
    return this.markDateUnavailable(date, hours);
  }

  // Admin-only: mark a given artist profile unavailable for a date/time range
  async adminMarkUnavailable(
    artistProfileId: string,
    date: string,
    startHour: number,
    endHour: number
  ): Promise<{ message: string }> {
    const hours: number[] = [];
    for (let i = startHour; i < endHour; i++) hours.push(i);
    return apiRequest('/artist-availability/admin/mark', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ artistProfileId, slots: [{ date, hours }] })
    });
  }
}

export const artistAvailabilityService = new ArtistAvailabilityService();