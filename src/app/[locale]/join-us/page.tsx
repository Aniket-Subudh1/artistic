'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { Upload, User, Mail, Phone, Calendar, CheckCircle, AlertCircle, FileText, Video } from 'lucide-react';
import Image from 'next/image';
import { Footer } from '@/components/main/Footer';
import { Navbar } from '@/components/main/Navbar';
import { ApplicationService, CreateApplicationRequest } from '@/services/application.service';

export default function JoinUsPage() {
  const t = useTranslations();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    age: '',
    gender: '',
    applicationType: 'Solo' as 'Solo' | 'Team',
    videoLink: ''
  });

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Validation
    if (!formData.fullName || !formData.email || !formData.age || !formData.gender) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    if (!uploadedFile) {
      setError('Please upload your CV/Resume');
      setIsLoading(false);
      return;
    }

    try {
      const applicationData: CreateApplicationRequest = {
        fullName: formData.fullName,
        email: formData.email,
        age: formData.age,
        gender: formData.gender,
        applicationType: formData.applicationType,
        videoLink: formData.videoLink || undefined
      };

      const response = await ApplicationService.submitApplication(applicationData, uploadedFile);
      
      setSuccess('Application submitted successfully! We will review your application and contact you soon.');
      
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        age: '',
        gender: '',
        applicationType: 'Solo',
        videoLink: ''
      });
      setUploadedFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
    } catch (error: any) {
      console.error('Application submission error:', error);
      setError(error.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a PDF, DOC, or DOCX file');
        return;
      }
      
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      setUploadedFile(file);
      setError('');
    }
  };

  const handleApplicationTypeChange = (type: 'Solo' | 'Team') => {
    setFormData(prev => ({
      ...prev,
      applicationType: type
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Apply to Join Us
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Fill out the form below to start your application to become part of our artistic community
            </p>
          </div>

          {/* Application Form */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-purple-600 to-blue-600">
              <h2 className="text-2xl font-bold text-white">Application Form</h2>
              <p className="text-purple-100 mt-1">Please provide accurate information for faster processing</p>
            </div>

            <div className="p-8">
              {/* Messages */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3 text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3 text-green-700">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                        placeholder="Enter your full name"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                        placeholder="Enter your email"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                      Gender *
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      required
                      disabled={isLoading}
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                      Age *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        id="age"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        min="16"
                        max="100"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                        placeholder="Enter your age"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                {/* Application Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Application Type *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleApplicationTypeChange('Solo')}
                      className={`p-4 border-2 rounded-lg transition-all duration-200 text-left ${
                        formData.applicationType === 'Solo'
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      disabled={isLoading}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          formData.applicationType === 'Solo' ? 'bg-purple-500 border-purple-500' : 'border-gray-300'
                        }`}>
                          {formData.applicationType === 'Solo' && (
                            <div className="w-full h-full rounded-full bg-white transform scale-50"></div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">Solo Artist</h3>
                          <p className="text-sm text-gray-500">Individual application</p>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplicationTypeChange('Team')}
                      className={`p-4 border-2 rounded-lg transition-all duration-200 text-left ${
                        formData.applicationType === 'Team'
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      disabled={isLoading}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          formData.applicationType === 'Team' ? 'bg-purple-500 border-purple-500' : 'border-gray-300'
                        }`}>
                          {formData.applicationType === 'Team' && (
                            <div className="w-full h-full rounded-full bg-white transform scale-50"></div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">Team/Group</h3>
                          <p className="text-sm text-gray-500">Group application</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload CV/Resume *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      disabled={isLoading}
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      {uploadedFile ? (
                        <div className="text-green-600">
                          <FileText className="w-6 h-6 mx-auto mb-1" />
                          <p className="font-medium">{uploadedFile.name}</p>
                          <p className="text-sm text-gray-500">Click to change file</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-gray-600 font-medium">Upload a file or drag and drop</p>
                          <p className="text-gray-500 text-sm mt-1">PDF, DOC, DOCX up to 10MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Video Link */}
                <div>
                  <label htmlFor="videoLink" className="block text-sm font-medium text-gray-700 mb-2">
                    Video Link (Portfolio/Showreel)
                  </label>
                  <div className="relative">
                    <Video className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="url"
                      id="videoLink"
                      name="videoLink"
                      value={formData.videoLink}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      placeholder="https://example.com/your-video"
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Please provide a link to your portfolio video or showreel
                  </p>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                        Submitting Application...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </button>
                </div>
              </form>

              {/* Additional Info */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">What happens next?</h3>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Our team will review your application within 3-5 business days</li>
                  <li>• You'll receive an email notification about the status</li>
                  <li>• If approved, we'll contact you to complete your professional profile</li>
                  <li>• Welcome to the Artistic community!</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-8">
            <Link
              href="/"
              className="inline-flex items-center text-gray-600 hover:text-purple-600 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}