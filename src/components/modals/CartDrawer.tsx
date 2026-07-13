import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, X, Minus, Plus, Trash2 } from 'lucide-react';
import { SignInButton } from '@clerk/react';
import type { CartItem } from '../../types';

interface Props {
  isOpen: boolean;
  cart: CartItem[];
  cartItemCount: number;
  cartSubtotal: number;
  onClose: () => void;
  onAdjustQty: (index: number, delta: number) => void;
  onRemoveItem: (index: number) => void;
  onCheckout: () => void;
  checkoutLoading?: boolean;
  isSignedIn: boolean;
}

export default function CartDrawer({
  isOpen,
  cart,
  cartItemCount,
  cartSubtotal,
  onClose,
  onAdjustQty,
  onRemoveItem,
  onCheckout,
  checkoutLoading,
  isSignedIn,
}: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="w-screen max-w-md bg-[#FDF5E6] border-l-4 border-[#C41E3A] shadow-2xl p-6 md:p-8 flex flex-col justify-between"
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-[#C41E3A]/10">
                  <h2 className="font-retro text-4xl text-[#C41E3A] uppercase tracking-wide">
                    Your Order
                  </h2>
                  <button
                    onClick={onClose}
                    className="text-2xl text-[#C41E3A] hover:rotate-90 transition-transform cursor-pointer"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6 overflow-y-auto max-h-[55vh] pr-2">
                  {cart.length === 0 ? (
                    <div className="text-center py-20 opacity-45 space-y-4">
                      <ShoppingBag className="w-16 h-16 mx-auto text-[#C41E3A]" />
                      <p className="font-handwritten text-2xl text-[#C41E3A]">
                        Your basket is empty!
                      </p>
                      <p className="text-xs text-[#C41E3A]/80 max-w-[200px] mx-auto leading-normal">
                        Drizzle up some choices from our Retro Favorites above!
                      </p>
                    </div>
                  ) : (
                    cart.map((item, idx) => (
                      <div
                        key={`${item.id}-${idx}`}
                        className="flex gap-4 bg-white/70 p-4 rounded-[24px] border-2 border-[#C41E3A]/10 text-left relative"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-18 h-18 rounded-[16px] object-cover border-2 border-[#C41E3A]/20"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-black uppercase text-[#C41E3A] text-sm leading-tight max-w-[80%]">
                              {item.name}
                            </h4>
                            <button
                              onClick={() => onRemoveItem(idx)}
                              className="text-[#C41E3A] opacity-40 hover:opacity-100 transition-opacity cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-x-2 gap-y-1 text-[10px] font-bold text-[#FFB81C] uppercase font-retro tracking-wider">
                            {item.selectedSize && (
                              <span className="bg-[#C41E3A]/5 text-[#C41E3A] px-1.5 py-0.5 rounded border border-[#C41E3A]/10">
                                Size: {item.selectedSize}
                              </span>
                            )}
                            <span className="bg-[#FFB81C]/10 text-[#C41E3A] px-1.5 py-0.5 rounded border border-[#FFB81C]/20">
                              Cheese Pull: x{item.customCheese}
                            </span>
                          </div>

                          <div className="flex justify-between items-center pt-2 mt-2 border-t border-[#C41E3A]/5">
                            <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-xl border border-[#C41E3A]/10 scale-90 -ml-1">
                              <button
                                onClick={() => onAdjustQty(idx, -1)}
                                className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#C41E3A] hover:text-white transition-colors cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-black text-xs text-[#C41E3A]">{item.qty}</span>
                              <button
                                onClick={() => onAdjustQty(idx, 1)}
                                className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#C41E3A] hover:text-white transition-colors cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="font-black text-base text-[#C41E3A]">
                              Rs. {item.price * item.qty}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Footer: subtotal + checkout / sign-in gate */}
              <div className="pt-6 border-t-2 border-[#C41E3A]/10 space-y-4 text-left">
                <div className="flex justify-between items-end">
                  <span className="font-retro text-2xl text-[#C41E3A] tracking-wider uppercase">
                    Subtotal
                  </span>
                  <span className="font-black text-3xl text-[#C41E3A]">
                    Rs. {cartSubtotal}
                  </span>
                </div>

                {cart.length > 0 && !isSignedIn && (
                  <SignInButton mode="modal">
                    <button className="w-full bg-[#FFB81C] text-[#C41E3A] font-black py-4 rounded-2xl text-lg uppercase tracking-widest shadow-lg border-2 border-[#C41E3A] hover:bg-[#ffa71c] cursor-pointer">
                      Sign In to Checkout
                    </button>
                  </SignInButton>
                )}

                {cart.length > 0 && isSignedIn && (
                  <button
                    onClick={onCheckout}
                    disabled={checkoutLoading}
                    className="w-full bg-[#FFB81C] text-[#C41E3A] font-black py-4 rounded-2xl text-lg uppercase tracking-widest shadow-lg border-2 border-[#C41E3A] hover:bg-[#ffa71c] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {checkoutLoading ? 'Locking In...' : 'Checkout Now'}
                  </button>
                )}

                {cart.length === 0 && (
                  <button
                    disabled
                    className="w-full bg-[#FDF5E6] text-stone-400 border-2 border-stone-200 py-4 rounded-2xl text-lg uppercase tracking-widest cursor-not-allowed text-center"
                  >
                    Empty Basket
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
