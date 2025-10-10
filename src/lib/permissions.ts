// src/lib/permissions.ts
import { UserRole, SidebarItem } from '@/types/dashboard';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  super_admin: 6,
  admin: 5,
  venue_owner: 4,
  equipment_provider: 3,
  artist: 2,
  user: 1,
};

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: [
    'manage_all_users',
    'manage_all_content',
    'view_analytics',
    'manage_system_settings',
    'manage_payments',
    'manage_roles',
    'delete_any_content',
    'manage_applications',
    'manage_artists',
    'manage_equipment',
    'manage_venues'
  ],
  admin: [
    'manage_users',
    'manage_content',
    'view_analytics',
    'manage_events',
    'manage_artists',
    'manage_equipment',
    'moderate_content',
    'manage_applications',
    'manage_venues'
  ],
  venue_owner: [
    'manage_own_venues',
    'view_venue_bookings',
    'manage_venue_events',
    'view_venue_analytics',
    'approve_venue_bookings'
  ],
  equipment_provider: [
    'manage_own_equipment',
    'view_equipment_bookings',
    'manage_equipment_listings',
    'view_equipment_analytics'
  ],
  artist: [
    'manage_own_profile',
    'view_own_bookings',
    'manage_portfolio',
    'apply_to_events',
    'view_artist_analytics'
  ],
  user: [
    'book_events',
    'book_artists',
    'book_equipment',
    'view_own_bookings',
    'manage_own_profile'
  ],
};

