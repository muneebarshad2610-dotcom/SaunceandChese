import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ArrowLeft, Loader2 } from 'lucide-react';
import { useScrollLock } from '../../hooks/useScrollLock';

interface Props {
  isOpen: boolean;
  amount: number;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function PaymentModal({ isOpen, amount, loading, onConfirm, onCancel }: Props) {
  useScrollLock(isOpen);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={loading ? undefined : onCancel}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="relative bg-[#FDF5E6] border-4 border-[#C41E3A] rounded-[40px] max-w-sm w-full p-8 shadow-2xl z-10 text-center"
          >
            <div className="w-16 h-16 bg-[#FFB81C] rounded-full flex items-center justify-center mx-auto border-4 border-[#C41E3A] mb-4">
              <ShoppingBag className="w-7 h-7 text-[#C41E3A]" />
            </div>
            <h3 className="font-retro text-3xl text-[#C41E3A] uppercase tracking-wide leading-none mb-1">
              Confirm Order
            </h3>
            <p className="font-handwritten text-xl text-[#FFB81C] mb-6">
              Rs. {amount.toLocaleString()}
            </p>
            <p className="text-sm text-[#C41E3A]/60 mb-6">
              By placing this order, you agree to pay upon delivery. No online payment is processed.
            </p>

            <button
              onClick={onConfirm}
              disabled={loading}
              className="w-full bg-[#FFB81C] text-[#C41E3A] font-black py-4 rounded-2xl text-base uppercase tracking-widest shadow-lg border-2 border-[#C41E3A] hover:bg-[#ffa71c] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Placing Order...</>
              ) : (
                <><ShoppingBag className="w-4 h-4" /> Place Order — Rs. {amount.toLocaleString()}</>
              )}
            </button>
            <button
              onClick={onCancel}
              disabled={loading}
              className="mt-3 text-xs font-black uppercase tracking-wider text-[#C41E3A]/50 hover:text-[#C41E3A] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowLeft className="w-3 h-3" /> Back to Details
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
