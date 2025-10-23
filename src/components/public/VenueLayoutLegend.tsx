"use client";
import React, { useMemo } from 'react';
import { VenueLayout } from '@/services/venue-layout.service';

export default function VenueLayoutLegend({ layout }: { layout: VenueLayout }) {
  const items = layout.items || [];

  const { seatCats, nonSeatCats, tablesAndBooths } = useMemo(() => {
    const seatCats = [] as Array<{ id: string; name: string; color: string; price: number }>;
    const nonSeatCats = [] as Array<{ id: string; name: string; color: string; price: number; appliesTo?: string }>;

    (layout.categories || []).forEach(c => {
      const entry = { id: c.id, name: c.name, color: c.color, price: c.price } as any;
      // We don't have appliesTo in the legacy interface; infer by usage as well
      const usedBySeat = items.some(i => i.type === 'seat' && i.categoryId === c.id);
      const usedByNonSeat = items.some(i => (i.type === 'table' || i.type === 'booth') && i.categoryId === c.id);
      if (usedBySeat && !usedByNonSeat) seatCats.push(entry);
      else if (usedByNonSeat && !usedBySeat) nonSeatCats.push(entry);
      else if (usedBySeat && usedByNonSeat) {
        // If shared, list under both for clarity
        seatCats.push(entry);
        nonSeatCats.push(entry);
      }
    });

    // Aggregate tables/booths actual prices by item
    const tablesAndBooths = items
      .filter(i => i.type === 'table' || i.type === 'booth')
      .map(i => {
        const cat = (layout.categories || []).find(c => c.id === i.categoryId);
        const price = (i as any)?.metadata?.price ?? cat?.price ?? 0;
        return {
          id: i.id,
          label: i.label || (i.type === 'table' ? 'Table' : i.type === 'booth' ? 'Booth' : i.type),
          type: i.type,
          color: cat?.color || (i.type === 'table' ? '#fbbf24' : i.type === 'booth' ? '#93c5fd' : '#e5e7eb'),
          price
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));

    return { seatCats, nonSeatCats, tablesAndBooths };
  }, [layout.categories, layout.items]);

  return (
    <aside className="w-full md:w-72 lg:w-80 border rounded-md p-3 bg-white h-full md:sticky md:top-0">
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold mb-2">Seat Categories</h3>
          {seatCats.length === 0 && <div className="text-xs text-gray-500">No seat categories</div>}
          <ul className="space-y-1">
            {seatCats.map(c => (
              <li key={c.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="truncate">{c.name}</span>
                </div>
                <span className="font-medium">KD {c.price}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-2">Tables & Booths</h3>
          {tablesAndBooths.length === 0 && <div className="text-xs text-gray-500">No tables/booths</div>}
          <ul className="space-y-1">
            {tablesAndBooths.map(t => (
              <li key={t.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: t.color }} />
                  <span className="truncate">{t.label}</span>
                </div>
                <span className="font-medium">KD {t.price ?? 0}</span>
              </li>
            ))}
          </ul>
        </div>

        {nonSeatCats.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Non-seat Categories</h3>
            <ul className="space-y-1">
              {nonSeatCats.map(c => (
                <li key={c.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: c.color }} />
                    <span className="truncate">{c.name}</span>
                  </div>
                  <span className="font-medium">KD {c.price}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
}
