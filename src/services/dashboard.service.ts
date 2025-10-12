import { API_CONFIG, apiRequest } from '@/lib/api-config';
import { UserRole } from '@/types/dashboard';

export interface DashboardStats {
  totalBookings?: number;
  totalEvents?: number;
  totalArtists?: number;
  totalEquipment?: number;
  totalRevenue?: number;
  totalUsers?: number;
  totalVenues?: number;
  pendingApprovals?: number;
  totalApplications?: number;
  pendingApplications?: number;
  approvedApplications?: number;
  rejectedApplications?: number;
  likeCount?: number;
  viewCount?: number;
  profileViews?: number;
  portfolioItems?: number;
  equipmentProviders?: number;
  activeBookings?: number;
  completedBookings?: number;
  totalEarnings?: number;
  monthlyEarnings?: number;
}

interface ApiResponse<T = any> {
  users?: T[];
  artists?: T[];
  equipment?: T[];
  applications?: T[];
  likeCount?: number;
  viewCount?: number;
  portfolioItems?: T[];
  bookings?: T[];
  monthlyEarnings?: number;
}

export interface DashboardActivity {
  id: string;
  type: 'booking' | 'application' | 'profile_update' | 'equipment_rental' | 'payment' | 'review';
  title: string;
  description: string;
  date: string;
  status: 'pending' | 'completed' | 'cancelled' | 'approved' | 'rejected';
  amount?: number;
  user?: {
    name: string;
    avatar?: string;
  };
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
  roles: UserRole[];
}

export interface DashboardOverview {
  stats: DashboardStats;
  recentActivity: DashboardActivity[];
  quickActions: QuickAction[];
  announcements?: {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    date: string;
  }[];
}

