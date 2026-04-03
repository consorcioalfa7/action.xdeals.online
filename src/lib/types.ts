export type Currency = "EUR" | "BRL";

export interface Country {
  id: string;
  code: string;
  locale: string;
  name: string;
  flag: string;
  currency: Currency;
  domain: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  slug: string;
  icon: string;
  sortOrder: number;
  parentId: string | null;
  children?: Category[];
}

export interface ProductImage {
  url: string;
  alt: string;
}

export interface ProductAttribute {
  name: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  ean?: string;
  price: number;
  originalPrice?: number;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isOnSale: boolean;
  stockCount: number;
  images: ProductImage[];
  attributes: ProductAttribute[];
  translations: Record<string, ProductTranslation>;
}

export interface ProductTranslation {
  name: string;
  description?: string;
  shortDesc?: string;
  metaTitle?: string;
  metaDesc?: string;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  stockCount: number;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  position: string;
}

export type ViewType = "home" | "category" | "product" | "cart" | "checkout" | "search";

export interface AppState {
  view: ViewType;
  categorySlug?: string;
  productSlug?: string;
  searchQuery?: string;
}

export interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}
