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
  Building,
  ChevronDown,
  ChevronRight
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
      roleProfile?: {
        companyName?: string;
        businessDescription?: string;
        profileImage?: string;
      };
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
  paymentStatus?: string;
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
  const [commission, setCommission] = useState<number>(10);
  const [savingCommission, setSavingCommission] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<EquipmentProviderPayment | null>(null);
  const [payoutNote, setPayoutNote] = useState('');
  const [payoutRef, setPayoutRef] = useState('');
  const [submittingPayout, setSubmittingPayout] = useState(false);
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

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPayments();
    fetchCommission();
  }, [pagination.current, statusFilter, searchTerm, dateFilter]);

  const resolveStatus = (p: any): string => {
    // If payout exists, consider it paid
    if (p?.payout) return 'paid';
    
    const raw = p?.paymentStatus || p?.status || p?.transactionStatus || p?.payment?.status;
    const normalized = (raw ?? '').toString().trim().toLowerCase();
    if (['paid','success','succeeded','completed','confirmed'].includes(normalized)) return 'paid';
    if (['pending','processing','in_progress'].includes(normalized)) return 'pending';
    if (['failed','declined','canceled','cancelled','error'].includes(normalized)) return 'failed';
    if (['refunded','refund'].includes(normalized)) return 'refunded';
    return 'unknown';
  };

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
        paidCount: response.payments.filter((p: any) => resolveStatus(p) === 'paid').length,
        pendingCount: response.payments.filter((p: any) => resolveStatus(p) === 'pending').length,
        failedCount: response.payments.filter((p: any) => resolveStatus(p) === 'failed').length,
      };
      setStats(enhancedStats);
    } catch (err: any) {
      console.error('Error fetching equipment provider payments:', err);
      setError('Failed to fetch equipment provider payments');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCommission = async () => {
    try {
      const res = await AdminService.getCommissionSetting('equipment');
      if (typeof (res as any)?.percentage === 'number') setCommission((res as any).percentage);
    } catch {}
  };

  const saveCommission = async () => {
    try {
      setSavingCommission(true);
      await AdminService.updateCommissionSetting({ scope: 'equipment', percentage: commission });
    } catch (e) {
      console.error('Failed updating commission', e);
    } finally {
      setSavingCommission(false);
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

  const toggleRowExpansion = (paymentId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(paymentId)) {
      newExpanded.delete(paymentId);
    } else {
      newExpanded.add(paymentId);
    }
    setExpandedRows(newExpanded);
  };

  const getPaymentStatusBadge = (status?: string) => {
    const configs = {
      paid: { icon: CheckCircle, color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
      pending: { icon: Clock, color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' },
      failed: { icon: XCircle, color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
      refunded: { icon: AlertCircle, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
      unknown: { icon: AlertCircle, color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200' },
    };

    const normalized = (status ?? '').toString().trim().toLowerCase();
    const isKnown = normalized === 'paid' || normalized === 'pending' || normalized === 'failed' || normalized === 'refunded';
    const key = (isKnown ? normalized : 'unknown') as keyof typeof configs;
    const config = configs[key];
    const Icon = config.icon;
    const label = isKnown
      ? normalized.charAt(0).toUpperCase() + normalized.slice(1)
      : 'Unknown';

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
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
    return new Intl.NumberFormat('en-KW', {
      style: 'currency',
      currency: 'KWD',
    }).format(amount);
  };

  const netFor = (gross: number) => Math.max(0, gross * (1 - (isNaN(commission) ? 0 : commission) / 100));

  const openPayout = (payment: any) => {
    setSelectedPayment(payment);
    if (payment?.payout) {
      setPayoutNote(payment.payout.notes || '');
      setPayoutRef(payment.payout.reference || '');
      if (typeof payment.payout.commissionPercentage === 'number') setCommission(payment.payout.commissionPercentage);
    } else {
      setPayoutNote('');
      setPayoutRef('');
    }
    setShowPayoutModal(true);
  };

  const submitPayout = async () => {
    if (!selectedPayment) return;
    setSubmittingPayout(true);
    try {
      // Extract equipment provider user ID properly
      const providerUserId = (selectedPayment as any).packageId?.createdBy?._id;
      
      if (!providerUserId) {
        throw new Error('Equipment provider user ID not found');
      }

      await AdminService.recordPayout({
        recipientType: 'equipment',
        recipientId: providerUserId,
        bookingId: (selectedPayment as any)._id,
        grossAmount: selectedPayment.totalPrice || 0,
        commissionPercentage: commission,
        method: 'manual',
        reference: payoutRef,
        notes: payoutNote,
        currency: 'KWD',
      });
      
      setShowPayoutModal(false);
      setPayoutNote('');
      setPayoutRef('');
      
      // Refresh the payments list to show updated status
      await fetchPayments();
    } catch (e) {
      console.error('Payout failed', e);
      alert('Failed to record payout. Please try again.');
    } finally {
      setSubmittingPayout(false);
    }
  };

  const calculateRentalDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProviderInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
  };

  const getProviderDisplayName = (provider: any) => {
    const companyName = provider.roleProfile?.companyName || provider.companyName;
    if (companyName) return companyName;
    return `${provider.firstName} ${provider.lastName}`;
  };

  // Prefer profile image from roleProfile, then fallback to direct profileImage/avatar
  const getProviderImage = (provider?: any): string | undefined => {
    if (!provider) return undefined;
    return (
      provider.roleProfile?.profileImage ||
      provider.profileImage ||
      provider.avatar ||
      undefined
    );
  };

  // Ensure relative paths become absolute using NEXT_PUBLIC_API_URL
  const normalizeImageUrl = (url?: string) => {
    if (!url || typeof url !== 'string') return undefined;
    if (/^https?:\/\//i.test(url)) return url;
    const base = process.env.NEXT_PUBLIC_API_URL || '';
    // Avoid double slashes
    return `${base.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
  };

  // Stable key for rows, including expanded combined items without _id
  const getPaymentRowKey = (payment: any, idx: number) => {
    return (
      payment?._id ||
      (payment?.packageId?._id
        ? `${payment.packageId._id}-${payment.createdAt || payment.displayDate || idx}`
        : `row-${idx}`)
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="mb-4 sm:mb-0">
          <h2 className="text-xl font-semibold text-gray-900">Equipment Provider Payment Management</h2>
          <p className="mt-1 text-sm text-gray-700">
            Track and manage payments to equipment providers
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </button>
      </div>

      {/* Commission Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-3 sm:mb-0">
            <h3 className="text-sm font-medium text-gray-900">Commission Percentage (Equipment)</h3>
            <p className="text-xs text-gray-500">Applies to net payout calculations for equipment providers</p>
          </div>
          <button
            onClick={saveCommission}
            disabled={savingCommission}
            className="px-3 py-1.5 text-sm rounded-md bg-indigo-600 text-white disabled:opacity-50 self-end sm:self-auto"
          >
            {savingCommission ? 'Saving…' : 'Save'}
          </button>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={30}
            step={0.5}
            value={isNaN(commission) ? 0 : commission}
            onChange={(e) => setCommission(parseFloat(e.target.value))}
            className="w-full"
          />
          <span className="w-16 text-right text-sm font-medium text-gray-900">{(isNaN(commission) ? 0 : commission).toFixed(1)}%</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Payout Modal */}
      {showPayoutModal && selectedPayment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Record Payout</h3>
                <button onClick={() => setShowPayoutModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600">Gross Amount</label>
                    <div className="text-sm font-medium">{formatCurrency(selectedPayment.totalPrice)}</div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Net (after {commission}%)</label>
                    <div className="text-sm font-medium text-green-600">{formatCurrency(netFor(selectedPayment.totalPrice))}</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600">Reference (optional)</label>
                    <input value={payoutRef} onChange={(e) => setPayoutRef(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Notes</label>
                    <input value={payoutNote} onChange={(e) => setPayoutNote(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setShowPayoutModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">Cancel</button>
                <button onClick={submitPayout} disabled={submittingPayout} className="px-4 py-2 bg-green-600 text-white rounded-md disabled:opacity-50">{submittingPayout ? 'Recording...' : 'Record Payout'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-3">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <div className="ml-3 w-0 flex-1">
                <dl>
                  <dt className="text-xs font-medium text-gray-500 truncate">
                    Total Earnings
                  </dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {formatCurrency(stats.totalEarnings)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-3">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-gray-400" />
              </div>
              <div className="ml-3 w-0 flex-1">
                <dl>
                  <dt className="text-xs font-medium text-gray-500 truncate">
                    Total Rentals
                  </dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {stats.count}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-3">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <div className="ml-3 w-0 flex-1">
                <dl>
                  <dt className="text-xs font-medium text-gray-500 truncate">
                    Avg Rental
                  </dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {formatCurrency(stats.averagePayment)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-3">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3 w-0 flex-1">
                <dl>
                  <dt className="text-xs font-medium text-gray-500 truncate">
                    Success Rate
                  </dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {stats.count > 0 ? Math.round((stats.paidCount / stats.count) * 100) : 0}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label htmlFor="search" className="block text-xs font-medium text-gray-700 mb-1">
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
                  className="pl-10 w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="status" className="block text-xs font-medium text-gray-700 mb-1">
                Payment Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div>
              <label htmlFor="startDate" className="block text-xs font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={dateFilter.start}
                onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-xs font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={dateFilter.end}
                onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </form>
      </div>

      {/* Mobile Card Layout & Desktop Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div className="space-y-2 p-3">
            {payments.map((payment, idx) => (
              <div
                key={getPaymentRowKey(payment, idx)}
                className="border border-gray-200 rounded-lg p-3 space-y-2"
              >
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex-shrink-0">
                      {getProviderImage(payment.packageId?.createdBy) ? (
                        <img
                          className="h-8 w-8 rounded-full object-cover"
                          src={getProviderImage(payment.packageId?.createdBy) as string}
                          alt={getProviderDisplayName(payment.packageId.createdBy)}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
                            if (nextSibling) nextSibling.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center ${getProviderImage(payment.packageId?.createdBy) ? 'hidden' : ''}`}>
                        <span className="text-white text-xs font-medium">
                          {getProviderInitials(payment.packageId?.createdBy?.firstName || '', payment.packageId?.createdBy?.lastName || '')}
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {getProviderDisplayName(payment.packageId?.createdBy)}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {payment.packageId?.name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleRowExpansion(getPaymentRowKey(payment, idx))}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {expandedRows.has(getPaymentRowKey(payment, idx)) ? 
                      <ChevronDown className="w-4 h-4" /> : 
                      <ChevronRight className="w-4 h-4" />
                    }
                  </button>
                </div>

                {/* Summary Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="text-sm font-medium">{formatCurrency(payment.totalPrice).replace('KWD', '').trim()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Net</p>
                      <p className="text-sm font-medium text-green-600">{formatCurrency(netFor(payment.totalPrice)).replace('KWD', '').trim()}</p>
                    </div>
                  </div>
                  <div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                      resolveStatus(payment as any) === 'paid' ? 'bg-green-50 border-green-200 text-green-700' :
                      resolveStatus(payment as any) === 'pending' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                      resolveStatus(payment as any) === 'failed' ? 'bg-red-50 border-red-200 text-red-700' :
                      'bg-gray-50 border-gray-200 text-gray-700'
                    }`}>
                      {resolveStatus(payment as any) === 'paid' ? '✓ Paid' :
                       resolveStatus(payment as any) === 'pending' ? '⏳ Pending' :
                       resolveStatus(payment as any) === 'failed' ? '✗ Failed' : 'Unknown'}
                    </span>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedRows.has(getPaymentRowKey(payment, idx)) && (
                  <div className="border-t border-gray-100 pt-2 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-gray-500">Customer</p>
                        <p className="font-medium">{payment.userDetails?.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Duration</p>
                        <p className="font-medium">{calculateRentalDays(payment.startDate, payment.endDate)} days</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Start</p>
                        <p className="font-medium">{new Date(payment.startDate).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">End</p>
                        <p className="font-medium">{new Date(payment.endDate).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</p>
                      </div>
                    </div>
                    
                    {(payment as any).payout && (
                      <div className="bg-green-50 border border-green-200 rounded p-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-green-700 text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Paid out {formatCurrency(((payment as any).payout?.netAmount ?? netFor(payment.totalPrice)) as number).replace('KWD', '').trim()}
                          </div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            ((payment as any).payout?.payoutStatus || 'paid') === 'paid' ? 'bg-green-100 text-green-800 border border-green-300' :
                            ((payment as any).payout?.payoutStatus || 'paid') === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                            ((payment as any).payout?.payoutStatus || 'paid') === 'failed' ? 'bg-red-100 text-red-800 border border-red-300' :
                            'bg-gray-100 text-gray-800 border border-gray-300'
                          }`}>
                            {((payment as any).payout?.payoutStatus || 'paid') === 'paid' ? '✓ Paid' :
                             ((payment as any).payout?.payoutStatus || 'paid') === 'pending' ? '⏳ Pending' :
                             ((payment as any).payout?.payoutStatus || 'paid') === 'failed' ? '✗ Failed' : 
                             ((payment as any).payout?.payoutStatus || 'paid')}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2 pt-1">
                      <button
                        onClick={() => {
                          setSelectedPayment(payment);
                          setShowDetailsModal(true);
                        }}
                        className="flex-1 text-indigo-600 hover:text-indigo-900 inline-flex items-center justify-center py-1.5 text-sm border border-indigo-200 rounded-md"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </button>
                      <button 
                        onClick={() => openPayout(payment)} 
                        className="flex-1 text-green-600 hover:text-green-800 inline-flex items-center justify-center py-1.5 text-sm border border-green-200 rounded-md"
                      >
                        <DollarSign className="w-3 h-3 mr-1" />
                        {(payment as any).payout ? 'Edit' : 'Payout'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Table Layout */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                  Provider
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">
                  Package
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Customer
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Period
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  Gross
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  Net
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  Status
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Payout
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment, idx) => (
                <tr
                  key={
                    (payment as any)._id ||
                    ((payment as any).packageId?._id
                      ? `${(payment as any).packageId._id}-${(payment as any).createdAt || (payment as any).displayDate || idx}`
                      : `row-${idx}`)
                  }
                  className="hover:bg-gray-50"
                >
                  <td className="px-2 py-2 whitespace-nowrap w-40">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-6 w-6">
                        {getProviderImage(payment.packageId?.createdBy) ? (
                          <img
                            className="h-6 w-6 rounded-full object-cover"
                            src={getProviderImage(payment.packageId?.createdBy) as string}
                            alt={getProviderDisplayName(payment.packageId.createdBy)}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
                              if (nextSibling) nextSibling.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`h-6 w-6 rounded-full bg-indigo-500 flex items-center justify-center ${getProviderImage(payment.packageId?.createdBy) ? 'hidden' : ''}`}>
                          <span className="text-white text-xs font-medium">
                            {getProviderInitials(payment.packageId?.createdBy?.firstName || '', payment.packageId?.createdBy?.lastName || '')}
                          </span>
                        </div>
                      </div>
                      <div className="ml-2 min-w-0">
                        <div className="text-xs font-medium text-gray-900 truncate max-w-[6rem]">
                          {getProviderDisplayName(payment.packageId?.createdBy)}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-[6rem]">
                          {payment.packageId?.createdBy?.firstName} {payment.packageId?.createdBy?.lastName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap w-36">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-6 w-6">
                        {payment.packageId?.coverImage ? (
                          <img
                            className="h-6 w-6 rounded object-cover"
                            src={payment.packageId.coverImage}
                            alt={payment.packageId.name}
                          />
                        ) : (
                          <div className="h-6 w-6 rounded bg-gray-200 flex items-center justify-center">
                            <Package className="h-3 w-3 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-2 min-w-0">
                        <div className="text-xs font-medium text-gray-900 truncate max-w-[5rem]">
                          {payment.packageId?.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Equipment
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap w-32">
                    <div className="text-xs text-gray-900 truncate max-w-[5rem]">
                      {payment.userDetails?.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate max-w-[5rem]">
                      {payment.userDetails?.email}
                    </div>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap w-24">
                    <div className="text-xs text-gray-900">
                      {new Date(payment.startDate).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {calculateRentalDays(payment.startDate, payment.endDate)}d
                    </div>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-right w-20">
                    <div className="text-xs font-medium text-gray-900">{formatCurrency(payment.totalPrice).replace('KWD', '').trim()}</div>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap w-20">
                    <div className="text-xs font-medium text-green-600">{formatCurrency(netFor(payment.totalPrice)).replace('KWD', '').trim()}</div>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap w-20">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium border ${
                      resolveStatus(payment as any) === 'paid' ? 'bg-green-50 border-green-200 text-green-700' :
                      resolveStatus(payment as any) === 'pending' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                      resolveStatus(payment as any) === 'failed' ? 'bg-red-50 border-red-200 text-red-700' :
                      'bg-gray-50 border-gray-200 text-gray-700'
                    }`}>
                      {resolveStatus(payment as any) === 'paid' ? '✓' :
                       resolveStatus(payment as any) === 'pending' ? '⏳' :
                       resolveStatus(payment as any) === 'failed' ? '✗' : '?'}
                    </span>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap w-24">
                    {(payment as any).payout ? (
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium border ${
                        ((payment as any).payout?.payoutStatus || 'paid') === 'paid' ? 'bg-green-50 border-green-200 text-green-700' :
                        ((payment as any).payout?.payoutStatus || 'paid') === 'pending' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                        ((payment as any).payout?.payoutStatus || 'paid') === 'failed' ? 'bg-red-50 border-red-200 text-red-700' :
                        'bg-gray-50 border-gray-200 text-gray-700'
                      }`}>
                        {((payment as any).payout?.payoutStatus || 'paid') === 'paid' ? '✓ Paid' :
                         ((payment as any).payout?.payoutStatus || 'paid') === 'pending' ? '⏳ Pending' :
                         ((payment as any).payout?.payoutStatus || 'paid') === 'failed' ? '✗ Failed' : 
                         ((payment as any).payout?.payoutStatus || 'paid')}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-center w-16">
                    <div className="flex justify-center space-x-1">
                      <button
                        onClick={() => {
                          setSelectedPayment(payment);
                          setShowDetailsModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                        title="View Details"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => openPayout(payment)} 
                        className="text-green-600 hover:text-green-800 inline-flex items-center"
                        title="Record Payout"
                      >
                        <DollarSign className="w-3 h-3" />
                      </button>
                    </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                    <p className="text-sm text-gray-900 break-all">{selectedPayment._id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Payment Status</label>
                    <div className="mt-1">
                      {getPaymentStatusBadge(selectedPayment.paymentStatus)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <div className="sm:col-span-2">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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