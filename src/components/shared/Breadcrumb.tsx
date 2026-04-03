'use client';

import { ChevronRight, Home } from 'lucide-react';
import { useNavStore, useLocaleStore } from '@/lib/store';
import { CATEGORIES } from '@/lib/constants';
import Link from 'next/link';

const LABELS: Record<string, Record<string, string>> = {
  home: { "pt-PT": "Início", "fr-FR": "Accueil", "es-ES": "Inicio", "it-IT": "Home", "nl-NL": "Home", "de-DE": "Startseite", "fr-BE": "Accueil", "lb-LU": "Home", "pt-BR": "Início" },
  search: { "pt-PT": "Pesquisa", "fr-FR": "Recherche", "es-ES": "Búsqueda", "it-IT": "Ricerca", "nl-NL": "Zoeken", "de-DE": "Suche", "fr-BE": "Recherche", "lb-LU": "Sichen", "pt-BR": "Pesquisa" },
  weekly: { "pt-PT": "Ofertas da Semana", "fr-FR": "Offres de la Semaine", "es-ES": "Ofertas de la Semana", "it-IT": "Offerte della Settimana", "nl-NL": "Weekaanbiedingen", "de-DE": "Wochenangebote", "fr-BE": "Offres", "lb-LU": "Wuchenangeboter", "pt-BR": "Ofertas da Semana" },
};

export default function Breadcrumb() {
  const { currentView, categorySlug, productSlug, searchQuery } = useNavStore();
  const locale = useLocaleStore(s => s.country.locale);

  const t = (key: string) => LABELS[key]?.[locale] || LABELS[key]?.["pt-PT"] || key;

  const items: { label: string; onClick?: () => void }[] = [];

  items.push({
    label: t('home'),
    onClick: () => useNavStore.getState().goHome(),
  });

  if (currentView === 'category' && categorySlug) {
    const cat = CATEGORIES.find(c => c.slug === categorySlug);
    if (cat) {
      items.push({ label: cat.label[locale] || cat.label["pt-PT"] });
    }
  } else if (currentView === 'search') {
    items.push({ label: t('search') });
    if (searchQuery) {
      items.push({ label: `"${searchQuery}"` });
    }
  } else if (currentView === 'weekly') {
    items.push({ label: t('weekly') });
  } else if (currentView === 'checkout') {
    const checkoutLabel = { "pt-PT": "Checkout", "fr-FR": "Paiement", "es-ES": "Pago", "it-IT": "Checkout", "nl-NL": "Afrekenen", "de-DE": "Kasse", "fr-BE": "Paiement", "lb-LU": "Kasse", "pt-BR": "Checkout" };
    items.push({ label: checkoutLabel[locale] || "Checkout" });
  } else if (currentView === 'product' && productSlug) {
    const productLabel = { "pt-PT": "Produto", "fr-FR": "Produit", "es-ES": "Producto", "it-IT": "Prodotto", "nl-NL": "Product", "de-DE": "Produkt", "fr-BE": "Produit", "lb-LU": "Produkt", "pt-BR": "Produto" };
    items.push({ label: productLabel[locale] || "Produto" });
  }

  if (items.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-1 text-sm text-muted-foreground">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-1">
            {idx > 0 && <ChevronRight className="h-3.5 w-3.5" />}
            {idx === 0 ? (
              <button
                onClick={item.onClick}
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <Home className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </button>
            ) : (
              <span className={idx === items.length - 1 ? 'text-foreground font-medium' : ''}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
