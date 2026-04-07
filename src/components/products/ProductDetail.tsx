'use client';

import { useState } from 'react';
import { ArrowLeft, Minus, Plus, ShoppingCart, Truck, Shield, Check, Star, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCartStore, useLocaleStore, useNavStore } from '@/lib/store';
import { MOCK_PRODUCTS, PRODUCT_CATEGORIES_MAP } from '@/lib/mock-data';
import { DELIVERY_CONFIG } from '@/lib/constants';
import Breadcrumb from '../shared/Breadcrumb';
import ProductCard from './ProductCard';
import { motion } from 'framer-motion';
import Image from 'next/image';

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
  const productImage = product.images?.[0]?.url || '';

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
  const relatedProducts = MOCK_PRODUCTS.filter(p => relatedProductIds.includes(p.id) && p.id !== product.id).slice(0, 4);

  const handleAdd = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name,
      image: productImage,
      price: product.price,
      originalPrice: product.originalPrice,
      stockCount: product.stockCount,
    }, quantity);
  };

  const stockLabel = product.stockCount > 10
    ? (locale === 'pt-PT' ? 'Em stock' : 'In stock')
    : product.stockCount > 0
    ? (locale === 'pt-PT' ? `Últimas ${product.stockCount} unidades` : `Last ${product.stockCount} units`)
    : (locale === 'pt-PT' ? 'Esgotado' : 'Out of stock');

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white min-h-screen pb-20"
    >
      <div className="container mx-auto px-4 py-6">
        <Breadcrumb />

        <div className="mt-4 mb-8">
          <button
            onClick={() => navigate('home')}
            className="group flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Voltar à Loja
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          {/* Left: Image Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-square bg-gray-50 rounded-3xl overflow-hidden relative border border-gray-100 shadow-sm"
            >
              {productImage ? (
                <Image
                  src={productImage}
                  alt={name}
                  fill
                  className="object-contain p-12"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl font-black text-gray-200">
                  {name.charAt(0)}
                </div>
              )}
              
              <div className="absolute top-6 left-6 flex flex-col gap-3">
                {product.isOnSale && (
                  <Badge className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                    -{discount}% DESCONTO
                  </Badge>
                )}
                {product.isNew && (
                  <Badge className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                    NOVIDADE
                  </Badge>
                )}
              </div>

              <div className="absolute top-6 right-6 flex flex-col gap-3">
                <button className="h-12 w-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg text-gray-400 hover:text-red-500 transition-colors">
                  <Heart className="h-6 w-6" />
                </button>
                <button className="h-12 w-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg text-gray-400 hover:text-primary transition-colors">
                  <Share2 className="h-6 w-6" />
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right: Product Details */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">4.8 (124 Reviews)</span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">{name}</h1>
              
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${product.stockCount > 10 ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                  <div className={`h-2 w-2 rounded-full ${product.stockCount > 10 ? 'bg-green-600' : 'bg-amber-600'} animate-pulse`} />
                  {stockLabel}
                </div>
                <span className="text-xs text-gray-400 font-medium">REF: {product.sku}</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-3xl p-8 space-y-6">
              <div className="flex items-baseline gap-4">
                <span className="text-5xl font-black text-gray-900">{formatPrice(product.price)}</span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-400 line-through font-bold">{formatPrice(product.originalPrice)}</span>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-white border border-gray-200 rounded-2xl p-1 shadow-sm">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-12 w-12 flex items-center justify-center hover:bg-gray-50 transition-colors rounded-xl text-gray-500"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                    <span className="w-12 text-center font-black text-lg">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}
                      className="h-12 w-12 flex items-center justify-center hover:bg-gray-50 transition-colors rounded-xl text-gray-500"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <Button
                    onClick={handleAdd}
                    disabled={product.stockCount === 0}
                    className="flex-1 bg-primary hover:bg-primary/90 text-white h-14 text-lg font-black rounded-2xl shadow-xl shadow-primary/20 gap-3"
                  >
                    <ShoppingCart className="h-6 w-6" />
                    Adicionar ao Carrinho
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Entrega</span>
                    <span className="text-xs font-bold text-gray-900">{DELIVERY_CONFIG.estimatedDays} dias úteis</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="h-10 w-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Segurança</span>
                    <span className="text-xs font-bold text-gray-900">Compra Protegida</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Descrição</h3>
                <p className="text-gray-500 leading-relaxed">{description}</p>
              </div>

              {product.attributes.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Especificações</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {product.attributes.map((attr, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase">{attr.name}</span>
                        <span className="text-sm font-bold text-gray-900">{attr.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-gray-100 pt-20">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-black text-gray-900">Poderá também gostar</h2>
              <Button variant="ghost" className="font-bold text-primary gap-2">
                Ver tudo <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
