import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, Flame, Sparkles, Layers, MapPin } from 'lucide-react';
import type { OrderDetails } from '../../types';

const KITCHEN_STEPS = [
  { label: 'Order Confirmed', icon: Flame, text: 'Restaurant has received your order and is prepping it' },
  { label: 'Being Prepared', icon: Sparkles, text: 'Sizzling in the kitchen at KAECHS Block 5' },
  { label: 'Packed & Ready', icon: Layers, text: 'Freshly made and packed with care' },
  { label: 'Rider Out on KAECHS Lane', icon: MapPin, text: 'Speeding through Karachi, arriving hot and fresh' },
];

interface Props {
  isOpen: boolean;
  orderDetails: OrderDetails | null;
  onClose: () => void;
  estimatedDeliveryAt?: string | null;
}

export default function OrderSuccessModal({ isOpen, orderDetails, onClose, estimatedDeliveryAt }: Props) {
  return (
    <AnimatePresence>
      {isOpen && orderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            className="relative bg-[#FDF5E6] border-4 border-[#C41E3A] rounded-[40px] max-w-lg w-full p-8 text-center shadow-2xl z-10 space-y-6 overflow-hidden"
          >
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-[#FFB81C] rounded-full opacity-35 blur-xl" />
            <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-[#C41E3A] rounded-full opacity-20 blur-xl" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow border-2 border-[#C41E3A] hover:scale-105 transition-transform cursor-pointer"
            >
              <X className="w-4 h-4 text-[#C41E3A]" />
            </button>

            <div className="w-20 h-20 bg-[#FFB81C] rounded-full flex items-center justify-center mx-auto border-4 border-[#C41E3A] retro-shadow-sm animate-bounce">
              <CheckCircle2 className="w-10 h-10 text-[#C41E3A] stroke-[3]" />
            </div>

            <div className="space-y-2">
              <h3 className="font-retro text-4xl text-[#C41E3A] uppercase tracking-wide leading-none">
                ORDER LOCKED IN!
              </h3>
              <p className="font-handwritten text-2xl text-[#FFB81C]">Keep staying gooey, Karachi!</p>
            </div>

          <div className="bg-white border-2 border-[#C41E3A] rounded-2xl p-4 text-left space-y-3 font-mono text-xs text-[#C41E3A]/90 shadow-sm relative">
            <div className="absolute top-2 right-2 font-black bg-[#FFB81C]/15 px-2 py-0.5 rounded text-[10px] uppercase">PAID</div>
            <div className="flex justify-between border-b border-dashed border-[#C41E3A]/20 pb-2">
              <span>ORDER NUMBER:</span>
              <span className="font-bold text-[#1A1A1A]">{orderDetails.id}</span>
            </div>
            <div className="flex justify-between">
              <span>CRITICAL ITEMS:</span>
              <span className="font-bold text-[#1A1A1A]">{orderDetails.itemsCount} portion(s)</span>
            </div>
            <div className="flex justify-between">
              <span>LOCATION SOURCE:</span>
              <span className="font-bold text-[#1A1A1A]">KAECHS Block 5 Karachi</span>
            </div>
            {estimatedDeliveryAt && (
              <div className="flex justify-between">
                <span>EST. DELIVERY:</span>
                <span className="font-bold text-[#FFB81C]">
                  {new Date(estimatedDeliveryAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t border-[#C41E3A]/10 pt-2 text-sm font-black">
              <span>TOTAL PAID:</span>
              <span className="text-[#C41E3A]">Rs. {orderDetails.total}</span>
            </div>
          </div>

            <div className="border-t-2 border-dashed border-[#C41E3A]/20 pt-4 space-y-4">
              <div className="flex justify-between items-center text-xs font-black uppercase text-[#C41E3A]/50">
                <span>LIVE KITCHEN TRACKER</span>
                <span className="text-[#FFB81C] font-black font-mono animate-pulse">SIZZLING...</span>
              </div>

              <div className="space-y-3 text-left">
                {KITCHEN_STEPS.map((step, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-5 h-5 rounded-full bg-[#FFB81C]/20 border border-[#C41E3A]/20 flex items-center justify-center text-[#C41E3A] mt-0.5 scale-90 flex-shrink-0">
                      <step.icon className="w-3 h-3" />
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase text-[#C41E3A]">{step.label}</div>
                      <div className="text-[10px] text-[#C41E3A]/70">{step.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-[#C41E3A] hover:bg-[#b01630] text-white font-black py-3 rounded-xl uppercase tracking-wider text-xs transition-colors cursor-pointer"
            >
              Track on WhatsApp / Close
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
