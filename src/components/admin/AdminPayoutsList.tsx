"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Download, Filter, User, Building2, CalendarDays, Hash, Eye, X } from 'lucide-react';
import { AdminService } from '@/services/admin.service';

interface PayoutItem {
  _id: string;
  recipientType: 'artist' | 'equipment';
  recipientId?: string;
  recipientName?: string;
  profileImage?: string;
  bookingId?: string;
  grossAmount: number;
  commissionPercentage?: number;
  commissionAmount?: number;
  netAmount?: number;
  method?: string;
  reference?: string;
  notes?: string;
  status?: string;
  payoutStatus?: 'pending' | 'paid' | 'failed' | 'cancelled';
  currency?: string;
  createdAt: string;
  recipientDetails?: {
    email?: string;
    phone?: string;
    type?: string;
    artistType?: string;
    companyName?: string;
    stageName?: string;
  };
}

export default function AdminPayoutsList() {
  const [items, setItems] = useState<PayoutItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [recipientType, setRecipientType] = useState<'all' | 'artist' | 'equipment'>('all');
  const [pagination, setPagination] = useState({ current: 1, total: 1, count: 0, perPage: 20 });
  const [selectedPayout, setSelectedPayout] = useState<PayoutItem | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    load();
  }, [recipientType, pagination.current]);

  const load = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res: any = await AdminService.listPayouts({
        recipientType: recipientType === 'all' ? undefined : (recipientType as 'artist' | 'equipment'),
        page: pagination.current,
        limit: pagination.perPage,
      });
      setItems(res?.payouts || res?.items || []);
      setPagination(res?.pagination || pagination);
    } catch (e) {
      console.error('Failed to load payouts', e);
      setError('Failed to load payouts');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency = 'KWD') =>
    new Intl.NumberFormat('en-KW', { style: 'currency', currency }).format(amount || 0);

  const csv = useMemo(() => {
    const header = [
      'id','recipientType','recipientName','recipientId','bookingId','grossAmount','commissionPercentage','commissionAmount','netAmount','method','payoutStatus','reference','currency','createdAt'
    ];
    const rows = items.map(i => [
      i._id,
      i.recipientType,
      i.recipientName || (i as any).recipientName || '',
      i.recipientId || '',
      i.bookingId || '',
      String(i.grossAmount ?? ''),
      String(i.commissionPercentage ?? ''),
      String(i.commissionAmount ?? ''),
      String(i.netAmount ?? ''),
      i.method || '',
      i.payoutStatus || 'paid',
      i.reference || '',
      i.currency || 'KWD',
      i.createdAt
    ]);
    return [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  }, [items]);

  const downloadCSV = () => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payouts_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Recorded Payouts</h2>
          <p className="text-sm text-gray-600">All manual payouts recorded across artists and equipment providers</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={recipientType}
            onChange={(e) => { setRecipientType(e.target.value as any); setPagination(p => ({ ...p, current: 1 })); }}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">All recipients</option>
            <option value="artist">Artists</option>
            <option value="equipment">Equipment providers</option>
          </select>
          <button onClick={downloadCSV} className="inline-flex items-center px-3 py-2 rounded-md bg-indigo-600 text-white text-sm">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">{error}</div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedPayout && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Payout Details</h3>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Recipient Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Recipient Information</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Type</p>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedPayout.recipientType === 'artist' ? 
                        <User className="w-4 h-4 text-blue-500"/> : 
                        <Building2 className="w-4 h-4 text-purple-500"/>
                      }
                      <span className="text-sm font-medium capitalize">{selectedPayout.recipientType}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="text-sm font-medium mt-1">{selectedPayout.recipientName || 'N/A'}</p>
                  </div>
                  {selectedPayout.recipientDetails?.email && (
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm mt-1">{selectedPayout.recipientDetails.email}</p>
                    </div>
                  )}
                  {selectedPayout.recipientDetails?.phone && (
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm mt-1">{selectedPayout.recipientDetails.phone}</p>
                    </div>
                  )}
                  {selectedPayout.recipientDetails?.artistType && (
                    <div>
                      <p className="text-xs text-gray-500">Artist Type</p>
                      <p className="text-sm mt-1">{selectedPayout.recipientDetails.artistType}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Financial Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b border-blue-100">
                    <span className="text-sm text-gray-600">Gross Amount</span>
                    <span className="text-sm font-semibold">{formatCurrency(selectedPayout.grossAmount, selectedPayout.currency)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-blue-100">
                    <span className="text-sm text-gray-600">Commission Rate</span>
                    <span className="text-sm font-medium text-orange-600">{(selectedPayout.commissionPercentage ?? 0).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-blue-100">
                    <span className="text-sm text-gray-600">Commission Amount</span>
                    <span className="text-sm font-medium text-red-600">-{formatCurrency(selectedPayout.commissionAmount ?? (selectedPayout.grossAmount * (selectedPayout.commissionPercentage ?? 0)/100), selectedPayout.currency)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 bg-green-50 rounded px-2">
                    <span className="text-sm font-medium text-gray-700">Net Payout</span>
                    <span className="text-base font-bold text-green-600">{formatCurrency(selectedPayout.netAmount ?? (selectedPayout.grossAmount * (1 - (selectedPayout.commissionPercentage ?? 0)/100)), selectedPayout.currency)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Payment Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Method</p>
                    <p className="text-sm font-medium mt-1 capitalize">{selectedPayout.method || 'manual'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Payout Status</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                      (selectedPayout.payoutStatus || 'paid') === 'paid' ? 'bg-green-50 text-green-700 border border-green-200' :
                      (selectedPayout.payoutStatus || 'paid') === 'pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                      (selectedPayout.payoutStatus || 'paid') === 'failed' ? 'bg-red-50 text-red-700 border border-red-200' :
                      'bg-gray-50 text-gray-700 border border-gray-200'
                    }`}>
                      {(selectedPayout.payoutStatus || 'paid') === 'paid' ? '✓ Paid' :
                       (selectedPayout.payoutStatus || 'paid') === 'pending' ? '⏳ Pending' :
                       (selectedPayout.payoutStatus || 'paid') === 'failed' ? '✗ Failed' : 
                       (selectedPayout.payoutStatus || 'paid')}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Reference</p>
                    <p className="text-sm mt-1">{selectedPayout.reference || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Booking ID</p>
                    <p className="text-sm font-mono mt-1">{selectedPayout.bookingId?.slice(-8) || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="text-sm mt-1">{new Date(selectedPayout.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                {selectedPayout.notes && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500">Notes</p>
                    <p className="text-sm mt-1 bg-white p-2 rounded border border-gray-200">{selectedPayout.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><Hash className="inline w-3 h-3 mr-1"/> ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gross</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Paid</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payout Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><CalendarDays className="inline w-3 h-3 mr-1"/> Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((i) => (
                <tr key={i._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-600 font-mono">{i._id.slice(-8)}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {i.recipientType === 'artist' ? <User className="w-4 h-4 text-blue-500"/> : <Building2 className="w-4 h-4 text-purple-500"/>}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{i.recipientName || '-'}</div>
                        <div className="text-xs text-gray-500 capitalize">{i.recipientType}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(i.grossAmount, i.currency)}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="text-sm text-orange-600 font-medium">{(i.commissionPercentage ?? 0).toFixed(1)}%</div>
                    <div className="text-xs text-gray-500">-{formatCurrency(i.commissionAmount ?? (i.grossAmount * (i.commissionPercentage ?? 0)/100), i.currency)}</div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-bold text-green-600">{formatCurrency(i.netAmount ?? (i.grossAmount * (1 - (i.commissionPercentage ?? 0)/100)), i.currency)}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 capitalize">
                      {i.method || 'manual'}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      (i.payoutStatus || 'paid') === 'paid' ? 'bg-green-50 text-green-700 border border-green-200' :
                      (i.payoutStatus || 'paid') === 'pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                      (i.payoutStatus || 'paid') === 'failed' ? 'bg-red-50 text-red-700 border border-red-200' :
                      'bg-gray-50 text-gray-700 border border-gray-200'
                    }`}>
                      {(i.payoutStatus || 'paid') === 'paid' ? '✓ Paid' :
                       (i.payoutStatus || 'paid') === 'pending' ? '⏳ Pending' :
                       (i.payoutStatus || 'paid') === 'failed' ? '✗ Failed' : 
                       (i.payoutStatus || 'paid')}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{new Date(i.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedPayout(i);
                        setShowDetailsModal(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-600">Showing {(pagination.current - 1) * pagination.perPage + 1} to {Math.min(pagination.current * pagination.perPage, pagination.count)} of {pagination.count} payouts</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPagination(p => ({ ...p, current: Math.max(1, p.current - 1) }))} disabled={pagination.current <= 1} className="px-3 py-1.5 border rounded disabled:opacity-50">Prev</button>
            <div className="text-sm">Page {pagination.current} / {pagination.total}</div>
            <button onClick={() => setPagination(p => ({ ...p, current: Math.min(p.total, p.current + 1) }))} disabled={pagination.current >= pagination.total} className="px-3 py-1.5 border rounded disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
