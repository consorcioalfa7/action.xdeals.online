'use client';

import { useState, useMemo } from 'react';
import { SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import ProductGrid from './ProductGrid';
import Breadcrumb from '../shared/Breadcrumb';
import { useNavStore, useLocaleStore } from '@/lib/store';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import type { Product } from '@/lib/types';

type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'newest';

interface FilterSidebarProps {
  locale: string;
  minPrice: string;
  maxPrice: string;
  onSale: boolean;
  isNew: boolean;
  hasFilters: boolean;
  t: (key: string) => string;
  onMinPriceChange: (v: string) => void;
  onMaxPriceChange: (v: string) => void;
  onSaleChange: (v: boolean) => void;
  onNewChange: (v: boolean) => void;
  onClear: () => void;
}

function FilterSidebarContent({ locale, minPrice, maxPrice, onSale, isNew, hasFilters, t, onMinPriceChange, onMaxPriceChange, onSaleChange, onNewChange, onClear }: FilterSidebarProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-3">{t('priceRange')}</h3>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground">{t('min')}</Label>
            <Input type="number" value={minPrice} onChange={e => onMinPriceChange(e.target.value)} placeholder="0" className="h-9" />
          </div>
          <span className="mt-5 text-muted-foreground">—</span>
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground">{t('max')}</Label>
            <Input type="number" value={maxPrice} onChange={e => onMaxPriceChange(e.target.value)} placeholder="∞" className="h-9" />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Checkbox id="sale" checked={onSale} onCheckedChange={(v) => onSaleChange(!!v)} />
          <Label htmlFor="sale" className="text-sm cursor-pointer">{t('onSale')}</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="new" checked={isNew} onCheckedChange={(v) => onNewChange(!!v)} />
          <Label htmlFor="new" className="text-sm cursor-pointer">{t('newProducts')}</Label>
        </div>
      </div>

      {hasFilters && (
        <>
          <Separator />
          <Button variant="ghost" size="sm" onClick={onClear} className="text-red-500 hover:text-red-600">
            <X className="mr-1 h-3.5 w-3.5" />
            {t('clear')}
          </Button>
        </>
      )}
    </div>
  );
}

