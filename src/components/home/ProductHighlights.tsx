'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductGrid from '../products/ProductGrid';
import { useLocaleStore } from '@/lib/store';
import { MOCK_PRODUCTS } from '@/lib/mock-data';

export default function ProductHighlights() {
  const locale = useLocaleStore(s => s.country.locale);
  const [tab, setTab] = useState('featured');

  const featured = MOCK_PRODUCTS.filter(p => p.isFeatured);
  const newest = MOCK_PRODUCTS.filter(p => p.isNew);
  const bestSellers = MOCK_PRODUCTS.filter(p => !p.isOnSale).slice(0, 8);

  const titles: Record<string, Record<string, string>> = {
    section: { "pt-PT": "Destaques", "fr-FR": "En vedette", "es-ES": "Destacados", "it-IT": "In evidenza", "nl-NL": "In de schijnwerpers", "de-DE": "Highlights", "fr-BE": "En vedette", "lb-LU": "Highlights", "pt-BR": "Destaques" },
    featured: { "pt-PT": "Em Destaque", "fr-FR": "En vedette", "es-ES": "Destacados", "it-IT": "In evidenza", "nl-NL": "Uitgelicht", "de-DE": "Empfohlen", "fr-BE": "En vedette", "lb-LU": "Highlights", "pt-BR": "Em Destaque" },
    new: { "pt-PT": "Novidades", "fr-FR": "Nouveautés", "es-ES": "Novedades", "it-IT": "Novità", "nl-NL": "Nieuw", "de-DE": "Neuheiten", "fr-BE": "Nouveautés", "lb-LU": "Neiegkeeten", "pt-BR": "Novidades" },
    best: { "pt-PT": "Mais Vendidos", "fr-FR": "Meilleures ventes", "es-ES": "Más vendidos", "it-IT": "Più venduti", "nl-NL": "Bestsellers", "de-DE": "Bestseller", "fr-BE": "Meilleures ventes", "lb-LU": "Bestseller", "pt-BR": "Mais Vendidos" },
  };

  const t = (key: string) => titles[key]?.[locale] || titles[key]?.['pt-PT'] || key;

  return (
    <section className="py-8">
      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold">{t('section')}</h2>
          <TabsList className="hidden sm:flex">
            <TabsTrigger value="featured">{t('featured')}</TabsTrigger>
            <TabsTrigger value="new">{t('new')}</TabsTrigger>
            <TabsTrigger value="best">{t('best')}</TabsTrigger>
          </TabsList>
        </div>

        {/* Mobile tabs */}
        <div className="flex sm:hidden gap-2 mb-4 overflow-x-auto">
          {[
            { value: 'featured', label: t('featured') },
            { value: 'new', label: t('new') },
            { value: 'best', label: t('best') },
          ].map(item => (
            <button
              key={item.value}
              onClick={() => setTab(item.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                tab === item.value ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <TabsContent value="featured">
          <ProductGrid products={featured} />
        </TabsContent>
        <TabsContent value="new">
          <ProductGrid products={newest} />
        </TabsContent>
        <TabsContent value="best">
          <ProductGrid products={bestSellers} />
        </TabsContent>
      </Tabs>
    </section>
  );
}
