import { useState, useEffect, useCallback } from 'react';
import { type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Package, Plus, Pencil, Trash2, X, Image,
  ChevronDown, ChevronUp, Search, List,
} from 'lucide-react';
import { useAuth } from '@clerk/react';
import type { MenuItem, ProductVariant } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

const PRODUCT_CATEGORIES = ['Pizza', 'Burger', 'Broast', 'Pasta', 'Sides', 'Drinks', 'Salad', 'Dessert'];

interface VariantOptionForm {
  name: string;
  price: string;
}

interface VariantGroupForm {
  name: string;
  required: boolean;
  options: VariantOptionForm[];
}

interface ProductForm {
  name: string;
  category: 'classic' | 'special' | 'deal';
  productCategory: string;
  price: string;
  price_small: string;
  price_regular: string;
  price_large: string;
  variants: VariantGroupForm[];
  description: string;
  image: string;
}

const emptyForm: ProductForm = {
  name: '',
  category: 'classic',
  productCategory: 'Pizza',
  price: '',
  price_small: '',
  price_regular: '',
  price_large: '',
  variants: [],
  description: '',
  image: '',
};

function variantsToForm(v?: ProductVariant[]): VariantGroupForm[] {
  if (!v || v.length === 0) return [];
  return v.map((g) => ({
    name: g.name,
    required: g.required,
    options: g.options.map((o) => ({ name: o.name, price: o.price.toString() })),
  }));
}

function formToVariants(v: VariantGroupForm[]): ProductVariant[] {
  return v
    .filter((g) => g.name.trim())
    .map((g) => ({
      name: g.name.trim(),
      required: g.required,
      options: g.options
        .filter((o) => o.name.trim())
        .map((o) => ({ name: o.name.trim(), price: parseFloat(o.price) || 0 })),
    }))
    .filter((g) => g.options.length > 0);
}

