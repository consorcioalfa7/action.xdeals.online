'use client';

import { ShoppingCart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore, useLocaleStore, useNavStore } from '@/lib/store';
import type { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const locale = useLocaleStore(s => s.country.locale);
  const formatPrice = useLocaleStore(s => s.formatPrice);
  const addItem = useCartStore(s => s.addItem);
  const navigate = useNavStore(s => s.navigate);

  const name = product.translations[locale]?.name || product.translations['pt-PT']?.name || product.slug;
  const shortDesc = product.translations[locale]?.shortDesc || product.translations['pt-PT']?.shortDesc;

  const gradients = [
    'from-orange-100 to-orange-200',
    'from-blue-100 to-blue-200',
    'from-green-100 to-green-200',
    'from-purple-100 to-purple-200',
    'from-pink-100 to-pink-200',
    'from-amber-100 to-amber-200',
    'from-teal-100 to-teal-200',
    'from-red-100 to-red-200',
  ];
  const gradient = gradients[product.id.charCodeAt(product.id.length - 1) % gradients.length];
  const initial = name.charAt(0).toUpperCase();

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      productId: product.id,
      slug: product.slug,
      name,
      image: '',
      price: product.price,
      originalPrice: product.originalPrice,
      stockCount: product.stockCount,
    });
  };

  const stockText = locale === 'pt-PT' ? 'Em stock' : locale === 'fr-FR' ? 'En stock' : locale === 'de-DE' ? 'Auf Lager' : locale === 'nl-NL' ? 'Op voorraad' : locale === 'es-ES' ? 'En stock' : 'In stock';
  const lowStockText = locale === 'pt-PT' ? 'Últimas unidades' : locale === 'fr-FR' ? 'Dernières unités' : locale === 'de-DE' ? 'Letzte Stücke' : locale === 'nl-NL' ? 'Laatste stuks' : locale === 'es-ES' ? 'Últimas unidades' : 'Last units';

  return (
    <div
      onClick={() => navigate('product', product.slug)}
      className="product-card-hover group bg-white border rounded-xl overflow-hidden cursor-pointer relative"
    >
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {product.isOnSale && (
          <Badge className="bg-red-500 hover:bg-red-500 text-white text-[10px] px-1.5 py-0">
            OFERTA {discount > 0 ? `-${discount}%` : ''}
          </Badge>
        )}
        {product.isNew && !product.isOnSale && (
          <Badge className="bg-blue-500 hover:bg-blue-500 text-white text-[10px] px-1.5 py-0">
            NOVO
          </Badge>
        )}
      </div>

      {/* Quick View */}
      <button
        onClick={(e) => { e.stopPropagation(); navigate('product', product.slug); }}
        className="absolute top-2 right-2 z-10 h-8 w-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white shadow-sm"
      >
        <Eye className="h-4 w-4 text-gray-600" />
      </button>

      {/* Image Placeholder */}
      <div className={`aspect-square bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        <span className="text-4xl md:text-5xl font-black text-gray-300 select-none">{initial}</span>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-medium leading-tight line-clamp-2 mb-1.5 min-h-[2.5rem]">
          {name}
        </h3>
        {shortDesc && (
          <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{shortDesc}</p>
        )}

        {/* Stock */}
        <div className="mb-2">
          {product.stockCount > 10 ? (
            <span className="text-xs text-green-600 font-medium">{stockText}</span>
          ) : product.stockCount > 0 ? (
            <span className="text-xs text-amber-600 font-medium">{lowStockText}</span>
          ) : (
            <span className="text-xs text-red-500 font-medium">Esgotado</span>
          )}
        </div>

        {/* Price + Button */}
        <div className="flex items-end justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          <Button
            onClick={handleAdd}
            size="sm"
            disabled={product.stockCount === 0}
            className="bg-primary hover:bg-primary/90 text-white h-9 w-9 p-0 rounded-full shrink-0"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
