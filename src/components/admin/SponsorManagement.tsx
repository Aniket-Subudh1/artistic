'use client';

import React, { useState, useEffect } from 'react';
import { SponsorService, Sponsor, CreateSponsorRequest } from '@/services/sponsor.service';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Upload, 
  ExternalLink, 
  Eye, 
  EyeOff,
  Award,
  Loader2,
  Check,
  X
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { ImageCropper } from '@/components/ui/ImageCropper';
import { useLocale } from 'next-intl';

interface SponsorManagementProps {
  className?: string;
}

export default function SponsorManagement({ className = '' }: SponsorManagementProps) {
  const locale = useLocale();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string>('');
  
  const [formData, setFormData] = useState<CreateSponsorRequest>({
    name: '',
    logo: '',
    website: '',
    description: '',
    tier: 'partner',
    isActive: true,
    isFeatured: false,
  });

  // Load sponsors
  useEffect(() => {
    loadSponsors();
  }, []);

  const loadSponsors = async () => {
    try {
      setIsLoading(true);
      const data = await SponsorService.getAllSponsors(1, 100);
      setSponsors(data.sponsors);
    } catch (error) {
      console.error('Failed to load sponsors:', error);
      toast.error('Failed to load sponsors');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Create preview URL and show cropper
    const reader = new FileReader();
    reader.onload = () => {
      setTempImageSrc(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
    
    // Reset input to allow reselecting same file
    e.currentTarget.value = '';
  };

  const uploadCroppedImage = async (blob: Blob) => {
    setUploading(true);
    try {
      const fileName = `sponsor-logo-${Date.now()}.jpg`;
      const file = new File([blob], fileName, { type: 'image/jpeg' });
      const url = await SponsorService.uploadLogo(file);
      setFormData({ ...formData, logo: url });
      toast.success('Logo uploaded successfully');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    setShowCropper(false);
    await uploadCroppedImage(croppedImageBlob);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSponsor) {
        await SponsorService.updateSponsor(editingSponsor._id, formData);
        toast.success('Sponsor updated successfully');
      } else {
        await SponsorService.createSponsor(formData);
        toast.success('Sponsor created successfully');
      }
      
      await loadSponsors();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save sponsor:', error);
      toast.error('Failed to save sponsor');
    }
  };

  const handleEdit = (sponsor: Sponsor) => {
    setEditingSponsor(sponsor);
    setFormData({
      name: sponsor.name,
      logo: sponsor.logo,
      website: sponsor.website,
      description: sponsor.description,
      tier: sponsor.tier,
      isActive: sponsor.isActive,
      isFeatured: sponsor.isFeatured,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sponsor?')) return;
    
    try {
      await SponsorService.deleteSponsor(id);
      toast.success('Sponsor deleted successfully');
      await loadSponsors();
    } catch (error) {
      console.error('Failed to delete sponsor:', error);
      toast.error('Failed to delete sponsor');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await SponsorService.toggleSponsorStatus(id);
      toast.success('Status updated successfully');
      await loadSponsors();
    } catch (error) {
      console.error('Failed to toggle status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSponsor(null);
    setFormData({
      name: '',
      logo: '',
      website: '',
      description: '',
      tier: 'partner',
      isActive: true,
      isFeatured: false,
    });
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'bg-gray-300 text-gray-800';
      case 'gold': return 'bg-yellow-400 text-yellow-900';
      case 'silver': return 'bg-gray-400 text-gray-700';
      case 'bronze': return 'bg-orange-400 text-orange-900';
      default: return 'bg-purple-400 text-purple-900';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Sponsor Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Manage event sponsors and partnerships
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all font-semibold text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Add Sponsor</span>
        </button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : (
        <>
          {/* Sponsors Grid */}
          {sponsors.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="mb-4">
                <Award className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto" />
              </div>
              <p className="text-gray-500 text-sm md:text-base mb-4">No sponsors yet. Add your first sponsor!</p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all font-semibold"
              >
                <Plus className="w-5 h-5" />
                Add Sponsor
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {sponsors.map((sponsor) => (
                <div
                  key={sponsor._id}
                  className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:shadow-lg transition-all duration-300"
                >
                  {/* Logo */}
                  <div className="relative h-24 sm:h-28 md:h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden border border-gray-200">
                    {sponsor.logo ? (
                      <img
                        src={sponsor.logo}
                        alt={sponsor.name}
                        className="max-w-full max-h-full object-contain p-3"
                      />
                    ) : (
                      <div className="text-gray-400 text-xs sm:text-sm flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8" />
                        <span>No logo</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="space-y-2 mb-4">
                    <h3 className="font-bold text-base sm:text-lg truncate text-gray-900" title={sponsor.name}>
                      {sponsor.name}
                    </h3>
                    
                    {sponsor.website && (
                      <a
                        href={sponsor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs sm:text-sm text-purple-600 hover:text-purple-800 hover:underline flex items-center gap-1 truncate"
                        title={sponsor.website}
                      >
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{sponsor.website.replace(/^https?:\/\//,'')}</span>
                      </a>
                    )}

                    {sponsor.description && (
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2" title={sponsor.description}>
                        {sponsor.description}
                      </p>
                    )}

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      <span className={`text-[10px] sm:text-xs px-2 py-1 rounded-full font-bold ${getTierBadgeColor(sponsor.tier)}`}>
                        {sponsor.tier.toUpperCase()}
                      </span>
                      {sponsor.isFeatured && (
                        <span className="text-[10px] sm:text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 font-medium flex items-center gap-1">
                          <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          <span>Featured</span>
                        </span>
                      )}
                      <span className={`text-[10px] sm:text-xs px-2 py-1 rounded-full font-medium ${sponsor.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {sponsor.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleEdit(sponsor)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors text-xs sm:text-sm"
                    >
                      <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      onClick={() => handleToggleStatus(sponsor._id)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-xs sm:text-sm"
                      title={sponsor.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {sponsor.isActive ? <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(sponsor._id)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors text-xs sm:text-sm"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg">
                  {editingSponsor ? (
                    <Pencil className="w-5 h-5 text-white" />
                  ) : (
                    <Plus className="w-5 h-5 text-white" />
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {editingSponsor ? 'Edit Sponsor' : 'Add New Sponsor'}
                </h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[calc(90vh-120px)] overflow-y-auto">
              {/* Logo Upload */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-100">
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Sponsor Logo <span className="text-red-500">*</span>
                </label>
                {formData.logo ? (
                  <div className="space-y-3">
                    <div className="relative h-32 sm:h-40 bg-white rounded-lg flex items-center justify-center border-2 border-purple-200 overflow-hidden shadow-sm">
                      <img
                        src={formData.logo}
                        alt="Logo preview"
                        className="max-w-full max-h-full object-contain p-3"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, logo: '' })}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg transition-all hover:scale-110"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                      <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 text-purple-700 rounded-xl cursor-pointer transition-all shadow-sm hover:shadow text-sm font-medium">
                        <Upload className="w-4 h-4" />
                        <span>{uploading ? 'Uploading...' : 'Change Logo'}</span>
                      </div>
                    </label>
                  </div>
                ) : (
                  <label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                    <div className="h-32 sm:h-40 bg-white border-2 border-dashed border-purple-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50/50 transition-all">
                      <Upload className="w-10 h-10 text-purple-400 mb-2" />
                      <span className="text-sm font-medium text-purple-600">
                        {uploading ? 'Uploading...' : 'Click to upload logo'}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">PNG or SVG recommended</span>
                    </div>
                  </label>
                )}
                <p className="text-xs text-purple-600 mt-2">
                  Recommended: PNG or SVG with transparent background, max 5MB
                </p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sponsor Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter sponsor name"
                  required
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm sm:text-base"
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm sm:text-base"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the sponsor"
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm sm:text-base"
                />
              </div>

              {/* Tier */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tier Level
                </label>
                <select
                  value={formData.tier}
                  onChange={(e) => setFormData({ ...formData, tier: e.target.value as any })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm sm:text-base cursor-pointer"
                >
                  <option value="platinum">💎 Platinum - Highest Tier</option>
                  <option value="gold">🥇 Gold - Premium Tier</option>
                  <option value="silver">🥈 Silver - Mid Tier</option>
                  <option value="bronze">🥉 Bronze - Entry Tier</option>
                  <option value="partner">🤝 Partner - Standard</option>
                </select>
              </div>

              {/* Checkboxes */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Visibility Settings
                </label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-5 h-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors">Active</span>
                      <p className="text-xs text-gray-500">Show on website</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                        className="w-5 h-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors">Featured</span>
                      <p className="text-xs text-gray-500">Highlight prominently</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-5 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all text-sm sm:text-base font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formData.name || !formData.logo || uploading}
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all text-sm sm:text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingSponsor ? '✓ Update Sponsor' : '+ Create Sponsor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Cropper Modal */}
      {showCropper && tempImageSrc && (
        <ImageCropper
          src={tempImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setShowCropper(false);
            setTempImageSrc('');
          }}
          aspectRatio={16/9}
          cropShape="rect"
          locale={locale}
        />
      )}
    </div>
  );
}
