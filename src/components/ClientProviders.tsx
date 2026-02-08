'use client';

import { CartProvider } from '@/contexts/CartContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { ReactNode, useState } from 'react';

export function ClientProviders({ children }: { children: ReactNode }) {
  // Create a stable query client instance
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>{children}</CartProvider>
    </QueryClientProvider>
  );
}
