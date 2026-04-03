'use client';

import { useState, useRef, useEffect } from 'react';
import { Menu, Search, ShoppingCart, Truck, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavStore, useLocaleStore, useUIStore, useCartStore } from '@/lib/store';
import { CATEGORIES, DELIVERY_CONFIG } from '@/lib/constants';
import CountrySelector from './CountrySelector';
import SearchBar from '../ui/SearchBar';

export default function Header() {
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);
  const megaRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const locale = useLocaleStore(s => s.country.locale);
  const navigate = useNavStore(s => s.navigate);
  const goHome = useNavStore(s => s.goHome);
  const toggleMobileMenu = useUIStore(s => s.toggleMobileMenu);
  const toggleSearch = useUIStore(s => s.toggleSearch);
  const toggleCart = useUIStore(s => s.toggleCart);
  const itemCount = useCartStore(s => s.getItemCount());

  const freeDeliveryText = {
    "pt-PT": "Entregas grátis acima de 19,90€",
    "fr-FR": "Livraison gratuite dès 19,90€",
    "es-ES": "Envíos gratis desde 19,90€",
    "it-IT": "Spedizione gratuita da 19,90€",
    "nl-NL": "Gratis bezorging vanaf 19,90€",
    "de-DE": "Kostenloser Versand ab 19,90€",
    "fr-BE": "Livraison gratuite dès 19,90€",
    "lb-LU": "Gratis Liwwerung ab 19,90€",
    "pt-BR": "Entregas grátis acima de R$19,90",
  };

  const handleMouseEnter = (slug: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHoveredCat(slug);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setHoveredCat(null), 200);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full">
        {/* Top Bar */}
        <div className="bg-[#1A1A1A] text-white text-xs">
          <div className="container mx-auto px-4 flex items-center justify-between h-8">
            <div className="flex items-center gap-4">
              <CountrySelector />
              <span className="hidden sm:inline text-white/70">|</span>
              <span className="hidden sm:inline text-white/80">
                {freeDeliveryText[locale] || freeDeliveryText["pt-PT"]}
              </span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Truck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {locale === 'pt-PT' ? 'Entrega ao domicílio • 4,90€ ou grátis acima de 19,90€'
                  : locale === 'fr-FR' ? 'Livraison à domicile • 4,90€ ou gratuit dès 19,90€'
                  : locale === 'de-DE' ? 'Lieferung nach Hause • 4,90€ oder kostenlos ab 19,90€'
                  : locale === 'nl-NL' ? 'Thuisbezorging • 4,90€ of gratis vanaf 19,90€'
                  : locale === 'es-ES' ? 'Entrega a domicilio • 4,90€ o gratis desde 19,90€'
                  : locale === 'it-IT' ? 'Consegna a domicilio • 4,90€ o gratis da 19,90€'
                  : locale === 'pt-BR' ? 'Entrega no domicílio • R$4,90 ou grátis acima de R$19,90'
                  : 'Home delivery • 4,90€ or free above 19,90€'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="bg-primary text-white">
          <div className="container mx-auto px-4 flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <button onClick={toggleMobileMenu} className="lg:hidden p-1.5 hover:bg-white/10 rounded-sm transition-colors">
                <Menu className="h-5 w-5" />
              </button>
              <button onClick={goHome} className="flex items-center">
                <span className="text-2xl font-black tracking-tighter">ACTION</span>
              </button>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <div
                onClick={toggleSearch}
                className="w-full flex items-center gap-2 bg-white/15 hover:bg-white/20 rounded-lg px-4 py-2 cursor-pointer transition-colors"
              >
                <Search className="h-4 w-4 text-white/80" />
                <span className="text-sm text-white/70">
                  {locale === 'pt-PT' ? 'Pesquisar produtos...' : locale === 'fr-FR' ? 'Rechercher des produits...' : locale === 'es-ES' ? 'Buscar productos...' : locale === 'de-DE' ? 'Produkte suchen...' : locale === 'nl-NL' ? 'Zoek producten...' : locale === 'pt-BR' ? 'Pesquisar produtos...' : 'Search products...'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={toggleSearch} className="md:hidden p-2 hover:bg-white/10 rounded-sm transition-colors">
                <Search className="h-5 w-5" />
              </button>
              <button onClick={toggleCart} className="relative p-2 hover:bg-white/10 rounded-sm transition-colors">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-white text-primary text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Category Navigation - Desktop */}
        <div className="hidden lg:block bg-white border-b shadow-sm" ref={megaRef}
          onMouseLeave={handleMouseLeave}
        >
          <div className="container mx-auto px-4">
            <nav className="flex items-center gap-0 h-11 overflow-x-auto">
              <button
                onClick={() => navigate('weekly')}
                className="px-3 py-2 text-sm font-semibold text-primary whitespace-nowrap hover:bg-orange-50 transition-colors rounded-sm"
              >
                {locale === 'pt-PT' ? '🔥 Ofertas da Semana' : locale === 'fr-FR' ? '🔥 Offres de la Semaine' : locale === 'es-ES' ? '🔥 Ofertas de la Semana' : locale === 'de-DE' ? '🔥 Wochenangebote' : locale === 'nl-NL' ? '🔥 Weekaanbiedingen' : locale === 'pt-BR' ? '🔥 Ofertas da Semana' : '🔥 Weekly Deals'}
              </button>
              <div className="w-px h-5 bg-border mx-1" />
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.slug}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(cat.slug)}
                >
                  <button
                    onClick={() => navigate('category', cat.slug)}
                    className="px-3 py-2 text-sm font-medium text-gray-700 whitespace-nowrap hover:text-primary hover:bg-orange-50 transition-colors rounded-sm mega-menu-item"
                  >
                    {cat.label[locale] || cat.label['pt-PT']}
                  </button>
                </div>
              ))}
            </nav>
          </div>

          {/* Mega Menu Dropdown */}
          {hoveredCat && (
            <div
              className="absolute left-0 right-0 bg-white border-t shadow-xl z-30"
              onMouseEnter={() => timeoutRef.current && clearTimeout(timeoutRef.current)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="container mx-auto px-8 py-6">
                {(() => {
                  const cat = CATEGORIES.find(c => c.slug === hoveredCat);
                  if (!cat || !cat.children) return null;
                  return (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {cat.children.map(child => (
                        <button
                          key={child.slug}
                          onClick={() => { navigate('category', cat.slug); setHoveredCat(null); }}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 transition-colors text-left group"
                        >
                          <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                            <span className="text-lg font-bold">{(child.label[locale] || child.label['pt-PT'])[0]}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{child.label[locale] || child.label['pt-PT']}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </header>

      <SearchBar />
    </>
  );
}
