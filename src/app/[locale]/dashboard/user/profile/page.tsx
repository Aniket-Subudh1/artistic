'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { RoleBasedRoute } from '@/components/dashboard/RoleBasedRoute';
import { useAuthLogic } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { UserService } from '@/services/user.service';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Save, 
  Upload,
  Camera,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profilePicture?: string;
  createdAt: string;
}

export default function UserProfilePage() {
  const t = useTranslations();
  const locale = useLocale();
  const { user, isLoading: authLoading } = useAuthLogic();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: ''
  });

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const profileData = await UserService.getCurrentUserProfile();
      setProfile(profileData);
      setFormData({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        phoneNumber: profileData.phoneNumber || ''
      });
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setError('');
    setSuccess('');

    try {
      await UserService.updateUser(profile!._id, formData);
      setSuccess('Profile updated successfully!');
      await loadUserProfile(); // Reload to get updated data
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUpdating(true);
      setError('');
      await UserService.updateProfilePicture(file);
      setSuccess('Profile picture updated successfully!');
      await loadUserProfile();
    } catch (err: any) {
      console.error('Error uploading profile picture:', err);
      setError(err.message || 'Failed to upload profile picture');
    } finally {
      setIsUpdating(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <LoadingSpinner text="Loading profile..." />
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {locale === 'ar' ? 'خطأ في تحميل الملف الشخصي' : 'Error Loading Profile'}
          </h2>
          <p className="text-gray-600">
            {locale === 'ar' ? 'فشل في تحميل بيانات الملف الشخصي' : 'Failed to load profile data'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <RoleBasedRoute allowedRoles={['user']} userRole={user.role}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {locale === 'ar' ? 'الملف الشخصي' : 'Profile Settings'}
            </h1>
            <p className="text-gray-600 mt-2">
              {locale === 'ar' 
                ? 'قم بتحديث معلومات ملفك الشخصي' 
                : 'Update your personal information and preferences'
              }
            </p>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Picture Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {locale === 'ar' ? 'الصورة الشخصية' : 'Profile Picture'}
                </h3>
                
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center overflow-hidden">
                      {profile.profilePicture ? (
                        <img
                          src={profile.profilePicture}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-16 h-16 text-white" />
                      )}
                    </div>
                    <label 
                      htmlFor="profilePicture" 
                      className="absolute bottom-0 right-0 bg-white border-2 border-gray-200 rounded-full p-2 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <Camera className="w-4 h-4 text-gray-600" />
                    </label>
                    <input
                      id="profilePicture"
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      className="hidden"
                      disabled={isUpdating}
                    />
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900">
                      {profile.firstName} {profile.lastName}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {locale === 'ar' ? 'مستخدم' : 'User'}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {locale === 'ar' ? 'عضو منذ' : 'Member since'} {new Date(profile.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  {locale === 'ar' ? 'المعلومات الشخصية' : 'Personal Information'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-2" />
                        {locale === 'ar' ? 'الاسم الأول' : 'First Name'}
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        required
                      />
                    </div>

                    {/* Last Name */}
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-2" />
                        {locale === 'ar' ? 'اسم العائلة' : 'Last Name'}
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        required
                      />
                    </div>
                  </div>

                  {/* Email (Read-only) */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      {locale === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={profile.email}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      disabled
                      readOnly
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {locale === 'ar' ? 'لا يمكن تغيير البريد الإلكتروني' : 'Email address cannot be changed'}
                    </p>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      {locale === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {isUpdating 
                        ? (locale === 'ar' ? 'جاري الحفظ...' : 'Saving...') 
                        : (locale === 'ar' ? 'حفظ التغييرات' : 'Save Changes')
                      }
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleBasedRoute>
  );
}