'use client';

import React, { useState, useEffect } from 'react';
import { useAuthLogic } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
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
    genres: artist?.genres || [],
    skills: artist?.skills || [],
    category: artist?.category || '',
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

  useEffect(() => {
    if (artist) {
      setFormData({
        genres: artist.genres || [],
        skills: artist.skills || [],
        category: artist.category || '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      await ArtistService.requestProfileUpdate(formData, files);
      
      setSuccess('Profile update request submitted successfully! An administrator will review your changes.');
      
      // Call success callback
      if (onUpdateSuccess) {
        onUpdateSuccess();
      }
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
        router.push('/dashboard/artist/update-requests');
      }, 2000);
      
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
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
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
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center mb-6">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center mb-6">
                <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
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
              </div>
            </form>

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
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-4 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
            >
              {submitting ? (
                <LoadingSpinner />
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
