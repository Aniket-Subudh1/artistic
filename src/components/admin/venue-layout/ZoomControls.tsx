'use client';

import React from 'react';

interface ZoomControlsProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onFitToScreen: () => void;
  onResetZoom: () => void;
  minZoom?: number;
  maxZoom?: number;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  onZoomChange,
  onFitToScreen,
  onResetZoom,
  minZoom = 0.1,
  maxZoom = 5,
}) => {
  const handleZoomIn = () => {
    const newZoom = Math.min(zoom * 1.2, maxZoom);
    onZoomChange(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom / 1.2, minZoom);
    onZoomChange(newZoom);
  };

  const handleZoomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) / 100;
    if (!isNaN(value) && value >= minZoom && value <= maxZoom) {
      onZoomChange(value);
    }
  };

  const zoomPresets = [25, 50, 75, 100, 125, 150, 200];

  return (
    <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2 shadow-sm">
      {/* Zoom Out Button */}
      <button
        onClick={handleZoomOut}
        disabled={zoom <= minZoom}
        className="p-1 text-gray-600 hover:text-gray-800 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
        title="Zoom Out"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H8" />
        </svg>
      </button>

      {/* Zoom Percentage Input */}
      <div className="flex items-center">
        <input
          type="number"
          min={minZoom * 100}
          max={maxZoom * 100}
          step="5"
          value={Math.round(zoom * 100)}
          onChange={handleZoomInputChange}
          className="w-16 px-2 py-1 text-sm text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <span className="text-sm text-gray-600 ml-1">%</span>
      </div>

      {/* Zoom In Button */}
      <button
        onClick={handleZoomIn}
        disabled={zoom >= maxZoom}
        className="p-1 text-gray-600 hover:text-gray-800 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
        title="Zoom In"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM15 10l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Zoom Presets Dropdown */}
      <div className="relative">
        <select
          value={Math.round(zoom * 100)}
          onChange={(e) => onZoomChange(parseInt(e.target.value) / 100)}
          className="text-sm border border-gray-300 rounded px-2 py-1 pr-6 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          {zoomPresets.map((preset) => (
            <option key={preset} value={preset}>
              {preset}%
            </option>
          ))}
          {!zoomPresets.includes(Math.round(zoom * 100)) && (
            <option value={Math.round(zoom * 100)}>
              {Math.round(zoom * 100)}%
            </option>
          )}
        </select>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Fit to Screen Button */}
      <button
        onClick={onFitToScreen}
        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors"
        title="Fit to Screen"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      </button>

      {/* Reset Zoom Button */}
      <button
        onClick={onResetZoom}
        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors"
        title="Reset Zoom (100%)"
      >
        1:1
      </button>

      {/* Keyboard Shortcuts Info */}
      <div className="text-xs text-gray-500 ml-2 hidden lg:block">
        <div>Ctrl + Wheel: Zoom</div>
        <div>Ctrl + 0: Reset</div>
      </div>
    </div>
  );
};

export default ZoomControls;