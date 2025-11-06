'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { TestimonialService, type Testimonial, type CreateTestimonialRequest } from '@/services/testimonial.service';
import { Plus, Edit, Trash2, X, Upload, Star, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { ImageCropper } from '@/components/ui/ImageCropper';
import { useLocale } from 'next-intl';

export default function TestimonialManagement() {
  const locale = useLocale();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [uploading, setUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCropper, setShowCropper] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string>('');

  const [formData, setFormData] = useState<CreateTestimonialRequest>({
    name: '',
    role: '',
    content: '',
    avatar: '',
    rating: 5,
    company: '',
    order: 0,
    isActive: true,
    isFeatured: false,
  });

  useEffect(() => {
    fetchTestimonials();
  }, [currentPage]);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await TestimonialService.getAllTestimonials(currentPage, 20);
      setTestimonials(response.testimonials);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      content: '',
      avatar: '',
      rating: 5,
      company: '',
      order: 0,
      isActive: true,
      isFeatured: false,
    });
    setEditingTestimonial(null);
  };

  const handleOpenModal = (testimonial?: Testimonial) => {
    if (testimonial) {
      setEditingTestimonial(testimonial);
      setFormData({
        name: testimonial.name,
        role: testimonial.role,
        content: testimonial.content,
        avatar: testimonial.avatar || '',
        rating: testimonial.rating,
        company: testimonial.company || '',
        order: testimonial.order,
        isActive: testimonial.isActive,
        isFeatured: testimonial.isFeatured,
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
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
      const fileName = `avatar-${Date.now()}.jpg`;
      const file = new File([blob], fileName, { type: 'image/jpeg' });
      const url = await TestimonialService.uploadAvatar(file);
      setFormData({ ...formData, avatar: url });
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    setShowCropper(false);
    await uploadCroppedImage(croppedImageBlob);
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, avatar: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.role || !formData.content) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.content.length > 500) {
      alert('Content must be 500 characters or less');
      return;
    }

    if (formData.rating && (formData.rating < 1 || formData.rating > 5)) {
      alert('Rating must be between 1 and 5');
      return;
    }

    try {
      if (editingTestimonial) {
        await TestimonialService.updateTestimonial(editingTestimonial._id, formData);
      } else {
        await TestimonialService.createTestimonial(formData);
      }
      handleCloseModal();
      await fetchTestimonials();
    } catch (error) {
      console.error('Failed to save testimonial:', error);
      alert('Failed to save testimonial');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      await TestimonialService.deleteTestimonial(id);
      fetchTestimonials();
    } catch (error) {
      console.error('Failed to delete testimonial:', error);
      alert('Failed to delete testimonial');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await TestimonialService.toggleTestimonialStatus(id);
      fetchTestimonials();
    } catch (error) {
      console.error('Failed to toggle status:', error);
      alert('Failed to toggle status');
    }
  };

  const handleReorder = async (testimonialId: string, currentOrder: number, direction: 'up' | 'down') => {
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;
    
    // Check boundaries
    if (newOrder < 0) return;
    
    const maxOrder = Math.max(...testimonials.map(t => t.order));
    if (newOrder > maxOrder) return;

    // Find the testimonial to swap with
    const testimonialToSwap = testimonials.find(t => t.order === newOrder);
    
    if (!testimonialToSwap) return;

    try {
      // Swap orders between the two testimonials
      await TestimonialService.reorderTestimonials([
        { testimonialId, order: newOrder },
        { testimonialId: testimonialToSwap._id, order: currentOrder }
      ]);
      await fetchTestimonials();
    } catch (error) {
      console.error('Failed to reorder:', error);
      alert('Failed to reorder testimonials');
    }
  };

  const renderStars = (rating: number, onChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            disabled={!onChange}
            className={`${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <Star
              className={`w-5 h-5 sm:w-6 sm:h-6 ${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-300 text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">Loading testimonials...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Testimonial Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Manage client testimonials and reviews
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all font-semibold text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Add Testimonial</span>
        </button>
      </div>

      {/* Testimonials Grid */}
      {testimonials.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">No testimonials yet</p>
          <button
            onClick={() => handleOpenModal()}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            Create your first testimonial
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial._id}
              className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-all duration-300"
            >
              {/* Header with Avatar */}
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0">
                  {testimonial.avatar ? (
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden ring-2 ring-purple-100">
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm sm:text-base ring-2 ring-purple-100">
                      {getInitials(testimonial.name)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                    {testimonial.name}
                  </h3>
                  <p className="text-purple-600 text-xs sm:text-sm truncate">
                    {testimonial.role}
                  </p>
                  {testimonial.company && (
                    <p className="text-gray-500 text-xs truncate">{testimonial.company}</p>
                  )}
                </div>
              </div>

              {/* Rating */}
              <div className="mb-3">
                {renderStars(testimonial.rating)}
              </div>

              {/* Content */}
              <p className="text-gray-700 text-xs sm:text-sm line-clamp-4 mb-4 italic">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    testimonial.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {testimonial.isActive ? 'Active' : 'Inactive'}
                </span>
                {testimonial.isFeatured && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Featured
                  </span>
                )}
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Order: {testimonial.order}
                </span>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleToggleStatus(testimonial._id)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-xs sm:text-sm"
                  title={testimonial.isActive ? 'Deactivate' : 'Activate'}
                >
                  {testimonial.isActive ? (
                    <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  ) : (
                    <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  )}
                  <span className="hidden sm:inline">
                    {testimonial.isActive ? 'Hide' : 'Show'}
                  </span>
                </button>
                <button
                  onClick={() => handleOpenModal(testimonial)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors text-xs sm:text-sm"
                >
                  <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
                <button
                  onClick={() => handleReorder(testimonial._id, testimonial.order, 'up')}
                  disabled={testimonial.order === 0}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                  title="Move up"
                >
                  <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Up</span>
                </button>
                <button
                  onClick={() => handleReorder(testimonial._id, testimonial.order, 'down')}
                  disabled={testimonial.order === Math.max(...testimonials.map(t => t.order))}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                  title="Move down"
                >
                  <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Down</span>
                </button>
                <button
                  onClick={() => handleDelete(testimonial._id)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors text-xs sm:text-sm col-span-2"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-sm"
          >
            Previous
          </button>
          <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium text-sm">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-sm"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
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
                  {editingTestimonial ? (
                    <Edit className="w-5 h-5 text-white" />
                  ) : (
                    <Plus className="w-5 h-5 text-white" />
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
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
              {/* Avatar Upload */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-100">
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Profile Avatar
                </label>
                <div className="flex items-center gap-4">
                  {formData.avatar ? (
                    <div className="relative group">
                      <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-purple-200 shadow-lg">
                        <Image
                          src={formData.avatar}
                          alt="Avatar preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-1 -right-1 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg transition-all hover:scale-110"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl ring-4 ring-purple-200 shadow-lg">
                      {formData.name ? getInitials(formData.name) : <Upload className="w-8 h-8" />}
                    </div>
                  )}
                  <label className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                    <div className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 text-purple-700 rounded-xl cursor-pointer transition-all shadow-sm hover:shadow text-sm sm:text-base font-medium">
                      <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>{uploading ? 'Uploading...' : formData.avatar ? 'Change Avatar' : 'Upload Avatar'}</span>
                    </div>
                  </label>
                </div>
                <p className="text-xs text-purple-600 mt-2 ml-28">
                  Recommended: Square image, max 5MB
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm sm:text-base"
                    placeholder="John Doe"
                    required
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm sm:text-base"
                    placeholder="Event Planner"
                    required
                  />
                </div>
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm sm:text-base"
                  placeholder="Company Name (Optional)"
                />
              </div>

              {/* Rating */}
              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Rating <span className="text-red-500">*</span>
                </label>
                {renderStars(formData.rating || 5, (rating) =>
                  setFormData({ ...formData, rating })
                )}
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Testimonial Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={5}
                  maxLength={500}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none transition-all text-sm sm:text-base"
                  placeholder="Share your experience..."
                  required
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">
                    Write a detailed testimonial about your experience
                  </p>
                  <p className={`text-xs font-medium ${formData.content.length > 450 ? 'text-red-600' : 'text-gray-500'}`}>
                    {formData.content.length}/500
                  </p>
                </div>
              </div>

              {/* Order */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
                  }
                  min={0}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm sm:text-base"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lower numbers appear first
                </p>
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
                        onChange={(e) =>
                          setFormData({ ...formData, isActive: e.target.checked })
                        }
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
                        onChange={(e) =>
                          setFormData({ ...formData, isFeatured: e.target.checked })
                        }
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
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all text-sm sm:text-base font-semibold"
                >
                  {editingTestimonial ? '✓ Update Testimonial' : '+ Create Testimonial'}
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
          aspectRatio={1}
          cropShape="round"
          locale={locale}
        />
      )}
    </div>
  );
}
