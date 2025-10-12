'use client';

import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import { X, Check, RotateCcw } from 'lucide-react';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperProps {
  src: string;
  onCropComplete: (croppedImageBlob: Blob) => void;
  onCancel: () => void;
  aspectRatio?: number;
  cropShape?: 'rect' | 'round';
  locale: string;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export function ImageCropper({ 
  src, 
  onCropComplete, 
  onCancel, 
  aspectRatio = 1, 
  cropShape = 'round',
  locale 
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspectRatio) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspectRatio));
    }
  }

  const getCroppedImg = useCallback(async () => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const crop = completedCrop;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');
    const pixelRatio = window.devicePixelRatio;

    canvas.width = crop.width * pixelRatio * scaleX;
    canvas.height = crop.height * pixelRatio * scaleY;

    if (ctx) {
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width * scaleX,
        crop.height * scaleY,
      );
    }

    return new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        }
      }, 'image/jpeg', 0.95);
    });
  }, [completedCrop]);

  const handleCropComplete = async () => {
    const croppedImageBlob = await getCroppedImg();
    if (croppedImageBlob) {
      onCropComplete(croppedImageBlob);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">
            {locale === 'ar' ? 'قص الصورة' : 'Crop Image'}
          </h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Crop Area */}
        <div className="p-4 max-h-80 overflow-auto">
          <div className="flex justify-center">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
              circularCrop={cropShape === 'round'}
              className="max-w-full"
            >
              <img
                ref={imgRef}
                alt="Crop preview"
                src={src}
                style={{ 
                  transform: `scale(${scale}) rotate(${rotate}deg)`,
                  maxWidth: '300px',
                  maxHeight: '300px',
                  width: 'auto',
                  height: 'auto'
                }}
                onLoad={onImageLoad}
                className="block"
              />
            </ReactCrop>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 border-t border-slate-200 space-y-3">
          {/* Scale Control */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              {locale === 'ar' ? 'التكبير' : 'Scale'}
            </label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Rotate Control */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              {locale === 'ar' ? 'الدوران' : 'Rotation'}
            </label>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={rotate}
                onChange={(e) => setRotate(Number(e.target.value))}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <button
                onClick={() => setRotate(0)}
                className="p-1 border border-slate-300 rounded hover:bg-slate-50 transition-colors"
                title={locale === 'ar' ? 'إعادة تعيين الدوران' : 'Reset rotation'}
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-white transition-colors"
          >
            {locale === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
          
          <button
            onClick={handleCropComplete}
            disabled={!completedCrop}
            className="inline-flex items-center space-x-2 rtl:space-x-reverse px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
          >
            <Check className="w-4 h-4" />
            <span>{locale === 'ar' ? 'قص الصورة' : 'Crop Image'}</span>
          </button>
        </div>

        {/* Hidden canvas for cropping */}
        <canvas
          ref={previewCanvasRef}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
}