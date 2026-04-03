'use client';

import { useEffect, useMemo } from 'react';
import { useNavStore, useLocaleStore } from '@/lib/store';
import { MOCK_PRODUCTS, PRODUCT_CATEGORIES_MAP } from '@/lib/mock-data';
import { CATEGORIES } from '@/lib/constants';

// Layout
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileMenu from '@/components/layout/MobileMenu';

// Home
import HeroBanner from '@/components/home/HeroBanner';
import CategoryGrid from '@/components/home/CategoryGrid';
import WeeklyDeals from '@/components/home/WeeklyDeals';
import ProductHighlights from '@/components/home/ProductHighlights';
import DeliveryBanner from '@/components/home/DeliveryBanner';
import AppDownloadBanner from '@/components/home/AppDownloadBanner';

// Products
import ProductGrid from '@/components/products/ProductGrid';
import ProductDetail from '@/components/products/ProductDetail';
import SearchResults from '@/components/products/SearchResults';

// Cart & Checkout
import CartDrawer from '@/components/cart/CartDrawer';
import CheckoutPage from '@/components/checkout/CheckoutPage';

// Chat
import AIChatWidget from '@/components/chat/AIChatWidget';

// Shared
import Breadcrumb from '@/components/shared/Breadcrumb';

export default function Home() {
  const currentView = useNavStore(s => s.currentView);
  const categorySlug = useNavStore(s => s.categorySlug);
  const locale = useLocaleStore(s => s.country.locale);

  // Get products for category view
  const categoryProducts = useMemo(() => {
    if (!categorySlug) return [];
    const productIds = PRODUCT_CATEGORIES_MAP[categorySlug] || [];
    return MOCK_PRODUCTS.filter(p => productIds.includes(p.id));
  }, [categorySlug]);

  const categoryName = useMemo(() => {
    if (!categorySlug) return '';
    const cat = CATEGORIES.find(c => c.slug === categorySlug);
    return cat?.label[locale] || cat?.label['pt-PT'] || categorySlug;
  }, [categorySlug, locale]);

  // Try to fetch products from API (will fall back to mock data)
  useEffect(() => {
    // Prefetch product images or any other initialization
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <MobileMenu />

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4">
          {currentView === 'home' && (
            <div className="page-transition">
              <HeroBanner />
              <CategoryGrid />
              <WeeklyDeals />
              <ProductHighlights />
              <DeliveryBanner />
              <AppDownloadBanner />
            </div>
          )}

          {currentView === 'category' && (
            <div className="page-transition py-6">
              <Breadcrumb />
              <h1 className="text-2xl md:text-3xl font-bold mb-6">{categoryName}</h1>
              <ProductGrid products={categoryProducts} />
            </div>
          )}

          {currentView === 'product' && (
            <ProductDetail />
          )}

          {currentView === 'search' && (
            <SearchResults />
          )}

          {currentView === 'weekly' && (
            <div className="page-transition">
              <div className="py-6">
                <Breadcrumb />
              </div>
              <WeeklyDeals fullPage />
            </div>
          )}

          {currentView === 'checkout' && (
            <CheckoutPage />
          )}
        </div>
      </main>

      <Footer />

      {/* Overlays */}
      <CartDrawer />
      <AIChatWidget />
    </div>
  );
}
