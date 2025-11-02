"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Booking, BOOKING_STATUSES } from "@/types/booking";
import { BookingService } from "@/services/booking.service";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  RefreshCw,
  Layers,
  DollarSign,
  TrendingUp,
  Calendar,
  Star,
  BarChart3,
  Users,
  Award,
} from "lucide-react";

type StatusFilter = "all" | Booking["status"];

interface ArtistAnalytics {
  revenue: {
    total: number;
    thisMonth: number;
    thisYear: number;
    average: number;
  };
  bookings: {
    total: number;
    confirmed: number;
    pending: number;
    completed: number;
    cancelled: number;
    upcoming: number;
    recent: number;
  };
  breakdown: {
    artistOnly: number;
    combined: number;
  };
  performance: {
    conversionRate: number;
    completionRate: number;
  };
}

export default function ArtistMyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [analytics, setAnalytics] = useState<ArtistAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("confirmed");
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
    fetchAnalytics();
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      const data = await BookingService.getArtistOwnBookings();
      setBookings(Array.isArray(data) ? (data as Booking[]) : []);
    } catch (err) {
      console.error("Failed to load artist bookings", err);
      setError("Failed to load bookings. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const data = await BookingService.getArtistAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error("Failed to load analytics", err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let list = [...bookings];
    // Always hide pending bookings from artist view
    list = list.filter((b) => b.status !== 'pending');
    if (statusFilter !== "all") {
      list = list.filter((b) => b.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((b) => {
        const city = b.venueDetails?.city?.toLowerCase() || "";
        const address = b.venueDetails?.address?.toLowerCase() || "";
        const booker = b.userDetails?.name?.toLowerCase() || "";
        const desc = b.eventDescription?.toLowerCase() || "";
        return (
          city.includes(q) || address.includes(q) || booker.includes(q) || desc.includes(q)
        );
      });
    }
    return list;
  }, [bookings, statusFilter, search]);

  const toggle = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const formatDate = (isoOrDate: string) => {
    try {
      const d = new Date(isoOrDate);
      return d.toLocaleDateString();
    } catch {
      return isoOrDate;
    }
  };

  const formatTime = (t?: string) => (t ? t : "--:--");

  const formatCurrency = (n?: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "KWD" }).format(
      n || 0
    );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
    fetchAnalytics();
  };

  if (loading || analyticsLoading) return <LoadingSpinner text="Loading your performance dashboard..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-indigo-600/10 rounded-2xl" />
        <div className="relative bg-white/80 backdrop-blur-sm rounded-xl border border-white/60 shadow p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Layers className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Performance Dashboard</h2>
                <p className="text-gray-600">Your complete earnings and booking overview</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
                <Search className="h-4 w-4 text-gray-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by location, booker, notes"
                  className="outline-none text-sm w-64"
                />
              </div>
              <div className="bg-white border border-gray-200 rounded-xl px-3 py-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="text-sm outline-none bg-transparent"
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <button
                onClick={onRefresh}
                disabled={refreshing}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 text-sm"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                Total
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.revenue.total)}</p>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-xs text-green-600">Avg: {formatCurrency(analytics.revenue.average)}</p>
            </div>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                Month
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.revenue.thisMonth)}</p>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-xs text-blue-600">Year: {formatCurrency(analytics.revenue.thisYear)}</p>
            </div>
          </div>

          {/* Total Bookings */}
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl border border-purple-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
                  {/* removed 'All' chip per request */}
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">{analytics.bookings.total}</p>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-xs text-purple-600">Upcoming: {analytics.bookings.upcoming}</p>
            </div>
          </div>

          {/* Performance Rate */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Star className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-xs font-medium text-orange-700 bg-orange-100 px-2 py-1 rounded-full">
                Rate
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">{analytics.performance.conversionRate.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-xs text-orange-600">Complete: {analytics.performance.completionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-lg font-bold text-green-600">{analytics.bookings.confirmed}</div>
            <div className="text-xs text-gray-600">Confirmed</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-lg font-bold text-blue-600">{analytics.bookings.completed}</div>
            <div className="text-xs text-gray-600">Completed</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-lg font-bold text-red-600">{analytics.bookings.cancelled}</div>
            <div className="text-xs text-gray-600">Cancelled</div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
      )}

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarDays className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600">Your performance bookings will appear here</p>
          </div>
        ) : (
          filtered.map((b) => {
            const statusMeta = BOOKING_STATUSES[b.status] || BOOKING_STATUSES["pending"];
            const isMulti = (b as any).isMultiDay && (b.eventDates?.length || 0) > 0;
            const firstDate = isMulti ? b.eventDates![0] : undefined;
            const lastDate = isMulti ? b.eventDates![b.eventDates!.length - 1] : undefined;

            return (
              <div key={b._id} className="group relative bg-white rounded-2xl border border-gray-100 shadow hover:shadow-lg transition-all duration-300 overflow-hidden">
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Header with enhanced gradient */}
                <div className="relative p-5 bg-gradient-to-br from-purple-100/80 via-blue-100/80 to-indigo-100/80 backdrop-blur-sm border-b border-gray-100/60">
                  
                  {/* Top row: badges and price */}
                  <div className="relative flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-xl ${statusMeta.bgColor} ${statusMeta.color}`}>
                        {b.status === "confirmed" && <CheckCircle2 className="h-3.5 w-3.5" />}
                        {b.status === "cancelled" && <XCircle className="h-3.5 w-3.5" />}
                        {b.status === "pending" && <AlertCircle className="h-3.5 w-3.5" />}
                        {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                      </span>
                      {/* Booking type hidden for artist view */}
                      {isMulti && (
                        <span className="inline-flex items-center text-xs font-medium px-3 py-1 rounded-xl bg-indigo-100 text-indigo-700 border border-indigo-200">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          {b.eventDates!.length} days
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-end relative z-10">
                      <div className="text-xl font-bold text-gray-900 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-sm">
                        {formatCurrency(b.artistPrice ?? b.totalPrice)}
                      </div>
                      <span className="text-xs text-gray-600 mt-1 font-medium">Your fee</span>
                    </div>
                  </div>

                  {/* Enhanced date section */}
                  <div className="mt-4 flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-3 shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow">
                        <CalendarDays className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-semibold text-gray-900 mb-0.5">
                          {isMulti ? (
                            `${formatDate(firstDate!.date)} - ${formatDate(lastDate!.date)}`
                          ) : (
                            formatDate(b.eventDate)
                          )}
                        </p>
                        <p className="text-xs text-gray-700 font-medium flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {isMulti ? (
                            `${formatTime(firstDate?.startTime)} - ${formatTime(lastDate?.endTime)}`
                          ) : (
                            `${formatTime(b.startTime)} - ${formatTime(b.endTime)}`
                          )}
                        </p>
                      </div>
                  </div>
                </div>

                {/* Enhanced body */}
                <div className="relative p-5 space-y-4 bg-white">
                  {/* Location with enhanced styling (detailed) */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow flex-shrink-0">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Location</p>
                      {b.venueDetails ? (
                        <div className="space-y-0.5 text-sm">
                          {b.venueDetails.address && (
                            <p className="text-gray-900">{b.venueDetails.address}</p>
                          )}
                          {(b.venueDetails.city || b.venueDetails.state || b.venueDetails.country || b.venueDetails.postalCode) && (
                            <p className="text-gray-700">
                              {[b.venueDetails.city, b.venueDetails.state, b.venueDetails.country]
                                .filter(Boolean)
                                .join(', ')}
                              {b.venueDetails.postalCode ? ` ${b.venueDetails.postalCode}` : ''}
                            </p>
                          )}
                          {b.venueDetails.venueType && (
                            <p className="text-gray-600 text-xs"><span className="font-medium">Type:</span> {b.venueDetails.venueType}</p>
                          )}
                          {b.venueDetails.additionalInfo && (
                            <p className="text-gray-600 text-xs"><span className="font-medium">Info:</span> {b.venueDetails.additionalInfo}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm font-medium text-gray-900">—</p>
                      )}
                    </div>
                  </div>

                  {/* Client with enhanced styling */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow flex-shrink-0">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Client</p>
                      <p className="text-sm font-medium text-gray-900 mb-0.5">
                        {b.userDetails?.name || "—"}
                      </p>
                      {!!b.userDetails?.phone && (
                        <p className="text-xs text-gray-600 font-medium">{b.userDetails.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Enhanced expand details section */}
                  <div className="pt-4 border-t border-gray-100">
                    <button
                      onClick={() => toggle(b._id)}
                      className="w-full flex items-center justify-center gap-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 py-2.5 px-4 rounded-xl shadow hover:shadow-md transition-all duration-200"
                    >
                      {expanded[b._id] ? (
                        <>
                          <ChevronUp className="h-4 w-4" /> Hide details
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" /> View details
                        </>
                      )}
                    </button>

                    {expanded[b._id] && (
                      <div className="mt-4 rounded-xl border border-gray-200 p-4 bg-gradient-to-br from-gray-50 to-white shadow-inner">
                        {isMulti && b.eventDates && b.eventDates.length > 0 ? (
                          <div className="space-y-3">
                            <p className="text-base font-semibold text-gray-800 flex items-center gap-2.5">
                              <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md flex items-center justify-center">
                                <CalendarDays className="h-4 w-4 text-white" />
                              </div>
                              Event schedule
                            </p>
                            <div className="grid grid-cols-1 gap-2.5">
                              {b.eventDates.map((d, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-3 py-3 shadow-sm hover:shadow-md transition-shadow">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-2.5 h-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-sm"></div>
                                    <span className="text-sm font-semibold text-gray-800">{formatDate(d.date)}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                                    <Clock className="h-3.5 w-3.5" />
                                    {d.startTime} - {d.endTime}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-700">
                            <p className="font-semibold flex items-center gap-2.5 mb-2.5">
                              <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md flex items-center justify-center">
                                <Clock className="h-4 w-4 text-white" />
                              </div>
                              Performance window
                            </p>
                            <div className="bg-white border border-gray-200 rounded-xl px-3 py-3 shadow-sm">
                              <p className="font-medium text-gray-800 text-sm">
                                {formatDate(b.eventDate)} ({formatTime(b.startTime)} - {formatTime(b.endTime)})
                              </p>
                            </div>
                          </div>
                        )}

                        {b.eventDescription && (
                          <div className="mt-4 text-sm">
                            <p className="font-semibold text-gray-800 mb-2.5 flex items-center gap-2.5">
                              <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-emerald-600 rounded-md flex items-center justify-center">
                                <User className="h-4 w-4 text-white" />
                              </div>
                              Event notes
                            </p>
                            <div className="bg-white border border-gray-200 rounded-xl px-3 py-3 shadow-sm">
                              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">{b.eventDescription}</p>
                            </div>
                          </div>
                        )}

                        {b.specialRequests && (
                          <div className="mt-4 text-sm">
                            <p className="font-semibold text-gray-800 mb-2.5 flex items-center gap-2.5">
                              <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-amber-600 rounded-md flex items-center justify-center">
                                <Star className="h-4 w-4 text-white" />
                              </div>
                              Special requests
                            </p>
                            <div className="bg-white border border-gray-200 rounded-xl px-3 py-3 shadow-sm">
                              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">{b.specialRequests}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
