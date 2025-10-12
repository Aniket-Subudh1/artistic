'use client';

import React, { useState, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useAuthLogic } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ImageCropper } from '@/components/ui/ImageCropper';
import { User, Camera, Upload, X, Check, AlertCircle } from 'lucide-react';
import Image from 'next/image';

export default function ProfileSettingsPage() {
  const { user, updateProfilePicture, removeProfilePicture, isLoading } = useAuthLogic();
  const locale = useLocale();
  const t = useTranslations('dashboard');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (isLoading || !user) {
    return <LoadingSpinner />;
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError(locale === 'ar' 
        ? 'نوع الملف غير صحيح. يُسمح فقط بـ JPEG, PNG, JPG, WebP.' 
        : 'Invalid file type. Only JPEG, PNG, JPG, and WebP are allowed.'
      );
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setUploadError(locale === 'ar' 
        ? 'حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت.' 
        : 'File size too large. Maximum size is 5MB.'
      );
      return;
    }

    setUploadError(null);
    
    // Create preview URL and show cropper
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setSelectedImage(e.target.result as string);
        setShowCropper(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    setShowCropper(false);
    setSelectedImage(null);
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      // Convert blob to file
      const croppedFile = new File([croppedImageBlob], 'profile-picture.jpg', {
        type: 'image/jpeg',
      });
      
      await updateProfilePicture(croppedFile);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error: any) {
      setUploadError(error.message || (locale === 'ar' 
        ? 'حدث خطأ أثناء رفع الصورة'
        : 'Error uploading image'
      ));
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setSelectedImage(null);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveProfilePicture = async () => {
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      await removeProfilePicture();
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error: any) {
      setUploadError(error.message || (locale === 'ar' 
        ? 'حدث خطأ أثناء حذف الصورة'
        : 'Error removing profile picture'
      ));
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {locale === 'ar' ? 'إعدادات الملف الشخصي' : 'Profile Settings'}
          </h1>
          <p className="text-slate-600 mt-2">
            {locale === 'ar' 
              ? 'قم بإدارة معلومات حسابك وصورتك الشخصية'
              : 'Manage your account information and profile picture'
            }
          </p>
        </div>

      {/* Profile Picture Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">
          {locale === 'ar' ? 'الصورة الشخصية' : 'Profile Picture'}
        </h2>

        <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-8 rtl:lg:space-x-reverse space-y-6 lg:space-y-0">
          {/* Current Profile Picture */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-200 flex items-center justify-center overflow-hidden shadow-lg ring-4 ring-white">
                {((user.avatar && user.avatar.trim()) || ((user as any).profilePicture && (user as any).profilePicture.trim())) ? (
                  <Image
                    src={((user.avatar && user.avatar.trim()) || (user as any).profilePicture) as string}
                    alt={`${user.firstName} ${user.lastName}`}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-full h-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center ${((user.avatar && user.avatar.trim()) || ((user as any).profilePicture && (user as any).profilePicture.trim())) ? 'hidden' : ''}`}>
                  <span className="text-white font-bold text-3xl">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </span>
                </div>
              </div>

              {/* Upload overlay when uploading */}
              {isUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-2xl flex items-center justify-center">
                  <div className="text-white text-center">
                    <LoadingSpinner />
                    <p className="text-sm mt-2">
                      {locale === 'ar' ? 'جاري الرفع...' : 'Uploading...'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Upload Controls */}
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                {locale === 'ar' ? 'تحديث الصورة الشخصية' : 'Update Profile Picture'}
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                {locale === 'ar' 
                  ? 'اختر صورة بصيغة JPG، PNG، أو WebP. الحد الأقصى 5 ميجابايت.'
                  : 'Choose a JPG, PNG, or WebP image. Maximum size 5MB.'
                }
              </p>

              <div className="flex space-x-3 rtl:space-x-reverse">
                <button
                  onClick={handleUploadClick}
                  disabled={isUploading}
                  className="inline-flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isUploading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>
                    {isUploading 
                      ? (locale === 'ar' ? 'جاري الرفع...' : 'Uploading...')
                      : (locale === 'ar' ? 'اختيار صورة' : 'Choose Image')
                    }
                  </span>
                </button>

                {((user.avatar && user.avatar.trim()) || ((user as any).profilePicture && (user as any).profilePicture.trim())) && (
                  <button
                    onClick={handleRemoveProfilePicture}
                    disabled={isUploading}
                    className="inline-flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>{locale === 'ar' ? 'إزالة' : 'Remove'}</span>
                  </button>
                )}
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Success Message */}
            {uploadSuccess && (
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <Check className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {locale === 'ar' ? 'تم تحديث الصورة الشخصية بنجاح!' : 'Profile picture updated successfully!'}
                </span>
              </div>
            )}

            {/* Error Message */}
            {uploadError && (
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{uploadError}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Information Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">
          {locale === 'ar' ? 'معلومات الحساب' : 'Account Information'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {locale === 'ar' ? 'الاسم الأول' : 'First Name'}
            </label>
            <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900">
              {user.firstName}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {locale === 'ar' ? 'الاسم الأخير' : 'Last Name'}
            </label>
            <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900">
              {user.lastName}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}
            </label>
            <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900">
              {user.email}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {locale === 'ar' ? 'الدور' : 'Role'}
            </label>
            <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 capitalize">
              {user.role.replace('_', ' ')}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {locale === 'ar' ? 'عضو منذ' : 'Member Since'}
            </label>
            <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900">
              {user.memberSince}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {locale === 'ar' ? 'حالة الحساب' : 'Account Status'}
            </label>
            <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.isActive 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {user.isActive 
                  ? (locale === 'ar' ? 'نشط' : 'Active')
                  : (locale === 'ar' ? 'غير نشط' : 'Inactive')
                }
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-sm text-slate-600">
            {locale === 'ar' 
              ? 'لتحديث معلومات حسابك، يرجى التواصل مع المشرف.'
              : 'To update your account information, please contact an administrator.'
            }
          </p>
        </div>
      </div>
      </div>

      {/* Image Cropper Modal */}
      {showCropper && selectedImage && (
        <ImageCropper
          src={selectedImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={1}
          cropShape="round"
          locale={locale}
        />
      )}
    </>
  );
}