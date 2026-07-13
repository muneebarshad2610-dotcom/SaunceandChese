import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Package, RefreshCw, ChefHat, Bike, CheckCircle, XCircle,
  ChevronDown, ChevronUp, MapPin, Phone, User, Clock, Search
} from 'lucide-react';
import { useAuth } from '@clerk/react';
import type { Order, OrderStatus } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: any }> = {
  confirmed: { label: 'Confirmed', color: 'text-blue-600', bg: 'bg-blue-100', icon: Clock },
  preparing: { label: 'Preparing', color: 'text-orange-600', bg: 'bg-orange-100', icon: ChefHat },
  out_for_delivery: { label: 'Out for Delivery', color: 'text-purple-600', bg: 'bg-purple-100', icon: Bike },
  delivered: { label: 'Delivered', color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-red-600', bg: 'bg-red-100', icon: XCircle },
};

const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  confirmed: ['preparing', 'cancelled'],
  preparing: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

interface Props {
  onNavigateHome: () => void;
}

export default function AdminOrders({ onNavigateHome }: Props) {
  const { getToken, isSignedIn } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminCheckDone, setAdminCheckDone] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Check admin status
  const checkAdmin = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      const token = await getToken();
      if (!token) {
        setIsAdmin(false);
        setAdminCheckDone(true);
        return;
      }
      const res = await fetch(API_BASE + '/api/admin/check', {
        headers: { Authorization: 'Bearer ' + token },
      });
      if (!res.ok) throw new Error('Failed to check admin');
      const data = await res.json();
      setIsAdmin(data.admin);
    } catch {
      setIsAdmin(false);
    } finally {
      setAdminCheckDone(true);
    }
  }, [isSignedIn, getToken]);

  useEffect(() => {
    if (isSignedIn && !adminCheckDone) {
      checkAdmin();
    }
  }, [isSignedIn, adminCheckDone, checkAdmin]);

  // Fetch all orders (admin only)
  const fetchOrders = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        setError('Session expired. Please sign out and sign back in.');
        setLoading(false);
        return;
      }
      const res = await fetch(API_BASE + '/api/orders/admin', {
        headers: { Authorization: 'Bearer ' + token },
      });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError('Could not load orders. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, getToken]);

  useEffect(() => {
    if (isAdmin) {
      fetchOrders();
      // Auto-refresh every 15 seconds
      const interval = setInterval(fetchOrders, 15000);
      return () => clearInterval(interval);
    }
  }, [isAdmin, fetchOrders]);

  // Update order status
  const updateStatus = async (orderId: number, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      const token = await getToken();
      if (!token) {
        alert('Session expired. Please sign out and sign back in.');
        setUpdatingId(null);
        return;
      }
      const res = await fetch(API_BASE + '/api/orders/' + orderId + '/status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      // Update local state
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus, updatedAt: new Date().toISOString() } : o))
      );
    } catch (err) {
      console.error(err);
      alert('Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter & search
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  // Counts
  const counts = {
    all: orders.length,
    confirmed: orders.filter((o) => o.status === 'confirmed').length,
    preparing: orders.filter((o) => o.status === 'preparing').length,
    out_for_delivery: orders.filter((o) => o.status === 'out_for_delivery').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  };

  // Loading state
  if (!adminCheckDone) {
    return (
      <section className="min-h-screen bg-[#FDF5E6] py-20 px-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#C41E3A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-black text-sm text-[#C41E3A] uppercase tracking-wider">Checking access...</p>
        </div>
      </section>
    );
  }

  // Not admin
  if (isAdmin === false) {
    return (
      <section className="min-h-screen bg-[#FDF5E6] py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white border-4 border-[#C41E3A] rounded-[36px] p-12 shadow-md">
            <Package className="w-16 h-16 text-[#C41E3A] mx-auto mb-4 opacity-40" />
            <h2 className="font-retro text-4xl text-[#C41E3A] uppercase tracking-wide mb-3">
              Access Denied
            </h2>
            <p className="text-sm text-[#C41E3A]/70 mb-6">
              This area is for restaurant staff only. If you're an admin, sign in with your admin account.
            </p>
            <button
              onClick={onNavigateHome}
              className="bg-[#C41E3A] text-white px-8 py-3 rounded-full font-black uppercase tracking-wider text-xs hover:brightness-110 transition-all cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#FDF5E6]">
      {/* Admin Header */}
      <div className="bg-[#C41E3A] px-6 md:px-12 py-6 border-b-4 border-[#FFB81C]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-retro text-4xl md:text-5xl text-white uppercase tracking-wide leading-none">
                Order Management
              </h2>
              <p className="text-[#FFB81C] text-sm font-black uppercase tracking-wider mt-1">
                Kitchen Control Center
              </p>
            </div>
            <button
              onClick={onNavigateHome}
              className="bg-white text-[#C41E3A] px-5 py-2 rounded-full font-black text-xs uppercase tracking-wider hover:bg-[#FFB81C] transition-all cursor-pointer"
            >
              &larr; Site
            </button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-2">
            {(['all', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'] as const).map((key) => {
              const cfg = key !== 'all' ? STATUS_CONFIG[key] : null;
              return (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className={`px-3 py-1.5 rounded-full font-black text-[10px] uppercase tracking-wider border-2 transition-all cursor-pointer ${
                    statusFilter === key
                      ? 'bg-[#FFB81C] text-[#C41E3A] border-[#FFB81C]'
                      : 'bg-white/15 text-white/80 border-white/20 hover:bg-white/25'
                  }`}
                >
                  {cfg ? cfg.label : 'All'} ({counts[key]})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C41E3A]/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order #, customer name, or phone..."
            className="w-full bg-white border-2 border-[#C41E3A]/15 rounded-2xl pl-11 pr-4 py-3 text-sm font-medium placeholder-[#C41E3A]/30 focus:border-[#C41E3A] outline-none transition-all text-[#1A1A1A]"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border-2 border-[#C41E3A]/10 rounded-[24px] p-6 animate-pulse">
                <div className="h-5 bg-[#C41E3A]/10 rounded w-1/4 mb-3" />
                <div className="h-4 bg-[#C41E3A]/5 rounded w-1/3" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 border-2 border-red-400 rounded-[24px] p-8 text-center">
            <p className="font-bold text-red-600 mb-3">{error}</p>
            <button
              onClick={fetchOrders}
              className="bg-red-600 text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-wider cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* No results */}
        {!loading && !error && filteredOrders.length === 0 && (
          <div className="bg-white border-2 border-[#C41E3A]/10 rounded-[24px] p-12 text-center">
            <Package className="w-16 h-16 text-[#C41E3A]/30 mx-auto mb-3" />
            <p className="font-retro text-2xl text-[#C41E3A] uppercase tracking-wide">
              {orders.length === 0 ? 'No Orders Yet' : 'No Matching Orders'}
            </p>
          </div>
        )}

        {/* Orders */}
        <AnimatePresence>
          {filteredOrders.map((order) => {
            const isExpanded = expandedId === order.id;
            const statusConfig = STATUS_CONFIG[order.status];
            const StatusIcon = statusConfig.icon;
            const nextStatuses = STATUS_TRANSITIONS[order.status];

            return (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border-2 border-[#C41E3A]/10 rounded-[24px] mb-3 overflow-hidden hover:border-[#C41E3A]/25 transition-all shadow-sm"
              >
                {/* Header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-full ${statusConfig.bg} flex items-center justify-center flex-shrink-0`}>
                      <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-sm text-[#C41E3A]">
                          {order.orderNumber}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${statusConfig.bg} ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#C41E3A]/50 mt-0.5 truncate">
                        {order.customerName} &middot; {order.customerPhone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="font-black text-sm text-[#C41E3A]">
                      Rs. {Number(order.subtotal).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[#C41E3A]/40">
                      {new Date(order.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#C41E3A]/40" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#C41E3A]/40" />
                    )}
                  </div>
                </button>

                {/* Expanded */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-[#C41E3A]/10"
                    >
                      <div className="p-5 space-y-5">
                        {/* Action Buttons */}
                        {nextStatuses.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {nextStatuses.map((nextStatus) => {
                              const nextCfg = STATUS_CONFIG[nextStatus];
                              const NextIcon = nextCfg.icon;
                              const isUpdating = updatingId === order.id;
                              return (
                                <button
                                  key={nextStatus}
                                  onClick={() => updateStatus(order.id, nextStatus)}
                                  disabled={isUpdating}
                                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-wider border-2 transition-all cursor-pointer disabled:opacity-50 ${
                                    nextStatus === 'cancelled'
                                      ? 'bg-red-50 text-red-600 border-red-300 hover:bg-red-100'
                                      : `${nextCfg.bg} ${nextCfg.color} border-${nextStatus === 'delivered' ? 'green' : 'current'} hover:brightness-95`
                                  }`}
                                >
                                  {isUpdating ? (
                                    <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <NextIcon className="w-3.5 h-3.5" />
                                  )}
                                  {isUpdating ? 'Updating...' : `Mark as ${nextCfg.label}`}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                          <div className="bg-[#FDF5E6] p-3 rounded-xl border border-[#C41E3A]/5 space-y-1.5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#C41E3A]/40">Customer</span>
                            <div className="flex items-center gap-1.5">
                              <User className="w-3 h-3 text-[#C41E3A]/60" />
                              <span className="font-medium text-[#1A1A1A]">{order.customerName}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3 h-3 text-[#C41E3A]/60" />
                              <span className="text-[#1A1A1A]">{order.customerPhone}</span>
                            </div>
                          </div>
                          <div className="md:col-span-2 bg-[#FDF5E6] p-3 rounded-xl border border-[#C41E3A]/5 space-y-1.5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#C41E3A]/40">Delivery</span>
                            <div className="flex items-start gap-1.5">
                              <MapPin className="w-3 h-3 text-[#C41E3A]/60 mt-0.5 flex-shrink-0" />
                              <span className="text-[#1A1A1A]">{order.deliveryAddress}</span>
                            </div>
                            {order.deliveryNotes && (
                              <p className="text-[#C41E3A]/60 italic">"{order.deliveryNotes}"</p>
                            )}
                          </div>
                        </div>

                        {/* Items */}
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-[#C41E3A]/40 mb-2">
                            Items ({Array.isArray(order.items) ? order.items.length : 0})
                          </h4>
                          <div className="space-y-1.5">
                            {Array.isArray(order.items) && order.items.map((item: any, i: number) => (
                              <div
                                key={i}
                                className="flex items-center justify-between bg-white/50 p-2.5 rounded-xl border border-[#C41E3A]/5"
                              >
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-8 h-8 rounded-lg object-cover border border-[#C41E3A]/10"
                                    loading="lazy"
                                  />
                                  <div>
                                    <p className="font-bold text-xs text-[#C41E3A]">{item.name}</p>
                                    <p className="text-[10px] text-[#C41E3A]/50">
                                      x{item.qty}
                                      {item.selectedSize && ` • ${item.selectedSize}`}
                                      {item.addons && item.addons.length > 0 && ` • ${item.addons.map((a: any) => a.name).join(' + ')}`}
                                    </p>
                                  </div>
                                </div>
                                <span className="font-black text-xs text-[#C41E3A]">Rs. {(item.unitPrice ?? item.price ?? 0) * item.qty}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Totals */}
                        <div className="flex justify-between items-center pt-2 border-t border-[#C41E3A]/10">
                          <div className="text-[10px] text-[#C41E3A]/40">
                            Placed: {new Date(order.createdAt).toLocaleString('en-GB', {
                              day: 'numeric', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </div>
                          <span className="font-black text-base text-[#C41E3A]">
                            Rs. {Number(order.subtotal).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Refresh button */}
      <button
        onClick={fetchOrders}
        disabled={loading}
        className="fixed bottom-6 right-6 bg-[#C41E3A] text-white p-3.5 rounded-full shadow-lg border-2 border-[#FFB81C] hover:bg-[#b01630] transition-all cursor-pointer disabled:opacity-50 z-30"
        title="Refresh orders"
      >
        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
      </button>
    </section>
  );
}
