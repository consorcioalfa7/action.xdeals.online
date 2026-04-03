'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useNavStore, useUIStore, useLocaleStore } from '@/lib/store';
import { MOCK_PRODUCTS } from '@/lib/mock-data';

const RECENT_KEY = 'action-recent-searches';
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<string[]>(getRecentSearches);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const locale = useLocaleStore(s => s.country.locale);
  const navigate = useNavStore(s => s.navigate);
  const isOpen = useUIStore(s => s.isSearchOpen);
  const toggle = useUIStore(s => s.toggleSearch);
  const setOpen = useUIStore(s => s.setCartOpen);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const saveRecent = (q: string) => {
    const trimmed = q.trim().toLowerCase();
    if (!trimmed) return;
    const updated = [trimmed, ...recent.filter(r => r !== trimmed)].slice(0, MAX_RECENT);
    setRecent(updated);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  };

  const doSearch = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    saveRecent(trimmed);
    setQuery('');
    setShowDropdown(false);
    toggle();
    navigate('search', trimmed);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const suggestions = query.length > 1
    ? MOCK_PRODUCTS
        .filter(p => {
          const name = p.translations[locale]?.name || p.translations["pt-PT"]?.name || '';
          return name.toLowerCase().includes(query.toLowerCase());
        })
        .slice(0, 5)
        .map(p => p.translations[locale]?.name || p.translations["pt-PT"]?.name || p.slug)
    : [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40" onClick={toggle}>
      <div
        className="bg-white shadow-lg border-b"
        onClick={e => e.stopPropagation()}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3 max-w-2xl mx-auto">
            <Search className="h-5 w-5 text-muted-foreground shrink-0" />
            <Input
              ref={inputRef}
              value={query}
              onChange={e => {
                setQuery(e.target.value);
                setShowDropdown(true);
              }}
              onKeyDown={e => { if (e.key === 'Enter') doSearch(query); }}
              onFocus={() => setShowDropdown(true)}
              placeholder={
                ({ "pt-PT": "Pesquisar produtos...", "fr-FR": "Rechercher des produits...", "es-ES": "Buscar productos...", "it-IT": "Cerca prodotti...", "nl-NL": "Zoek producten...", "de-DE": "Produkte suchen...", "fr-BE": "Rechercher...", "lb-LU": "Produkter sichen...", "pt-BR": "Pesquisar produtos..." } as Record<string, string>)[locale] || "Pesquisar produtos..."
              }
              className="border-0 shadow-none text-lg h-12 focus-visible:ring-0 px-0"
            />
            <button onClick={toggle} className="p-1 hover:bg-muted rounded-sm">
              <X className="h-5 w-5" />
            </button>
          </div>

          {showDropdown && (suggestions.length > 0 || recent.length > 0) && (
            <div className="max-w-2xl mx-auto mt-2 bg-white border rounded-lg shadow-lg overflow-hidden">
              {suggestions.length > 0 && (
                <div className="py-2">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      className="w-full text-left px-4 py-2 hover:bg-muted/50 text-sm flex items-center gap-2"
                      onClick={() => doSearch(s)}
                    >
                      <Search className="h-3.5 w-3.5 text-muted-foreground" />
                      {s}
                    </button>
                  ))}
                </div>
              )}
              {query.length <= 1 && recent.length > 0 && (
                <div className="py-2">
                  <p className="px-4 py-1 text-xs font-medium text-muted-foreground uppercase">
                    {({ "pt-PT": "Pesquisas recentes", "fr-FR": "Recherches récentes", "es-ES": "Búsquedas recientes", "it-IT": "Ricerche recenti", "nl-NL": "Recente zoekopdrachten", "de-DE": "Letzte Suchen", "fr-BE": "Recherches récentes", "lb-LU": "Rezent Sichen", "pt-BR": "Pesquisas recentes" } as Record<string, string>)[locale] || "Pesquisas recentes"}
                  </p>
                  {recent.map((r, i) => (
                    <button
                      key={i}
                      className="w-full text-left px-4 py-2 hover:bg-muted/50 text-sm flex items-center gap-2"
                      onClick={() => doSearch(r)}
                    >
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
