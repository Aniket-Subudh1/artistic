'use client';

import React, { useState } from 'react';
import { 
  Package, 
  Upload, 
  DollarSign, 
  AlertCircle, 
  CheckCircle,
  X,
  Image as ImageIcon,
  Plus
} from 'lucide-react';
import { EquipmentService } from '@/services/equipment.service';

const PREDEFINED_CATEGORIES = [
  { value: 'SOUND', label: 'Sound Equipment', description: 'Speakers, microphones, mixers, amplifiers' },
  { value: 'DISPLAY', label: 'Display Equipment', description: 'Projectors, screens, monitors, LED walls' },
  { value: 'LIGHT', label: 'Lighting Equipment', description: 'Stage lights, spotlights, LED strips, controllers' },
  { value: 'CAMERA', label: 'Camera Equipment', description: 'Cameras, lenses, tripods, stabilizers' },
  { value: 'STAGING', label: 'Staging Equipment', description: 'Platforms, trusses, barriers, backdrops' },
  { value: 'POWER', label: 'Power Equipment', description: 'Generators, power distributors, cables' },
  { value: 'TRANSPORT', label: 'Transport Equipment', description: 'Dollies, carts, cases, rigging' },
  { value: 'OTHER', label: 'Other Equipment', description: 'Custom category for specialized equipment' }
];

interface AddEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddEquipmentModal({ isOpen, onClose, onSuccess }: AddEquipmentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    customCategory: '',
    description: '',
    pricePerHour: '',
    pricePerDay: '',
    quantity: ''
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      customCategory: '',
      description: '',
      pricePerHour: '',
      pricePerDay: '',
      quantity: ''
    });
    setImageFile(null);
    setImagePreview(null);
    setShowCustomCategory(false);
    setError('');
    setSuccess('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'category') {
      setShowCustomCategory(value === 'OTHER');
      if (value !== 'OTHER') {
        setFormData(prev => ({ ...prev, customCategory: '' }));
      }
    }
    
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

    // Validate custom category if "Other" is selected
    if (formData.category === 'OTHER' && !formData.customCategory.trim()) {
      setError('Please specify the custom equipment category');
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
      
      // Use custom category if "Other" is selected
      const categoryValue = formData.category === 'OTHER' && formData.customCategory.trim() 
        ? formData.customCategory.trim().toUpperCase().replace(/\s+/g, '_')
        : formData.category;
      
      submitFormData.append('category', categoryValue);
      submitFormData.append('description', formData.description);
      submitFormData.append('pricePerHour', pricePerHour.toString());
      submitFormData.append('pricePerDay', pricePerDay.toString());
      submitFormData.append('quantity', quantity.toString());
      submitFormData.append('image', imageFile);

      await EquipmentService.createEquipment(submitFormData);
      
      setSuccess('Equipment added successfully!');
      
      // Wait a moment to show success message, then close and reset
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
      
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Add New Equipment</h2>
                <p className="text-sm text-gray-600">Add equipment to your rental inventory</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-green-800 font-medium">Success!</p>
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Equipment Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Professional Sound System"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Equipment Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                >
                  <option value="">Select Category</option>
                  {PREDEFINED_CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                {formData.category && formData.category !== 'OTHER' && (
                  <p className="mt-1 text-sm text-gray-500">
                    {PREDEFINED_CATEGORIES.find(cat => cat.value === formData.category)?.description}
                  </p>
                )}
              </div>
            </div>

            {/* Custom Category Field (shown when "Other" is selected) */}
            {showCustomCategory && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Category Name *
                </label>
                <input
                  type="text"
                  name="customCategory"
                  value={formData.customCategory}
                  onChange={handleInputChange}
                  placeholder="e.g., DJ Equipment, Event Furniture, etc."
                  required={showCustomCategory}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <p className="mt-2 text-sm text-gray-600">
                  <strong>Note:</strong> Enter a descriptive name for your custom equipment category. 
                  This will help customers find your equipment more easily.
                </p>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipment Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Describe your equipment features, specifications, what's included, and any special requirements..."
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-none"
              />
              <p className="mt-1 text-sm text-gray-500">
                Provide detailed information to help customers understand what they're renting
              </p>
            </div>

            {/* Pricing and Quantity */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Hour ($) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="pricePerHour"
                    value={formData.pricePerHour}
                    onChange={handleInputChange}
                    placeholder="50.00"
                    min="0"
                    step="0.01"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Day ($) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="pricePerDay"
                    value={formData.pricePerDay}
                    onChange={handleInputChange}
                    placeholder="300.00"
                    min="0"
                    step="0.01"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipment Image *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors bg-gray-50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                
                {imagePreview ? (
                  <div className="space-y-4">
                    <img
                      src={imagePreview}
                      alt="Equipment preview"
                      className="mx-auto max-h-48 rounded-lg object-contain border border-gray-200"
                    />
                    <div>
                      <p className="text-green-600 font-medium">Image selected!</p>
                      <label
                        htmlFor="image-upload"
                        className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer underline"
                      >
                        Click to change image
                      </label>
                    </div>
                  </div>
                ) : (
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-gray-700 font-medium">Upload equipment image</p>
                        <p className="text-gray-500 text-sm mt-1">PNG, JPG, JPEG up to 5MB</p>
                        <p className="text-gray-500 text-sm">High-quality images help customers make better decisions</p>
                      </div>
                      <div className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Image
                      </div>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Pricing Tips */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-yellow-600" />
                Pricing Tips
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Research competitor prices for similar equipment</li>
                <li>• Consider your equipment value, condition, and included accessories</li>
                <li>• Daily rates are typically 6-8x hourly rates</li>
                <li>• Factor in cleaning, maintenance, and transportation costs</li>
              </ul>
            </div>

            {/* Form Buttons */}
            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Adding Equipment...
                  </>
                ) : (
                  <>
                    <Package className="w-5 h-5" />
                    Add Equipment
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}