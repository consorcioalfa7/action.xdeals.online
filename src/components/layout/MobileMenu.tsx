'use client';

import { X, ChevronDown } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { CATEGORIES } from '@/lib/constants';
import { useNavStore, useLocaleStore, useUIStore } from '@/lib/store';
import CountrySelector from './CountrySelector';

export default function MobileMenu() {
  const isOpen = useUIStore(s => s.isMobileMenuOpen);
  const toggle = useUIStore(s => s.toggleMobileMenu);
  const locale = useLocaleStore(s => s.country.locale);
  const navigate = useNavStore(s => s.navigate);
  const goHome = useNavStore(s => s.goHome);

  return (
    <Sheet open={isOpen} onOpenChange={toggle}>
      <SheetContent side="left" className="w-80 p-0 overflow-y-auto custom-scrollbar">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2 text-primary text-xl font-black tracking-tight">
            ACTION
          </SheetTitle>
          <SheetDescription className="sr-only">Menu de navegação</SheetDescription>
        </SheetHeader>

        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-muted-foreground uppercase">
              {locale === 'pt-PT' ? 'País / Região' : locale === 'fr-FR' ? 'Pays / Région' : locale === 'es-ES' ? 'País / Región' : locale === 'de-DE' ? 'Land / Region' : 'Country'}
            </span>
            <CountrySelector />
          </div>
          <Separator className="mb-2" />
        </div>

        <Accordion type="single" collapsible className="px-4">
          {CATEGORIES.map((cat) => (
            <AccordionItem key={cat.slug} value={cat.slug} className="border-b-0">
              <AccordionTrigger
                className="py-3 hover:no-underline text-sm font-medium"
                onClick={() => navigate('category', cat.slug)}
              >
                <span className="flex items-center gap-2">
                  {cat.label[locale] || cat.label['pt-PT']}
                </span>
              </AccordionTrigger>
              {cat.children && cat.children.length > 0 && (
                <AccordionContent>
                  <div className="space-y-1 pb-2">
                    {cat.children.map((child) => (
                      <button
                        key={child.slug}
                        onClick={() => {
                          navigate('category', cat.slug);
                          toggle();
                        }}
                        className="w-full text-left text-sm text-muted-foreground hover:text-primary py-1.5 pl-2 transition-colors"
                      >
                        {child.label[locale] || child.label['pt-PT']}
                      </button>
                    ))}
                  </div>
                </AccordionContent>
              )}
            </AccordionItem>
          ))}
        </Accordion>

        <Separator className="my-2" />

        <div className="px-4 py-2 space-y-1">
          <button
            onClick={() => { navigate('weekly'); toggle(); }}
            className="w-full text-left text-sm font-medium text-primary py-2 hover:bg-orange-50 rounded-sm px-2 transition-colors"
          >
            {locale === 'pt-PT' ? '🔥 Ofertas da Semana' : locale === 'fr-FR' ? '🔥 Offres de la Semaine' : locale === 'es-ES' ? '🔥 Ofertas de la Semana' : locale === 'de-DE' ? '🔥 Wochenangebote' : '🔥 Weekly Deals'}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