export class DashboardService {
  /**
   * Get dashboard overview data based on user role
   */
  static async getDashboardOverview(role: UserRole): Promise<DashboardOverview> {
    try {
      const endpoint = this.getRoleEndpoint(role);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        return this.getFallbackData(role);
      }

      const response = await apiRequest<DashboardOverview>(`${API_CONFIG.BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response;
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      // Return fallback data with role-specific stats
      return this.getFallbackData(role);
    }
  }

  /**
   * Get admin-specific dashboard stats
   */
  static async getAdminStats(): Promise<DashboardStats> {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        return {};
      }

      const [usersResponse, artistsResponse, equipmentResponse, applicationsResponse] = await Promise.all([
        apiRequest<ApiResponse>(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER.LIST_ALL}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        apiRequest<ApiResponse>(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ARTIST.LIST_PRIVATE}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        apiRequest<ApiResponse>(`${API_CONFIG.BASE_URL}/admin/equipment`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        apiRequest<ApiResponse>(`${API_CONFIG.BASE_URL}/admin/applications`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      return {
        totalUsers: usersResponse?.users?.length || 0,
        totalArtists: artistsResponse?.artists?.length || 0,
        totalEquipment: equipmentResponse?.equipment?.length || 0,
        totalApplications: applicationsResponse?.applications?.length || 0,
        pendingApplications: applicationsResponse?.applications?.filter((app: any) => app.status === 'pending')?.length || 0,
        approvedApplications: applicationsResponse?.applications?.filter((app: any) => app.status === 'approved')?.length || 0,
        rejectedApplications: applicationsResponse?.applications?.filter((app: any) => app.status === 'rejected')?.length || 0,
      };
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      return {};
    }
  }

  /**
   * Get artist-specific dashboard stats
   */
  static async getArtistStats(): Promise<DashboardStats> {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        return {};
      }

      const profile = await apiRequest<ApiResponse>(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ARTIST.MY_PROFILE}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      return {
        likeCount: profile?.likeCount || 0,
        viewCount: profile?.viewCount || 0,
        portfolioItems: profile?.portfolioItems?.length || 0,
        totalBookings: profile?.bookings?.length || 0,
        activeBookings: profile?.bookings?.filter((booking: any) => booking.status === 'active')?.length || 0,
        completedBookings: profile?.bookings?.filter((booking: any) => booking.status === 'completed')?.length || 0,
        totalEarnings: profile?.bookings?.reduce((sum: number, booking: any) => sum + (booking.amount || 0), 0) || 0,
      };
    } catch (error) {
      console.error('Error fetching artist stats:', error);
      return {};
    }
  }

  /**
   * Get equipment provider stats
   */
  static async getEquipmentProviderStats(): Promise<DashboardStats> {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        return {};
      }

      const [profileResponse, equipmentResponse] = await Promise.all([
        apiRequest<ApiResponse>(`${API_CONFIG.BASE_URL}/equipment-provider/profile`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        apiRequest<ApiResponse>(`${API_CONFIG.BASE_URL}/equipment`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      return {
        totalEquipment: equipmentResponse?.equipment?.length || 0,
        totalBookings: profileResponse?.bookings?.length || 0,
        activeBookings: profileResponse?.bookings?.filter((booking: any) => booking.status === 'active')?.length || 0,
        totalRevenue: profileResponse?.bookings?.reduce((sum: number, booking: any) => sum + (booking.amount || 0), 0) || 0,
        monthlyEarnings: profileResponse?.monthlyEarnings || 0,
      };
    } catch (error) {
      console.error('Error fetching equipment provider stats:', error);
      return {};
    }
  }

  /**
   * Get recent activities based on role
   */
  static async getRecentActivity(role: UserRole): Promise<DashboardActivity[]> {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        return [];
      }

      const endpoint = this.getActivityEndpoint(role);
      const response = await apiRequest<{ activities: DashboardActivity[] }>(`${API_CONFIG.BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return response.activities || [];
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }

  /**
   * Get role-specific quick actions
   */
  static getQuickActions(role: UserRole): QuickAction[] {
    const allActions: QuickAction[] = [
      {
        id: 'create-event',
        title: 'Create New Event',
        description: 'Organize a new artistic event',
        icon: 'Calendar',
        href: '/dashboard/events/create',
        color: 'bg-blue-500',
        roles: ['admin', 'super_admin', 'venue_owner'],
      },
      {
        id: 'manage-artists',
        title: 'Manage Artists',
        description: 'View and manage artist profiles',
        icon: 'Users',
        href: '/dashboard/admin/artists',
        color: 'bg-purple-500',
        roles: ['admin', 'super_admin'],
      },
      {
        id: 'view-applications',
        title: 'Review Applications',
        description: 'Check pending artist applications',
        icon: 'FileText',
        href: '/dashboard/admin/applications',
        color: 'bg-green-500',
        roles: ['admin', 'super_admin'],
      },
      {
        id: 'update-portfolio',
        title: 'Update Portfolio',
        description: 'Add new work to your portfolio',
        icon: 'Camera',
        href: '/dashboard/artist/portfolio',
        color: 'bg-pink-500',
        roles: ['artist'],
      },
      {
        id: 'edit-profile',
        title: 'Edit Profile',
        description: 'Update your artist profile',
        icon: 'Edit',
        href: '/dashboard/artist/profile/update',
        color: 'bg-indigo-500',
        roles: ['artist'],
      },
      {
        id: 'view-bookings',
        title: 'View Bookings',
        description: 'Check your upcoming bookings',
        icon: 'Calendar',
        href: '/dashboard/bookings',
        color: 'bg-emerald-500',
        roles: ['artist', 'equipment_provider'],
      },
      {
        id: 'add-equipment',
        title: 'Add Equipment',
        description: 'List new equipment for rental',
        icon: 'Package',
        href: '/dashboard/equipment-provider/add',
        color: 'bg-orange-500',
        roles: ['equipment_provider'],
      },
      {
        id: 'view-earnings',
        title: 'View Earnings',
        description: 'Check your rental earnings',
        icon: 'DollarSign',
        href: '/dashboard/earnings',
        color: 'bg-green-600',
        roles: ['equipment_provider'],
      },
    ];

    return allActions.filter(action => action.roles.includes(role));
  }

  private static getRoleEndpoint(role: UserRole): string {
    switch (role) {
      case 'super_admin':
      case 'admin':
        return '/admin/dashboard';
      case 'artist':
        return '/artist/dashboard';
      case 'equipment_provider':
        return '/equipment-provider/dashboard';
      case 'venue_owner':
        return '/venue-owner/dashboard';
      default:
        return '/user/dashboard';
    }
  }

  private static getActivityEndpoint(role: UserRole): string {
    switch (role) {
      case 'super_admin':
      case 'admin':
        return '/admin/activity';
      case 'artist':
        return '/artist/activity';
      case 'equipment_provider':
        return '/equipment-provider/activity';
      default:
        return '/user/activity';
    }
  }

  private static getFallbackData(role: UserRole): DashboardOverview {
    return {
      stats: {},
      recentActivity: [],
      quickActions: this.getQuickActions(role),
      announcements: [
        {
          id: '1',
          title: 'Welcome to the Dashboard',
          message: 'Your data will appear here once the backend services are connected.',
          type: 'info',
          date: new Date().toISOString(),
        },
      ],
    };
  }
}