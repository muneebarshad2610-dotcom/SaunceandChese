import { useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { useAuth } from '@clerk/react';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/layout/Navbar';
import Hero from './components/sections/Hero';
import StorySection from './components/sections/StorySection';
import MenuSection from './components/sections/MenuSection';
import DealsSection from './components/sections/DealsSection';
import AddonsSection from './components/sections/AddonsSection';
import InstagramMarquee from './components/sections/InstagramMarquee';
import LocationsSection from './components/sections/LocationsSection';
import Footer from './components/layout/Footer';
import QuickViewModal from './components/modals/QuickViewModal';
import CartDrawer from './components/modals/CartDrawer';
import CheckoutConfirmModal from './components/modals/CheckoutConfirmModal';
import CheckoutForm from './components/modals/CheckoutForm';
import OrderSuccessModal from './components/modals/OrderSuccessModal';
import OrderHistory from './pages/OrderHistory';
import AdminDashboard from './pages/AdminDashboard';
import KitchenView from './pages/KitchenView';
import TableOrder from './pages/TableOrder';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ProfilePage from './pages/ProfilePage';
import { useCart } from './hooks/useCart';
import { useMenuItems } from './hooks/useMenuItems';
import type { MenuItem, OrderDetails, CheckoutFormData } from './types';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

type Page = 'home' | 'menu' | 'orders' | 'admin' | 'kitchen' | 'profile' | 'terms' | 'privacy';

// Dynamic path-based pages (not in the Page union)
type DynamicPage = { type: 'table'; token: string };

export default function App() {
  const { isSignedIn, getToken } = useAuth();

  // Menu data
  const { menuItems, loading, error } = useMenuItems();

  // Cart state
  const {
    cart,
    cartItemCount,
    cartSubtotal,
    addToCart,
    quickAddToCart,
    addAddonToCart,
    removeItem,
    clearCart,
  } = useCart();

  // Page routing — sync with URL via History API
  const getPageFromPath = (): Page | DynamicPage => {
    const path = window.location.pathname;
    if (path === '/menu') return 'menu';
    if (path === '/orders') return 'orders';
    if (path === '/admin') return 'admin';
    if (path === '/kitchen') return 'kitchen';
    if (path === '/terms') return 'terms';
    if (path === '/privacy') return 'privacy';
    const tableMatch = path.match(/^\/table\/(.+)/);
    if (tableMatch) return { type: 'table', token: tableMatch[1] };
    return 'home';
  };

  const [currentPage, setCurrentPage] = useState<Page | DynamicPage>(getPageFromPath);

  // Sync state with browser back/forward
  useEffect(() => {
    const handlePopState = () => setCurrentPage(getPageFromPath());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Modal state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewItem, setQuickViewItem] = useState<MenuItem | null>(null);
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [lastOrderDetails, setLastOrderDetails] = useState<OrderDetails | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isKitchen, setIsKitchen] = useState(false);
  const adminCheckedRef = useRef(false);

  // Check admin + kitchen status once
  useEffect(() => {
    if (!isSignedIn || adminCheckedRef.current) return;
    adminCheckedRef.current = true;

    (async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const res = await fetch(API_BASE + '/api/admin/check', {
          headers: { Authorization: 'Bearer ' + token },
        });
         if (res.ok) {
           const data = await res.json();
           setIsAdmin(data.admin);
           // Kitchen check: users with 'kitchen', 'admin', or 'manager' role can access kitchen
           const kitchenRes = await fetch(API_BASE + '/api/kitchen/check', {
             headers: { Authorization: 'Bearer ' + token },
           });
           if (kitchenRes.ok) {
             const kitchenData = await kitchenRes.json();
             setIsKitchen(kitchenData.kitchen);
           }
         }
      } catch {
        // Non-critical, just hide features
      }
    })();
  }, [isSignedIn, getToken]);

  // Handlers
  const navigate = useCallback((page: Page) => {
    setCurrentPage(page);
    // Close cart if navigating away from product pages
    if (page !== 'home' && page !== 'menu') {
      setIsCartOpen(false);
    }
    // Update browser URL without reload
    const url = page === 'home' ? '/' : '/' + page;
    window.history.pushState({ page }, '', url);
  }, []);



  const openQuickView = useCallback((item: MenuItem) => {
    setQuickViewItem(item);
  }, []);

  const handleQuickAdd = useCallback(
    (item: MenuItem) => {
      quickAddToCart(item);
      setIsCartOpen(true);
    },
    [quickAddToCart]
  );

  // Open checkout confirmation prompt first
  const handleCheckout = useCallback(() => {
    if (!isSignedIn) return;
    setIsCartOpen(false);
    setShowCheckoutConfirm(true);
  }, [isSignedIn]);

  // Proceed from confirmation to delivery form
  const handleProceedToCheckout = useCallback(() => {
    setShowCheckoutConfirm(false);
    setIsCheckoutOpen(true);
  }, []);

  // Go back from confirmation to cart
  const handleCancelCheckout = useCallback(() => {
    setShowCheckoutConfirm(false);
    setIsCartOpen(true);
  }, []);

  // Submit order with customer details
  const handleConfirmCheckout = useCallback(
    async (formData: CheckoutFormData) => {
      if (!isSignedIn) return;

      setCheckoutLoading(true);
      const orderId = 'SNC-' + Math.floor(100000 + Math.random() * 900000);

      try {
        const token = await getToken();
        if (!token) {
          throw new Error('Session token is null. Please sign out and sign back in.');
        }

        const res = await fetch(API_BASE + '/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
          body: JSON.stringify({
            orderNumber: orderId,
            items: cart,
            subtotal: cartSubtotal,
            customerName: formData.customerName,
            customerPhone: formData.customerPhone,
            deliveryAddress: formData.deliveryAddress,
            deliveryNotes: formData.deliveryNotes,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error((errorData as { error?: string }).error || 'Server error: ' + res.status);
        }
      } catch (err) {
        console.error('Order submission failed:', err);
        setCheckoutLoading(false);
        alert(err instanceof Error ? err.message : 'Failed to place order. Please try again.');
        return;
      }

      setLastOrderDetails({
        id: orderId,
        total: cartSubtotal,
        itemsCount: cartItemCount,
      });
      setShowOrderSuccess(true);
      setIsCheckoutOpen(false);
      clearCart();
      setCheckoutLoading(false);
    },
    [isSignedIn, getToken, cart, cartSubtotal, cartItemCount, clearCart]
  );

  const handleContactSubmit = useCallback(
    async (data: { name: string; email: string; message: string }) => {
      const res = await fetch(API_BASE + '/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error((errBody as { error?: string }).error ?? 'Failed to submit contact form');
      }
    },
    []
  );

  // Render layout shell shared by all pages (navbar + modals)
  const renderShell = (children: ReactNode) => (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#FDF5E6] text-[#1A1A1A] font-sans selection:bg-[#FFB81C] selection:text-[#C41E3A] overflow-x-hidden flex flex-col">
        <Navbar
          cartItemCount={cartItemCount}
          onCartOpen={() => setIsCartOpen(true)}
          currentPage={currentPage}
          onNavigate={navigate}
          isAdmin={isAdmin}
          isKitchen={isKitchen}
        />

        <main className="flex-1">{children}</main>

        <Footer />

        {/* Modals — available on all pages */}
        <QuickViewModal
          item={quickViewItem}
          onClose={() => setQuickViewItem(null)}
          onAddToCart={(item, options) => {
            addToCart(item, options);
            setIsCartOpen(true);
          }}
        />

        <CartDrawer
          isOpen={isCartOpen}
          cart={cart}
          cartItemCount={cartItemCount}
          cartSubtotal={cartSubtotal}
          onClose={() => setIsCartOpen(false)}
          onRemoveItem={removeItem}
          onCheckout={handleCheckout}
          checkoutLoading={checkoutLoading}
          isSignedIn={!!isSignedIn}
        />

        <CheckoutConfirmModal
          isOpen={showCheckoutConfirm}
          onProceed={handleProceedToCheckout}
          onCancel={handleCancelCheckout}
        />

        <CheckoutForm
          isOpen={isCheckoutOpen}
          cartItemCount={cartItemCount}
          cartSubtotal={cartSubtotal}
          onClose={() => {
            setIsCheckoutOpen(false);
            setIsCartOpen(true);
          }}
          onSubmit={handleConfirmCheckout}
          loading={checkoutLoading}
        />

        <OrderSuccessModal
          isOpen={showOrderSuccess}
          orderDetails={lastOrderDetails}
          onClose={() => setShowOrderSuccess(false)}
        />
      </div>
    </ErrorBoundary>
  );

  // ─── Page: Orders ────────────────────────────────────────
  if (currentPage === 'orders') {
    return renderShell(
      <OrderHistory onNavigateHome={() => navigate('home')} />
    );
  }

  // ─── Page: Admin ─────────────────────────────────────────
  if (currentPage === 'admin') {
    return renderShell(
      <AdminDashboard onNavigateHome={() => navigate('home')} />
    );
  }

  // ─── Page: Kitchen ───────────────────────────────────────
  if (currentPage === 'kitchen') {
    return (
      <ErrorBoundary>
        <KitchenView onNavigateHome={() => navigate('home')} />
      </ErrorBoundary>
    );
  }

  // ─── Page: Profile ──────────────────────────────────────
  if (currentPage === 'profile') {
    return renderShell(
      <ProfilePage onNavigateHome={() => navigate('home')} />
    );
  }

  // ─── Page: Table QR Ordering ──────────────────────────────
  if (typeof currentPage === 'object' && currentPage.type === 'table') {
    return (
      <ErrorBoundary>
        <TableOrder onNavigateHome={() => navigate('home')} />
      </ErrorBoundary>
    );
  }

  // ─── Page: Menu ─────────────────────────────────────────
  if (currentPage === 'menu') {
    return renderShell(
      <>
        {error ? (
          <section className="py-20 px-6 text-center">
            <div className="max-w-lg mx-auto bg-white border-4 border-[#C41E3A] rounded-[36px] p-10 shadow-md">
              <p className="font-retro text-3xl text-[#C41E3A] uppercase tracking-wide mb-3">
                {'\u{1F6AB}'} Couldn't Reach the Kitchen
              </p>
              <p className="text-sm text-[#C41E3A]/70 leading-relaxed">
                Our menu server is taking a break. Please check your connection and try
                again later. We're still gooey at heart.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-6 bg-[#C41E3A] text-white px-8 py-3 rounded-full font-black uppercase tracking-wider text-xs hover:brightness-110 transition-all cursor-pointer"
              >
                Retry Connection
              </button>
            </div>
          </section>
        ) : (
          <>
            <MenuSection
              items={menuItems}
              loading={loading}
              onQuickView={openQuickView}
              onQuickAdd={handleQuickAdd}
            />
            <DealsSection
              items={menuItems}
              loading={loading}
              onQuickView={openQuickView}
              onQuickAdd={handleQuickAdd}
            />
            <AddonsSection onAddAddon={addAddonToCart} />
          </>
        )}
      </>
    );
  }

  // ─── Page: Terms of Service ──────────────────────────────
  if (currentPage === 'terms') {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-[#FDF5E6] font-sans flex flex-col">
          <TermsOfService onNavigateHome={() => navigate('home')} />
        </div>
      </ErrorBoundary>
    );
  }

  // ─── Page: Privacy Policy ────────────────────────────────
  if (currentPage === 'privacy') {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-[#FDF5E6] font-sans flex flex-col">
          <PrivacyPolicy onNavigateHome={() => navigate('home')} />
        </div>
      </ErrorBoundary>
    );
  }

  // ─── Page: Home ──────────────────────────────────────────
  return renderShell(
    <>
      <Hero onNavigateMenu={() => navigate('menu')} />
      <StorySection />
      <InstagramMarquee />
      <LocationsSection onSubmitContact={handleContactSubmit} />
    </>
  );
}
