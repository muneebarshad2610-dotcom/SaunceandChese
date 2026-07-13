import { CheckCircle2 } from 'lucide-react';

export default function StorySection() {
  return (
    <section
      id="story"
      className="py-20 px-6 md:px-12 bg-[#F5DEB3]/30 border-y-4 border-dashed border-[#C41E3A]/20"
    >
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12 md:gap-16 items-center">
        {/* Image */}
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="relative p-2 border-4 border-[#FFB81C] rounded-full overflow-hidden w-64 h-64 md:w-80 md:h-80">
            <img
              src="https://images.unsplash.com/photo-1543339308-43e59d6b73a6?q=80&w=600&auto=format&fit=crop"
              alt="Melty Old School Saucery"
              className="w-full h-full object-cover rounded-full"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Copy */}
        <div className="w-full md:w-1/2 space-y-6 text-left">
          <h2 className="font-retro text-5xl md:text-6xl text-[#C41E3A] uppercase tracking-wide">
            Our Saucy Story
          </h2>
          <p className="text-lg md:text-xl leading-relaxed text-[#C41E3A]/80 font-sans">
            Started in Karachi with a big block of aged cheddar, artisanal
            spices, and a dream of the perfect golden drizzle. We don't just
            cook food; we craft memories on a platter. Every burger is
            hand-pressed, every batch of fries is hand-cut daily, and every
            legendary cheese pull is guaranteed.
          </p>

          <div className="pt-2 space-y-3">
            <div className="flex items-center gap-3.5 text-[#FFB81C] font-black text-xl md:text-2xl uppercase font-retro tracking-wider">
              <CheckCircle2 className="w-6 h-6 text-[#C41E3A] stroke-[3]" />
              <span>Never Frozen Fresh Wagyu</span>
            </div>
            <div className="flex items-center gap-3.5 text-[#FFB81C] font-black text-xl md:text-2xl uppercase font-retro tracking-wider">
              <CheckCircle2 className="w-6 h-6 text-[#C41E3A] stroke-[3]" />
              <span>Triple-Churned Cheese Blend</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
