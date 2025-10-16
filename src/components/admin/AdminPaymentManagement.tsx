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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-600 mt-1">
            Track and manage all payments to artists and equipment providers
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Download className="w-4 h-4 mr-2" />
            Export All Payments
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Overall Stats Cards */}
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
                    Total Platform Earnings
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(aggregatedStats.combined.totalEarnings)}
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
                    Total Transactions
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {aggregatedStats.combined.count}
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
                    Average Transaction
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(aggregatedStats.combined.averagePayment)}
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
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Success Rate
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-blue-500">
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-500" />
                  Artist Payments
                </h3>
                <div className="mt-2 space-y-1">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(aggregatedStats.artist.totalEarnings)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {aggregatedStats.artist.count} transactions
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Avg. per transaction</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(aggregatedStats.artist.averagePayment)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-purple-500">
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Building className="h-5 w-5 mr-2 text-purple-500" />
                  Equipment Provider Payments
                </h3>
                <div className="mt-2 space-y-1">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(aggregatedStats.equipment.totalEarnings)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {aggregatedStats.equipment.count} rentals
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Avg. per rental</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(aggregatedStats.equipment.averagePayment)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('artist-payments')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'artist-payments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="h-4 w-4" />
            Artist Payments ({aggregatedStats.artist.count})
          </button>
          <button
            onClick={() => setActiveTab('equipment-payments')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'equipment-payments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Building className="h-4 w-4" />
            Equipment Provider Payments ({aggregatedStats.equipment.count})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'artist-payments' && (
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Artist Payment Management
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Track payments to artists, manage earnings, and monitor transaction status.
              </p>
            </div>
            <div className="p-6">
              <AdminArtistPaymentManagement />
            </div>
          </div>
        )}

        {activeTab === 'equipment-payments' && (
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Building className="h-5 w-5" />
                Equipment Provider Payment Management
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage equipment rental payments, track provider earnings, and monitor rental transactions.
              </p>
            </div>
            <div className="p-6">
              <AdminEquipmentProviderPaymentManagement />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}