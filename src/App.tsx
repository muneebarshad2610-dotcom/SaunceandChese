import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ArrowLeft, ShoppingBag } from 'lucide-react';
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

  // Page routing — sync with URL via History API
  const getPageFromPath = (): Page => {
    const path = window.location.pathname;
    if (path === '/orders') return 'orders';
    if (path === '/admin') return 'admin';
    return 'home';
  };

  const [currentPage, setCurrentPage] = useState<Page>(getPageFromPath);

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
    // Update browser URL without reload
    const url = page === 'home' ? '/' : `/${page}`;
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

        {/* Checkout Confirmation Prompt */}
        <AnimatePresence>
          {showCheckoutConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleCancelCheckout}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                transition={{ type: 'spring', damping: 25 }}
                className="relative bg-[#FDF5E6] border-4 border-[#C41E3A] rounded-[40px] max-w-sm w-full p-8 shadow-2xl z-10 text-center"
              >
                <div className="w-16 h-16 bg-[#FFB81C] rounded-full flex items-center justify-center mx-auto border-4 border-[#C41E3A] mb-5">
                  <ShoppingBag className="w-8 h-8 text-[#C41E3A]" />
                </div>

                <h3 className="font-retro text-3xl text-[#C41E3A] uppercase tracking-wide leading-none mb-3">
                  Almost There!
                </h3>
                <p className="font-handwritten text-xl text-[#FFB81C] mb-4">You're one step away...</p>

                <div className="bg-white border-2 border-[#C41E3A]/15 rounded-2xl p-4 mb-6 text-left">
                  <p className="text-sm text-[#C41E3A]/80 leading-relaxed">
                    You'll be taken to a <strong className="text-[#C41E3A]">delivery details</strong> form to enter your
                    name, phone, and delivery address before placing the order.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleProceedToCheckout}
                    className="w-full bg-[#FFB81C] text-[#C41E3A] font-black py-3.5 rounded-2xl uppercase tracking-widest text-sm shadow-lg border-2 border-[#C41E3A] hover:bg-[#ffa71c] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    Proceed to Delivery Details
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancelCheckout}
                    className="text-xs font-black uppercase tracking-wider text-[#C41E3A]/50 hover:text-[#C41E3A] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Go Back to Cart
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

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
