import { Instagram } from 'lucide-react';

const MARQUEE_IMAGES = [
  'https://images.unsplash.com/photo-1590947132387-155cc02f3212?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1579751626657-72bc74ced304?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1552539618-7eec9b4d1816?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=400&auto=format&fit=crop',
];

function MarqueeTrack({ id }: { id: string }) {
  return (
    <div className="animate-marquee flex gap-6 pr-6" aria-hidden={id === 'dup'}>
      {MARQUEE_IMAGES.map((src, i) => (
        <div
          key={`${id}-${i}`}
          className="w-72 h-72 md:w-80 md:h-80 flex-shrink-0 bg-white/10 rounded-[32px] overflow-hidden border-4 border-white/20 hover:border-white/50 transition-all duration-300"
        >
          <img
            src={src}
            alt="Cheese pull"
            className="w-full h-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>
      ))}
    </div>
  );
}

export default function InstagramMarquee() {
  return (
    <section className="py-20 bg-[#C41E3A] text-white overflow-hidden relative">
      <div className="px-6 md:px-12 mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 max-w-7xl mx-auto">
        <div className="space-y-2 text-left">
          <h2 className="font-retro text-5xl md:text-6xl text-white uppercase tracking-wide">
            Our Craving Journey
          </h2>
          <p className="text-[#FFB81C] font-handwritten text-2xl md:text-3xl">
            Live from Karachi @saucencheese
          </p>
        </div>

        <a
          href="https://www.instagram.com/saucencheese/"
          target="_blank"
          rel="noopener noreferrer"
          className="border-2 border-white text-white hover:bg-[#FFB81C] hover:text-[#C41E3A] hover:border-[#FFB81C] px-8 py-3 rounded-full font-black uppercase tracking-wider transition-all duration-200 text-xs flex items-center gap-2 cursor-pointer"
        >
          <Instagram className="w-4 h-4" />
          Follow Us
        </a>
      </div>

      <div className="overflow-hidden flex">
        <MarqueeTrack id="original" />
        <MarqueeTrack id="dup" />
      </div>
    </section>
  );
}
