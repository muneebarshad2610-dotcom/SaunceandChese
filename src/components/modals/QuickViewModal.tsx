import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, X, Plus, Minus } from 'lucide-react';
import type { MenuItem } from '../../types';

interface QuickViewModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onAddToCart: (
    item: MenuItem,
    options: {
      qty: number;
      size?: 'small' | 'regular' | 'large';
      cheeseLevel: number;
      sauceType: string;
    }
  ) => void;
}

const SAUCE_OPTIONS = [
  'Liquid Gold',
  'Secret Lava',
  'White Truffle Melt',
  'Ghost Pepper Glaze',
] as const;

export default function QuickViewModal({
  item,
  onClose,
  onAddToCart,
}: QuickViewModalProps) {
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState<'small' | 'regular' | 'large'>('small');
  const [cheeseLevel, setCheeseLevel] = useState(4);
  const [sauceType, setSauceType] = useState<string>('Liquid Gold');
  const [isDragging, setIsDragging] = useState(false);
  const [pullHeight, setPullHeight] = useState(80);

  // Reset customization state when a different item is opened
  useEffect(() => {
    if (!item) return;
    setQty(1);
    setSelectedSize('small');
    const baseCheese = item.baseCheese ?? 4;
    setCheeseLevel(baseCheese);
    setPullHeight(baseCheese * 20);
    setSauceType(item.baseSauce ?? 'Liquid Gold');
  }, [item?.id]);

  const handleCheeseDrag = (_: any, info: any) => {
    const deltaY = -info.offset.y;
    setPullHeight((prev) => Math.max(15, Math.min(180, prev + deltaY)));
    const level = Math.max(1, Math.min(5, Math.round((pullHeight + deltaY) / 36)));
    setCheeseLevel(level);
  };

  const handleAdd = () => {
    if (!item) return;
    onAddToCart(item, {
      qty,
      size: item.prices ? selectedSize : undefined,
      cheeseLevel,
      sauceType,
    });
    onClose();
  };

  // Derive current price for display
  const currentPrice = item
    ? item.prices
      ? item.prices[selectedSize]
      : item.price
    : 0;

  return (
    <AnimatePresence>
      {item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key={item.id}
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="relative bg-[#FDF5E6] border-4 border-[#C41E3A] rounded-[40px] max-w-3xl w-full max-h-[92vh] overflow-y-auto flex flex-col md:flex-row shadow-2xl z-10"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-[#C41E3A] hover:scale-105 transition-transform cursor-pointer"
            >
              <X className="w-5 h-5 text-[#C41E3A]" />
            </button>

            {/* Left: Cheese pull visualizer */}
            <div className="w-full md:w-1/2 bg-[#FDF5E6] border-r-0 md:border-r-4 border-b-4 md:border-b-0 border-[#C41E3A] relative flex flex-col justify-between overflow-hidden">
              <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/80 border-2 border-[#C41E3A] px-3 py-1 rounded-full z-10 shadow-sm">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-wider text-[#C41E3A]">
                  Sensory Pull
                </span>
              </div>

              {/* Visualizer */}
              <div className="h-72 md:h-96 flex flex-col items-center justify-center relative mt-4">
                {/* Plate */}
                <div className="absolute w-52 h-52 rounded-full bg-[#1A1A1A] border-4 border-[#C41E3A] shadow-xl flex items-center justify-center">
                  {/* Crust */}
                  <div className="w-48 h-48 rounded-full bg-gradient-to-br from-amber-600 via-[#FFB81C] to-orange-500 border-2 border-orange-700 flex items-center justify-center shadow-inner overflow-hidden">
                    {/* Sauce pool */}
                    <div
                      className="w-40 h-40 rounded-full transition-all duration-300 flex items-center justify-center relative"
                      style={{
                        backgroundColor:
                          sauceType === 'Ghost Pepper Glaze'
                            ? 'rgba(180, 20, 20, 0.9)'
                            : sauceType === 'White Truffle Melt'
                              ? 'rgba(235, 230, 220, 0.95)'
                              : sauceType === 'Secret Lava'
                                ? 'rgba(239, 68, 68, 0.9)'
                                : 'rgba(255, 184, 28, 0.95)',
                      }}
                    >
                      <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-[#FFB81C] via-yellow-200 to-[#FFB81C]/90 shadow-md">
                        <div className="absolute top-6 left-12 w-6 h-5 bg-amber-700/40 rounded-full border border-amber-800/10 blur-[0.5px]" />
                        <div className="absolute bottom-8 right-14 w-8 h-6 bg-amber-700/30 rounded-full border border-amber-800/10 blur-[0.5px]" />
                        <div className="absolute top-16 right-6 w-4 h-4 bg-orange-600/40 rounded-full blur-[0.5px]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cheese pull SVG */}
                <div className="absolute bottom-28 flex flex-col items-center z-10">
                  <svg width="220" height="200" className="pointer-events-none overflow-visible">
                    <defs>
                      <linearGradient id="cheeseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#fffbeb" stopOpacity="0.95" />
                        <stop offset="30%" stopColor="#fef08a" stopOpacity="0.9" />
                        <stop offset="70%" stopColor="#fbbf24" stopOpacity="0.85" />
                        <stop offset="100%" stopColor="#d97706" stopOpacity="0.95" />
                      </linearGradient>
                    </defs>
                    <path
                      d={`M 60 140 Q ${70 - pullHeight * 0.1} ${140 - pullHeight * 0.5}, 80 ${140 - pullHeight}`}
                      fill="none"
                      stroke="url(#cheeseGrad)"
                      strokeWidth={Math.max(2.5, 9 - pullHeight / 15)}
                      className="transition-all duration-100"
                    />
                    <path
                      d={`M 85 142 Q 100 ${142 - pullHeight * 0.4}, 100 ${140 - pullHeight} Q 110 ${142 - pullHeight * 0.4}, 125 142 Z`}
                      fill="url(#cheeseGrad)"
                      opacity={0.9}
                      className="transition-all duration-100"
                    />
                    <path
                      d={`M 150 140 Q ${140 + pullHeight * 0.1} ${140 - pullHeight * 0.5}, 125 ${140 - pullHeight}`}
                      fill="none"
                      stroke="url(#cheeseGrad)"
                      strokeWidth={Math.max(2, 7 - pullHeight / 20)}
                      className="transition-all duration-100"
                    />
                  </svg>

                  {/* Drag handle */}
                  <motion.div
                    style={{ y: -pullHeight }}
                    className="absolute bg-[#1A1A1A] border-2 border-[#FFB81C] px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 cursor-grab hover:border-white select-none active:cursor-grabbing group"
                    onPan={handleCheeseDrag}
                    onPanStart={() => setIsDragging(true)}
                    onPanEnd={() => setIsDragging(false)}
                  >
                    <Flame className="w-4 h-4 text-[#FFB81C] animate-pulse" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest font-retro">
                      {isDragging ? 'SLIDING STRETCH!' : 'DRAG TO PULL CHEESE'}
                    </span>
                  </motion.div>
                </div>
              </div>

              <div className="bg-[#C41E3A] text-white py-2 text-center text-[10px] font-black uppercase tracking-widest font-retro border-t-2 border-[#C41E3A]">
                Stretch Factor: {Math.round(pullHeight / 1.8)}% &bull;{' '}
                {cheeseLevel * 1.5}oz Curd Melt
              </div>
            </div>

            {/* Right: Customization panel */}
            <div className="w-full md:w-1/2 p-8 space-y-6 text-left flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h2 className="font-retro text-4xl sm:text-5xl text-[#C41E3A] uppercase tracking-wide">
                    {item.name}
                  </h2>
                  <p className="text-sm text-[#C41E3A]/70 leading-relaxed mt-1">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-3xl font-black text-[#FFB81C] font-retro tracking-wider">
                  <span>Rs. {currentPrice}</span>
                </div>

                <div className="space-y-4 pt-2 border-t border-[#C41E3A]/10">
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

                  {/* Cheese level */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[11px] font-black uppercase text-[#C41E3A]/50">
                      <span>Cheese Pull Quantity</span>
                      <span className="text-[#C41E3A] font-black font-mono">
                        x{cheeseLevel}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={cheeseLevel}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setCheeseLevel(val);
                        setPullHeight(val * 32);
                      }}
                      className="w-full accent-[#C41E3A] bg-orange-100 h-1.5 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Sauce */}
                  <div className="space-y-2">
                    <label className="font-black uppercase text-[10px] tracking-widest text-[#C41E3A]/50 block">
                      Sauce Drizzle Infusion
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {SAUCE_OPTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSauceType(s)}
                          className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider text-left border-2 cursor-pointer transition-colors ${
                            sauceType === s
                              ? 'bg-[#FFB81C]/20 border-[#C41E3A] text-[#C41E3A]'
                              : 'bg-white border-[#C41E3A]/20 hover:border-[#C41E3A] text-[#C41E3A]/80'
                          }`}
                        >
                          {s}
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
                      <span className="w-6 text-center font-black text-sm">
                        {qty}
                      </span>
                      <button
                        onClick={() => setQty((p) => p + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-[#C41E3A] hover:text-white rounded-xl transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleAdd}
                className="w-full btn-hover bg-[#FFB81C] text-[#C41E3A] font-black py-4.5 rounded-full uppercase tracking-widest text-base shadow-lg border-2 border-[#C41E3A] hover:bg-[#ffa71c] cursor-pointer mt-4"
              >
                Add To Cravings Basket
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
