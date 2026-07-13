import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  ShoppingBag, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle2, 
  MapPin, 
  Instagram, 
  Sparkles,
  Layers,
  Heart,
  ChevronRight,
  TrendingUp,
  Sliders,
  Send,
  MessageSquare
} from 'lucide-react';

interface MenuItem {
  id: number;
  name: string;
  category: 'classic' | 'special' | 'deal';
  price: number;
  prices?: {
    small: number;
    regular: number;
    large: number;
  };
  description: string;
  image: string;
  baseCheese?: number; // 1-5 scale
  baseSauce?: string;
}

const MENU_ITEMS: MenuItem[] = [];

interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  selectedSize?: 'small' | 'regular' | 'large';
  image: string;
  customCheese: number; // 1-5 cheese level
  customSauceType: string;
}

export default function App() {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [quickViewItem, setQuickViewItem] = useState<MenuItem | null>(null);
  
  // Customizer state in Quick View Modal
  const [modalQty, setModalQty] = useState<number>(1);
  const [modalSize, setModalSize] = useState<'small' | 'regular' | 'large'>('small');
  const [modalCheeseLevel, setModalCheeseLevel] = useState<number>(4);
  const [modalSauceType, setModalSauceType] = useState<string>('Liquid Gold');
  const [isDraggingCheese, setIsDraggingCheese] = useState<boolean>(false);
  const [pullHeight, setPullHeight] = useState<number>(80); //px

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);

  // Order success modal state
  const [showOrderSuccess, setShowOrderSuccess] = useState<boolean>(false);
  const [lastOrderDetails, setLastOrderDetails] = useState<{ id: string; total: number; itemsCount: number } | null>(null);

  // Load cart on mount
  useEffect(() => {
    const saved = localStorage.getItem('snc_cart');
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Sync cart to localStorage
  const updateCartAndStorage = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('snc_cart', JSON.stringify(newCart));
  };

  // Open item customization modal
  const openQuickView = (item: MenuItem) => {
    setQuickViewItem(item);
    setModalQty(1);
    setModalSize('small');
    setModalCheeseLevel(item.baseCheese || 4);
    setModalSauceType(item.baseSauce || 'Liquid Gold');
    setPullHeight((item.baseCheese || 4) * 20);
  };

  // Direct quick add to cart
  const quickAddToCart = (item: MenuItem) => {
    const size = item.prices ? 'small' : undefined;
    const itemPrice = item.prices ? item.prices['small'] : item.price;
    const cheeseLevel = item.baseCheese || 4;
    const sauceType = item.baseSauce || 'Liquid Gold';

    const existingIndex = cart.findIndex(
      c => c.id === item.id && c.selectedSize === size && c.customCheese === cheeseLevel && c.customSauceType === sauceType
    );

    let newCart = [...cart];
    if (existingIndex > -1) {
      newCart[existingIndex].qty += 1;
    } else {
      newCart.push({
        id: item.id,
        name: item.name,
        price: itemPrice,
        qty: 1,
        selectedSize: size,
        image: item.image,
        customCheese: cheeseLevel,
        customSauceType: sauceType
      });
    }
    updateCartAndStorage(newCart);
    setIsCartOpen(true);
  };

  // Confirm custom modal specifications
  const addCustomizedToCart = () => {
    if (!quickViewItem) return;
    const itemPrice = quickViewItem.prices 
      ? quickViewItem.prices[modalSize] 
      : quickViewItem.price;

    const existingIndex = cart.findIndex(
      c => c.id === quickViewItem.id && 
           c.selectedSize === (quickViewItem.prices ? modalSize : undefined) && 
           c.customCheese === modalCheeseLevel && 
           c.customSauceType === modalSauceType
    );

    let newCart = [...cart];
    if (existingIndex > -1) {
      newCart[existingIndex].qty += modalQty;
    } else {
      newCart.push({
        id: quickViewItem.id,
        name: quickViewItem.name,
        price: itemPrice,
        qty: modalQty,
        selectedSize: quickViewItem.prices ? modalSize : undefined,
        image: quickViewItem.image,
        customCheese: modalCheeseLevel,
        customSauceType: modalSauceType
      });
    }

    updateCartAndStorage(newCart);
    setQuickViewItem(null);
    setIsCartOpen(true);
  };

  // Update quantity in cart
  const adjustCartQty = (index: number, delta: number) => {
    let newCart = [...cart];
    newCart[index].qty += delta;
    if (newCart[index].qty <= 0) {
      newCart.splice(index, 1);
    }
    updateCartAndStorage(newCart);
  };

  // Remove single card item group
  const removeCartItem = (index: number) => {
    let newCart = [...cart];
    newCart.splice(index, 1);
    updateCartAndStorage(newCart);
  };

  const handleContactSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail) return;
    setContactSuccess(true);
    setContactName('');
    setContactEmail('');
    setContactMsg('');
    setTimeout(() => setContactSuccess(false), 4000);
  };

  // Dynamic cart calculations
  const cartItemCount = cart.reduce((acc, curr) => acc + curr.qty, 0);
  const cartSubtotal = cart.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);

  const filteredItems = MENU_ITEMS.filter(
    item => {
      if (activeFilter === 'all') {
        return item.category !== 'deal';
      }
      return item.category === activeFilter;
    }
  );

  return (
    <div className="min-h-screen bg-[#FDF5E6] text-[#1A1A1A] font-sans selection:bg-[#FFB81C] selection:text-[#C41E3A] overflow-x-hidden flex flex-col">
      
      {/* Sticky Retro Header / Nav */}
      <nav id="site-nav" className="sticky top-0 z-40 bg-[#FDF5E6]/95 backdrop-blur-md border-b-4 border-[#C41E3A] py-5 px-6 md:px-12 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: -5 }}
            className="w-12 h-12 bg-[#FFB81C] rounded-full flex items-center justify-center retro-shadow-sm border-2 border-[#C41E3A]"
          >
            <Flame className="text-[#C41E3A] w-7 h-7 fill-[#C41E3A]" />
          </motion.div>
          <div>
            <span className="font-retro text-3xl md:text-4xl tracking-wider text-[#C41E3A] uppercase block">
              Sauce <span className="text-[#FFB81C]">n'</span> Cheese
            </span>
          </div>
        </div>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-8 font-black uppercase tracking-wider text-sm text-[#C41E3A]">
          <a href="#menu" className="hover:text-[#FFB81C] transition-colors">Menu</a>
          <a href="#hot-deals" className="hover:text-[#FFB81C] transition-colors">Hot Deals</a>
          <a href="#story" className="hover:text-[#FFB81C] transition-colors">Our Story</a>
          <a href="#locations" className="hover:text-[#FFB81C] transition-colors">Locations</a>
          
          <div className="relative ml-2 flex items-center gap-4">
            <button 
              id="cart-toggle-btn" 
              onClick={() => setIsCartOpen(true)}
              className="relative bg-[#FFB81C] text-[#C41E3A] p-3 rounded-full retro-shadow-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center cursor-pointer border-2 border-[#C41E3A]"
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
            <a 
              href="#menu" 
              className="bg-[#C41E3A] text-white px-6 py-2.5 rounded-full font-bold shadow-md hover:brightness-110 active:translate-y-[1px] transition-all text-xs tracking-wider"
            >
              Order Now
            </a>
          </div>
        </div>

        {/* Mobile quick actions */}
        <div className="flex md:hidden items-center gap-3">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative bg-[#FFB81C] text-[#C41E3A] p-2.5 rounded-full border-2 border-[#C41E3A] flex items-center justify-center"
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

      <main className="flex-1">

        {/* Hero Section */}
        <section className="relative py-16 md:py-24 px-6 md:px-12 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center overflow-hidden max-w-7xl mx-auto">
          <div className="relative z-10 space-y-6 md:space-y-8 text-left">
            <div className="inline-block bg-[#F5DEB3] border-2 border-[#C41E3A] px-5 py-1.5 rounded-full font-handwritten text-lg md:text-xl text-[#C41E3A] -rotate-2 animate-bounce">
              Freshly Melted Since 1984
            </div>
            
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black leading-none text-[#C41E3A] uppercase font-retro">
              The Ultimate<br />
              <span className="text-[#FFB81C] text-7xl sm:text-8xl lg:text-9xl">Gooey</span><br />
              Escape
            </h1>
            
            <p className="text-lg md:text-2xl text-[#C41E3A]/80 max-w-lg leading-relaxed font-sans">
              Dripping with nostalgia and smothered in our signature house-made cheese sauce. It's premium culinary comfort you can feel in your soul.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <a 
                href="#menu" 
                className="bg-[#FFB81C] text-[#C41E3A] px-8 py-4.5 rounded-2xl text-lg md:text-xl font-black uppercase tracking-widest retro-shadow border-4 border-[#C41E3A] hover:bg-[#ffa71c] hover:-translate-y-1 transition-all"
              >
                Sink Your Teeth In
              </a>
              <a 
                href="#hot-deals" 
                className="border-4 border-[#C41E3A] text-[#C41E3A] px-8 py-4.5 rounded-2xl text-lg md:text-xl font-black uppercase tracking-widest hover:bg-[#C41E3A] hover:text-white transition-all bg-[#FFB81C]/10"
              >
                Hot Deals 🔥
              </a>
            </div>
          </div>

          {/* Floater Image & Accents */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="absolute inset-0 bg-[#F5DEB3] blob-mask -z-10 scale-110 lg:scale-125 opacity-60"></div>
            <motion.div 
              initial={{ rotate: 0 }}
              animate={{ rotate: [1, -1, 1] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="relative"
            >
              <img 
                src="https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=600&auto=format&fit=crop" 
                alt="Smash Cheesy Burger" 
                className="w-full max-w-[420px] md:max-w-[480px] h-[450px] md:h-[520px] object-cover rounded-[60px] md:rounded-[80px] border-8 border-white retro-shadow"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-4 -left-4 bg-[#FFB81C] text-[#C41E3A] px-5 py-3 rounded-2xl font-retro text-2xl md:text-3xl uppercase border-4 border-[#C41E3A] rotate-6 shadow-md">
                100% Smashed Wagyu
              </div>
            </motion.div>
          </div>
        </section>

        {/* Our Story Section */}
        <section id="story" className="py-20 px-6 md:px-12 bg-[#F5DEB3]/30 border-y-4 border-dashed border-[#C41E3A]/20">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12 md:gap-16 items-center">
            <div className="w-full md:w-1/2 flex justify-center">
              <div className="relative p-2 border-4 border-[#FFB81C] rounded-full overflow-hidden w-64 h-64 md:w-80 md:h-80">
                <img 
                  src="https://images.unsplash.com/photo-1543339308-43e59d6b73a6?q=80&w=600&auto=format&fit=crop" 
                  alt="Melty Old School Saucery"
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            
            <div className="w-full md:w-1/2 space-y-6 text-left">
              <h2 className="font-retro text-5xl md:text-6xl text-[#C41E3A] uppercase tracking-wide">
                Our Saucy Story
              </h2>
              <p className="text-lg md:text-xl leading-relaxed text-[#C41E3A]/80 font-sans">
                Started in Karachi with a big block of aged cheddar, artisanal spices, and a dream of the perfect golden drizzle. We don't just cook food; we craft memories on a platter. Every burger is hand-pressed, every batch of fries is hand-cut daily, and every legendary cheese pull is guaranteed.
              </p>
              
              <div className="pt-2 space-y-3">
                <div className="flex items-center gap-3.5 text-[#FFB81C] font-black text-xl md:text-2xl uppercase font-retro tracking-wider">
                  <CheckCircle2 className="w-6 h-6 text-[#C41E3A] stroke-[3]" />
                  <span>Never Frozen Fresh Wagyu</span>
                </div>
                <div className="flex items-center gap-3.5 text-[#FFB81C] font-black text-xl md:text-2xl uppercase font-retro tracking-wider">
                  <CheckCircle2 className="w-6 h-6 text-[#C41E3A] stroke-[3]" />
                  <span>Triple-Churned Cheese Blend</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Menu Section with filters */}
        <section id="menu" className="py-20 px-6 md:px-12 bg-white/40 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-retro text-6xl md:text-7xl text-[#C41E3A] uppercase tracking-wider mb-2">
              Retro Favorites
            </h2>
            <p className="font-handwritten text-2xl md:text-3xl text-[#FFB81C] leading-none">
              Hand-crafted comfort, just the way you crave it.
            </p>
          </div>

          {/* Filtering tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {[
              { id: 'all', label: 'All Cravings' },
              { id: 'classic', label: 'Classic Flavours' },
              { id: 'special', label: 'Special Flavours' },
              { id: 'deal', label: 'Hot Deals' }
            ].map(tab => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-6 py-2.5 rounded-full font-black text-xs md:text-sm uppercase tracking-widest border-2 border-[#C41E3A] cursor-pointer transition-all duration-150 ${
                    isActive 
                      ? 'bg-[#C41E3A] text-white shadow-[3px_3px_0px_0px_#FFB81C] -translate-y-0.5'
                      : 'text-[#C41E3A] hover:bg-[#C41E3A]/5 bg-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Grid list of food cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            <AnimatePresence mode="popLayout">
              {filteredItems.length === 0 ? (
                <motion.div
                  key="no-items"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="col-span-full py-16 px-6 text-center bg-white border-4 border-[#C41E3A] rounded-[36px] max-w-lg mx-auto shadow-md"
                >
                  <p className="font-retro text-3xl md:text-4xl text-[#C41E3A] uppercase tracking-wide mb-3">
                    Kitchen Updating!
                  </p>
                  <p className="text-sm md:text-base text-[#C41E3A]/70 leading-relaxed font-sans">
                    We are currently updating our products menu to bring you some fresh, hand-crafted flavors. Check back soon for the ultimate late night feast!
                  </p>
                </motion.div>
              ) : (
                filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="bg-white border-4 border-[#C41E3A] rounded-[36px] p-6 md:p-8 flex flex-col items-center text-center relative hover:-translate-y-2 transition-transform duration-300 shadow-md hover:shadow-xl"
                  >
                    {/* Food Card Image */}
                    <div 
                      onClick={() => openQuickView(item)}
                      className="w-full aspect-square overflow-hidden rounded-[24px] mb-6 border-2 border-[#C41E3A] cursor-pointer group"
                    >
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Card Info */}
                    <h3 className="font-retro text-3xl md:text-4xl text-[#C41E3A] mb-2 uppercase tracking-wide">
                      {item.name}
                    </h3>
                    
                    <p className="text-sm text-[#C41E3A]/70 mb-6 leading-relaxed flex-1">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between w-full mt-auto pt-4 border-t-2 border-[#C41E3A]/5">
                      <span className="text-[#FFB81C] font-black text-lg md:text-xl tracking-tight text-left">
                        {item.prices 
                          ? `Rs. ${item.prices.small} - ${item.prices.large}` 
                          : `Rs. ${item.price}`
                        }
                      </span>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => openQuickView(item)}
                          className="bg-[#F5DEB3] hover:bg-[#ebd5ad] text-[#C41E3A] p-2.5 rounded-full border-2 border-[#C41E3A] transition-all flex items-center justify-center cursor-pointer"
                          title="Customize & Pull Cheese"
                        >
                          <Sliders className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => quickAddToCart(item)}
                          className="bg-[#FFB81C] hover:bg-[#ffa71c] text-[#C41E3A] p-2.5 rounded-full border-2 border-[#C41E3A] retro-shadow-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center justify-center cursor-pointer"
                          title="Quick Add"
                        >
                          <Plus className="w-5 h-5 stroke-[3]" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Hot Deals Section */}
        <section id="hot-deals" className="py-20 px-6 md:px-12 bg-[#FFB81C]/10 border-y-4 border-[#C41E3A] relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#C41E3A_2px,transparent_2px)] [background-size:16px_16px]"></div>
          
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 relative">
              <div className="inline-block bg-[#C41E3A] text-[#FFB81C] border-4 border-[#C41E3A] px-6 py-2 rounded-2xl font-retro text-lg md:text-xl uppercase tracking-wider mb-4 -rotate-1 shadow-[4px_4px_0px_0px_#FFB81C]">
                Save Big & Feast Hard!
              </div>
              <h2 className="font-retro text-6xl md:text-7xl text-[#C41E3A] uppercase tracking-wider mb-2">
                Hot Deals
              </h2>
              <p className="font-handwritten text-2xl md:text-3xl text-[#FFB81C] leading-none">
                The ultimate combo deals, hand-crafted to satisfy your late night cravings.
              </p>
            </div>

            {/* Grid of Deals */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
              {MENU_ITEMS.filter(item => item.category === 'deal').length === 0 ? (
                <div className="col-span-full py-16 px-6 text-center bg-white border-4 border-[#C41E3A] rounded-[36px] max-w-lg mx-auto shadow-md w-full">
                  <p className="font-retro text-3xl md:text-4xl text-[#C41E3A] uppercase tracking-wide mb-3">
                    New Deals Preparing!
                  </p>
                  <p className="text-sm md:text-base text-[#C41E3A]/70 leading-relaxed font-sans">
                    Stay tuned! We are crafting some sizzling new combos and amazing packages to satisfy your late-night cravings.
                  </p>
                </div>
              ) : (
                MENU_ITEMS.filter(item => item.category === 'deal').map((item, index) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="bg-white border-4 border-[#C41E3A] rounded-[36px] p-6 md:p-8 flex flex-col items-center relative hover:-translate-y-2 transition-transform duration-300 shadow-md hover:shadow-xl text-center"
                  >
                    {/* Deal Sticker Tag */}
                    <div className="absolute -top-4 -right-2 bg-[#C41E3A] text-white px-4 py-1.5 rounded-xl font-retro text-xs uppercase tracking-widest border-2 border-white rotate-6 shadow-md z-10">
                      Combo Bundle
                    </div>

                    {/* Deal Card Image */}
                    <div 
                      onClick={() => openQuickView(item)}
                      className="w-full aspect-square overflow-hidden rounded-[24px] mb-6 border-2 border-[#C41E3A] cursor-pointer group relative"
                    >
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-[#C41E3A]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="bg-white/95 text-[#C41E3A] font-black uppercase text-xs tracking-widest px-4 py-2 rounded-xl border-2 border-[#C41E3A] shadow-sm scale-90 group-hover:scale-100 transition-all">
                          Customize Bundle
                        </span>
                      </div>
                    </div>

                    {/* Card Info */}
                    <h3 className="font-retro text-3xl md:text-4xl text-[#C41E3A] mb-2 uppercase tracking-wide">
                      {item.name}
                    </h3>
                    
                    <p className="text-sm text-[#C41E3A]/70 mb-6 leading-relaxed flex-1">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between w-full mt-auto pt-4 border-t-2 border-[#C41E3A]/5">
                      <span className="text-[#FFB81C] font-black text-2xl tracking-tight text-left">
                        Rs. {item.price}
                      </span>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => openQuickView(item)}
                          className="bg-[#F5DEB3] hover:bg-[#ebd5ad] text-[#C41E3A] p-2.5 rounded-full border-2 border-[#C41E3A] transition-all flex items-center justify-center cursor-pointer"
                          title="Customize Deal"
                        >
                          <Sliders className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => quickAddToCart(item)}
                          className="bg-[#FFB81C] hover:bg-[#ffa71c] text-[#C41E3A] p-2.5 rounded-full border-2 border-[#C41E3A] retro-shadow-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center justify-center cursor-pointer"
                          title="Quick Add Deal"
                        >
                          <Plus className="w-5 h-5 stroke-[3]" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Infinite Instagram/Brand Marquee */}
        <section className="py-20 bg-[#C41E3A] text-white overflow-hidden relative">
          <div className="px-6 md:px-12 mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 max-w-7xl mx-auto">
            <div className="space-y-2 text-left">
              <h2 className="font-retro text-5xl md:text-6xl text-white uppercase tracking-wide">
                Our Craving Journey
              </h2>
              <p className="text-[#FFB81C] font-handwritten text-2xl md:text-3xl">
                Live from Karachi @saucencheese
              </p>
            </div>
            
            <a 
              href="https://www.instagram.com/saucencheese/" 
              target="_blank" 
              className="border-2 border-white text-white hover:bg-[#FFB81C] hover:text-[#C41E3A] hover:border-[#FFB81C] px-8 py-3 rounded-full font-black uppercase tracking-wider transition-all duration-200 text-xs flex items-center gap-2 cursor-pointer"
            >
              <Instagram className="w-4 h-4" />
              Follow Us
            </a>
          </div>

          <div className="overflow-hidden flex">
            <div className="animate-marquee flex gap-6 pr-6">
              {[
                'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?q=80&w=400&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?q=80&w=400&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=400&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1562967914-6c82738201de?q=80&w=400&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=400&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1585109649139-366815a0d713?q=80&w=400&auto=format&fit=crop'
              ].map((src, i) => (
                <div 
                  key={i} 
                  className="w-72 h-72 md:w-80 md:h-80 flex-shrink-0 bg-white/10 rounded-[32px] overflow-hidden border-4 border-white/20 hover:border-white/50 transition-all duration-300"
                >
                  <img src={src} alt="Cheese pull" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
            
            {/* Duplicate content to make seamless looping marquee */}
            <div className="animate-marquee flex gap-6 pr-6" aria-hidden="true">
              {[
                'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?q=80&w=400&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?q=80&w=400&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=400&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1562967914-6c82738201de?q=80&w=400&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=400&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1585109649139-366815a0d713?q=80&w=400&auto=format&fit=crop'
              ].map((src, i) => (
                <div 
                  key={`dup-${i}`} 
                  className="w-72 h-72 md:w-80 md:h-80 flex-shrink-0 bg-white/10 rounded-[32px] overflow-hidden border-4 border-white/20 hover:border-white/50 transition-all duration-300"
                >
                  <img src={src} alt="Cheese pull" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Locations & Feedback Section */}
        <section id="locations" className="py-20 px-6 md:px-12 grid lg:grid-cols-2 gap-16 max-w-7xl mx-auto">
          
          {/* Left Column: Karachi Locations info */}
          <div className="space-y-10 text-left">
            <h2 className="font-retro text-6xl md:text-7xl text-[#C41E3A] uppercase tracking-wide">
              Find Us In Karachi
            </h2>
            
            <div className="space-y-8">
              <div className="bg-white p-6 md:p-8 rounded-[40px] border-4 border-[#C41E3A] shadow-md hover:shadow-lg transition-shadow">
                <h3 className="font-retro text-3xl text-[#C41E3A] mb-2 uppercase tracking-wide">KAECHS Outlet</h3>
                <p className="text-lg text-[#C41E3A]/80 font-medium leading-relaxed">
                  01, Karachi Administration Employees Housing Society Block 5 KAECHS, Karachi, Pakistan
                </p>
                <div className="mt-3 text-[#C41E3A] font-black text-lg">
                  Phone: <span className="text-[#FFB81C]">03318025998</span>
                </div>
                
                <div className="mt-6 flex flex-wrap gap-4 items-center text-sm">
                  <a 
                    href="https://maps.google.com" 
                    target="_blank" 
                    className="flex items-center gap-1.5 text-[#FFB81C] hover:text-[#ffa71c] font-black uppercase tracking-wider"
                  >
                    <MapPin className="w-5 h-5 text-[#C41E3A]" />
                    Get Directions
                  </a>
                  <span className="text-[#C41E3A]/30 hidden sm:inline">|</span>
                  <span className="text-[#C41E3A]/60 font-medium">Open 11AM - 1AM Daily</span>
                </div>
              </div>

              {/* Karachi Customer Testimonial Quote */}
              <div className="bg-[#C41E3A]/5 p-6 md:p-8 rounded-[40px] border-4 border-dashed border-[#C41E3A]/20 shadow-inner">
                <p className="text-xl md:text-2xl text-[#C41E3A] font-medium leading-relaxed italic font-handwritten">
                  "The golden liquid gold cheese is unmatched. Best cheddar pull in town. Hands down, my go-to pizza joint in KAECHS."
                </p>
                <div className="mt-5 text-[#FFB81C] font-black uppercase font-retro text-lg tracking-wider">
                  — Sarah M., Karachi
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Custom Feedback Form */}
          <div className="bg-[#FFB81C] p-8 md:p-12 rounded-[50px] text-[#C41E3A] space-y-6 flex flex-col justify-center retro-shadow">
            <div className="text-left space-y-2">
              <h2 className="font-retro text-5xl text-[#C41E3A] uppercase tracking-wide">
                Get in Touch
              </h2>
              <p className="text-lg font-medium leading-normal">
                Hungry? Have a custom request? Just want to talk cheese pulls? Drop us a line!
              </p>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                  placeholder="Your Name" 
                  className="w-full bg-white/40 border-2 border-[#C41E3A]/20 rounded-2xl px-5 py-4 placeholder-[#C41E3A]/60 font-medium focus:bg-white/75 focus:border-[#C41E3A] outline-none transition-all text-[#1A1A1A]"
                /> 
                <input 
                  type="email" 
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                  placeholder="Your Email" 
                  className="w-full bg-white/40 border-2 border-[#C41E3A]/20 rounded-2xl px-5 py-4 placeholder-[#C41E3A]/60 font-medium focus:bg-white/75 focus:border-[#C41E3A] outline-none transition-all text-[#1A1A1A]"
                />
              </div>
              <textarea 
                value={contactMsg}
                onChange={(e) => setContactMsg(e.target.value)}
                placeholder="How can we help make your cheesy cravings come true?" 
                className="w-full bg-white/40 border-2 border-[#C41E3A]/20 rounded-2xl px-5 py-4 placeholder-[#C41E3A]/60 font-medium focus:bg-white/75 focus:border-[#C41E3A] outline-none transition-all h-32 text-[#1A1A1A]"
              ></textarea>
              
              <button 
                type="submit" 
                className="w-full bg-[#C41E3A] hover:bg-[#b01630] text-white font-black px-10 py-4.5 rounded-full uppercase tracking-widest text-lg md:text-xl transition-all shadow-md active:translate-y-[1px]"
              >
                Submit Request
              </button>
            </form>

            <AnimatePresence>
              {contactSuccess && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-white border-2 border-[#C41E3A] p-4 rounded-2xl flex items-center gap-3 text-left"
                >
                  <MessageSquare className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider text-green-700">
                    Saucery message received! We will drizzle you back shortly.
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </section>

      </main>

      {/* Retro Styled Footer */}
      <footer className="bg-[#C41E3A] text-white py-16 px-6 md:px-12 border-t-8 border-[#FFB81C]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 text-left">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FFB81C] rounded-full flex items-center justify-center border-2 border-white">
                <Flame className="text-[#C41E3A] w-5 h-5 fill-[#C41E3A]" />
              </div>
              <span className="font-retro text-3xl tracking-wider text-white uppercase">
                Sauce <span className="text-[#FFB81C]">n'</span> Cheese
              </span>
            </div>
            <p className="max-w-xs text-[#FDF5E6]/70 text-base md:text-lg">
              Bringing back the legendary golden age of comforting fast food in Karachi. One gooey bite at a time.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-black uppercase text-[#FFB81C] tracking-widest text-sm">Visit Us</h4>
            <ul className="text-[#FDF5E6]/80 space-y-2 text-sm font-medium">
              <li>01, Karachi Administration Employees Housing Society Block 5 KAECHS, Karachi, Pakistan</li>
              <li>Phone: 03318025998</li>
              <li>Daily: 11AM - 1AM</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-black uppercase text-[#FFB81C] tracking-widest text-sm">Join Us</h4>
            <div className="flex gap-3">
              <a 
                href="https://www.instagram.com/saucencheese/" 
                target="_blank"
                className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center hover:bg-[#FFB81C] hover:text-[#C41E3A] hover:border-[#FFB81C] transition-all text-xl"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="text-center border-t border-white/10 pt-10 max-w-7xl mx-auto">
          <p className="text-[#FDF5E6]/40 font-bold uppercase tracking-widest text-[11px]">
            © 2026 Sauce n' Cheese Restaurant Group. Stay Gooey, Karachi!
          </p>
        </div>
      </footer>

      {/* Quick View Customizer Modal */}
      <AnimatePresence>
        {quickViewItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuickViewItem(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="relative bg-[#FDF5E6] border-4 border-[#C41E3A] rounded-[40px] max-w-3xl w-full max-h-[92vh] overflow-y-auto flex flex-col md:flex-row shadow-2xl z-10"
            >
              {/* Close Button */}
              <button 
                onClick={() => setQuickViewItem(null)}
                className="absolute top-4 right-4 z-20 w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-[#C41E3A] hover:scale-105 transition-transform cursor-pointer"
              >
                <X className="w-5 h-5 text-[#C41E3A]" />
              </button>

              {/* Modal Left Column: Interactive Pull Stage */}
              <div className="w-full md:w-1/2 bg-[#FDF5E6] border-r-0 md:border-r-4 border-b-4 md:border-b-0 border-[#C41E3A] relative flex flex-col justify-between overflow-hidden">
                <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/80 border-2 border-[#C41E3A] px-3 py-1 rounded-full z-10 shadow-sm">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#C41E3A]">Sensory Pull</span>
                </div>

                {/* Saucery Stage Visualizer */}
                <div className="h-72 md:h-96 flex flex-col items-center justify-center relative mt-4">
                  
                  {/* Plate Circle */}
                  <div className="absolute w-52 h-52 rounded-full bg-[#1A1A1A] border-4 border-[#C41E3A] shadow-xl flex items-center justify-center">
                    
                    {/* Golden Crust base */}
                    <div className="w-48 h-48 rounded-full bg-gradient-to-br from-amber-600 via-[#FFB81C] to-orange-500 border-2 border-orange-700 flex items-center justify-center shadow-inner overflow-hidden">
                      
                      {/* Melted dynamic sauce pooling (colored on modalSauceType selection) */}
                      <div 
                        className="w-40 h-40 rounded-full transition-all duration-300 flex items-center justify-center relative"
                        style={{
                          backgroundColor: modalSauceType === 'Ghost Pepper Glaze' 
                            ? 'rgba(180, 20, 20, 0.9)'
                            : modalSauceType === 'White Truffle Melt'
                            ? 'rgba(235, 230, 220, 0.95)'
                            : modalSauceType === 'Secret Lava'
                            ? 'rgba(239, 68, 68, 0.9)'
                            : 'rgba(255, 184, 28, 0.95)' // Liquid Gold
                        }}
                      >
                        {/* Golden hot bubbly cheese overlays */}
                        <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-[#FFB81C] via-yellow-200 to-[#FFB81C]/90 shadow-md">
                          <div className="absolute top-6 left-12 w-6 h-5 bg-amber-700/40 rounded-full border border-amber-800/10 blur-[0.5px]"></div>
                          <div className="absolute bottom-8 right-14 w-8 h-6 bg-amber-700/30 rounded-full border border-amber-800/10 blur-[0.5px]"></div>
                          <div className="absolute top-16 right-6 w-4 h-4 bg-orange-600/40 rounded-full blur-[0.5px]"></div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* SVG Cheese Pull Strings (anchored to customized pull height) */}
                  <div className="absolute bottom-28 flex flex-col items-center z-10">
                    <svg width="220" height="200" className="pointer-events-none overflow-visible">
                      <defs>
                        <linearGradient id="modalCheeseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#fffbeb" stopOpacity="0.95" />
                          <stop offset="30%" stopColor="#fef08a" stopOpacity="0.9" />
                          <stop offset="70%" stopColor="#fbbf24" stopOpacity="0.85" />
                          <stop offset="100%" stopColor="#d97706" stopOpacity="0.95" />
                        </linearGradient>
                      </defs>

                      {/* Strands */}
                      <path 
                        d={`M 60 140 Q ${70 - pullHeight*0.1} ${140 - pullHeight*0.5}, 80 ${140 - pullHeight}`} 
                        fill="none" 
                        stroke="url(#modalCheeseGrad)" 
                        strokeWidth={Math.max(2.5, 9 - (pullHeight / 15))}
                        className="transition-all duration-100"
                      />

                      <path 
                        d={`M 85 142 Q 100 ${142 - pullHeight*0.4}, 100 ${140 - pullHeight} 
                           Q 110 ${142 - pullHeight*0.4}, 125 142 Z`} 
                        fill="url(#modalCheeseGrad)" 
                        opacity={0.9}
                        className="transition-all duration-100"
                      />

                      <path 
                        d={`M 150 140 Q ${140 + pullHeight*0.1} ${140 - pullHeight*0.5}, 125 ${140 - pullHeight}`} 
                        fill="none" 
                        stroke="url(#modalCheeseGrad)" 
                        strokeWidth={Math.max(2, 7 - (pullHeight / 20))}
                        className="transition-all duration-100"
                      />
                    </svg>

                    {/* Pull Handle Handle */}
                    <motion.div 
                      style={{ y: -pullHeight }}
                      className="absolute bg-[#1A1A1A] border-2 border-[#FFB81C] px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 cursor-grab hover:border-white select-none active:cursor-grabbing group"
                      onPan={(e, info) => {
                        const deltaY = -info.offset.y;
                        setPullHeight(Math.max(15, Math.min(180, pullHeight + deltaY)));
                        // dynamically scale cheese level based on height
                        const computedLevel = Math.max(1, Math.min(5, Math.round((pullHeight + deltaY) / 36)));
                        setModalCheeseLevel(computedLevel);
                      }}
                      onPanStart={() => setIsDraggingCheese(true)}
                      onPanEnd={() => setIsDraggingCheese(false)}
                    >
                      <Flame className="w-4 h-4 text-[#FFB81C] animate-pulse" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest font-retro">
                        {isDraggingCheese ? 'SLIDING STRETCH!' : 'DRAG TO PULL CHEESE'}
                      </span>
                    </motion.div>
                  </div>

                </div>

                <div className="bg-[#C41E3A] text-white py-2 text-center text-[10px] font-black uppercase tracking-widest font-retro border-t-2 border-[#C41E3A]">
                  Stretch Factor: {Math.round(pullHeight / 1.8)}% • {modalCheeseLevel * 1.5}oz Curd Melt
                </div>
              </div>

              {/* Modal Right Column: Customizers and Info */}
              <div className="w-full md:w-1/2 p-8 space-y-6 text-left flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h2 className="font-retro text-4xl sm:text-5xl text-[#C41E3A] uppercase tracking-wide">
                      {quickViewItem.name}
                    </h2>
                    <p className="text-sm text-[#C41E3A]/70 leading-relaxed mt-1">
                      {quickViewItem.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-3xl font-black text-[#FFB81C] font-retro tracking-wider">
                    <span>Rs. {quickViewItem.prices ? quickViewItem.prices[modalSize] : quickViewItem.price}</span>
                  </div>

                  <div className="space-y-4 pt-2 border-t border-[#C41E3A]/10">
                    
                    {/* Size selector */}
                    {quickViewItem.prices && (
                      <div className="space-y-2">
                        <label className="font-black uppercase text-[10px] tracking-widest text-[#C41E3A]/50 block">Select Pizza Size</label>
                        <div className="flex gap-2">
                          {(['small', 'regular', 'large'] as const).map((sz) => (
                            <button 
                              key={sz}
                              onClick={() => setModalSize(sz)}
                              className={`flex-1 py-2.5 border-2 border-[#C41E3A] rounded-xl font-black text-xs uppercase tracking-wider cursor-pointer transition-all ${
                                modalSize === sz 
                                  ? 'bg-[#C41E3A] text-white shadow-[2px_2px_0px_0px_#FFB81C]' 
                                  : 'bg-white hover:bg-[#C41E3A]/5 text-[#C41E3A]'
                              }`}
                            >
                              {sz} (Rs. {quickViewItem.prices?.[sz]})
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Cheese pull slider sync */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[11px] font-black uppercase text-[#C41E3A]/50">
                        <span>Cheese Pull Quantity</span>
                        <span className="text-[#C41E3A] font-black font-mono">x{modalCheeseLevel}</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="5" 
                        value={modalCheeseLevel}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setModalCheeseLevel(val);
                          setPullHeight(val * 32);
                        }}
                        className="w-full accent-[#C41E3A] bg-orange-100 h-1.5 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Sauce Type radio selection */}
                    <div className="space-y-2">
                      <label className="font-black uppercase text-[10px] tracking-widest text-[#C41E3A]/50 block">Sauce Drizzle Infusion</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Liquid Gold', 'Secret Lava', 'White Truffle Melt', 'Ghost Pepper Glaze'].map((s) => (
                          <button
                            key={s}
                            onClick={() => setModalSauceType(s)}
                            className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider text-left border-2 cursor-pointer transition-colors ${
                              modalSauceType === s 
                                ? 'bg-[#FFB81C]/20 border-[#C41E3A] text-[#C41E3A]' 
                                : 'bg-white border-[#C41E3A]/20 hover:border-[#C41E3A] text-[#C41E3A]/80'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="space-y-2 pt-1">
                      <label className="font-black uppercase text-[10px] tracking-widest text-[#C41E3A]/50 block">Quantity</label>
                      <div className="flex items-center gap-4 bg-white/60 w-fit p-1 rounded-2xl border-2 border-[#C41E3A]/20">
                        <button 
                          onClick={() => modalQty > 1 && setModalQty(modalQty - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-[#C41E3A] hover:text-white rounded-xl transition-colors cursor-pointer"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-6 text-center font-black text-sm">{modalQty}</span>
                        <button 
                          onClick={() => setModalQty(modalQty + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-[#C41E3A] hover:text-white rounded-xl transition-colors cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

                <button 
                  onClick={addCustomizedToCart}
                  className="w-full btn-hover bg-[#FFB81C] text-[#C41E3A] font-black py-4.5 rounded-full uppercase tracking-widest text-base shadow-lg border-2 border-[#C41E3A] hover:bg-[#ffa71c] cursor-pointer mt-4"
                >
                  Add To Cravings Basket
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Slide-over Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-black/60"
            />

            <div className="fixed inset-y-0 right-0 max-w-full flex">
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                className="w-screen max-w-md bg-[#FDF5E6] border-l-4 border-[#C41E3A] shadow-2xl p-6 md:p-8 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-[#C41E3A]/10">
                    <h2 className="font-retro text-4xl text-[#C41E3A] uppercase tracking-wide">
                      Your Order
                    </h2>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="text-2xl text-[#C41E3A] hover:rotate-90 transition-transform cursor-pointer"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Cart List Items Container */}
                  <div className="space-y-6 overflow-y-auto max-h-[55vh] pr-2">
                    {cart.length === 0 ? (
                      <div className="text-center py-20 opacity-45 space-y-4">
                        <ShoppingBag className="w-16 h-16 mx-auto text-[#C41E3A]" />
                        <p className="font-handwritten text-2xl text-[#C41E3A]">Your basket is empty!</p>
                        <p className="text-xs text-[#C41E3A]/80 max-w-[200px] mx-auto leading-normal">
                          Drizzle up some choices from our Retro Favorites above!
                        </p>
                      </div>
                    ) : (
                      cart.map((item, idx) => (
                        <div 
                          key={`${item.id}-${idx}`} 
                          className="flex gap-4 bg-white/70 p-4 rounded-[24px] border-2 border-[#C41E3A]/10 text-left relative"
                        >
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-18 h-18 rounded-[16px] object-cover border-2 border-[#C41E3A]/20"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-black uppercase text-[#C41E3A] text-sm leading-tight max-w-[80%]">
                                {item.name}
                              </h4>
                              <button 
                                onClick={() => removeCartItem(idx)}
                                className="text-[#C41E3A] opacity-40 hover:opacity-100 transition-opacity cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <div className="flex flex-wrap gap-x-2 gap-y-1 text-[10px] font-bold text-[#FFB81C] uppercase font-retro tracking-wider">
                              {item.selectedSize && (
                                <span className="bg-[#C41E3A]/5 text-[#C41E3A] px-1.5 py-0.5 rounded border border-[#C41E3A]/10">
                                  Size: {item.selectedSize}
                                </span>
                              )}
                              <span className="bg-[#FFB81C]/10 text-[#C41E3A] px-1.5 py-0.5 rounded border border-[#FFB81C]/20">
                                Cheese Pull: x{item.customCheese}
                              </span>
                            </div>

                            <div className="flex justify-between items-center pt-2 mt-2 border-t border-[#C41E3A]/5">
                              {/* Qty adjustments */}
                              <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-xl border border-[#C41E3A]/10 scale-90 -ml-1">
                                <button 
                                  onClick={() => adjustCartQty(idx, -1)}
                                  className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#C41E3A] hover:text-white transition-colors cursor-pointer"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="font-black text-xs text-[#C41E3A]">{item.qty}</span>
                                <button 
                                  onClick={() => adjustCartQty(idx, 1)}
                                  className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#C41E3A] hover:text-white transition-colors cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <span className="font-black text-base text-[#C41E3A]">
                                Rs. {item.price * item.qty}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Subtotal and Checkout info */}
                <div className="pt-6 border-t-2 border-[#C41E3A]/10 space-y-4 text-left">
                  <div className="flex justify-between items-end">
                    <span className="font-retro text-2xl text-[#C41E3A] tracking-wider uppercase">Subtotal</span>
                    <span className="font-black text-3xl text-[#C41E3A]">Rs. {cartSubtotal}</span>
                  </div>
                  
                  {cart.length > 0 ? (
                    <button 
                      onClick={() => {
                        const orderId = 'SNC-' + Math.floor(100000 + Math.random() * 900000);
                        setLastOrderDetails({
                          id: orderId,
                          total: cartSubtotal,
                          itemsCount: cartItemCount
                        });
                        setShowOrderSuccess(true);
                        updateCartAndStorage([]);
                        setIsCartOpen(false);
                      }}
                      className="w-full btn-hover bg-[#FFB81C] text-[#C41E3A] font-black py-4 rounded-2xl text-lg uppercase tracking-widest shadow-lg border-2 border-[#C41E3A] hover:bg-[#ffa71c] cursor-pointer"
                    >
                      Checkout Now
                    </button>
                  ) : (
                    <button 
                      disabled
                      className="w-full bg-[#FDF5E6] text-stone-400 border-2 border-stone-200 py-4 rounded-2xl text-lg uppercase tracking-widest cursor-not-allowed text-center"
                    >
                      Empty Basket
                    </button>
                  )}
                </div>

              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Order Success Modal with Live Kitchen Tracker */}
      <AnimatePresence>
        {showOrderSuccess && lastOrderDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOrderSuccess(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="relative bg-[#FDF5E6] border-4 border-[#C41E3A] rounded-[40px] max-w-lg w-full p-8 text-center shadow-2xl z-10 space-y-6 overflow-hidden"
            >
              {/* Confetti or decorative elements */}
              <div className="absolute -top-12 -left-12 w-24 h-24 bg-[#FFB81C] rounded-full opacity-35 blur-xl"></div>
              <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-[#C41E3A] rounded-full opacity-20 blur-xl"></div>

              {/* Close Button */}
              <button 
                onClick={() => setShowOrderSuccess(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow border-2 border-[#C41E3A] hover:scale-105 transition-transform cursor-pointer"
              >
                <X className="w-4 h-4 text-[#C41E3A]" />
              </button>

              <div className="w-20 h-20 bg-[#FFB81C] rounded-full flex items-center justify-center mx-auto border-4 border-[#C41E3A] retro-shadow-sm animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-[#C41E3A] stroke-[3]" />
              </div>

              <div className="space-y-2">
                <h3 className="font-retro text-4xl text-[#C41E3A] uppercase tracking-wide leading-none">
                  ORDER LOCKED IN!
                </h3>
                <p className="font-handwritten text-2xl text-[#FFB81C]">
                  Keep staying gooey, Karachi!
                </p>
              </div>

              {/* Receipt Info Card */}
              <div className="bg-white border-2 border-[#C41E3A] rounded-2xl p-4 text-left space-y-3 font-mono text-xs text-[#C41E3A]/90 shadow-sm relative">
                <div className="absolute top-2 right-2 font-black bg-[#FFB81C]/15 px-2 py-0.5 rounded text-[10px] uppercase">
                  PAID
                </div>
                <div className="flex justify-between border-b border-dashed border-[#C41E3A]/20 pb-2">
                  <span>ORDER NUMBER:</span>
                  <span className="font-bold text-[#1A1A1A]">{lastOrderDetails.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>CRITICAL ITEMS:</span>
                  <span className="font-bold text-[#1A1A1A]">{lastOrderDetails.itemsCount} portion(s)</span>
                </div>
                <div className="flex justify-between">
                  <span>LOCATION SOURCE:</span>
                  <span className="font-bold text-[#1A1A1A]">KAECHS Block 5 Karachi</span>
                </div>
                <div className="flex justify-between border-t border-[#C41E3A]/10 pt-2 text-sm font-black">
                  <span>TOTAL PAID:</span>
                  <span className="text-[#C41E3A]">Rs. {lastOrderDetails.total}</span>
                </div>
              </div>

              {/* Live Kitchen Tracking Section */}
              <div className="border-t-2 border-dashed border-[#C41E3A]/20 pt-4 space-y-4">
                <div className="flex justify-between items-center text-xs font-black uppercase text-[#C41E3A]/50">
                  <span>LIVE KITCHEN TRACKER</span>
                  <span className="text-[#FFB81C] font-black font-mono animate-pulse">SIZZLING...</span>
                </div>
                
                {/* Steps animation list */}
                <div className="space-y-3 text-left">
                  {[
                    { label: 'Cheddar Double Churned', icon: Flame, text: 'Proprietary golden sauce customized to perfection' },
                    { label: 'Pizza Baked Hot', icon: Sparkles, text: 'Sizzling in the deck ovens at KAECHS Block 5' },
                    { label: 'Drizzled & Loaded', icon: Layers, text: 'Smothering pizza and hot deals in warm cheese layers' },
                    { label: 'Rider Out on KAECHS Lane', icon: MapPin, text: 'Speeding through Karachi, arriving gooey and fresh' }
                  ].map((step, sIdx) => (
                    <div key={sIdx} className="flex gap-3 items-start">
                      <div className="w-5 h-5 rounded-full bg-[#FFB81C]/20 border border-[#C41E3A]/20 flex items-center justify-center text-[#C41E3A] mt-0.5 scale-90 flex-shrink-0">
                        <step.icon className="w-3 h-3" />
                      </div>
                      <div>
                        <div className="text-xs font-black uppercase text-[#C41E3A]">{step.label}</div>
                        <div className="text-[10px] text-[#C41E3A]/70">{step.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => setShowOrderSuccess(false)}
                className="w-full bg-[#C41E3A] hover:bg-[#b01630] text-white font-black py-3 rounded-xl uppercase tracking-wider text-xs transition-colors cursor-pointer"
              >
                Track on WhatsApp / Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
