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
  profileUpdateRequests?: T[];
  portfolioUpdateRequests?: T[];
  portfolioItems?: T[];
  likeCount?: number;
  viewCount?: number;
  bookings?: T[];
  monthlyEarnings?: number;
  // Handle direct array responses
  [key: string]: any;
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

      const [usersResponse, artistsResponse, applicationsResponse, equipmentResponse, updateRequestsResponse] = await Promise.all([
        apiRequest<ApiResponse>(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER.LIST_ALL}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        apiRequest<ApiResponse>(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ARTIST.LIST_PRIVATE}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        apiRequest<ApiResponse>(`${API_CONFIG.BASE_URL}/artist/application`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        apiRequest<ApiResponse>(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EQUIPMENT.LIST_ALL}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        apiRequest<ApiResponse>(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADMIN.PROFILE_UPDATE_REQUESTS}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        }).catch(() => ({ profileUpdateRequests: [], portfolioUpdateRequests: [] })), // Fallback if endpoint doesn't exist
      ]);

      // Calculate statistics from real API responses
      const users = usersResponse || [];
      const artists = artistsResponse || [];
      const applications = applicationsResponse || [];
      const equipment = equipmentResponse || [];
      const updateRequests = updateRequestsResponse || { profileUpdateRequests: [], portfolioUpdateRequests: [] };

      return {
        totalUsers: Array.isArray(users) ? users.length : (users.users ? users.users.length : 0),
        totalArtists: Array.isArray(artists) ? artists.length : (artists.artists ? artists.artists.length : 0),
        totalEquipment: Array.isArray(equipment) ? equipment.length : (equipment.equipment ? equipment.equipment.length : 0),
        totalApplications: Array.isArray(applications) ? applications.length : (applications.applications ? applications.applications.length : 0),
        pendingApplications: Array.isArray(applications) 
          ? applications.filter((app: any) => app.status === 'PENDING' || app.status === 'pending').length
          : (applications.applications ? applications.applications.filter((app: any) => app.status === 'PENDING' || app.status === 'pending').length : 0),
        approvedApplications: Array.isArray(applications)
          ? applications.filter((app: any) => app.status === 'APPROVED' || app.status === 'approved').length  
          : (applications.applications ? applications.applications.filter((app: any) => app.status === 'APPROVED' || app.status === 'approved').length : 0),
        rejectedApplications: Array.isArray(applications)
          ? applications.filter((app: any) => app.status === 'REJECTED' || app.status === 'rejected').length
          : (applications.applications ? applications.applications.filter((app: any) => app.status === 'REJECTED' || app.status === 'rejected').length : 0),
        pendingApprovals: (updateRequests.profileUpdateRequests?.length || 0) + (updateRequests.portfolioUpdateRequests?.length || 0),
      };
    } catch (error) {
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

      const [myEquipmentResponse, profileResponse] = await Promise.all([
        apiRequest<ApiResponse>(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EQUIPMENT.MY_EQUIPMENT}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        apiRequest<ApiResponse>(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EQUIPMENT_PROVIDER.PROFILE}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        }).catch(() => ({})), // Fallback if profile endpoint doesn't exist
      ]);

      const myEquipment = myEquipmentResponse || [];
      const profile = profileResponse as any;
      const bookings = profile?.bookings || [];

      return {
        totalEquipment: Array.isArray(myEquipment) ? myEquipment.length : (myEquipment.equipment ? myEquipment.equipment.length : 0),
        totalBookings: Array.isArray(bookings) ? bookings.length : 0,
        activeBookings: Array.isArray(bookings) ? bookings.filter((booking: any) => booking.status === 'active' || booking.status === 'ACTIVE').length : 0,
        totalRevenue: Array.isArray(bookings) ? bookings.reduce((sum: number, booking: any) => sum + (booking.amount || booking.totalAmount || 0), 0) : 0,
        monthlyEarnings: profile?.monthlyEarnings || 0,
      };
    } catch (error) {
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

      // Since there's no activity endpoint yet, let's create mock recent activity from real data
      switch (role) {
        case 'super_admin':
        case 'admin':
          return this.getAdminRecentActivity(token);
        case 'artist':
          return this.getArtistRecentActivity(token);
        case 'equipment_provider':
          return this.getEquipmentProviderRecentActivity(token);
        default:
          return [];
      }
    } catch (error) {
      return [];
    }
  }

  private static async getAdminRecentActivity(token: string): Promise<DashboardActivity[]> {
    try {
      // Get recent data from real endpoints
      const [applications, updateRequests] = await Promise.all([
        apiRequest<any>(`${API_CONFIG.BASE_URL}/artist/application`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        }).catch(() => ({ applications: [] })),
        apiRequest<any>(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADMIN.PROFILE_UPDATE_REQUESTS}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        }).catch(() => ({ profileUpdateRequests: [], portfolioUpdateRequests: [] })),
      ]);

      const activities: DashboardActivity[] = [];

      // Add recent applications
      const recentApplications = (applications.applications || applications || []).slice(0, 3);
      recentApplications.forEach((app: any) => {
        activities.push({
          id: app._id || app.id,
          type: 'application',
          title: 'New Artist Application',
          description: `${app.stageName || 'Artist'} submitted an application`,
          date: app.createdAt || app.submittedAt || new Date().toISOString(),
          status: app.status?.toLowerCase() === 'pending' ? 'pending' : 'completed',
        });
      });

      // Add recent profile update requests
      const recentUpdates = (updateRequests.profileUpdateRequests || []).slice(0, 2);
      recentUpdates.forEach((update: any) => {
        activities.push({
          id: update._id || update.id,
          type: 'profile_update',
          title: 'Profile Update Request',
          description: `Artist requested profile update`,
          date: update.createdAt || new Date().toISOString(),
          status: 'pending',
        });
      });

      return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
    } catch (error) {
      return [];
    }
  }

  private static async getArtistRecentActivity(token: string): Promise<DashboardActivity[]> {
    try {
      // Get artist's recent portfolio items
      const portfolioItems = await apiRequest<any>(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ARTIST.PORTFOLIO.MY_ITEMS}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      }).catch(() => []);

      const activities: DashboardActivity[] = [];
      const recentItems = (portfolioItems.portfolioItems || portfolioItems || []).slice(0, 5);
      
      recentItems.forEach((item: any) => {
        activities.push({
          id: item._id || item.id,
          type: 'review',
          title: 'Portfolio Item',
          description: `Added "${item.title || 'New item'}" to portfolio`,
          date: item.createdAt || new Date().toISOString(),
          status: item.status?.toLowerCase() || 'completed',
        });
      });

      return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      return [];
    }
  }

  private static async getEquipmentProviderRecentActivity(token: string): Promise<DashboardActivity[]> {
    try {
      // Get equipment provider's recent equipment
      const myEquipment = await apiRequest<any>(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EQUIPMENT.MY_EQUIPMENT}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      }).catch(() => []);

      const activities: DashboardActivity[] = [];
      const recentEquipment = (myEquipment.equipment || myEquipment || []).slice(0, 5);
      
      recentEquipment.forEach((equipment: any) => {
        activities.push({
          id: equipment._id || equipment.id,
          type: 'equipment_rental',
          title: 'Equipment Listed',
          description: `Listed "${equipment.name || equipment.title}" for rent`,
          date: equipment.createdAt || new Date().toISOString(),
          status: 'completed',
        });
      });

      return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
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