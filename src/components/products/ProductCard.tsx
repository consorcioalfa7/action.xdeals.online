'use client';

import { ShoppingCart, Eye, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore, useLocaleStore, useNavStore } from '@/lib/store';
import type { Product } from '@/lib/types';
import { motion } from 'framer-motion';
import Image from 'next/image';

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

  const productImage = product.images?.[0]?.url || '';

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      productId: product.id,
      slug: product.slug,
      name,
      image: productImage,
      price: product.price,
      originalPrice: product.originalPrice,
      stockCount: product.stockCount,
    });
  };

  const stockText = locale === 'pt-PT' ? 'Em stock' : locale === 'fr-FR' ? 'En stock' : locale === 'de-DE' ? 'Auf Lager' : locale === 'nl-NL' ? 'Op voorraad' : locale === 'es-ES' ? 'En stock' : 'In stock';
  const lowStockText = locale === 'pt-PT' ? 'Últimas unidades' : locale === 'fr-FR' ? 'Dernières unités' : locale === 'de-DE' ? 'Letzte Stücke' : locale === 'nl-NL' ? 'Laatste stuks' : locale === 'es-ES' ? 'Últimas unidades' : 'Last units';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      onClick={() => navigate('product', product.slug)}
      className="group bg-white border border-gray-100 rounded-2xl overflow-hidden cursor-pointer relative shadow-sm hover:shadow-xl transition-all duration-300"
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {product.isOnSale && (
          <Badge className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            {discount > 0 ? `-${discount}%` : 'OFERTA'}
          </Badge>
        )}
        {product.isNew && !product.isOnSale && (
          <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            NOVO
          </Badge>
        )}
      </div>

      {/* Action Buttons */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
        <button
          onClick={(e) => { e.stopPropagation(); }}
          className="h-9 w-9 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white shadow-md transition-colors"
        >
          <Heart className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); navigate('product', product.slug); }}
          className="h-9 w-9 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-gray-400 hover:text-primary hover:bg-white shadow-md transition-colors"
        >
          <Eye className="h-4 w-4" />
        </button>
      </div>

      {/* Image Container */}
      <div className="aspect-[4/5] bg-gray-50 overflow-hidden relative">
        {productImage ? (
          <Image
            src={productImage}
            alt={name}
            fill
            className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-4xl font-bold text-gray-200">{name.charAt(0)}</span>
          </div>
        )}
        
        {/* Quick Add Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/20 to-transparent">
          <Button
            onClick={handleAdd}
            disabled={product.stockCount === 0}
            className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg flex items-center gap-2 py-6"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="font-semibold">Adicionar ao Carrinho</span>
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="mb-1">
          {product.stockCount > 10 ? (
            <span className="text-[10px] uppercase tracking-wider text-green-600 font-bold">{stockText}</span>
          ) : product.stockCount > 0 ? (
            <span className="text-[10px] uppercase tracking-wider text-amber-600 font-bold">{lowStockText}</span>
          ) : (
            <span className="text-[10px] uppercase tracking-wider text-red-500 font-bold">Esgotado</span>
          )}
        </div>
        
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-1 group-hover:text-primary transition-colors min-h-[2.5rem]">
          {name}
        </h3>
        
        {shortDesc && (
          <p className="text-xs text-gray-500 line-clamp-1 mb-3">{shortDesc}</p>
        )}

        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-xl font-black text-gray-900">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through font-medium">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          
          {/* Mobile Add Button */}
          <button
            onClick={handleAdd}
            disabled={product.stockCount === 0}
            className="md:hidden h-10 w-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-md active:scale-95 transition-transform"
          >
            <ShoppingCart className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
