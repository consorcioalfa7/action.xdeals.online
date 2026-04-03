'use client';

import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from './ProductCard';
import EmptyState from '../shared/EmptyState';
import type { Product } from '@/lib/types';

interface ProductGridProps {
  products: Product[];
  title?: string;
  loading?: boolean;
}

export default function ProductGrid({ products, title, loading }: ProductGridProps) {
  if (loading) {
    return (
      <div>
        {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border rounded-xl overflow-hidden">
              <Skeleton className="aspect-square" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-5 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        title="Sem produtos"
        description="Não foram encontrados produtos nesta categoria."
      />
    );
  }

  return (
    <div>
      {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
