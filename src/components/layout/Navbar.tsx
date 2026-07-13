import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, ShoppingBag, Menu, X } from 'lucide-react';
import { useAuth, Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/react';
import { useScrollLock } from '../../hooks/useScrollLock';

type Page = 'home' | 'menu' | 'orders' | 'admin' | 'kitchen' | 'profile' | 'terms' | 'privacy';

interface NavbarProps {
  cartItemCount: number;
  onCartOpen: () => void;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isAdmin?: boolean;
  isKitchen?: boolean;
}

const NAV_LINKS: { page: Page; label: string }[] = [
  { page: 'home', label: 'Home' },
  { page: 'menu', label: 'Menu' },
];

export default function Navbar({ cartItemCount, onCartOpen, currentPage, onNavigate, isAdmin, isKitchen }: NavbarProps) {
  const { isSignedIn } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  useScrollLock(mobileOpen);

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav
      id="site-nav"
      className="sticky top-0 z-40 bg-[#FDF5E6]/95 backdrop-blur-md border-b-4 border-[#C41E3A] py-3 px-4 sm:px-6 md:px-12 flex justify-between items-center shadow-sm"
    >
      {/* Brand */}
      <button
        onClick={() => { onNavigate('home'); closeMobile(); }}
        className="flex items-center gap-2 sm:gap-3 cursor-pointer text-left"
      >
        <motion.div
          whileHover={{ scale: 1.1, rotate: -5 }}
          className="w-9 h-9 sm:w-11 sm:h-11 bg-[#FFB81C] rounded-full flex items-center justify-center border-2 border-[#C41E3A]"
        >
          <Flame className="text-[#C41E3A] w-5 h-5 sm:w-6 sm:h-6 fill-[#C41E3A]" />
        </motion.div>
        <span className="font-retro text-lg sm:text-2xl md:text-3xl tracking-wider text-[#C41E3A] uppercase leading-none">
          Sauce <span className="text-[#FFB81C]">n'</span> Cheese
        </span>
      </button>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-4 font-black uppercase tracking-wider text-xs text-[#C41E3A]">
        {NAV_LINKS.map(({ page, label }) => (
          <button
            key={page}
            onClick={() => onNavigate(page)}
            className={`transition-colors cursor-pointer ${
              currentPage === page ? 'text-[#FFB81C]' : 'hover:text-[#FFB81C]'
            }`}
          >
            {label}
          </button>
        ))}

        <Show when="signed-in">
          <button
            onClick={() => onNavigate('orders')}
            className={`transition-colors cursor-pointer ${
              currentPage === 'orders' ? 'text-[#FFB81C]' : 'hover:text-[#FFB81C]'
            }`}
          >
            My Orders
          </button>
          <button
            onClick={() => onNavigate('profile')}
            className={`transition-colors cursor-pointer ${
              currentPage === 'profile' ? 'text-[#FFB81C]' : 'hover:text-[#FFB81C]'
            }`}
          >
            Profile
          </button>
        </Show>

        {isAdmin && (
          <button
            onClick={() => onNavigate('admin')}
            className={`transition-colors cursor-pointer ${
              currentPage === 'admin' ? 'text-[#FFB81C]' : 'hover:text-[#FFB81C]'
            }`}
          >
            Admin
          </button>
        )}

        {isKitchen && (
          <button
            onClick={() => onNavigate('kitchen')}
            className={`transition-colors cursor-pointer ${
              currentPage === 'kitchen' ? 'text-[#FFB81C]' : 'hover:text-[#FFB81C]'
            }`}
          >
            Kitchen
          </button>
        )}

        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className="bg-white text-[#C41E3A] border-2 border-[#C41E3A] px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-wider hover:bg-[#C41E3A] hover:text-white transition-all cursor-pointer">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="bg-[#FFB81C] text-[#C41E3A] border-2 border-[#C41E3A] px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-wider hover:bg-[#ffa71c] transition-all cursor-pointer">
              Sign Up
            </button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <div className="flex items-center gap-2">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-8 h-8 border-2 border-[#C41E3A] rounded-full',
                },
              }}
            />
          </div>
        </Show>

        {/* Cart button */}
        <div className="relative flex items-center gap-1">
          <button
            id="cart-toggle-btn"
            onClick={onCartOpen}
            aria-label="Open shopping cart"
            className="relative bg-[#FFB81C] text-[#C41E3A] p-2.5 rounded-full border-2 border-[#C41E3A] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartItemCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 bg-[#C41E3A] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#FDF5E6]"
              >
                {cartItemCount}
              </motion.span>
            )}
          </button>
          {cartItemCount > 0 && (
            <motion.span
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden sm:inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-green-600 bg-green-50 border border-green-300 px-1.5 py-0.5 rounded-full"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Saved
            </motion.span>
          )}
        </div>
      </div>

      {/* Mobile — hamburger toggle + cart */}
      <div className="flex md:hidden items-center gap-1">
        <button
          onClick={onCartOpen}
          aria-label="Open shopping cart"
          className="relative bg-[#FFB81C] text-[#C41E3A] p-2 rounded-full border-2 border-[#C41E3A] flex items-center justify-center"
        >
          <ShoppingBag className="w-4 h-4" />
          {cartItemCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-[#C41E3A] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-[#FDF5E6]">
              {cartItemCount}
            </span>
          )}
        </button>
        {cartItemCount > 0 && (
          <span className="inline-flex items-center gap-1 text-[7px] font-black uppercase tracking-widest text-green-600 bg-green-50 border border-green-300 px-1 py-0.5 rounded-full mr-1">
            <span className="w-1 h-1 rounded-full bg-green-500" />
            Saved
          </span>
        )}
        <button
          onClick={() => setMobileOpen((p) => !p)}
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="p-2 rounded-full hover:bg-[#C41E3A]/10 transition-colors cursor-pointer"
        >
          {mobileOpen ? <X className="w-5 h-5 text-[#C41E3A]" /> : <Menu className="w-5 h-5 text-[#C41E3A]" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobile}
              className="fixed inset-0 bg-black/40 z-10 md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-[72px] right-0 bottom-0 w-72 bg-[#FDF5E6] border-l-4 border-[#C41E3A] z-20 md:hidden shadow-2xl flex flex-col"
            >
              <div className="flex-1 overflow-y-auto py-4 px-6 space-y-1">
                {[
                  ...NAV_LINKS,
                  ...(isSignedIn ? [{ page: 'orders' as Page, label: 'My Orders' }] : []),
                  ...(isSignedIn ? [{ page: 'profile' as Page, label: 'Profile' }] : []),
                  ...(isAdmin ? [{ page: 'admin' as Page, label: 'Admin' }] : []),
                  ...(isKitchen ? [{ page: 'kitchen' as Page, label: 'Kitchen' }] : []),
                ].map(({ page, label }) => (
                  <button
                    key={page}
                    onClick={() => { onNavigate(page); closeMobile(); }}
                    className={`w-full text-left px-4 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all cursor-pointer ${
                      currentPage === page
                        ? 'bg-[#C41E3A] text-white'
                        : 'text-[#C41E3A] hover:bg-[#C41E3A]/10'
                    }`}
                  >
                    {label}
                  </button>
                ))}

                <div className="border-t border-[#C41E3A]/10 my-4 pt-4 px-4">
                  <Show when="signed-out">
                    <div className="flex flex-col gap-2">
                      <SignInButton mode="modal">
                        <button onClick={closeMobile} className="w-full bg-white text-[#C41E3A] border-2 border-[#C41E3A] py-2.5 rounded-full font-black text-xs uppercase tracking-wider hover:bg-[#C41E3A] hover:text-white transition-all cursor-pointer">
                          Sign In
                        </button>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <button onClick={closeMobile} className="w-full bg-[#FFB81C] text-[#C41E3A] border-2 border-[#C41E3A] py-2.5 rounded-full font-black text-xs uppercase tracking-wider hover:bg-[#ffa71c] transition-all cursor-pointer">
                          Sign Up
                        </button>
                      </SignUpButton>
                    </div>
                  </Show>
                  <Show when="signed-in">
                    <div className="flex items-center justify-center">
                      <UserButton
                        appearance={{
                          elements: {
                            avatarBox: 'w-10 h-10 border-2 border-[#C41E3A] rounded-full',
                          },
                        }}
                      />
                    </div>
                  </Show>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
