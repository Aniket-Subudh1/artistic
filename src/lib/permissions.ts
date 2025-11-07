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
    'manage_venues',
    'manage_venue_layouts',
    'manage_venue_providers',
    'manage_equipment_providers',
    'manage_terms_and_conditions',
    'manage_carousel',
    'manage_sponsors',
    'manage_testimonials',
    'update_profile_picture',
    'view_all_bookings',
    'view_payments',
    'change_own_password'
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
    'manage_venues',
    'manage_venue_layouts',
    'manage_venue_providers',
    'manage_equipment_providers',
    'manage_terms_and_conditions',
    'manage_carousel',
    'manage_sponsors',
    'manage_testimonials',
    'update_profile_picture',
    'view_all_bookings',
    'view_payments',
    'change_own_password'
  ],
  venue_owner: [
    'manage_own_venues',
    'manage_venue_layouts',
    'view_venue_bookings',
    'manage_venue_events',
    'view_venue_analytics',
    'approve_venue_bookings',
    'update_profile_picture',
    'change_own_password',
    'view_payments',
    'manage_payments'
  ],
  equipment_provider: [
    'manage_own_equipment',
    'view_equipment_bookings',
    'manage_equipment_listings',
    'view_equipment_analytics',
    'manage_equipment_bookings',
    'view_my_bookings',
    'change_own_password',
    'manage_own_profile',
    'update_profile_picture'
  ],
  artist: [
    'manage_own_profile',
    'view_own_bookings',
    'manage_portfolio',
    'apply_to_events',
    'view_artist_analytics',
    'update_profile_picture',
    'change_own_password'
  ],
  user: [
    'book_events',
    'book_artists',
    'book_equipment',
    'view_own_bookings',
    'manage_own_profile',
    'update_profile_picture',
    'change_own_password'
  ],
};

