'use client';

import { CATEGORIES } from '@/lib/constants';
import { useNavStore, useLocaleStore } from '@/lib/store';

import {
  ShoppingCart, Home, Wrench, Flower2, PawPrint, Sparkles,
  Gamepad2, Shirt, PenTool, Apple, Milk, Beef, Wine, Snowflake, Package, Cookie,
  BedDouble, UtensilsCrossed, Lamp, Paintbrush, Archive, Hammer, Zap, PaintBucket, Link,
  Sprout, Shovel, Armchair, Dog, Bone, Droplets, SprayCan, FlaskConical,
  Baby, Bike, Puzzle, User, UserRound, Footprints, GraduationCap, Monitor,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  ShoppingCart, Home, Wrench, Flower2, PawPrint, Sparkles,
  Gamepad2, Shirt, PenTool, Apple, Milk, Beef, Wine, Snowflake, Package, Cookie,
  BedDouble, UtensilsCrossed, Lamp, Paintbrush, Archive, Hammer, Zap, PaintBucket, Link,
  Sprout, Shovel, Armchair, Dog, Bone, Droplets, SprayCan, FlaskConical,
  Baby, Bike, Puzzle, User, UserRound, Footprints, GraduationCap, Monitor,
};

export default function CategoryGrid() {
  const locale = useLocaleStore(s => s.country.locale);
  const navigate = useNavStore(s => s.navigate);

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold">
          {locale === 'pt-PT' ? 'Categorias' : locale === 'fr-FR' ? 'Catégories' : locale === 'es-ES' ? 'Categorías' : locale === 'de-DE' ? 'Kategorien' : locale === 'nl-NL' ? 'Categorieën' : locale === 'pt-BR' ? 'Categorias' : 'Categories'}
        </h2>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
        {CATEGORIES.map((cat) => {
          const IconComp = ICON_MAP[cat.icon] || ShoppingCart;
          const label = cat.label[locale] || cat.label['pt-PT'];
          return (
            <button
              key={cat.slug}
              onClick={() => navigate('category', cat.slug)}
              className="flex flex-col items-center gap-2 p-3 md:p-4 rounded-xl border bg-white hover:shadow-md hover:border-primary/20 transition-all group"
            >
              <div className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-orange-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <IconComp className="h-6 w-6 md:h-7 md:w-7" />
              </div>
              <span className="text-xs md:text-sm font-medium text-center leading-tight line-clamp-2">{label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
