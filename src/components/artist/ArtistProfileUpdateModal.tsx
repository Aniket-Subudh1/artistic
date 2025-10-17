'use client';

import React, { useState, useEffect } from 'react';
import { useAuthLogic } from '@/hooks/useAuth';
import { ButtonSpinner } from '@/components/ui/ButtonSpinner';
import { ImageCropper } from '@/components/ui/ImageCropper';
import { ArtistService, Artist, UpdateArtistProfileRequest } from '@/services/artist.service';
import { 
  User, 
  Upload, 
  Save, 
  X,
  AlertCircle,
  CheckCircle,
  Camera,
  Image as ImageIcon,
  Video,
  Plus,
  Trash2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ArtistProfileUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  artist: Artist;
  onUpdateSuccess?: () => void;
}

interface ImageCropperState {
  isOpen: boolean;
  src: string;
  type: 'profile' | 'cover';
  aspectRatio: number;
  cropShape: 'rect' | 'round';
}

export function ArtistProfileUpdateModal({ 
  isOpen, 
  onClose, 
  artist,
  onUpdateSuccess 
}: ArtistProfileUpdateModalProps) {
  const { user } = useAuthLogic();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Image cropper state
  const [imageCropper, setImageCropper] = useState<ImageCropperState>({
    isOpen: false,
    src: '',
    type: 'profile',
    aspectRatio: 1,
    cropShape: 'round'
  });

  // Form state
  const [formData, setFormData] = useState<UpdateArtistProfileRequest>({
    about: artist?.about || '',
    yearsOfExperience: artist?.yearsOfExperience || 0,
    pricePerHour: artist?.pricePerHour || 0,
    genres: artist?.genres || [],
    skills: artist?.skills || [],
    musicLanguages: artist?.musicLanguages || [],
    awards: artist?.awards || [],
    category: artist?.category || '',
    performPreference: artist?.performPreference || [],
  });

  const [files, setFiles] = useState<{
    profileImage?: File;
    profileCoverImage?: File;
    demoVideo?: File;
  }>({});

  const [previewImages, setPreviewImages] = useState<{
    profileImage?: string;
    profileCoverImage?: string;
  }>({
    profileImage: artist?.profileImage,
    profileCoverImage: artist?.profileCoverImage,
  });

  const [newSkill, setNewSkill] = useState('');
  const [newGenre, setNewGenre] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newAward, setNewAward] = useState('');
  const [newPerformPreference, setNewPerformPreference] = useState('');

  useEffect(() => {
    if (artist) {
      setFormData({
        about: artist.about || '',
        yearsOfExperience: artist.yearsOfExperience || 0,
        pricePerHour: artist.pricePerHour || 0,
        genres: artist.genres || [],
        skills: artist.skills || [],
        musicLanguages: artist.musicLanguages || [],
        awards: artist.awards || [],
        category: artist.category || '',
        performPreference: artist.performPreference || [],
      });
      setPreviewImages({
        profileImage: artist.profileImage,
        profileCoverImage: artist.profileCoverImage,
      });
    }
  }, [artist]);

  const handleImageSelect = (type: 'profile' | 'cover', file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setImageCropper({
        isOpen: true,
        src,
        type,
        aspectRatio: type === 'profile' ? 1 : 16/9,
        cropShape: type === 'profile' ? 'round' : 'rect'
      });
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedImageBlob: Blob) => {
    const file = new File([croppedImageBlob], `${imageCropper.type}-image.jpg`, {
      type: 'image/jpeg',
    });

    setFiles(prev => ({
      ...prev,
      [imageCropper.type === 'profile' ? 'profileImage' : 'profileCoverImage']: file
    }));

    // Create preview URL
    const previewUrl = URL.createObjectURL(croppedImageBlob);
    setPreviewImages(prev => ({
      ...prev,
      [imageCropper.type === 'profile' ? 'profileImage' : 'profileCoverImage']: previewUrl
    }));

    setImageCropper(prev => ({ ...prev, isOpen: false }));
  };

  const handleVideoChange = (file: File | null) => {
    setFiles(prev => ({
      ...prev,
      demoVideo: file || undefined
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills?.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills?.filter(s => s !== skill) || []
    }));
  };

  const addGenre = () => {
    if (newGenre.trim() && !formData.genres?.includes(newGenre.trim())) {
      setFormData(prev => ({
        ...prev,
        genres: [...(prev.genres || []), newGenre.trim()]
      }));
      setNewGenre('');
    }
  };

  const removeGenre = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres?.filter(g => g !== genre) || []
    }));
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !formData.musicLanguages?.includes(newLanguage.trim())) {
      setFormData(prev => ({
        ...prev,
        musicLanguages: [...(prev.musicLanguages || []), newLanguage.trim()]
      }));
      setNewLanguage('');
    }
  };

  const removeLanguage = (language: string) => {
    setFormData(prev => ({
      ...prev,
      musicLanguages: prev.musicLanguages?.filter(l => l !== language) || []
    }));
  };

  const addAward = () => {
    if (newAward.trim() && !formData.awards?.includes(newAward.trim())) {
      setFormData(prev => ({
        ...prev,
        awards: [...(prev.awards || []), newAward.trim()]
      }));
      setNewAward('');
    }
  };

  const removeAward = (award: string) => {
    setFormData(prev => ({
      ...prev,
      awards: prev.awards?.filter(a => a !== award) || []
    }));
  };

  const addPerformPreference = () => {
    if (newPerformPreference.trim() && !formData.performPreference?.includes(newPerformPreference.trim())) {
      setFormData(prev => ({
        ...prev,
        performPreference: [...(prev.performPreference || []), newPerformPreference.trim()]
      }));
      setNewPerformPreference('');
    }
  };

  const removePerformPreference = (preference: string) => {
    setFormData(prev => ({
      ...prev,
      performPreference: prev.performPreference?.filter(p => p !== preference) || []
    }));
  };

  const handlePerformPreferenceToggle = (preference: string) => {
    setFormData(prev => ({
      ...prev,
      performPreference: prev.performPreference?.includes(preference)
        ? prev.performPreference.filter(p => p !== preference)
        : [...(prev.performPreference || []), preference]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      // Validate that at least some data is provided
      const hasChanges = 
        (formData.genres && formData.genres.length > 0) ||
        (formData.skills && formData.skills.length > 0) ||
        (formData.category && formData.category.trim()) ||
        (formData.about && formData.about.trim()) ||
        (formData.yearsOfExperience !== undefined && formData.yearsOfExperience !== null) ||
        (formData.pricePerHour !== undefined && formData.pricePerHour !== null) ||
        (formData.musicLanguages && formData.musicLanguages.length > 0) ||
        (formData.awards && formData.awards.length > 0) ||
        (formData.performPreference && formData.performPreference.length > 0) ||
        files.profileImage || files.profileCoverImage || files.demoVideo;

      if (!hasChanges) {
        setError('Please make at least one change before submitting the update request.');
        return;
      }

      // Debug: Log the data being sent
      console.log('Form Data being sent:', formData);
      console.log('Files being sent:', files);

      await ArtistService.requestProfileUpdate(formData, files);
      
      setSuccess('Profile update request submitted successfully! An administrator will review your changes.');
      
      // Call success callback
      if (onUpdateSuccess) {
        onUpdateSuccess();
      }
      
      // Close modal after 3 seconds to show success message
      setTimeout(() => {
        onClose();
        router.push('/dashboard/artist/update-requests');
      }, 3000);
      
    } catch (err: any) {
      console.error('Error submitting update request:', err);
      setError(err.message || 'Failed to submit update request');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Request Profile Update</h2>
              <p className="text-gray-600 mt-1">Submit changes for administrator review</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 p-6 overflow-y-auto">
              {/* Messages */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center mb-6">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border-2 border-green-200 text-green-700 px-6 py-4 rounded-xl flex items-center mb-6 shadow-sm">
                  <CheckCircle className="h-6 w-6 mr-3 flex-shrink-0 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800">{success}</p>
                    <p className="text-sm text-green-600 mt-1">Redirecting to your update requests...</p>
                  </div>
                </div>
              )}

              <form id="profile-update-form" onSubmit={handleSubmit} className="space-y-8">
              {/* Media Section */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Camera className="h-5 w-5 mr-2 text-blue-600" />
                  Profile Media
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Profile Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Profile Image
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-center">
                        <div className="relative w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                          {previewImages.profileImage ? (
                            <img 
                              src={previewImages.profileImage} 
                              alt="Profile preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => document.getElementById('profile-image-input')?.click()}
                            className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                          >
                            <Camera className="h-6 w-6 text-white" />
                          </button>
                        </div>
                      </div>
                      <input
                        id="profile-image-input"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageSelect('profile', file);
                        }}
                        className="hidden"
                      />
                      <p className="text-xs text-gray-500 text-center">
                        Click to upload • JPG, PNG up to 5MB
                      </p>
                    </div>
                  </div>

                  {/* Cover Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Cover Image
                    </label>
                    <div className="space-y-3">
                      <div className="relative w-full h-32 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 hover:border-gray-400 transition-colors">
                        {previewImages.profileCoverImage ? (
                          <img 
                            src={previewImages.profileCoverImage} 
                            alt="Cover preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => document.getElementById('cover-image-input')?.click()}
                          className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                        >
                          <Camera className="h-6 w-6 text-white" />
                        </button>
                      </div>
                      <input
                        id="cover-image-input"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageSelect('cover', file);
                        }}
                        className="hidden"
                      />
                      <p className="text-xs text-gray-500 text-center">
                        Click to upload • JPG, PNG up to 5MB • 16:9 ratio recommended
                      </p>
                    </div>
                  </div>
                </div>

                {/* Demo Video */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Demo Video
                  </label>
                  <div className="space-y-3">
                    {artist.demoVideo && (
                      <video 
                        src={artist.demoVideo} 
                        controls
                        className="w-full h-48 rounded-lg border border-gray-200"
                      >
                        Your browser does not support the video tag.
                      </video>
                    )}
                    <div className="flex items-center space-x-3">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleVideoChange(e.target.files?.[0] || null)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <Video className="h-5 w-5 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500">MP4, MOV up to 50MB</p>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Basic Information
                </h3>
                
                {/* Category */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select Category</option>
                    <option value="singer">Singer</option>
                    <option value="musician">Musician</option>
                    <option value="dancer">Dancer</option>
                    <option value="actor">Actor</option>
                    <option value="comedian">Comedian</option>
                    <option value="magician">Magician</option>
                    <option value="dj">DJ</option>
                    <option value="band">Band</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Skills */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Skills
                  </label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {formData.skills?.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-2 rounded-full text-sm font-medium"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Genres */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Genres
                  </label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {formData.genres?.map((genre, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center bg-purple-100 text-purple-800 px-3 py-2 rounded-full text-sm font-medium"
                      >
                        {genre}
                        <button
                          type="button"
                          onClick={() => removeGenre(genre)}
                          className="ml-2 text-purple-600 hover:text-purple-800 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newGenre}
                      onChange={(e) => setNewGenre(e.target.value)}
                      placeholder="Add a genre"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGenre())}
                    />
                    <button
                      type="button"
                      onClick={addGenre}
                      className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* About */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    About
                  </label>
                  <textarea
                    value={formData.about || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, about: e.target.value }))}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Years of Experience & Price Per Hour */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.yearsOfExperience || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, yearsOfExperience: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Price Per Hour (KWD)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.pricePerHour || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, pricePerHour: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Music Languages */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Music Languages
                  </label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {formData.musicLanguages?.map((language, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center bg-green-100 text-green-800 px-3 py-2 rounded-full text-sm font-medium"
                      >
                        {language}
                        <button
                          type="button"
                          onClick={() => removeLanguage(language)}
                          className="ml-2 text-green-600 hover:text-green-800 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      placeholder="Add a music language"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                    />
                    <button
                      type="button"
                      onClick={addLanguage}
                      className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Awards */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Awards & Achievements
                  </label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {formData.awards?.map((award, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center bg-yellow-100 text-yellow-800 px-3 py-2 rounded-full text-sm font-medium"
                      >
                        {award}
                        <button
                          type="button"
                          onClick={() => removeAward(award)}
                          className="ml-2 text-yellow-600 hover:text-yellow-800 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newAward}
                      onChange={(e) => setNewAward(e.target.value)}
                      placeholder="Add an award or achievement"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAward())}
                    />
                    <button
                      type="button"
                      onClick={addAward}
                      className="px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Performance Preferences */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Performance Preferences
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['Public', 'Private', 'International', 'Workshop'].map((preference) => (
                      <label
                        key={preference}
                        className={`relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.performPreference?.includes(preference)
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.performPreference?.includes(preference) || false}
                          onChange={() => handlePerformPreferenceToggle(preference)}
                          className="sr-only"
                        />
                        <span className="text-sm font-medium">{preference}</span>
                      </label>
                    ))}
                  </div>
                </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-2">Important Notes:</p>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>Profile updates require administrator approval</li>
                        <li>You can only have one pending update request at a time</li>
                        <li>Changes will be reviewed within 2-3 business days</li>
                        <li>You'll receive an email notification when your request is processed</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-4 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium h-12 flex items-center justify-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="profile-update-form"
                disabled={submitting}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm min-w-[200px] justify-center h-12"
              >
                {submitting ? (
                  <>
                    <ButtonSpinner className="mr-2" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Submit Update Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Cropper Modal */}
      {imageCropper.isOpen && (
        <ImageCropper
          src={imageCropper.src}
          onCropComplete={handleCropComplete}
          onCancel={() => setImageCropper(prev => ({ ...prev, isOpen: false }))}
          aspectRatio={imageCropper.aspectRatio}
          cropShape={imageCropper.cropShape}
          locale="en"
        />
      )}
    </>
  );
}
