import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { loadAppData, saveAppData, defaultAppData, clearAppData } from '../services/storage';
import { authService } from '../services/auth';
import { orderService } from '../services/orders';
import { config } from '../services/config';
import type {
  AppData,
  BusinessProduct,
  BusinessProfile,
  DeliveryDetails,
  LanguageCode,
  Order,
  Product,
  UserProfile,
} from '../types';
import { makeId } from '../utils/format';

interface AppContextValue {
  ready: boolean;
  data: AppData;
  cartCount: number;
  cartSubtotal: number;
  signIn: (contact: string, password: string, remember: boolean) => Promise<UserProfile>;
  signUp: (fullName: string, contact: string, password: string) => Promise<UserProfile>;
  signOut: () => Promise<void>;
  toggleFavorite: (productId: string) => void;
  toggleBookmark: (storyId: string) => void;
  toggleSavedPlace: (destinationId: string) => void;
  addToCart: (product: Product, quantity?: number) => void;
  setCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  placeDemoOrder: (delivery: DeliveryDetails) => Promise<Order>;
  setLanguage: (code: LanguageCode) => void;
  saveBusiness: (input: Pick<BusinessProfile, 'name' | 'category' | 'description' | 'imageUri'>) => void;
  addBusinessProduct: (name: string, priceRwf: number) => void;
  removeBusinessProduct: (id: string) => void;
  resetDemoData: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

const toggle = (list: string[], id: string) =>
  list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(defaultAppData);
  const [ready, setReady] = useState(false);
  const hydrated = useRef(false);

