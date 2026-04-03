'use client';

import { useState } from 'react';
import { ArrowLeft, Minus, Plus, ShoppingCart, Truck, Shield, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCartStore, useLocaleStore, useNavStore } from '@/lib/store';
import { MOCK_PRODUCTS, PRODUCT_CATEGORIES_MAP } from '@/lib/mock-data';
import { DELIVERY_CONFIG } from '@/lib/constants';
import Breadcrumb from '../shared/Breadcrumb';
import ProductCard from './ProductCard';
import type { Product } from '@/lib/types';

export default function ProductDetail() {
  const productSlug = useNavStore(s => s.productSlug);
  const navigate = useNavStore(s => s.navigate);
  const locale = useLocaleStore(s => s.country.locale);
  const formatPrice = useLocaleStore(s => s.formatPrice);
  const addItem = useCartStore(s => s.addItem);

  const [quantity, setQuantity] = useState(1);

  const product = MOCK_PRODUCTS.find(p => p.slug === productSlug);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-semibold mb-4">Produto não encontrado</h2>
        <Button onClick={() => navigate('home')} variant="outline">Voltar</Button>
      </div>
    );
  }

  const name = product.translations[locale]?.name || product.translations['pt-PT']?.name || product.slug;
  const description = product.translations[locale]?.description || product.translations['pt-PT']?.description || '';
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

  // Find related products
  const findCategory = (productId: string) => {
    for (const [cat, prods] of Object.entries(PRODUCT_CATEGORIES_MAP)) {
      if (prods.includes(productId)) return cat;
    }
    return null;
  };

  const category = findCategory(product.id);
  const relatedProductIds = category ? PRODUCT_CATEGORIES_MAP[category] || [] : [];
  const relatedProducts = MOCK_PRODUCTS.filter(p => relatedProductIds.includes(p.id) && p.id !== product.id).slice(0, 5);

  const handleAdd = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name,
      image: '',
      price: product.price,
      originalPrice: product.originalPrice,
      stockCount: product.stockCount,
    }, quantity);
  };

  const stockLabel = product.stockCount > 10
    ? (locale === 'pt-PT' ? 'Em stock' : locale === 'fr-FR' ? 'En stock' : locale === 'de-DE' ? 'Auf Lager' : locale === 'nl-NL' ? 'Op voorraad' : 'In stock')
    : product.stockCount > 0
    ? (locale === 'pt-PT' ? `Últimas ${product.stockCount} unidades` : locale === 'fr-FR' ? `Dernières ${product.stockCount} unités` : `Last ${product.stockCount} units`)
    : (locale === 'pt-PT' ? 'Esgotado' : 'Out of stock');

  return (
    <div className="page-transition">
      <div className="container mx-auto px-4 py-6">
        <Breadcrumb />

        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          {locale === 'pt-PT' ? 'Voltar' : locale === 'fr-FR' ? 'Retour' : locale === 'de-DE' ? 'Zurück' : locale === 'nl-NL' ? 'Terug' : locale === 'es-ES' ? 'Volver' : 'Back'}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className={`aspect-square bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center relative`}>
            <span className="text-8xl font-black text-gray-300 select-none">{initial}</span>
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isOnSale && (
                <Badge className="bg-red-500 hover:bg-red-500 text-white text-xs">OFERTA -{discount}%</Badge>
              )}
              {product.isNew && (
                <Badge className="bg-blue-500 hover:bg-blue-500 text-white text-xs">NOVO</Badge>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{name}</h1>
            {shortDesc && <p className="text-muted-foreground mb-4">{shortDesc}</p>}

            {/* Stock */}
            <div className="mb-4">
              <span className={`text-sm font-medium ${product.stockCount > 10 ? 'text-green-600' : product.stockCount > 0 ? 'text-amber-600' : 'text-red-500'}`}>
                {product.stockCount > 0 && <span className="mr-1">●</span>}
                {stockLabel}
              </span>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3 mb-6">
              <span className="text-3xl font-black text-gray-900">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through mb-0.5">{formatPrice(product.originalPrice)}</span>
              )}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium">
                {locale === 'pt-PT' ? 'Quantidade:' : locale === 'fr-FR' ? 'Quantité:' : locale === 'de-DE' ? 'Menge:' : locale === 'nl-NL' ? 'Aantal:' : locale === 'es-ES' ? 'Cantidad:' : 'Quantity:'}
              </span>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-10 w-10 flex items-center justify-center hover:bg-muted transition-colors rounded-l-lg"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="h-10 w-12 flex items-center justify-center font-semibold border-x">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}
                  className="h-10 w-10 flex items-center justify-center hover:bg-muted transition-colors rounded-r-lg"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <Button
              onClick={handleAdd}
              disabled={product.stockCount === 0}
              className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-base font-semibold rounded-lg mb-6"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {locale === 'pt-PT' ? 'Adicionar ao Carrinho' : locale === 'fr-FR' ? 'Ajouter au panier' : locale === 'de-DE' ? 'In den Warenkorb' : locale === 'nl-NL' ? 'Toevoegen aan winkelwagen' : locale === 'es-ES' ? 'Añadir al carrito' : locale === 'pt-BR' ? 'Adicionar ao Carrinho' : 'Add to Cart'}
            </Button>

            <Separator className="my-6" />

            {/* Delivery Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Truck className="h-5 w-5 text-primary" />
                <span>{locale === 'pt-PT' ? `Entrega em ${DELIVERY_CONFIG.estimatedDays} dias úteis` : `Delivery in ${DELIVERY_CONFIG.estimatedDays} business days`}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="h-5 w-5 text-primary" />
                <span>{locale === 'pt-PT' ? `Grátis acima de ${formatPrice(DELIVERY_CONFIG.freeDeliveryThreshold)}` : `Free above ${formatPrice(DELIVERY_CONFIG.freeDeliveryThreshold)}`}</span>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Attributes / Specs */}
            {product.attributes.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3">
                  {locale === 'pt-PT' ? 'Especificações' : locale === 'fr-FR' ? 'Spécifications' : locale === 'de-DE' ? 'Spezifikationen' : 'Specifications'}
                </h3>
                <div className="border rounded-lg overflow-hidden">
                  {product.attributes.map((attr, i) => (
                    <div key={i} className={`flex ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                      <div className="w-1/3 px-4 py-2.5 text-sm text-muted-foreground font-medium border-r">
                        {attr.name}
                      </div>
                      <div className="w-2/3 px-4 py-2.5 text-sm">
                        {attr.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator className="my-6" />

            {/* Description */}
            {description && (
              <div>
                <h3 className="text-sm font-semibold mb-2">
                  {locale === 'pt-PT' ? 'Descrição' : locale === 'fr-FR' ? 'Description' : locale === 'de-DE' ? 'Beschreibung' : 'Description'}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">
              {locale === 'pt-PT' ? 'Produtos Relacionados' : locale === 'fr-FR' ? 'Produits similaires' : locale === 'de-DE' ? 'Ähnliche Produkte' : locale === 'nl-NL' ? 'Vergelijkbare producten' : 'Related Products'}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
