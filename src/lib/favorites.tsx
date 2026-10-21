import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type FavoriteProduct = {
  slug: string;
  name: string;
};

type FavoritesContextValue = {
  items: FavoriteProduct[];
  has: (slug: string) => boolean;
  toggle: (product: FavoriteProduct) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);
const STORAGE_KEY = "urbanprint-favorites";

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<FavoriteProduct[]>([]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored) as FavoriteProduct[]);
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // El navegador puede bloquear el almacenamiento privado.
    }
  }, [items]);

  const has = useCallback((slug: string) => items.some((item) => item.slug === slug), [items]);
  const toggle = useCallback((product: FavoriteProduct) => {
    setItems((current) =>
      current.some((item) => item.slug === product.slug)
        ? current.filter((item) => item.slug !== product.slug)
        : [...current, product],
    );
  }, []);

  const value = useMemo(() => ({ items, has, toggle }), [items, has, toggle]);
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites debe usarse dentro de FavoritesProvider");
  return context;
}
