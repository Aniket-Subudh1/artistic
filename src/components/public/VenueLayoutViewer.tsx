"use client";
import React, { useMemo } from 'react';
import { VenueLayout } from '@/services/venue-layout.service';

// Minimal read-only SVG viewer for venue layouts
// Renders seats as circles, tables/booths/screens as rectangles; labels shown where available
export default function VenueLayoutViewer({ layout }: { layout: VenueLayout }) {
  const width = layout.canvasW || 1200;
  const height = layout.canvasH || 800;

  const items = layout.items || [];

  // Map categories for quick lookup (name, color, price)
  const catMap = useMemo(() => {
    const m = new Map<string, { name: string; color: string; price: number }>();
    (layout.categories || []).forEach(c => m.set(c.id, { name: c.name, color: c.color, price: c.price }));
    return m;
  }, [layout.categories]);

  return (
    <div className="w-full h-full border rounded-md bg-white flex items-center justify-center">
      <svg 
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${width} ${height}`} 
        preserveAspectRatio="xMidYMid meet"
        className="max-w-full max-h-full"
        style={{ aspectRatio: `${width}/${height}` }}
      >
        {/* background grid light */}
        <rect x={0} y={0} width={width} height={height} fill="#fafafa" />

        {items.map((it) => {
          const rot = it.rotation || 0;
          const cx = it.x + it.w / 2;
          const cy = it.y + it.h / 2;
          const seatLabel = it.label || (it.rowLabel && it.seatNumber ? `${it.rowLabel}${it.seatNumber}` : (typeof it.seatNumber === 'number' ? String(it.seatNumber) : ''));

          if (it.type === 'seat') {
            const r = Math.min(it.w, it.h) / 2;
            const cat = it.categoryId ? catMap.get(it.categoryId) : undefined;
            const fill = cat?.color || '#10b981';
            const title = `${seatLabel || 'Seat'}${cat ? ` • ${cat.name}` : ''}${cat ? ` • KD ${cat.price}` : ''}`;
            return (
              <g key={it.id} transform={`rotate(${rot} ${cx} ${cy})`}>
                <circle cx={cx} cy={cy} r={r - 2} fill={fill} stroke="#065f46" strokeWidth={1}>
                  <title>{title}</title>
                </circle>
                {seatLabel && (
                  <text x={cx} y={cy + 3} fontSize={10} textAnchor="middle" fill="#ffffff">{seatLabel}</text>
                )}
              </g>
            );
          }

          // Non-seat items as rectangles
          const cat = it.categoryId ? catMap.get(it.categoryId) : undefined;
          const itemPrice = (it as any)?.metadata?.price ?? cat?.price;
          const fill = cat?.color || (it.type === 'table' ? '#fbbf24' : it.type === 'booth' ? '#93c5fd' : '#e5e7eb');
          const stroke = '#374151';
          const title = `${it.label || it.type}${cat ? ` • ${cat.name}` : ''}${itemPrice ? ` • KD ${itemPrice}` : ''}`;
          const fontSize = Math.max(10, Math.min(16, Math.floor(Math.min(it.w, it.h) / 3)));
          return (
            <g key={it.id} transform={`rotate(${rot} ${cx} ${cy})`}>
              <rect x={it.x} y={it.y} width={it.w} height={it.h} fill={fill} stroke={stroke} strokeWidth={1} rx={4}>
                <title>{title}</title>
              </rect>
              {(it.label || it.type) && (
                <text x={cx} y={cy + fontSize/3} fontSize={fontSize} fontWeight={600} textAnchor="middle" fill="#ffffff">{it.label || it.type}</text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
