'use client';

import React, { useState, useEffect } from 'react';
import { SeatMapItem, SeatCategory, SeatMapItemType, TableShape } from '@/services/venue-layout.service';

interface PropertiesPanelProps {
  selectedItems: SeatMapItem[];
  categories: SeatCategory[];
  onItemsUpdate: (items: SeatMapItem[]) => void;
  onSelectionClear: () => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedItems,
  categories,
  onItemsUpdate,
  onSelectionClear,
}) => {
  const [formData, setFormData] = useState<Partial<SeatMapItem>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (selectedItems.length === 1) {
      setFormData(selectedItems[0]);
    } else if (selectedItems.length > 1) {
      // For multi-selection, show common properties
      const commonData: Partial<SeatMapItem> = {};
      const firstItem = selectedItems[0];
      
      // Check if all items have the same values for each property
      if (selectedItems.every(item => item.type === firstItem.type)) {
        commonData.type = firstItem.type;
      }
      if (selectedItems.every(item => item.categoryId === firstItem.categoryId)) {
        commonData.categoryId = firstItem.categoryId;
      }
      if (selectedItems.every(item => item.rotation === firstItem.rotation)) {
        commonData.rotation = firstItem.rotation;
      }
      
      setFormData(commonData);
    } else {
      setFormData({});
    }
  }, [selectedItems]);

  const handleInputChange = (field: keyof SeatMapItem, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Apply changes to all selected items
    const updatedItems = selectedItems.map(item => ({
      ...item,
      [field]: value
    }));
    
    onItemsUpdate(updatedItems);
  };

  const handlePositionChange = (field: 'x' | 'y', value: number) => {
    if (selectedItems.length === 1) {
      handleInputChange(field, value);
    } else if (selectedItems.length > 1) {
      // For multi-selection, apply relative positioning
      const firstItem = selectedItems[0];
      const offset = value - (firstItem[field] || 0);
      
      const updatedItems = selectedItems.map(item => ({
        ...item,
        [field]: (item[field] || 0) + offset
      }));
      
      onItemsUpdate(updatedItems);
    }
  };

  const handleSizeChange = (field: 'w' | 'h', value: number) => {
    if (selectedItems.length === 1) {
      handleInputChange(field, value);
    } else if (selectedItems.length > 1) {
      // For multi-selection, apply proportional scaling
      const firstItem = selectedItems[0];
      const scale = value / (firstItem[field] || 1);
      
      const updatedItems = selectedItems.map(item => ({
        ...item,
        [field]: Math.max(10, (item[field] || 1) * scale)
      }));
      
      onItemsUpdate(updatedItems);
    }
  };

  const handleAlignItems = (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (selectedItems.length < 2) return;

    const updatedItems = [...selectedItems];
    
    switch (alignment) {
      case 'left':
        const minX = Math.min(...selectedItems.map(item => item.x));
        updatedItems.forEach(item => item.x = minX);
        break;
      case 'center':
        const avgX = selectedItems.reduce((sum, item) => sum + item.x + item.w / 2, 0) / selectedItems.length;
        updatedItems.forEach(item => item.x = avgX - item.w / 2);
        break;
      case 'right':
        const maxX = Math.max(...selectedItems.map(item => item.x + item.w));
        updatedItems.forEach(item => item.x = maxX - item.w);
        break;
      case 'top':
        const minY = Math.min(...selectedItems.map(item => item.y));
        updatedItems.forEach(item => item.y = minY);
        break;
      case 'middle':
        const avgY = selectedItems.reduce((sum, item) => sum + item.y + item.h / 2, 0) / selectedItems.length;
        updatedItems.forEach(item => item.y = avgY - item.h / 2);
        break;
      case 'bottom':
        const maxY = Math.max(...selectedItems.map(item => item.y + item.h));
        updatedItems.forEach(item => item.y = maxY - item.h);
        break;
    }
    
    onItemsUpdate(updatedItems);
  };

  const handleDistributeItems = (direction: 'horizontal' | 'vertical') => {
    if (selectedItems.length < 3) return;

    const sortedItems = [...selectedItems].sort((a, b) => 
      direction === 'horizontal' ? a.x - b.x : a.y - b.y
    );

    const start = direction === 'horizontal' ? sortedItems[0].x : sortedItems[0].y;
    const end = direction === 'horizontal' 
      ? sortedItems[sortedItems.length - 1].x + sortedItems[sortedItems.length - 1].w
      : sortedItems[sortedItems.length - 1].y + sortedItems[sortedItems.length - 1].h;
    
    const totalSpace = end - start;
    const itemSpace = sortedItems.reduce((sum, item) => 
      sum + (direction === 'horizontal' ? item.w : item.h), 0
    );
    const spacing = (totalSpace - itemSpace) / (sortedItems.length - 1);

    let currentPos = start;
    const updatedItems = sortedItems.map(item => {
      const newItem = { ...item };
      if (direction === 'horizontal') {
        newItem.x = currentPos;
        currentPos += item.w + spacing;
      } else {
        newItem.y = currentPos;
        currentPos += item.h + spacing;
      }
      return newItem;
    });

    onItemsUpdate(updatedItems);
  };

  if (selectedItems.length === 0) {
    return (
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Properties</h3>
        <div className="text-center py-8 text-gray-500 text-sm">
          Select items to edit their properties
        </div>
      </div>
    );
  }

  const isMultiSelection = selectedItems.length > 1;
  const singleItem = selectedItems.length === 1 ? selectedItems[0] : null;

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">
          Properties {isMultiSelection && `(${selectedItems.length} items)`}
        </h3>
        <button
          onClick={onSelectionClear}
          className="text-gray-500 hover:text-gray-700 p-1"
          title="Clear selection"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Basic Properties */}
      <div className="space-y-3">
        {singleItem && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
            <input
              type="text"
              value={formData.label || ''}
              onChange={(e) => handleInputChange('label', e.target.value)}
              className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Item label"
            />
          </div>
        )}

        {(singleItem || (isMultiSelection && formData.type)) && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
            <select
              value={formData.type || ''}
              onChange={(e) => handleInputChange('type', e.target.value as SeatMapItemType)}
              className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              disabled={isMultiSelection}
            >
              <option value={SeatMapItemType.SEAT}>Seat</option>
              <option value={SeatMapItemType.TABLE}>Table</option>
              <option value={SeatMapItemType.BOOTH}>Booth</option>
              <option value={SeatMapItemType.STAGE}>Stage</option>
              <option value={SeatMapItemType.SCREEN}>Screen</option>
              <option value={SeatMapItemType.WASHROOM}>Washroom</option>
              <option value={SeatMapItemType.ENTRY}>Entry</option>
              <option value={SeatMapItemType.EXIT}>Exit</option>
            </select>
          </div>
        )}

        {(formData.type === SeatMapItemType.SEAT || selectedItems.some(item => item.type === SeatMapItemType.SEAT)) && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
            <select
              value={formData.categoryId || ''}
              onChange={(e) => handleInputChange('categoryId', e.target.value)}
              className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">No category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        )}

        {(formData.type === SeatMapItemType.TABLE || selectedItems.some(item => item.type === SeatMapItemType.TABLE)) && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Shape</label>
              <select
                value={formData.shape || TableShape.RECT}
                onChange={(e) => handleInputChange('shape', e.target.value as TableShape)}
                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={TableShape.RECT}>Rectangle</option>
                <option value={TableShape.ROUND}>Round</option>
                <option value={TableShape.HALF}>Half Circle</option>
                <option value={TableShape.TRIANGLE}>Triangle</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Table Seats</label>
              <input
                type="number"
                min="0"
                max="20"
                value={formData.tableSeats || 0}
                onChange={(e) => handleInputChange('tableSeats', parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </>
        )}
      </div>

      {/* Position and Size */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">Position & Size</label>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <label className="block text-xs text-gray-500">X</label>
            <input
              type="number"
              value={singleItem ? Math.round(singleItem.x) : ''}
              onChange={(e) => handlePositionChange('x', parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-1 border rounded text-xs"
              placeholder={isMultiSelection ? 'Mixed' : '0'}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500">Y</label>
            <input
              type="number"
              value={singleItem ? Math.round(singleItem.y) : ''}
              onChange={(e) => handlePositionChange('y', parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-1 border rounded text-xs"
              placeholder={isMultiSelection ? 'Mixed' : '0'}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500">Width</label>
            <input
              type="number"
              min="10"
              value={singleItem ? Math.round(singleItem.w) : ''}
              onChange={(e) => handleSizeChange('w', parseFloat(e.target.value) || 10)}
              className="w-full px-2 py-1 border rounded text-xs"
              placeholder={isMultiSelection ? 'Mixed' : '10'}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500">Height</label>
            <input
              type="number"
              min="10"
              value={singleItem ? Math.round(singleItem.h) : ''}
              onChange={(e) => handleSizeChange('h', parseFloat(e.target.value) || 10)}
              className="w-full px-2 py-1 border rounded text-xs"
              placeholder={isMultiSelection ? 'Mixed' : '10'}
            />
          </div>
        </div>
      </div>

      {/* Rotation */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Rotation</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="360"
            value={formData.rotation || 0}
            onChange={(e) => handleInputChange('rotation', parseFloat(e.target.value))}
            className="flex-1"
          />
          <input
            type="number"
            min="0"
            max="360"
            value={Math.round(formData.rotation || 0)}
            onChange={(e) => handleInputChange('rotation', parseFloat(e.target.value) || 0)}
            className="w-16 px-2 py-1 text-xs border rounded"
          />
          <span className="text-xs text-gray-500">°</span>
        </div>
      </div>

      {/* Multi-Selection Tools */}
      {isMultiSelection && (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Alignment</label>
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => handleAlignItems('left')}
                className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
                title="Align Left"
              >
                ⬅
              </button>
              <button
                onClick={() => handleAlignItems('center')}
                className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
                title="Align Center"
              >
                ↔
              </button>
              <button
                onClick={() => handleAlignItems('right')}
                className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
                title="Align Right"
              >
                ➡
              </button>
              <button
                onClick={() => handleAlignItems('top')}
                className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
                title="Align Top"
              >
                ⬆
              </button>
              <button
                onClick={() => handleAlignItems('middle')}
                className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
                title="Align Middle"
              >
                ↕
              </button>
              <button
                onClick={() => handleAlignItems('bottom')}
                className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
                title="Align Bottom"
              >
                ⬇
              </button>
            </div>
          </div>

          {selectedItems.length >= 3 && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Distribution</label>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => handleDistributeItems('horizontal')}
                  className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
                >
                  Distribute H
                </button>
                <button
                  onClick={() => handleDistributeItems('vertical')}
                  className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
                >
                  Distribute V
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Advanced Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full px-2 py-1 text-xs text-gray-600 border rounded hover:bg-gray-50 flex items-center justify-between"
      >
        Advanced Properties
        <svg 
          className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Advanced Properties */}
      {showAdvanced && (
        <div className="space-y-3 pt-2 border-t">
          {singleItem && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">ID</label>
                <input
                  type="text"
                  value={singleItem.id}
                  disabled
                  className="w-full px-2 py-1 text-xs border rounded bg-gray-50 text-gray-500"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Row Label</label>
                <input
                  type="text"
                  value={formData.rowLabel || ''}
                  onChange={(e) => handleInputChange('rowLabel', e.target.value)}
                  className="w-full px-2 py-1 text-xs border rounded"
                  placeholder="Row A, B, C..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Seat Number</label>
                <input
                  type="number"
                  min="1"
                  value={formData.seatNumber || ''}
                  onChange={(e) => handleInputChange('seatNumber', parseInt(e.target.value) || undefined)}
                  className="w-full px-2 py-1 text-xs border rounded"
                  placeholder="1, 2, 3..."
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PropertiesPanel;