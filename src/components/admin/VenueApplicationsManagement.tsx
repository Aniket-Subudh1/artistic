// src/components/admin/VenueApplicationsManagement.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { VenueApplicationService } from '@/services/venue-application.service';
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle,
  Download,
  FileText,
  Image as ImageIcon,
  Mail,
  Phone,
  Search,
  XCircle,
  Eye,
} from 'lucide-react';

type VenueApplication = {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  venue: string;
  ownerDescription?: string;
  companyName: string;
  licenseUrl?: string;
  venueImageUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
};

export function VenueApplicationsManagement() {
  const [items, setItems] = useState<VenueApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('all');
  const [selected, setSelected] = useState<VenueApplication | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await VenueApplicationService.listApplications();
      // Accept either {count,data} or raw array
      const data: VenueApplication[] = Array.isArray(res) ? res : res.data || [];
      setItems(data);
    } catch (e: any) {
      setError('Failed to load venue applications: ' + (e.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let list = items;
    if (status !== 'all') list = list.filter((i) => i.status === status);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.email.toLowerCase().includes(q) ||
          i.venue.toLowerCase().includes(q) ||
          i.companyName.toLowerCase().includes(q),
      );
    }
    return list;
  }, [items, search, status]);

  const pendingCount = items.filter((i) => i.status === 'PENDING').length;
  const approvedCount = items.filter((i) => i.status === 'APPROVED').length;
  const rejectedCount = items.filter((i) => i.status === 'REJECTED').length;

  const getStatusBadge = (value: VenueApplication['status']) => {
    const map = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    } as const;
    const label = value.charAt(0) + value.slice(1).toLowerCase();
    const Icon = value === 'PENDING' ? Calendar : value === 'APPROVED' ? CheckCircle : XCircle;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map[value]}`}>
        <Icon className="w-3 h-3 mr-1" /> {label}
      </span>
    );
  };

  const approveReject = async (id: string, approve: boolean) => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await VenueApplicationService.reviewApplication(id, approve);
      setSuccess(res.message || (approve ? 'Application approved' : 'Application rejected'));
      setReviewOpen(false);
      setSelected(null);
      await load();
    } catch (e: any) {
      setError('Failed to update application: ' + (e.message || 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Venue Applications</h1>
          <p className="text-gray-600">Review and manage venue provider applications</p>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <div className="flex items-center space-x-1"><div className="w-3 h-3 bg-yellow-400 rounded-full" /> <span>Pending: {pendingCount}</span></div>
          <div className="flex items-center space-x-1"><div className="w-3 h-3 bg-green-400 rounded-full" /> <span>Approved: {approvedCount}</span></div>
          <div className="flex items-center space-x-1"><div className="w-3 h-3 bg-red-400 rounded-full" /> <span>Rejected: {rejectedCount}</span></div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, venue or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="all">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((app) => (
                  <tr key={app._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">{app.name.split(' ').map(n => n.charAt(0)).join('').substring(0,2)}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{app.name}</div>
                          <div className="text-sm text-gray-500 flex items-center"><Mail className="w-3 h-3 mr-1" />{app.email}</div>
                          <div className="text-sm text-gray-500 flex items-center"><Phone className="w-3 h-3 mr-1" />{app.phoneNumber}</div>
                          <div className="text-xs text-gray-500">{app.companyName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900"><Building2 className="w-4 h-4 mr-1" />{app.venue}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(app.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center"><Calendar className="w-3 h-3 mr-1" />{new Date(app.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button onClick={() => { setSelected(app); setReviewOpen(true); }} className="text-purple-600 hover:text-purple-900 flex items-center"><Eye className="w-4 h-4 mr-1" />Review</button>
                        {app.licenseUrl && (
                          <a href={app.licenseUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-900 flex items-center"><Download className="w-4 h-4 mr-1" />License</a>
                        )}
                        {app.venueImageUrl && (
                          <a href={app.venueImageUrl} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-900 flex items-center"><ImageIcon className="w-4 h-4 mr-1" />Image</a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewOpen && selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Review Venue Application</h2>
              <p className="text-gray-600 mt-1">Application from {selected.name}</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900">{selected.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{selected.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-gray-900">{selected.phoneNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company</label>
                  <p className="text-gray-900">{selected.companyName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Venue</label>
                  <p className="text-gray-900">{selected.venue}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">{getStatusBadge(selected.status)}</div>
                </div>
              </div>

              {selected.ownerDescription && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">About the Owner</label>
                  <div className="text-gray-900 whitespace-pre-wrap">{selected.ownerDescription}</div>
                </div>
              )}

              <div className="flex gap-4 flex-wrap">
                {selected.licenseUrl && (
                  <a href={selected.licenseUrl} target="_blank" className="inline-flex items-center px-3 py-2 border rounded-lg text-blue-700 border-blue-200 hover:bg-blue-50">
                    <Download className="w-4 h-4 mr-2" /> View License
                  </a>
                )}
                {selected.venueImageUrl && (
                  <a href={selected.venueImageUrl} target="_blank" className="inline-flex items-center px-3 py-2 border rounded-lg text-green-700 border-green-200 hover:bg-green-50">
                    <ImageIcon className="w-4 h-4 mr-2" /> View Venue Image
                  </a>
                )}
              </div>

              {selected.status === 'PENDING' ? (
                <div className="flex gap-4">
                  <button
                    onClick={() => approveReject(selected._id, true)}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? 'Approving…' : 'Approve'}
                  </button>
                  <button
                    onClick={() => approveReject(selected._id, false)}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? 'Rejecting…' : 'Reject'}
                  </button>
                </div>
              ) : (
                <div className={`p-4 rounded-lg ${selected.status === 'APPROVED' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center gap-2">
                    {selected.status === 'APPROVED' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className={`font-medium ${selected.status === 'APPROVED' ? 'text-green-800' : 'text-red-800'}`}>This application has been {selected.status}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200">
              <div className="flex gap-4">
                <button onClick={() => { setReviewOpen(false); setSelected(null); }} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
