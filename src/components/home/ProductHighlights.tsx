'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductGrid from '../products/ProductGrid';
import { useLocaleStore } from '@/lib/store';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Zap, TrendingUp } from 'lucide-react';

export default function ProductHighlights() {
  const locale = useLocaleStore(s => s.country.locale);
  const [tab, setTab] = useState('featured');

  const featured = MOCK_PRODUCTS.filter(p => p.isFeatured);
  const newest = MOCK_PRODUCTS.filter(p => p.isNew);
  const bestSellers = MOCK_PRODUCTS.filter(p => !p.isOnSale).slice(0, 8);

  const titles: Record<string, Record<string, string>> = {
    section: { "pt-PT": "Destaques", "pt-BR": "Destaques" },
    featured: { "pt-PT": "Em Destaque", "pt-BR": "Em Destaque" },
    new: { "pt-PT": "Novidades", "pt-BR": "Novidades" },
    best: { "pt-PT": "Mais Vendidos", "pt-BR": "Mais Vendidos" },
  };

  const t = (key: string) => titles[key]?.[locale] || titles[key]?.['pt-PT'] || key;

  return (
    <section className="py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest">
            <Star className="h-3 w-3 fill-current" />
            Curadoria Especial
          </div>
          <h2 className="text-4xl font-black text-gray-900">{t('section')}</h2>
        </div>

        <div className="flex gap-2 p-1.5 bg-gray-100 rounded-[1.25rem] self-start md:self-auto">
          {[
            { id: 'featured', label: t('featured'), icon: Star },
            { id: 'new', label: t('new'), icon: Zap },
            { id: 'best', label: t('best'), icon: TrendingUp },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all ${
                tab === item.id 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <item.icon className={`h-4 w-4 ${tab === item.id ? 'text-primary' : 'text-gray-400'}`} />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
        >
          {tab === 'featured' && <ProductGrid products={featured} />}
          {tab === 'new' && <ProductGrid products={newest} />}
          {tab === 'best' && <ProductGrid products={bestSellers} />}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
