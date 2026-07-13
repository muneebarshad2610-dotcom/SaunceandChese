import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/react';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/layout/Navbar';
import Hero from './components/sections/Hero';
import StorySection from './components/sections/StorySection';
import MenuSection from './components/sections/MenuSection';
import DealsSection from './components/sections/DealsSection';
import InstagramMarquee from './components/sections/InstagramMarquee';
import LocationsSection from './components/sections/LocationsSection';
import Footer from './components/layout/Footer';
import QuickViewModal from './components/modals/QuickViewModal';
import CartDrawer from './components/modals/CartDrawer';
import CheckoutForm from './components/modals/CheckoutForm';
import OrderSuccessModal from './components/modals/OrderSuccessModal';
import OrderHistory from './pages/OrderHistory';
import AdminOrders from './pages/AdminOrders';
import { useCart } from './hooks/useCart';
import { useMenuItems } from './hooks/useMenuItems';
import type { MenuItem, OrderDetails, CheckoutFormData } from './types';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

type Page = 'home' | 'orders' | 'admin';

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
    removeItem,
    clearCart,
  } = useCart();

  // Page routing
  const [currentPage, setCurrentPage] = useState<Page>('home');

  // Modal state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewItem, setQuickViewItem] = useState<MenuItem | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [lastOrderDetails, setLastOrderDetails] = useState<OrderDetails | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const adminCheckedRef = useRef(false);

  // Check admin status once
  useEffect(() => {
    if (!isSignedIn || adminCheckedRef.current) return;
    adminCheckedRef.current = true;

    (async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${API_BASE}/api/admin/check`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setIsAdmin(data.admin);
        }
      } catch {
        // Non-critical, just hide admin features
      }
    })();
  }, [isSignedIn, getToken]);

  // Handlers
  const navigate = useCallback((page: Page) => {
    setCurrentPage(page);
    // Close cart if navigating away
    if (page !== 'home') {
      setIsCartOpen(false);
    }
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

  // Open checkout form instead of submitting immediately
  const handleCheckout = useCallback(() => {
    if (!isSignedIn) return;
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  }, [isSignedIn]);

  // Submit order with customer details
  const handleConfirmCheckout = useCallback(
    async (formData: CheckoutFormData) => {
      if (!isSignedIn) return;

      setCheckoutLoading(true);
      const orderId = 'SNC-' + Math.floor(100000 + Math.random() * 900000);

      try {
        const token = await getToken();
        const res = await fetch(`${API_BASE}/api/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
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
          throw new Error((errorData as { error?: string }).error || `Server error: ${res.status}`);
        }
      } catch (err) {
        console.error('Order submission failed:', err);
        setCheckoutLoading(false);
        alert('Failed to place order. Please try again.');
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
      const res = await fetch(`${API_BASE}/api/contact`, {
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

  // Render the appropriate page
  if (currentPage === 'orders') {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-[#FDF5E6] text-[#1A1A1A] font-sans overflow-x-hidden flex flex-col">
          <Navbar
            cartItemCount={cartItemCount}
            onCartOpen={() => setIsCartOpen(true)}
            currentPage={currentPage}
            onNavigate={navigate}
            isAdmin={isAdmin}
          />
          <OrderHistory onNavigateHome={() => navigate('home')} />
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
        </div>
      </ErrorBoundary>
    );
  }

  if (currentPage === 'admin') {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-[#FDF5E6] text-[#1A1A1A] font-sans overflow-x-hidden flex flex-col">
          <Navbar
            cartItemCount={cartItemCount}
            onCartOpen={() => setIsCartOpen(true)}
            currentPage={currentPage}
            onNavigate={navigate}
            isAdmin={isAdmin}
          />
          <AdminOrders onNavigateHome={() => navigate('home')} />
        </div>
      </ErrorBoundary>
    );
  }

  // Home page
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#FDF5E6] text-[#1A1A1A] font-sans selection:bg-[#FFB81C] selection:text-[#C41E3A] overflow-x-hidden flex flex-col">
        <Navbar
          cartItemCount={cartItemCount}
          onCartOpen={() => setIsCartOpen(true)}
          currentPage={currentPage}
          onNavigate={navigate}
          isAdmin={isAdmin}
        />

        <main className="flex-1">
          <Hero />
          <StorySection />

          {error ? (
            <section className="py-20 px-6 text-center">
              <div className="max-w-lg mx-auto bg-white border-4 border-[#C41E3A] rounded-[36px] p-10 shadow-md">
                <p className="font-retro text-3xl text-[#C41E3A] uppercase tracking-wide mb-3">
                  🚫 Couldn't Reach the Kitchen
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
            </>
          )}

          <InstagramMarquee />
          <LocationsSection onSubmitContact={handleContactSubmit} />
        </main>

        <Footer />

        {/* Modals */}
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

        <CheckoutForm
          isOpen={isCheckoutOpen}
          cartItemCount={cartItemCount}
          cartSubtotal={cartSubtotal}
          onClose={() => {
            setIsCheckoutOpen(false);
            setIsCartOpen(true); // Re-open cart if they cancel
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
}
