'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { useNavStore, useLocaleStore } from '@/lib/store';
import { MOCK_BANNERS } from '@/lib/mock-data';
import useEmblaCarousel from 'embla-carousel-react';

export default function HeroBanner() {
  const locale = useLocaleStore(s => s.country.locale);
  const navigate = useNavStore(s => s.navigate);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const scroll = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(scroll, 5000);
    return () => clearInterval(interval);
  }, [emblaApi, scroll]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const handler = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    handler();
    emblaApi.on('select', handler);
    return () => { emblaApi.off('select', handler); };
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    emblaApi?.scrollTo(index);
  }, [emblaApi]);

  return (
    <div className="relative">
      <div ref={emblaRef} className="overflow-hidden rounded-xl">
        <div className="flex">
          {MOCK_BANNERS.map((banner) => (
            <div key={banner.id} className="min-w-0 shrink-0 grow-0 basis-full">
              <div className={`relative bg-gradient-to-r ${banner.gradient} rounded-xl overflow-hidden`}>
                <div className="container mx-auto px-4 py-12 md:py-20 lg:py-24 flex items-center">
                  <div className="max-w-lg text-white z-10">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-3 md:mb-4 leading-tight">
                      {banner.title}
                    </h2>
                    <p className="text-base md:text-lg text-white/90 mb-6">
                      {banner.subtitle}
                    </p>
                    <Button
                      onClick={() => {
                        if (banner.link === 'weekly') navigate('weekly');
                        else if (banner.link === 'category' && banner.linkSlug) navigate('category', banner.linkSlug);
                        else if (banner.link === 'home') window.scrollTo({ top: 400, behavior: 'smooth' });
                      }}
                      className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-6 h-11 rounded-lg"
                    >
                      {banner.ctaText[locale] || banner.ctaText['pt-PT']}
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {/* Decorative circles */}
                <div className="absolute top-4 right-4 w-32 h-32 bg-white/10 rounded-full hidden md:block" />
                <div className="absolute bottom-8 right-16 w-48 h-48 bg-white/5 rounded-full hidden md:block" />
                <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-white/5 rounded-full hidden lg:block" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {MOCK_BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className={`h-2 rounded-full transition-all ${
              i === selectedIndex ? 'w-8 bg-primary' : 'w-2 bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
