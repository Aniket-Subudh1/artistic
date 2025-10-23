"use client";
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SeatCategory {
  id: string;
  name: string;
  color: string;
  price: number;
  appliesTo?: 'seat' | 'table' | 'booth';
}

interface VenueItemBase {
  id: string;
  type: string;
  label?: string;
  categoryId?: string;
  metadata?: Record<string, any>;
}

interface Props {
  selectedIds: string[];
  items: VenueItemBase[];
  categories: SeatCategory[];
  onUpdateItem: (id: string, data: Partial<VenueItemBase>) => void;
}

const SelectedItemDetailsPanel: React.FC<Props> = ({ selectedIds, items, categories, onUpdateItem }) => {
  const [localPrice, setLocalPrice] = useState<string>("");
  const [localLabel, setLocalLabel] = useState<string>("");
  const [localCategory, setLocalCategory] = useState<string>("");

  const selectedItem = useMemo(() => {
    if (selectedIds.length !== 1) return null;
    return items.find(i => i.id === selectedIds[0]) || null;
  }, [selectedIds, items]);

  React.useEffect(() => {
    if (!selectedItem) return;
    const price = selectedItem.metadata?.price;
    setLocalPrice(typeof price === 'number' ? String(price) : "");
    setLocalLabel(selectedItem.label || "");
    setLocalCategory(selectedItem.categoryId || "");
  }, [selectedItem?.id]);

  if (!selectedItem) return null;

  const isSeat = selectedItem.type === 'seat';
  const isTable = selectedItem.type === 'table';
  const isBooth = selectedItem.type === 'booth';

  const selectedCategory = categories.find(c => c.id === selectedItem.categoryId);
  const derivedSeatPrice = isSeat && selectedCategory ? selectedCategory.price : undefined;
  
  // Helper to get effective price for tables/booths
  const getEffectivePrice = (): number | undefined => {
    if (!isBooth && !isTable) return undefined;
    
    // First check direct metadata price (should now be populated from backend)
    if (typeof selectedItem.metadata?.price === 'number' && selectedItem.metadata.price > 0) {
      return selectedItem.metadata.price;
    }
    // Fallback: check category price (for backward compatibility)
    if (selectedCategory && selectedCategory.price > 0) {
      return selectedCategory.price;
    }
    return undefined;
  };
  
  const currentPrice = getEffectivePrice();

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs">Selected Item Details</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-2 text-xs">
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <span>ID</span>
          <Badge variant="outline" className="font-mono">{selectedItem.id.slice(0, 10)}…</Badge>
        </div>
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <span>Type</span>
          <Badge className="capitalize">{selectedItem.type}</Badge>
        </div>

        {/* Prominent price display for booth/table */}
        {(isBooth || isTable) && (
          <div className="flex items-center justify-between p-2 rounded border bg-amber-50 border-amber-200">
            <span className="font-medium text-amber-800">Price</span>
            <span className="font-semibold text-amber-900">{currentPrice !== undefined ? `KD ${currentPrice}` : 'Not set'}</span>
          </div>
        )}

        {/* Label */}
        <div>
          <label className="block font-medium mb-1">Label</label>
          <input
            value={localLabel}
            onChange={(e) => setLocalLabel(e.target.value)}
            className="w-full px-2 py-1 border rounded"
            placeholder="Label"
          />
          <div className="mt-1 text-right">
            <Button size="sm" variant="outline" className="h-7 text-xs"
              onClick={() => onUpdateItem(selectedItem.id, { label: localLabel })}
            >Save Label</Button>
          </div>
        </div>

        {/* Category (seats, booths, tables) */}
        {(isSeat || isBooth || isTable) && (
          <div>
            <label className="block font-medium mb-1">Category</label>
            <select
              value={localCategory}
              onChange={(e) => setLocalCategory(e.target.value)}
              className="w-full px-2 py-1 border rounded"
            >
              <option value="">No category</option>
              {categories
                .filter(cat => {
                  if (isSeat) return !cat.appliesTo || cat.appliesTo === 'seat';
                  if (isTable) return (cat.appliesTo === 'table');
                  if (isBooth) return (cat.appliesTo === 'booth');
                  return true;
                })
                .map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} - KD {cat.price}
                </option>
              ))}
            </select>
            <div className="mt-1 text-right">
              <Button size="sm" variant="outline" className="h-7 text-xs"
                onClick={() => onUpdateItem(selectedItem.id, { categoryId: localCategory || undefined })}
                disabled={localCategory === (selectedItem.categoryId || "")}
              >Save Category</Button>
            </div>
          </div>
        )}

        {/* Price */}
        {isSeat ? (
          <div className="p-2 bg-green-50 rounded border border-green-200">
            <div className="font-medium text-green-800">Seat Price</div>
            <div className="text-green-700">Derived from category: {selectedCategory ? selectedCategory.name : 'None'}</div>
            <div className="text-green-900 font-semibold text-sm">KD {derivedSeatPrice ?? 0}</div>
          </div>
        ) : (isBooth || isTable) ? (
          <div>
            <label className="block font-medium mb-1">Price</label>
            <input
              type="number"
              min={1}
              value={localPrice}
              onChange={(e) => setLocalPrice(e.target.value)}
              className="w-full px-2 py-1 border rounded"
              placeholder="e.g. 100"
            />
            <div className="mt-1 text-right">
              <Button size="sm" variant="outline" className="h-7 text-xs"
                onClick={() => {
                  const val = Number(localPrice);
                  if (!localPrice || isNaN(val) || val <= 0) {
                    alert('Please enter a valid positive price.');
                    return;
                  }
                  onUpdateItem(selectedItem.id, { metadata: { ...(selectedItem.metadata||{}), price: val } });
                }}
              >Save Price</Button>
            </div>
          </div>
        ) : null}

        {/* Table specific info */}
        {isTable && (
          <div className="flex items-center justify-between p-2 bg-purple-50 rounded border border-purple-200">
            <span>Seats Around</span>
            <Badge variant="secondary">{selectedItem.metadata?.seatCount ?? '-'}</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SelectedItemDetailsPanel;
