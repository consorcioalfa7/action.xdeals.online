'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, Sparkles, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavStore, useLocaleStore } from '@/lib/store';
import { MOCK_BANNERS } from '@/lib/mock-data';
import useEmblaCarousel from 'embla-carousel-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HeroBanner() {
  const locale = useLocaleStore(s => s.country.locale);
  const navigate = useNavStore(s => s.navigate);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 30 });

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(scrollNext, 6000);
    return () => clearInterval(interval);
  }, [emblaApi, scrollNext]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    emblaApi?.scrollTo(index);
  }, [emblaApi]);

  return (
    <div className="relative group">
      <div ref={emblaRef} className="overflow-hidden rounded-[2.5rem] shadow-2xl shadow-primary/10">
        <div className="flex">
          {MOCK_BANNERS.map((banner, index) => (
            <div key={banner.id} className="min-w-0 shrink-0 grow-0 basis-full">
              <div className={`relative min-h-[450px] md:min-h-[550px] bg-gradient-to-br ${banner.gradient} overflow-hidden flex items-center`}>
                
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, 0],
                      opacity: [0.1, 0.2, 0.1] 
                    }}
                    transition={{ duration: 15, repeat: Infinity }}
                    className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-white rounded-full blur-[100px]" 
                  />
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.3, 1],
                      x: [0, 50, 0],
                      opacity: [0.05, 0.1, 0.05] 
                    }}
                    transition={{ duration: 20, repeat: Infinity, delay: 2 }}
                    className="absolute -bottom-40 -left-20 w-[600px] h-[600px] bg-primary rounded-full blur-[120px]" 
                  />
                </div>

                <div className="container mx-auto px-8 md:px-16 z-10">
                  <AnimatePresence mode="wait">
                    {selectedIndex === index && (
                      <div className="max-w-2xl text-white">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.2 }}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6"
                        >
                          <Sparkles className="h-4 w-4 text-amber-300" />
                          <span className="text-xs font-black uppercase tracking-[0.2em]">Ofertas Exclusivas 2026</span>
                        </motion.div>

                        <motion.h2 
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.4 }}
                          className="text-5xl md:text-7xl font-black mb-6 leading-[1.1] tracking-tight"
                        >
                          {banner.title}
                        </motion.h2>

                        <motion.p 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.6 }}
                          className="text-lg md:text-xl text-white/80 mb-10 max-w-lg font-medium leading-relaxed"
                        >
                          {banner.subtitle}
                        </motion.p>

                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.8 }}
                          className="flex flex-wrap gap-4"
                        >
                          <Button
                            onClick={() => {
                              if (banner.link === 'weekly') navigate('weekly');
                              else if (banner.link === 'category' && banner.linkSlug) navigate('category', banner.linkSlug);
                              else if (banner.link === 'home') window.scrollTo({ top: 800, behavior: 'smooth' });
                            }}
                            className="bg-white text-gray-900 hover:bg-gray-100 font-black px-10 h-16 rounded-2xl text-lg shadow-xl shadow-black/10 group/btn"
                          >
                            <ShoppingBag className="mr-2 h-5 w-5" />
                            {banner.ctaText[locale] || banner.ctaText['pt-PT']}
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Banner Badge */}
                <div className="absolute bottom-12 right-12 hidden lg:block">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="relative w-32 h-32 flex items-center justify-center"
                  >
                    <svg viewBox="0 0 100 100" className="w-full h-full fill-white/20">
                      <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="transparent" />
                      <text className="text-[10px] font-black uppercase tracking-[0.3em]">
                        <textPath xlinkHref="#circlePath">A Melhor Qualidade • Preços Incríveis • </textPath>
                      </text>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-primary font-black text-xl">X</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 bg-black/10 backdrop-blur-md rounded-full">
        {MOCK_BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className={`h-2.5 rounded-full transition-all duration-500 ${
              i === selectedIndex ? 'w-10 bg-white' : 'w-2.5 bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
      
      {/* Side Controls (Desktop) */}
      <button 
        onClick={() => emblaApi?.scrollPrev()}
        className="absolute left-6 top-1/2 -translate-y-1/2 h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-gray-900 shadow-xl"
      >
        <ChevronRight className="h-6 w-6 rotate-180" />
      </button>
      <button 
        onClick={() => emblaApi?.scrollNext()}
        className="absolute right-6 top-1/2 -translate-y-1/2 h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-gray-900 shadow-xl"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  );
}
