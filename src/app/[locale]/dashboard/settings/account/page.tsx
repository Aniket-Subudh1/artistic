'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Lock
} from 'lucide-react';
import { AuthService } from '@/services/auth.service';
import { ChangePasswordModal } from '@/components/auth';

export default function AccountPage() {
  const t = useTranslations();
  const [user, setUser] = useState(() => AuthService.getStoredUser());
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const handlePasswordChangeSuccess = () => {
    // Optional: Show a success notification or perform any additional actions
    console.log('Password changed successfully');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">Account Settings</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your account preferences and security settings</p>
          </div>

          <div className="p-6">
            {/* Account Information */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-2" />
                Account Information
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email Address</p>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Full Name</p>
                    <p className="text-sm text-gray-600">{user?.firstName} {user?.lastName}</p>
                  </div>
                </div>
                
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <Shield className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Account Role</p>
                    <p className="text-sm text-gray-600 capitalize">{user?.role?.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Lock className="h-5 w-5 text-gray-400 mr-2" />
                Security
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Password</p>
                      <p className="text-sm text-gray-600">Change your account password</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowChangePasswordModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onSuccess={handlePasswordChangeSuccess}
      />
    </div>
  );
}