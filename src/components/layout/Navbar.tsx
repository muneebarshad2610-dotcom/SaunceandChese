import { motion } from 'motion/react';
import { Flame, ShoppingBag } from 'lucide-react';
import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/react';

interface NavbarProps {
  cartItemCount: number;
  onCartOpen: () => void;
}

export default function Navbar({ cartItemCount, onCartOpen }: NavbarProps) {
  return (
    <nav
      id="site-nav"
      className="sticky top-0 z-40 bg-[#FDF5E6]/95 backdrop-blur-md border-b-4 border-[#C41E3A] py-4 px-6 md:px-12 flex justify-between items-center shadow-sm"
    >
      {/* Brand */}
      <div className="flex items-center gap-3">
        <motion.div
          whileHover={{ scale: 1.1, rotate: -5 }}
          className="w-11 h-11 bg-[#FFB81C] rounded-full flex items-center justify-center retro-shadow-sm border-2 border-[#C41E3A]"
        >
          <Flame className="text-[#C41E3A] w-6 h-6 fill-[#C41E3A]" />
        </motion.div>
        <div>
          <span className="font-retro text-2xl md:text-3xl tracking-wider text-[#C41E3A] uppercase block leading-none">
            Sauce <span className="text-[#FFB81C]">n'</span> Cheese
          </span>
        </div>
      </div>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-6 font-black uppercase tracking-wider text-xs text-[#C41E3A]">
        <a href="#menu" className="hover:text-[#FFB81C] transition-colors">Menu</a>
        <a href="#hot-deals" className="hover:text-[#FFB81C] transition-colors">Hot Deals</a>
        <a href="#story" className="hover:text-[#FFB81C] transition-colors">Our Story</a>
        <a href="#locations" className="hover:text-[#FFB81C] transition-colors">Locations</a>

        {/* Auth buttons */}
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
        <div className="relative flex items-center">
          <button
            id="cart-toggle-btn"
            onClick={onCartOpen}
            className="relative bg-[#FFB81C] text-[#C41E3A] p-2.5 rounded-full retro-shadow-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center cursor-pointer border-2 border-[#C41E3A]"
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
        </div>
      </div>

      {/* Mobile */}
      <div className="flex md:hidden items-center gap-2">
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className="text-[10px] font-black uppercase tracking-wider text-[#C41E3A] border-2 border-[#C41E3A] px-3 py-1 rounded-full hover:bg-[#C41E3A] hover:text-white transition-all cursor-pointer">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="text-[10px] font-black uppercase tracking-wider bg-[#FFB81C] text-[#C41E3A] border-2 border-[#C41E3A] px-3 py-1 rounded-full hover:bg-[#ffa71c] transition-all cursor-pointer">
              Sign Up
            </button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-7 h-7 border-2 border-[#C41E3A] rounded-full',
              },
            }}
          />
        </Show>
        <button
          onClick={onCartOpen}
          className="relative bg-[#FFB81C] text-[#C41E3A] p-2 rounded-full border-2 border-[#C41E3A] flex items-center justify-center"
        >
          <ShoppingBag className="w-4 h-4" />
          {cartItemCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-[#C41E3A] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-[#FDF5E6]">
              {cartItemCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}
