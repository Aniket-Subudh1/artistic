"use client";
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Hash, Users, MapPin } from 'lucide-react';

interface SeatItem {
  id: string;
  type: 'seat';
  rowLabel?: string;
  seatNumber?: number;
  categoryId?: string;
}

interface SeatCategory {
  id: string;
  name: string;
  color: string;
  price: number;
}

interface SeatOverviewPanelProps {
  items: Array<{id: string; type: string; rowLabel?: string; seatNumber?: number; categoryId?: string}>;
  categories: SeatCategory[];
}

const SeatOverviewPanel: React.FC<SeatOverviewPanelProps> = ({ items, categories }) => {
  const getNextAvailableRow = (existingRows: string[]): string => {
    for (let i = 0; i < 26; i++) {
      const rowLetter = String.fromCharCode(65 + i);
      if (!existingRows.includes(rowLetter)) {
        return rowLetter;
      }
    }
    return 'AA'; // Fallback
  };

  const seatData = useMemo(() => {
    const seats = items.filter(item => item.type === 'seat') as SeatItem[];
    
    // Group seats by row
    const seatsByRow = seats.reduce((acc, seat) => {
      const row = seat.rowLabel || 'Unknown';
      if (!acc[row]) {
        acc[row] = [];
      }
      acc[row].push(seat);
      return acc;
    }, {} as Record<string, SeatItem[]>);

    // Sort rows alphabetically and seats numerically within each row
    const sortedRows = Object.keys(seatsByRow).sort();
    sortedRows.forEach(row => {
      seatsByRow[row].sort((a, b) => (a.seatNumber || 0) - (b.seatNumber || 0));
    });

    // Calculate statistics
    const totalSeats = seats.length;
    const totalRows = sortedRows.length;
    const nextAvailableRow = getNextAvailableRow(sortedRows);
    
    return {
      seatsByRow,
      sortedRows,
      totalSeats,
      totalRows,
      nextAvailableRow
    };
  }, [items]);

  const getCategoryColor = (categoryId?: string): string => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.color || '#6b7280';
  };

  const getRowStats = (seats: SeatItem[]) => {
    const numbers = seats.map(s => s.seatNumber || 0).filter(n => n > 0).sort((a, b) => a - b);
    const minSeat = numbers[0] || 0;
    const maxSeat = numbers[numbers.length - 1] || 0;
    const gaps = [];
    
    for (let i = minSeat; i <= maxSeat; i++) {
      if (!numbers.includes(i)) {
        gaps.push(i);
      }
    }
    
    return { minSeat, maxSeat, count: numbers.length, gaps };
  };

  if (seatData.totalSeats === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Hash className="h-4 w-4" />
            Seat Numbering Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No seats created yet</p>
            <p className="text-xs">Start by adding seats to see numbering overview</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Hash className="h-4 w-4" />
          Seat Numbering Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Statistics */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-blue-50 p-2 rounded">
            <div className="text-lg font-bold text-blue-700">{seatData.totalSeats}</div>
            <div className="text-xs text-blue-600">Total Seats</div>
          </div>
          <div className="bg-green-50 p-2 rounded">
            <div className="text-lg font-bold text-green-700">{seatData.totalRows}</div>
            <div className="text-xs text-green-600">Rows</div>
          </div>
          <div className="bg-purple-50 p-2 rounded">
            <div className="text-lg font-bold text-purple-700">{seatData.nextAvailableRow}</div>
            <div className="text-xs text-purple-600">Next Row</div>
          </div>
        </div>

        {/* Next Available Info */}
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded">
          <div className="font-medium text-emerald-800 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Smart Numbering
          </div>
          <div className="text-sm text-emerald-700 mt-1">
            Next seat will be: <strong>{seatData.nextAvailableRow}1</strong>
          </div>
          <div className="text-xs text-emerald-600">
            Continuing sequential pattern from existing seats
          </div>
        </div>

        {/* Row Breakdown */}
        <div>
          <div className="font-medium text-sm mb-2">Row Breakdown</div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {seatData.sortedRows.map(row => {
              const seats = seatData.seatsByRow[row];
              const stats = getRowStats(seats);
              
              return (
                <div key={row} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-mono">
                      Row {row}
                    </Badge>
                    <span className="text-gray-600">
                      {stats.count} seats ({stats.minSeat}-{stats.maxSeat})
                    </span>
                  </div>
                  
                  <div className="flex gap-1">
                    {stats.gaps.length > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {stats.gaps.length} gaps
                      </Badge>
                    )}
                    <div className="flex gap-1">
                      {seats.slice(0, 3).map(seat => (
                        <div 
                          key={seat.id}
                          className="w-3 h-3 rounded-full border"
                          style={{ backgroundColor: getCategoryColor(seat.categoryId) }}
                          title={`${seat.rowLabel}${seat.seatNumber}`}
                        />
                      ))}
                      {seats.length > 3 && (
                        <span className="text-gray-400">+{seats.length - 3}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pattern Detection */}
        <div className="text-xs text-gray-600 space-y-1">
          <div><strong>Pattern:</strong> Alphabetical rows (A, B, C...)</div>
          <div><strong>Numbering:</strong> Sequential within rows (1, 2, 3...)</div>
          <div><strong>Status:</strong> {seatData.totalRows < 5 ? '📈 Growing' : seatData.totalRows < 15 ? '🎯 Moderate' : '🏟️ Large venue'}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SeatOverviewPanel;