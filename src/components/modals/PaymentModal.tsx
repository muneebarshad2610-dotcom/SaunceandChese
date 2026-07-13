import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Lock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { getPaymentGateway } from '../../services/payment';

interface Props {
  isOpen: boolean;
  amount: number;
  onSuccess: (transactionId: string) => void;
  onCancel: () => void;
}

type PaymentState = 'form' | 'processing' | 'success' | 'failed';

export default function PaymentModal({ isOpen, amount, onSuccess, onCancel }: Props) {
  const [state, setState] = useState<PaymentState>('form');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const processingRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      setState('form');
      setCardNumber('');
      setExpiry('');
      setCvv('');
      setMessage('');
      setError('');
      processingRef.current = false;
    }
  }, [isOpen]);

  const formatCard = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const handlePay = async () => {
    if (!cardNumber.replace(/\s/g, '').match(/^\d{13,19}$/)) {
      setError('Enter a valid card number');
      return;
    }
    if (!expiry.match(/^\d{2}\/\d{2}$/)) {
      setError('Enter a valid expiry (MM/YY)');
      return;
    }
    if (!cvv.match(/^\d{3,4}$/)) {
      setError('Enter a valid CVV');
      return;
    }

    setError('');
    setState('processing');
    processingRef.current = true;

    const gateway = getPaymentGateway();
    const result = await gateway.charge(amount, 'PKR');

    if (!processingRef.current) return;

    if (result.success) {
      setMessage(result.message);
      setState('success');
      await new Promise((r) => setTimeout(r, 1500));
      if (processingRef.current) {
        onSuccess(result.transactionId);
      }
    } else {
      setMessage(result.message);
      setState('failed');
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
            onClick={state === 'form' ? onCancel : undefined}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="relative bg-[#FDF5E6] border-4 border-[#C41E3A] rounded-[40px] max-w-sm w-full p-8 shadow-2xl z-10 text-center"
          >
            {state === 'form' && (
              <>
                <div className="w-16 h-16 bg-[#FFB81C] rounded-full flex items-center justify-center mx-auto border-4 border-[#C41E3A] mb-4">
                  <CreditCard className="w-7 h-7 text-[#C41E3A]" />
                </div>
                <h3 className="font-retro text-3xl text-[#C41E3A] uppercase tracking-wide leading-none mb-1">
                  Payment
                </h3>
                <p className="font-handwritten text-xl text-[#FFB81C] mb-5">
                  Rs. {amount.toLocaleString()}
                </p>

                <div className="space-y-3 text-left mb-6">
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-widest text-[#C41E3A]/60 block mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCard(e.target.value))}
                      placeholder="4242 4242 4242 4242"
                      className="w-full bg-white/70 border-2 border-[#C41E3A]/20 rounded-2xl px-5 py-3.5 placeholder-[#C41E3A]/40 font-medium focus:bg-white focus:border-[#C41E3A] outline-none transition-all text-[#1A1A1A]"
                    />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-[11px] font-black uppercase tracking-widest text-[#C41E3A]/60 block mb-1">
                        Expiry
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={expiry}
                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                        placeholder="MM/YY"
                        className="w-full bg-white/70 border-2 border-[#C41E3A]/20 rounded-2xl px-5 py-3.5 placeholder-[#C41E3A]/40 font-medium focus:bg-white focus:border-[#C41E3A] outline-none transition-all text-[#1A1A1A]"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[11px] font-black uppercase tracking-widest text-[#C41E3A]/60 block mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="123"
                        className="w-full bg-white/70 border-2 border-[#C41E3A]/20 rounded-2xl px-5 py-3.5 placeholder-[#C41E3A]/40 font-medium focus:bg-white focus:border-[#C41E3A] outline-none transition-all text-[#1A1A1A]"
                      />
                    </div>
                  </div>
                  {error && <p className="text-xs font-bold text-red-500">{error}</p>}
                </div>

                <button
                  onClick={handlePay}
                  className="w-full bg-[#FFB81C] text-[#C41E3A] font-black py-4 rounded-2xl text-base uppercase tracking-widest shadow-lg border-2 border-[#C41E3A] hover:bg-[#ffa71c] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Pay Rs. {amount.toLocaleString()}
                </button>
                <button
                  onClick={onCancel}
                  className="mt-3 text-xs font-black uppercase tracking-wider text-[#C41E3A]/50 hover:text-[#C41E3A] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </>
            )}

            {state === 'processing' && (
              <div className="py-8">
                <Loader2 className="w-16 h-16 text-[#FFB81C] animate-spin mx-auto mb-5" />
                <h3 className="font-retro text-2xl text-[#C41E3A] uppercase tracking-wide leading-none mb-2">
                  Processing...
                </h3>
                <p className="text-sm text-[#C41E3A]/60">Please don't close this window</p>
              </div>
            )}

            {state === 'success' && (
              <div className="py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-5" />
                <h3 className="font-retro text-2xl text-[#C41E3A] uppercase leading-none mb-2">
                  Payment Successful!
                </h3>
                <p className="text-sm text-[#C41E3A]/60">{message}</p>
              </div>
            )}

            {state === 'failed' && (
              <div className="py-8">
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-5" />
                <h3 className="font-retro text-2xl text-[#C41E3A] uppercase leading-none mb-2">
                  Payment Failed
                </h3>
                <p className="text-sm text-[#C41E3A]/60 mb-5">{message}</p>
                <button
                  onClick={() => setState('form')}
                  className="bg-[#FFB81C] text-[#C41E3A] font-black py-3 px-8 rounded-2xl uppercase tracking-widest text-sm shadow-lg border-2 border-[#C41E3A] hover:bg-[#ffa71c] transition-all cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
