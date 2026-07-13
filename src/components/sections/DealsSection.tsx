import { motion } from 'motion/react';
import type { MenuItem } from '../../types';
import DealCard from '../ui/DealCard';

interface DealsSectionProps {
  items: MenuItem[];
  onQuickView: (item: MenuItem) => void;
  onQuickAdd: (item: MenuItem) => void;
}

export default function DealsSection({
  items,
  onQuickView,
  onQuickAdd,
}: DealsSectionProps) {
  const deals = items.filter((item) => item.category === 'deal');

  return (
    <section
      id="hot-deals"
      className="py-20 px-6 md:px-12 bg-[#FFB81C]/10 border-y-4 border-[#C41E3A] relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#C41E3A_2px,transparent_2px)] [background-size:16px_16px]" />

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 relative">
          <div className="inline-block bg-[#C41E3A] text-[#FFB81C] border-4 border-[#C41E3A] px-6 py-2 rounded-2xl font-retro text-lg md:text-xl uppercase tracking-wider mb-4 -rotate-1 shadow-[4px_4px_0px_0px_#FFB81C]">
            Save Big & Feast Hard!
          </div>
          <h2 className="font-retro text-6xl md:text-7xl text-[#C41E3A] uppercase tracking-wider mb-2">
            Hot Deals
          </h2>
          <p className="font-handwritten text-2xl md:text-3xl text-[#FFB81C] leading-none">
            The ultimate combo deals, hand-crafted to satisfy your late night
            cravings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {deals.length === 0 ? (
            <div className="col-span-full py-16 px-6 text-center bg-white border-4 border-[#C41E3A] rounded-[36px] max-w-lg mx-auto shadow-md w-full">
              <p className="font-retro text-3xl md:text-4xl text-[#C41E3A] uppercase tracking-wide mb-3">
                New Deals Preparing!
              </p>
              <p className="text-sm md:text-base text-[#C41E3A]/70 leading-relaxed font-sans">
                Stay tuned! We are crafting some sizzling new combos and amazing
                packages to satisfy your late-night cravings.
              </p>
            </div>
          ) : (
            deals.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <DealCard
                  item={item}
                  onQuickView={onQuickView}
                  onQuickAdd={onQuickAdd}
                />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
