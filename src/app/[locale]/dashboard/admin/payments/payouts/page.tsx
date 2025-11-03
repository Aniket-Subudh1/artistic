'use client';

import AdminPayoutsList from '@/components/admin/AdminPayoutsList';
import { useEffect, useState } from 'react';

export default function AdminPayoutsPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <AdminPayoutsList />
    </div>
  );
}
