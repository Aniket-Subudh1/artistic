'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Save, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { ArtistService } from '@/services/artist.service';
import { useAuthLogic } from '@/hooks/useAuth';

interface ArtistPerformanceSettingsProps {
  initialSettings?: {
    cooldownPeriodHours?: number;
    maximumPerformanceHours?: number;
  };
  onUpdate?: (settings: { cooldownPeriodHours: number; maximumPerformanceHours: number }) => void;
}

export function ArtistPerformanceSettings({ 
  initialSettings, 
  onUpdate 
}: ArtistPerformanceSettingsProps) {
  const { user } = useAuthLogic();
  const [settings, setSettings] = useState({
    cooldownPeriodHours: initialSettings?.cooldownPeriodHours || 2,
    maximumPerformanceHours: initialSettings?.maximumPerformanceHours || 4,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (initialSettings) {
      setSettings({
        cooldownPeriodHours: initialSettings.cooldownPeriodHours || 2,
        maximumPerformanceHours: initialSettings.maximumPerformanceHours || 4,
      });
    }
  }, [initialSettings]);

  useEffect(() => {
    const hasChanged = 
      settings.cooldownPeriodHours !== (initialSettings?.cooldownPeriodHours || 2) ||
      settings.maximumPerformanceHours !== (initialSettings?.maximumPerformanceHours || 4);
    setHasChanges(hasChanged);
  }, [settings, initialSettings]);

  const handleInputChange = (field: keyof typeof settings, value: string) => {
    const numValue = parseInt(value) || 0;
    
    // Validate ranges
    if (field === 'cooldownPeriodHours' && (numValue < 1 || numValue > 24)) {
      return;
    }
    if (field === 'maximumPerformanceHours' && (numValue < 1 || numValue > 12)) {
      return;
    }

    setSettings(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const handleSave = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!user || user.role !== 'artist') {
      setErrorMessage('You must be logged in as an artist to update settings');
      return;
    }

    setIsSaving(true);
    try {
      const response = await ArtistService.updateArtistSettings(settings);
      
      setSuccessMessage('Performance settings updated successfully!');
      onUpdate?.(response.settings);
      setHasChanges(false);
    } catch (error: any) {
      console.error('Failed to update settings:', error);
      setErrorMessage(error.message || 'Failed to update settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (initialSettings) {
      setSettings({
        cooldownPeriodHours: initialSettings.cooldownPeriodHours || 2,
        maximumPerformanceHours: initialSettings.maximumPerformanceHours || 4,
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center mb-6">
        <div className="bg-gradient-to-r from-[#391C71] to-purple-600 p-3 rounded-xl shadow-lg">
          <Settings className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <h3 className="text-xl font-bold text-gray-900">Performance Settings</h3>
          <p className="text-gray-600 text-sm">Manage your booking constraints</p>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
          <p className="text-green-700 font-medium">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
          <p className="text-red-700 font-medium">{errorMessage}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Cooldown Period */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4 inline mr-2 text-[#391C71]" />
            Cooldown Period (hours)
          </label>
          <input
            type="number"
            min="1"
            max="24"
            value={settings.cooldownPeriodHours}
            onChange={(e) => handleInputChange('cooldownPeriodHours', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71] transition-colors bg-white"
            placeholder="Enter hours (1-24)"
          />
          <p className="text-xs text-gray-600 mt-2">
            Hours to wait after a booking before your next availability. This helps prevent back-to-back performances.
          </p>
        </div>

        {/* Maximum Performance Hours */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4 inline mr-2 text-[#391C71]" />
            Maximum Performance Hours
          </label>
          <input
            type="number"
            min="1"
            max="12"
            value={settings.maximumPerformanceHours}
            onChange={(e) => handleInputChange('maximumPerformanceHours', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71] transition-colors bg-white"
            placeholder="Enter hours (1-12)"
          />
          <p className="text-xs text-gray-600 mt-2">
            Maximum consecutive hours per booking. This sets the limit for how long each performance can be.
          </p>
        </div>

        {/* Action Buttons */}
        {hasChanges && (
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-gradient-to-r from-[#391C71] to-purple-600 text-white px-6 py-3 rounded-lg hover:from-[#5B2C87] hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSaving ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </div>
              )}
            </button>
            <button
              onClick={handleReset}
              disabled={isSaving}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset
            </button>
          </div>
        )}

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="bg-blue-100 rounded-full p-2 mr-3 mt-0.5">
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-1">How These Settings Work</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>Cooldown Period:</strong> Prevents immediate back-to-back bookings</li>
                <li>• <strong>Max Performance Hours:</strong> Limits how long each individual booking can be</li>
                <li>• These settings help you maintain quality performances and avoid burnout</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}