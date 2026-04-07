'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { ChevronRight, ChevronLeft, Flame, ArrowRight } from 'lucide-react';
import ProductCard from '../products/ProductCard';
import { useLocaleStore, useNavStore } from '@/lib/store';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import type { Product } from '@/lib/types';
import { motion } from 'framer-motion';

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
    dragFree: true,
  });

  const saleProducts = propProducts || MOCK_PRODUCTS.filter(p => p.isOnSale);
  const title = locale === 'pt-PT' ? 'Ofertas da Semana' : 'Weekly Deals';

  if (fullPage) {
    return (
      <div className="py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest">
              <Flame className="h-3 w-3 fill-current" />
              Tempo Limitado
            </div>
            <h2 className="text-4xl font-black text-gray-900 flex items-center gap-3">
              {title}
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {saleProducts.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="py-16">
      <div className="flex items-end justify-between mb-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest">
            <Flame className="h-3 w-3 fill-current" />
            Promoções a Arder
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900">
            {title}
          </h2>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 mr-4">
            <button
              onClick={() => emblaApi?.scrollPrev()}
              className="h-12 w-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-all active:scale-95"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={() => emblaApi?.scrollNext()}
              className="h-12 w-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-all active:scale-95"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
          <Button
            onClick={() => navigate('weekly')}
            variant="ghost"
            className="font-black text-primary hover:bg-primary/5 h-12 px-6 rounded-2xl gap-2"
          >
            Ver tudo <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative -mx-4 px-4 overflow-hidden">
        <div ref={emblaRef} className="overflow-visible">
          <div className="flex gap-6">
            {saleProducts.map(product => (
              <div key={product.id} className="min-w-0 shrink-0 grow-0 basis-[280px] md:basis-[300px]">
                <ProductCard product={product} />
              </div>
            ))}
            {/* Last slide "See More" */}
            <div className="min-w-0 shrink-0 grow-0 basis-[280px] md:basis-[300px]">
              <div 
                onClick={() => navigate('weekly')}
                className="h-full min-h-[400px] rounded-[2rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-8 text-center group cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                  <ArrowRight className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Descubra mais ofertas</h3>
                <p className="text-sm text-gray-500">Temos centenas de produtos com descontos incríveis à sua espera.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
