import { useState, useEffect, useCallback } from 'react';
import { Package, ShoppingBag, Users, ShieldOff, Pizza, QrCode, ChefHat } from 'lucide-react';
import { useAuth } from '@clerk/react';
import AdminOrders from './AdminOrders';
import AdminProducts from './AdminProducts';
import AdminUsers from './AdminUsers';
import AdminAddons from './AdminAddons';
import AdminTables from './AdminTables';

type AdminTab = 'orders' | 'products' | 'users' | 'addons' | 'tables';

const TABS: { key: AdminTab; label: string; icon: any }[] = [
  { key: 'orders', label: 'Orders', icon: ShoppingBag },
  { key: 'products', label: 'Products', icon: Package },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'addons', label: 'Add-ons', icon: Pizza },
  { key: 'tables', label: 'Tables', icon: QrCode },
];

const API_BASE = import.meta.env.VITE_API_URL ?? '';

interface Props {
  onNavigateHome: () => void;
}

export default function AdminDashboard({ onNavigateHome }: Props) {
  const { getToken, isSignedIn } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('orders');
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkDone, setCheckDone] = useState(false);

  const checkAccess = useCallback(async () => {
    if (!isSignedIn) {
      setIsAdmin(false);
      setCheckDone(true);
      return;
    }
    try {
      const token = await getToken();
      if (!token) {
        setIsAdmin(false);
        setCheckDone(true);
        return;
      }
      const res = await fetch(API_BASE + '/api/admin/check', {
        headers: { Authorization: 'Bearer ' + token },
      });
      if (!res.ok) throw new Error('Not admin');
      const data = await res.json();
      setIsAdmin(data.admin);
    } catch {
      setIsAdmin(false);
    } finally {
      setCheckDone(true);
    }
  }, [isSignedIn, getToken]);

  useEffect(() => {
    if (!checkDone) checkAccess();
  }, [checkDone, checkAccess]);

  if (!checkDone) {
    return (
      <section className="min-h-screen bg-[#FDF5E6] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#C41E3A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-black text-sm text-[#C41E3A] uppercase tracking-wider">Checking access...</p>
        </div>
      </section>
    );
  }

  if (isAdmin === false) {
    return (
      <section className="min-h-screen bg-[#FDF5E6] py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white border-4 border-[#C41E3A] rounded-[36px] p-12 shadow-md">
            <ShieldOff className="w-16 h-16 text-[#C41E3A] mx-auto mb-4 opacity-40" />
            <h2 className="font-retro text-4xl text-[#C41E3A] uppercase tracking-wide mb-3">Access Denied</h2>
            <p className="text-sm text-[#C41E3A]/70 mb-6">
              This area is for restaurant staff only. If you're an admin or manager, sign in with your staff account.
            </p>
            <button onClick={onNavigateHome}
              className="bg-[#C41E3A] text-white px-8 py-3 rounded-full font-black uppercase tracking-wider text-xs hover:brightness-110 transition-all cursor-pointer">
              Back to Home
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF5E6]">
      {/* Tab Bar */}
      <div className="sticky top-0 z-30 bg-[#C41E3A] border-b-4 border-[#FFB81C]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between py-3">
            <h2 className="font-retro text-2xl md:text-3xl text-white uppercase tracking-wide leading-none">Admin</h2>
            <button onClick={onNavigateHome}
              className="bg-white text-[#C41E3A] px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-wider hover:bg-[#FFB81C] transition-all cursor-pointer">
              &larr; Site
            </button>
          </div>
          <div className="flex gap-1 -mb-[2px]">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl font-black text-[11px] uppercase tracking-wider border-2 border-b-0 transition-all cursor-pointer ${
                  activeTab === key
                    ? 'bg-[#FDF5E6] text-[#C41E3A] border-[#FFB81C]'
                    : 'bg-[#C41E3A] text-white/70 border-transparent hover:bg-white/10 hover:text-white'
                }`}>
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'orders' && <AdminOrders onNavigateHome={onNavigateHome} />}
        {activeTab === 'products' && <AdminProducts />}
        {activeTab === 'users' && <AdminUsers />}
        {activeTab === 'addons' && <AdminAddons />}
        {activeTab === 'tables' && <AdminTables />}
      </div>
    </div>
  );
}
