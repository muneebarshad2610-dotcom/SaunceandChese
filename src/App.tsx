import { useState, useCallback } from 'react';
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
import OrderSuccessModal from './components/modals/OrderSuccessModal';
import { useCart } from './hooks/useCart';
import { useMenuItems } from './hooks/useMenuItems';
import type { MenuItem, OrderDetails } from './types';

export default function App() {
  // Menu data
  const { menuItems, loading, error } = useMenuItems();

  // Cart state
  const {
    cart,
    cartItemCount,
    cartSubtotal,
    addToCart,
    quickAddToCart,
    adjustQty,
    removeItem,
    clearCart,
  } = useCart();

  // Modal state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewItem, setQuickViewItem] = useState<MenuItem | null>(null);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [lastOrderDetails, setLastOrderDetails] = useState<OrderDetails | null>(null);

  // Handlers
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

  const handleCheckout = useCallback(() => {
    const orderId = 'SNC-' + Math.floor(100000 + Math.random() * 900000);
    setLastOrderDetails({
      id: orderId,
      total: cartSubtotal,
      itemsCount: cartItemCount,
    });
    setShowOrderSuccess(true);
    clearCart();
    setIsCartOpen(false);
  }, [cartSubtotal, cartItemCount, clearCart]);

  const handleContactSubmit = useCallback(
    async (data: { name: string; email: string; message: string }) => {
      const API_BASE = import.meta.env.VITE_API_URL ?? '';
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to submit contact form');
    },
    []
  );

  return (
    <div className="min-h-screen bg-[#FDF5E6] text-[#1A1A1A] font-sans selection:bg-[#FFB81C] selection:text-[#C41E3A] overflow-x-hidden flex flex-col">
      <Navbar cartItemCount={cartItemCount} onCartOpen={() => setIsCartOpen(true)} />

      <main className="flex-1">
        <Hero />
        <StorySection />

        {error ? (
          <section className="py-20 px-6 text-center">
            <p className="font-retro text-3xl text-[#C41E3A]">Failed to load menu: {error}</p>
            <p className="text-sm text-[#C41E3A]/70 mt-2">Please try again later.</p>
          </section>
        ) : (
          <>
            <MenuSection
              items={menuItems}
              onQuickView={openQuickView}
              onQuickAdd={handleQuickAdd}
            />
            <DealsSection
              items={menuItems}
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
        onAdjustQty={adjustQty}
        onRemoveItem={removeItem}
        onCheckout={handleCheckout}
      />

      <OrderSuccessModal
        isOpen={showOrderSuccess}
        orderDetails={lastOrderDetails}
        onClose={() => setShowOrderSuccess(false)}
      />
    </div>
  );
}
