'use client';

import { Truck, Clock, Shield } from 'lucide-react';
import { useLocaleStore } from '@/lib/store';
import { DELIVERY_CONFIG } from '@/lib/constants';

export default function DeliveryBanner() {
  const locale = useLocaleStore(s => s.country.locale);
  const formatPrice = useLocaleStore(s => s.formatPrice);

  const content: Record<string, { title: string; subtitle: string; items: { icon: React.ReactNode; text: string }[] }> = {
    "pt-PT": {
      title: "Entregas ao Domicílio",
      subtitle: "Receba os seus produtos na porta de casa",
      items: [
        { icon: <Truck className="h-5 w-5" />, text: `Grátis acima de ${formatPrice(DELIVERY_CONFIG.freeDeliveryThreshold)}` },
        { icon: <Clock className="h-5 w-5" />, text: `Taxa de ${formatPrice(DELIVERY_CONFIG.deliveryFee)} abaixo desse valor` },
        { icon: <Shield className="h-5 w-5" />, text: `Entrega estimada em ${DELIVERY_CONFIG.estimatedDays} dias úteis` },
      ],
    },
    "fr-FR": {
      title: "Livraison à Domicile",
      subtitle: "Recevez vos produits chez vous",
      items: [
        { icon: <Truck className="h-5 w-5" />, text: `Gratuit dès ${formatPrice(DELIVERY_CONFIG.freeDeliveryThreshold)}` },
        { icon: <Clock className="h-5 w-5" />, text: `Frais de ${formatPrice(DELIVERY_CONFIG.deliveryFee)} en dessous` },
        { icon: <Shield className="h-5 w-5" />, text: `Livraison estimée en ${DELIVERY_CONFIG.estimatedDays} jours ouvrés` },
      ],
    },
    default: {
      title: "Home Delivery",
      subtitle: "Get your products delivered to your door",
      items: [
        { icon: <Truck className="h-5 w-5" />, text: `Free above ${formatPrice(DELIVERY_CONFIG.freeDeliveryThreshold)}` },
        { icon: <Clock className="h-5 w-5" />, text: `${formatPrice(DELIVERY_CONFIG.deliveryFee)} fee below` },
        { icon: <Shield className="h-5 w-5" />, text: `Estimated ${DELIVERY_CONFIG.estimatedDays} business days` },
      ],
    },
  };

  const data = content[locale] || content["default"];

  return (
    <section className="py-8">
      <div className="delivery-banner rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 p-6 md:p-8">
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">{data.title}</h2>
          <p className="text-sm text-gray-500 mt-1">{data.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8">
          {data.items.map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-2 p-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                {item.icon}
              </div>
              <p className="text-sm font-medium text-gray-700">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
