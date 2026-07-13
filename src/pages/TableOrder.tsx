import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  QrCode, ShoppingBag, Plus, Minus, X, Check, User, Flame,
  UtensilsCrossed, ChevronDown, ChevronUp
} from 'lucide-react';
import type { MenuItem, AddonItem, AddToCartOptions } from '../types';
import { fetchAddons, getSauceOptions, getDrinkOptions, getExtraCheesePrice } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

interface TableData {
  id: number;
  tableNumber: number;
  capacity: number;
}

interface CartLineItem {
  menuItem: MenuItem;
  options: AddToCartOptions;
  lineTotal: number;
}

export default function TableOrder({ onNavigateHome }: { onNavigateHome: () => void }) {
  const [token, setToken] = useState<string>('');
  const [table, setTable] = useState<TableData | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [cart, setCart] = useState<CartLineItem[]>([]);
  const [guestName, setGuestName] = useState('');
  const [editingGuestName, setEditingGuestName] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [addons, setAddons] = useState<AddonItem[]>([]);

  const activeCategory = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('deal') || n.includes('combo')) return 'deal';
    return 'classic';
  };

  // Extract token from URL
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/table\/(.+)/);
    if (match && match[1]) {
      setToken(match[1]);
    } else {
      setError('Invalid QR code URL');
      setLoading(false);
    }
  }, []);

  // Fetch table info + menu + addons
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const [tableRes, menuRes, addonData] = await Promise.all([
          fetch(API_BASE + '/api/table/' + token),
          fetch(API_BASE + '/api/menu-items'),
          fetchAddons(),
        ]);
        if (!tableRes.ok) throw new Error('Table not found');
        if (!menuRes.ok) throw new Error('Menu unavailable');
        const tableData = await tableRes.json();
        const menuData = await menuRes.json();
        setTable(tableData);
        setMenuItems(menuData);
        setAddons(addonData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  // Cart helpers
  const cartTotal = cart.reduce((sum, item) => sum + item.lineTotal, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.options.qty, 0);

  const addToCart = (item: MenuItem, opts: AddToCartOptions) => {
    const unitPrice = item.prices
      ? item.prices[opts.size || 'regular']
      : item.price;
    const addonPrice =
      (opts.extraCheese ? getExtraCheesePrice(addons) : 0) +
      (getDrinkOptions(addons).find((d) => d.name === opts.drink)?.price || 0);
    const lineTotal = (unitPrice + addonPrice) * opts.qty;
    setCart((prev) => [...prev, { menuItem: item, options: opts, lineTotal }]);
    setExpandedItem(null);
  };

  const removeFromCart = (idx: number) => {
    setCart((prev) => prev.filter((_, i) => i !== idx));
  };

  const sauces = getSauceOptions(addons);
  const drinkOpts = getDrinkOptions(addons);
  const extraCheesePrice = getExtraCheesePrice(addons);

  // Submit table order
  const handlePlaceOrder = async (e: FormEvent) => {
    e.preventDefault();
    if (!table || !guestName.trim() || cart.length === 0) return;
    setEditingGuestName(false);
    setSubmitting(true);
    try {
      const res = await fetch(API_BASE + '/api/orders/table', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId: table.id,
          guestName: guestName.trim(),
          items: cart.map((c) => ({
            id: c.menuItem.id,
            name: c.menuItem.name,
            qty: c.options.qty,
            unitPrice: c.menuItem.prices
              ? c.menuItem.prices[c.options.size || 'regular']
              : c.menuItem.price,
            selectedSize: c.options.size || null,
            image: c.menuItem.image,
            addons: [
              ...(c.options.extraCheese ? [{ name: 'Extra Cheese', price: extraCheesePrice, type: 'extra_cheese' as const }] : []),
              ...(c.options.sauce ? [{ name: c.options.sauce, price: 0, type: 'sauce' as const }] : []),
              ...(c.options.drink ? [{ name: c.options.drink, price: drinkOpts.find((d) => d.name === c.options.drink)?.price || 0, type: 'drink' as const }] : []),
            ],
          })),
          subtotal: cartTotal,
          splitBill: false,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error((errData as { error?: string }).error || 'Failed to place order');
      }
      const data = await res.json();
      setOrderSuccess(data.orderNumber);
      setCart([]);
      setShowCart(false);
      setShowOrderForm(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FFB81C] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="font-retro text-2xl text-[#FDF5E6] uppercase tracking-wide animate-pulse">Loading Table...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error || !table) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <QrCode className="w-20 h-20 text-white/20 mx-auto mb-4" />
          <h1 className="font-retro text-3xl text-[#FFB81C] uppercase tracking-wide mb-4">Invalid QR Code</h1>
          <p className="text-white/50 mb-6">{error || 'This QR code is not linked to any active table.'}</p>
          <button onClick={onNavigateHome} className="bg-[#FFB81C] text-[#C41E3A] px-8 py-3 rounded-full font-black uppercase tracking-wider hover:brightness-110 transition-all cursor-pointer">
            Visit Our Website
          </button>
        </div>
      </div>
    );
  }

  // Success
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-[#FFB81C]">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-retro text-4xl text-[#FFB81C] uppercase tracking-wide mb-2">Order Placed!</h1>
          <p className="text-white/70 text-sm mb-1">Order <span className="font-black text-[#FFB81C]">{orderSuccess}</span></p>
          <p className="text-white/50 text-xs mb-8">Your order has been sent to the kitchen.</p>
          <div className="bg-[#2A2A2A] border border-white/10 rounded-[24px] p-6 mb-8 text-left">
            <p className="text-sm text-white/80 font-medium mb-1">What happens next?</p>
            <ul className="text-xs text-white/50 space-y-1.5 list-disc list-inside">
              <li>The kitchen will start preparing your order</li>
              <li>Staff will bring it to <strong className="text-[#FFB81C]">Table {table.tableNumber}</strong></li>
              <li>You can order more items anytime</li>
            </ul>
          </div>
          <button onClick={() => { setOrderSuccess(null); setGuestName(''); }}
            className="bg-[#FFB81C] text-[#C41E3A] px-8 py-3 rounded-full font-black uppercase tracking-wider hover:brightness-110 transition-all cursor-pointer">
            Order More
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#C41E3A] to-[#a01830] px-6 pt-6 pb-8 border-b-4 border-[#FFB81C]">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#FFB81C] rounded-full flex items-center justify-center border-2 border-white">
                <Flame className="w-6 h-6 text-[#C41E3A] fill-[#C41E3A]" />
              </div>
              <div>
                <h1 className="font-retro text-2xl text-white uppercase tracking-wide leading-none">Sauce n' Cheese</h1>
                <p className="text-[#FFB81C] text-xs font-black uppercase tracking-wider mt-0.5">Tableside Ordering</p>
              </div>
            </div>
            <div className="bg-white/15 rounded-2xl px-4 py-2 text-center border border-white/20">
              <p className="text-[10px] text-white/60 uppercase tracking-wider font-black">Table</p>
              <p className="font-retro text-2xl text-[#FFB81C]">{table.tableNumber}</p>
            </div>
          </div>

           {/* Guest Name */}
           <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
             {editingGuestName ? (
               <div className="flex items-center gap-3">
                 <User className="w-5 h-5 text-white/40" />
                 <input
                   type="text"
                   value={guestName}
                   onChange={(e) => setGuestName(e.target.value)}
                   placeholder="Enter your name to start ordering..."
                   className="flex-1 bg-transparent text-white placeholder-white/40 text-sm outline-none"
                   maxLength={50}
                   autoFocus
                 />
                 <button onClick={() => { setEditingGuestName(false); if (!guestName.trim()) setGuestName(''); }} className="text-[10px] text-white/40 hover:text-white/70 uppercase tracking-wider font-black cursor-pointer">Done</button>
               </div>
             ) : (
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <User className="w-4 h-4 text-[#FFB81C]" />
                   <span className="text-sm font-medium">Hi, <span className="text-[#FFB81C] font-black">{guestName || 'Guest'}</span></span>
                 </div>
                 <button onClick={() => setEditingGuestName(true)} className="text-[10px] text-white/40 hover:text-white/70 uppercase tracking-wider font-black cursor-pointer">Change</button>
               </div>
             )}
           </div>
        </div>
      </div>

      {/* Menu */}
      <div className="max-w-3xl mx-auto px-6 py-6 pb-28">
        <h2 className="font-retro text-2xl text-[#FFB81C] uppercase tracking-wide mb-4">Our Menu</h2>

        <div className="space-y-3">
          {menuItems.map((item) => {
            const isExpanded = expandedItem === item.id;
            const hasSizes = !!item.prices;
            const defaultSize: 'small' | 'regular' | 'large' = 'regular';
            const currentPrice = hasSizes ? item.prices![defaultSize] : item.price;

            return (
              <motion.div key={item.id} layout
                className="bg-[#2A2A2A] rounded-[24px] border border-white/10 overflow-hidden"
              >
                <button onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                  className="w-full p-4 flex items-center gap-4 text-left cursor-pointer"
                >
                  <img src={item.image} alt={item.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-white/10 flex-shrink-0"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-white">{item.name}</h3>
                    <p className="text-[11px] text-white/40 line-clamp-1">{item.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-[#FFB81C]">
                      Rs. {currentPrice}
                    </p>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-white/30 mt-1" /> : <ChevronDown className="w-4 h-4 text-white/30 mt-1" />}
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/10"
                    >
                      <OrderForm
                        item={item}
                        sauces={sauces}
                        drinkOptions={drinkOpts}
                        extraCheesePrice={extraCheesePrice}
                        hasSizes={hasSizes}
                        onAdd={addToCart}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Cart FAB */}
      {cartCount > 0 && !showCart && !showOrderForm && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 bg-[#FFB81C] text-[#C41E3A] p-4 rounded-full shadow-2xl border-2 border-[#C41E3A] z-40 cursor-pointer hover:scale-105 transition-transform"
        >
          <ShoppingBag className="w-6 h-6" />
          <span className="absolute -top-2 -right-2 bg-[#C41E3A] text-white w-6 h-6 rounded-full text-xs font-black flex items-center justify-center border-2 border-[#FFB81C]">
            {cartCount}
          </span>
        </motion.button>
      )}

      {/* Cart Drawer */}
      <AnimatePresence>
        {showCart && (
          <div className="fixed inset-0 z-50">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }}
              onClick={() => setShowCart(false)} className="absolute inset-0 bg-black" />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28 }}
              className="absolute bottom-0 left-0 right-0 bg-[#1A1A1A] rounded-t-[32px] border-t-4 border-[#FFB81C] p-6 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-retro text-2xl text-[#FFB81C] uppercase">Your Order</h2>
                <button onClick={() => setShowCart(false)} className="text-white/40 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <p className="text-white/30 text-center py-8">No items ordered yet.</p>
              ) : (
                <div className="space-y-3 mb-6">
                  {cart.map((line, idx) => (
                    <div key={idx} className="bg-[#2A2A2A] rounded-2xl p-3 flex items-center gap-3 border border-white/10">
                      <img src={line.menuItem.image} alt={line.menuItem.name}
                        className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-white">{line.menuItem.name}</p>
                        <p className="text-[10px] text-white/50">
                          x{line.options.qty} {line.options.size && `• ${line.options.size}`}
                          {line.options.extraCheese && ' • +Cheese'}
                          {line.options.sauce && ` • ${line.options.sauce}`}
                          {line.options.drink && ` • ${line.options.drink}`}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-black text-[#FFB81C] text-sm">Rs. {line.lineTotal}</p>
                        <button onClick={() => removeFromCart(idx)}
                          className="text-[10px] text-red-400 hover:text-red-300 font-black uppercase tracking-wider cursor-pointer">
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {cart.length > 0 && (
                <>
                  <div className="flex justify-between items-center mb-6 pt-3 border-t border-white/10">
                    <span className="font-retro text-lg text-white uppercase">Total</span>
                    <span className="font-black text-2xl text-[#FFB81C]">Rs. {cartTotal}</span>
                  </div>
                   <button onClick={() => { setShowCart(false); setShowOrderForm(true); }}
                     disabled={!guestName.trim()}
                     className="w-full bg-[#FFB81C] text-[#C41E3A] font-black py-4 rounded-2xl uppercase tracking-widest text-sm hover:brightness-110 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                     {guestName.trim() ? 'Place Order' : 'Enter Your Name First'}
                   </button>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Order Confirmation Modal */}
      <AnimatePresence>
        {showOrderForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }}
              onClick={() => setShowOrderForm(false)} className="absolute inset-0 bg-black" />
            <motion.form
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              onSubmit={handlePlaceOrder}
              className="relative bg-[#FDF5E6] border-4 border-[#FFB81C] rounded-[32px] max-w-sm w-full p-8 shadow-2xl z-10 text-center"
            >
              <button type="button" onClick={() => setShowOrderForm(false)}
                className="absolute top-4 right-4 text-[#C41E3A]/40 hover:text-[#C41E3A] cursor-pointer">
                <X className="w-5 h-5" />
              </button>

              <UtensilsCrossed className="w-12 h-12 text-[#C41E3A] mx-auto mb-3" />
              <h2 className="font-retro text-2xl text-[#C41E3A] uppercase tracking-wide mb-1">Confirm Order</h2>
              <p className="text-xs text-[#C41E3A]/60 mb-4">Table {table.tableNumber} &middot; {guestName}</p>

              <div className="bg-[#C41E3A]/5 rounded-2xl p-4 mb-5 text-left text-xs space-y-1.5">
                {cart.map((line, i) => (
                  <div key={i} className="flex justify-between">
                    <span><span className="font-black text-[#C41E3A]">{line.options.qty}x</span> {line.menuItem.name}</span>
                    <span className="font-bold text-[#C41E3A]">Rs. {line.lineTotal}</span>
                  </div>
                ))}
                <div className="border-t border-[#C41E3A]/10 pt-1.5 mt-1.5 flex justify-between font-black">
                  <span>Total</span>
                  <span className="text-[#C41E3A]">Rs. {cartTotal}</span>
                </div>
              </div>

              <button type="submit" disabled={submitting}
                className="w-full bg-[#FFB81C] text-[#C41E3A] font-black py-3.5 rounded-2xl uppercase tracking-widest text-sm shadow-lg border-2 border-[#C41E3A] hover:bg-[#ffa71c] disabled:opacity-60 transition-all cursor-pointer">
                {submitting ? 'Placing Order...' : 'Confirm & Send to Kitchen'}
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Item Order Form ────────────────────────────────────────────────

function OrderForm({
  item, sauces, drinkOptions, extraCheesePrice, hasSizes, onAdd,
}: {
  item: MenuItem;
  sauces: string[];
  drinkOptions: { name: string; price: number }[];
  extraCheesePrice: number;
  hasSizes: boolean;
  onAdd: (item: MenuItem, opts: AddToCartOptions) => void;
}) {
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState<'small' | 'regular' | 'large'>('regular');
  const [extraCheese, setExtraCheese] = useState(false);
  const [sauce, setSauce] = useState(sauces[0] || '');
  const [drink, setDrink] = useState('');

  const unitPrice = hasSizes ? item.prices![size] : item.price;
  const addonTotal = (extraCheese ? extraCheesePrice : 0) + (drinkOptions.find((d) => d.name === drink)?.price || 0);
  const lineTotal = (unitPrice + addonTotal) * qty;

  const handleAdd = () => {
    onAdd(item, { qty, size: hasSizes ? size : undefined, extraCheese, sauce, drink });
    setQty(1);
    setExtraCheese(false);
    setDrink('');
  };

  return (
    <div className="p-4 space-y-3">
      {/* Qty & Size */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-1.5">
          <button onClick={() => setQty(Math.max(1, qty - 1))} className="text-white/60 hover:text-white cursor-pointer">
            <Minus className="w-4 h-4" />
          </button>
          <span className="font-black text-white min-w-[24px] text-center">{qty}</span>
          <button onClick={() => setQty(qty + 1)} className="text-white/60 hover:text-white cursor-pointer">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {hasSizes && (
          <div className="flex gap-1">
            {(['small', 'regular', 'large'] as const).map((s) => (
              <button key={s} onClick={() => setSize(s)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                  size === s
                    ? 'bg-[#FFB81C] text-[#C41E3A] border-[#FFB81C]'
                    : 'bg-white/10 text-white/60 border-white/20 hover:bg-white/20'
                }`}>
                {s === 'regular' ? 'Reg' : s} {hasSizes && `Rs.${item.prices![s]}`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Add-ons */}
      {sauces.length > 0 && (
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1.5">Sauce</p>
          <div className="flex flex-wrap gap-1.5">
            {sauces.map((s) => (
              <button key={s} onClick={() => setSauce(s)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                  sauce === s
                    ? 'bg-[#FFB81C] text-[#C41E3A] border-[#FFB81C]'
                    : 'bg-white/10 text-white/60 border-white/20 hover:bg-white/20'
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Extra Cheese */}
      {extraCheesePrice > 0 && (
        <button onClick={() => setExtraCheese(!extraCheese)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
            extraCheese
              ? 'bg-[#FFB81C]/20 text-[#FFB81C] border-[#FFB81C]/40'
              : 'bg-white/10 text-white/60 border-white/20 hover:bg-white/20'
          }`}>
          {extraCheese ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          Extra Cheese (+Rs.{extraCheesePrice})
        </button>
      )}

      {/* Drink */}
      {drinkOptions.length > 0 && (
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1.5">Add a Drink</p>
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setDrink('')}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                !drink
                  ? 'bg-[#FFB81C] text-[#C41E3A] border-[#FFB81C]'
                  : 'bg-white/10 text-white/60 border-white/20 hover:bg-white/20'
              }`}>
              None
            </button>
            {drinkOptions.map((d) => (
              <button key={d.name} onClick={() => setDrink(d.name)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                  drink === d.name
                    ? 'bg-[#FFB81C] text-[#C41E3A] border-[#FFB81C]'
                    : 'bg-white/10 text-white/60 border-white/20 hover:bg-white/20'
                }`}>
                {d.name} Rs.{d.price}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add Button */}
      <button onClick={handleAdd}
        className="w-full bg-[#FFB81C] text-[#C41E3A] font-black py-3 rounded-2xl uppercase tracking-widest text-xs hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" /> Add to Order — Rs. {lineTotal}
      </button>
    </div>
  );
}
