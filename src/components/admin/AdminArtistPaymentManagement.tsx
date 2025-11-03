'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  Eye,
  DollarSign,
  Calendar,
  User,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Users,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { AdminService } from '@/services/admin.service';

interface ArtistPayment {
  _id: string;
  artistBookingId?: {
    _id: string;
    artistId: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
      profilePicture?: string;
      roleProfile: {
        _id: string;
        stageName: string;
        artistType: string;
        about: string;
        pricePerHour: number;
        profileImage?: string;
      };
    };
    price: number;
  };
  bookedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  date: string;
  totalPrice: number;
  status?: string;
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

export default function AdminArtistPaymentManagement() {
  const [payments, setPayments] = useState<ArtistPayment[]>([]);
  const [commission, setCommission] = useState<number>(10);
  const [savingCommission, setSavingCommission] = useState(false);
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

  const [selectedPayment, setSelectedPayment] = useState<ArtistPayment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutNote, setPayoutNote] = useState('');
  const [payoutRef, setPayoutRef] = useState('');
  const [submittingPayout, setSubmittingPayout] = useState(false);
  const [audits, setAudits] = useState<any[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Normalize relative image paths to absolute using NEXT_PUBLIC_API_URL
  const normalizeImageUrl = (url?: string) => {
    if (!url || typeof url !== 'string') return undefined;
    if (/^https?:\/\//i.test(url)) return url;
    const base = process.env.NEXT_PUBLIC_API_URL || '';
    return `${base.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
  };

  useEffect(() => {
    fetchPayments();
    fetchCommission();
    fetchAudits();
  }, [pagination.current, statusFilter, searchTerm, dateFilter]);

  const resolveStatus = (p: any): string => {
    // If payout exists, consider it paid
    if (p?.payout) return 'paid';
    
    const raw = p?.status || p?.paymentStatus || p?.transactionStatus || p?.payment?.status;
    const normalized = (raw ?? '').toString().trim().toLowerCase();
    if ([
      'paid',
      'success',
      'succeeded',
      'completed',
      'confirmed'
    ].includes(normalized)) return 'paid';
    if ([
      'pending',
      'processing',
      'in_progress'
    ].includes(normalized)) return 'pending';
    if ([
      'failed',
      'declined',
      'canceled',
      'cancelled',
      'error'
    ].includes(normalized)) return 'failed';
    if ([
      'refunded',
      'refund'
    ].includes(normalized)) return 'refunded';
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

      const response = await AdminService.getArtistPayments(filters);
      
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
      console.error('Error fetching artist payments:', err);
      setError('Failed to fetch artist payments');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCommission = async () => {
    try {
      const res = await AdminService.getCommissionSetting('artist');
      if (typeof (res as any)?.percentage === 'number') setCommission((res as any).percentage);
    } catch (e) {}
  };

  const saveCommission = async () => {
    try {
      setSavingCommission(true);
      await AdminService.updateCommissionSetting({ scope: 'artist', percentage: commission });
      await fetchAudits();
    } catch (e) {
      console.error('Failed to save commission', e);
    } finally {
      setSavingCommission(false);
    }
  };

  const fetchAudits = async () => {
    try {
      const res: any = await AdminService.listPaymentAudits({ page: 1, limit: 10 });
      setAudits(res?.audits || []);
    } catch (e) {}
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

  const netFor = (gross: number) => {
    const pct = isNaN(commission) ? 0 : commission;
    return Math.max(0, gross * (1 - pct / 100));
  };

  // Helper functions for artist data access
  const getArtistInfo = (payment: any) => {
    const booked = payment?.artistBookingId?.bookedArtist;
    const artist = payment?.artistBookingId?.artistId || payment?.artist;
    const profile = booked?.roleProfile || artist?.roleProfile || payment?.artistProfile;
    
    let rawImage: any =
      payment?.artistBookingId?.artistId?.roleProfile?.profileImage ||
      payment?.artistBookingId?.artistId?.profileImage ||
      profile?.profileImage ||
      payment?.artistProfile?.profileImage ||
      payment?.artist?.roleProfile?.profileImage ||
      artist?.roleProfile?.profileImage ||
      artist?.profileImage ||
      booked?.roleProfile?.profileImage ||
      booked?.profileImage ||
      artist?.profilePicture ||
      booked?.profilePicture;

    // Some APIs may send an object/array; extract a string if present
    if (rawImage && typeof rawImage !== 'string') {
      if (Array.isArray(rawImage)) rawImage = rawImage.find((v) => typeof v === 'string');
      else if (typeof rawImage === 'object' && 'url' in rawImage && typeof rawImage.url === 'string') rawImage = rawImage.url;
      else rawImage = undefined;
    }
    const resolvedImage = normalizeImageUrl(rawImage);

    return {
      // Prioritize profileImage from ArtistProfile schema, only fallback to User profilePicture if absolutely necessary
      profileImage: resolvedImage,
      stageName: profile?.stageName,
      firstName: booked?.firstName || artist?.firstName,
      lastName: booked?.lastName || artist?.lastName,
      artistType: profile?.artistType,
      email: booked?.email || artist?.email
    };
  };

  const getArtistInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0)?.toUpperCase() || ''}${lastName?.charAt(0)?.toUpperCase() || ''}`;
  };

  const getArtistDisplayName = (artistInfo: any) => {
    if (artistInfo.stageName) return artistInfo.stageName;
    return [artistInfo.firstName, artistInfo.lastName].filter(Boolean).join(' ') || 'N/A';
  };

  const openPayout = (payment: any) => {
    setSelectedPayment(payment);
    // Prefill from existing payout if present
    if (payment?.payout) {
      setPayoutNote(payment.payout.notes || '');
      setPayoutRef(payment.payout.reference || '');
      if (typeof payment.payout.commissionPercentage === 'number') {
        setCommission(payment.payout.commissionPercentage);
      }
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
      // Extract artist user ID properly
      const artistUserId = (selectedPayment as any).artistBookingId?.artistId?._id || 
                          (selectedPayment as any).artistBookingId?.bookedArtist?._id ||
                          (selectedPayment as any).artist?._id;
      
      if (!artistUserId) {
        throw new Error('Artist user ID not found');
      }

      await AdminService.recordPayout({
        recipientType: 'artist',
        recipientId: artistUserId,
        bookingId: (selectedPayment as any)._id,
        grossAmount: selectedPayment.totalPrice || (selectedPayment as any).artistBookingId?.price || 0,
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
      await fetchAudits();
    } catch (e) {
      console.error('Payout failed', e);
      alert('Failed to record payout. Please try again.');
    } finally {
      setSubmittingPayout(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-3 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Artist Payment Management</h2>
          <p className="mt-1 text-sm text-gray-700">
            Track and manage payments to artists
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 self-start sm:self-auto"
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Commission Settings + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <div className="bg-white overflow-hidden shadow rounded-lg lg:col-span-2">
          <div className="p-3">
            <h3 className="text-sm font-medium text-gray-700">Artist Commission</h3>
            <p className="text-xs text-gray-500 mb-2">Percentage deducted from each payment</p>
            <div className="flex items-center gap-3">
              <input type="range" min={0} max={30} value={commission} onChange={(e) => setCommission(Number(e.target.value))} className="w-full" />
              <div className="w-12 text-right font-semibold text-sm">{commission}%</div>
            </div>
            <div className="mt-2 flex justify-end">
              <button onClick={saveCommission} disabled={savingCommission} className="px-3 py-1.5 text-xs rounded-md bg-indigo-600 text-white disabled:opacity-50">
                {savingCommission ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
        
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
                    Transactions
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
                Search Artists
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by artist name, email..."
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
            {payments.map((payment) => (
              <div key={payment._id} className="border border-gray-200 rounded-lg p-3 space-y-2">
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex-shrink-0">
                      {(() => {
                        const artistInfo = getArtistInfo(payment);
                        if (artistInfo.profileImage) {
                          return (
                            <img
                              className="h-8 w-8 rounded-full object-cover"
                              src={artistInfo.profileImage}
                              alt={getArtistDisplayName(artistInfo)}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
                                if (nextSibling) nextSibling.classList.remove('hidden');
                              }}
                            />
                          );
                        }
                        return null;
                      })()}
                      <div className={`h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center ${(() => {
                        const artistInfo = getArtistInfo(payment);
                        return artistInfo.profileImage ? 'hidden' : '';
                      })()}`}>
                        <span className="text-white text-xs font-medium">
                          {(() => {
                            const artistInfo = getArtistInfo(payment);
                            return getArtistInitials(artistInfo.firstName, artistInfo.lastName);
                          })()}
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {getArtistDisplayName(getArtistInfo(payment))}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {getArtistInfo(payment).artistType || 'Artist'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleRowExpansion(payment._id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {expandedRows.has(payment._id) ? 
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
                      <p className="text-sm font-medium">{formatCurrency(payment.artistBookingId?.price || payment.totalPrice).replace('KWD', '').trim()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Net</p>
                      <p className="text-sm font-medium text-green-600">{formatCurrency(netFor(payment.artistBookingId?.price || payment.totalPrice)).replace('KWD', '').trim()}</p>
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
                {expandedRows.has(payment._id) && (
                  <div className="border-t border-gray-100 pt-2 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-gray-500">Customer</p>
                        <p className="font-medium">{payment.userDetails?.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Event Date</p>
                        <p className="font-medium">{new Date(payment.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Total Amount</p>
                        <p className="font-medium">{formatCurrency(payment.totalPrice).replace('KWD', '').trim()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Processed</p>
                        <p className="font-medium">{new Date(payment.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</p>
                      </div>
                    </div>
                    
                    {(payment as any).payout && (
                      <div className="bg-green-50 border border-green-200 rounded p-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-green-700 text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Paid out {formatCurrency(((payment as any).payout?.netAmount ?? netFor(payment.artistBookingId?.price || payment.totalPrice)) as number).replace('KWD', '').trim()}
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
                  Artist
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Customer
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Event Date
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
              {payments.map((payment) => (
                <tr key={payment._id} className="hover:bg-gray-50">
                  <td className="px-2 py-2 whitespace-nowrap w-40">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-6 w-6">
                        {(() => {
                          const artistInfo = getArtistInfo(payment);
                          if (artistInfo.profileImage) {
                            return (
                              <img
                                className="h-6 w-6 rounded-full object-cover"
                                src={artistInfo.profileImage}
                                alt={getArtistDisplayName(artistInfo)}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
                                  if (nextSibling) nextSibling.classList.remove('hidden');
                                }}
                              />
                            );
                          }
                          return null;
                        })()}
                        <div className={`h-6 w-6 rounded-full bg-purple-500 flex items-center justify-center ${(() => {
                          const artistInfo = getArtistInfo(payment);
                          return artistInfo.profileImage ? 'hidden' : '';
                        })()}`}>
                          <span className="text-white text-xs font-medium">
                            {(() => {
                              const artistInfo = getArtistInfo(payment);
                              return getArtistInitials(artistInfo.firstName, artistInfo.lastName);
                            })()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-2 min-w-0">
                        <div className="text-xs font-medium text-gray-900 truncate max-w-[6rem]">
                          {getArtistDisplayName(getArtistInfo(payment))}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-[6rem]">
                          {getArtistInfo(payment).artistType || 'Artist'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap w-32">
                    <div className="text-xs text-gray-900 truncate max-w-[5rem]">{payment.userDetails?.name}</div>
                    <div className="text-xs text-gray-500 truncate max-w-[5rem]">{payment.userDetails?.email}</div>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap w-24">
                    <div className="text-xs text-gray-900">
                      {new Date(payment.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-right w-20">
                    <div className="text-xs font-medium text-gray-900">
                      {formatCurrency(payment.artistBookingId?.price || payment.totalPrice).replace('KWD', '').trim()}
                    </div>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap w-20">
                    <div className="text-xs font-medium text-green-600">
                      {formatCurrency(netFor(payment.artistBookingId?.price || payment.totalPrice)).replace('KWD', '').trim()}
                    </div>
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

      {/* Finance Activity */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-3 py-2 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">Recent Finance Activity</h3>
        </div>
        <div className="p-3">
          {audits.length === 0 ? (
            <p className="text-sm text-gray-500">No recent activity</p>
          ) : (
            <ul className="divide-y space-y-1">
              {audits.map((a: any, idx: number) => (
                <li key={idx} className="py-1 text-sm text-gray-700 flex items-center justify-between">
                  <span className="capitalize text-xs">{String(a.action).replace('_', ' ')}</span>
                  <span className="text-gray-500 text-xs">{new Date(a.createdAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedPayment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Artist Payment Details
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
                      {getPaymentStatusBadge('paid')}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(selectedPayment.totalPrice)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date Processed</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedPayment.createdAt)}</p>
                  </div>
                </div>

                {/* Artist Details */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">Artist Details</h4>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex-shrink-0">
                      {(() => {
                        const artistInfo = getArtistInfo(selectedPayment);
                        if (artistInfo.profileImage) {
                          return (
                            <img
                              className="h-16 w-16 rounded-full object-cover"
                              src={artistInfo.profileImage}
                              alt={getArtistDisplayName(artistInfo)}
                            />
                          );
                        }
                        return (
                          <div className="h-16 w-16 rounded-full bg-purple-500 flex items-center justify-center">
                            <span className="text-white text-lg font-medium">
                              {getArtistInitials(artistInfo.firstName, artistInfo.lastName)}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                    <div>
                      <h5 className="text-lg font-medium text-gray-900">
                        {getArtistDisplayName(getArtistInfo(selectedPayment))}
                      </h5>
                      <p className="text-sm text-gray-500">
                        {getArtistInfo(selectedPayment).artistType || 'Artist'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Stage Name</label>
                      <p className="text-sm text-gray-900">
                        {getArtistInfo(selectedPayment).stageName || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Real Name</label>
                      <p className="text-sm text-gray-900">
                        {[getArtistInfo(selectedPayment).firstName, getArtistInfo(selectedPayment).lastName].filter(Boolean).join(' ') || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="text-sm text-gray-900">
                        {getArtistInfo(selectedPayment).email || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Artist Type</label>
                      <p className="text-sm text-gray-900">
                        {getArtistInfo(selectedPayment).artistType || 'N/A'}
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

                {/* Event Details */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">Event Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Event Date</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedPayment.date)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Artist Earnings</label>
                      <p className="text-sm font-medium text-green-600">
                        {formatCurrency(selectedPayment.artistBookingId?.price || selectedPayment.totalPrice)}
                      </p>
                    </div>
                  </div>
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

      {/* Record Payout Modal */}
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
                    <div className="text-sm font-medium">{formatCurrency(selectedPayment.artistBookingId?.price || selectedPayment.totalPrice)}</div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Net (after {commission}%)</label>
                    <div className="text-sm font-medium text-green-600">{formatCurrency(netFor(selectedPayment.artistBookingId?.price || selectedPayment.totalPrice))}</div>
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
    </div>
  );
}