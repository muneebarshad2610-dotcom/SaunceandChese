import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Phone, User, MessageSquareText } from 'lucide-react';
import type { CheckoutFormData } from '../../types';

interface Props {
  isOpen: boolean;
  cartItemCount: number;
  cartSubtotal: number;
  onClose: () => void;
  onSubmit: (data: CheckoutFormData) => void;
  loading: boolean;
}

export default function CheckoutForm({
  isOpen,
  cartItemCount,
  cartSubtotal,
  onClose,
  onSubmit,
  loading,
}: Props) {
  const [form, setForm] = useState<CheckoutFormData>({
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
    deliveryNotes: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CheckoutFormData, string>> = {};

    if (!form.customerName.trim()) newErrors.customerName = 'Name is required';
    if (!form.customerPhone.trim()) newErrors.customerPhone = 'Phone is required';
    else if (!/^[\d\s\+\-\(\)]{7,15}$/.test(form.customerPhone.trim()))
      newErrors.customerPhone = 'Enter a valid phone number';
    if (!form.deliveryAddress.trim()) newErrors.deliveryAddress = 'Delivery address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(form);
    }
  };

  const handleChange = (field: keyof CheckoutFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="relative bg-[#FDF5E6] border-4 border-[#C41E3A] rounded-[40px] max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl z-10"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-[#C41E3A] hover:scale-105 transition-transform cursor-pointer"
            >
              <X className="w-4 h-4 text-[#C41E3A]" />
            </button>

            {/* Header */}
            <div className="p-8 pb-4 text-center border-b-2 border-[#C41E3A]/10">
              <div className="w-16 h-16 bg-[#FFB81C] rounded-full flex items-center justify-center mx-auto border-4 border-[#C41E3A] mb-4">
                <MapPin className="w-7 h-7 text-[#C41E3A]" />
              </div>
              <h2 className="font-retro text-4xl text-[#C41E3A] uppercase tracking-wide leading-none">
                Delivery Details
              </h2>
              <p className="font-handwritten text-xl text-[#FFB81C] mt-1">
                Where's this gooeyness heading?
              </p>
              <div className="flex justify-center gap-4 mt-3 text-xs font-black text-[#C41E3A]/60 uppercase tracking-wider">
                <span>{cartItemCount} item(s)</span>
                <span className="text-[#C41E3A]">Rs. {cartSubtotal}</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-5 text-left">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-[#C41E3A]/60">
                  <User className="w-3.5 h-3.5" /> Full Name <span className="text-[#C41E3A]">*</span>
                </label>
                <input
                  type="text"
                  value={form.customerName}
                  onChange={(e) => handleChange('customerName', e.target.value)}
                  placeholder="e.g. Ali Khan"
                  className={`w-full bg-white/70 border-2 ${
                    errors.customerName ? 'border-red-400' : 'border-[#C41E3A]/20'
                  } rounded-2xl px-5 py-3.5 placeholder-[#C41E3A]/40 font-medium focus:bg-white focus:border-[#C41E3A] outline-none transition-all text-[#1A1A1A]`}
                />
                {errors.customerName && (
                  <p className="text-[10px] font-bold text-red-500">{errors.customerName}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-[#C41E3A]/60">
                  <Phone className="w-3.5 h-3.5" /> Phone Number <span className="text-[#C41E3A]">*</span>
                </label>
                <input
                  type="tel"
                  value={form.customerPhone}
                  onChange={(e) => handleChange('customerPhone', e.target.value)}
                  placeholder="e.g. 03XX-XXXXXXX"
                  className={`w-full bg-white/70 border-2 ${
                    errors.customerPhone ? 'border-red-400' : 'border-[#C41E3A]/20'
                  } rounded-2xl px-5 py-3.5 placeholder-[#C41E3A]/40 font-medium focus:bg-white focus:border-[#C41E3A] outline-none transition-all text-[#1A1A1A]`}
                />
                {errors.customerPhone && (
                  <p className="text-[10px] font-bold text-red-500">{errors.customerPhone}</p>
                )}
              </div>

              {/* Delivery Address */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-[#C41E3A]/60">
                  <MapPin className="w-3.5 h-3.5" /> Delivery Address <span className="text-[#C41E3A]">*</span>
                </label>
                <textarea
                  value={form.deliveryAddress}
                  onChange={(e) => handleChange('deliveryAddress', e.target.value)}
                  placeholder="House/Flat, Street, Area, Landmark..."
                  rows={3}
                  className={`w-full bg-white/70 border-2 ${
                    errors.deliveryAddress ? 'border-red-400' : 'border-[#C41E3A]/20'
                  } rounded-2xl px-5 py-3.5 placeholder-[#C41E3A]/40 font-medium focus:bg-white focus:border-[#C41E3A] outline-none transition-all text-[#1A1A1A] resize-none`}
                />
                {errors.deliveryAddress && (
                  <p className="text-[10px] font-bold text-red-500">{errors.deliveryAddress}</p>
                )}
              </div>

              {/* Delivery Notes */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-[#C41E3A]/60">
                  <MessageSquareText className="w-3.5 h-3.5" /> Delivery Notes
                  <span className="text-[10px] font-normal normal-case text-[#C41E3A]/30">(optional)</span>
                </label>
                <textarea
                  value={form.deliveryNotes}
                  onChange={(e) => handleChange('deliveryNotes', e.target.value)}
                  placeholder="Gate code, directions, or a cheesy message..."
                  rows={2}
                  className="w-full bg-white/70 border-2 border-[#C41E3A]/20 rounded-2xl px-5 py-3.5 placeholder-[#C41E3A]/40 font-medium focus:bg-white focus:border-[#C41E3A] outline-none transition-all text-[#1A1A1A] resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FFB81C] text-[#C41E3A] font-black py-4 rounded-2xl text-lg uppercase tracking-widest shadow-lg border-2 border-[#C41E3A] hover:bg-[#ffa71c] disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-[#C41E3A] border-t-transparent rounded-full animate-spin" />
                    Locking In...
                  </span>
                ) : (
                  `Place Order — Rs. ${cartSubtotal}`
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
