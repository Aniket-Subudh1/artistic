'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Line } from 'react-konva';
import Konva from 'konva';

interface CanvasControlsProps {
  showGrid: boolean;
  onShowGridChange: (show: boolean) => void;
  snapToGrid: boolean;
  onSnapToGridChange: (snap: boolean) => void;
  gridSize: number;
  onGridSizeChange: (size: number) => void;
  onClearCanvas: () => void;
  onSelectAll: () => void;
  itemCount: number;
}

const CanvasControls: React.FC<CanvasControlsProps> = ({
  showGrid,
  onShowGridChange,
  snapToGrid,
  onSnapToGridChange,
  gridSize,
  onGridSizeChange,
  onClearCanvas,
  onSelectAll,
  itemCount,
}) => {
  return (
    <div className="flex items-center gap-4 bg-white border rounded-lg px-4 py-2 shadow-sm">
      {/* Grid Controls */}
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1 text-sm">
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => onShowGridChange(e.target.checked)}
            className="rounded"
          />
          Grid
        </label>
        
        <label className="flex items-center gap-1 text-sm">
          <input
            type="checkbox"
            checked={snapToGrid}
            onChange={(e) => onSnapToGridChange(e.target.checked)}
            className="rounded"
            disabled={!showGrid}
          />
          Snap
        </label>

        <select
          value={gridSize}
          onChange={(e) => onGridSizeChange(parseInt(e.target.value))}
          className="text-sm border rounded px-2 py-1"
          disabled={!showGrid}
        >
          <option value={10}>10px</option>
          <option value={20}>20px</option>
          <option value={25}>25px</option>
          <option value={50}>50px</option>
          <option value={100}>100px</option>
        </select>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-300" />

      {/* Canvas Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onSelectAll}
          disabled={itemCount === 0}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Select All
        </button>
        
        <button
          onClick={onClearCanvas}
          disabled={itemCount === 0}
          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Item Count */}
      <div className="text-sm text-gray-600">
        {itemCount} item{itemCount !== 1 ? 's' : ''}
      </div>

      {/* Keyboard Shortcuts */}
      <div className="text-xs text-gray-500 ml-auto hidden xl:block">
        <div>Ctrl+A: Select All</div>
        <div>Del: Delete Selected</div>
        <div>Ctrl+D: Duplicate</div>
      </div>
    </div>
  );
};

interface EnhancedCanvasProps {
  width: number;
  height: number;
  zoom: number;
  stagePos: { x: number; y: number };
  onStagePositionChange: (pos: { x: number; y: number }) => void;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  children: React.ReactNode;
  onStageRef: (ref: Konva.Stage | null) => void;
  onWheel?: (e: Konva.KonvaEventObject<WheelEvent>) => void;
  onClick?: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseDown?: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseMove?: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseUp?: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onContextMenu?: (e: Konva.KonvaEventObject<PointerEvent>) => void;
  selectionRect?: { x: number; y: number; width: number; height: number };
  isSelecting?: boolean;
}

const EnhancedCanvas: React.FC<EnhancedCanvasProps> = ({
  width,
  height,
  zoom,
  stagePos,
  onStagePositionChange,
  showGrid,
  snapToGrid,
  gridSize,
  children,
  onStageRef,
  onWheel,
  onClick,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onContextMenu,
  selectionRect,
  isSelecting,
}) => {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageDimensions, setStageDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    onStageRef(stageRef.current);
  }, [onStageRef]);

  useEffect(() => {
    const updateStageDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setStageDimensions({
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updateStageDimensions();
    window.addEventListener('resize', updateStageDimensions);
    return () => window.removeEventListener('resize', updateStageDimensions);
  }, []);

  const snapToGridValue = (value: number) => {
    if (!snapToGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onStagePositionChange({
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const renderGrid = () => {
    if (!showGrid) return null;

    const lines = [];
    const stageWidth = stageDimensions.width / zoom;
    const stageHeight = stageDimensions.height / zoom;

    // Calculate grid bounds based on stage position and zoom
    const startX = Math.floor((-stagePos.x) / gridSize) * gridSize;
    const endX = startX + stageWidth + gridSize;
    const startY = Math.floor((-stagePos.y) / gridSize) * gridSize;
    const endY = startY + stageHeight + gridSize;

    // Vertical lines
    for (let x = startX; x <= endX; x += gridSize) {
      lines.push(
        <Line
          key={`v-${x}`}
          points={[x, startY, x, endY]}
          stroke="#e0e0e0"
          strokeWidth={1 / zoom}
          listening={false}
        />
      );
    }

    // Horizontal lines
    for (let y = startY; y <= endY; y += gridSize) {
      lines.push(
        <Line
          key={`h-${y}`}
          points={[startX, y, endX, y]}
          stroke="#e0e0e0"
          strokeWidth={1 / zoom}
          listening={false}
        />
      );
    }

    return lines;
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full border rounded-lg overflow-hidden bg-gray-50"
      style={{ minHeight: '600px' }}
    >
      <Stage
        ref={stageRef}
        width={stageDimensions.width}
        height={stageDimensions.height}
        scaleX={zoom}
        scaleY={zoom}
        x={stagePos.x}
        y={stagePos.y}
        draggable
        onDragEnd={handleDragEnd}
        onWheel={onWheel}
        onClick={onClick}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onContextMenu={onContextMenu}
      >
        <Layer>
          {/* Background */}
          <Rect
            x={-stagePos.x / zoom - 1000}
            y={-stagePos.y / zoom - 1000}
            width={(stageDimensions.width / zoom) + 2000}
            height={(stageDimensions.height / zoom) + 2000}
            fill="#ffffff"
            listening={false}
          />

          {/* Canvas Bounds */}
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            stroke="#d1d5db"
            strokeWidth={2 / zoom}
            fill="transparent"
            listening={false}
          />

          {/* Grid */}
          {renderGrid()}
        </Layer>

        <Layer>
          {children}
        </Layer>

        {/* Selection Rectangle Layer */}
        <Layer>
          {isSelecting && selectionRect && (
            <Rect
              x={selectionRect.x}
              y={selectionRect.y}
              width={selectionRect.width}
              height={selectionRect.height}
              fill="rgba(0, 102, 255, 0.1)"
              stroke="#0066ff"
              strokeWidth={1}
              dash={[5, 5]}
              listening={false}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export { CanvasControls, EnhancedCanvas };
export type { CanvasControlsProps, EnhancedCanvasProps };