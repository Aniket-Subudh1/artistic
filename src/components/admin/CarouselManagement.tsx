'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Copy,
  GripVertical,
  Upload,
  ExternalLink,
  Calendar,
  Tag,
  AlertCircle,
  CheckCircle,
  Save,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import { CarouselService, CarouselSlide } from '../../services/carousel.service';
import { ImageCropper } from '../ui/ImageCropper';
import { uploadRequest } from '@/lib/api-config';
import { useLocale } from 'next-intl';

interface CreateSlideForm {
  title: string;
  titleHighlight: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  category: string;
  altText: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isFeatured: boolean;
}

export function CarouselManagement() {
  // Ensures a valid absolute URL. If protocol is missing, it will try to prepend https://
  const normalizeUrl = (value: string): string => {
    if (!value) return '';
    try {
      const u = new URL(value);
      return u.href;
    } catch {
      try {
        const u2 = new URL(`https://${value}`);
        return u2.href;
      } catch {
        return '';
      }
    }
  };

  // Prepare payload for API: trim strings, minimally normalize URL, convert dates to ISO, drop empty optionals
  const sanitizeSlidePayload = (form: CreateSlideForm) => {
    const payload: any = { ...form };

    // Trim string fields
    const stringFields: (keyof CreateSlideForm)[] = [
      'title','titleHighlight','subtitle','image','ctaText','ctaLink','category','altText','description','startDate','endDate'
    ];
    stringFields.forEach((k) => {
      // @ts-ignore
      if (typeof payload[k] === 'string') payload[k] = (payload[k] as string).trim();
    });

    // Minimal CTA link normalization: if missing protocol, prepend https://
    if (payload.ctaLink && !/^https?:\/\//i.test(payload.ctaLink)) {
      payload.ctaLink = `https://${payload.ctaLink}`;
    }

    // Convert dates to ISO 8601 if present; drop empty endDate
    if (payload.startDate) {
      const d = new Date(payload.startDate);
      if (!isNaN(d.getTime())) payload.startDate = d.toISOString();
    }
    if (payload.endDate) {
      const d2 = new Date(payload.endDate);
      if (!isNaN(d2.getTime())) {
        payload.endDate = d2.toISOString();
      } else {
        delete payload.endDate;
      }
    } else {
      delete payload.endDate;
    }

    // Drop optional empty strings
    ['altText','description','titleHighlight'].forEach((k) => {
      if (typeof payload[k] === 'string' && payload[k].length === 0) delete payload[k];
    });

    return payload;
  };

  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<CarouselSlide | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [createForm, setCreateForm] = useState<CreateSlideForm>({
    title: '',
    titleHighlight: '',
    subtitle: '',
    image: '',
    ctaText: '',
    ctaLink: '',
    category: '',
    altText: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    isActive: true,
    isFeatured: false,
  });

  const [editForm, setEditForm] = useState<CreateSlideForm>({
    title: '',
    titleHighlight: '',
    subtitle: '',
    image: '',
    ctaText: '',
    ctaLink: '',
    category: '',
    altText: '',
    description: '',
    startDate: '',
    endDate: '',
    isActive: true,
    isFeatured: false,
  });

  useEffect(() => {
    loadSlides();
  }, [currentPage, searchTerm, statusFilter]);

  const loadSlides = async () => {
    setIsLoading(true);
    try {
      const statusParam = statusFilter === 'all' ? undefined : statusFilter === 'active';
      const response = await CarouselService.getAllSlides({
        page: currentPage,
        limit: 10,
        isActive: statusParam,
      });
      
      setSlides(response.slides);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.totalItems);
      setError('');
    } catch (error: any) {
      setError(error.message || 'Failed to load carousel slides');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading(true);
    try {
      const payload = sanitizeSlidePayload(createForm);
      await CarouselService.createSlide(payload);
      setSuccess('Carousel slide created successfully');
      setShowCreateModal(false);
      resetCreateForm();
      loadSlides();
    } catch (error: any) {
      setError(error.message || 'Failed to create carousel slide');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleEditSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlide) return;
    
    setIsActionLoading(true);
    try {
      const payload = sanitizeSlidePayload(editForm);
      await CarouselService.updateSlide(selectedSlide._id, payload);
      setSuccess('Carousel slide updated successfully');
      setShowEditModal(false);
      setSelectedSlide(null);
      loadSlides();
    } catch (error: any) {
      setError(error.message || 'Failed to update carousel slide');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteSlide = async (id: string) => {
    if (!confirm('Are you sure you want to delete this carousel slide?')) return;
    
    setIsActionLoading(true);
    try {
      await CarouselService.deleteSlide(id);
      setSuccess('Carousel slide deleted successfully');
      loadSlides();
    } catch (error: any) {
      setError(error.message || 'Failed to delete carousel slide');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    setIsActionLoading(true);
    try {
      await CarouselService.toggleSlideStatus(id);
      setSuccess('Carousel slide status updated successfully');
      loadSlides();
    } catch (error: any) {
      setError(error.message || 'Failed to update slide status');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDuplicateSlide = async (id: string) => {
    setIsActionLoading(true);
    try {
      await CarouselService.duplicateSlide(id);
      setSuccess('Carousel slide duplicated successfully');
      loadSlides();
    } catch (error: any) {
      setError(error.message || 'Failed to duplicate carousel slide');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Simple reordering without drag-and-drop: move up/down
  const moveSlide = async (id: string, direction: 'up' | 'down') => {
    // Work on a copy sorted by order
    const sorted = [...slides].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex(s => s._id === id);
    if (idx === -1) return;
    const swapWith = direction === 'up' ? idx - 1 : idx + 1;
    if (swapWith < 0 || swapWith >= sorted.length) return;

    const a = sorted[idx];
    const b = sorted[swapWith];
    // Swap the order values
    const updates = [
      { slideId: a._id, order: b.order },
      { slideId: b._id, order: a.order },
    ];

    setIsActionLoading(true);
    try {
      await CarouselService.updateSlideOrder(updates);
      setSuccess('Slide order updated');
      await loadSlides();
    } catch (error: any) {
      setError(error.message || 'Failed to update slide order');
    } finally {
      setIsActionLoading(false);
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      title: '',
      titleHighlight: '',
      subtitle: '',
      image: '',
      ctaText: '',
      ctaLink: '',
      category: '',
      altText: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      isActive: true,
      isFeatured: false,
    });
  };

  const openEditModal = (slide: CarouselSlide) => {
    setSelectedSlide(slide);
    setEditForm({
      title: slide.title,
      titleHighlight: slide.titleHighlight,
      subtitle: slide.subtitle,
      image: slide.image,
      ctaText: slide.ctaText,
      ctaLink: slide.ctaLink,
      category: slide.category,
      altText: slide.altText || '',
      description: slide.description || '',
      startDate: slide.startDate ? new Date(slide.startDate).toISOString().split('T')[0] : '',
      endDate: slide.endDate ? new Date(slide.endDate).toISOString().split('T')[0] : '',
      isActive: slide.isActive,
      isFeatured: slide.isFeatured || false,
    });
    setShowEditModal(true);
  };

  const filteredSlides = slides.filter(slide =>
    slide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    slide.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Carousel Management</h1>
            <p className="text-gray-600 mt-1">Manage homepage carousel slides</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#391C71] text-white px-4 py-2 rounded-lg hover:bg-[#2d1557] transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Slide
          </button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="flex items-center p-4 text-green-800 bg-green-100 border border-green-200 rounded-lg">
          <CheckCircle className="h-5 w-5 mr-2" />
          {success}
          <button onClick={() => setSuccess('')} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center p-4 text-red-800 bg-red-100 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
          <button onClick={() => setError('')} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search slides..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391C71] focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391C71] focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Stats */}
          <div className="text-sm text-gray-600 flex items-center">
            Total: {totalItems} slides
          </div>
        </div>
      </div>

      {/* Slides Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#391C71]"></div>
          </div>
        ) : filteredSlides.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <ImageIcon className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-gray-500">No carousel slides found</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredSlides.map((slide) => (
                <div key={slide._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  {/* Slide Image */}
                  <div className="relative h-32 bg-gray-100 rounded-lg mb-4 overflow-hidden">
                    {slide.image ? (
                      <img
                        src={slide.image}
                        alt={slide.altText || slide.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        slide.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {slide.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Slide Content */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">
                        {slide.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          className="p-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40"
                          onClick={() => moveSlide(slide._id, 'up')}
                          disabled={isActionLoading}
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          className="p-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40"
                          onClick={() => moveSlide(slide._id, 'down')}
                          disabled={isActionLoading}
                          title="Move down"
                        >
                          ↓
                        </button>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded" title="Order">
                          {slide.order}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-yellow-600 font-medium line-clamp-1">
                      {slide.titleHighlight}
                    </p>
                    
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {slide.subtitle}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {slide.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(slide.startDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(slide)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => handleToggleStatus(slide._id)}
                            className={`p-1 rounded ${
                              slide.isActive
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={slide.isActive ? 'Deactivate' : 'Activate'}
                            disabled={isActionLoading}
                          >
                            {slide.isActive ? (
                              <ToggleRight className="h-4 w-4" />
                            ) : (
                              <ToggleLeft className="h-4 w-4" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleDuplicateSlide(slide._id)}
                            className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                            title="Duplicate"
                            disabled={isActionLoading}
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {slide.ctaLink && (
                            <a
                              href={slide.ctaLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                              title="View Link"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          
                          <button
                            onClick={() => handleDeleteSlide(slide._id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                            disabled={isActionLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-6 py-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalItems)} of {totalItems} results
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(currentPage - 2 + i, totalPages - 4 + i));
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 border rounded text-sm ${
                      currentPage === pageNum
                        ? 'bg-[#391C71] text-white border-[#391C71]'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateSlideModal
          form={createForm}
          setForm={setCreateForm}
          onSubmit={handleCreateSlide}
          onClose={() => {
            setShowCreateModal(false);
            resetCreateForm();
          }}
          isLoading={isActionLoading}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedSlide && (
        <EditSlideModal
          form={editForm}
          setForm={setEditForm}
          onSubmit={handleEditSlide}
          onClose={() => {
            setShowEditModal(false);
            setSelectedSlide(null);
          }}
          isLoading={isActionLoading}
        />
      )}
    </div>
  );
}

// Create Slide Modal Component
function CreateSlideModal({ 
  form, 
  setForm, 
  onSubmit, 
  onClose, 
  isLoading 
}: {
  form: CreateSlideForm;
  setForm: React.Dispatch<React.SetStateAction<CreateSlideForm>>;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Create New Slide</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <SlideForm form={form} setForm={setForm} />
          
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-[#391C71] text-white rounded-lg hover:bg-[#2d1557] disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              Create Slide
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Slide Modal Component
function EditSlideModal({ 
  form, 
  setForm, 
  onSubmit, 
  onClose, 
  isLoading 
}: {
  form: CreateSlideForm;
  setForm: React.Dispatch<React.SetStateAction<CreateSlideForm>>;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Edit Slide</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <SlideForm form={form} setForm={setForm} />
          
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-[#391C71] text-white rounded-lg hover:bg-[#2d1557] disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              Update Slide
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Shared Form Component
function SlideForm({ 
  form, 
  setForm 
}: {
  form: CreateSlideForm;
  setForm: React.Dispatch<React.SetStateAction<CreateSlideForm>>;
}) {
  const locale = useLocale();
  const [showCropper, setShowCropper] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size (<= 5MB)
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image is too large. Max size is 5MB');
      return;
    }

    // Create preview URL
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
    setIsUploading(true);
    try {
      const formData = new FormData();
      const fileName = `carousel-${Date.now()}.jpg`;
      formData.append('image', new File([blob], fileName, { type: 'image/jpeg' }));

      const response = await uploadRequest<{ url: string }>('/carousel/upload', formData);
      if (response?.url) {
        setForm(prev => ({ ...prev, image: response.url }));
      } else {
        alert('Failed to upload image');
      }
    } catch (err: any) {
      console.error('Upload failed', err);
      alert(err?.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    setShowCropper(false);
    await uploadCroppedImage(croppedImageBlob);
  };

  return (
    <>
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391C71] focus:border-transparent"
            placeholder="Slide title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title Highlight
          </label>
          <input
            type="text"
            value={form.titleHighlight}
            onChange={(e) => setForm(prev => ({ ...prev, titleHighlight: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391C71] focus:border-transparent"
            placeholder="Highlighted part of title"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subtitle <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          value={form.subtitle}
          onChange={(e) => setForm(prev => ({ ...prev, subtitle: e.target.value }))}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391C71] focus:border-transparent"
          placeholder="Slide description"
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Slide Image <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
            <Upload className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-700">{isUploading ? 'Uploading...' : 'Select Image'}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileSelected}
              disabled={isUploading}
            />
          </label>
          {form.image && (
            <span className="text-xs text-gray-500">Image uploaded</span>
          )}
        </div>
        {form.image && (
          <div className="mt-2">
            <img
              src={form.image}
              alt="Preview"
              className="w-full h-32 object-cover rounded-lg border"
            />
          </div>
        )}
      </div>

      {/* Cropper Modal */}
      {showCropper && tempImageSrc && (
        <ImageCropper
          src={tempImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={() => setShowCropper(false)}
          aspectRatio={16/9}
          cropShape="rect"
          locale={locale || 'en'}
        />
      )}

      {/* CTA Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CTA Text <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.ctaText}
            onChange={(e) => setForm(prev => ({ ...prev, ctaText: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391C71] focus:border-transparent"
            placeholder="Button text"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CTA Link <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            required
            value={form.ctaLink}
            onChange={(e) => setForm(prev => ({ ...prev, ctaLink: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391C71] focus:border-transparent"
            placeholder="https://example.com"
          />
          <p className="mt-1 text-xs text-gray-500">Include the full URL with https://</p>
        </div>
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={form.category}
            onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391C71] focus:border-transparent"
          >
            <option value="">Select category</option>
            <option value="Featured">Featured</option>
            <option value="Music">Music</option>
            <option value="Art">Art</option>
            <option value="Workshop">Workshop</option>
            <option value="Movies">Movies</option>
            <option value="Event">Event</option>
            <option value="Promotion">Promotion</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alt Text
          </label>
          <input
            type="text"
            value={form.altText}
            onChange={(e) => setForm(prev => ({ ...prev, altText: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391C71] focus:border-transparent"
            placeholder="Image description for accessibility"
          />
        </div>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm(prev => ({ ...prev, startDate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391C71] focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date (Optional)
          </label>
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => setForm(prev => ({ ...prev, endDate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391C71] focus:border-transparent"
          />
        </div>
      </div>

      {/* Status Toggles */}
      <div className="flex items-center gap-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
            className="h-4 w-4 text-[#391C71] border-gray-300 rounded focus:ring-[#391C71]"
          />
          <span className="ml-2 text-sm text-gray-700">Active</span>
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => setForm(prev => ({ ...prev, isFeatured: e.target.checked }))}
            className="h-4 w-4 text-[#391C71] border-gray-300 rounded focus:ring-[#391C71]"
          />
          <span className="ml-2 text-sm text-gray-700">Featured</span>
        </label>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (Optional)
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391C71] focus:border-transparent"
          placeholder="Additional description for this slide"
        />
      </div>
    </>
  );
}