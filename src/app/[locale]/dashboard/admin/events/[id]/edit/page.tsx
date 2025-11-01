'use client';

import React, { use, useEffect, useState } from 'react';
import EventCreationForm from '@/components/venue-owner/EventCreationForm';
import { eventService, Event as AdminEvent } from '@/services/event.service';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export default function AdminEventEditPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const [eventData, setEventData] = useState<AdminEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') || undefined : undefined;
        const data = await eventService.getEventByIdAsAdmin(resolvedParams.id, token);
        setEventData(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-700">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading event...</span>
        </div>
      </div>
    );
  }

  if (error || !eventData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Event not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <EventCreationForm
      userRole="admin"
      mode="edit"
      initialEventId={eventData._id}
      initialEvent={eventData}
    />
  );
}


