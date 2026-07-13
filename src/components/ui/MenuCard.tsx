import { Sliders, Plus } from 'lucide-react';
import type { MenuItem } from '../../types';

interface MenuCardProps {
  item: MenuItem;
  onQuickView: (item: MenuItem) => void;
  onQuickAdd: (item: MenuItem) => void;
}

export default function MenuCard({
  item,
  onQuickView,
  onQuickAdd,
}: MenuCardProps) {
  return (
    <div className="bg-white border-4 border-[#C41E3A] rounded-[36px] p-6 md:p-8 flex flex-col items-center text-center relative hover:-translate-y-2 transition-transform duration-300 shadow-md hover:shadow-xl">
      {/* Card Image */}
      <div
        onClick={() => onQuickView(item)}
        className="w-full aspect-square overflow-hidden rounded-[24px] mb-6 border-2 border-[#C41E3A] cursor-pointer group"
      >
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
      </div>

      <h3 className="font-retro text-3xl md:text-4xl text-[#C41E3A] mb-2 uppercase tracking-wide">
        {item.name}
      </h3>

      <p className="text-sm text-[#C41E3A]/70 mb-6 leading-relaxed flex-1">
        {item.description}
      </p>

      <div className="flex items-center justify-between w-full mt-auto pt-4 border-t-2 border-[#C41E3A]/5">
        <span className="text-[#FFB81C] font-black text-lg md:text-xl tracking-tight text-left">
          {item.prices
            ? `Rs. ${item.prices.small} - ${item.prices.large}`
            : `Rs. ${item.price}`}
        </span>

        <div className="flex gap-2">
          <button
            onClick={() => onQuickView(item)}
            className="bg-[#F5DEB3] hover:bg-[#ebd5ad] text-[#C41E3A] p-2.5 rounded-full border-2 border-[#C41E3A] transition-all flex items-center justify-center cursor-pointer"
            title="Customize & Pull Cheese"
          >
            <Sliders className="w-5 h-5" />
          </button>
          <button
            onClick={() => onQuickAdd(item)}
            className="bg-[#FFB81C] hover:bg-[#ffa71c] text-[#C41E3A] p-2.5 rounded-full border-2 border-[#C41E3A] retro-shadow-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center justify-center cursor-pointer"
            title="Quick Add"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
}
