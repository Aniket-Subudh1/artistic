'use client';

import { AdminBookingManagement } from '@/components/admin';

export default function AdminBookingsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <AdminBookingManagement />
    </div>
  );
}