'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { COUNTRIES } from '@/lib/constants';
import { useLocaleStore, useUIStore } from '@/lib/store';

export default function CountrySelector() {
  const [open, setOpen] = useState(false);
  const country = useLocaleStore(s => s.country);
  const setCountry = useLocaleStore(s => s.setCountry);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-flex items-center">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs font-medium text-white/90 hover:text-white transition-colors py-1"
      >
        <Globe className="h-3.5 w-3.5 shrink-0" />
        <span className="hidden sm:inline">{country.flag} {country.code}</span>
        <span className="sm:hidden">{country.flag}</span>
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-2xl z-[100] py-1 min-w-[200px] max-h-80 overflow-y-auto custom-scrollbar">
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            País / Região
          </div>
          {COUNTRIES.filter(c => c.isActive).map(c => (
            <button
              key={c.id}
              onClick={() => { setCountry(c); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-orange-50 transition-colors text-left ${
                c.id === country.id ? 'bg-orange-50 text-primary font-medium' : 'text-gray-700'
              }`}
            >
              <span className="text-base leading-none">{c.flag}</span>
              <span className="flex-1">{c.name}</span>
              <span className="text-xs text-gray-400">{c.currency}</span>
              {c.id === country.id && <span className="text-primary text-sm">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
