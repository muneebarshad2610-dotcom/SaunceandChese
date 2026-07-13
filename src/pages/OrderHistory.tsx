import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Clock, ChevronDown, ChevronUp, MapPin, Phone, User } from 'lucide-react';
import { useAuth } from '@clerk/react';
import type { Order } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  confirmed: { label: 'Confirmed', color: 'text-blue-600', bg: 'bg-blue-100' },
  preparing: { label: 'Preparing', color: 'text-orange-600', bg: 'bg-orange-100' },
  out_for_delivery: { label: 'Out for Delivery', color: 'text-purple-600', bg: 'bg-purple-100' },
  delivered: { label: 'Delivered', color: 'text-green-600', bg: 'bg-green-100' },
  cancelled: { label: 'Cancelled', color: 'text-red-600', bg: 'bg-red-100' },
};

const STATUS_ORDER = ['confirmed', 'preparing', 'out_for_delivery', 'delivered'];

interface Props {
  onNavigateHome: () => void;
}

export default function OrderHistory({ onNavigateHome }: Props) {
  const { getToken, isSignedIn } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }
    fetchOrders();
  }, [isSignedIn]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        setError('Session expired. Please sign out and sign back in.');
        setLoading(false);
        return;
      }
      const res = await fetch(API_BASE + '/api/orders', {
        headers: { Authorization: 'Bearer ' + token },
      });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError('Could not load your orders. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentStatusIndex = (status: string) => STATUS_ORDER.indexOf(status);

  if (!isSignedIn) {
    return (
      <section className="min-h-screen bg-[#FDF5E6] py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white border-4 border-[#C41E3A] rounded-[36px] p-12 shadow-md">
            <Package className="w-16 h-16 text-[#C41E3A] mx-auto mb-4 opacity-40" />
            <h2 className="font-retro text-4xl text-[#C41E3A] uppercase tracking-wide mb-3">
              Sign In to View Orders
            </h2>
            <p className="text-sm text-[#C41E3A]/70 mb-6">
              Please sign in to see your order history.
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
    <section className="min-h-screen bg-[#FDF5E6] py-20 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="font-retro text-5xl md:text-6xl text-[#C41E3A] uppercase tracking-wide leading-none">
              My Orders
            </h2>
            <p className="font-handwritten text-xl text-[#FFB81C] mt-1">
              Your cheesy journey, tracked.
            </p>
          </div>
          <button
            onClick={onNavigateHome}
            className="bg-white text-[#C41E3A] border-2 border-[#C41E3A] px-5 py-2 rounded-full font-black text-xs uppercase tracking-wider hover:bg-[#C41E3A] hover:text-white transition-all cursor-pointer"
          >
            &larr; Back to Menu
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white border-2 border-[#C41E3A]/10 rounded-[24px] p-6 animate-pulse"
              >
                <div className="h-5 bg-[#C41E3A]/10 rounded w-1/3 mb-3" />
                <div className="h-4 bg-[#C41E3A]/5 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
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

        {/* Empty */}
        {!loading && !error && orders.length === 0 && (
          <div className="bg-white border-4 border-[#C41E3A] rounded-[36px] p-12 text-center shadow-md">
            <Package className="w-20 h-20 text-[#C41E3A] mx-auto mb-4 opacity-30" />
            <h3 className="font-retro text-3xl text-[#C41E3A] uppercase tracking-wide mb-2">
              No Orders Yet
            </h3>
            <p className="text-sm text-[#C41E3A]/60 mb-6">
              Your cheesy adventures start here. Place your first order!
            </p>
            <button
              onClick={onNavigateHome}
              className="bg-[#FFB81C] text-[#C41E3A] px-8 py-3 rounded-full font-black uppercase tracking-wider text-xs border-2 border-[#C41E3A] hover:bg-[#ffa71c] transition-all cursor-pointer"
            >
              Browse Menu
            </button>
          </div>
        )}

        {/* Orders List */}
        <AnimatePresence>
          {orders.map((order) => {
            const isExpanded = expandedId === order.id;
            const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.confirmed;
            const statusIdx = currentStatusIndex(order.status);

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border-2 border-[#C41E3A]/15 rounded-[24px] mb-4 overflow-hidden hover:border-[#C41E3A]/30 transition-colors shadow-sm"
              >
                {/* Order Header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  className="w-full p-5 flex items-center justify-between text-left cursor-pointer"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-10 h-10 rounded-full ${statusConfig.bg} flex items-center justify-center flex-shrink-0`}>
                      <Clock className={`w-5 h-5 ${statusConfig.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-sm text-[#C41E3A]">
                          {order.orderNumber}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${statusConfig.bg} ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#C41E3A]/50 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-black text-base text-[#C41E3A]">
                      Rs. {Number(order.subtotal).toLocaleString()}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#C41E3A]/40" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#C41E3A]/40" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-[#C41E3A]/10"
                    >
                      <div className="p-5 space-y-5">
                        {/* Status Timeline */}
                        <div className="flex items-center gap-1">
                          {STATUS_ORDER.map((s, i) => {
                            const cfg = STATUS_CONFIG[s];
                            const isActive = i <= statusIdx;
                            const isCurrent = i === statusIdx;
                            return (
                              <div key={s} className="flex-1 flex flex-col items-center">
                                <div
                                  className={`w-full h-1.5 rounded-full ${
                                    isActive
                                      ? isCurrent
                                        ? 'bg-[#FFB81C] animate-pulse'
                                        : 'bg-[#C41E3A]'
                                      : 'bg-[#C41E3A]/10'
                                  }`}
                                />
                                <span
                                  className={`text-[9px] font-black uppercase tracking-wider mt-1 ${
                                    isActive ? 'text-[#C41E3A]' : 'text-[#C41E3A]/30'
                                  }`}
                                >
                                  {cfg.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Customer Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="bg-[#FDF5E6] p-3 rounded-xl border border-[#C41E3A]/5 space-y-1.5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#C41E3A]/40">Contact</span>
                            <div className="flex items-center gap-1.5">
                              <User className="w-3 h-3 text-[#C41E3A]/60" />
                              <span className="font-medium text-[#1A1A1A]">{order.customerName}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3 h-3 text-[#C41E3A]/60" />
                              <span className="text-[#1A1A1A]">{order.customerPhone}</span>
                            </div>
                          </div>
                          <div className="bg-[#FDF5E6] p-3 rounded-xl border border-[#C41E3A]/5 space-y-1.5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#C41E3A]/40">Delivery</span>
                            <div className="flex items-start gap-1.5">
                              <MapPin className="w-3 h-3 text-[#C41E3A]/60 mt-0.5 flex-shrink-0" />
                              <span className="text-[#1A1A1A]">{order.deliveryAddress}</span>
                            </div>
                            {order.deliveryNotes && (
                              <p className="text-[#C41E3A]/60 italic mt-1">
                                "{order.deliveryNotes}"
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Items */}
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-[#C41E3A]/40 mb-2">
                            Items ({Array.isArray(order.items) ? order.items.length : 0})
                          </h4>
                          <div className="space-y-2">
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
                                    <p className="font-bold text-xs text-[#C41E3A]">
                                      {item.name}
                                    </p>
                                    <p className="text-[10px] text-[#C41E3A]/50">
                                      x{item.qty}
                                      {item.selectedSize && ` • ${item.selectedSize}`}
                                      {item.addons && item.addons.length > 0 && ` • ${item.addons.map((a: any) => a.name).join(' + ')}`}
                                    </p>
                                  </div>
                                </div>
                                <span className="font-black text-xs text-[#C41E3A]">
                                  Rs. {(item.unitPrice ?? item.price ?? 0) * item.qty}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Total */}
                        <div className="flex justify-between items-center pt-3 border-t border-[#C41E3A]/10">
                          <span className="font-black text-sm text-[#C41E3A]">Subtotal</span>
                          <span className="font-black text-lg text-[#C41E3A]">
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
    </section>
  );
}
