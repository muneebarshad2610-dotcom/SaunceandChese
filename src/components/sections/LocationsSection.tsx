import { useState, FormEvent } from 'react';
import { MapPin, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LocationsSectionProps {
  onSubmitContact: (data: {
    name: string;
    email: string;
    message: string;
  }) => Promise<void>;
}

export default function LocationsSection({
  onSubmitContact,
}: LocationsSectionProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setSubmitting(true);
    try {
      await onSubmitContact({ name, email, message });
      setSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
      setTimeout(() => setSuccess(false), 4000);
    } catch {
      // error handled upstream
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="locations"
      className="py-20 px-6 md:px-12 grid lg:grid-cols-2 gap-16 max-w-7xl mx-auto"
    >
      {/* Left: Locations */}
      <div className="space-y-10 text-left">
        <h2 className="font-retro text-6xl md:text-7xl text-[#C41E3A] uppercase tracking-wide">
          Find Us In Karachi
        </h2>

        <div className="space-y-8">
          <div className="bg-white p-6 md:p-8 rounded-[40px] border-4 border-[#C41E3A] shadow-md hover:shadow-lg transition-shadow">
            <h3 className="font-retro text-3xl text-[#C41E3A] mb-2 uppercase tracking-wide">
              KAECHS Outlet
            </h3>
            <p className="text-lg text-[#C41E3A]/80 font-medium leading-relaxed">
              01, Karachi Administration Employees Housing Society Block 5
              KAECHS, Karachi, Pakistan
            </p>
            <div className="mt-3 text-[#C41E3A] font-black text-lg">
              Phone:{' '}
              <span className="text-[#FFB81C]">03318025998</span>
            </div>

            <div className="mt-6 flex flex-wrap gap-4 items-center text-sm">
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[#FFB81C] hover:text-[#ffa71c] font-black uppercase tracking-wider"
              >
                <MapPin className="w-5 h-5 text-[#C41E3A]" />
                Get Directions
              </a>
              <span className="text-[#C41E3A]/30 hidden sm:inline">|</span>
              <span className="text-[#C41E3A]/60 font-medium">
                Open 11AM - 1AM Daily
              </span>
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-[#C41E3A]/5 p-6 md:p-8 rounded-[40px] border-4 border-dashed border-[#C41E3A]/20 shadow-inner">
            <p className="text-xl md:text-2xl text-[#C41E3A] font-medium leading-relaxed italic font-handwritten">
              &ldquo;The golden liquid gold cheese is unmatched. Best cheddar
              pull in town. Hands down, my go-to pizza joint in KAECHS.&rdquo;
            </p>
            <div className="mt-5 text-[#FFB81C] font-black uppercase font-retro text-lg tracking-wider">
              &mdash; Sarah M., Karachi
            </div>
          </div>
        </div>
      </div>

      {/* Right: Contact form */}
      <div className="bg-[#FFB81C] p-8 md:p-12 rounded-[50px] text-[#C41E3A] space-y-6 flex flex-col justify-center retro-shadow">
        <div className="text-left space-y-2">
          <h2 className="font-retro text-5xl text-[#C41E3A] uppercase tracking-wide">
            Get in Touch
          </h2>
          <p className="text-lg font-medium leading-normal">
            Hungry? Have a custom request? Just want to talk cheese pulls? Drop
            us a line!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your Name"
              className="w-full bg-white/40 border-2 border-[#C41E3A]/20 rounded-2xl px-5 py-4 placeholder-[#C41E3A]/60 font-medium focus:bg-white/75 focus:border-[#C41E3A] outline-none transition-all text-[#1A1A1A]"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Your Email"
              className="w-full bg-white/40 border-2 border-[#C41E3A]/20 rounded-2xl px-5 py-4 placeholder-[#C41E3A]/60 font-medium focus:bg-white/75 focus:border-[#C41E3A] outline-none transition-all text-[#1A1A1A]"
            />
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="How can we help make your cheesy cravings come true?"
            className="w-full bg-white/40 border-2 border-[#C41E3A]/20 rounded-2xl px-5 py-4 placeholder-[#C41E3A]/60 font-medium focus:bg-white/75 focus:border-[#C41E3A] outline-none transition-all h-32 text-[#1A1A1A]"
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#C41E3A] hover:bg-[#b01630] text-white font-black px-10 py-4.5 rounded-full uppercase tracking-widest text-lg md:text-xl transition-all shadow-md active:translate-y-[1px] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Sending...' : 'Submit Request'}
          </button>
        </form>

        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white border-2 border-[#C41E3A] p-4 rounded-2xl flex items-center gap-3 text-left"
            >
              <MessageSquare className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider text-green-700">
                Saucery message received! We will drizzle you back shortly.
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
