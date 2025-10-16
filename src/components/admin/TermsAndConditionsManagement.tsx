'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  FileText, 
  Clock, 
  User,
  Search,
  Filter,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Save,
  RefreshCw
} from 'lucide-react';
import { TermsAndConditionsService, TermsAndConditions, TermsType, CreateTermsRequest, UpdateTermsRequest } from '@/services/terms-and-conditions.service';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface CategoryTerms {
  category: TermsType;
  name: string;
  description: string;
  subSections: {
    title: string;
    descriptions: string[];
  }[];
}

interface AllCategoriesFormData {
  artistBooking: CategoryTerms;
  equipmentBooking: CategoryTerms;
  generalBooking: CategoryTerms;
}

export function TermsAndConditionsManagement() {
  const [terms, setTerms] = useState<TermsAndConditions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'manage' | 'create-all'>('manage');

  // All categories form data
  const [allCategoriesForm, setAllCategoriesForm] = useState<AllCategoriesFormData>({
    artistBooking: {
      category: TermsType.ARTIST_BOOKING_PAYMENT,
      name: 'Artist Booking Terms & Conditions',
      description: 'Terms and conditions for booking artists',
      subSections: []
    },
    equipmentBooking: {
      category: TermsType.EQUIPMENT_BOOKING_PAYMENT,
      name: 'Equipment Booking Terms & Conditions', 
      description: 'Terms and conditions for booking equipment packages',
      subSections: []
    },
    generalBooking: {
      category: TermsType.GENERAL_BOOKING,
      name: 'General Booking Terms & Conditions',
      description: 'General terms and conditions for all bookings',
      subSections: []
    }
  });

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      setLoading(true);
      const data = await TermsAndConditionsService.getAllTerms();
      setTerms(data);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch terms and conditions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAllCategories = async () => {
    try {
      setIsSubmitting(true);
      setError('');

      // Create terms for all three categories
      const createPromises = [
        TermsAndConditionsService.createTerms({
          category: allCategoriesForm.artistBooking.category,
          name: allCategoriesForm.artistBooking.name,
          description: allCategoriesForm.artistBooking.description,
          subSections: allCategoriesForm.artistBooking.subSections
        }),
        TermsAndConditionsService.createTerms({
          category: allCategoriesForm.equipmentBooking.category,
          name: allCategoriesForm.equipmentBooking.name,
          description: allCategoriesForm.equipmentBooking.description,
          subSections: allCategoriesForm.equipmentBooking.subSections
        }),
        TermsAndConditionsService.createTerms({
          category: allCategoriesForm.generalBooking.category,
          name: allCategoriesForm.generalBooking.name,
          description: allCategoriesForm.generalBooking.description,
          subSections: allCategoriesForm.generalBooking.subSections
        })
      ];

      await Promise.all(createPromises);
      setSuccess('Terms and conditions created successfully for all categories!');
      await fetchTerms();
      setActiveTab('manage');
    } catch (error: any) {
      setError(error.message || 'Failed to create terms and conditions');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this terms and conditions document?')) {
      return;
    }

    try {
      await TermsAndConditionsService.deleteTerms(id);
      setSuccess('Terms and conditions deleted successfully');
      await fetchTerms();
    } catch (error: any) {
      setError(error.message || 'Failed to delete terms and conditions');
    }
  };

  const addSubSectionToCategory = (categoryKey: keyof AllCategoriesFormData) => {
    setAllCategoriesForm(prev => ({
      ...prev,
      [categoryKey]: {
        ...prev[categoryKey],
        subSections: [
          ...prev[categoryKey].subSections,
          { title: '', descriptions: [''] }
        ]
      }
    }));
  };

  const updateCategorySubSection = (
    categoryKey: keyof AllCategoriesFormData,
    sectionIndex: number,
    field: 'title' | 'descriptions',
    value: string | string[]
  ) => {
    setAllCategoriesForm(prev => ({
      ...prev,
      [categoryKey]: {
        ...prev[categoryKey],
        subSections: prev[categoryKey].subSections.map((section, i) => 
          i === sectionIndex ? { ...section, [field]: value } : section
        )
      }
    }));
  };

  const removeCategorySubSection = (categoryKey: keyof AllCategoriesFormData, sectionIndex: number) => {
    setAllCategoriesForm(prev => ({
      ...prev,
      [categoryKey]: {
        ...prev[categoryKey],
        subSections: prev[categoryKey].subSections.filter((_, i) => i !== sectionIndex)
      }
    }));
  };

  const addDescriptionToCategory = (categoryKey: keyof AllCategoriesFormData, sectionIndex: number) => {
    const updatedForm = { ...allCategoriesForm };
    updatedForm[categoryKey].subSections[sectionIndex].descriptions.push('');
    setAllCategoriesForm(updatedForm);
  };

  const updateCategoryDescription = (
    categoryKey: keyof AllCategoriesFormData,
    sectionIndex: number,
    descIndex: number,
    value: string
  ) => {
    const updatedForm = { ...allCategoriesForm };
    updatedForm[categoryKey].subSections[sectionIndex].descriptions[descIndex] = value;
    setAllCategoriesForm(updatedForm);
  };

  const removeCategoryDescription = (
    categoryKey: keyof AllCategoriesFormData,
    sectionIndex: number,
    descIndex: number
  ) => {
    const updatedForm = { ...allCategoriesForm };
    updatedForm[categoryKey].subSections[sectionIndex].descriptions = 
      updatedForm[categoryKey].subSections[sectionIndex].descriptions.filter((_, i) => i !== descIndex);
    setAllCategoriesForm(updatedForm);
  };

  const getCategoryLabel = (category: TermsType) => {
    switch (category) {
      case TermsType.ARTIST_BOOKING_PAYMENT:
        return 'Artist Booking';
      case TermsType.EQUIPMENT_BOOKING_PAYMENT:
        return 'Equipment Booking';
      case TermsType.GENERAL_BOOKING:
        return 'General Booking';
      default:
        return category;
    }
  };

  const getCategoryColor = (category: TermsType) => {
    switch (category) {
      case TermsType.ARTIST_BOOKING_PAYMENT:
        return 'bg-purple-100 text-purple-800';
      case TermsType.EQUIPMENT_BOOKING_PAYMENT:
        return 'bg-blue-100 text-blue-800';
      case TermsType.GENERAL_BOOKING:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderCategoryForm = (
    categoryKey: keyof AllCategoriesFormData,
    categoryData: CategoryTerms,
    title: string,
    description: string
  ) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${getCategoryColor(categoryData.category).replace('text-', 'bg-').replace('100', '50')}`}>
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={categoryData.name}
            onChange={(e) => setAllCategoriesForm(prev => ({
              ...prev,
              [categoryKey]: { ...prev[categoryKey], name: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Terms title..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={categoryData.description}
            onChange={(e) => setAllCategoriesForm(prev => ({
              ...prev,
              [categoryKey]: { ...prev[categoryKey], description: e.target.value }
            }))}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Brief description..."
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">Sections</label>
            <button
              type="button"
              onClick={() => addSubSectionToCategory(categoryKey)}
              className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Section
            </button>
          </div>

          <div className="space-y-3">
            {categoryData.subSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Section {sectionIndex + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeCategorySubSection(categoryKey, sectionIndex)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateCategorySubSection(categoryKey, sectionIndex, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Section title..."
                  />

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Content</label>
                      <button
                        type="button"
                        onClick={() => addDescriptionToCategory(categoryKey, sectionIndex)}
                        className="text-sm text-purple-600 hover:text-purple-800"
                      >
                        + Add Paragraph
                      </button>
                    </div>
                    
                    {section.descriptions.map((desc, descIndex) => (
                      <div key={descIndex} className="flex gap-2 mb-2">
                        <textarea
                          value={desc}
                          onChange={(e) => updateCategoryDescription(categoryKey, sectionIndex, descIndex, e.target.value)}
                          rows={2}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Paragraph content..."
                        />
                        {section.descriptions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCategoryDescription(categoryKey, sectionIndex, descIndex)}
                            className="text-red-600 hover:text-red-800 p-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {categoryData.subSections.length === 0 && (
              <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                <FileText className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 mb-3">No sections added yet</p>
                <button
                  type="button"
                  onClick={() => addSubSectionToCategory(categoryKey)}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add First Section
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Terms & Conditions Management</h1>
          <p className="text-gray-600 mt-1">Create and manage terms for all booking categories</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('create-all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'create-all' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Create All Categories
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'manage' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Manage Existing
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => setError('')}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-green-800">{success}</p>
          <button
            onClick={() => setSuccess('')}
            className="ml-auto text-green-600 hover:text-green-800"
          >
            ×
          </button>
        </div>
      )}

      {/* Create All Categories Tab */}
      {activeTab === 'create-all' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">Create Terms for All Categories</h3>
                <p className="text-blue-800 text-sm mt-1">
                  Fill out terms and conditions for all three booking categories. These will be displayed to users during the booking process.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {renderCategoryForm(
              'artistBooking',
              allCategoriesForm.artistBooking,
              'Artist Booking Terms',
              'Terms shown when booking artists'
            )}

            {renderCategoryForm(
              'equipmentBooking',
              allCategoriesForm.equipmentBooking,
              'Equipment Booking Terms',
              'Terms shown when booking equipment packages'
            )}

            {renderCategoryForm(
              'generalBooking',
              allCategoriesForm.generalBooking,
              'General Booking Terms',
              'General terms for all booking types'
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSubmitAllCategories}
              disabled={isSubmitting}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {isSubmitting && <RefreshCw className="w-4 h-4 animate-spin" />}
              {isSubmitting ? 'Creating Terms...' : 'Create Terms for All Categories'}
            </button>
          </div>
        </div>
      )}

      {/* Manage Existing Tab */}
      {activeTab === 'manage' && (
        <div className="space-y-6">
          {loading ? (
            <LoadingSpinner text="Loading terms and conditions..." />
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {terms.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Terms Found</h3>
                  <p className="text-gray-600 mb-4">
                    Get started by creating terms for all booking categories.
                  </p>
                  <button
                    onClick={() => setActiveTab('create-all')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create Terms for All Categories
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name & Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Version
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Updated
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sections
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {terms.map((term) => (
                        <tr key={term._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{term.name}</div>
                              <div className="mt-1">
                                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(term.category)}`}>
                                  {getCategoryLabel(term.category)}
                                </span>
                              </div>
                              {term.description && (
                                <div className="text-sm text-gray-500 mt-1 line-clamp-2">{term.description}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">v{term.version}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {term.updatedAt ? new Date(term.updatedAt).toLocaleDateString() : 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {term.updatedAt ? new Date(term.updatedAt).toLocaleTimeString() : ''}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{term.subSections.length} sections</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleDelete(term._id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}