"use client";
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RotateCw, Trash2, X, Scale, Waves } from 'lucide-react';

interface SeatCategory {
  id: string;
  name: string;
  color: string;
  price: number;
}

interface VenueItem {
  id: string;
  type: string;
  categoryId?: string;
}

interface VenueLayout {
  items: VenueItem[];
  categories: SeatCategory[];
}

interface BulkOperationsPanelProps {
  selectedItems: string[];
  layout: VenueLayout;
  onRotate: (ids: string[], angle: number) => void;
  onScale: (ids: string[], scaleFactor: number) => void;
  onDelete: (ids: string[]) => void;
  onUpdateCategory: (ids: string[], categoryId: string) => void;
  onClearSelection: () => void;
  onShowCurvePanel?: () => void;
}

const BulkOperationsPanel: React.FC<BulkOperationsPanelProps> = ({ 
  selectedItems, 
  layout, 
  onRotate, 
  onScale,
  onDelete, 
  onUpdateCategory, 
  onClearSelection,
  onShowCurvePanel 
}) => {
  const [rotationAngle, setRotationAngle] = useState(0);
  const [scaleFactor, setScaleFactor] = useState(1);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  const selectedSeats = layout.items.filter(item => 
    selectedItems.includes(item.id) && item.type === 'seat'
  );

  const selectedByType = useMemo(() => {
    const counts: Record<string, number> = {};
    layout.items.forEach(item => {
      if (selectedItems.includes(item.id)) {
        counts[item.type] = (counts[item.type] || 0) + 1;
      }
    });
    return counts;
  }, [selectedItems, layout.items]);

  if (selectedItems.length === 0) return null;

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs flex items-center justify-between">
          <span>Bulk Operations ({selectedItems.length})</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="h-5 w-5 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {/* Selection Summary */}
        <div className="text-xs space-y-0.5 p-1.5 bg-gray-50 rounded">
          {Object.entries(selectedByType).map(([type, count]) => (
            <div key={type} className="flex justify-between">
              <span className="capitalize">{type}s:</span>
              <span className="font-medium">{count}</span>
            </div>
          ))}
        </div>

        {/* Rotation */}
        <div>
          <label className="block text-xs font-medium mb-1">Rotate Items</label>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRotate(selectedItems, -90)}
              className="flex-1 h-7 text-xs"
            >
              <RotateCw className="h-3 w-3 transform -scale-x-100" />
              -90°
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRotate(selectedItems, 90)}
              className="flex-1 h-7 text-xs"
            >
              <RotateCw className="h-3 w-3" />
              +90°
            </Button>
          </div>
          <div className="mt-1 flex gap-1">
            <input
              type="number"
              value={rotationAngle}
              onChange={(e) => setRotationAngle(parseInt(e.target.value) || 0)}
              className="flex-1 px-2 w-5 py-1 border rounded text-xs h-7"
              placeholder="Custom angle"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRotate(selectedItems, rotationAngle)}
              className="h-7 text-xs"
            >
              Apply
            </Button>
          </div>
        </div>

        {/* Curve Arrangement */}
        {onShowCurvePanel && selectedItems.length >= 2 && (
          <div>
            <label className="block text-xs font-medium mb-1">Curve Arrangement</label>
            <Button
              variant="outline"
              size="sm"
              onClick={onShowCurvePanel}
              className="w-full h-7 text-xs"
            >
              <Waves className="h-3 w-3 mr-1" />
              Arrange in Curve ({selectedItems.length} items)
            </Button>
          </div>
        )}

        {/* Scale Items */}
        <div>
          <label className="block text-xs font-medium mb-1">
            Scale Items ({selectedItems.length})
          </label>
          <div className="flex gap-1 mb-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onScale(selectedItems, 0.8)}
              className="flex-1 h-7 text-xs"
            >
              <Scale className="w-3 h-3 mr-1" />
              80%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onScale(selectedItems, 1.2)}
              className="flex-1 h-7 text-xs"
            >
              <Scale className="w-3 h-3 mr-1" />
              120%
            </Button>
          </div>
          <div className="mt-1 flex gap-1">
            <input
              type="number"
              value={scaleFactor}
              onChange={(e) => setScaleFactor(parseFloat(e.target.value) || 1)}
              className="flex-1 px-2 py-1 border rounded text-xs h-7"
              placeholder="Scale factor"
              step="0.1"
              min="0.1"
              max="3"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => onScale(selectedItems, scaleFactor)}
              className="h-7 text-xs"
            >
              Apply
            </Button>
          </div>
        </div>

        {/* Category Update */}
        {selectedSeats.length > 0 && (
          <div>
            <label className="block text-xs font-medium mb-1">
              Update Category ({selectedSeats.length} seats)
            </label>
            <div className="flex gap-1">
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="flex-1 px-2 py-1 border rounded text-xs h-7"
              >
                <option value="">Select category</option>
                {layout.categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} - ${cat.price}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                size="sm"
                disabled={!selectedCategoryId}
                onClick={() => {
                  if (selectedCategoryId) {
                    onUpdateCategory(selectedSeats.map(s => s.id), selectedCategoryId);
                    setSelectedCategoryId('');
                  }
                }}
                className="h-7 text-xs"
              >
                Update
              </Button>
            </div>
          </div>
        )}

        {/* Delete */}
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(selectedItems)}
          className="w-full gap-1 h-7 text-xs"
        >
          <Trash2 className="h-3 w-3" />
          Delete Selected Items
        </Button>
      </CardContent>
    </Card>
  );
};

export default BulkOperationsPanel;