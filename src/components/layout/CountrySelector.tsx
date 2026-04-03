'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs font-medium text-white/90 hover:text-white transition-colors"
      >
        <Globe className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{country.flag} {country.code}</span>
        <span className="sm:hidden">{country.flag}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 bg-white border rounded-lg shadow-xl z-50 py-1 min-w-[180px] max-h-80 overflow-y-auto custom-scrollbar">
          {COUNTRIES.filter(c => c.isActive).map(c => (
            <button
              key={c.id}
              onClick={() => { setCountry(c); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-orange-50 transition-colors ${
                c.id === country.id ? 'bg-orange-50 text-primary font-medium' : 'text-gray-700'
              }`}
            >
              <span className="text-lg">{c.flag}</span>
              <span>{c.name}</span>
              {c.id === country.id && <span className="ml-auto text-primary">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
