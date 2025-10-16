'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function ArtistProfileUpdatePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to profile page since we now use a modal
    router.replace('/dashboard/artist/profile');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner />
    </div>
  );
}