export const getSidebarItems = (): SidebarItem[] => [
  // Role-specific dashboard routes
  {
    id: 'admin-dashboard',
    label: 'Dashboard',
    labelAr: 'لوحة التحكم',
    icon: 'LayoutDashboard',
    href: '/dashboard/admin',
    roles: ['super_admin', 'admin'],
  },
  {
    id: 'artist-dashboard',
    label: 'Dashboard', 
    labelAr: 'لوحة التحكم',
    icon: 'LayoutDashboard',
    href: '/dashboard',
    roles: ['artist'],
  },
  {
    id: 'equipment-provider-dashboard',
    label: 'Dashboard',
    labelAr: 'لوحة التحكم', 
    icon: 'LayoutDashboard',
    href: '/dashboard',
    roles: ['equipment_provider'],
  },
  {
    id: 'venue-owner-dashboard',
    label: 'Dashboard',
    labelAr: 'لوحة التحكم',
    icon: 'LayoutDashboard', 
    href: '/dashboard',
    roles: ['venue_owner'],
  },
  {
    id: 'user-dashboard',
    label: 'Dashboard',
    labelAr: 'لوحة التحكم',
    icon: 'LayoutDashboard',
    href: '/dashboard', 
    roles: ['user'],
  },

  // Admin Management Section
  {
    id: 'admin-panel',
    label: 'Admin Panel',
    labelAr: 'لوحة الإدارة',
    icon: 'Shield',
    roles: ['super_admin', 'admin'],
    children: [
      {
        id: 'carousel-management',
        label: 'Carousel Management',
        labelAr: 'إدارة شريط التمرير',
        icon: 'Image',
        href: '/dashboard/admin/carousel',
        roles: ['super_admin', 'admin'],
      },
      {
        id: 'sponsor-management',
        label: 'Sponsor Management',
        labelAr: 'إدارة الجهات الراعية',
        icon: 'Award',
        href: '/dashboard/admin/sponsors',
        roles: ['super_admin', 'admin'],
      },
      {
        id: 'testimonial-management',
        label: 'Testimonial Management',
        labelAr: 'إدارة الشهادات',
        icon: 'MessageSquare',
        href: '/dashboard/admin/testimonials',
        roles: ['super_admin', 'admin'],
      },
      {
        id: 'terms-and-conditions',
        label: 'Terms & Conditions',
        labelAr: 'الشروط والأحكام',
        icon: 'FileText',
        href: '/dashboard/admin/terms-and-conditions',
        roles: ['super_admin', 'admin'],
      },
    ],
  },

  // User Management Section
  {
    id: 'user-management',
    label: 'User Management',
    labelAr: 'إدارة المستخدمين',
    icon: 'Users',
    roles: ['super_admin', 'admin'],
    children: [
      {
        id: 'all-users',
        label: 'All Users',
        labelAr: 'جميع المستخدمين',
        icon: 'Users',
        href: '/dashboard/admin/users',
        roles: ['super_admin', 'admin'],
      },
    ],
  },

  // Admin Management Section (Super Admin Only)
  {
    id: 'admin-management',
    label: 'Admin Management',
    labelAr: 'إدارة المديرين',
    icon: 'UserCog',
    roles: ['super_admin'],
    children: [
      {
        id: 'all-admins',
        label: 'All Admins',
        labelAr: 'جميع المديرين',
        icon: 'Shield',
        href: '/dashboard/super-admin/admins',
        roles: ['super_admin'],
      },
    ],
  },

  // Artist Management Section
  {
    id: 'artist-management',
    label: 'Artist Management',
    labelAr: 'إدارة الفنانين',
    icon: 'Mic',
    roles: ['super_admin', 'admin', 'artist'],
    children: [
      // Artist Profile (for artists themselves)
      {
        id: 'my-artist-profile',
        label: 'My Profile',
        labelAr: 'ملفي الشخصي',
        icon: 'User',
        href: '/dashboard/artist/profile',
        roles: ['artist'],
      },
      {
        id: 'my-portfolio',
        label: 'My Portfolio',
        labelAr: 'أعمالي',
        icon: 'Bookmark',
        href: '/dashboard/artist/portfolio',
        roles: ['artist'],
      },
      {
        id: 'my-availability',
        label: 'Availability Calendar',
        labelAr: 'جدول التوفر',
        icon: 'Calendar',
        href: '/dashboard/artist/availability',
        roles: ['artist'],
      },
      {
        id: 'profile-update-requests',
        label: 'Update Requests',
        labelAr: 'طلبات التحديث',
        icon: 'Edit',
        href: '/dashboard/artist/update-requests',
        roles: ['artist'],
      },
      
      // Admin Artist Management
      {
        id: 'all-artists',
        label: 'All Artists',
        labelAr: 'جميع الفنانين',
        icon: 'Mic',
        href: '/dashboard/admin/artists',
        roles: ['super_admin', 'admin'],
      },
      {
        id: 'artist-applications',
        label: 'Artist Applications',
        labelAr: 'طلبات الفنانين',
        icon: 'FileText',
        href: '/dashboard/admin/applications',
        roles: ['super_admin', 'admin'],
      },
      {
        id: 'profile-updates',
        label: 'Profile Updates',
        labelAr: 'تحديثات الملفات',
        icon: 'UserCheck',
        href: '/dashboard/admin/profile-updates',
        roles: ['super_admin', 'admin'],
      },
    ],
  },

  // Equipment Management Section - Updated
  {
    id: 'equipment-management',
    label: 'Equipment',
    labelAr: 'المعدات',
    icon: 'Package',
    roles: ['super_admin', 'admin', 'equipment_provider'],
    children: [
      // Equipment Provider specific
      {
        id: 'equipment-management',
        label: 'Equipment Management',
        labelAr: 'إدارة المعدات',
        icon: 'Package',
        href: '/dashboard/equipment-provider/equipment-management',
        roles: ['equipment_provider'],
      },
      {
        id: 'equipment-packages',
        label: 'Equipment Packages',
        labelAr: 'حزم المعدات',
        icon: 'Package2',
        href: '/dashboard/equipment-provider/packages',
        roles: ['equipment_provider'],
      },
     
      
      // Admin Equipment Management
      {
        id: 'all-equipment',
        label: 'All Equipment',
        labelAr: 'جميع المعدات',
        icon: 'Package2',
        href: '/dashboard/admin/equipment',
        roles: ['super_admin', 'admin'],
      },
      {
        id: 'manage-packages',
        label: 'Manage Packages',
        labelAr: 'إدارة الحزم',
        icon: 'Package',
        href: '/dashboard/admin/packages',
        roles: ['super_admin', 'admin'],
      },
      {
        id: 'equipment-providers',
        label: 'Equipment Providers',
        labelAr: 'مقدمو المعدات',
        icon: 'Users',
        href: '/dashboard/admin/equipment-provider',
        roles: ['super_admin', 'admin'],
      },
    ],
  },

  // Venue Management Section
  {
    id: 'venue-management',
    label: 'Venues',
    labelAr: 'الأماكن',
    icon: 'MapPin',
    roles: ['super_admin', 'admin', 'venue_owner'],
    children: [
      // Venue Owner specific (only existing routes)
      
      // Admin Venue Layouts
      {
        id: 'venue-layouts-admin',
        label: 'Venue Layouts',
        labelAr: 'تخطيطات الأماكن',
        icon: 'LayoutGrid',
        href: '/dashboard/admin/venue-layouts',
        roles: ['super_admin', 'admin'],
      },
      // Venue Owner Layouts
      {
        id: 'venue-layouts-owner',
        label: 'Venue Layouts',
        labelAr: 'تخطيطات الأماكن',
        icon: 'LayoutGrid',
        href: '/dashboard/venue-owner/layouts',
        roles: ['venue_owner'],
      },
      {
        id: 'venue-providers',
        label: 'Venue Providers',
        labelAr: 'مقدمو الأماكن',
        icon: 'Users',
        href: '/dashboard/admin/venue-providers',
        roles: ['super_admin', 'admin'],
      },
      {
        id: 'venue-applications',
        label: 'Venue Applications',
        labelAr: 'طلبات الأماكن',
        icon: 'FileText',
        href: '/dashboard/admin/venue-applications',
        roles: ['super_admin', 'admin'],
      },
    ],
  },

  // Bookings Management
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
        roles: ['artist', 'equipment_provider', 'venue_owner'],
      },
      {
        id: 'my-bookings',
        label: 'My Bookings',
        labelAr: 'حجوزاتي',
        icon: 'CalendarDays',
        href: '/dashboard/user/bookings',
        roles: [ 'user'],
      },
      {
        id: 'all-bookings',
        label: 'All Bookings',
        labelAr: 'جميع الحجوزات',
        icon: 'CalendarRange',
        href: '/dashboard/admin/bookings',
        roles: ['super_admin', 'admin'],
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
        id: 'my-events-venue',
        label: 'My Events',
        labelAr: 'فعالياتي',
        icon: 'CalendarPlus',
        href: '/dashboard/venue-owner/events',
        roles: ['venue_owner'],
      },
      {
        id: 'my-events-user',
        label: 'My Events',
        labelAr: 'فعالياتي',
        icon: 'CalendarPlus',
        href: '/dashboard/events',
        roles: ['user'],
      },
      {
        id: 'all-events',
        label: 'All Events',
        labelAr: 'جميع الفعاليات',
        icon: 'Calendar',
        href: '/dashboard/admin/events',
        roles: ['super_admin', 'admin'],
      },
      {
        id: 'create-event-admin',
        label: 'Create Event',
        labelAr: 'إنشاء فعالية',
        icon: 'Plus',
        href: '/dashboard/events/create',
        roles: ['super_admin', 'admin'],
      },
      {
        id: 'create-event-venue',
        label: 'Create Event',
        labelAr: 'إنشاء فعالية',
        icon: 'Plus',
        href: '/dashboard/venue-owner/events/create',
        roles: ['venue_owner'],
      },
    ],
  },

  

  // Payments
  {
    id: 'payments',
    label: 'Payments',
    labelAr: 'المدفوعات',
    icon: 'CreditCard',
    roles: ['super_admin', 'admin', 'equipment_provider', 'artist', 'user'],
    children: [
      
      {
        id: 'artist-payments',
        label: 'Artists & Providers',
        labelAr: 'مدفوعات الفنانين والمعدات',
        icon: 'Users',
        href: '/dashboard/admin/payments/artists',
        roles: ['super_admin', 'admin'],
      },
      {
        id: 'payouts',
        label: 'Recorded Payouts',
        labelAr: 'المدفوعات المسجلة',
        icon: 'CreditCard',
        href: '/dashboard/admin/payments/payouts',
        roles: ['super_admin', 'admin'],
      },
    ],
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