  // Hydrate from persistent storage once.
  useEffect(() => {
    let active = true;
    loadAppData().then((stored) => {
      if (!active) return;
      // "Remember me" off: the session does not survive an app restart.
      const next = stored.preferences.rememberMe ? stored : { ...stored, user: null };
      setData(next);
      hydrated.current = true;
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  // Persist every change after hydration.
  useEffect(() => {
    if (hydrated.current) saveAppData(data);
  }, [data]);

  const update = useCallback((fn: (prev: AppData) => AppData) => setData((prev) => fn(prev)), []);

  const signIn = useCallback<AppContextValue['signIn']>(
    async (contact, password, remember) => {
      const user = await authService.signIn(contact, password);
      update((p) => ({
        ...p,
        user,
        rememberedContact: remember ? contact.trim() : '',
        preferences: { ...p.preferences, rememberMe: remember },
      }));
      return user;
    },
    [update],
  );

  const signUp = useCallback<AppContextValue['signUp']>(
    async (fullName, contact, password) => {
      const user = await authService.signUp(fullName, contact, password);
      update((p) => ({
        ...p,
        user,
        rememberedContact: contact.trim(),
        preferences: { ...p.preferences, rememberMe: true },
      }));
      return user;
    },
    [update],
  );

  const signOut = useCallback(async () => {
    await authService.signOut();
    update((p) => ({ ...p, user: null }));
  }, [update]);

  const toggleFavorite = useCallback(
    (id: string) => update((p) => ({ ...p, favorites: toggle(p.favorites, id) })),
    [update],
  );
  const toggleBookmark = useCallback(
    (id: string) => update((p) => ({ ...p, bookmarks: toggle(p.bookmarks, id) })),
    [update],
  );
  const toggleSavedPlace = useCallback(
    (id: string) => update((p) => ({ ...p, savedPlaces: toggle(p.savedPlaces, id) })),
    [update],
  );

  const addToCart = useCallback<AppContextValue['addToCart']>(
    (product, quantity = 1) => {
      const qty = Math.max(1, Math.min(99, Math.floor(quantity)));
      update((p) => {
        const existing = p.cart.find((c) => c.productId === product.id);
        if (existing) {
          return {
            ...p,
            cart: p.cart.map((c) =>
              c.productId === product.id ? { ...c, quantity: Math.min(99, c.quantity + qty) } : c,
            ),
          };
        }
        return {
          ...p,
          cart: [
            ...p.cart,
            {
              productId: product.id,
              name: product.name,
              priceRwf: product.priceRwf,
              image: product.image,
              imageUrl: product.imageUrl,
              rewardStoryId: product.rewardStoryId,
              quantity: qty,
            },
          ],
        };
      });
    },
    [update],
  );

  const setCartQuantity = useCallback(
    (productId: string, quantity: number) =>
      update((p) => ({
        ...p,
        cart:
          quantity <= 0
            ? p.cart.filter((c) => c.productId !== productId)
            : p.cart.map((c) =>
                c.productId === productId ? { ...c, quantity: Math.min(99, quantity) } : c,
              ),
      })),
    [update],
  );

  const removeFromCart = useCallback(
    (productId: string) => update((p) => ({ ...p, cart: p.cart.filter((c) => c.productId !== productId) })),
    [update],
  );

  // Latest data for async actions without re-creating callbacks on each change.
  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  });

  const placeDemoOrder = useCallback(
    async (delivery: DeliveryDetails) => {
      const current = dataRef.current;
      if (current.cart.length === 0) throw new Error('Your cart is empty');
      const order = await orderService.createOrder({
        lines: current.cart,
        delivery,
        shippingRwf: config.demoShippingRwf,
        unlockedStoryIds: current.unlockedStories,
      });
      update((p) => ({
        ...p,
        cart: [],
        orders: [order, ...p.orders],
        unlockedStories:
          order.rewardStoryId && !p.unlockedStories.includes(order.rewardStoryId)
            ? [...p.unlockedStories, order.rewardStoryId]
            : p.unlockedStories,
      }));
      return order;
    },
    [update],
  );

  const setLanguage = useCallback(
    (code: LanguageCode) => update((p) => ({ ...p, preferences: { ...p.preferences, language: code } })),
    [update],
  );

  const saveBusiness = useCallback<AppContextValue['saveBusiness']>(
    (input) =>
      update((p) => ({
        ...p,
        business: {
          name: input.name.trim(),
          category: input.category,
          description: input.description.trim(),
          imageUri: input.imageUri,
          createdAt: p.business?.createdAt ?? new Date().toISOString(),
          products: p.business?.products ?? [],
        },
      })),
    [update],
  );

  const addBusinessProduct = useCallback(
    (name: string, priceRwf: number) =>
      update((p) => {
        if (!p.business) return p;
        const item: BusinessProduct = { id: makeId('bp'), name: name.trim(), priceRwf };
        return { ...p, business: { ...p.business, products: [...p.business.products, item] } };
      }),
    [update],
  );

  const removeBusinessProduct = useCallback(
    (id: string) =>
      update((p) =>
        p.business
          ? { ...p, business: { ...p.business, products: p.business.products.filter((x) => x.id !== id) } }
          : p,
      ),
    [update],
  );

  const resetDemoData = useCallback(async () => {
    await clearAppData();
    setData(defaultAppData);
  }, []);

  const cartCount = useMemo(() => data.cart.reduce((n, c) => n + c.quantity, 0), [data.cart]);
  const cartSubtotal = useMemo(
    () => data.cart.reduce((n, c) => n + c.priceRwf * c.quantity, 0),
    [data.cart],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      ready,
      data,
      cartCount,
      cartSubtotal,
      signIn,
      signUp,
      signOut,
      toggleFavorite,
      toggleBookmark,
      toggleSavedPlace,
      addToCart,
      setCartQuantity,
      removeFromCart,
      placeDemoOrder,
      setLanguage,
      saveBusiness,
      addBusinessProduct,
      removeBusinessProduct,
      resetDemoData,
    }),
    [
      ready,
      data,
      cartCount,
      cartSubtotal,
      signIn,
      signUp,
      signOut,
      toggleFavorite,
      toggleBookmark,
      toggleSavedPlace,
      addToCart,
      setCartQuantity,
      removeFromCart,
      placeDemoOrder,
      setLanguage,
      saveBusiness,
      addBusinessProduct,
      removeBusinessProduct,
      resetDemoData,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
