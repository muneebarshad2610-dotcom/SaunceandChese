import { Sliders, Plus } from 'lucide-react';
import type { MenuItem } from '../../types';

interface DealCardProps {
  item: MenuItem;
  onQuickView: (item: MenuItem) => void;
  onQuickAdd: (item: MenuItem) => void;
}

export default function DealCard({
  item,
  onQuickView,
  onQuickAdd,
}: DealCardProps) {
  return (
    <div className="bg-white border-4 border-[#C41E3A] rounded-[36px] p-6 md:p-8 flex flex-col items-center relative hover:-translate-y-2 transition-transform duration-300 shadow-md hover:shadow-xl text-center">
      {/* Combo tag */}
      <div className="absolute -top-4 -right-2 bg-[#C41E3A] text-white px-4 py-1.5 rounded-xl font-retro text-xs uppercase tracking-widest border-2 border-white rotate-6 shadow-md z-10">
        Combo Bundle
      </div>

      {/* Image with hover overlay */}
      <div
        onClick={() => onQuickView(item)}
        className="w-full aspect-square overflow-hidden rounded-[24px] mb-6 border-2 border-[#C41E3A] cursor-pointer group relative"
      >
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-[#C41E3A]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="bg-white/95 text-[#C41E3A] font-black uppercase text-xs tracking-widest px-4 py-2 rounded-xl border-2 border-[#C41E3A] shadow-sm scale-90 group-hover:scale-100 transition-all">
            Customize Bundle
          </span>
        </div>
      </div>

      <h3 className="font-retro text-3xl md:text-4xl text-[#C41E3A] mb-2 uppercase tracking-wide">
        {item.name}
      </h3>

      <p className="text-sm text-[#C41E3A]/70 mb-6 leading-relaxed flex-1">
        {item.description}
      </p>

      <div className="flex items-center justify-between w-full mt-auto pt-4 border-t-2 border-[#C41E3A]/5">
        <span className="text-[#FFB81C] font-black text-2xl tracking-tight text-left">
          Rs. {item.price}
        </span>

        <div className="flex gap-2">
          <button
            onClick={() => onQuickView(item)}
            className="bg-[#F5DEB3] hover:bg-[#ebd5ad] text-[#C41E3A] p-2.5 rounded-full border-2 border-[#C41E3A] transition-all flex items-center justify-center cursor-pointer"
            title="Customize Deal"
          >
            <Sliders className="w-5 h-5" />
          </button>
          <button
            onClick={() => onQuickAdd(item)}
            className="bg-[#FFB81C] hover:bg-[#ffa71c] text-[#C41E3A] p-2.5 rounded-full border-2 border-[#C41E3A] retro-shadow-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center justify-center cursor-pointer"
            title="Quick Add Deal"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
}
