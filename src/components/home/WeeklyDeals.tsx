'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import ProductCard from '../products/ProductCard';
import { useLocaleStore, useNavStore } from '@/lib/store';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import type { Product } from '@/lib/types';

interface WeeklyDealsProps {
  fullPage?: boolean;
  products?: Product[];
}

export default function WeeklyDeals({ fullPage, products: propProducts }: WeeklyDealsProps) {
  const locale = useLocaleStore(s => s.country.locale);
  const navigate = useNavStore(s => s.navigate);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    slidesToScroll: 1,
  });

  const saleProducts = propProducts || MOCK_PRODUCTS.filter(p => p.isOnSale);
  const title = locale === 'pt-PT' ? 'Ofertas da Semana'
    : locale === 'fr-FR' ? 'Offres de la Semaine'
    : locale === 'es-ES' ? 'Ofertas de la Semana'
    : locale === 'de-DE' ? 'Wochenangebote'
    : locale === 'nl-NL' ? 'Weekaanbiedingen'
    : locale === 'pt-BR' ? 'Ofertas da Semana'
    : 'Weekly Deals';

  const seeAllText = locale === 'pt-PT' ? 'Ver tudo'
    : locale === 'fr-FR' ? 'Voir tout'
    : locale === 'es-ES' ? 'Ver todo'
    : locale === 'de-DE' ? 'Alle ansehen'
    : locale === 'nl-NL' ? 'Bekijk alles'
    : locale === 'pt-BR' ? 'Ver tudo'
    : 'See all';

  if (fullPage) {
    return (
      <div className="py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            🔥 {title}
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {saleProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          🔥 {title}
        </h2>
        <button
          onClick={() => navigate('weekly')}
          className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
        >
          {seeAllText} <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="relative">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex gap-4">
            {saleProducts.map(product => (
              <div key={product.id} className="min-w-0 shrink-0 grow-0 basis-[200px] sm:basis-[220px] md:basis-[240px]">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
        {emblaApi && (
          <>
            <button
              onClick={() => emblaApi.scrollPrev()}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 h-9 w-9 bg-white border rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors hidden md:flex"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => emblaApi.scrollNext()}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 h-9 w-9 bg-white border rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors hidden md:flex"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </section>
  );
}
