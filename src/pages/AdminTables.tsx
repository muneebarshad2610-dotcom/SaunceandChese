import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Plus, Pencil, Trash2, X, QrCode, Search, Copy, Check } from 'lucide-react';
import { useAuth } from '@clerk/react';
import type { TableInfo } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

const BASE_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
  : window.location.origin;

export default function AdminTables() {
  const { getToken } = useAuth();
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [form, setForm] = useState({ tableNumber: '', capacity: '4' });

  const fetchTables = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(API_BASE + '/api/tables', {
        headers: { Authorization: 'Bearer ' + token },
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setTables(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => { fetchTables(); }, [fetchTables]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ tableNumber: '', capacity: '4' });
    setShowForm(true);
  };

  const openEdit = (table: TableInfo) => {
    setEditingId(table.id);
    setForm({ tableNumber: table.tableNumber.toString(), capacity: table.capacity.toString() });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this table? This will invalidate its QR code.')) return;
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(API_BASE + '/api/tables/' + id, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token },
      });
      if (!res.ok) throw new Error('Failed');
      setTables((prev) => prev.filter((t) => t.id !== id));
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
        table_number: parseInt(form.tableNumber),
        capacity: parseInt(form.capacity) || 4,
      };

      const url = editingId
        ? API_BASE + '/api/tables/' + editingId
        : API_BASE + '/api/tables';
      const method = editingId ? 'PATCH' : 'POST';

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
      await fetchTables();
      setShowForm(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const copyQR = (table: TableInfo) => {
    const url = BASE_URL + '/table/' + table.qrToken;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(table.id);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {
      prompt('Copy this QR URL:', url);
    });
  };

const loadQR = async (table: TableInfo) => {
    const url = BASE_URL + '/table/' + table.qrToken;
    const qrSrc = 'https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=' + encodeURIComponent(url);
    const a = document.createElement('a');
    a.href = qrSrc;
    a.download = 'Table-' + table.tableNumber + '-QR.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const qrUrl = (table: TableInfo) => BASE_URL + '/table/' + table.qrToken;

  return (
    <section className="min-h-screen bg-[#FDF5E6]">
      <div className="bg-[#C41E3A] px-6 md:px-12 py-6 border-b-4 border-[#FFB81C]">
        <div className="max-w-7xl mx-auto flex items-center justify-between mb-4">
          <div>
            <h2 className="font-retro text-4xl md:text-5xl text-white uppercase tracking-wide leading-none">Table Management</h2>
            <p className="text-[#FFB81C] text-sm font-black uppercase tracking-wider mt-1">QR Codes &amp; Seating</p>
          </div>
          <button onClick={openCreate}
            className="bg-[#FFB81C] text-[#C41E3A] px-5 py-2 rounded-full font-black text-xs uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#ffa71c] transition-all cursor-pointer">
            <Plus className="w-3.5 h-3.5" /> Add Table
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border-2 border-[#C41E3A]/10 rounded-[24px] p-6 animate-pulse">
                <div className="h-5 bg-[#C41E3A]/10 rounded w-1/4" />
              </div>
            ))}
          </div>
        )}

        {!loading && tables.length === 0 && (
          <div className="bg-white border-2 border-[#C41E3A]/10 rounded-[24px] p-12 text-center">
            <QrCode className="w-16 h-16 text-[#C41E3A]/30 mx-auto mb-3" />
            <p className="font-retro text-2xl text-[#C41E3A] uppercase tracking-wide">No Tables Yet</p>
            <button onClick={openCreate} className="mt-4 bg-[#C41E3A] text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-wider cursor-pointer">Add Your First Table</button>
          </div>
        )}

        <div className="space-y-3">
          {tables.map((table) => (
            <motion.div key={table.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white border-2 border-[#C41E3A]/10 rounded-[24px] p-5 hover:border-[#C41E3A]/25 transition-all"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#FFB81C]/20 rounded-2xl border-2 border-[#C41E3A]/20 flex items-center justify-center">
                    <span className="font-retro text-2xl text-[#C41E3A]">T{table.tableNumber}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-lg text-[#C41E3A]">Table {table.tableNumber}</span>
                      <span className="text-[10px] text-[#C41E3A]/40">Seats {table.capacity}</span>
                    </div>
                    <p className="text-[10px] text-[#C41E3A]/40 font-mono truncate max-w-[200px]">{qrUrl(table)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => copyQR(table)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#C41E3A]/5 hover:bg-[#C41E3A]/10 text-[#C41E3A] font-black text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                    title="Copy QR URL">
                    {copiedId === table.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedId === table.id ? 'Copied!' : 'Copy QR'}
                  </button>
                  <button onClick={() => loadQR(table)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FFB81C]/20 hover:bg-[#FFB81C]/30 text-[#C41E3A] font-black text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                    title="Download QR PNG">
                    <QrCode className="w-3.5 h-3.5" /> Download QR
                  </button>
                  <button onClick={() => openEdit(table)}
                    className="p-2 rounded-full hover:bg-[#C41E3A]/10 transition-colors cursor-pointer">
                    <Pencil className="w-4 h-4 text-[#C41E3A]/60" />
                  </button>
                  <button onClick={() => handleDelete(table.id)}
                    className="p-2 rounded-full hover:bg-red-100 transition-colors cursor-pointer">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowForm(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <motion.div initial={{ scale: 0.9, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 25 }}
            className="relative bg-[#FDF5E6] border-4 border-[#C41E3A] rounded-[40px] max-w-sm w-full shadow-2xl z-10">
            <button onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 z-20 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-[#C41E3A] hover:scale-105 transition-transform cursor-pointer">
              <X className="w-4 h-4 text-[#C41E3A]" />
            </button>
            <div className="p-8 pb-4 text-center border-b-2 border-[#C41E3A]/10">
              <h2 className="font-retro text-3xl text-[#C41E3A] uppercase">{editingId ? 'Edit Table' : 'New Table'}</h2>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#C41E3A]/60">Table Number *</label>
                <input type="number" value={form.tableNumber} onChange={(e) => setForm({ ...form, tableNumber: e.target.value })}
                  className="w-full bg-white/70 border-2 border-[#C41E3A]/20 rounded-2xl px-4 py-3 text-sm focus:border-[#C41E3A] outline-none" required min="1" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#C41E3A]/60">Capacity</label>
                <input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  className="w-full bg-white/70 border-2 border-[#C41E3A]/20 rounded-2xl px-4 py-3 text-sm focus:border-[#C41E3A] outline-none" min="1" />
              </div>
              <button type="submit" disabled={saving}
                className="w-full bg-[#FFB81C] text-[#C41E3A] font-black py-3.5 rounded-2xl uppercase tracking-widest shadow-lg border-2 border-[#C41E3A] hover:bg-[#ffa71c] disabled:opacity-60 transition-all cursor-pointer">
                {saving ? 'Saving...' : editingId ? 'Update Table' : 'Create Table'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </section>
  );
}
