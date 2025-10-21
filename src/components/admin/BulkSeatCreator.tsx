"use client";
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Target } from 'lucide-react';

interface SeatCategory {
  id: string;
  name: string;
  color: string;
  price: number;
}

interface SeatItem {
  id: string;
  type: 'seat';
  x: number;
  y: number;
  w: number;
  h: number;
  rotation?: number;
  categoryId?: string;
  rowLabel?: string;
  seatNumber?: number;
  label?: string;
}

interface BulkSeatCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSeats: (seats: SeatItem[]) => void;
  categories: SeatCategory[];
  canvasSize: { w: number; h: number };
  onStartPlacement?: (config: BulkSeatConfig) => void;
  existingItems?: Array<{id: string; type: string; rowLabel?: string; seatNumber?: number}>;
}

interface BulkSeatConfig {
  rows: number;
  columns: number;
  seatSize: number;
  rowSpacing: number;
  columnSpacing: number;
  categoryId: string;
  startX: number;
  startY: number;
  rotation: number;
  rowDirection: 'A-Z' | 'Z-A' | '1-N' | 'N-1';
  numberDirection: '1-N' | 'N-1';
  skipPattern: 'none' | 'aisle-center' | 'aisle-sides' | 'custom';
  startingRow?: string;
}

const BulkSeatCreator: React.FC<BulkSeatCreatorProps> = ({ 
  isOpen, 
  onClose, 
  onCreateSeats, 
  categories, 
  canvasSize,
  onStartPlacement,
  existingItems = []
}) => {
  const [config, setConfig] = useState({
    rows: 5,
    columns: 10,
    seatSize: 24,
    rowSpacing: 30,
    columnSpacing: 25,
    categoryId: '',
    startX: 100,
    startY: 200,
    rotation: 0,
    rowDirection: 'A-Z' as 'A-Z' | 'Z-A' | '1-N' | 'N-1',
    numberDirection: '1-N' as '1-N' | 'N-1',
    skipPattern: 'none' as 'none' | 'aisle-center' | 'aisle-sides' | 'custom',
    startingRow: 'A'
  });

  useEffect(() => {
    if (categories.length > 0 && !config.categoryId) {
      setConfig(prev => ({ ...prev, categoryId: categories[0].id }));
    }
  }, [categories, config.categoryId]);

  // Helper function to convert alphabetical label to index (A=0, B=1, ..., Z=25, AA=26, AB=27, etc.)
  const alphabetToIndex = useCallback((label: string): number => {
    let result = 0;
    for (let i = 0; i < label.length; i++) {
      result = result * 26 + (label.charCodeAt(i) - 64); // A=1, B=2, etc.
    }
    return result - 1; // Convert to 0-based index
  }, []);

  // Helper function to convert index to alphabetical label (0=A, 1=B, ..., 25=Z, 26=AA, 27=AB, etc.)
  const indexToAlphabet = useCallback((index: number): string => {
    let result = '';
    index++; // Convert to 1-based
    while (index > 0) {
      index--; // Adjust for 0-based calculation
      result = String.fromCharCode(65 + (index % 26)) + result;
      index = Math.floor(index / 26);
    }
    return result;
  }, []);

  const getNextAvailableRowIndex = useCallback((): number => {
    const existingRows = new Set(
      existingItems
        .filter(item => item.type === 'seat' && item.rowLabel)
        .map(item => item.rowLabel!)
    );

    if (config.rowDirection === 'A-Z') {
      // Check single letters first (A-Z), then double letters (AA-ZZ), etc.
      for (let i = 0; i < 1000; i++) { // Check up to reasonable limit
        const rowLabel = indexToAlphabet(i);
        if (!existingRows.has(rowLabel)) {
          return i;
        }
      }
    } else if (config.rowDirection === '1-N') {
      // Find first unused number starting from 1
      for (let i = 0; i < 1000; i++) {
        const rowNumber = (i + 1).toString();
        if (!existingRows.has(rowNumber)) {
          return i;
        }
      }
    }

    return 0; // Fallback
  }, [existingItems, config.rowDirection, indexToAlphabet]);

  const generateRowLabel = useCallback((rowIndex: number): string => {
    // Use manual starting row if specified, otherwise use auto-detected
    let startingIndex: number;
    if (config.startingRow && config.startingRow.trim() && (config.rowDirection === 'A-Z' || config.rowDirection === 'Z-A')) {
      startingIndex = alphabetToIndex(config.startingRow.trim());
    } else if (config.startingRow && config.startingRow.trim() && (config.rowDirection === '1-N' || config.rowDirection === 'N-1')) {
      startingIndex = parseInt(config.startingRow) - 1;
    } else {
      startingIndex = getNextAvailableRowIndex();
    }
    
    const actualIndex = startingIndex + rowIndex;

    switch (config.rowDirection) {
      case 'A-Z': return indexToAlphabet(actualIndex);
      case 'Z-A': 
        // For Z-A direction with manual starting row
        if (config.startingRow && config.startingRow.trim()) {
          const manualStartIndex = alphabetToIndex(config.startingRow.trim());
          const reverseIndex = manualStartIndex - rowIndex;
          return reverseIndex >= 0 ? indexToAlphabet(reverseIndex) : 'A';
        } else {
          // Default Z-A behavior (Z, Y, X, ...)
          const reverseIndex = Math.max(0, 25 - actualIndex);
          return indexToAlphabet(reverseIndex);
        }
      case '1-N': return (actualIndex + 1).toString();
      case 'N-1': 
        // For N-1 direction with manual starting row
        if (config.startingRow && config.startingRow.trim()) {
          return Math.max(1, parseInt(config.startingRow) - rowIndex).toString();
        } else {
          return Math.max(1, config.rows - rowIndex).toString();
        }
      default: return indexToAlphabet(actualIndex);
    }
  }, [config.rowDirection, config.rows, config.startingRow, getNextAvailableRowIndex, alphabetToIndex, indexToAlphabet]);

  const generateSeatNumber = useCallback((colIndex: number): number => {
    switch (config.numberDirection) {
      case '1-N': return colIndex + 1;
      case 'N-1': return config.columns - colIndex;
      default: return colIndex + 1;
    }
  }, [config.numberDirection, config.columns]);

  const shouldSkipSeat = useCallback((row: number, col: number): boolean => {
    switch (config.skipPattern) {
      case 'aisle-center':
        return col === Math.floor(config.columns / 2);
      case 'aisle-sides':
        return col === 0 || col === config.columns - 1;
      default:
        return false;
    }
  }, [config.skipPattern, config.columns]);

  const generateSeats = useCallback((): SeatItem[] => {
    const seats: SeatItem[] = [];
    
    for (let r = 0; r < config.rows; r++) {
      for (let c = 0; c < config.columns; c++) {
        if (shouldSkipSeat(r, c)) continue;
        
        const rowLabel = generateRowLabel(r);
        const seatNumber = generateSeatNumber(c);
        
        const x = config.startX + (c * config.columnSpacing);
        const y = config.startY + (r * config.rowSpacing);
        
        // Check if seat fits in canvas
        if (x + config.seatSize > canvasSize.w || y + config.seatSize > canvasSize.h) continue;
        
        seats.push({
          id: `seat_${Date.now()}_${r}_${c}_${Math.random().toString(36).substr(2, 4)}`,
          type: 'seat' as const,
          x,
          y,
          w: config.seatSize,
          h: config.seatSize,
          rotation: config.rotation,
          categoryId: config.categoryId,
          rowLabel: rowLabel,
          seatNumber: seatNumber,
          label: `${rowLabel}${seatNumber}`
        });
      }
    }
    
    return seats;
  }, [config, generateRowLabel, generateSeatNumber, shouldSkipSeat, canvasSize]);

  const previewSeats = useMemo(() => generateSeats(), [generateSeats]);

  // Check for conflicts with existing seats
  const seatConflicts = useMemo(() => {
    const conflicts: string[] = [];
    const existingSeats = new Set(
      existingItems
        .filter(item => item.type === 'seat' && item.rowLabel && item.seatNumber)
        .map(item => `${item.rowLabel}${item.seatNumber}`)
    );

    previewSeats.forEach(seat => {
      const seatLabel = `${seat.rowLabel}${seat.seatNumber}`;
      if (existingSeats.has(seatLabel)) {
        conflicts.push(seatLabel);
      }
    });

    return conflicts;
  }, [previewSeats, existingItems]);

  const handleCreate = useCallback(() => {
    if (previewSeats.length > 0) {
      // Filter out conflicting seats
      const existingSeatLabels = new Set(
        existingItems
          .filter(item => item.type === 'seat' && item.rowLabel && item.seatNumber)
          .map(item => `${item.rowLabel}${item.seatNumber}`)
      );

      const validSeats = previewSeats.filter(seat => {
        const seatLabel = `${seat.rowLabel}${seat.seatNumber}`;
        return !existingSeatLabels.has(seatLabel);
      });

      if (validSeats.length === 0) {
        alert('No seats to create - all seat numbers already exist!');
        return;
      }

      if (validSeats.length < previewSeats.length) {
        const skippedCount = previewSeats.length - validSeats.length;
        if (!confirm(`${skippedCount} seats will be skipped due to duplicate numbers. Continue with ${validSeats.length} seats?`)) {
          return;
        }
      }

      // Use placement mode if callback is provided
      if (onStartPlacement) {
        onStartPlacement(config);
        onClose();
      } else {
        // Create only valid seats
        onCreateSeats(validSeats);
        onClose();
      }
    }
  }, [previewSeats, onCreateSeats, onClose, onStartPlacement, config, existingItems]);

  if (!isOpen) {
    return null;
  }

  // Show helpful message if no categories
  if (categories.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
        <Card className="w-full max-w-md bg-white shadow-2xl">
          <CardHeader className="bg-white border-b">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              No Categories Available
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <p className="text-sm text-gray-600">
              You need to create at least one seat category before you can create bulk seats.
            </p>
            <div className="flex gap-2">
              <Button onClick={onClose} className="flex-1">
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
        <CardHeader className="bg-white border-b sticky top-0 z-10">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Bulk Seat Creator
            </span>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <span className="sr-only">Close</span>
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuration */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Layout Configuration</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Rows</label>
                  <Input
                    type="number"
                    min="1" max="50"
                    value={config.rows}
                    onChange={(e) => setConfig({...config, rows: parseInt(e.target.value) || 1})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Columns</label>
                  <Input
                    type="number"
                    min="1" max="50"
                    value={config.columns}
                    onChange={(e) => setConfig({...config, columns: parseInt(e.target.value) || 1})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start X</label>
                  <Input
                    type="number"
                    min="0"
                    value={config.startX}
                    onChange={(e) => setConfig({...config, startX: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Start Y</label>
                  <Input
                    type="number"
                    min="0"
                    value={config.startY}
                    onChange={(e) => setConfig({...config, startY: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Seat Size</label>
                  <Input
                    type="number"
                    min="12" max="60"
                    value={config.seatSize}
                    onChange={(e) => setConfig({...config, seatSize: parseInt(e.target.value) || 24})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Row Spacing</label>
                  <Input
                    type="number"
                    min="20" max="100"
                    value={config.rowSpacing}
                    onChange={(e) => setConfig({...config, rowSpacing: parseInt(e.target.value) || 35})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Column Spacing</label>
                  <Input
                    type="number"
                    min="20" max="100"
                    value={config.columnSpacing}
                    onChange={(e) => setConfig({...config, columnSpacing: parseInt(e.target.value) || 35})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Rotation: {config.rotation}°</label>
                <Slider
                  value={[config.rotation]}
                  onValueChange={([value]) => setConfig({...config, rotation: value})}
                  max={359}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={config.categoryId}
                  onChange={(e) => setConfig({...config, categoryId: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name} - ${cat.price}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Row Direction</label>
                  <select
                    value={config.rowDirection}
                    onChange={(e) => setConfig({...config, rowDirection: e.target.value as any})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="A-Z">A, B, C... (Top to Bottom)</option>
                    <option value="Z-A">Z, Y, X... (Bottom to Top)</option>
                    <option value="1-N">1, 2, 3... (Top to Bottom)</option>
                    <option value="N-1">N, N-1, N-2... (Bottom to Top)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Number Direction</label>
                  <select
                    value={config.numberDirection}
                    onChange={(e) => setConfig({...config, numberDirection: e.target.value as any})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="1-N">1, 2, 3... (Left to Right)</option>
                    <option value="N-1">N, N-1, N-2... (Right to Left)</option>
                  </select>
                </div>
              </div>

              {/* Starting Row Input */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Starting Row {config.rowDirection.includes('A-Z') || config.rowDirection.includes('Z-A') ? '(Letter)' : '(Number)'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={config.startingRow}
                    onChange={(e) => {
                      let value = e.target.value.toUpperCase();
                      if (config.rowDirection === 'A-Z' || config.rowDirection === 'Z-A') {
                        // Only allow letters A-Z
                        value = value.replace(/[^A-Z]/g, '');
                        if (value.length > 2) value = value.slice(0, 2); // Limit to 2 characters (e.g., AA, AB)
                      } else {
                        // Only allow numbers 1-999
                        value = value.replace(/[^0-9]/g, '');
                        if (parseInt(value) > 999) value = '999';
                      }
                      setConfig({...config, startingRow: value});
                    }}
                    placeholder={config.rowDirection.includes('A-Z') || config.rowDirection.includes('Z-A') ? 'A' : '1'}
                    className="flex-1 px-3 py-2 border rounded-lg text-center font-mono"
                    maxLength={config.rowDirection.includes('A-Z') || config.rowDirection.includes('Z-A') ? 2 : 3}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      // Auto-detect and fill next available row
                      const nextRow = config.rowDirection === 'A-Z' 
                        ? indexToAlphabet(getNextAvailableRowIndex())
                        : (getNextAvailableRowIndex() + 1).toString();
                      setConfig({...config, startingRow: nextRow});
                    }}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                    title="Auto-detect next available row"
                  >
                    Auto
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {config.rowDirection.includes('A-Z') || config.rowDirection.includes('Z-A') 
                    ? 'Enter letter (A, B, C) or double letters (AA, AB)' 
                    : 'Enter starting row number (1, 2, 3, etc.)'
                  }
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Aisle Pattern</label>
                <select
                  value={config.skipPattern}
                  onChange={(e) => setConfig({...config, skipPattern: e.target.value as any})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="none">No Aisles</option>
                  <option value="aisle-center">Center Aisle</option>
                  <option value="aisle-sides">Side Aisles</option>
                </select>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Preview</h3>
              
              <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
                <div><strong>Total seats:</strong> {previewSeats.length}</div>
                <div><strong>Canvas size:</strong> {canvasSize.w} × {canvasSize.h}</div>
                
                {/* Smart numbering info */}
                <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                  <div className="font-medium text-blue-800">🧠 Smart Numbering</div>
                  <div className="text-blue-700 text-xs mt-1">
                    Starting from row: <strong>
                      {config.startingRow ? config.startingRow.toUpperCase() : 
                        indexToAlphabet(getNextAvailableRowIndex())
                      }
                    </strong>
                    {config.startingRow && <span className="text-green-600 ml-1">(Manual)</span>}
                    {!config.startingRow && <span className="text-blue-600 ml-1">(Auto-detected)</span>}
                  </div>
                  <div className="text-blue-600 text-xs">
                    Existing rows detected: {existingItems.filter(item => item.type === 'seat' && item.rowLabel).map(item => item.rowLabel).filter((value, index, self) => self.indexOf(value) === index).sort().slice(0, 5).join(', ')}
                  </div>
                </div>
                
                <div><strong>First seat:</strong> {previewSeats[0] ? `${previewSeats[0].rowLabel}${previewSeats[0].seatNumber}` : 'None'}</div>
                <div><strong>Last seat:</strong> {previewSeats[previewSeats.length - 1] ? `${previewSeats[previewSeats.length - 1].rowLabel}${previewSeats[previewSeats.length - 1].seatNumber}` : 'None'}</div>
                
                {/* Seat conflicts warning */}
                {seatConflicts.length > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800">
                    <div className="font-semibold flex items-center">
                      ⚠️ Seat Number Conflicts ({seatConflicts.length})
                    </div>
                    <div className="text-sm mt-1">
                      The following seat numbers already exist: {seatConflicts.slice(0, 5).join(', ')}
                      {seatConflicts.length > 5 && ` and ${seatConflicts.length - 5} more...`}
                    </div>
                    <div className="text-xs mt-1 text-red-600">
                      These seats will not be created to avoid duplicates.
                    </div>
                  </div>
                )}
                {config.skipPattern !== 'none' && (
                  <div><strong>Aisle pattern:</strong> {config.skipPattern}</div>
                )}
              </div>

              {previewSeats.length > 0 && (
                <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-auto">
                  <div className="text-xs font-medium mb-2">Layout Preview:</div>
                  <div className="grid gap-1 text-xs" style={{ gridTemplateColumns: `repeat(${config.columns}, 1fr)` }}>
                    {Array.from({ length: config.rows }, (_, r) =>
                      Array.from({ length: config.columns }, (_, c) => {
                        const seat = previewSeats.find(s => 
                          s.rowLabel === generateRowLabel(r) && s.seatNumber === generateSeatNumber(c)
                        );
                        
                        return (
                          <div
                            key={`${r}-${c}`}
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${
                              seat ? '' : 'opacity-30'
                            }`}
                            style={{ 
                              backgroundColor: seat 
                                ? categories.find(cat => cat.id === seat.categoryId)?.color || '#10b981'
                                : '#d1d5db',
                              transform: `rotate(${config.rotation}deg)`
                            }}
                          >
                            {seat ? `${seat.rowLabel}${seat.seatNumber}` : ''}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleCreate} 
              className="flex-1"
              disabled={previewSeats.length === 0}
            >
              {onStartPlacement ? `Start Placement (${previewSeats.length} seats)` : `Create ${previewSeats.length} Seats`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkSeatCreator;