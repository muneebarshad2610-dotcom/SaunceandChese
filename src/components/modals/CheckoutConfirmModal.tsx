import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ArrowLeft, ShoppingBag } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onProceed: () => void;
  onCancel: () => void;
}

export default function CheckoutConfirmModal({ isOpen, onProceed, onCancel }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="relative bg-[#FDF5E6] border-4 border-[#C41E3A] rounded-[40px] max-w-sm w-full p-8 shadow-2xl z-10 text-center"
          >
            <div className="w-16 h-16 bg-[#FFB81C] rounded-full flex items-center justify-center mx-auto border-4 border-[#C41E3A] mb-5">
              <ShoppingBag className="w-8 h-8 text-[#C41E3A]" />
            </div>

            <h3 className="font-retro text-3xl text-[#C41E3A] uppercase tracking-wide leading-none mb-3">
              Almost There!
            </h3>
            <p className="font-handwritten text-xl text-[#FFB81C] mb-4">You're one step away...</p>

            <div className="bg-white border-2 border-[#C41E3A]/15 rounded-2xl p-4 mb-6 text-left">
              <p className="text-sm text-[#C41E3A]/80 leading-relaxed">
                You'll be taken to a <strong className="text-[#C41E3A]">delivery details</strong> form to enter your
                name, phone, and delivery address before placing the order.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={onProceed}
                className="w-full bg-[#FFB81C] text-[#C41E3A] font-black py-3.5 rounded-2xl uppercase tracking-widest text-sm shadow-lg border-2 border-[#C41E3A] hover:bg-[#ffa71c] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                Proceed to Delivery Details
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onCancel}
                className="text-xs font-black uppercase tracking-wider text-[#C41E3A]/50 hover:text-[#C41E3A] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Go Back to Cart
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
