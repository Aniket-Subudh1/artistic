"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Square, 
  Circle, 
  Triangle,
  RectangleHorizontal,
  RotateCcw,
  Eye,
  RotateCw,
  Scale,
  Move
} from 'lucide-react';

interface TableCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTable: (tableData: TableCreationData) => void;
  categories: Array<{ id: string; name: string; color: string; price: number }>;
  onStartPlacement?: (tableData: TableCreationData) => void;
  onStartPreview?: (tableData: TableCreationData & { rotation: number; scale: number }) => void;
  onUpdatePreview?: (tableData: TableCreationData & { rotation: number; scale: number; position: { x: number; y: number } }) => void;
  onCancelPreview?: () => void;
  onConfirmPreview?: () => void;
}

export interface TableCreationData {
  shape: 'round' | 'square' | 'rectangle' | 'triangle' | 'semi-circle';
  seatCount: number;
  tableSize: { width: number; height: number };
  categoryId?: string;
  tableLabel?: string;
}

const TableCreator: React.FC<TableCreatorProps> = ({
  isOpen,
  onClose,
  onCreateTable,
  categories,
  onStartPlacement,
  onStartPreview,
  onUpdatePreview,
  onCancelPreview,
  onConfirmPreview
}) => {
  const [shape, setShape] = useState<TableCreationData['shape']>('round');
  const [seatCount, setSeatCount] = useState(4);
  const [categoryId, setCategoryId] = useState('');
  const [tableLabel, setTableLabel] = useState('');
  const [tableSize, setTableSize] = useState({ width: 50, height: 50 });
  
  // Preview mode state
  const [previewMode, setPreviewMode] = useState(false);
  const [previewRotation, setPreviewRotation] = useState(0);
  const [previewScale, setPreviewScale] = useState(1);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });

  const shapes = [
    { id: 'round', name: 'Round', icon: Circle, description: 'Circular table' },
    { id: 'square', name: 'Square', icon: Square, description: 'Square table' },
    { id: 'rectangle', name: 'Rectangle', icon: RectangleHorizontal, description: 'Rectangular table' },
    { id: 'triangle', name: 'Triangle', icon: Triangle, description: 'Triangular table' },
    { id: 'semi-circle', name: 'Semi-Circle', icon: RotateCcw, description: 'Half-circle table' }
  ];

  const handleCreate = () => {
    if (seatCount < 1) return;

    const tableData: TableCreationData = {
      shape,
      seatCount,
      tableSize,
      categoryId: categoryId || undefined,
      tableLabel: tableLabel || undefined
    };

    // Use placement mode if callback is provided
    if (onStartPlacement) {
      onStartPlacement(tableData);
      onClose();
    } else {
      // Fallback to old behavior
      onCreateTable(tableData);
      handleReset();
      onClose();
    }
  };

  const handleReset = () => {
    setShape('round');
    setSeatCount(4);
    setCategoryId('');
    setTableLabel('');
    setTableSize({ width: 80, height: 80 });
  };

  const handleShapeChange = (newShape: TableCreationData['shape']) => {
    setShape(newShape);
    
    // Adjust default table size based on shape
    switch (newShape) {
      case 'round':
      case 'square':
        setTableSize({ width: 80, height: 80 });
        break;
      case 'rectangle':
        setTableSize({ width: 120, height: 60 });
        break;
      case 'triangle':
        setTableSize({ width: 90, height: 78 });
        break;
      case 'semi-circle':
        setTableSize({ width: 100, height: 50 });
        break;
    }
  };

  const getPreviewDimensions = () => {
    const scale = 0.8; // Scale down for preview
    return {
      width: tableSize.width * scale,
      height: tableSize.height * scale
    };
  };

  // Preview mode handlers
  const handleStartPreview = () => {
    if (seatCount < 1) return;
    setPreviewMode(true);
    
    const tableData = {
      shape,
      seatCount,
      tableSize,
      categoryId: categoryId || undefined,
      tableLabel: tableLabel || undefined,
      rotation: previewRotation,
      scale: previewScale
    };
    
    if (onStartPreview) {
      onStartPreview(tableData);
    }
  };

  const handleUpdatePreview = () => {
    if (!previewMode) return;
    
    const tableData = {
      shape,
      seatCount,
      tableSize,
      categoryId: categoryId || undefined,
      tableLabel: tableLabel || undefined,
      rotation: previewRotation,
      scale: previewScale,
      position: previewPosition
    };
    
    if (onUpdatePreview) {
      onUpdatePreview(tableData);
    }
  };

  const handleCancelPreview = () => {
    setPreviewMode(false);
    setPreviewRotation(0);
    setPreviewScale(1);
    setPreviewPosition({ x: 0, y: 0 });
    
    if (onCancelPreview) {
      onCancelPreview();
    }
  };

  const handleConfirmPreview = () => {
    if (onConfirmPreview) {
      onConfirmPreview();
    }
    setPreviewMode(false);
    setPreviewRotation(0);
    setPreviewScale(1);
    setPreviewPosition({ x: 0, y: 0 });
    onClose();
  };

  // Update preview whenever settings change
  React.useEffect(() => {
    if (previewMode) {
      handleUpdatePreview();
    }
  }, [shape, seatCount, tableSize, categoryId, previewRotation, previewScale, previewMode]);

  const renderTablePreview = () => {
    const { width, height } = getPreviewDimensions();
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Calculate seat positions around the table
    const seatPositions = calculateSeatPositions(shape, seatCount, width, height);
    
    return (
      <div className="flex justify-center p-4 bg-gray-50 rounded border">
        <svg width={width + 40} height={height + 40} className="border rounded bg-white">
          {/* Table shape */}
          {shape === 'round' && (
            <circle
              cx={centerX + 20}
              cy={centerY + 20}
              r={Math.min(width, height) / 2}
              fill="#8b5cf6"
              stroke="#7c3aed"
              strokeWidth="2"
            />
          )}
          {shape === 'square' && (
            <rect
              x={20}
              y={20}
              width={width}
              height={height}
              fill="#8b5cf6"
              stroke="#7c3aed"
              strokeWidth="2"
              rx="4"
            />
          )}
          {shape === 'rectangle' && (
            <rect
              x={20}
              y={20}
              width={width}
              height={height}
              fill="#8b5cf6"
              stroke="#7c3aed"
              strokeWidth="2"
              rx="4"
            />
          )}
          {shape === 'triangle' && (
            <polygon
              points={`${centerX + 20},${20} ${20},${height + 20} ${width + 20},${height + 20}`}
              fill="#8b5cf6"
              stroke="#7c3aed"
              strokeWidth="2"
            />
          )}
          {shape === 'semi-circle' && (
            <path
              d={`M 20 ${centerY + 20} A ${width / 2} ${height} 0 0 1 ${width + 20} ${centerY + 20} L ${width + 20} ${height + 20} L 20 ${height + 20} Z`}
              fill="#8b5cf6"
              stroke="#7c3aed"
              strokeWidth="2"
            />
          )}
          
          {/* Seats */}
          {seatPositions.map((pos, index) => (
            <circle
              key={index}
              cx={pos.x + 20}
              cy={pos.y + 20}
              r="8"
              fill="#10b981"
              stroke="#059669"
              strokeWidth="1"
            />
          ))}
          
          {/* Table label */}
          {tableLabel && (
            <text
              x={centerX + 20}
              y={centerY + 25}
              textAnchor="middle"
              fontSize="10"
              fill="white"
              fontWeight="bold"
            >
              {tableLabel}
            </text>
          )}
        </svg>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white shadow-xl">
        <CardHeader className="pb-3 bg-white">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Create Table with Seats</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 bg-white">
          {/* Table Shape Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Table Shape</label>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
              {shapes.map((shapeOption) => {
                const Icon = shapeOption.icon;
                return (
                  <Button
                    key={shapeOption.id}
                    variant={shape === shapeOption.id ? "default" : "outline"}
                    className="h-16 flex flex-col gap-1"
                    onClick={() => handleShapeChange(shapeOption.id as TableCreationData['shape'])}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs">{shapeOption.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Seat Count */}
          <div>
            <label className="block text-sm font-medium mb-2">Number of Seats</label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSeatCount(Math.max(1, seatCount - 1))}
                disabled={seatCount <= 1}
              >
                -
              </Button>
              <Input
                type="number"
                value={seatCount}
                onChange={(e) => setSeatCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center"
                min={1}
                max={20}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSeatCount(Math.min(20, seatCount + 1))}
                disabled={seatCount >= 20}
              >
                +
              </Button>
              <span className="text-sm text-gray-500">seats (max 20)</span>
            </div>
          </div>

          {/* Table Size */}
          <div>
            <label className="block text-sm font-medium mb-2">Table Size</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Width</label>
                <Input
                  type="number"
                  value={tableSize.width}
                  onChange={(e) => setTableSize(prev => ({ ...prev, width: parseInt(e.target.value) || 80 }))}
                  min={40}
                  max={200}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Height</label>
                <Input
                  type="number"
                  value={tableSize.height}
                  onChange={(e) => setTableSize(prev => ({ ...prev, height: parseInt(e.target.value) || 80 }))}
                  min={40}
                  max={200}
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          {/* Table Label */}
          <div>
            <label className="block text-sm font-medium mb-2">Table Label (Optional)</label>
            <Input
              value={tableLabel}
              onChange={(e) => setTableLabel(e.target.value)}
              placeholder="e.g., Table 1, VIP Table"
              className="text-sm"
            />
          </div>

          {/* Seat Category */}
          {categories.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Seat Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="">Default Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} - ${category.price}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium mb-2">Preview</label>
            {renderTablePreview()}
            <div className="text-center mt-2">
              <Badge variant="secondary" className="text-xs">
                {seatCount} seats around {shape} table
              </Badge>
            </div>
          </div>

          {/* Preview Controls */}
          {previewMode && (
            <div className="space-y-4 p-4 bg-blue-50 rounded border border-blue-200">
              <div className="flex items-center gap-2 text-blue-700 font-medium">
                <Eye className="w-4 h-4" />
                Preview Mode Active
              </div>
              
              {/* Rotation Control */}
              <div>
                <label className="block text-sm font-medium mb-2">Rotation</label>
                <div className="flex gap-2 items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewRotation(prev => prev - 15)}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={previewRotation}
                    onChange={(e) => setPreviewRotation(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewRotation(prev => prev + 15)}
                  >
                    <RotateCw className="w-4 h-4" />
                  </Button>
                  <span className="text-sm w-12">{previewRotation}°</span>
                </div>
              </div>

              {/* Scale Control */}
              <div>
                <label className="block text-sm font-medium mb-2">Scale</label>
                <div className="flex gap-2 items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewScale(prev => Math.max(0.5, prev - 0.1))}
                  >
                    <Scale className="w-4 h-4" />
                  </Button>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={previewScale}
                    onChange={(e) => setPreviewScale(parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewScale(prev => Math.min(2, prev + 0.1))}
                  >
                    <Scale className="w-4 h-4" />
                  </Button>
                  <span className="text-sm w-12">{previewScale.toFixed(1)}x</span>
                </div>
              </div>

              {/* Preview Actions */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancelPreview}>
                  Cancel Preview
                </Button>
                <Button onClick={handleConfirmPreview} className="bg-blue-600 hover:bg-blue-700">
                  Place Here
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            {!previewMode && (
              <>
                <Button variant="outline" onClick={handleStartPreview} disabled={seatCount < 1}>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Mode
                </Button>
                <Button onClick={handleCreate} disabled={seatCount < 1}>
                  {onStartPlacement ? 'Start Placement' : 'Create Table & Seats'}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function to calculate seat positions around table shapes
function calculateSeatPositions(
  shape: TableCreationData['shape'], 
  seatCount: number, 
  width: number, 
  height: number
): Array<{ x: number; y: number }> {
  const positions: Array<{ x: number; y: number }> = [];
  const centerX = width / 2;
  const centerY = height / 2;
  const seatRadius = 12; // Distance from table edge to seat center

  switch (shape) {
    case 'round': {
      const tableRadius = Math.min(width, height) / 2;
      const seatDistance = tableRadius + seatRadius;
      
      for (let i = 0; i < seatCount; i++) {
        const angle = (2 * Math.PI * i) / seatCount - Math.PI / 2; // Start from top
        positions.push({
          x: centerX + Math.cos(angle) * seatDistance,
          y: centerY + Math.sin(angle) * seatDistance
        });
      }
      break;
    }

    case 'square':
    case 'rectangle': {
      const perimeter = 2 * (width + height);
      const spacing = perimeter / seatCount;
      
      for (let i = 0; i < seatCount; i++) {
        const distance = i * spacing;
        let x, y;
        
        if (distance <= width) {
          // Top edge
          x = distance;
          y = -seatRadius;
        } else if (distance <= width + height) {
          // Right edge
          x = width + seatRadius;
          y = distance - width;
        } else if (distance <= 2 * width + height) {
          // Bottom edge
          x = width - (distance - width - height);
          y = height + seatRadius;
        } else {
          // Left edge
          x = -seatRadius;
          y = height - (distance - 2 * width - height);
        }
        
        positions.push({ x, y });
      }
      break;
    }

    case 'triangle': {
      const side1 = Math.sqrt(Math.pow(centerX, 2) + Math.pow(height, 2)); // Left side
      const side2 = width; // Bottom side  
      const side3 = Math.sqrt(Math.pow(centerX, 2) + Math.pow(height, 2)); // Right side
      const perimeter = side1 + side2 + side3;
      const spacing = perimeter / seatCount;
      
      for (let i = 0; i < seatCount; i++) {
        const distance = i * spacing;
        let x, y;
        
        if (distance <= side1) {
          // Left edge
          const t = distance / side1;
          x = centerX * (1 - t) - seatRadius * 0.7;
          y = height * t - seatRadius * 0.7;
        } else if (distance <= side1 + side2) {
          // Bottom edge
          const t = (distance - side1) / side2;
          x = t * width;
          y = height + seatRadius;
        } else {
          // Right edge
          const t = (distance - side1 - side2) / side3;
          x = width - centerX * t + seatRadius * 0.7;
          y = height - height * t - seatRadius * 0.7;
        }
        
        positions.push({ x, y });
      }
      break;
    }

    case 'semi-circle': {
      // Seats only on the curved part
      const radius = width / 2;
      
      for (let i = 0; i < seatCount; i++) {
        const angle = Math.PI * i / (seatCount - 1); // 0 to π
        positions.push({
          x: centerX + Math.cos(angle) * (radius + seatRadius),
          y: centerY + Math.sin(angle) * (radius + seatRadius)
        });
      }
      break;
    }
  }

  return positions;
}

export default TableCreator;