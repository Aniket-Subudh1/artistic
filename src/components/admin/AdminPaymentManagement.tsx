'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Users,
  Building,
  Download,
  Calendar
} from 'lucide-react';
import { AdminService } from '@/services/admin.service';
import AdminArtistPaymentManagement from './AdminArtistPaymentManagement';
import AdminEquipmentProviderPaymentManagement from './AdminEquipmentProviderPaymentManagement';

interface PaymentStats {
  totalEarnings: number;
  count: number;
  averagePayment: number;
  paidCount: number;
  pendingCount: number;
  failedCount: number;
}

interface AggregatedStats {
  artist: PaymentStats;
  equipment: PaymentStats;
  combined: PaymentStats;
}

export function AdminPaymentManagement() {
  const [activeTab, setActiveTab] = useState<'artist-payments' | 'equipment-payments'>('artist-payments');
  const [aggregatedStats, setAggregatedStats] = useState<AggregatedStats>({
    artist: {
      totalEarnings: 0,
      count: 0,
      averagePayment: 0,
      paidCount: 0,
      pendingCount: 0,
      failedCount: 0
    },
    equipment: {
      totalEarnings: 0,
      count: 0,
      averagePayment: 0,
      paidCount: 0,
      pendingCount: 0,
      failedCount: 0
    },
    combined: {
      totalEarnings: 0,
      count: 0,
      averagePayment: 0,
      paidCount: 0,
      pendingCount: 0,
      failedCount: 0
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAggregatedStats();
  }, []);

  const fetchAggregatedStats = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Fetch both artist and equipment payment stats
      const [artistResponse, equipmentResponse] = await Promise.all([
        AdminService.getArtistPayments({ page: 1, limit: 1 }), // Just for stats
        AdminService.getEquipmentProviderPayments({ page: 1, limit: 1 }) // Just for stats
      ]);

      const artistStats: PaymentStats = {
        totalEarnings: artistResponse.totalEarnings || 0,
        count: artistResponse.pagination?.count || 0,
        averagePayment: artistResponse.pagination?.count > 0 
          ? (artistResponse.totalEarnings || 0) / artistResponse.pagination.count 
          : 0,
        paidCount: artistResponse.payments?.filter((p: any) => p.status === 'paid').length || 0,
        pendingCount: artistResponse.payments?.filter((p: any) => p.status === 'pending').length || 0,
        failedCount: artistResponse.payments?.filter((p: any) => p.status === 'failed').length || 0,
      };

      const equipmentStats: PaymentStats = {
        totalEarnings: equipmentResponse.totalEarnings || 0,
        count: equipmentResponse.pagination?.count || 0,
        averagePayment: equipmentResponse.pagination?.count > 0 
          ? (equipmentResponse.totalEarnings || 0) / equipmentResponse.pagination.count 
          : 0,
        paidCount: equipmentResponse.payments?.filter((p: any) => p.paymentStatus === 'paid').length || 0,
        pendingCount: equipmentResponse.payments?.filter((p: any) => p.paymentStatus === 'pending').length || 0,
        failedCount: equipmentResponse.payments?.filter((p: any) => p.paymentStatus === 'failed').length || 0,
      };

      const combinedStats: PaymentStats = {
        totalEarnings: artistStats.totalEarnings + equipmentStats.totalEarnings,
        count: artistStats.count + equipmentStats.count,
        averagePayment: (artistStats.count + equipmentStats.count) > 0 
          ? (artistStats.totalEarnings + equipmentStats.totalEarnings) / (artistStats.count + equipmentStats.count)
          : 0,
        paidCount: artistStats.paidCount + equipmentStats.paidCount,
        pendingCount: artistStats.pendingCount + equipmentStats.pendingCount,
        failedCount: artistStats.failedCount + equipmentStats.failedCount,
      };

      setAggregatedStats({
        artist: artistStats,
        equipment: equipmentStats,
        combined: combinedStats
      });
    } catch (err: any) {
      console.error('Error fetching aggregated payment stats:', err);
      setError('Failed to fetch payment statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KW', {
      style: 'currency',
      currency: 'KWD',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 p-3 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Track and manage all payments to artists and equipment providers
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 self-start sm:self-auto"
        >
          <Download className="w-4 h-4 mr-2" />
          Export All
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Overall Stats Cards */}
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
                  <dd className="text-sm md:text-lg font-medium text-gray-900">
                    {formatCurrency(aggregatedStats.combined.totalEarnings)}
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
                  <dd className="text-sm md:text-lg font-medium text-gray-900">
                    {aggregatedStats.combined.count}
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
                    Avg Transaction
                  </dt>
                  <dd className="text-sm md:text-lg font-medium text-gray-900">
                    {formatCurrency(aggregatedStats.combined.averagePayment)}
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
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3 w-0 flex-1">
                <dl>
                  <dt className="text-xs font-medium text-gray-500 truncate">
                    Success Rate
                  </dt>
                  <dd className="text-sm md:text-lg font-medium text-gray-900">
                    {aggregatedStats.combined.count > 0 
                      ? Math.round((aggregatedStats.combined.paidCount / aggregatedStats.combined.count) * 100) 
                      : 0}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-blue-500">
          <div className="p-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex-1">
                <h3 className="text-sm md:text-lg font-medium text-gray-900 flex items-center">
                  <Users className="h-4 w-4 mr-2 text-blue-500" />
                  Artist Payments
                </h3>
                <div className="mt-1 space-y-1">
                  <p className="text-lg md:text-2xl font-bold text-gray-900">
                    {formatCurrency(aggregatedStats.artist.totalEarnings)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {aggregatedStats.artist.count} transactions
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs text-gray-500">Avg per transaction</p>
                <p className="text-sm md:text-lg font-semibold text-gray-900">
                  {formatCurrency(aggregatedStats.artist.averagePayment)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-purple-500">
          <div className="p-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex-1">
                <h3 className="text-sm md:text-lg font-medium text-gray-900 flex items-center">
                  <Building className="h-4 w-4 mr-2 text-purple-500" />
                  Equipment Payments
                </h3>
                <div className="mt-1 space-y-1">
                  <p className="text-lg md:text-2xl font-bold text-gray-900">
                    {formatCurrency(aggregatedStats.equipment.totalEarnings)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {aggregatedStats.equipment.count} rentals
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs text-gray-500">Avg per rental</p>
                <p className="text-sm md:text-lg font-semibold text-gray-900">
                  {formatCurrency(aggregatedStats.equipment.averagePayment)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('artist-payments')}
            className={`py-2 px-3 border-b-2 font-medium text-xs md:text-sm flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'artist-payments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Artist Payments</span>
            <span className="sm:hidden">Artists</span>
            <span className="bg-gray-100 text-gray-900 rounded-full px-2 py-0.5 text-xs">
              {aggregatedStats.artist.count}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('equipment-payments')}
            className={`py-2 px-3 border-b-2 font-medium text-xs md:text-sm flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'equipment-payments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Building className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Equipment Payments</span>
            <span className="sm:hidden">Equipment</span>
            <span className="bg-gray-100 text-gray-900 rounded-full px-2 py-0.5 text-xs">
              {aggregatedStats.equipment.count}
            </span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === 'artist-payments' && (
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-3 py-2 md:px-4 md:py-3 border-b border-gray-200">
              <h2 className="text-sm md:text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="h-4 w-4 md:h-5 md:w-5" />
                Artist Payment Management
              </h2>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                Track payments to artists, manage earnings, and monitor transaction status.
              </p>
            </div>
            <div className="p-0">
              <AdminArtistPaymentManagement />
            </div>
          </div>
        )}

        {activeTab === 'equipment-payments' && (
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-3 py-2 md:px-4 md:py-3 border-b border-gray-200">
              <h2 className="text-sm md:text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Building className="h-4 w-4 md:h-5 md:w-5" />
                Equipment Provider Payment Management
              </h2>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                Manage equipment rental payments, track provider earnings, and monitor rental transactions.
              </p>
            </div>
            <div className="p-0">
              <AdminEquipmentProviderPaymentManagement />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}