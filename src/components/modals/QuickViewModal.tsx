import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus, Sparkles, Droplets, Wine } from 'lucide-react';
import type { MenuItem } from '../../types';
import {
  SAUCE_OPTIONS,
  DRINK_OPTIONS,
  EXTRA_CHEESE_PRICE,
} from '../../types';

interface Props {
  item: MenuItem | null;
  onClose: () => void;
  onAddToCart: (
    item: MenuItem,
    options: { qty: number; size?: 'small' | 'regular' | 'large'; extraCheese: boolean; sauce: string; drink: string }
  ) => void;
}

export default function QuickViewModal({ item, onClose, onAddToCart }: Props) {
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState<'small' | 'regular' | 'large'>('small');
  const [extraCheese, setExtraCheese] = useState(false);
  const [sauce, setSauce] = useState('Ketchup');
  const [drink, setDrink] = useState('');

  useEffect(() => {
    if (!item) return;
    setQty(1);
    setSelectedSize('small');
    setExtraCheese(false);
    setSauce('Ketchup');
    setDrink('');
  }, [item?.id]);

  const currentItemPrice = item
    ? item.prices
      ? item.prices[selectedSize]
      : item.price
    : 0;

  const selectedDrinkPrice = drink
    ? DRINK_OPTIONS.find((d) => d.name === drink)?.price ?? 0
    : 0;

  const addonTotal = (extraCheese ? EXTRA_CHEESE_PRICE : 0) + selectedDrinkPrice;
  const lineTotal = (currentItemPrice * qty) + (addonTotal * qty);

  const handleAdd = () => {
    if (!item) return;
    onAddToCart(item, {
      qty,
      size: item.prices ? selectedSize : undefined,
      extraCheese,
      sauce,
      drink,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            key={item.id}
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="relative bg-[#FDF5E6] border-4 border-[#C41E3A] rounded-[40px] max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl z-10"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-[#C41E3A] hover:scale-105 transition-transform cursor-pointer"
            >
              <X className="w-5 h-5 text-[#C41E3A]" />
            </button>

            {/* Item Image */}
            <div className="w-full aspect-video overflow-hidden rounded-t-[36px] border-b-4 border-[#C41E3A]">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Customization Panel */}
            <div className="p-8 space-y-5 text-left">
              {/* Name & Description */}
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-retro text-4xl sm:text-5xl text-[#C41E3A] uppercase tracking-wide leading-tight">
                      {item.name}
                    </h2>
                    <p className="text-xs text-[#C41E3A]/70 leading-relaxed mt-1">{item.description}</p>
                  </div>
                  <span className="text-2xl font-black text-[#FFB81C] whitespace-nowrap font-retro tracking-wider">
                    Rs. {currentItemPrice}
                  </span>
                </div>
              </div>

              <div className="space-y-5 pt-2 border-t border-[#C41E3A]/10">
                {/* Size selector */}
                {item.prices && (
                  <div className="space-y-2">
                    <label className="font-black uppercase text-[10px] tracking-widest text-[#C41E3A]/50 block">
                      Select Pizza Size
                    </label>
                    <div className="flex gap-2">
                      {(['small', 'regular', 'large'] as const).map((sz) => (
                        <button
                          key={sz}
                          onClick={() => setSelectedSize(sz)}
                          className={`flex-1 py-2.5 border-2 border-[#C41E3A] rounded-xl font-black text-xs uppercase tracking-wider cursor-pointer transition-all ${
                            selectedSize === sz
                              ? 'bg-[#C41E3A] text-white shadow-[2px_2px_0px_0px_#FFB81C]'
                              : 'bg-white hover:bg-[#C41E3A]/5 text-[#C41E3A]'
                          }`}
                        >
                          {sz} (Rs. {item.prices?.[sz]})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extra Cheese */}
                <div className="space-y-2">
                  <label className="font-black uppercase text-[10px] tracking-widest text-[#C41E3A]/50 block">
                    Extras
                  </label>
                  <button
                    onClick={() => setExtraCheese(!extraCheese)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                      extraCheese
                        ? 'bg-[#FFB81C]/15 border-[#C41E3A]'
                        : 'bg-white border-[#C41E3A]/15 hover:border-[#C41E3A]/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles className={`w-5 h-5 ${extraCheese ? 'text-[#FFB81C]' : 'text-[#C41E3A]/40'}`} />
                      <span className="font-black text-xs uppercase tracking-wider text-[#C41E3A]">
                        Extra Cheese
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#C41E3A]/60">+ Rs. {EXTRA_CHEESE_PRICE}</span>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        extraCheese
                          ? 'bg-[#C41E3A] border-[#C41E3A]'
                          : 'border-[#C41E3A]/30'
                      }`}>
                        {extraCheese && <span className="text-white text-xs font-black">✓</span>}
                      </div>
                    </div>
                  </button>
                </div>

                {/* Sauce Selection */}
                <div className="space-y-2">
                  <label className="flex items-center gap-1.5 font-black uppercase text-[10px] tracking-widest text-[#C41E3A]/50 block">
                    <Droplets className="w-3.5 h-3.5" />
                    Sauce
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {SAUCE_OPTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSauce(s)}
                        className={`px-2 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider text-center border-2 cursor-pointer transition-all ${
                          sauce === s
                            ? 'bg-[#C41E3A] text-white border-[#C41E3A]'
                            : 'bg-white border-[#C41E3A]/10 hover:border-[#C41E3A]/30 text-[#C41E3A]/80'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Drink Selection */}
                <div className="space-y-2">
                  <label className="flex items-center gap-1.5 font-black uppercase text-[10px] tracking-widest text-[#C41E3A]/50 block">
                    <Wine className="w-3.5 h-3.5" />
                    Cold Drink <span className="text-[#C41E3A]/30 normal-case text-[8px]">(optional)</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {DRINK_OPTIONS.map((d) => (
                      <button
                        key={d.name}
                        onClick={() => setDrink(drink === d.name ? '' : d.name)}
                        className={`px-2 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider text-center border-2 cursor-pointer transition-all ${
                          drink === d.name
                            ? 'bg-[#FFB81C]/20 border-[#C41E3A] text-[#C41E3A]'
                            : 'bg-white border-[#C41E3A]/10 hover:border-[#C41E3A]/30 text-[#C41E3A]/60'
                        }`}
                      >
                        {d.name}
                        <span className="block text-[8px] opacity-70">Rs. {d.price}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div className="space-y-2 pt-1">
                  <label className="font-black uppercase text-[10px] tracking-widest text-[#C41E3A]/50 block">
                    Quantity
                  </label>
                  <div className="flex items-center gap-4 bg-white/60 w-fit p-1 rounded-2xl border-2 border-[#C41E3A]/20">
                    <button
                      onClick={() => setQty((p) => Math.max(1, p - 1))}
                      className="w-8 h-8 flex items-center justify-center hover:bg-[#C41E3A] hover:text-white rounded-xl transition-colors cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-6 text-center font-black text-sm">{qty}</span>
                    <button
                      onClick={() => setQty((p) => p + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-[#C41E3A] hover:text-white rounded-xl transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Total + Add Button */}
              <div className="pt-4 border-t-2 border-[#C41E3A]/10 space-y-3">
                {addonTotal > 0 && (
                  <div className="flex justify-between text-[11px] text-[#C41E3A]/60">
                    <span>Add-ons</span>
                    <span>+ Rs. {addonTotal} each</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline">
                  <span className="font-black text-lg text-[#C41E3A]">Total</span>
                  <span className="font-black text-2xl text-[#FFB81C]">Rs. {lineTotal}</span>
                </div>
                <button
                  onClick={handleAdd}
                  className="w-full bg-[#FFB81C] text-[#C41E3A] font-black py-4 rounded-full uppercase tracking-widest text-base shadow-lg border-2 border-[#C41E3A] hover:bg-[#ffa71c] cursor-pointer mt-2"
                >
                  Add To Cravings Basket
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
