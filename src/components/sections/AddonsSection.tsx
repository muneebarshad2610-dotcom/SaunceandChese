import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Droplets, Wine, Sparkles } from 'lucide-react';
import type { AddonItem } from '../../types';
import { fetchAddons } from '../../types';

interface Props {
  onAddAddon: (addon: AddonItem) => void;
}

export default function AddonsSection({ onAddAddon }: Props) {
  const [addons, setAddons] = useState<AddonItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAddons()
      .then((data) => {
        setAddons(data.filter((a) => a.isActive));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const extraAddons = addons.filter((a) => a.type === 'extra');
  const drinkAddons = addons.filter((a) => a.type === 'drink');
  const sauceAddons = addons.filter((a) => a.type === 'sauce');

  // Don't render if no addons to show
  if (!loading && addons.length === 0) return null;

  const typeIcon = (type: string) => {
    switch (type) {
      case 'sauce': return <Droplets className="w-4 h-4" />;
      case 'drink': return <Wine className="w-4 h-4" />;
      case 'extra': return <Sparkles className="w-4 h-4" />;
      default: return null;
    }
  };

  const typeGradient = (type: string) => {
    switch (type) {
      case 'sauce': return 'from-orange-500 to-red-500';
      case 'drink': return 'from-emerald-500 to-teal-500';
      case 'extra': return 'from-yellow-500 to-amber-500';
      default: return 'from-[#C41E3A] to-[#a01830]';
    }
  };

  const typeLabel = (type: string) => {
    switch (type) {
      case 'sauce': return 'Sauces';
      case 'drink': return 'Cold Drinks';
      case 'extra': return 'Extras';
      default: return 'Add-ons';
    }
  };

  const sections = [
    { items: extraAddons, type: 'extra' },
    { items: drinkAddons, type: 'drink' },
    { items: sauceAddons, type: 'sauce' },
  ].filter((s) => s.items.length > 0);

  if (sections.length === 0 && !loading) return null;

  return (
    <section className="py-16 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-retro text-5xl md:text-6xl text-[#C41E3A] uppercase tracking-wider mb-2">
          Add Your Flavour
        </h2>
        <p className="font-handwritten text-xl md:text-2xl text-[#FFB81C] leading-none">
          Sauces, drinks &amp; extras to complete your feast.
        </p>
      </div>

      <div className="space-y-6">
        {sections.map(({ items, type }) => (
          <div key={type}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${typeGradient(type)} flex items-center justify-center shadow-md border-2 border-white`}>
                {typeIcon(type)}
              </div>
              <h3 className="font-retro text-3xl text-[#C41E3A] uppercase tracking-wide">
                {typeLabel(type)}
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white border-2 border-[#C41E3A]/10 rounded-[20px] p-4 animate-pulse">
                    <div className="h-4 bg-[#C41E3A]/10 rounded w-2/3 mb-2" />
                    <div className="h-3 bg-[#C41E3A]/5 rounded w-1/3" />
                  </div>
                ))
              ) : (
                items.map((addon, i) => (
                  <motion.div
                    key={addon.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="bg-white border-2 border-[#C41E3A]/10 rounded-[20px] p-4 hover:border-[#C41E3A]/30 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${
                            type === 'extra' ? 'bg-amber-400' :
                            type === 'drink' ? 'bg-emerald-400' : 'bg-orange-400'
                          }`} />
                          <h4 className="font-bold text-sm text-[#C41E3A] truncate">{addon.name}</h4>
                        </div>
                        <p className="text-[#FFB81C] font-black text-sm mt-1">
                          Rs. {addon.price}
                        </p>
                      </div>
                      <button
                        onClick={() => onAddAddon(addon)}
                        className="w-8 h-8 bg-[#FFB81C] rounded-full flex items-center justify-center border-2 border-[#C41E3A] hover:bg-[#ffa71c] transition-all cursor-pointer group-hover:scale-105 flex-shrink-0 ml-2"
                        title={`Add ${addon.name}`}
                      >
                        <Plus className="w-4 h-4 text-[#C41E3A] stroke-[3]" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