export default function SearchResults() {
  const searchQuery = useNavStore(s => s.searchQuery);
  const locale = useLocaleStore(s => s.country.locale);
  const formatPrice = useLocaleStore(s => s.formatPrice);

  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [onSale, setOnSale] = useState(false);
  const [isNew, setIsNew] = useState(false);

  const results = useMemo(() => {
    let filtered = [...MOCK_PRODUCTS];

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => {
        const name = p.translations[locale]?.name || p.translations['pt-PT']?.name || '';
        const desc = p.translations[locale]?.description || p.translations['pt-PT']?.description || '';
        return name.toLowerCase().includes(q) || desc.toLowerCase().includes(q) || p.slug.includes(q);
      });
    }

    // Price filter
    if (minPrice) filtered = filtered.filter(p => p.price >= Number(minPrice));
    if (maxPrice) filtered = filtered.filter(p => p.price <= Number(maxPrice));

    // Sale filter
    if (onSale) filtered = filtered.filter(p => p.isOnSale);
    if (isNew) filtered = filtered.filter(p => p.isNew);

    // Sort
    switch (sortBy) {
      case 'price-asc': filtered.sort((a, b) => a.price - b.price); break;
      case 'price-desc': filtered.sort((a, b) => b.price - a.price); break;
      case 'newest': filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
    }

    return filtered;
  }, [searchQuery, locale, sortBy, minPrice, maxPrice, onSale, isNew]);

  const clearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setOnSale(false);
    setIsNew(false);
    setSortBy('relevance');
  };

  const hasFilters = minPrice || maxPrice || onSale || isNew || sortBy !== 'relevance';

  const labels: Record<string, Record<string, string>> = {
    results: { "pt-PT": "resultados para", "fr-FR": "résultats pour", "es-ES": "resultados para", "de-DE": "Ergebnisse für", "nl-NL": "resultaten voor", "pt-BR": "resultados para" },
    filters: { "pt-PT": "Filtros", "fr-FR": "Filtres", "es-ES": "Filtros", "de-DE": "Filter", "nl-NL": "Filters", "pt-BR": "Filtros" },
    sort: { "pt-PT": "Ordenar", "fr-FR": "Trier", "es-ES": "Ordenar", "de-DE": "Sortieren", "nl-NL": "Sorteren", "pt-BR": "Ordenar" },
    priceRange: { "pt-PT": "Faixa de preço", "fr-FR": "Gamme de prix", "es-ES": "Rango de precio", "de-DE": "Preisbereich", "nl-NL": "Prijsbereik", "pt-BR": "Faixa de preço" },
    min: { "pt-PT": "Mín", "fr-FR": "Min", "es-ES": "Mín", "de-DE": "Min", "nl-NL": "Min", "pt-BR": "Mín" },
    max: { "pt-PT": "Máx", "fr-FR": "Max", "es-ES": "Máx", "de-DE": "Max", "nl-NL": "Max", "pt-BR": "Máx" },
    onSale: { "pt-PT": "Em promoção", "fr-FR": "En promotion", "es-ES": "En oferta", "de-DE": "Im Angebot", "nl-NL": "In de aanbieding", "pt-BR": "Em promoção" },
    newProducts: { "pt-PT": "Novidades", "fr-FR": "Nouveautés", "es-ES": "Novedades", "de-DE": "Neuheiten", "nl-NL": "Nieuw", "pt-BR": "Novidades" },
    relevance: { "pt-PT": "Relevância", "fr-FR": "Pertinence", "es-ES": "Relevancia", "de-DE": "Relevanz", "nl-NL": "Relevantie", "pt-BR": "Relevância" },
    priceAsc: { "pt-PT": "Preço: menor → maior", "fr-FR": "Prix: croissant", "es-ES": "Precio: menor → mayor", "de-DE": "Preis: aufsteigend", "nl-NL": "Prijs: oplopend", "pt-BR": "Preço: menor → maior" },
    priceDesc: { "pt-PT": "Preço: maior → menor", "fr-FR": "Prix: décroissant", "es-ES": "Precio: mayor → menor", "de-DE": "Preis: absteigend", "nl-NL": "Prijs: aflopend", "pt-BR": "Preço: maior → menor" },
    newest: { "pt-PT": "Mais recentes", "fr-FR": "Plus récents", "es-ES": "Más recientes", "de-DE": "Neueste", "nl-NL": "Nieuwste", "pt-BR": "Mais recentes" },
    clear: { "pt-PT": "Limpar filtros", "fr-FR": "Effacer les filtres", "es-ES": "Borrar filtros", "de-DE": "Filter löschen", "nl-NL": "Filters wissen", "pt-BR": "Limpar filtros" },
    noResults: { "pt-PT": "Nenhum resultado encontrado", "fr-FR": "Aucun résultat trouvé", "es-ES": "Ningún resultado encontrado", "de-DE": "Keine Ergebnisse gefunden", "nl-NL": "Geen resultaten gevonden", "pt-BR": "Nenhum resultado encontrado" },
    noResultsDesc: { "pt-PT": "Tente pesquisar com outros termos ou ajuste os filtros.", "fr-FR": "Essayez d'autres termes ou ajustez les filtres.", "es-ES": "Intente buscar con otros términos o ajuste los filtros.", "de-DE": "Versuchen Sie andere Suchbegriffe oder passen Sie die Filter an.", "nl-NL": "Probeer andere zoektermen of pas de filters aan.", "pt-BR": "Tente pesquisar com outros termos ou ajuste os filtros." },
  };

  const t = (key: string) => labels[key]?.[locale] || labels[key]?.['pt-PT'] || key;

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'relevance', label: t('relevance') },
    { value: 'price-asc', label: t('priceAsc') },
    { value: 'price-desc', label: t('priceDesc') },
    { value: 'newest', label: t('newest') },
  ];

  const filterProps: FilterSidebarProps = {
    locale, minPrice, maxPrice, onSale, isNew, hasFilters, t,
    onMinPriceChange: setMinPrice,
    onMaxPriceChange: setMaxPrice,
    onSaleChange: setOnSale,
    onNewChange: setIsNew,
    onClear: clearFilters,
  };

  return (
    <div className="page-transition">
      <div className="container mx-auto px-4 py-6">
        <Breadcrumb />

        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">
            {searchQuery && <span className="text-muted-foreground">"{searchQuery}"</span>}
          </h1>
          <p className="text-sm text-muted-foreground">
            {results.length} {t('results')} {searchQuery && `"${searchQuery}"`}
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          {/* Mobile filter button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden">
                <SlidersHorizontal className="mr-1 h-4 w-4" />
                {t('filters')}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle>{t('filters')}</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <FilterSidebarContent {...filterProps} />
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop sort */}
          <div className="flex items-center gap-2 ml-auto">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="text-sm border rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <FilterSidebarContent {...filterProps} />
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            <ProductGrid products={results} />
          </div>
        </div>
      </div>
    </div>
  );
}
