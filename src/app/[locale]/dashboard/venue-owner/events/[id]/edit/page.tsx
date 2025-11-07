'use client';

import React, { use, useEffect, useState } from 'react';
import EventCreationForm from '@/components/venue-owner/EventCreationForm';
import { eventService, Event as VenueEvent } from '@/services/event.service';
import { Loader2, AlertCircle, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface PageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export default function VenueOwnerEventEditPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [eventData, setEventData] = useState<VenueEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        setShowErrorModal(false);
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') || undefined : undefined;
        const data = await eventService.getEventByIdAsVenueOwner(resolvedParams.id, token);
        setEventData(data);
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to load event';
        setError(errorMessage);
        setShowErrorModal(true);
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

  return (
    <>
      {eventData ? (
        <EventCreationForm
          userRole="venue_owner"
          mode="edit"
          initialEventId={eventData._id}
          initialEvent={eventData}
        />
      ) : (
        <div className="min-h-[50vh] flex items-center justify-center text-gray-700">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">Unable to load event data</p>
          </div>
        </div>
      )}

      {/* Error Modal */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Error Loading Event
            </DialogTitle>
            <DialogDescription className="text-base pt-4">
              {error || 'An unexpected error occurred while loading the event data.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowErrorModal(false);
                router.push('/dashboard/venue-owner/events');
              }}
            >
              Go Back to Events
            </Button>
            <Button
              onClick={() => {
                setShowErrorModal(false);
                window.location.reload();
              }}
            >
              Try Again
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
