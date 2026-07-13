import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { MenuItem } from '../../types';
import MenuCard from '../ui/MenuCard';
import SkeletonCard from '../ui/SkeletonCard';

interface Props {
  items: MenuItem[];
  loading: boolean;
  onQuickView: (item: MenuItem) => void;
  onQuickAdd: (item: MenuItem) => void;
}

export default function MenuSection({ items, loading, onQuickView, onQuickAdd }: Props) {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [activeType, setActiveType] = useState<string>('all');

  const categories = useMemo(() => {
    const cats = [...new Set(items.filter((i) => i.category !== 'deal').map((i) => i.productCategory).filter(Boolean))];
    return cats.sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (item.category === 'deal') return false;
      if (activeFilter !== 'all' && item.productCategory !== activeFilter) return false;
      if (activeType !== 'all' && item.category !== activeType) return false;
      return true;
    });
  }, [items, activeFilter, activeType]);

  const typeCounts = useMemo(() => {
    const c = { classic: 0, special: 0 };
    const pool = activeFilter === 'all' ? items.filter((i) => i.category !== 'deal') : items.filter((i) => i.productCategory === activeFilter && i.category !== 'deal');
    pool.forEach((i) => { if (i.category === 'classic') c.classic++; else if (i.category === 'special') c.special++; });
    return c;
  }, [items, activeFilter]);

  return (
    <section id="menu" className="py-20 px-6 md:px-12 bg-white/40 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="font-retro text-6xl md:text-7xl text-[#C41E3A] uppercase tracking-wider mb-2">
          Retro Favorites
        </h2>
        <p className="font-handwritten text-2xl md:text-3xl text-[#FFB81C] leading-none">
          Hand-crafted comfort, just the way you crave it.
        </p>
      </div>

      {/* Product category tabs */}
      <div className="flex flex-wrap justify-center gap-3 mb-4">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-6 py-2.5 rounded-full font-black text-xs md:text-sm uppercase tracking-widest border-2 border-[#C41E3A] cursor-pointer transition-all duration-150 ${
            activeFilter === 'all'
              ? 'bg-[#C41E3A] text-white shadow-[3px_3px_0px_0px_#FFB81C] -translate-y-0.5'
              : 'text-[#C41E3A] hover:bg-[#C41E3A]/5 bg-transparent'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-6 py-2.5 rounded-full font-black text-xs md:text-sm uppercase tracking-widest border-2 border-[#C41E3A] cursor-pointer transition-all duration-150 ${
              activeFilter === cat
                ? 'bg-[#C41E3A] text-white shadow-[3px_3px_0px_0px_#FFB81C] -translate-y-0.5'
                : 'text-[#C41E3A] hover:bg-[#C41E3A]/5 bg-transparent'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Type sub-filter (classic / special) */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {[
          { id: 'all', label: 'All Types' },
          { id: 'classic', label: `Classic (${typeCounts.classic})` },
          { id: 'special', label: `Special (${typeCounts.special})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveType(tab.id)}
            className={`px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest border cursor-pointer transition-all ${
              activeType === tab.id
                ? 'bg-[#FFB81C] text-[#C41E3A] border-[#FFB81C]'
                : 'text-[#C41E3A]/50 border-[#C41E3A]/20 hover:border-[#C41E3A]/40 bg-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
        <AnimatePresence mode="popLayout">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={`skeleton-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <SkeletonCard />
              </motion.div>
            ))
          ) : filteredItems.length === 0 ? (
            <motion.div
              key="no-items"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="col-span-full py-16 px-6 text-center bg-white border-4 border-[#C41E3A] rounded-[36px] max-w-lg mx-auto shadow-md"
            >
              <p className="font-retro text-3xl md:text-4xl text-[#C41E3A] uppercase tracking-wide mb-3">
                Kitchen Updating!
              </p>
              <p className="text-sm md:text-base text-[#C41E3A]/70 leading-relaxed font-sans">
                We are currently updating our products menu to bring you some
                fresh, hand-crafted flavors. Check back soon for the ultimate
                late night feast!
              </p>
            </motion.div>
          ) : (
            filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <MenuCard item={item} onQuickView={onQuickView} onQuickAdd={onQuickAdd} />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
