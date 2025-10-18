'use client';

import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, X, Star, StarOff, Eye, Trash2, RotateCw, 
  ZoomIn, ZoomOut, Move, Crop, Image as ImageIcon
} from 'lucide-react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '@/lib/cropImage';

interface ImageData {
  id: string;
  file: File;
  preview: string;
  croppedUrl?: string;
  isCover: boolean;
  crop: { x: number; y: number };
  zoom: number;
  rotation: number;
  croppedAreaPixels?: any;
}

interface MultipleImageCropperProps {
  images: string[];
  coverImage?: string;
  onImagesChange: (images: string[], coverImage?: string) => void;
  maxImages?: number;
  aspectRatio?: number;
  className?: string;
}

const MultipleImageCropper: React.FC<MultipleImageCropperProps> = ({
  images = [],
  coverImage,
  onImagesChange,
  maxImages = 10,
  aspectRatio = 16/9,
  className = ''
}) => {
  const [imageList, setImageList] = useState<ImageData[]>([]);
  const [editingImage, setEditingImage] = useState<ImageData | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initializedRef = useRef(false);

  // Initialize image list from props - only once
  React.useEffect(() => {
    if (images.length > 0 && !initializedRef.current) {
      const initialImages: ImageData[] = images.map((url, index) => ({
        id: `existing-${index}`,
        file: new File([], `image-${index}`),
        preview: url,
        croppedUrl: url,
        isCover: url === coverImage,
        crop: { x: 0, y: 0 },
        zoom: 1,
        rotation: 0
      }));
      setImageList(initialImages);
      initializedRef.current = true;
    }
  }, []);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (imageList.length + files.length > maxImages) {
      return;
    }

    const newImages: ImageData[] = files.map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      file,
      preview: URL.createObjectURL(file),
      isCover: imageList.length === 0 && index === 0, // First image is cover by default
      crop: { x: 0, y: 0 },
      zoom: 1,
      rotation: 0
    }));

    setImageList(prev => [...prev, ...newImages]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Update parent after adding new images
    setTimeout(() => {
      const finalImages = [...imageList, ...newImages]
        .filter(img => img.croppedUrl || img.preview)
        .map(img => img.croppedUrl || img.preview);
      
      const cover = [...imageList, ...newImages].find(img => img.isCover)?.croppedUrl || 
                   [...imageList, ...newImages].find(img => img.isCover)?.preview;
      
      onImagesChange(finalImages, cover);
    }, 0);
  }, [imageList, maxImages, onImagesChange]);

  const handleCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    if (editingImage) {
      setEditingImage(prev => prev ? { ...prev, croppedAreaPixels } : null);
    }
  }, [editingImage]);

  // Add useCallback handlers for crop controls to prevent infinite re-renders
  const handleCropChange = useCallback((crop: { x: number; y: number }) => {
    setEditingImage(prev => prev ? { ...prev, crop } : null);
  }, []);

  const handleZoomChange = useCallback((zoom: number) => {
    setEditingImage(prev => prev ? { ...prev, zoom } : null);
  }, []);

  const handleRotationChange = useCallback((rotation: number) => {
    setEditingImage(prev => prev ? { ...prev, rotation } : null);
  }, []);

  const handleCropSave = useCallback(async () => {
    if (!editingImage || !editingImage.croppedAreaPixels) return;

    try {
      const croppedImageUrl = await getCroppedImg(
        editingImage.preview,
        editingImage.croppedAreaPixels,
        editingImage.rotation
      );

      setImageList(prev => {
        const updated = prev.map(img => 
          img.id === editingImage.id 
            ? { ...img, croppedUrl: croppedImageUrl }
            : img
        );
        
        // Update parent immediately after cropping
        setTimeout(() => {
          const finalImages = updated
            .filter(img => img.croppedUrl || img.preview)
            .map(img => img.croppedUrl || img.preview);
          
          const cover = updated.find(img => img.isCover)?.croppedUrl || 
                       updated.find(img => img.isCover)?.preview;
          
          onImagesChange(finalImages, cover);
        }, 0);
        
        return updated;
      });

      setEditingImage(null);
    } catch (error) {
      console.error('Error cropping image:', error);
      return;
    }
  }, [editingImage, onImagesChange]);

  const updateParentComponent = useCallback(() => {
    const finalImages = imageList
      .filter(img => img.croppedUrl)
      .map(img => img.croppedUrl!);
    
    const cover = imageList.find(img => img.isCover)?.croppedUrl;
    
    onImagesChange(finalImages, cover);
  }, [imageList, onImagesChange]);

  // Remove the automatic useEffect that causes infinite loops
  // Instead, call updateParentComponent only when needed (file selection, cropping, etc.)

  const setCoverImage = (imageId: string) => {
    setImageList(prev => {
      const updated = prev.map(img => ({ ...img, isCover: img.id === imageId }));
      
      // Update parent immediately
      setTimeout(() => {
        const finalImages = updated
          .filter(img => img.croppedUrl || img.preview)
          .map(img => img.croppedUrl || img.preview);
        
        const cover = updated.find(img => img.isCover)?.croppedUrl || 
                     updated.find(img => img.isCover)?.preview;
        
        onImagesChange(finalImages, cover);
      }, 0);
      
      return updated;
    });
  };

  const removeImage = (imageId: string) => {
    setImageList(prev => {
      const filtered = prev.filter(img => img.id !== imageId);
      
      // If removed image was cover, set first image as cover
      if (prev.find(img => img.id === imageId)?.isCover && filtered.length > 0) {
        filtered[0].isCover = true;
      }
      
      // Update parent immediately
      setTimeout(() => {
        const finalImages = filtered
          .filter(img => img.croppedUrl || img.preview)
          .map(img => img.croppedUrl || img.preview);
        
        const cover = filtered.find(img => img.isCover)?.croppedUrl || 
                     filtered.find(img => img.isCover)?.preview;
        
        onImagesChange(finalImages, cover);
      }, 0);
      
      return filtered;
    });
  };

  const openCropEditor = (image: ImageData) => {
    setEditingImage({ ...image });
  };

  const closeCropEditor = () => {
    setEditingImage(null);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Button */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={imageList.length >= maxImages}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Images ({imageList.length}/{maxImages})
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <p className="text-sm text-gray-600">
          Select multiple images. First image will be the cover by default.
        </p>
      </div>

      {/* Image Grid */}
      {imageList.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {imageList.map((image) => (
            <div
              key={image.id}
              className={`relative group border-2 rounded-lg overflow-hidden aspect-square ${
                image.isCover ? 'border-yellow-400 ring-2 ring-yellow-200' : 'border-gray-200'
              }`}
            >
              {/* Image */}
              <img
                src={image.croppedUrl || image.preview}
                alt="Package image"
                className="w-full h-full object-cover"
              />

              {/* Cover Badge */}
              {image.isCover && (
                <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-medium flex items-center">
                  <Star className="h-3 w-3 mr-1" />
                  Cover
                </div>
              )}

              {/* Action Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                  {/* Set as Cover */}
                  {!image.isCover && (
                    <button
                      onClick={() => setCoverImage(image.id)}
                      className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                      title="Set as cover image"
                    >
                      <StarOff className="h-4 w-4" />
                    </button>
                  )}

                  {/* Crop */}
                  <button
                    onClick={() => openCropEditor(image)}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    title="Crop image"
                  >
                    <Crop className="h-4 w-4" />
                  </button>

                  {/* Preview */}
                  <button
                    onClick={() => setPreviewImage(image.croppedUrl || image.preview)}
                    className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    title="Preview image"
                  >
                    <Eye className="h-4 w-4" />
                  </button>

                  {/* Remove */}
                  <button
                    onClick={() => removeImage(image.id)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    title="Remove image"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Crop Editor Modal */}
      {editingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Crop Image</h3>
              <button
                onClick={closeCropEditor}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Crop Area */}
            <div className="relative flex-1 min-h-[400px] bg-gray-900">
              <Cropper
                image={editingImage.preview}
                crop={editingImage.crop}
                zoom={editingImage.zoom}
                rotation={editingImage.rotation}
                aspect={aspectRatio}
                onCropChange={handleCropChange}
                onZoomChange={handleZoomChange}
                onRotationChange={handleRotationChange}
                onCropComplete={handleCropComplete}
              />
            </div>

            {/* Controls */}
            <div className="p-4 border-t border-gray-200 space-y-4">
              {/* Zoom Control */}
              <div className="flex items-center gap-4">
                <ZoomOut className="h-4 w-4 text-gray-600" />
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={editingImage.zoom}
                  onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                  className="flex-1"
                />
                <ZoomIn className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600 w-12">{Math.round(editingImage.zoom * 100)}%</span>
              </div>

              {/* Rotation Control */}
              <div className="flex items-center gap-4">
                <RotateCw className="h-4 w-4 text-gray-600" />
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={editingImage.rotation}
                  onChange={(e) => handleRotationChange(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 w-12">{editingImage.rotation}°</span>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeCropEditor}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCropSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Apply Crop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-75 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Help Text */}
      {imageList.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No images uploaded</h3>
          <p className="text-gray-600 mb-4">Upload up to {maxImages} images for your package</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload className="h-4 w-4 mr-2" />
            Choose Images
          </button>
        </div>
      )}
    </div>
  );
};

export default MultipleImageCropper;