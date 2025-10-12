export type UserRole = 
  | 'super_admin' 
  | 'admin' 
  | 'artist' 
  | 'equipment_provider' 
  | 'venue_owner' 
  | 'user';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  avatar?: string;
  memberSince: string;
  isActive: boolean;
  permissions?: string[];
}

export interface SidebarItem {
  id: string;
  label: string;
  labelAr: string;
  icon: string;
  href?: string;
  roles: UserRole[];
  children?: SidebarItem[];
  badge?: string;
  isNew?: boolean;
}

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

export interface DashboardCard {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  bgColor: string;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
}

export interface BookingHistory {
  id: string;
  title: string;
  date: string;
  amount: number;
  status: 'past' | 'upcoming' | 'cancelled' | 'pending';
  type: 'event' | 'artist' | 'equipment' | 'venue';
  image?: string;
  reference: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}