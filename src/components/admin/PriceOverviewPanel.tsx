"use client";
import React, { useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SeatCategory {
  id: string;
  name: string;
  color: string;
  price: number;
}

interface VenueItemBase {
  id: string;
  type: string;
  label?: string;
  metadata?: Record<string, any>;
  categoryId?: string;
}

interface Props {
  items: VenueItemBase[];
  categories: SeatCategory[];
}

const PriceOverviewPanel: React.FC<Props> = ({ items, categories }) => {
  const tables = useMemo(() => items.filter(i => i.type === 'table'), [items]);
  const booths = useMemo(() => items.filter(i => i.type === 'booth'), [items]);

  // Create category lookup map
  const categoryPriceMap = useMemo(() => 
    Object.fromEntries(categories.map(cat => [cat.id, cat.price])),
    [categories]
  );

  // Helper function to get effective price for an item
  const getItemPrice = useCallback((item: VenueItemBase): number | null => {
    // First check direct metadata price (this should now be populated from backend)
    if (typeof item.metadata?.price === 'number' && item.metadata.price > 0) {
      return item.metadata.price;
    }
    // Fallback: check category price (for backward compatibility)
    if (item.categoryId && categoryPriceMap[item.categoryId]) {
      return categoryPriceMap[item.categoryId];
    }
    return null;
  }, [categoryPriceMap]);

  const tableStats = useMemo(() => ({
    count: tables.length,
    missing: tables.filter(t => getItemPrice(t) === null).length
  }), [tables, getItemPrice]);

  const boothStats = useMemo(() => ({
    count: booths.length,
    missing: booths.filter(b => getItemPrice(b) === null).length
  }), [booths, getItemPrice]);

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs">Prices Overview</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3 text-xs">
        {/* Seat Categories */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-medium">Seat Categories</span>
            <Badge variant="secondary">{categories.length}</Badge>
          </div>
          <div className="space-y-1 max-h-28 overflow-y-auto">
            {categories.length === 0 && (
              <div className="text-[11px] text-gray-500">No categories yet</div>
            )}
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-1 rounded border bg-gray-50">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded border" style={{ backgroundColor: cat.color }} />
                  <span className="font-medium">{cat.name}</span>
                </div>
                <span className="font-semibold">KD {cat.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tables */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-medium">Tables</span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{tableStats.count}</Badge>
              {tableStats.missing > 0 && (
                <Badge variant="destructive" className="bg-amber-100 text-amber-900 border-amber-300">{tableStats.missing} missing price</Badge>
              )}
            </div>
          </div>
          <div className="space-y-1 max-h-28 overflow-y-auto">
            {tables.length === 0 && (
              <div className="text-[11px] text-gray-500">No tables</div>
            )}
            {tables.map(t => {
              const price = getItemPrice(t);
              return (
                <div key={t.id} className="flex items-center justify-between p-1 rounded border">
                  <span className="truncate max-w-[9rem]" title={t.label || t.id}>{t.label || t.id}</span>
                  <span className={`${price !== null ? 'font-semibold' : 'text-red-600'}`}>
                    {price !== null ? `KD ${price}` : 'Not set'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Booths */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-medium">Booths</span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{boothStats.count}</Badge>
              {boothStats.missing > 0 && (
                <Badge variant="destructive" className="bg-amber-100 text-amber-900 border-amber-300">{boothStats.missing} missing price</Badge>
              )}
            </div>
          </div>
          <div className="space-y-1 max-h-28 overflow-y-auto">
            {booths.length === 0 && (
              <div className="text-[11px] text-gray-500">No booths</div>
            )}
            {booths.map(b => {
              const price = getItemPrice(b);
              return (
                <div key={b.id} className="flex items-center justify-between p-1 rounded border">
                  <span className="truncate max-w-[9rem]" title={b.label || b.id}>{b.label || b.id}</span>
                  <span className={`${price !== null ? 'font-semibold' : 'text-red-600'}`}>
                    {price !== null ? `KD ${price}` : 'Not set'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceOverviewPanel;
