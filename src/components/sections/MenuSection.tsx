import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { MenuItem } from '../../types';
import MenuCard from '../ui/MenuCard';

interface MenuSectionProps {
  items: MenuItem[];
  onQuickView: (item: MenuItem) => void;
  onQuickAdd: (item: MenuItem) => void;
}

const TABS = [
  { id: 'all', label: 'All Cravings' },
  { id: 'classic', label: 'Classic Flavours' },
  { id: 'special', label: 'Special Flavours' },
] as const;

export default function MenuSection({
  items,
  onQuickView,
  onQuickAdd,
}: MenuSectionProps) {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filteredItems = useMemo(() => {
    return activeFilter === 'all'
      ? items.filter((item) => item.category !== 'deal')
      : items.filter((item) => item.category === activeFilter);
  }, [items, activeFilter]);

  return (
    <section
      id="menu"
      className="py-20 px-6 md:px-12 bg-white/40 max-w-7xl mx-auto"
    >
      <div className="text-center mb-12">
        <h2 className="font-retro text-6xl md:text-7xl text-[#C41E3A] uppercase tracking-wider mb-2">
          Retro Favorites
        </h2>
        <p className="font-handwritten text-2xl md:text-3xl text-[#FFB81C] leading-none">
          Hand-crafted comfort, just the way you crave it.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap justify-center gap-3 mb-16">
        {TABS.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-6 py-2.5 rounded-full font-black text-xs md:text-sm uppercase tracking-widest border-2 border-[#C41E3A] cursor-pointer transition-all duration-150 ${
                isActive
                  ? 'bg-[#C41E3A] text-white shadow-[3px_3px_0px_0px_#FFB81C] -translate-y-0.5'
                  : 'text-[#C41E3A] hover:bg-[#C41E3A]/5 bg-transparent'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
        <AnimatePresence mode="popLayout">
          {filteredItems.length === 0 ? (
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
                <MenuCard
                  item={item}
                  onQuickView={onQuickView}
                  onQuickAdd={onQuickAdd}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
