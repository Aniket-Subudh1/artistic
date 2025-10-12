'use client';

import React from 'react';
import { RoleBasedRoute } from '@/components/dashboard/RoleBasedRoute';
import { useAuthLogic } from '@/hooks/useAuth';
import { ArtistPortfolio } from '@/components/artist/ArtistPortfolio';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function ArtistPortfolioPage() {
  const { user, isLoading } = useAuthLogic();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <div className="text-center">Please log in to view your portfolio.</div>;
  }

  return (
    <RoleBasedRoute allowedRoles={['artist']} userRole={user.role}>
      <ArtistPortfolio />
    </RoleBasedRoute>
  );
}
