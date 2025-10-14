'use client';

import React, { useState, useEffect } from 'react';
import { 
  Eye, Check, X, AlertCircle, CheckCircle, Package, Clock,
  ToggleLeft, ToggleRight, Calendar, User, DollarSign, Edit3
} from 'lucide-react';
import { 
  equipmentPackagesService, 
  EquipmentPackage
} from '@/services/equipment-packages.service';

type ModalType = 'view' | 'reject' | null;

interface ModalState {
  isOpen: boolean;
  type: ModalType;
  data?: EquipmentPackage;
}

const AdminPackageManagement: React.FC = () => {
  const [packages, setPackages] = useState<EquipmentPackage[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<EquipmentPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal state
  const [modal, setModal] = useState<ModalState>({ isOpen: false, type: null });
  const [rejectRemarks, setRejectRemarks] = useState('');

  useEffect(() => {
    fetchAllPackages();
  }, []);

  useEffect(() => {
    // Filter packages based on status
    if (statusFilter === 'all') {
      setFilteredPackages(packages);
    } else {
      setFilteredPackages(packages.filter(pkg => pkg.status === statusFilter));
    }
  }, [packages, statusFilter]);

  const fetchAllPackages = async () => {
    try {
      setError('');
      const data = await equipmentPackagesService.getAllPackagesForAdmin();
      setPackages(data);
    } catch (error: any) {
      setError('Failed to fetch packages: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type: ModalType, data?: EquipmentPackage) => {
    setModal({ isOpen: true, type, data });
    setError('');
    setSuccess('');
    if (type === 'reject') {
      setRejectRemarks('');
    }
  };

  const closeModal = () => {
    setModal({ isOpen: false, type: null });
    setRejectRemarks('');
  };

  const handleApprove = async (packageId: string) => {
    setActionLoading(packageId);
    try {
      setError('');
      await equipmentPackagesService.approvePackage(packageId);
      setSuccess('Package approved successfully');
      await fetchAllPackages();
    } catch (error: any) {
      setError('Failed to approve package: ' + (error.message || 'Unknown error'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!modal.data || !rejectRemarks.trim()) {
      setError('Please provide rejection remarks');
      return;
    }

    setActionLoading(modal.data._id);
    try {
      setError('');
      await equipmentPackagesService.rejectPackage(modal.data._id, rejectRemarks);
      setSuccess('Package rejected successfully');
      closeModal();
      await fetchAllPackages();
    } catch (error: any) {
      setError('Failed to reject package: ' + (error.message || 'Unknown error'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleVisibility = async (packageId: string, currentVisibility: string) => {
    setActionLoading(packageId);
    try {
      setError('');
      const newVisibility = currentVisibility === 'online';
      await equipmentPackagesService.togglePackageVisibility(packageId, !newVisibility);
      setSuccess(`Package ${newVisibility ? 'hidden from' : 'published to'} public successfully`);
      await fetchAllPackages();
    } catch (error: any) {
      setError('Failed to update package visibility: ' + (error.message || 'Unknown error'));
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-gray-600 bg-gray-100';
      case 'pending_review': 
      case 'under_review': return 'text-yellow-600 bg-yellow-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getVisibilityColor = (visibility: string) => {
    return visibility === 'online' ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Package Management</h2>
          <p className="text-gray-600 mt-1">Review and manage all equipment packages</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-blue-50 px-4 py-2 rounded-lg">
            <p className="text-blue-700 font-medium">{packages.filter(p => p.status === 'pending_review').length} pending review</p>
          </div>
          <div className="bg-green-50 px-4 py-2 rounded-lg">
            <p className="text-green-700 font-medium">{packages.filter(p => p.status === 'approved').length} approved</p>
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 mb-4">
        {['all', 'pending_review', 'approved', 'rejected', 'draft'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status === 'all' ? 'All' : status.replace('_', ' ')}
            {status !== 'all' && (
              <span className="ml-2 bg-white bg-opacity-20 rounded-full px-2 py-0.5 text-xs">
                {packages.filter(p => p.status === status).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          {success}
        </div>
      )}

      {/* Packages Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPackages.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border-2 border-dashed border-gray-200 text-center py-12">
            <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {statusFilter === 'all' ? 'No packages found' : `No ${statusFilter.replace('_', ' ')} packages`}
            </h3>
            <p className="text-gray-500">
              {statusFilter === 'pending_review' 
                ? 'All packages have been reviewed and processed'
                : 'No packages match the current filter'
              }
            </p>
          </div>
        ) : (
          filteredPackages.map((pkg: EquipmentPackage) => (
            <div key={pkg._id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              {/* Package Image */}
              <div className="relative h-40 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-xl overflow-hidden">
                {pkg.coverImage || pkg.imageUrl || (pkg.images && pkg.images.length > 0) ? (
                  <img
                    src={pkg.coverImage || pkg.imageUrl || pkg.images?.[0]}
                    alt={pkg.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="h-8 w-8 text-white/80" />
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-1 flex-col">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pkg.status)}`}>
                    {pkg.status.replace('_', ' ')}
                  </span>
                  {pkg.status === 'approved' && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVisibilityColor(pkg.visibility)}`}>
                      {pkg.visibility}
                    </span>
                  )}
                </div>
              </div>

              {/* Package Details */}
              <div className="p-4">
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">{pkg.name}</h3>
                  <p className="text-gray-600 text-sm overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>{pkg.description}</p>
                </div>

                {/* Provider Information */}
                <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Provider</h4>
                  <div className="text-xs text-gray-600">
                    <p className="font-medium">{pkg.createdBy.firstName} {pkg.createdBy.lastName}</p>
                    <p>{pkg.createdBy.email}</p>
                  </div>
                </div>

                {/* Package Summary */}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Items: {pkg.items.length}</span>
                    <span className="text-lg font-bold text-green-600">${pkg.totalPrice}/day</span>
                  </div>
                  
                  {/* Equipment Categories */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {Array.from(new Set(pkg.items.map((item: any) => item.equipmentId.category))).slice(0, 2).map((category: string, index: number) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
                        {category}
                      </span>
                    ))}
                    {Array.from(new Set(pkg.items.map((item: any) => item.equipmentId.category))).length > 2 && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                        +{Array.from(new Set(pkg.items.map((item: any) => item.equipmentId.category))).length - 2} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <Calendar className="h-3 w-3" />
                  {new Date(pkg.createdAt).toLocaleDateString()}
                </div>

                {/* Admin Notes */}
                {pkg.adminNotes && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-3">
                    <h5 className="font-medium text-yellow-800 mb-1 text-xs">Previous Notes:</h5>
                    <p className="text-yellow-700 text-xs overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>{pkg.adminNotes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => openModal('view', pkg)}
                    className="w-full inline-flex items-center justify-center px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </button>

                  {(pkg.status === 'pending_review' || pkg.status === 'under_review') && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(pkg._id)}
                        disabled={actionLoading === pkg._id}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
                      >
                        {actionLoading === pkg._id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <Check className="h-4 w-4 mr-2" />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => openModal('reject', pkg)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </button>
                    </div>
                  )}

                  {pkg.status === 'approved' && (
                    <button
                      onClick={() => handleToggleVisibility(pkg._id, pkg.visibility)}
                      disabled={actionLoading === pkg._id}
                      className={`w-full inline-flex items-center justify-center px-3 py-2 rounded-lg transition-colors text-sm ${
                        pkg.visibility === 'online'
                          ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      } disabled:opacity-50`}
                    >
                      {actionLoading === pkg._id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : pkg.visibility === 'online' ? (
                        <ToggleLeft className="h-4 w-4 mr-2" />
                      ) : (
                        <ToggleRight className="h-4 w-4 mr-2" />
                      )}
                      {pkg.visibility === 'online' ? 'Hide' : 'Publish'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View Package Modal */}
      {modal.isOpen && modal.type === 'view' && modal.data && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{modal.data.name}</h3>
                <div className="flex gap-2 mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(modal.data.status)}`}>
                    {modal.data.status.replace('_', ' ')}
                  </span>
                  {modal.data.status === 'approved' && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getVisibilityColor(modal.data.visibility)}`}>
                      {modal.data.visibility}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Package Image */}
              {modal.data.imageUrl && (
                <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={modal.data.imageUrl}
                    alt={modal.data.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Package Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600 leading-relaxed">{modal.data.description}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Provider Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {modal.data.createdBy.firstName} {modal.data.createdBy.lastName}</p>
                    <p><span className="font-medium">Email:</span> {modal.data.createdBy.email}</p>
                    <p><span className="font-medium">Created:</span> {new Date(modal.data.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Package Items */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Package Items</h4>
                <div className="grid gap-3">
                  {modal.data.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          {item.equipmentId.images && item.equipmentId.images.length > 0 ? (
                            <img 
                              src={item.equipmentId.images[0]} 
                              alt={item.equipmentId.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">{item.equipmentId.name}</h5>
                          <p className="text-sm text-gray-600">Category: {item.equipmentId.category}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ${((item.equipmentId.pricePerDay || 0) * (item.quantity || 0)).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">per day</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Price */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-blue-900">Total Package Price</h4>
                  <p className="text-2xl font-bold text-blue-600">${(modal.data.totalPrice || 0).toFixed(2)}/day</p>
                </div>
              </div>

              {/* Admin Notes */}
              {modal.data.adminNotes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h5 className="font-semibold text-yellow-800 mb-2">Admin Notes</h5>
                  <p className="text-yellow-700">{modal.data.adminNotes}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="text-sm text-gray-600">
                Status: <span className="font-medium">{modal.data.status.replace('_', ' ')}</span>
              </div>
              <div className="flex gap-3">
                {(modal.data.status === 'pending_review' || modal.data.status === 'under_review') && (
                  <>
                    <button
                      onClick={() => {
                        closeModal();
                        handleApprove(modal.data!._id);
                      }}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Approve Package
                    </button>
                    <button
                      onClick={() => {
                        const currentData = modal.data;
                        closeModal();
                        openModal('reject', currentData);
                      }}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reject Package
                    </button>
                  </>
                )}
                <button
                  onClick={closeModal}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Package Modal */}
      {modal.isOpen && modal.type === 'reject' && modal.data && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Reject Package</h3>
                <p className="text-gray-600 mt-1">Provide feedback for: {modal.data.name}</p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Remarks *
                </label>
                <textarea
                  value={rejectRemarks}
                  onChange={(e) => setRejectRemarks(e.target.value)}
                  placeholder="Please provide detailed feedback about why this package is being rejected..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This feedback will be sent to the equipment provider to help them improve their submission.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <button
                onClick={closeModal}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectRemarks.trim() || actionLoading === modal.data._id}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {actionLoading === modal.data._id && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                Reject Package
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPackageManagement;