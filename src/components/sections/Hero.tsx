import { motion } from 'motion/react';

interface HeroProps {
  onNavigateMenu: () => void;
}

export default function Hero({ onNavigateMenu }: HeroProps) {
  return (
    <section className="relative py-16 md:py-24 px-6 md:px-12 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center overflow-hidden max-w-7xl mx-auto">
      {/* Left: copy */}
      <div className="relative z-10 space-y-6 md:space-y-8 text-left">
        <div className="inline-block bg-[#F5DEB3] border-2 border-[#C41E3A] px-5 py-1.5 rounded-full font-handwritten text-lg md:text-xl text-[#C41E3A] -rotate-2 animate-bounce">
          Freshly Melted Since 1984
        </div>

        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black leading-none text-[#C41E3A] uppercase font-retro">
          The Ultimate<br />
          <span className="text-[#FFB81C] text-7xl sm:text-8xl lg:text-9xl">Gooey</span>
          <br />
          Escape
        </h1>

        <p className="text-lg md:text-2xl text-[#C41E3A]/80 max-w-lg leading-relaxed font-sans">
          Dripping with nostalgia and smothered in our signature house-made
          cheese sauce. It's premium culinary comfort you can feel in your soul.
        </p>

        <div className="flex flex-wrap gap-4 pt-2">
          <button
            onClick={onNavigateMenu}
            className="bg-[#FFB81C] text-[#C41E3A] px-8 py-4.5 rounded-2xl text-lg md:text-xl font-black uppercase tracking-widest retro-shadow border-4 border-[#C41E3A] hover:bg-[#ffa71c] hover:-translate-y-1 transition-all cursor-pointer"
          >
            Sink Your Teeth In
          </button>
          <button
            onClick={onNavigateMenu}
            className="border-4 border-[#C41E3A] text-[#C41E3A] px-8 py-4.5 rounded-2xl text-lg md:text-xl font-black uppercase tracking-widest hover:bg-[#C41E3A] hover:text-white transition-all bg-[#FFB81C]/10 cursor-pointer"
          >
            Hot Deals &#x1F525;
          </button>
        </div>
      </div>

      {/* Right: hero image */}
      <div className="relative flex justify-center lg:justify-end">
        <div className="absolute inset-0 bg-[#F5DEB3] blob-mask -z-10 scale-110 lg:scale-125 opacity-60" />
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: [1, -1, 1] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          className="relative"
        >
          <img
            src="https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=600&auto=format&fit=crop"
            alt="Smash Cheesy Burger"
            className="w-full max-w-[420px] md:max-w-[480px] h-[450px] md:h-[520px] object-cover rounded-[60px] md:rounded-[80px] border-8 border-white retro-shadow"
            referrerPolicy="no-referrer"
          />
          <div className="absolute -bottom-4 -left-4 bg-[#FFB81C] text-[#C41E3A] px-5 py-3 rounded-2xl font-retro text-2xl md:text-3xl uppercase border-4 border-[#C41E3A] rotate-6 shadow-md">
            100% Smashed Wagyu
          </div>
        </motion.div>
      </div>
    </section>
  );
}
