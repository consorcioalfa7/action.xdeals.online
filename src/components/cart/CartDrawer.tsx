'use client';

import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useUIStore, useCartStore, useLocaleStore, useNavStore } from '@/lib/store';
import { DELIVERY_CONFIG } from '@/lib/constants';
import EmptyState from '../shared/EmptyState';

export default function CartDrawer() {
  const isOpen = useUIStore(s => s.isCartOpen);
  const setOpen = useUIStore(s => s.setCartOpen);
  const items = useCartStore(s => s.items);
  const removeItem = useCartStore(s => s.removeItem);
  const updateQuantity = useCartStore(s => s.updateQuantity);
  const getSubtotal = useCartStore(s => s.getSubtotal);
  const getShippingCost = useCartStore(s => s.getShippingCost);
  const getTotal = useCartStore(s => s.getTotal);
  const locale = useLocaleStore(s => s.country.locale);
  const formatPrice = useLocaleStore(s => s.formatPrice);
  const navigate = useNavStore(s => s.navigate);

  const subtotal = getSubtotal();
  const shipping = getShippingCost();
  const total = getTotal();
  const freeDeliveryThreshold = DELIVERY_CONFIG.freeDeliveryThreshold;
  const progress = Math.min((subtotal / freeDeliveryThreshold) * 100, 100);
  const remaining = Math.max(freeDeliveryThreshold - subtotal, 0);

  const labels: Record<string, Record<string, string>> = {
    title: { "pt-PT": "Carrinho", "fr-FR": "Panier", "es-ES": "Carrito", "de-DE": "Warenkorb", "nl-NL": "Winkelwagen", "it-IT": "Carrello", "pt-BR": "Carrinho" },
    empty: { "pt-PT": "O seu carrinho está vazio", "fr-FR": "Votre panier est vide", "es-ES": "Tu carrito está vacío", "de-DE": "Ihr Warenkorb ist leer", "nl-NL": "Uw winkelwagen is leeg", "pt-BR": "Seu carrinho está vazio" },
    emptyDesc: { "pt-PT": "Adicione produtos para começar a comprar.", "fr-FR": "Ajoutez des produits pour commencer vos achats.", "es-ES": "Añade productos para empezar a comprar.", "de-DE": "Fügen Sie Produkte hinzu, um einzukaufen.", "nl-NL": "Voeg producten toe om te beginnen met winkelen.", "pt-BR": "Adicione produtos para começar a comprar." },
    start: { "pt-PT": "Começar a comprar", "fr-FR": "Commencer les achats", "es-ES": "Empezar a comprar", "de-DE": "Einkauf starten", "nl-NL": "Begin met winkelen", "pt-BR": "Começar a comprar" },
    subtotal: { "pt-PT": "Subtotal", "fr-FR": "Sous-total", "es-ES": "Subtotal", "de-DE": "Zwischensumme", "nl-NL": "Subtotaal", "pt-BR": "Subtotal" },
    shipping: { "pt-PT": "Envio", "fr-FR": "Livraison", "es-ES": "Envío", "de-DE": "Versand", "nl-NL": "Bezorging", "pt-BR": "Frete" },
    shippingFree: { "pt-PT": "Grátis", "fr-FR": "Gratuit", "es-ES": "Gratis", "de-DE": "Kostenlos", "nl-NL": "Gratis", "pt-BR": "Grátis" },
    total: { "pt-PT": "Total", "fr-FR": "Total", "es-ES": "Total", "de-DE": "Gesamt", "nl-NL": "Totaal", "pt-BR": "Total" },
    checkout: { "pt-PT": "Comprar", "fr-FR": "Commander", "es-ES": "Comprar", "de-DE": "Bestellen", "nl-NL": "Bestellen", "pt-BR": "Comprar" },
    freeDelivery: { "pt-PT": "Faltam apenas {amount} para entrega grátis!", "fr-FR": "Il ne manque que {amount} pour la livraison gratuite!", "es-ES": "¡Solo faltan {amount} para envío gratis!", "de-DE": "Noch {amount} bis kostenloser Versand!", "nl-NL": "Nog {amount} voor gratis bezorging!", "pt-BR": "Faltam apenas {amount} para entrega grátis!" },
    gotFreeDelivery: { "pt-PT": "🎉 Parabéns! Tem entrega grátis!", "fr-FR": "🎉 Félicitations! Livraison gratuite!", "es-ES": "🎉 ¡Felicidades! ¡Tienes envío gratis!", "de-DE": "🎉 Glückwunsch! Kostenloser Versand!", "nl-NL": "🎉 Gefeliciteerd! Gratis bezorging!", "pt-BR": "🎉 Parabéns! Entrega grátis!" },
    freeDeliveryAbove: { "pt-PT": `Entrega grátis acima de ${formatPrice(freeDeliveryThreshold)}`, "fr-FR": `Livraison gratuite dès ${formatPrice(freeDeliveryThreshold)}`, "es-ES": `Envío gratis desde ${formatPrice(freeDeliveryThreshold)}`, "de-DE": `Kostenloser Versand ab ${formatPrice(freeDeliveryThreshold)}`, "nl-NL": `Gratis bezorging vanaf ${formatPrice(freeDeliveryThreshold)}`, "pt-BR": `Entrega grátis acima de ${formatPrice(freeDeliveryThreshold)}` },
    items: { "pt-PT": "itens", "fr-FR": "articles", "es-ES": "artículos", "de-DE": "Artikel", "nl-NL": "artikelen", "pt-BR": "itens" },
  };

  const t = (key: string, replacements?: Record<string, string>) => {
    let text = labels[key]?.[locale] || labels[key]?.['pt-PT'] || key;
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => { text = text.replace(`{${k}}`, v); });
    }
    return text;
  };

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-4 border-b shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            {t('title')} ({items.length} {t('items')})
          </SheetTitle>
          <SheetDescription className="sr-only">Carrinho de compras</SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <EmptyState
              icon={<ShoppingBag className="h-16 w-16" strokeWidth={1} />}
              title={t('empty')}
              description={t('emptyDesc')}
              ctaText={t('start')}
              onCtaClick={() => { setOpen(false); navigate('home'); }}
            />
          </div>
        ) : (
          <>
            {/* Free Delivery Progress */}
            <div className="px-4 py-3 bg-orange-50 border-b shrink-0">
              {remaining > 0 ? (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Truck className="h-4 w-4 text-primary" />
                    <p className="text-xs font-medium text-gray-700">
                      {t('freeDelivery', { amount: formatPrice(remaining) })}
                    </p>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-green-700">{t('gotFreeDelivery')}</p>
                </div>
              )}
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
              {items.map(item => (
                <div key={item.productId} className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  {/* Product image placeholder */}
                  <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center shrink-0">
                    <span className="text-xl font-bold text-gray-300">{item.name.charAt(0)}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium line-clamp-2 leading-tight">{item.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold">{formatPrice(item.price)}</span>
                      {item.originalPrice && (
                        <span className="text-xs text-muted-foreground line-through">{formatPrice(item.originalPrice)}</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border rounded-md">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="h-7 w-7 flex items-center justify-center hover:bg-muted transition-colors rounded-l-md"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="h-7 w-8 flex items-center justify-center text-sm font-medium border-x">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="h-7 w-7 flex items-center justify-center hover:bg-muted transition-colors rounded-r-md"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals & Checkout */}
            <div className="border-t p-4 space-y-3 shrink-0 bg-gray-50/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('subtotal')}</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('shipping')}</span>
                <span className="font-medium text-green-600">{shipping === 0 ? t('shippingFree') : formatPrice(shipping)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-lg font-bold">
                <span>{t('total')}</span>
                <span>{formatPrice(total)}</span>
              </div>
              <Button
                onClick={() => { setOpen(false); navigate('checkout'); }}
                className="w-full bg-primary hover:bg-primary/90 text-white h-12 font-semibold rounded-lg"
              >
                {t('checkout')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