export const getSidebarItems = (): SidebarItem[] => [
  {
    id: 'dashboard',
    label: 'Dashboard',
    labelAr: 'لوحة التحكم',
    icon: 'LayoutDashboard',
    href: '/dashboard',
    roles: ['super_admin', 'admin', 'artist', 'equipment_provider', 'venue_owner', 'user'],
    
  },

  // Admin specific routes
  {
    id: 'admin',
    label: 'Admin Panel',
    labelAr: 'لوحة الإدارة',
    icon: 'Shield',
    roles: ['super_admin', 'admin'],
    children: [
      {
        id: 'admin-dashboard',
        label: 'Admin Dashboard',
        labelAr: 'لوحة الإدارة',
        icon: 'LayoutDashboard',
        href: '/dashboard/admin',
        roles: ['super_admin', 'admin'],
      },
    ],
  },

  {
    id: 'users',
    label: 'Users',
    labelAr: 'المستخدمين',
    icon: 'Users',
    roles: ['super_admin','admin'],
    children: [
      {
        id: 'user-roles',
        label: 'Manage Roles',
        labelAr: 'إدارة الأدوار',
        icon: 'Shield',
        href: '/dashboard/users/roles',
        roles: ['super_admin'],
      },
       {
        id: 'admin-users',
        label: 'User Management',
        labelAr: 'إدارة المستخدمين',
        icon: 'Users',
        href: '/dashboard/admin/users',
        roles: ['super_admin', 'admin'],
      },
      {
        id: 'user-permissions',
        label: 'Permissions',
        labelAr: 'الصلاحيات',
        icon: 'Lock',
        href: '/dashboard/users/permissions',
        roles: ['super_admin'],
      },
    ],
  },

  // Artist specific routes
  {
    id: 'artists',
    label: 'Artists',
    labelAr: 'الفنانين',
    icon: 'Mic',
    roles: ['super_admin', 'admin', 'artist', 'user'],
    children: [
      {
        id: 'my-artist-profile',
        label: 'My Profile',
        labelAr: 'ملفي الشخصي',
        icon: 'User',
        href: '/dashboard/artist/profile',
        roles: ['artist'],
      },
     {
        id: 'admin-artists',
        label: 'Artist Management',
        labelAr: 'إدارة الفنانين',
        icon: 'Mic',
        href: '/dashboard/admin/artists',
        roles: ['super_admin', 'admin'],
      }, {
        id: 'admin-applications',
        label: 'Applications',
        labelAr: 'الطلبات',
        icon: 'FileText',
        href: '/dashboard/admin/applications',
        roles: ['super_admin', 'admin'],
        badge: 'new',
      },
    ],
  },

  // Equipment specific routes
  {
    id: 'equipment',
    label: 'Equipment',
    labelAr: 'المعدات',
    icon: 'Package',
    roles: ['super_admin', 'admin', 'equipment_provider', 'user'],
    children: [
      {
        id: 'my-equipment',
        label: 'My Equipment',
        labelAr: 'معداتي',
        icon: 'Package',
        href: '/dashboard/equipment',
        roles: ['equipment_provider'],
      },
      {
        id: 'add-equipment',
        label: 'Add Equipment',
        labelAr: 'إضافة معدات',
        icon: 'Plus',
        href: '/dashboard/equipment/add',
        roles: ['equipment_provider'],
      },
       {
        id: 'admin-equipment',
        label: 'Equipment Mangement',
        labelAr: 'المعدات',
        icon: 'Package',
        href: '/dashboard/admin/equipment',
        roles: ['super_admin', 'admin'],
      },
    ],
  },

  // Venue specific routes
  {
    id: 'venues',
    label: 'Venues',
    labelAr: 'الأماكن',
    icon: 'MapPin',
    roles: ['super_admin', 'admin', 'venue_owner', 'user'],
    children: [
      {
        id: 'my-venues',
        label: 'My Venues',
        labelAr: 'أماكني',
        icon: 'Building',
        href: '/dashboard/venues',
        roles: ['venue_owner'],
      },
      {
        id: 'add-venue',
        label: 'Add Venue',
        labelAr: 'إضافة مكان',
        icon: 'Plus',
        href: '/dashboard/venues/add',
        roles: ['venue_owner'],
      },
      {
        id: 'browse-venues',
        label: 'Browse Venues',
        labelAr: 'تصفح الأماكن',
        icon: 'Search',
        href: '/dashboard/venues/browse',
        roles: ['super_admin', 'admin', 'user'],
      },
    ],
  },

  // Bookings
  {
    id: 'bookings',
    label: 'Bookings',
    labelAr: 'الحجوزات',
    icon: 'Calendar',
    roles: ['super_admin', 'admin', 'artist', 'equipment_provider', 'venue_owner', 'user'],
    children: [
      {
        id: 'my-bookings',
        label: 'My Bookings',
        labelAr: 'حجوزاتي',
        icon: 'CalendarDays',
        href: '/dashboard/bookings',
        roles: ['artist', 'equipment_provider', 'venue_owner', 'user'],
      },
      {
        id: 'all-bookings',
        label: 'All Bookings',
        labelAr: 'جميع الحجوزات',
        icon: 'CalendarRange',
        href: '/dashboard/bookings/all',
        roles: ['super_admin', 'admin'],
      },
      {
        id: 'pending-bookings',
        label: 'Pending Approvals',
        labelAr: 'الموافقات المعلقة',
        icon: 'Clock',
        href: '/dashboard/bookings/pending',
        roles: ['super_admin', 'admin', 'venue_owner', 'equipment_provider'],
        badge: 'new',
      },
    ],
  },

  // Events
  {
    id: 'events',
    label: 'Events',
    labelAr: 'الفعاليات',
    icon: 'Calendar',
    roles: ['super_admin', 'admin', 'venue_owner', 'user'],
    children: [
      {
        id: 'my-events',
        label: 'My Events',
        labelAr: 'فعالياتي',
        icon: 'CalendarPlus',
        href: '/dashboard/events',
        roles: ['venue_owner', 'user'],
      },
      {
        id: 'all-events',
        label: 'All Events',
        labelAr: 'جميع الفعاليات',
        icon: 'Calendar',
        href: '/dashboard/events/all',
        roles: ['super_admin', 'admin'],
      },
      {
        id: 'create-event',
        label: 'Create Event',
        labelAr: 'إنشاء فعالية',
        icon: 'Plus',
        href: '/dashboard/events/create',
        roles: ['super_admin', 'admin', 'venue_owner'],
      },
    ],
  },

  // Analytics
  {
    id: 'analytics',
    label: 'Analytics',
    labelAr: 'التحليلات',
    icon: 'BarChart3',
    roles: ['super_admin', 'admin', 'venue_owner', 'equipment_provider', 'artist'],
    children: [
      {
        id: 'dashboard-analytics',
        label: 'Overview',
        labelAr: 'نظرة عامة',
        icon: 'TrendingUp',
        href: '/dashboard/analytics',
        roles: ['super_admin', 'admin', 'venue_owner', 'equipment_provider', 'artist'],
      },
      {
        id: 'revenue-analytics',
        label: 'Revenue',
        labelAr: 'الإيرادات',
        icon: 'DollarSign',
        href: '/dashboard/analytics/revenue',
        roles: ['super_admin', 'admin', 'venue_owner', 'equipment_provider'],
      },
      {
        id: 'booking-analytics',
        label: 'Booking Trends',
        labelAr: 'اتجاهات الحجز',
        icon: 'LineChart',
        href: '/dashboard/analytics/bookings',
        roles: ['super_admin', 'admin'],
      },
    ],
  },

  // Payments
  {
    id: 'payments',
    label: 'Payments',
    labelAr: 'المدفوعات',
    icon: 'CreditCard',
    roles: ['super_admin', 'admin', 'venue_owner', 'equipment_provider', 'artist', 'user'],
    children: [
      {
        id: 'payment-history',
        label: 'Payment History',
        labelAr: 'تاريخ المدفوعات',
        icon: 'Receipt',
        href: '/dashboard/payments',
        roles: ['super_admin', 'admin', 'venue_owner', 'equipment_provider', 'artist', 'user'],
      },
      {
        id: 'payment-methods',
        label: 'Payment Methods',
        labelAr: 'طرق الدفع',
        icon: 'Wallet',
        href: '/dashboard/payments/methods',
        roles: ['venue_owner', 'equipment_provider', 'artist', 'user'],
      },
      {
        id: 'all-transactions',
        label: 'All Transactions',
        labelAr: 'جميع المعاملات',
        icon: 'ArrowLeftRight',
        href: '/dashboard/payments/all',
        roles: ['super_admin', 'admin'],
      },
    ],
  },

  // Notifications
  {
    id: 'notifications',
    label: 'Notifications',
    labelAr: 'الإشعارات',
    icon: 'Bell',
    href: '/dashboard/notifications',
    roles: ['super_admin', 'admin', 'venue_owner', 'equipment_provider', 'artist', 'user'],
  },

  // Settings
  {
    id: 'settings',
    label: 'Settings',
    labelAr: 'الإعدادات',
    icon: 'Settings',
    roles: ['super_admin', 'admin', 'venue_owner', 'equipment_provider', 'artist', 'user'],
    children: [
      {
        id: 'profile-settings',
        label: 'Profile',
        labelAr: 'الملف الشخصي',
        icon: 'User',
        href: '/dashboard/settings/profile',
        roles: ['super_admin', 'admin', 'venue_owner', 'equipment_provider', 'artist', 'user'],
      },
      {
        id: 'account-settings',
        label: 'Account',
        labelAr: 'الحساب',
        icon: 'UserCog',
        href: '/dashboard/settings/account',
        roles: ['super_admin', 'admin', 'venue_owner', 'equipment_provider', 'artist', 'user'],
      },
      {
        id: 'system-settings',
        label: 'System',
        labelAr: 'النظام',
        icon: 'Cog',
        href: '/dashboard/settings/system',
        roles: ['super_admin', 'admin'],
      },
    ],
  },
];

export const hasPermission = (userRole: UserRole, permission: string): boolean => {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
};

export const canAccessRoute = (userRole: UserRole, requiredRoles: UserRole[]): boolean => {
  return requiredRoles.includes(userRole);
};

export const isHigherRole = (userRole: UserRole, targetRole: UserRole): boolean => {
  return ROLE_HIERARCHY[userRole] > ROLE_HIERARCHY[targetRole];
};

export const filterSidebarItems = (items: SidebarItem[], userRole: UserRole): SidebarItem[] => {
  return items
    .filter(item => canAccessRoute(userRole, item.roles))
    .map(item => ({
      ...item,
      children: item.children 
        ? filterSidebarItems(item.children, userRole)
        : undefined
    }))
    .filter(item => !item.children || item.children.length > 0);
};