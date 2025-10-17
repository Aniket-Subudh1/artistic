'use client';

import { AdminPaymentManagement } from '@/components/admin/AdminPaymentManagement';
import { useState, useEffect } from 'react';

export default function AdminProviderPaymentsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <AdminPaymentManagement />
    </div>
  );
}