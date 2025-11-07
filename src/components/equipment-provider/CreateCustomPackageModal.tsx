'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Plus, 
  Minus, 
  Search, 
  Package, 
  ShoppingCart, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { EquipmentService, Equipment } from '@/services/equipment.service';
import { 
  customEquipmentPackagesService, 
  CreateCustomPackageDto, 
  CustomPackageItem 
} from '@/services/custom-equipment-packages.service';

interface CreateCustomPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPackageCreated: () => void;
}

interface SelectedEquipment extends Equipment {
  quantity: number;
}

export function CreateCustomPackageModal({ 
  isOpen, 
  onClose, 
  onPackageCreated 
}: CreateCustomPackageModalProps) {
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    notes: '',
  });
  
  // Equipment selection
  const [availableEquipment, setAvailableEquipment] = useState<Equipment[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<SelectedEquipment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableEquipment();
      resetForm();
    }
  }, [isOpen]);

  // Filter equipment based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = availableEquipment.filter(equipment =>
        equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipment.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipment.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEquipment(filtered);
    } else {
      setFilteredEquipment(availableEquipment);
    }
  }, [searchTerm, availableEquipment]);

  const resetForm = () => {
    setStep(1);
    setFormData({
      name: '',
      description: '',
      notes: '',
    });
    setSelectedEquipment([]);
    setSearchTerm('');
    setError('');
  };

  const fetchAvailableEquipment = async () => {
    try {
      setSearchLoading(true);
      const response = await customEquipmentPackagesService.getAvailableEquipment({
        limit: 100 // Get more equipment for selection
      });
      setAvailableEquipment(response.data);
    } catch (error: any) {
      console.error('Error fetching equipment:', error);
      setError('Failed to load available equipment');
    } finally {
      setSearchLoading(false);
    }
  };

  const addEquipmentToPackage = (equipment: Equipment) => {
    const existingIndex = selectedEquipment.findIndex(item => item._id === equipment._id);
    
    if (existingIndex >= 0) {
      // Increase quantity
      const updated = [...selectedEquipment];
      updated[existingIndex].quantity += 1;
      setSelectedEquipment(updated);
    } else {
      // Add new equipment with quantity 1
      setSelectedEquipment([...selectedEquipment, { ...equipment, quantity: 1 }]);
    }
  };

  const removeEquipmentFromPackage = (equipmentId: string) => {
    setSelectedEquipment(selectedEquipment.filter(item => item._id !== equipmentId));
  };

  const updateEquipmentQuantity = (equipmentId: string, quantity: number) => {
    if (quantity < 1) {
      removeEquipmentFromPackage(equipmentId);
      return;
    }

    const updated = selectedEquipment.map(item =>
      item._id === equipmentId ? { ...item, quantity } : item
    );
    setSelectedEquipment(updated);
  };

  const calculateTotalPrice = () => {
    return selectedEquipment.reduce(
      (total, item) => total + (item.pricePerDay * item.quantity),
      0
    );
  };

  const handleSubmit = async () => {
    if (selectedEquipment.length === 0) {
      setError('Please select at least one equipment item');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const packageData: CreateCustomPackageDto = {
        name: formData.name,
        description: formData.description,
        items: selectedEquipment.map(item => ({
          equipmentId: item._id,
          quantity: item.quantity,
        })),
        isPublic: false, // Custom packages are always private
        notes: formData.notes,
      };

      console.log('Creating package with data:', packageData);
      console.log('Equipment IDs being sent:', packageData.items.map(i => i.equipmentId));

      await customEquipmentPackagesService.createCustomPackage(packageData);
      
      onPackageCreated();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('Error creating custom package:', error);
      setError(error.message || 'Failed to create custom package');
    } finally {
      setLoading(false);
    }
  };

  const validateStep = () => {
    if (step === 1) {
      return selectedEquipment.length > 0;
    }
    if (step === 2) {
      return formData.name.trim() !== '' && formData.description.trim() !== '';
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
      setError('');
    } else {
      if (step === 1) {
        setError('Please select at least one equipment item');
      } else if (step === 2) {
        setError('Please fill in all required fields');
      }
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    setError('');
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative" style={{ zIndex: 100000 }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Create Custom Equipment Package</h2>
            <p className="text-purple-100 mt-1">
              Step {step} of 3: {step === 1 ? 'Select Equipment' : step === 2 ? 'Basic Information' : 'Review & Create'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-purple-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`flex items-center ${stepNumber < 3 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    stepNumber <= step
                      ? 'bg-[#391C71] text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {stepNumber < step ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    stepNumber
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    stepNumber <= step ? 'text-[#391C71]' : 'text-gray-500'
                  }`}>
                    {stepNumber === 1 && 'Select Equipment'}
                    {stepNumber === 2 && 'Basic Info'}
                    {stepNumber === 3 && 'Review & Create'}
                  </p>
                </div>
                {stepNumber < 3 && (
                  <div
                    className={`flex-1 h-1 mx-4 rounded-full ${
                      stepNumber < step 
                        ? 'bg-[#391C71]' 
                        : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-300px)]">
          {/* Step 1: Select Equipment */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Search Equipment */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search equipment..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391C71] focus:border-transparent"
                />
              </div>

              {/* Selected Equipment Summary */}
              {selectedEquipment.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    Selected Equipment ({selectedEquipment.length} items)
                  </h3>
                  <div className="space-y-2">
                    {selectedEquipment.map((item) => (
                      <div key={item._id} className="flex items-center justify-between bg-white rounded-lg p-3">
                        <div className="flex items-center flex-1">
                          <Package className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-600">{item.category} • {item.pricePerDay} KWD/day</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateEquipmentQuantity(item._id, item.quantity - 1)}
                              className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateEquipmentQuantity(item._id, item.quantity + 1)}
                              className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeEquipmentFromPackage(item._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <p className="text-lg font-bold text-green-800">
                      Total: {calculateTotalPrice()} KWD/day
                    </p>
                  </div>
                </div>
              )}

              {/* Available Equipment */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Equipment</h3>
                {searchLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-[#391C71]" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    {filteredEquipment.map((equipment) => {
                      const isSelected = selectedEquipment.some(item => item._id === equipment._id);
                      return (
                        <div
                          key={equipment._id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#391C71] bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => addEquipmentToPackage(equipment)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{equipment.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">{equipment.category}</p>
                              <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                                {equipment.description}
                              </p>
                              <p className="text-lg font-bold text-[#391C71] mt-2">
                                {equipment.pricePerDay} KWD/day
                              </p>
                            </div>
                            <div className="ml-4">
                              {isSelected ? (
                                <CheckCircle className="w-6 h-6 text-[#391C71]" />
                              ) : (
                                <ShoppingCart className="w-6 h-6 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Basic Information */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Package Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter package name..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391C71] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your custom package..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391C71] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Personal Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any personal notes about this package..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391C71] focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Step 3: Review & Create */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Package Summary</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Package Details</h4>
                    <p className="text-lg font-medium text-gray-900">{formData.name}</p>
                    <p className="text-gray-600 mt-1">{formData.description}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Visibility: Private (only you can see this package)
                    </p>
                    {formData.notes && (
                      <p className="text-sm text-gray-600 mt-2">
                        Notes: {formData.notes}
                      </p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Pricing</h4>
                    <p className="text-3xl font-bold text-[#391C71]">
                      {calculateTotalPrice()} KWD/day
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedEquipment.length} equipment items
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 mb-4">Equipment Items</h4>
                <div className="space-y-3">
                  {selectedEquipment.map((item) => (
                    <div key={item._id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <Package className="w-6 h-6 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">{item.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {item.quantity}x {item.pricePerDay} KWD = {item.quantity * item.pricePerDay} KWD
                        </p>
                        <p className="text-sm text-gray-600">per day</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4 flex items-center justify-between">
          <div>
            {step > 1 && (
              <button
                onClick={prevStep}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ← Previous
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            {step < 3 ? (
              <button
                onClick={nextStep}
                className="bg-[#391C71] text-white px-6 py-2 rounded-lg hover:bg-[#2d1659] transition-colors"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-[#391C71] text-white px-6 py-2 rounded-lg hover:bg-[#2d1659] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Package
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
}