'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Download, QrCode, Ticket, Calendar as CalendarIcon, Users, Building2, ShieldCheck } from 'lucide-react';
import QRCode from 'qrcode';
import { EventTicketBookingResponse } from '@/services/seat-booking.service';
import { API_CONFIG, apiRequest, publicApiRequest } from '@/lib/api-config';

type Props = {
  booking: EventTicketBookingResponse['booking'];
  className?: string;
};

export const EventTicketBookingCard: React.FC<Props> = ({ booking, className }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [event, setEvent] = useState<any | null>(null);
  const [loadingEvent, setLoadingEvent] = useState<boolean>(true);
  const [resolvedSeatLabels, setResolvedSeatLabels] = useState<string[] | null>(null);

  const seatLabels = useMemo(() => {
    const seats = (booking.seats || [])
      .map((s: any) => {
        const raw = s.seatLabel ?? `${s.rowLabel ?? ''}${s.seatNumber ?? ''}`;
        return String(raw || '').trim().toUpperCase();
      })
      .filter(Boolean);
    const tables = (booking.tables || [])
      .map((t: any) => String(t.tableName ?? t.label ?? '').trim())
      .filter(Boolean);
    const booths = (booking.booths || [])
      .map((b: any) => String(b.boothName ?? b.label ?? '').trim())
      .filter(Boolean);
    return { seats, tables, booths };
  }, [booking]);

  useEffect(() => {
    const payload = {
      kind: 'event-ticket',
      bookingId: booking._id,
      bookingReference: booking.bookingReference,
      eventId: booking.eventId,
      seats: seatLabels.seats,
      tables: seatLabels.tables,
      booths: seatLabels.booths,
      issuedAt: new Date(booking.createdAt).toISOString(),
    };
    QRCode.toDataURL(JSON.stringify(payload), { margin: 1, scale: 6 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''));
  }, [booking, seatLabels]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingEvent(true);
      try {
        const data = await publicApiRequest(`${API_CONFIG.ENDPOINTS.EVENTS.PUBLIC}/${booking.eventId}`);
        if (mounted) setEvent(data);
      } catch {
        if (mounted) setEvent(null);
      } finally {
        if (mounted) setLoadingEvent(false);
      }
    })();
    return () => { mounted = false; };
  }, [booking.eventId]);

  // Fallback: if no readable seat labels present, resolve from seatIds using event layout
  useEffect(() => {
    const hasReadableSeats = (seatLabels.seats?.length || 0) > 0;
    if (hasReadableSeats) {
      setResolvedSeatLabels(null);
      return;
    }

    const fromSeats = (booking as any)?.seats?.map((s: any) => s.seatId || s._id).filter(Boolean) || [];
    const fromIds = (booking as any)?.seatIds || [];
    const candidateIds: string[] = Array.from(new Set([...(fromSeats || []), ...(fromIds || [])]));
    if (!booking.eventId || candidateIds.length === 0) {
      setResolvedSeatLabels(null);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const layout: any = await publicApiRequest(`${API_CONFIG.BASE_URL}/events/public/${booking.eventId}/layout`);
        const seats: Array<any> = layout?.layout?.seats || [];
        const byId = new Map<string, any>();
        seats.forEach((s: any) => byId.set(s.seatId || s._id, s));
        const labels = candidateIds
          .map((id) => byId.get(id))
          .filter(Boolean)
          .map((s: any) => {
            const rl = s.rl ?? s.rowLabel ?? s.row ?? '';
            const sn = s.sn ?? s.seatNumber ?? s.number ?? '';
            return String(`${rl}${sn}` || '').trim().toUpperCase();
          })
          .filter(Boolean);
        if (!cancelled && labels.length) {
          setResolvedSeatLabels(labels);
          return;
        }

        // Fallback 2: try the real-time seat map (may include rowLabel/seatNumber)
        const seatMap: any = await publicApiRequest(`${API_CONFIG.BASE_URL}/events/public/${booking.eventId}/seat-map`);
        const mapSeats: Array<any> = seatMap?.seats || [];
        const byMapId = new Map<string, any>();
        mapSeats.forEach((s: any) => byMapId.set(s.seatId || s._id, s));
        const mapLabels = candidateIds
          .map((id) => byMapId.get(id))
          .filter(Boolean)
          .map((s: any) => {
            const rl = s.rowLabel ?? s.rl ?? '';
            const sn = s.seatNumber ?? s.sn ?? '';
            return String(`${rl}${sn}` || '').trim().toUpperCase();
          })
          .filter(Boolean);
        if (!cancelled) setResolvedSeatLabels(mapLabels.length ? mapLabels : null);
      } catch {
        if (!cancelled) setResolvedSeatLabels(null);
      }
    })();
    return () => { cancelled = true; };
  }, [booking, seatLabels.seats]);

  // Auth fallback: fetch unified booking details to derive seat labels if still missing
  useEffect(() => {
    if ((seatLabels.seats?.length || 0) > 0) return;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') || '' : '';
      if (!token) return;
      (async () => {
        try {
          const details: any = await apiRequest(API_CONFIG.ENDPOINTS.SEAT_BOOKING.BOOKING_DETAILS(booking._id), {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          const seats = (details?.seats || [])
            .map((s: any) => {
              const raw = s.seatLabel ?? `${s.rowLabel ?? ''}${s.seatNumber ?? ''}`;
              return String(raw || '').trim().toUpperCase();
            })
            .filter(Boolean);
          if (seats.length) setResolvedSeatLabels(seats);
        } catch {
          /* ignore */
        }
      })();
    } catch {
      /* ignore */
    }
  }, [booking._id, seatLabels.seats]);

  const handleDownloadTicket = async () => {
    try {
      const canvas = document.createElement('canvas');
      const width = 1200;
      const height = 800;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // High quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Background
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, width, height);

      // Card geometry
      const cardX = 40;
      const cardY = 40;
      const cardWidth = width - 80;
      const cardHeight = height - 80;
      const cornerRadius = 24;

      // Helper: rounded rect
      const roundRect = (x: number, y: number, w: number, h: number, radius: number) => {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + w - radius, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
        ctx.lineTo(x + w, y + h - radius);
        ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
        ctx.lineTo(x + radius, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
      };

      // Draw card with shadow (full area)
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 10;
      roundRect(cardX, cardY, cardWidth, cardHeight, cornerRadius);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();

      // Header gradient clipped to header area
      ctx.save();
      roundRect(cardX, cardY, cardWidth, 200, cornerRadius);
      ctx.clip();
      const grd = ctx.createLinearGradient(cardX, cardY, cardX + cardWidth, cardY + 200);
      grd.addColorStop(0, '#391C71');
      grd.addColorStop(1, '#5B2C87');
      ctx.fillStyle = grd;
      ctx.fillRect(cardX, cardY, cardWidth, 200);
      ctx.restore();

      // Header content
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px Inter, system-ui, sans-serif';
      ctx.fillText('🎫 Event Ticket', cardX + 32, cardY + 60);
      ctx.font = 'bold 28px Inter, system-ui, sans-serif';
      ctx.fillText(`#${booking.bookingReference}`, cardX + 32, cardY + 110);

      // Status badge
      const statusX = cardX + cardWidth - 180;
      const statusY = cardY + 40;
      const statusColors = {
        confirmed: { bg: 'rgba(34, 197, 94, 0.2)', border: '#22c55e', text: '#15803d' },
        pending: { bg: 'rgba(251, 191, 36, 0.2)', border: '#fbbf24', text: '#92400e' },
        cancelled: { bg: 'rgba(239, 68, 68, 0.2)', border: '#ef4444', text: '#dc2626' },
        default: { bg: 'rgba(156, 163, 175, 0.2)', border: '#9ca3af', text: '#6b7280' }
      } as const;
      const statusColor = (statusColors as any)[booking.status] || statusColors.default;
      ctx.fillStyle = statusColor.bg;
      roundRect(statusX, statusY, 140, 32, 16);
      ctx.fill();
      ctx.strokeStyle = statusColor.border;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = statusColor.text;
      ctx.font = '600 14px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(booking.status.toUpperCase(), statusX + 70, statusY + 22);
      ctx.textAlign = 'left';

      // Event name
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 36px Inter, system-ui, sans-serif';
      const eventName = event?.name || 'Event';
      ctx.fillText(eventName.length > 30 ? eventName.substring(0, 30) + '...' : eventName, cardX + 32, cardY + 280);

      // Venue and date
      const when = event ? `${new Date(event.startDate).toLocaleDateString()} ${event.startTime} - ${new Date(event.endDate).toLocaleDateString()} ${event.endTime}` : '';
      if (venue) {
        ctx.fillStyle = '#f3f4f6';
        roundRect(cardX + 32, cardY + 320, 300, 80, 12);
        ctx.fill();
        ctx.fillStyle = '#6b7280';
        ctx.font = '400 14px Inter, system-ui, sans-serif';
        ctx.fillText('🏢 VENUE', cardX + 48, cardY + 345);
        ctx.fillStyle = '#111827';
        ctx.font = '600 18px Inter, system-ui, sans-serif';
        ctx.fillText(venue.name, cardX + 48, cardY + 370);
        ctx.font = '400 14px Inter, system-ui, sans-serif';
        ctx.fillText(`${venue.address}, ${venue.city}`, cardX + 48, cardY + 390);
      }
      if (when) {
        ctx.fillStyle = '#f3f4f6';
        roundRect(cardX + 360, cardY + 320, 320, 80, 12);
        ctx.fill();
        ctx.fillStyle = '#6b7280';
        ctx.font = '400 14px Inter, system-ui, sans-serif';
        ctx.fillText('📅 DATE & TIME', cardX + 376, cardY + 345);
        ctx.fillStyle = '#111827';
        ctx.font = '600 16px Inter, system-ui, sans-serif';
        const dateText = when.length > 35 ? when.substring(0, 35) + '...' : when;
        ctx.fillText(dateText, cardX + 376, cardY + 370);
      }

      // Seat/Table/Booth pills
      const activeSeatLabels = resolvedSeatLabels || seatLabels.seats;
      let pillY = cardY + 440;
      let pillX = cardX + 32;
      if (activeSeatLabels.length > 0) {
        ctx.fillStyle = '#6b7280';
        ctx.font = '400 14px Inter, system-ui, sans-serif';
        ctx.fillText(activeSeatLabels.length === 1 ? 'SEAT' : 'SEATS', pillX, pillY);
        pillY += 25;
        activeSeatLabels.forEach((label) => {
          if (pillX + 80 > cardX + cardWidth - 300) { pillX = cardX + 32; pillY += 40; }
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#d1d5db';
          ctx.lineWidth = 1;
          roundRect(pillX, pillY, 70, 32, 8);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#111827';
          ctx.font = '600 14px Inter, system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(label, pillX + 35, pillY + 22);
          ctx.textAlign = 'left';
          pillX += 80;
        });
        pillY += 50; pillX = cardX + 32;
      }
      if (seatLabels.tables.length > 0) {
        ctx.fillStyle = '#6b7280';
        ctx.font = '400 14px Inter, system-ui, sans-serif';
        ctx.fillText(seatLabels.tables.length === 1 ? 'TABLE' : 'TABLES', pillX, pillY);
        pillY += 25;
        seatLabels.tables.forEach((label) => {
          if (pillX + 80 > cardX + cardWidth - 300) { pillX = cardX + 32; pillY += 40; }
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#d1d5db';
          ctx.lineWidth = 1;
          roundRect(pillX, pillY, 70, 32, 8);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#111827';
          ctx.font = '600 14px Inter, system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(label, pillX + 35, pillY + 22);
          ctx.textAlign = 'left';
          pillX += 80;
        });
        pillY += 50; pillX = cardX + 32;
      }
      if (seatLabels.booths.length > 0) {
        ctx.fillStyle = '#6b7280';
        ctx.font = '400 14px Inter, system-ui, sans-serif';
        ctx.fillText(seatLabels.booths.length === 1 ? 'BOOTH' : 'BOOTHS', pillX, pillY);
        pillY += 25;
        seatLabels.booths.forEach((label) => {
          if (pillX + 80 > cardX + cardWidth - 300) { pillX = cardX + 32; pillY += 40; }
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#d1d5db';
          ctx.lineWidth = 1;
          roundRect(pillX, pillY, 70, 32, 8);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#111827';
          ctx.font = '600 14px Inter, system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(label, pillX + 35, pillY + 22);
          ctx.textAlign = 'left';
          pillX += 80;
        });
      }

      // Bottom stats
      const totalPaid = booking.paymentInfo?.total ?? 0;
      const currency = booking.paymentInfo?.currency || 'KWD';
      const bottomY = cardY + cardHeight - 120;
      ctx.fillStyle = 'rgba(139, 92, 246, 0.1)';
      roundRect(cardX + 32, bottomY, 160, 80, 12); ctx.fill();
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)'; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = '#7c3aed'; ctx.font = '400 12px Inter, system-ui, sans-serif';
      ctx.fillText('TOTAL TICKETS', cardX + 48, bottomY + 25);
      ctx.font = 'bold 24px Inter, system-ui, sans-serif'; ctx.fillText(booking.totalTickets.toString(), cardX + 48, bottomY + 55);

      ctx.fillStyle = 'rgba(34, 197, 94, 0.1)';
      roundRect(cardX + 220, bottomY, 160, 80, 12); ctx.fill();
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)'; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = '#059669'; ctx.font = '400 12px Inter, system-ui, sans-serif';
      ctx.fillText('AMOUNT PAID', cardX + 236, bottomY + 25);
      ctx.font = 'bold 20px Inter, system-ui, sans-serif'; ctx.fillText(`${totalPaid} ${currency}`, cardX + 236, bottomY + 55);

      ctx.fillStyle = 'rgba(245, 158, 11, 0.1)';
      roundRect(cardX + 408, bottomY, 180, 80, 12); ctx.fill();
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)'; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = '#d97706'; ctx.font = '400 12px Inter, system-ui, sans-serif';
      ctx.fillText('ISSUED', cardX + 424, bottomY + 25);
      ctx.font = 'bold 14px Inter, system-ui, sans-serif';
      ctx.fillText(new Date(booking.createdAt).toLocaleDateString(), cardX + 424, bottomY + 50);
      ctx.font = '400 12px Inter, system-ui, sans-serif';
      ctx.fillText(new Date(booking.createdAt).toLocaleTimeString(), cardX + 424, bottomY + 65);

      // QR Code
      if (qrDataUrl) {
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            const qrSize = 180;
            const qrX = cardX + cardWidth - qrSize - 40;
            const qrY = cardY + 300;
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#e5e7eb';
            ctx.lineWidth = 1;
            roundRect(qrX - 15, qrY - 15, qrSize + 30, qrSize + 50, 12); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#6b7280'; ctx.font = '400 12px Inter, system-ui, sans-serif';
            ctx.textAlign = 'center'; ctx.fillText('🛡️ SCAN FOR ENTRY', qrX + qrSize / 2, qrY - 5); ctx.textAlign = 'left';
            ctx.drawImage(img, qrX, qrY, qrSize, qrSize);
            resolve();
          };
          img.src = qrDataUrl;
        });
      }

      // Download
      const link = document.createElement('a');
      link.download = `ticket-${booking.bookingReference}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error generating ticket:', error);
    }
  };

  const cover = event?.coverPhoto || event?.images?.[0] || '';
  const primaryArtists: Array<{ name: string; photo?: string }>
    = (event?.artists || []).slice(0, 3).map((a: any) => ({ name: a.artistName, photo: a.artistPhoto }));
  const venue = event?.venue;
  const when = event ? `${new Date(event.startDate).toLocaleDateString()} ${event.startTime} - ${new Date(event.endDate).toLocaleDateString()} ${event.endTime}` : '';
  const totalPaid = booking.paymentInfo?.total ?? 0;
  const currency = booking.paymentInfo?.currency || 'KWD';

  return (
    <div className={`rounded-xl border border-white/60 shadow-lg overflow-hidden ${className ?? ''}`}>
      <div className="relative h-40 md:h-48 bg-gray-100">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={event?.name || 'Event cover'} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-purple-600 to-indigo-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div className="text-white">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center">
                <Ticket className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-white/80">Ticket</p>
                <p className="text-base md:text-lg font-semibold">{booking.bookingReference}</p>
              </div>
            </div>
            {event?.name && <p className="mt-1 text-sm md:text-base font-medium">{event.name}</p>}
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${
            booking.status === 'confirmed' ? 'bg-green-500/20 text-green-100 border-green-400/40' :
            booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-100 border-yellow-400/40' :
            booking.status === 'cancelled' ? 'bg-red-500/20 text-red-100 border-red-400/40' :
            'bg-gray-500/20 text-gray-100 border-gray-400/40'
          }`}>
            {booking.status}
          </span>
        </div>
      </div>

      <div className="p-4 md:p-6 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            {primaryArtists.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-gray-900 font-medium mb-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  Performing Artists
                </div>
                <div className="flex items-center gap-3">
                  {primaryArtists.map((a, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                        {a.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={a.photo} alt={a.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-300" />
                        )}
                      </div>
                      <span className="text-sm text-gray-800">{a.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {venue && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Venue</p>
                    <p className="text-sm font-medium text-gray-900">{venue.name}</p>
                    <p className="text-xs text-gray-600">{venue.address}, {venue.city}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                    <CalendarIcon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date & Time</p>
                    <p className="text-sm font-medium text-gray-900">{when}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Show only sections with actual bookings */}
              {(resolvedSeatLabels || seatLabels.seats).length > 0 && (
                <div className="rounded-lg border border-gray-200 p-3">
                  <p className="text-xs text-gray-500 mb-2">
                    {(resolvedSeatLabels || seatLabels.seats).length === 1 ? 'Seat' : 'Seats'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(resolvedSeatLabels || seatLabels.seats).map((label, idx) => (
                      <span
                        key={`seat-${idx}`}
                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-900"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {seatLabels.tables.length > 0 && (
                <div className="rounded-lg border border-gray-200 p-3">
                  <p className="text-xs text-gray-500 mb-2">
                    {seatLabels.tables.length === 1 ? 'Table' : 'Tables'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {seatLabels.tables.map((label, idx) => (
                      <span
                        key={`table-${idx}`}
                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-900"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {seatLabels.booths.length > 0 && (
                <div className="rounded-lg border border-gray-200 p-3">
                  <p className="text-xs text-gray-500 mb-2">
                    {seatLabels.booths.length === 1 ? 'Booth' : 'Booths'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {seatLabels.booths.map((label, idx) => (
                      <span
                        key={`booth-${idx}`}
                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-900"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-lg bg-gradient-to-br from-violet-50 to-indigo-50 border border-indigo-100 p-3">
                <p className="text-xs text-indigo-600 mb-1">Total Tickets</p>
                <p className="text-sm font-semibold text-indigo-900">{booking.totalTickets}</p>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-3">
                <p className="text-xs text-emerald-600 mb-1">Amount Paid</p>
                <p className="text-sm font-semibold text-emerald-900">{totalPaid} {currency}</p>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 p-3">
                <p className="text-xs text-amber-600 mb-1">Issued</p>
                <p className="text-sm font-semibold text-amber-900">{new Date(booking.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-36 h-36 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrDataUrl} alt="Ticket QR" className="w-full h-full object-contain" />
              ) : (
                <QrCode className="w-10 h-10 text-gray-400" />
              )}
            </div>
            <button
              onClick={handleDownloadTicket}
              className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white rounded-lg hover:from-[#5B2C87] hover:to-[#391C71] transition-all text-sm"
            >
              <Download className="w-4 h-4" />
              Download Ticket
            </button>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <ShieldCheck className="w-4 h-4" />
              Keep this QR handy for entry
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
