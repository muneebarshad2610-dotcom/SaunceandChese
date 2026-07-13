import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Plus, Pencil, Trash2, X, Search } from 'lucide-react';
import { useAuth } from '@clerk/react';
import { clearAddonCache } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

interface Addon {
  id: number;
  type: 'sauce' | 'drink' | 'extra';
  name: string;
  price: number;
  isActive: boolean;
  sortOrder: number;
}

const ADDON_TYPES = ['sauce', 'drink', 'extra'] as const;

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  sauce: { label: 'Sauce', color: 'text-green-600', bg: 'bg-green-100' },
  drink: { label: 'Drink', color: 'text-blue-600', bg: 'bg-blue-100' },
  extra: { label: 'Extra', color: 'text-orange-600', bg: 'bg-orange-100' },
};

export default function AdminAddons() {
  const { getToken } = useAuth();
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ type: 'sauce' as string, name: '', price: '', isActive: true, sortOrder: '0' });

  const fetchAddons = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(API_BASE + '/api/addons/admin', {
        headers: { Authorization: 'Bearer ' + token },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setAddons(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchAddons();
  }, [fetchAddons]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ type: 'sauce', name: '', price: '', isActive: true, sortOrder: '0' });
    setShowForm(true);
  };

  const openEdit = (addon: Addon) => {
    setEditingId(addon.id);
    setForm({
      type: addon.type,
      name: addon.name,
      price: addon.price.toString(),
      isActive: addon.isActive,
      sortOrder: addon.sortOrder.toString(),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm('Delete "' + name + '"? This cannot be undone.')) return;
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(API_BASE + '/api/addons/' + id, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token },
      });
      if (!res.ok) throw new Error('Failed to delete');
      clearAddonCache();
      setAddons((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete');
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = await getToken();
      if (!token) return;

      const body = {
        type: form.type,
        name: form.name,
        price: form.price || '0',
        is_active: form.isActive,
        sort_order: parseInt(form.sortOrder) || 0,
      };

      const url = editingId
        ? API_BASE + '/api/addons/' + editingId
        : API_BASE + '/api/addons';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error((errData as { error?: string }).error || 'Failed to save');
      }

      clearAddonCache();
      await fetchAddons();
      setShowForm(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const filtered = addons.filter((a) => {
    const matchesType = typeFilter === 'all' || a.type === typeFilter;
    const matchesSearch = !searchQuery || a.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const counts = {
    all: addons.length,
    sauce: addons.filter((a) => a.type === 'sauce').length,
    drink: addons.filter((a) => a.type === 'drink').length,
    extra: addons.filter((a) => a.type === 'extra').length,
  };

  return (
    <section className="min-h-screen bg-[#FDF5E6]">
      <div className="bg-[#C41E3A] px-6 md:px-12 py-6 border-b-4 border-[#FFB81C]">
        <div className="max-w-7xl mx-auto flex items-center justify-between mb-4">
          <div>
            <h2 className="font-retro text-4xl md:text-5xl text-white uppercase tracking-wide leading-none">Add-on Management</h2>
            <p className="text-[#FFB81C] text-sm font-black uppercase tracking-wider mt-1">Sauces, Drinks &amp; Extras</p>
          </div>
          <button onClick={openCreate}
            className="bg-[#FFB81C] text-[#C41E3A] px-5 py-2 rounded-full font-black text-xs uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#ffa71c] transition-all cursor-pointer">
            <Plus className="w-3.5 h-3.5" /> Add Add-on
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['all', ...ADDON_TYPES] as const).map((key) => (
            <button key={key} onClick={() => setTypeFilter(key)}
              className={`px-3 py-1.5 rounded-full font-black text-[10px] uppercase tracking-wider border-2 transition-all cursor-pointer ${
                typeFilter === key
                  ? 'bg-[#FFB81C] text-[#C41E3A] border-[#FFB81C]'
                  : 'bg-white/15 text-white/80 border-white/20 hover:bg-white/25'
              }`}>
              {key === 'all' ? 'All' : TYPE_CONFIG[key]?.label || key} ({counts[key]})
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C41E3A]/40" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search add-ons..."
            className="w-full bg-white border-2 border-[#C41E3A]/15 rounded-2xl pl-11 pr-4 py-3 text-sm font-medium placeholder-[#C41E3A]/30 focus:border-[#C41E3A] outline-none transition-all" />
        </div>

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border-2 border-[#C41E3A]/10 rounded-[24px] p-6 animate-pulse">
                <div className="h-5 bg-[#C41E3A]/10 rounded w-1/4" />
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="bg-white border-2 border-[#C41E3A]/10 rounded-[24px] p-12 text-center">
            <p className="font-retro text-2xl text-[#C41E3A] uppercase tracking-wide">No Add-ons Found</p>
          </div>
        )}

        <div className="space-y-2">
          {filtered.map((addon) => {
            const cfg = TYPE_CONFIG[addon.type];
            return (
              <motion.div key={addon.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white border-2 border-[#C41E3A]/10 rounded-[20px] p-4 flex items-center gap-4 hover:border-[#C41E3A]/25 transition-all">
                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                <div className="flex-1">
                  <span className={`font-bold text-sm text-[#C41E3A] ${!addon.isActive ? 'line-through opacity-50' : ''}`}>{addon.name}</span>
                  {addon.price > 0 && <span className="ml-2 text-xs text-[#C41E3A]/60">Rs. {addon.price}</span>}
                </div>
                <div className="flex items-center gap-2">
                  {!addon.isActive && <span className="text-[9px] font-black text-[#C41E3A]/30 uppercase tracking-wider">Inactive</span>}
                  <button onClick={() => openEdit(addon)} className="p-2 rounded-full hover:bg-[#C41E3A]/10 transition-colors cursor-pointer" title="Edit">
                    <Pencil className="w-4 h-4 text-[#C41E3A]/60" />
                  </button>
                  <button onClick={() => handleDelete(addon.id, addon.name)} className="p-2 rounded-full hover:bg-red-100 transition-colors cursor-pointer" title="Delete">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowForm(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <motion.div initial={{ scale: 0.9, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 25 }}
            className="relative bg-[#FDF5E6] border-4 border-[#C41E3A] rounded-[40px] max-w-md w-full shadow-2xl z-10">
            <button onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 z-20 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-[#C41E3A] hover:scale-105 transition-transform cursor-pointer">
              <X className="w-4 h-4 text-[#C41E3A]" />
            </button>
            <div className="p-8 pb-4 text-center border-b-2 border-[#C41E3A]/10">
              <h2 className="font-retro text-3xl text-[#C41E3A] uppercase tracking-wide">
                {editingId ? 'Edit Add-on' : 'New Add-on'}
              </h2>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#C41E3A]/60">Type *</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-white/70 border-2 border-[#C41E3A]/20 rounded-2xl px-4 py-3 text-sm focus:border-[#C41E3A] outline-none">
                  <option value="sauce">Sauce</option>
                  <option value="drink">Drink</option>
                  <option value="extra">Extra</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#C41E3A]/60">Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-white/70 border-2 border-[#C41E3A]/20 rounded-2xl px-4 py-3 text-sm focus:border-[#C41E3A] outline-none" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#C41E3A]/60">Price (Rs.)</label>
                  <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full bg-white/70 border-2 border-[#C41E3A]/20 rounded-2xl px-4 py-3 text-sm focus:border-[#C41E3A] outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#C41E3A]/60">Sort Order</label>
                  <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                    className="w-full bg-white/70 border-2 border-[#C41E3A]/20 rounded-2xl px-4 py-3 text-sm focus:border-[#C41E3A] outline-none" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 accent-[#C41E3A]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#C41E3A]/60">Active</span>
              </label>
              <button type="submit" disabled={saving}
                className="w-full bg-[#FFB81C] text-[#C41E3A] font-black py-3.5 rounded-2xl uppercase tracking-widest shadow-lg border-2 border-[#C41E3A] hover:bg-[#ffa71c] disabled:opacity-60 transition-all cursor-pointer">
                {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </section>
  );
}
