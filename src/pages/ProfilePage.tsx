import { useState, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, MapPin, Phone, Plus, Trash2, X, Check, Heart } from 'lucide-react';
import { useAuth, useUser } from '@clerk/react';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

interface SavedAddress {
  id: number;
  label: string;
  address: string;
  phone: string;
  isDefault: boolean;
}

export default function ProfilePage({ onNavigateHome }: { onNavigateHome: () => void }) {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ label: '', address: '', phone: '', isDefault: false });

  const fetchAddresses = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(API_BASE + '/api/addresses', {
        headers: { Authorization: 'Bearer ' + token },
      });
      if (res.ok) setAddresses(await res.json());
    } catch (err) {
      if (import.meta.env.DEV) console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAddresses(); }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.address.trim()) return;
    setSaving(true);
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(API_BASE + '/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const addr = await res.json();
        setAddresses((prev) => [addr, ...prev]);
        setShowForm(false);
        setForm({ label: '', address: '', phone: '', isDefault: false });
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const token = await getToken();
    if (!token) return;
    const res = await fetch(API_BASE + '/api/addresses/' + id, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + token },
    });
    if (res.ok) setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <section className="min-h-screen bg-[#FDF5E6] py-20 px-6 md:px-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="font-retro text-5xl md:text-6xl text-[#C41E3A] uppercase tracking-wide leading-none">My Profile</h2>
            <p className="font-handwritten text-xl text-[#FFB81C] mt-1">Your account, your way.</p>
          </div>
          <button onClick={onNavigateHome}
            className="bg-white text-[#C41E3A] border-2 border-[#C41E3A] px-5 py-2 rounded-full font-black text-xs uppercase tracking-wider hover:bg-[#C41E3A] hover:text-white transition-all cursor-pointer">
            &larr; Back
          </button>
        </div>

        {/* Account Info */}
        {user && (
          <div className="bg-white border-2 border-[#C41E3A]/15 rounded-[24px] p-6 mb-8 flex items-center gap-4">
            <img src={user.imageUrl} alt="" className="w-16 h-16 rounded-full border-2 border-[#C41E3A]" />
            <div>
              <p className="font-black text-lg text-[#C41E3A]">{user.fullName || 'User'}</p>
              <p className="text-sm text-[#C41E3A]/60">
                {user.primaryEmailAddress?.emailAddress}
                {user.primaryPhoneNumber?.phoneNumber && ' Â· ' + user.primaryPhoneNumber.phoneNumber}
              </p>
            </div>
          </div>
        )}

        {/* Saved Addresses */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-retro text-2xl text-[#C41E3A] uppercase tracking-wide">Saved Addresses</h3>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 bg-[#FFB81C] text-[#C41E3A] px-4 py-2 rounded-full font-black text-xs uppercase tracking-wider hover:bg-[#ffa71c] transition-all cursor-pointer">
            <Plus className="w-3.5 h-3.5" /> Add Address
          </button>
        </div>

        {loading && (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white border-2 border-[#C41E3A]/10 rounded-[24px] p-5 animate-pulse">
                <div className="h-4 bg-[#C41E3A]/10 rounded w-1/4 mb-2" />
                <div className="h-3 bg-[#C41E3A]/5 rounded w-3/4" />
              </div>
            ))}
          </div>
        )}

        {!loading && addresses.length === 0 && !showForm && (
          <div className="bg-white border-2 border-[#C41E3A]/10 rounded-[24px] p-8 text-center">
            <MapPin className="w-12 h-12 text-[#C41E3A]/30 mx-auto mb-2" />
            <p className="text-[#C41E3A]/60 text-sm">No saved addresses yet.</p>
          </div>
        )}

        <div className="space-y-3">
          <AnimatePresence>
            {addresses.map((addr) => (
              <motion.div key={addr.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                className="bg-white border-2 border-[#C41E3A]/15 rounded-[24px] p-5 flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <MapPin className="w-5 h-5 text-[#C41E3A]/40 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-sm text-[#C41E3A]">{addr.label || 'Address'}</span>
                      {addr.isDefault && <span className="text-[10px] bg-[#FFB81C]/20 text-[#C41E3A] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Default</span>}
                    </div>
                    <p className="text-xs text-[#C41E3A]/70 mt-0.5">{addr.address}</p>
                    {addr.phone && <p className="text-[10px] text-[#C41E3A]/50 mt-0.5 flex items-center gap-1"><Phone className="w-3 h-3" /> {addr.phone}</p>}
                  </div>
                </div>
                <button onClick={() => handleDelete(addr.id)}
                  className="p-2 rounded-full hover:bg-red-100 transition-colors cursor-pointer flex-shrink-0">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Add Address Form Modal */}
        <AnimatePresence>
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowForm(false)}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.9, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{ type: 'spring', damping: 25 }}
                className="relative bg-[#FDF5E6] border-4 border-[#C41E3A] rounded-[40px] max-w-sm w-full shadow-2xl z-10">
                <button onClick={() => setShowForm(false)}
                  className="absolute top-4 right-4 z-20 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-[#C41E3A] cursor-pointer">
                  <X className="w-4 h-4 text-[#C41E3A]" />
                </button>
                <div className="p-8 pb-4 text-center border-b-2 border-[#C41E3A]/10">
                  <MapPin className="w-8 h-8 text-[#C41E3A] mx-auto mb-2" />
                  <h2 className="font-retro text-3xl text-[#C41E3A] uppercase">New Address</h2>
                </div>
                <form onSubmit={handleSave} className="p-8 space-y-4 text-left">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#C41E3A]/60">Label</label>
                    <input type="text" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })}
                      placeholder="e.g. Home, Work"
                      className="w-full bg-white/70 border-2 border-[#C41E3A]/20 rounded-2xl px-4 py-3 text-sm focus:border-[#C41E3A] outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#C41E3A]/60">Address *</label>
                    <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="w-full bg-white/70 border-2 border-[#C41E3A]/20 rounded-2xl px-4 py-3 text-sm focus:border-[#C41E3A] outline-none resize-none" rows={3} required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#C41E3A]/60">Phone</label>
                    <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="03XX-XXXXXXX"
                      className="w-full bg-white/70 border-2 border-[#C41E3A]/20 rounded-2xl px-4 py-3 text-sm focus:border-[#C41E3A] outline-none" />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                      className="w-4 h-4 accent-[#C41E3A]" />
                    <span className="text-xs font-bold text-[#C41E3A]/80">Set as default address</span>
                  </label>
                  <button type="submit" disabled={saving || !form.address.trim()}
                    className="w-full bg-[#FFB81C] text-[#C41E3A] font-black py-3.5 rounded-2xl uppercase tracking-widest shadow-lg border-2 border-[#C41E3A] hover:bg-[#ffa71c] disabled:opacity-60 transition-all cursor-pointer">
                    {saving ? 'Saving...' : 'Save Address'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
