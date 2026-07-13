import { Flame, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#C41E3A] text-white py-16 px-6 md:px-12 border-t-8 border-[#FFB81C]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 text-left">
        {/* Brand column */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFB81C] rounded-full flex items-center justify-center border-2 border-white">
              <Flame className="text-[#C41E3A] w-5 h-5 fill-[#C41E3A]" />
            </div>
            <span className="font-retro text-3xl tracking-wider text-white uppercase">
              Sauce <span className="text-[#FFB81C]">n'</span> Cheese
            </span>
          </div>
          <p className="max-w-xs text-[#FDF5E6]/70 text-base md:text-lg">
            Bringing back the legendary golden age of comforting fast food in
            Karachi. One gooey bite at a time.
          </p>
        </div>

        {/* Visit Us */}
        <div className="space-y-4">
          <h4 className="font-black uppercase text-[#FFB81C] tracking-widest text-sm">
            Visit Us
          </h4>
          <ul className="text-[#FDF5E6]/80 space-y-2 text-sm font-medium">
            <li>
              01, Karachi Administration Employees Housing Society Block 5
              KAECHS, Karachi, Pakistan
            </li>
            <li>Phone: 03318025998</li>
            <li>Daily: 11AM - 1AM</li>
          </ul>
        </div>

        {/* Social */}
        <div className="space-y-4">
          <h4 className="font-black uppercase text-[#FFB81C] tracking-widest text-sm">
            Join Us
          </h4>
          <div className="flex gap-3">
            <a
              href="https://www.instagram.com/saucencheese/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center hover:bg-[#FFB81C] hover:text-[#C41E3A] hover:border-[#FFB81C] transition-all text-xl"
            >
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      <div className="text-center border-t border-white/10 pt-10 max-w-7xl mx-auto">
        <p className="text-[#FDF5E6]/40 font-bold uppercase tracking-widest text-[11px]">
          &copy; 2026 Sauce n' Cheese Restaurant Group. Stay Gooey, Karachi!
        </p>
      </div>
    </footer>
  );
}
