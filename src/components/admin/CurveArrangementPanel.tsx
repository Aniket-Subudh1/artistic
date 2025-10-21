"use client";
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RotateCw, Circle, Move3D, Waves } from 'lucide-react';

interface CurveConfig {
  centerX: number;
  centerY: number;
  radius: number;
  startAngle: number;
  endAngle: number;
  arrangementType: 'arc' | 'circle' | 'semi-circle';
}

interface VenueItem {
  id: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation?: number;
}

interface CurveArrangementPanelProps {
  selectedItems: string[];
  items: VenueItem[];
  canvasSize: { w: number; h: number };
  onArrangeCurve: (ids: string[], config: CurveConfig) => void;
  onClose?: () => void;
}

const CurveArrangementPanel: React.FC<CurveArrangementPanelProps> = ({
  selectedItems,
  items,
  canvasSize,
  onArrangeCurve,
  onClose
}) => {
  const [arrangementType, setArrangementType] = useState<'arc' | 'circle' | 'semi-circle'>('arc');
  const [radius, setRadius] = useState(150);
  const [centerX, setCenterX] = useState(canvasSize.w / 2);
  const [centerY, setCenterY] = useState(canvasSize.h / 2);
  const [startAngle, setStartAngle] = useState(0);
  const [endAngle, setEndAngle] = useState(180);

  // Calculate center point based on selected items
  const calculateCenterFromSelection = useCallback(() => {
    if (selectedItems.length === 0) return;
    
    const selectedItemsData = items.filter(item => selectedItems.includes(item.id));
    
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    
    selectedItemsData.forEach(item => {
      minX = Math.min(minX, item.x);
      maxX = Math.max(maxX, item.x + item.w);
      minY = Math.min(minY, item.y);
      maxY = Math.max(maxY, item.y + item.h);
    });
    
    const calcCenterX = (minX + maxX) / 2;
    const calcCenterY = (minY + maxY) / 2;
    
    setCenterX(calcCenterX);
    setCenterY(calcCenterY);
  }, [selectedItems, items]);

  const handleApplyCurve = useCallback(() => {
    const config: CurveConfig = {
      centerX,
      centerY,
      radius,
      startAngle,
      endAngle,
      arrangementType
    };
    
    onArrangeCurve(selectedItems, config);
  }, [selectedItems, centerX, centerY, radius, startAngle, endAngle, arrangementType, onArrangeCurve]);

  const presetConfigurations = [
    {
      name: 'Theatre Curve',
      type: 'arc' as const,
      startAngle: -30,
      endAngle: 30,
      radius: 200
    },
    {
      name: 'Full Circle',
      type: 'circle' as const,
      startAngle: 0,
      endAngle: 360,
      radius: 150
    },
    {
      name: 'Semi Circle',
      type: 'semi-circle' as const,
      startAngle: 0,
      endAngle: 180,
      radius: 180
    },
    {
      name: 'Wide Arc',
      type: 'arc' as const,
      startAngle: -60,
      endAngle: 60,
      radius: 250
    }
  ];

  const applyPreset = useCallback((preset: typeof presetConfigurations[0]) => {
    setArrangementType(preset.type);
    setStartAngle(preset.startAngle);
    setEndAngle(preset.endAngle);
    setRadius(preset.radius);
  }, []);

  if (selectedItems.length === 0) return null;

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Waves className="h-4 w-4" />
          Curve Arrangement ({selectedItems.length} items)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Preset Configurations */}
        <div>
          <label className="block text-xs font-medium mb-2">Quick Presets</label>
          <div className="grid grid-cols-2 gap-2">
            {presetConfigurations.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(preset)}
                className="text-xs h-8"
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Arrangement Type */}
        <div>
          <label className="block text-xs font-medium mb-2">Arrangement Type</label>
          <Select value={arrangementType} onValueChange={(value: any) => setArrangementType(value)}>
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="arc">Arc (Custom Angle)</SelectItem>
              <SelectItem value="semi-circle">Semi Circle</SelectItem>
              <SelectItem value="circle">Full Circle</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Center Point */}
        <div>
          <label className="block text-xs font-medium mb-2">Center Point</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-600">X:</label>
              <Input
                type="number"
                value={centerX}
                onChange={(e) => setCenterX(Number(e.target.value))}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Y:</label>
              <Input
                type="number"
                value={centerY}
                onChange={(e) => setCenterY(Number(e.target.value))}
                className="h-8 text-xs"
              />
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={calculateCenterFromSelection}
            className="w-full mt-2 h-7 text-xs"
          >
            <Move3D className="h-3 w-3 mr-1" />
            Auto Center from Selection
          </Button>
        </div>

        {/* Radius */}
        <div>
          <label className="block text-xs font-medium mb-2">
            Radius: {radius}px
          </label>
          <Slider
            value={[radius]}
            onValueChange={([value]) => setRadius(value)}
            min={50}
            max={500}
            step={10}
            className="w-full"
          />
        </div>

        {/* Angle Controls (only for arc type) */}
        {arrangementType === 'arc' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-2">
                Start Angle: {startAngle}°
              </label>
              <Slider
                value={[startAngle]}
                onValueChange={([value]) => setStartAngle(value)}
                min={-180}
                max={180}
                step={15}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-2">
                End Angle: {endAngle}°
              </label>
              <Slider
                value={[endAngle]}
                onValueChange={([value]) => setEndAngle(value)}
                min={-180}
                max={180}
                step={15}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Preview Info */}
        <div className="p-2 bg-blue-50 rounded text-xs">
          <div className="font-medium text-blue-800 mb-1">Preview:</div>
          <div className="text-blue-600">
            {arrangementType === 'circle' && `Full circle with ${selectedItems.length} items`}
            {arrangementType === 'semi-circle' && `Semi-circle (180°) with ${selectedItems.length} items`}
            {arrangementType === 'arc' && `Arc from ${startAngle}° to ${endAngle}° with ${selectedItems.length} items`}
          </div>
          <div className="text-blue-600 mt-1">
            Radius: {radius}px | Center: ({Math.round(centerX)}, {Math.round(centerY)})
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleApplyCurve}
            className="flex-1 h-8 text-xs"
            disabled={selectedItems.length < 2}
          >
            <Circle className="h-3 w-3 mr-1" />
            Apply Curve
          </Button>
          {onClose && (
            <Button
              variant="outline"
              onClick={onClose}
              className="h-8 text-xs px-3"
            >
              Cancel
            </Button>
          )}
        </div>

        {selectedItems.length < 2 && (
          <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
            ⚠️ Select at least 2 items to create a curve arrangement
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CurveArrangementPanel;