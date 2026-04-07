'use client';

import { CATEGORIES } from '@/lib/constants';
import { useNavStore, useLocaleStore } from '@/lib/store';
import { motion } from 'framer-motion';
import {
  ShoppingCart, Home, Wrench, Flower2, PawPrint, Sparkles,
  Gamepad2, Shirt, PenTool, Apple, Milk, Beef, Wine, Snowflake, Package, Cookie,
  BedDouble, UtensilsCrossed, Lamp, Paintbrush, Archive, Hammer, Zap, PaintBucket, Link,
  Sprout, Shovel, Armchair, Dog, Bone, Droplets, SprayCan, FlaskConical,
  Baby, Bike, Puzzle, User, UserRound, Footprints, GraduationCap, Monitor, ShoppingBag
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
    <section className="py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">
            <ShoppingBag className="h-3 w-3" />
            Explorar Categorias
          </div>
          <h2 className="text-4xl font-black text-gray-900">O que procura hoje?</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {CATEGORIES.map((cat, idx) => {
          const IconComp = ICON_MAP[cat.icon] || ShoppingCart;
          const label = cat.label[locale] || cat.label['pt-PT'];
          return (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.03 }}
              onClick={() => navigate('category', cat.slug)}
              className="group cursor-pointer"
            >
              <div className="relative aspect-square rounded-[2.5rem] bg-gray-50 border border-gray-100 flex flex-col items-center justify-center p-6 transition-all duration-500 group-hover:bg-white group-hover:shadow-2xl group-hover:shadow-primary/10 group-hover:-translate-y-2 group-hover:border-primary/20">
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-3xl bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-primary group-hover:scale-110 transition-all duration-500 mb-4 border border-gray-50">
                  <IconComp className="h-8 w-8 md:h-10 md:w-10" />
                </div>
                <h3 className="text-xs md:text-sm font-black text-gray-900 text-center group-hover:text-primary transition-colors leading-tight line-clamp-2">
                  {label}
                </h3>
                
                <div className="absolute bottom-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="h-1 w-8 bg-primary rounded-full" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
