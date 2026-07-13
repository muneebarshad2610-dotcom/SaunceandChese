import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChefHat, Clock, Bell, RefreshCw, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '@clerk/react';
import type { KitchenOrder } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

interface Props {
  onNavigateHome: () => void;
}

const STATUS_FLOW = ['confirmed', 'preparing', 'ready', 'delivered'] as const;

export default function KitchenView({ onNavigateHome }: Props) {
  const { getToken } = useAuth();
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [newOrderAlert, setNewOrderAlert] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(API_BASE + '/api/kitchen/orders', {
        headers: { Authorization: 'Bearer ' + token },
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setOrders((prev) => {
        if (data.length > prev.length) setNewOrderAlert(true);
        return data;
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  useEffect(() => {
    if (newOrderAlert) {
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.value = 0.3;
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.stop(ctx.currentTime + 0.4);
      } catch { }
      const timer = setTimeout(() => setNewOrderAlert(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [newOrderAlert]);

  const updateStatus = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(API_BASE + '/api/kitchen/orders/' + orderId + '/status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed');
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const elapsed = (createdAt: string) => {
    const mins = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return mins + 'm';
    const hrs = Math.floor(mins / 60);
    return hrs + 'h ' + (mins % 60) + 'm';
  };

  return (
    <section className="min-h-screen bg-[#1A1A1A] text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#C41E3A] to-[#a01830] px-6 py-4 border-b-4 border-[#FFB81C]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#FFB81C] rounded-full flex items-center justify-center border-2 border-white">
              <ChefHat className="w-6 h-6 text-[#C41E3A]" />
            </div>
            <div>
              <h1 className="font-retro text-3xl text-white uppercase tracking-wide leading-none">Kitchen Display</h1>
              <p className="text-[#FFB81C] text-xs font-black uppercase tracking-wider mt-0.5">Live Orders</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {newOrderAlert && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1.5 bg-[#FFB81C] text-[#C41E3A] px-3 py-1.5 rounded-full font-black text-xs">
                <Bell className="w-4 h-4 animate-bounce" /> New Order!
              </motion.div>
            )}
            <button onClick={() => window.print()} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer print-hidden" title="Print tickets">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            </button>
            <button onClick={fetchOrders} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer" title="Refresh">
              <RefreshCw className="w-5 h-5" />
            </button>
            <button onClick={onNavigateHome} className="bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-wider transition-colors cursor-pointer">
              &larr; Exit
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-3 text-[10px] font-black uppercase tracking-wider">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-yellow-500"></span> Confirmed</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-500"></span> Preparing</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-500"></span> Ready</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#2A2A2A] rounded-[24px] p-6 animate-pulse">
                <div className="h-5 bg-white/10 rounded w-1/2 mb-4" />
                <div className="h-4 bg-white/5 rounded w-3/4 mb-2" />
                <div className="h-4 bg-white/5 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div className="text-center py-20">
            <UtensilsCrossed className="w-20 h-20 text-white/20 mx-auto mb-4" />
            <h2 className="font-retro text-3xl text-white/50 uppercase tracking-wide">No Active Orders</h2>
            <p className="text-white/30 mt-2">Waiting for orders to come in...</p>
          </div>
        )}

        {/* Order Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {orders.map((order) => {
              const timeAgo = elapsed(order.createdAt);
              const isUrgent = parseInt(timeAgo) > 15;
              const currentIdx = STATUS_FLOW.indexOf(order.status as any);
              const nextStatus = currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null;

              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`rounded-[24px] border-2 overflow-hidden ${
                    order.status === 'confirmed' ? 'border-yellow-500/50 bg-[#2A2A2A]' :
                    order.status === 'preparing' ? 'border-blue-500/50 bg-[#2A2A2A]' :
                    'border-green-500/30 bg-[#2A2A2A] opacity-70'
                  } ${isUrgent && order.status === 'confirmed' ? 'ring-2 ring-red-500 animate-pulse' : ''}`}
                >
                  {/* Order Header */}
                  <div className={`px-4 py-3 flex items-center justify-between border-b border-white/10 ${
                    order.status === 'confirmed' ? 'bg-yellow-500/20' :
                    order.status === 'preparing' ? 'bg-blue-500/20' : 'bg-green-500/20'
                  }`}>
                    <div>
                      <span className="font-black text-lg text-white">{order.orderNumber}</span>
                      <div className="flex items-center gap-2 text-[11px] text-white/60 mt-0.5">
                        {order.tableNumber && (
                          <span className="flex items-center gap-1">
                            <UtensilsCrossed className="w-3 h-3" /> Table {order.tableNumber}
                          </span>
                        )}
                        {order.guestName && <span>— {order.guestName}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1 text-xs font-black ${
                        isUrgent ? 'text-red-400' : 'text-white/50'
                      }`}>
                        <Clock className="w-3 h-3" /> {timeAgo}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="p-4 space-y-2">
                    {Array.isArray(order.items) && order.items.slice(0, 5).map((item: any, i: number) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-white/90">
                          <span className="font-bold text-[#FFB81C]">{item.qty}x</span> {item.name}
                        </span>
                        {item.selectedSize && (
                          <span className="text-white/40 text-[10px] uppercase">{item.selectedSize}</span>
                        )}
                      </div>
                    ))}
                    {Array.isArray(order.items) && order.items.length > 5 && (
                      <p className="text-white/40 text-xs">+{order.items.length - 5} more items</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="px-4 pb-4">
                    {nextStatus && (
                      <button
                        onClick={() => updateStatus(order.id, nextStatus)}
                        disabled={updatingId === order.id}
                        className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 ${
                          nextStatus === 'preparing' ? 'bg-blue-500 hover:bg-blue-600 text-white' :
                          nextStatus === 'ready' ? 'bg-green-500 hover:bg-green-600 text-white' :
                          'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                      >
                        {updatingId === order.id ? (
                          <span className="flex items-center justify-center gap-2">
                            <RefreshCw className="w-3 h-3 animate-spin" /> Updating...
                          </span>
                        ) : nextStatus === 'preparing' ? (
                          'Start Preparing'
                        ) : nextStatus === 'ready' ? (
                          'Mark as Ready'
                        ) : (
                          'Next →'
                        )}
                      </button>
                    )}
                    {!nextStatus && (
                      <div className="text-center text-green-400 text-xs font-black uppercase tracking-wider py-2">
                        ✓ Completed
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Auto-refresh indicator */}
      <div className="fixed bottom-4 right-4 text-[10px] text-white/20 font-mono print-hidden">
        Auto-refreshes every 10s
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          .print-hidden { display: none !important; }
          section { background: white !important; }
          [class*="bg-\\[\\#1A1A1A\\]"] { background: white !important; }
          [class*="bg-\\[\\#2A2A2A\\]"] { background: #f5f5f5 !important; }
          [class*="text-white"] { color: black !important; }
          [class*="text-white\\/"] { color: #444 !important; }
          [class*="border-\\]"] { border-color: #ddd !important; }
          .grid { break-inside: avoid; }
        }
      `}</style>
    </section>
  );
}
