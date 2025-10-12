'use client';

import React, { useState, useEffect } from 'react';
import { RoleBasedRoute } from '@/components/dashboard/RoleBasedRoute';
import { useAuthLogic } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ArtistService, Artist, UpdateArtistProfileRequest } from '@/services/artist.service';
import { 
  User, 
  Upload, 
  Save, 
  ArrowLeft,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ArtistProfileUpdatePage() {
  const { user, isLoading } = useAuthLogic();
  const router = useRouter();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState<UpdateArtistProfileRequest>({
    genres: [],
    skills: [],
    category: '',
  });

  const [files, setFiles] = useState<{
    profileImage?: File;
    profileCoverImage?: File;
    demoVideo?: File;
  }>({});

  const [newSkill, setNewSkill] = useState('');
  const [newGenre, setNewGenre] = useState('');

  useEffect(() => {
    const fetchArtistProfile = async () => {
      try {
        setLoading(true);
        setError('');
        
        if (user?.id) {
          const profile = await ArtistService.getMyProfile();
          setArtist(profile);
          
          // Initialize form with current data
          setFormData({
            genres: profile.genres || [],
            skills: profile.skills || [],
            category: profile.category || '',
          });
        }
      } catch (err) {
        console.error('Error fetching artist profile:', err);
        setError('Failed to load artist profile');
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading && user) {
      fetchArtistProfile();
    }
  }, [user?.id, isLoading]);

  const handleFileChange = (field: keyof typeof files, file: File | null) => {
    setFiles(prev => ({
      ...prev,
      [field]: file || undefined
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
      
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/dashboard/artist/update-requests');
      }, 3000);
      
    } catch (err: any) {
      console.error('Error submitting update request:', err);
      setError(err.message || 'Failed to submit update request');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <div className="text-center">Please log in to update your profile.</div>;
  }

  if (!artist) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center">
          <User className="h-8 w-8 text-yellow-600 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-yellow-800">Artist Profile Not Found</h3>
            <p className="text-yellow-700 mt-1">
              You need to be onboarded as an artist to update your profile. Please contact an administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RoleBasedRoute allowedRoles={['artist']} userRole={user.role}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard/artist/profile"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Profile
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Request Profile Update</h1>
              <p className="text-gray-600">Submit changes for administrator review</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            {/* Category */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.skills?.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Genres */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Genres
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.genres?.map((genre, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                  >
                    {genre}
                    <button
                      type="button"
                      onClick={() => removeGenre(genre)}
                      className="ml-2 text-purple-600 hover:text-purple-800"
                    >
                      ×
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGenre())}
                />
                <button
                  type="button"
                  onClick={addGenre}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* File Uploads */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Media Updates</h2>
            
            {/* Profile Image */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Image
              </label>
              <div className="flex items-center space-x-4">
                {artist.profileImage && (
                  <img 
                    src={artist.profileImage} 
                    alt="Current profile"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('profileImage', e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                </div>
              </div>
            </div>

            {/* Cover Image */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image
              </label>
              <div className="space-y-2">
                {artist.profileCoverImage && (
                  <img 
                    src={artist.profileCoverImage} 
                    alt="Current cover"
                    className="w-full h-32 rounded-lg object-cover"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('profileCoverImage', e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500">JPG, PNG up to 5MB</p>
              </div>
            </div>

            {/* Demo Video */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Demo Video
              </label>
              <div className="space-y-2">
                {artist.demoVideo && (
                  <video 
                    src={artist.demoVideo} 
                    controls
                    className="w-full h-48 rounded-lg"
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileChange('demoVideo', e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500">MP4, MOV up to 50MB</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/dashboard/artist/profile"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        </form>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Important Notes:</p>
              <ul className="mt-1 list-disc list-inside space-y-1">
                <li>Profile updates require administrator approval</li>
                <li>You can only have one pending update request at a time</li>
                <li>Changes will be reviewed within 2-3 business days</li>
                <li>You'll receive an email notification when your request is processed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </RoleBasedRoute>
  );
}