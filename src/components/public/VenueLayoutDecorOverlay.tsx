"use client";

import React, { useEffect, useState } from 'react';
import { seatBookingService } from '@/services/seat-booking.service';

export interface DecorOverlayProps {
  eventId: string;
  offsetX?: number;
  offsetY?: number;
  className?: string;
  style?: React.CSSProperties;
}

interface DecorItem {
  id: string;
  type: 'stage' | 'screen' | 'entry' | 'exit' | 'washroom' | string;
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
}

export default function VenueLayoutDecorOverlay({ eventId, offsetX = 0, offsetY = 0, className, style }: DecorOverlayProps) {
  const [items, setItems] = useState<DecorItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await seatBookingService.getEventDecor(eventId);
        if (!mounted) return;
        setItems((res?.items || []).map((it: any) => ({
          id: it.id,
          type: it.type,
          // Support both flattened and nested position/size shapes
          x: typeof it.x === 'number' ? it.x : (it.pos?.x ?? 0),
          y: typeof it.y === 'number' ? it.y : (it.pos?.y ?? 0),
          w: typeof it.w === 'number' ? it.w : (it.size?.x ?? 0),
          h: typeof it.h === 'number' ? it.h : (it.size?.y ?? 0),
          label: it.label ?? it.lbl,
        })));
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load decor');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [eventId]);

  if (loading) return null;
  if (error) return null;

  return (
  <div className={className} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', ...style }}>
      {items.map((it) => {
        const base: React.CSSProperties = {
          position: 'absolute',
          left: (it.x + offsetX) + 'px',
          top: (it.y + offsetY) + 'px',
          width: it.w + 'px',
          height: it.h + 'px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          borderRadius: 8,
          zIndex: 5,
        };
        if (it.type === 'stage') {
          return (
            <div key={it.id} style={{ ...base, background: '#374151', color: 'white', border: '2px solid #4B5563' }}>
              {it.label || 'STAGE'}
            </div>
          );
        }
        if (it.type === 'screen') {
          return (
            <div key={it.id} style={{ ...base, background: '#111827', color: 'white', border: '2px solid #1F2937', borderRadius: 4, fontSize: 12 }}>
              {it.label || 'SCREEN'}
            </div>
          );
        }
        if (it.type === 'entry') {
          return (
            <div key={it.id} style={{ ...base, background: '#DCFCE7', color: '#065F46', border: '2px solid #34D399', fontSize: 12, borderRadius: 6 }}>
              {it.label || 'ENTRY'}
            </div>
          );
        }
        if (it.type === 'exit') {
          return (
            <div key={it.id} style={{ ...base, background: '#FEE2E2', color: '#991B1B', border: '2px solid #F87171', fontSize: 12, borderRadius: 6 }}>
              {it.label || 'EXIT'}
            </div>
          );
        }
        if (it.type === 'washroom') {
          return (
            <div key={it.id} style={{ ...base, background: '#DBEAFE', color: '#1E40AF', border: '2px solid #60A5FA', fontSize: 12, borderRadius: 6 }}>
              {it.label || 'WASHROOM'}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