export default function AdminProducts() {
  const { getToken } = useAuth();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [catFilter, setCatFilter] = useState<string>('all');
  const [pcFilter, setPcFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch(API_BASE + '/api/menu-items');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setItems(data);
    } catch (err) {
      if (import.meta.env.DEV) console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const productCategories = [...new Set(items.map((i) => i.productCategory).filter(Boolean))].sort();

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      category: item.category,
      productCategory: item.productCategory || 'Pizza',
      price: item.price?.toString() || '',
      price_small: item.prices?.small?.toString() || '',
      price_regular: item.prices?.regular?.toString() || '',
      price_large: item.prices?.large?.toString() || '',
      variants: variantsToForm(item.variants),
      description: item.description,
      image: item.image,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm('Delete "' + name + '"? This cannot be undone.')) return;
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(API_BASE + '/api/menu-items/' + id, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token },
      });
      if (!res.ok) throw new Error('Failed to delete');
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      if (import.meta.env.DEV) console.error(err);
      alert('Failed to delete item');
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = await getToken();
      if (!token) return;

      const body = {
        name: form.name,
        category: form.category,
        product_category: form.productCategory,
        price: form.price || '0',
        price_small: form.price_small || null,
        price_regular: form.price_regular || null,
        price_large: form.price_large || null,
        variants: formToVariants(form.variants),
        description: form.description,
        image: form.image,
      };

      const url = editingId
        ? API_BASE + '/api/menu-items/' + editingId
        : API_BASE + '/api/menu-items';
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

      await fetchItems();
      setShowForm(false);
    } catch (err) {
      if (import.meta.env.DEV) console.error(err);
      alert(err instanceof Error ? err.message : 'Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  const filtered = items.filter((item) => {
    const matchesCat = catFilter === 'all' || item.category === catFilter;
    const matchesPc = pcFilter === 'all' || item.productCategory === pcFilter;
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesPc && matchesSearch;
  });

  const counts = {
    all: items.length,
    classic: items.filter((i) => i.category === 'classic').length,
    special: items.filter((i) => i.category === 'special').length,
    deal: items.filter((i) => i.category === 'deal').length,
  };

  const addVariantGroup = () => {
    setForm((f) => ({
      ...f,
      variants: [...f.variants, { name: '', required: true, options: [{ name: '', price: '0' }] }],
    }));
  };

  const updateVariantGroup = (gi: number, patch: Partial<VariantGroupForm>) => {
    setForm((f) => {
      const next = [...f.variants];
      next[gi] = { ...next[gi], ...patch };
      return { ...f, variants: next };
    });
  };

  const removeVariantGroup = (gi: number) => {
    setForm((f) => ({ ...f, variants: f.variants.filter((_, i) => i !== gi) }));
  };

  const addVariantOption = (gi: number) => {
    setForm((f) => {
      const next = [...f.variants];
      next[gi] = { ...next[gi], options: [...next[gi].options, { name: '', price: '0' }] };
      return { ...f, variants: next };
    });
  };

  const updateVariantOption = (gi: number, oi: number, patch: Partial<VariantOptionForm>) => {
    setForm((f) => {
      const next = [...f.variants];
      const opts = [...next[gi].options];
      opts[oi] = { ...opts[oi], ...patch };
      next[gi] = { ...next[gi], options: opts };
      return { ...f, variants: next };
    });
  };

  const removeVariantOption = (gi: number, oi: number) => {
    setForm((f) => {
      const next = [...f.variants];
      next[gi] = { ...next[gi], options: next[gi].options.filter((_, i) => i !== oi) };
      return { ...f, variants: next };
    });
  };

  return (
    <section className="min-h-screen bg-[#FDF5E6]">
      {/* Header */}
      <div className="bg-[#C41E3A] px-6 md:px-12 py-6 border-b-4 border-[#FFB81C]">
        <div className="max-w-7xl mx-auto flex items-center justify-between mb-4">
          <div>
            <h2 className="font-retro text-4xl md:text-5xl text-white uppercase tracking-wide leading-none">
              Product Management
            </h2>
            <p className="text-[#FFB81C] text-sm font-black uppercase tracking-wider mt-1">
              Menu &amp; Deals
            </p>
          </div>
          <button
            onClick={openCreate}
            className="bg-[#FFB81C] text-[#C41E3A] px-5 py-2 rounded-full font-black text-xs uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#ffa71c] transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Product
          </button>
        </div>

        {/* Type filters */}
        <div className="flex flex-wrap gap-2 mb-3">
          {(['all', 'classic', 'special', 'deal'] as const).map((key) => (
            <button
              key={key}
              onClick={() => setCatFilter(key)}
              className={`px-3 py-1.5 rounded-full font-black text-[10px] uppercase tracking-wider border-2 transition-all cursor-pointer ${
                catFilter === key
                  ? 'bg-[#FFB81C] text-[#C41E3A] border-[#FFB81C]'
                  : 'bg-white/15 text-white/80 border-white/20 hover:bg-white/25'
              }`}
            >
              {key === 'all' ? 'All' : key.charAt(0).toUpperCase() + key.slice(1)} ({counts[key]})
            </button>
          ))}
        </div>

        {/* Product category filters */}
        {productCategories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setPcFilter('all')}
              className={`px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-wider border transition-all cursor-pointer ${
                pcFilter === 'all'
                  ? 'bg-white text-[#C41E3A] border-white'
                  : 'bg-white/10 text-white/70 border-white/20 hover:bg-white/20'
              }`}
            >
              All Categories
            </button>
            {productCategories.map((pc) => (
              <button
                key={pc}
                onClick={() => setPcFilter(pc)}
                className={`px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-wider border transition-all cursor-pointer ${
                  pcFilter === pc
                    ? 'bg-white text-[#C41E3A] border-white'
                    : 'bg-white/10 text-white/70 border-white/20 hover:bg-white/20'
                }`}
              >
                {pc}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C41E3A]/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-white border-2 border-[#C41E3A]/15 rounded-2xl pl-11 pr-4 py-3 text-sm font-medium placeholder-[#C41E3A]/30 focus:border-[#C41E3A] outline-none transition-all"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border-2 border-[#C41E3A]/10 rounded-[24px] p-6 animate-pulse">
                <div className="h-5 bg-[#C41E3A]/10 rounded w-1/3 mb-3" />
                <div className="h-4 bg-[#C41E3A]/5 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="bg-white border-2 border-[#C41E3A]/10 rounded-[24px] p-12 text-center">
            <Package className="w-16 h-16 text-[#C41E3A]/30 mx-auto mb-3" />
            <p className="font-retro text-2xl text-[#C41E3A] uppercase tracking-wide">
              {items.length === 0 ? 'No Products Yet' : 'No Matching Products'}
            </p>
            {items.length === 0 && (
              <button onClick={openCreate} className="mt-4 bg-[#C41E3A] text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-wider cursor-pointer">
                Add Your First Product
              </button>
            )}
          </div>
        )}

        {/* Product List */}
        <AnimatePresence>
          {filtered.map((item) => {
            const isExpanded = expandedId === item.id;
            const hasSizes = !!item.prices;
            const hasVariants = !!item.variants && item.variants.length > 0;
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border-2 border-[#C41E3A]/10 rounded-[24px] mb-3 overflow-hidden hover:border-[#C41E3A]/25 transition-all"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="w-full p-4 flex items-center gap-4 text-left cursor-pointer"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover border-2 border-[#C41E3A]/10 flex-shrink-0"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-sm text-[#C41E3A]">{item.name}</span>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                        item.category === 'deal' ? 'bg-orange-100 text-orange-600' :
                        item.category === 'special' ? 'bg-purple-100 text-purple-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {item.category}
                      </span>
                      {item.productCategory && (
                        <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
                          {item.productCategory}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#C41E3A]/50 mt-0.5 truncate">
                      {hasSizes ? 'Rs. ' + item.prices!.small + ' - ' + item.prices!.large : 'Rs. ' + item.price}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEdit(item); }}
                      className="p-2 rounded-full hover:bg-[#C41E3A]/10 transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4 text-[#C41E3A]/60" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(item.id, item.name); }}
                      className="p-2 rounded-full hover:bg-red-100 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-[#C41E3A]/40" /> : <ChevronDown className="w-4 h-4 text-[#C41E3A]/40" />}
                  </div>
                </button>

                {/* Expanded details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-[#C41E3A]/10"
                    >
                      <div className="p-5 space-y-3 text-xs">
                        <p className="text-[#C41E3A]/70">{item.description}</p>
                        {hasSizes ? (
                          <div className="flex gap-4">
                            <span className="font-bold">Small: Rs. {item.prices!.small}</span>
                            <span className="font-bold">Regular: Rs. {item.prices!.regular}</span>
                            <span className="font-bold">Large: Rs. {item.prices!.large}</span>
                          </div>
                        ) : (
                          <span className="font-bold">Price: Rs. {item.price}</span>
                        )}
                        {hasVariants && (
                          <div className="space-y-1">
                            <span className="font-bold block">Variants:</span>
                            {item.variants!.map((v, vi) => (
                              <div key={vi} className="ml-3">
                                <span className="font-semibold">{v.name}</span>
                                <span className="text-[#C41E3A]/50 ml-1">{v.required ? '(required)' : '(optional)'}</span>
                                <div className="ml-3 text-[#C41E3A]/70">
                                  {v.options.map((o, oi) => (
                                    <span key={oi} className="mr-3">
                                      {o.name}{o.price > 0 ? ' (+Rs. ' + o.price + ')' : ''}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="relative bg-[#FDF5E6] border-4 border-[#C41E3A] rounded-[40px] max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl z-10"
            >
              <button
                onClick={() => setShowForm(false)}
                className="absolute top-4 right-4 z-20 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-[#C41E3A] hover:scale-105 transition-transform cursor-pointer"
              >
                <X className="w-4 h-4 text-[#C41E3A]" />
              </button>

              <div className="p-8 pb-4 text-center border-b-2 border-[#C41E3A]/10">
                <div className="w-16 h-16 bg-[#FFB81C] rounded-full flex items-center justify-center mx-auto border-4 border-[#C41E3A] mb-4">
                  <Package className="w-7 h-7 text-[#C41E3A]" />
                </div>
                <h2 className="font-retro text-3xl text-[#C41E3A] uppercase tracking-wide leading-none">
                  {editingId ? 'Edit Product' : 'New Product'}
                </h2>
              </div>

              <form onSubmit={handleSave} className="p-8 space-y-4 text-left">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#C41E3A]/60">Name *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-white/70 border-2 border-[#C41E3A]/20 rounded-2xl px-4 py-3 text-sm focus:border-[#C41E3A] outline-none" required />
                </div>

                {/* Type category */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#C41E3A]/60">Type *</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full bg-white/70 border-2 border-[#C41E3A]/20 rounded-2xl px-4 py-3 text-sm focus:border-[#C41E3A] outline-none">
                    <option value="classic">Classic</option>
                    <option value="special">Special</option>
                    <option value="deal">Deal</option>
                  </select>
                </div>

                {/* Product Category */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#C41E3A]/60">Product Category</label>
                  <div className="flex gap-2">
                    <input
                      list="pc-suggestions"
                      type="text"
                      value={form.productCategory}
                      onChange={(e) => setForm({ ...form, productCategory: e.target.value })}
                      placeholder="e.g. Pizza, Burger, Broast..."
                      className="flex-1 bg-white/70 border-2 border-[#C41E3A]/20 rounded-2xl px-4 py-3 text-sm focus:border-[#C41E3A] outline-none"
                    />
                    <datalist id="pc-suggestions">
                      {PRODUCT_CATEGORIES.map((pc) => (
                        <option key={pc} value={pc} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#C41E3A]/60">Price</label>
                    <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="w-full bg-white/70 border-2 border-[#C41E3A]/20 rounded-2xl px-3 py-3 text-sm focus:border-[#C41E3A] outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#C41E3A]/60">Small</label>
                    <input type="number" step="0.01" value={form.price_small} onChange={(e) => setForm({ ...form, price_small: e.target.value })}
                      className="w-full bg-white/70 border-2 border-[#C41E3A]/20 rounded-2xl px-3 py-3 text-sm focus:border-[#C41E3A] outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#C41E3A]/60">Regular</label>
                    <input type="number" step="0.01" value={form.price_regular} onChange={(e) => setForm({ ...form, price_regular: e.target.value })}
                      className="w-full bg-white/70 border-2 border-[#C41E3A]/20 rounded-2xl px-3 py-3 text-sm focus:border-[#C41E3A] outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#C41E3A]/60">Large</label>
                    <input type="number" step="0.01" value={form.price_large} onChange={(e) => setForm({ ...form, price_large: e.target.value })}
                      className="w-full bg-white/70 border-2 border-[#C41E3A]/20 rounded-2xl px-3 py-3 text-sm focus:border-[#C41E3A] outline-none" />
                  </div>
                </div>

                {/* Variants Editor */}
                <div className="space-y-2 pt-2 border-t border-[#C41E3A]/10">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#C41E3A]/60">
                      <List className="w-3 h-3 inline mr-1" /> Variants
                    </label>
                    <button type="button" onClick={addVariantGroup}
                      className="text-[10px] font-black text-[#C41E3A] hover:text-[#FFB81C] transition-colors cursor-pointer flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Add Group
                    </button>
                  </div>
                  {form.variants.map((vg, gi) => (
                    <div key={gi} className="bg-white/60 border border-[#C41E3A]/15 rounded-2xl p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={vg.name}
                          onChange={(e) => updateVariantGroup(gi, { name: e.target.value })}
                          placeholder="e.g. Size, Spice Level..."
                          className="flex-1 bg-white border border-[#C41E3A]/20 rounded-xl px-3 py-2 text-xs font-medium focus:border-[#C41E3A] outline-none"
                        />
                        <label className="flex items-center gap-1 text-[10px] font-black text-[#C41E3A]/50 cursor-pointer whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={vg.required}
                            onChange={(e) => updateVariantGroup(gi, { required: e.target.checked })}
                            className="accent-[#C41E3A]"
                          />
                          Required
                        </label>
                        <button type="button" onClick={() => removeVariantGroup(gi)}
                          className="p-1.5 hover:bg-red-100 rounded-full transition-colors cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                      <div className="space-y-1.5 pl-2">
                        {vg.options.map((vo, oi) => (
                          <div key={oi} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={vo.name}
                              onChange={(e) => updateVariantOption(gi, oi, { name: e.target.value })}
                              placeholder="Option name"
                              className="flex-1 bg-white border border-[#C41E3A]/15 rounded-xl px-3 py-1.5 text-[11px] font-medium focus:border-[#C41E3A] outline-none"
                            />
                            <div className="relative w-20">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-[#C41E3A]/40 font-black">Rs.</span>
                              <input
                                type="number"
                                step="0.01"
                                value={vo.price}
                                onChange={(e) => updateVariantOption(gi, oi, { price: e.target.value })}
                                className="w-full bg-white border border-[#C41E3A]/15 rounded-xl pl-8 pr-2 py-1.5 text-[11px] font-medium focus:border-[#C41E3A] outline-none"
                              />
                            </div>
                            <button type="button" onClick={() => removeVariantOption(gi, oi)}
                              className="p-1 hover:bg-red-100 rounded-full transition-colors cursor-pointer">
                              <X className="w-3 h-3 text-red-400" />
                            </button>
                          </div>
                        ))}
                        <button type="button" onClick={() => addVariantOption(gi)}
                          className="text-[10px] font-black text-[#C41E3A]/40 hover:text-[#C41E3A] transition-colors cursor-pointer flex items-center gap-1 mt-1">
                          <Plus className="w-3 h-3" /> Add Option
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#C41E3A]/60">Description *</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
                    className="w-full bg-white/70 border-2 border-[#C41E3A]/20 rounded-2xl px-4 py-3 text-sm focus:border-[#C41E3A] outline-none resize-none" required />
                </div>

                {/* Image */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#C41E3A]/60">
                    <Image className="w-3 h-3" /> Image URL *
                  </label>
                  <input type="url" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className="w-full bg-white/70 border-2 border-[#C41E3A]/20 rounded-2xl px-4 py-3 text-sm focus:border-[#C41E3A] outline-none" required />
                  {form.image && (
                    <img src={form.image} alt="Preview" className="w-20 h-20 rounded-xl object-cover border-2 border-[#C41E3A]/10 mt-1" />
                  )}
                </div>

                <button type="submit" disabled={saving}
                  className="w-full bg-[#FFB81C] text-[#C41E3A] font-black py-3.5 rounded-2xl uppercase tracking-widest shadow-lg border-2 border-[#C41E3A] hover:bg-[#ffa71c] disabled:opacity-60 transition-all cursor-pointer"
                >
                  {saving ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
