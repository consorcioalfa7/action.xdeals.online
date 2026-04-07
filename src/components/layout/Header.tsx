'use client';

import { useState, useRef, useEffect } from 'react';
import { Menu, Search, ShoppingCart, Truck, ChevronRight, Zap, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavStore, useLocaleStore, useUIStore, useCartStore } from '@/lib/store';
import { CATEGORIES, DELIVERY_CONFIG } from '@/lib/constants';
import CountrySelector from './CountrySelector';
import SearchBar from '../ui/SearchBar';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const locale = useLocaleStore(s => s.country.locale);
  const navigate = useNavStore(s => s.navigate);
  const goHome = useNavStore(s => s.goHome);
  const toggleMobileMenu = useUIStore(s => s.toggleMobileMenu);
  const toggleSearch = useUIStore(s => s.toggleSearch);
  const toggleCart = useUIStore(s => s.toggleCart);
  const itemCount = useCartStore(s => s.getItemCount());

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseEnter = (slug: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHoveredCat(slug);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setHoveredCat(null), 200);
  };

  return (
    <>
      <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'translate-y-[-32px]' : 'translate-y-0'}`}>
        {/* Top Bar */}
        <div className="bg-[#0F172A] text-white text-[10px] font-bold uppercase tracking-widest">
          <div className="container mx-auto px-4 flex items-center justify-between h-8">
            <div className="flex items-center gap-6">
              <CountrySelector />
              <div className="hidden md:flex items-center gap-2 text-primary">
                <Zap className="h-3 w-3 fill-current" />
                <span>Novidades todas as semanas</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-white/60">
                <ShieldCheck className="h-3 w-3" />
                <span>Pagamentos Seguros NeXFlowX</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className={`transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-lg' : 'bg-primary text-white'}`}>
          <div className="container mx-auto px-4 flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleMobileMenu} 
                className={`lg:hidden p-2 rounded-xl transition-colors ${isScrolled ? 'text-gray-900 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}
              >
                <Menu className="h-6 w-6" />
              </button>
              <button onClick={goHome} className="flex items-center group">
                <span className={`text-3xl font-black tracking-tighter transition-colors ${isScrolled ? 'text-primary' : 'text-white'}`}>
                  ACTION
                  <span className={isScrolled ? 'text-gray-900' : 'text-white/80'}>.</span>
                </span>
              </button>
            </div>

            {/* Desktop Search */}
            <div className="hidden lg:flex flex-1 max-w-2xl mx-12">
              <div
                onClick={toggleSearch}
                className={`w-full flex items-center gap-3 rounded-2xl px-6 py-3 cursor-pointer transition-all duration-300 group ${
                  isScrolled 
                    ? 'bg-gray-100 hover:bg-gray-200 border border-transparent' 
                    : 'bg-white/10 hover:bg-white/20 border border-white/20'
                }`}
              >
                <Search className={`h-5 w-5 ${isScrolled ? 'text-gray-400' : 'text-white/60'}`} />
                <span className={`text-sm font-medium ${isScrolled ? 'text-gray-500' : 'text-white/70'}`}>
                  Pesquisar entre mais de 6.000 produtos...
                </span>
                <div className={`ml-auto px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                  isScrolled ? 'border-gray-300 text-gray-400' : 'border-white/30 text-white/40'
                }`}>
                  ⌘K
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={toggleSearch} 
                className={`lg:hidden p-2 rounded-xl transition-colors ${isScrolled ? 'text-gray-900 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}
              >
                <Search className="h-6 w-6" />
              </button>
              
              <button 
                onClick={toggleCart} 
                className={`relative p-3 rounded-2xl transition-all duration-300 group ${
                  isScrolled 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105' 
                    : 'bg-white text-primary shadow-xl shadow-black/10 hover:scale-105'
                }`}
              >
                <ShoppingCart className="h-6 w-6" />
                {itemCount > 0 && (
                  <span className={`absolute -top-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-black border-2 ${
                    isScrolled ? 'bg-white text-primary border-primary' : 'bg-primary text-white border-white'
                  }`}>
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Category Navigation */}
        <div className={`hidden lg:block transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm' : 'bg-white border-b border-gray-100'}`}>
          <div className="container mx-auto px-4">
            <nav className="flex items-center gap-2 h-12">
              <button
                onClick={() => navigate('weekly')}
                className="flex items-center gap-2 px-4 py-2 text-xs font-black text-primary uppercase tracking-wider hover:bg-primary/5 rounded-xl transition-all"
              >
                <Zap className="h-4 w-4 fill-current" />
                Ofertas da Semana
              </button>
              
              <div className="w-px h-4 bg-gray-200 mx-2" />
              
              {CATEGORIES.slice(0, 8).map((cat) => (
                <div
                  key={cat.slug}
                  className="relative h-full flex items-center"
                  onMouseEnter={() => handleMouseEnter(cat.slug)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    onClick={() => navigate('category', cat.slug)}
                    className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-primary uppercase tracking-wider transition-all rounded-xl hover:bg-gray-50"
                  >
                    {cat.label[locale] || cat.label['pt-PT']}
                  </button>
                  
                  <AnimatePresence>
                    {hoveredCat === cat.slug && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 pt-2 z-50"
                      >
                        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 min-w-[280px]">
                          <div className="grid gap-2">
                            {cat.children?.map(child => (
                              <button
                                key={child.slug}
                                onClick={() => { navigate('category', cat.slug); setHoveredCat(null); }}
                                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-all group text-left"
                              >
                                <span className="text-sm font-bold text-gray-700 group-hover:text-primary transition-colors">
                                  {child.label[locale] || child.label['pt-PT']}
                                </span>
                                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>
          </div>
        </div>
      </header>
      
      {/* Spacer for fixed header */}
      <div className="h-24 md:h-32" />
      
      <SearchBar />
    </>
  );
}
