import { apiRequest } from '@/lib/api-config';

export interface LikedArtist {
  _id: string;
  stageName: string;
  profileImage?: string;
  profileCoverImage?: string;
  bio?: string;
  location?: string;
  category?: string;
  pricePerHour?: number;
  likeCount?: number;
  skills?: string[];
  about?: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  likedAt: string;
}

export interface LikedArtistsResponse {
  success: boolean;
  data: LikedArtist[];
  total: number;
}

export class CalendarService {
  /**
   * Get user's liked artists for the calendar sidebar
   */
  static async getUserLikedArtists(): Promise<LikedArtistsResponse> {
    try {
      return await apiRequest('/artist/liked', {
        method: 'GET',
      });
    } catch (error) {
      console.error('Error fetching liked artists:', error);
      return {
        success: false,
        data: [],
        total: 0,
      };
    }
  }

  /**
   * Format date for calendar display
   */
  static formatCalendarDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Get month name
   */
  static getMonthName(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'long' });
  }

  /**
   * Get year
   */
  static getYear(date: Date): number {
    return date.getFullYear();
  }

  /**
   * Get first day of month
   */
  static getFirstDayOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  /**
   * Get last day of month
   */
  static getLastDayOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  }

  /**
   * Get calendar days for a month (including previous/next month padding)
   */
  static getCalendarDays(date: Date): Date[] {
    const firstDay = this.getFirstDayOfMonth(date);
    const lastDay = this.getLastDayOfMonth(date);
    
    // Get the start of the calendar (Sunday of the first week)
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // Get the end of the calendar (Saturday of the last week)
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    const days: Date[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  }

  /**
   * Check if a date is today
   */
  static isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  /**
   * Check if a date is in the current month
   */
  static isCurrentMonth(date: Date, currentMonth: Date): boolean {
    return (
      date.getMonth() === currentMonth.getMonth() &&
      date.getFullYear() === currentMonth.getFullYear()
    );
  }

  /**
   * Check if a date is in the past
   */
  static isPastDate(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  /**
   * Get days of the week
   */
  static getDaysOfWeek(): string[] {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  }
}