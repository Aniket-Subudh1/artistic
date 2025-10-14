'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Crop, RotateCw, Download, Check } from 'lucide-react';

interface PackageImageCropperProps {
  onImageCropped: (croppedImage: string) => void;
  currentImage?: string;
  aspectRatio?: number;
  className?: string;
}

const PackageImageCropper: React.FC<PackageImageCropperProps> = ({ 
  onImageCropped, 
  currentImage,
  aspectRatio = 16/9,
  className = ""
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(currentImage || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [cropData, setCropData] = useState({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    scale: 1,
    rotation: 0
  });
  const [showCropMode, setShowCropMode] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSelectedImage(result);
        setShowCropMode(true);
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const cropImage = useCallback(() => {
    if (!selectedImage || !canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageRef.current;
    const targetWidth = 400;
    const targetHeight = targetWidth / aspectRatio;

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Calculate crop dimensions
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;
    
    const cropX = cropData.x * scaleX;
    const cropY = cropData.y * scaleY;
    const cropWidth = cropData.width * scaleX;
    const cropHeight = cropData.height * scaleY;

    // Apply transformations
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((cropData.rotation * Math.PI) / 180);
    ctx.scale(cropData.scale, cropData.scale);

    ctx.drawImage(
      img,
      cropX, cropY, cropWidth, cropHeight,
      -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight
    );

    ctx.restore();

    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    onImageCropped(croppedDataUrl);
    setShowCropMode(false);
  }, [selectedImage, cropData, aspectRatio, onImageCropped]);

  const resetCrop = () => {
    setCropData({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      scale: 1,
      rotation: 0
    });
  };

  const rotateCrop = () => {
    setCropData(prev => ({ ...prev, rotation: (prev.rotation + 90) % 360 }));
  };

  if (showCropMode && selectedImage) {
    return (
      <div className={`bg-white rounded-xl border-2 border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Crop Package Image</h3>
          <button
            onClick={() => setShowCropMode(false)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Image Preview */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio }}>
            <img
              ref={imageRef}
              src={selectedImage}
              alt="Crop preview"
              className="w-full h-full object-contain"
              style={{
                transform: `scale(${cropData.scale}) rotate(${cropData.rotation}deg)`,
                transformOrigin: 'center'
              }}
            />
            <div 
              className="absolute border-2 border-blue-500 bg-blue-500/20"
              style={{
                left: `${cropData.x}%`,
                top: `${cropData.y}%`,
                width: `${cropData.width}%`,
                height: `${cropData.height}%`,
                cursor: 'move'
              }}
            />
          </div>

          {/* Crop Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position X</label>
              <input
                type="range"
                min="0"
                max="50"
                value={cropData.x}
                onChange={(e) => setCropData(prev => ({ ...prev, x: Number(e.target.value) }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position Y</label>
              <input
                type="range"
                min="0"
                max="50"
                value={cropData.y}
                onChange={(e) => setCropData(prev => ({ ...prev, y: Number(e.target.value) }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
              <input
                type="range"
                min="10"
                max="100"
                value={cropData.width}
                onChange={(e) => setCropData(prev => ({ ...prev, width: Number(e.target.value) }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
              <input
                type="range"
                min="10"
                max="100"
                value={cropData.height}
                onChange={(e) => setCropData(prev => ({ ...prev, height: Number(e.target.value) }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scale</label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={cropData.scale}
                onChange={(e) => setCropData(prev => ({ ...prev, scale: Number(e.target.value) }))}
                className="w-full"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={rotateCrop}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RotateCw className="h-4 w-4" />
              Rotate
            </button>
            <button
              onClick={resetCrop}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={cropImage}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ml-auto"
            >
              <Check className="h-4 w-4" />
              Apply Crop
            </button>
          </div>
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        {isLoading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-gray-600">Processing image...</p>
          </div>
        ) : selectedImage ? (
          <div className="space-y-3">
            <div className="relative mx-auto w-32 h-20 rounded-lg overflow-hidden">
              <img
                src={selectedImage}
                alt="Package preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-green-600 font-medium">Image uploaded successfully</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCropMode(true);
                }}
                className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Crop className="h-4 w-4" />
                Edit Crop
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Upload className="h-8 w-8 text-gray-400 mx-auto" />
            <div>
              <p className="text-lg font-medium text-gray-900">Upload Package Image</p>
              <p className="text-gray-600">Drag and drop an image here, or click to select</p>
              <p className="text-sm text-gray-500 mt-1">
                Recommended: 16:9 aspect ratio, max 5MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Current Image Display */}
      {currentImage && !selectedImage && (
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Current package image:</p>
          <div className="relative w-32 h-20 rounded-lg overflow-hidden">
            <img
              src={currentImage}
              alt="Current package"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageImageCropper;