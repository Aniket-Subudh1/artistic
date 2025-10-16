'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  Eye,
  DollarSign,
  Calendar,
  Package,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Building
} from 'lucide-react';
import { AdminService } from '@/services/admin.service';

interface EquipmentProviderPayment {
  _id: string;
  packageId: {
    _id: string;
    name: string;
    description: string;
    totalPrice: number;
    coverImage?: string;
    createdBy: {
      firstName: string;
      lastName: string;
      email: string;
      companyName?: string;
    };
  };
  bookedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  startDate: string;
  endDate: string;
  totalPrice: number;
  paymentStatus: string;
  userDetails: {
    name: string;
    email: string;
    phone: string;
  };
  createdAt: string;
}

interface PaymentStats {
  totalEarnings: number;
  count: number;
  averagePayment: number;
  paidCount: number;
  pendingCount: number;
  failedCount: number;
}

export default function AdminEquipmentProviderPaymentManagement() {
  const [payments, setPayments] = useState<EquipmentProviderPayment[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalEarnings: 0,
    count: 0,
    averagePayment: 0,
    paidCount: 0,
    pendingCount: 0,
    failedCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  
  // Pagination states
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    count: 0,
    perPage: 10
  });

  const [selectedPayment, setSelectedPayment] = useState<EquipmentProviderPayment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [pagination.current, statusFilter, searchTerm, dateFilter]);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const filters = {
        page: pagination.current,
        limit: pagination.perPage,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined,
        startDate: dateFilter.start || undefined,
        endDate: dateFilter.end || undefined,
      };

      const response = await AdminService.getEquipmentProviderPayments(filters);
      setPayments(response.payments);
      setPagination(response.pagination);
      
      // Calculate enhanced stats
      const enhancedStats = {
        totalEarnings: response.totalEarnings,
        count: response.pagination.count,
        averagePayment: response.pagination.count > 0 ? response.totalEarnings / response.pagination.count : 0,
        paidCount: response.payments.filter((p: EquipmentProviderPayment) => p.paymentStatus === 'paid').length,
        pendingCount: response.payments.filter((p: EquipmentProviderPayment) => p.paymentStatus === 'pending').length,
        failedCount: response.payments.filter((p: EquipmentProviderPayment) => p.paymentStatus === 'failed').length,
      };
      setStats(enhancedStats);
    } catch (err: any) {
      console.error('Error fetching equipment provider payments:', err);
      setError('Failed to fetch equipment provider payments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchPayments();
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, current: page }));
  };

  const getPaymentStatusBadge = (status: string) => {
    const configs = {
      paid: { icon: CheckCircle, color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
      pending: { icon: Clock, color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' },
      failed: { icon: XCircle, color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
      refunded: { icon: AlertCircle, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
    };

    const config = configs[status as keyof typeof configs] || configs.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const calculateRentalDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Equipment Provider Payment Management</h2>
          <p className="mt-1 text-sm text-gray-700">
            Track and manage payments to equipment providers
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Provider Payments
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Provider Earnings
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(stats.totalEarnings)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Rentals
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.count}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Average Rental
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(stats.averagePayment)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Success Rate
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.count > 0 ? Math.round((stats.paidCount / stats.count) * 100) : 0}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Providers
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by provider, package..."
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Payment Status
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={dateFilter.start}
              onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={dateFilter.end}
              onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </form>
      </div>

      {/* Payments Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Package
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rental Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Processed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <Building className="h-6 w-6 text-gray-400" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.packageId?.createdBy?.companyName || 'Individual Provider'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.packageId?.createdBy?.firstName} {payment.packageId?.createdBy?.lastName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {payment.packageId?.coverImage ? (
                          <img
                            className="h-10 w-10 rounded-lg object-cover"
                            src={payment.packageId.coverImage}
                            alt={payment.packageId.name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.packageId?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Equipment Package
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {payment.userDetails?.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {payment.userDetails?.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(payment.startDate)}
                    </div>
                    <div className="text-sm text-gray-500">
                      to {formatDate(payment.endDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {calculateRentalDays(payment.startDate, payment.endDate)} days
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-600">
                      {formatCurrency(payment.totalPrice)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPaymentStatusBadge(payment.paymentStatus)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(payment.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedPayment(payment);
                        setShowDetailsModal(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(pagination.current - 1)}
              disabled={pagination.current <= 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.current + 1)}
              disabled={pagination.current >= pagination.total}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">
                  {(pagination.current - 1) * pagination.perPage + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(pagination.current * pagination.perPage, pagination.count)}
                </span>{' '}
                of{' '}
                <span className="font-medium">{pagination.count}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => handlePageChange(pagination.current - 1)}
                  disabled={pagination.current <= 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, pagination.total) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pagination.current
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(pagination.current + 1)}
                  disabled={pagination.current >= pagination.total}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedPayment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Equipment Provider Payment Details
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Payment Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                    <p className="text-sm text-gray-900">{selectedPayment._id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Payment Status</label>
                    <div className="mt-1">
                      {getPaymentStatusBadge(selectedPayment.paymentStatus)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(selectedPayment.totalPrice)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date Processed</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedPayment.createdAt)}</p>
                  </div>
                </div>

                {/* Provider Details */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">Equipment Provider Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Company Name</label>
                      <p className="text-sm text-gray-900">
                        {selectedPayment.packageId?.createdBy?.companyName || 'Individual Provider'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                      <p className="text-sm text-gray-900">
                        {selectedPayment.packageId?.createdBy?.firstName} {selectedPayment.packageId?.createdBy?.lastName}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="text-sm text-gray-900">
                        {selectedPayment.packageId?.createdBy?.email || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Customer Details */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">Customer Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <p className="text-sm text-gray-900">{selectedPayment.userDetails?.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="text-sm text-gray-900">{selectedPayment.userDetails?.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-sm text-gray-900">{selectedPayment.userDetails?.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Package Details */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">Package Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Package Name</label>
                      <p className="text-sm text-gray-900">{selectedPayment.packageId?.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Rental Duration</label>
                      <p className="text-sm text-gray-900">
                        {calculateRentalDays(selectedPayment.startDate, selectedPayment.endDate)} days
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Start Date</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedPayment.startDate)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">End Date</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedPayment.endDate)}</p>
                    </div>
                  </div>
                  {selectedPayment.packageId?.description && (
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <p className="text-sm text-gray-900">{selectedPayment.packageId.description}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}