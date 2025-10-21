'use client';

import React, { useState } from 'react';
import { SeatCategory, SeatMapItem, SeatMapItemType } from '@/services/venue-layout.service';
import { X, Grid, Plus } from 'lucide-react';

interface BulkSeatCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSeats: (seats: SeatMapItem[]) => void;
  categories: SeatCategory[];
  startX: number;
  startY: number;
}

const BulkSeatCreator: React.FC<BulkSeatCreatorProps> = ({
  isOpen,
  onClose,
  onCreateSeats,
  categories,
  startX,
  startY,
}) => {
  const [config, setConfig] = useState({
    rows: 5,
    columns: 10,
    seatWidth: 35,
    seatHeight: 35,
    rowSpacing: 50,
    columnSpacing: 40,
    categoryId: categories[0]?.id || '',
    numbering: 'auto' as 'auto' | 'custom',
    startingRow: 'A',
    startingNumber: 1,
    rowDirection: 'A-Z' as 'A-Z' | 'Z-A' | '1-N' | 'N-1',
    numberDirection: '1-N' as '1-N' | 'N-1',
  });

  const [customSeats, setCustomSeats] = useState<{ row: string; number: string }[]>([]);

  const generateRowLabel = (rowIndex: number): string => {
    switch (config.rowDirection) {
      case 'A-Z':
        return String.fromCharCode(65 + rowIndex); // A, B, C...
      case 'Z-A':
        return String.fromCharCode(90 - rowIndex); // Z, Y, X...
      case '1-N':
        return (rowIndex + 1).toString();
      case 'N-1':
        return (config.rows - rowIndex).toString();
      default:
        return String.fromCharCode(65 + rowIndex);
    }
  };

  const generateSeatNumber = (colIndex: number): string => {
    switch (config.numberDirection) {
      case '1-N':
        return (colIndex + config.startingNumber).toString();
      case 'N-1':
        return (config.columns - colIndex + config.startingNumber - 1).toString();
      default:
        return (colIndex + config.startingNumber).toString();
    }
  };

  const previewSeats = () => {
    const seats: SeatMapItem[] = [];
    
    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.columns; col++) {
        const rowLabel = generateRowLabel(row);
        const seatNumber = generateSeatNumber(col);
        const label = `${rowLabel}${seatNumber}`;
        
        seats.push({
          id: `seat-${row}-${col}-${Date.now()}`,
          type: SeatMapItemType.SEAT,
          x: startX + (col * config.columnSpacing),
          y: startY + (row * config.rowSpacing),
          w: config.seatWidth,
          h: config.seatHeight,
          categoryId: config.categoryId,
          label: label,
          rowLabel: rowLabel,
          seatNumber: parseInt(seatNumber),
        });
      }
    }
    
    return seats;
  };

  const handleCreate = () => {
    const seats = previewSeats();
    onCreateSeats(seats);
    onClose();
  };

  const addCustomSeat = () => {
    setCustomSeats([...customSeats, { row: '', number: '' }]);
  };

  const updateCustomSeat = (index: number, field: 'row' | 'number', value: string) => {
    const updated = [...customSeats];
    updated[index][field] = value;
    setCustomSeats(updated);
  };

  const removeCustomSeat = (index: number) => {
    setCustomSeats(customSeats.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Bulk Seat Creator</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Layout Configuration */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Grid size={16} />
              Layout Configuration
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Rows</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={config.rows}
                  onChange={(e) => setConfig({...config, rows: parseInt(e.target.value) || 1})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Columns</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={config.columns}
                  onChange={(e) => setConfig({...config, columns: parseInt(e.target.value) || 1})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Seat Width (px)</label>
                <input
                  type="number"
                  min="20"
                  max="100"
                  value={config.seatWidth}
                  onChange={(e) => setConfig({...config, seatWidth: parseInt(e.target.value) || 35})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Seat Height (px)</label>
                <input
                  type="number"
                  min="20"
                  max="100"
                  value={config.seatHeight}
                  onChange={(e) => setConfig({...config, seatHeight: parseInt(e.target.value) || 35})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Row Spacing (px)</label>
                <input
                  type="number"
                  min="30"
                  max="200"
                  value={config.rowSpacing}
                  onChange={(e) => setConfig({...config, rowSpacing: parseInt(e.target.value) || 50})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Column Spacing (px)</label>
                <input
                  type="number"
                  min="30"
                  max="200"
                  value={config.columnSpacing}
                  onChange={(e) => setConfig({...config, columnSpacing: parseInt(e.target.value) || 40})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Category Selection */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Category</h3>
            <select
              value={config.categoryId}
              onChange={(e) => setConfig({...config, categoryId: e.target.value})}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name} - ${category.price}
                </option>
              ))}
            </select>
          </div>

          {/* Numbering Configuration */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Seat Numbering</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Row Labeling</label>
                <select
                  value={config.rowDirection}
                  onChange={(e) => setConfig({...config, rowDirection: e.target.value as any})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="A-Z">A, B, C... (A to Z)</option>
                  <option value="Z-A">Z, Y, X... (Z to A)</option>
                  <option value="1-N">1, 2, 3... (1 to N)</option>
                  <option value="N-1">N, N-1, N-2... (N to 1)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Starting Number</label>
                  <input
                    type="number"
                    min="1"
                    value={config.startingNumber}
                    onChange={(e) => setConfig({...config, startingNumber: parseInt(e.target.value) || 1})}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Number Direction</label>
                  <select
                    value={config.numberDirection}
                    onChange={(e) => setConfig({...config, numberDirection: e.target.value as any})}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1-N">Left to Right (1, 2, 3...)</option>
                    <option value="N-1">Right to Left (N, N-1, N-2...)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Preview (First Row)</h3>
            <div className="flex gap-2 text-sm">
              {Array.from({ length: Math.min(config.columns, 10) }, (_, i) => {
                const rowLabel = generateRowLabel(0);
                const seatNumber = generateSeatNumber(i);
                return (
                  <span key={i} className="px-2 py-1 bg-blue-100 rounded">
                    {rowLabel}{seatNumber}
                  </span>
                );
              })}
              {config.columns > 10 && <span className="text-gray-500">...</span>}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Total seats: {config.rows * config.columns}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create Seats
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkSeatCreator;