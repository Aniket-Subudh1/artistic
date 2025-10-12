'use client';

import React, { useState } from 'react';
import { RoleBasedRoute } from '@/components/dashboard/RoleBasedRoute';
import { useAuthLogic } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EquipmentService } from '@/services/equipment.service';
import { useRouter } from '@/i18n/routing';
import { 
  Package, 
  Upload, 
  DollarSign, 
  AlertCircle, 
  CheckCircle,
  ArrowLeft,
  Image as ImageIcon
} from 'lucide-react';
import { Link } from '@/i18n/routing';

const EQUIPMENT_CATEGORIES = [
  { value: 'SOUND', label: 'Sound Equipment' },
  { value: 'DISPLAY', label: 'Display Equipment' },
  { value: 'LIGHT', label: 'Lighting Equipment' },
  { value: 'OTHER', label: 'Other Equipment' }
];

export default function AddEquipmentPage() {
  const { user, isLoading } = useAuthLogic();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    pricePerHour: '',
    pricePerDay: '',
    quantity: ''
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.name || !formData.category || !formData.description || 
        !formData.pricePerHour || !formData.pricePerDay || !formData.quantity) {
      setError('Please fill in all required fields');
      return;
    }

    if (!imageFile) {
      setError('Please upload an image of your equipment');
      return;
    }

    // Convert strings to numbers and validate
    const pricePerHour = parseFloat(formData.pricePerHour);
    const pricePerDay = parseFloat(formData.pricePerDay);
    const quantity = parseInt(formData.quantity);

    if (isNaN(pricePerHour) || pricePerHour <= 0) {
      setError('Price per hour must be a valid number greater than 0');
      return;
    }

    if (isNaN(pricePerDay) || pricePerDay <= 0) {
      setError('Price per day must be a valid number greater than 0');
      return;
    }

    if (isNaN(quantity) || quantity <= 0) {
      setError('Quantity must be a valid number greater than 0');
      return;
    }

    setIsSubmitting(true);

    try {
      const submitFormData = new FormData();
      submitFormData.append('name', formData.name);
      submitFormData.append('category', formData.category);
      submitFormData.append('description', formData.description);
      // Convert to numbers before appending
      submitFormData.append('pricePerHour', pricePerHour.toString());
      submitFormData.append('pricePerDay', pricePerDay.toString());
      submitFormData.append('quantity', quantity.toString());
      submitFormData.append('image', imageFile);

      await EquipmentService.createEquipment(submitFormData);
      
      setSuccess('Equipment added successfully! Redirecting...');
      
      // Reset form
      setFormData({
        name: '',
        category: '',
        description: '',
        pricePerHour: '',
        pricePerDay: '',
        quantity: ''
      });
      setImageFile(null);
      setImagePreview(null);

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/dashboard/equipment-provider');
      }, 2000);
      
    } catch (error: any) {
      console.error('Equipment creation error:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      
      // Parse validation errors if they exist
      if (errorMessage.includes('must not be less than') || errorMessage.includes('must be a number')) {
        setError('Please check your price and quantity values. Make sure they are valid numbers greater than 0.');
      } else {
        setError('Failed to add equipment: ' + errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !user) {
    return <LoadingSpinner text="Loading add equipment page..." />;
  }

  return (
    <RoleBasedRoute allowedRoles={['equipment_provider']} userRole={user.role}>
      <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/equipment-provider"
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors bg-white"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Add New Equipment</h1>
              <p className="text-sm text-gray-600">Add equipment to your rental inventory</p>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm">
              <CheckCircle className="w-5 h-5" />
              {success}
            </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Equipment Details</h2>
                  <p className="text-sm text-gray-600">Provide accurate information</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Equipment Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Professional Sound System"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm"
                  >
                    <option value="">Select Category</option>
                    {EQUIPMENT_CATEGORIES.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Describe your equipment features and specifications..."
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm"
                />
              </div>

              {/* Pricing and Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price per Hour ($) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      name="pricePerHour"
                      value={formData.pricePerHour}
                      onChange={handleInputChange}
                      placeholder="50"
                      min="0"
                      step="0.01"
                      required
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price per Day ($) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      name="pricePerDay"
                      value={formData.pricePerDay}
                      onChange={handleInputChange}
                      placeholder="300"
                      min="0"
                      step="0.01"
                      required
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Available Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="1"
                    min="1"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipment Image *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  
                  {imagePreview ? (
                    <div className="space-y-2">
                      <img
                        src={imagePreview}
                        alt="Equipment preview"
                        className="mx-auto max-h-32 rounded-lg object-contain"
                      />
                      <div>
                        <p className="text-green-600 font-medium text-sm">Image selected!</p>
                        <label
                          htmlFor="image-upload"
                          className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer"
                        >
                          Click to change
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <div className="space-y-2">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-gray-600 font-medium text-sm">Upload equipment image</p>
                          <p className="text-gray-500 text-xs">PNG, JPG, JPEG up to 5MB</p>
                        </div>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Link
                  href="/dashboard/equipment-provider"
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center font-medium text-sm"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 text-sm"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <Package className="w-4 h-4" />
                      Add Equipment
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </RoleBasedRoute>
  );
}