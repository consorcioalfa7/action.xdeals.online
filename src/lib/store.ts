import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Country, Currency } from "./types";
import { COUNTRIES, DEFAULT_COUNTRY, DELIVERY_CONFIG, CURRENCY_SYMBOLS, CURRENCY_LOCALES } from "./constants";

// ── Cart Store ────────────────────────────────────────────────
interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getSubtotal: () => number;
  getShippingCost: () => number;
  getItemCount: () => number;
  getItem: (productId: string) => CartItem | undefined;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, qty = 1) => {
        const items = get().items;
        const existing = items.find((i) => i.productId === item.productId);
        if (existing) {
          const newQty = Math.min(existing.quantity + qty, item.stockCount);
          set({
            items: items.map((i) =>
              i.productId === item.productId ? { ...i, quantity: newQty } : i
            ),
          });
        } else {
          set({ items: [...items, { ...item, quantity: Math.min(qty, item.stockCount) }] });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity: Math.min(quantity, i.stockCount) } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getShippingCost: () => {
        const subtotal = get().getSubtotal();
        if (subtotal >= DELIVERY_CONFIG.freeDeliveryThreshold || get().items.length === 0) return 0;
        return DELIVERY_CONFIG.deliveryFee;
      },

      getTotal: () => {
        return get().getSubtotal() + get().getShippingCost();
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getItem: (productId) => {
        return get().items.find((i) => i.productId === productId);
      },
    }),
    { name: "action-cart" }
  )
);

// ── Locale / Country Store ────────────────────────────────────
interface LocaleState {
  country: Country;
  currency: Currency;
  setCountry: (country: Country) => void;
  formatPrice: (priceEur: number) => string;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set, get) => ({
      country: DEFAULT_COUNTRY,
      currency: "EUR" as Currency,

      setCountry: (country: Country) => {
        set({
          country,
          currency: country.currency,
        });
      },

      formatPrice: (priceEur: number) => {
        const { currency } = get();
        const symbol = CURRENCY_SYMBOLS[currency];
        const locale = CURRENCY_LOCALES[currency];
        // 1 EUR = 1 BRL (no conversion, just change symbol)
        return new Intl.NumberFormat(locale, {
          style: "currency",
          currency: currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(priceEur);
      },
    }),
    { name: "action-locale" }
  )
);

// ── Navigation Store ──────────────────────────────────────────
interface NavState {
  currentView: "home" | "category" | "product" | "cart" | "checkout" | "search" | "weekly" | "demo";
  categorySlug?: string;
  productSlug?: string;
  searchQuery?: string;
  navigate: (view: NavState["currentView"], slug?: string) => void;
  goHome: () => void;
}

export const useNavStore = create<NavState>()((set) => ({
  currentView: "home",

  navigate: (view, slug) => {
    set({
      currentView: view,
      categorySlug: view === "category" ? slug : undefined,
      productSlug: view === "product" ? slug : undefined,
      searchQuery: view === "search" ? slug : undefined,
    });
    // Scroll to top
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  },

  goHome: () => {
    set({ currentView: "home", categorySlug: undefined, productSlug: undefined, searchQuery: undefined });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  },
}));

// ── UI State Store ────────────────────────────────────────────
interface UIState {
  isCartOpen: boolean;
  isMobileMenuOpen: boolean;
  isCountrySelectorOpen: boolean;
  isSearchOpen: boolean;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  toggleCountrySelector: () => void;
  toggleSearch: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isCartOpen: false,
  isMobileMenuOpen: false,
  isCountrySelectorOpen: false,
  isSearchOpen: false,
  toggleCart: () => set((s) => ({ isCartOpen: !s.isCartOpen })),
  setCartOpen: (open) => set({ isCartOpen: open }),
  toggleMobileMenu: () => set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
  toggleCountrySelector: () => set((s) => ({ isCountrySelectorOpen: !s.isCountrySelectorOpen })),
  toggleSearch: () => set((s) => ({ isSearchOpen: !s.isSearchOpen })),
}));
