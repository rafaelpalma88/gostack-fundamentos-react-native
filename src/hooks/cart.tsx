import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const cartStorage = await AsyncStorage.getItem('@GoMarketplace:cart');
      if (cartStorage) {
        const cart = JSON.parse(cartStorage);
        setProducts(cart);
      }
    }
    loadProducts();
  }, []);

  const findProduct = useCallback(
    (id: string): number => {
      return products.findIndex(item => item.id === id);
    },
    [products],
  );

  const addToCart = useCallback(
    async (product: Product) => {
      const productIndex = findProduct(product.id);
      const newProducts = [...products];

      if (productIndex > -1) {
        newProducts[productIndex].quantity += 1;
      } else {
        newProducts.push({ ...product, quantity: 1 });
      }
      setProducts(newProducts);
      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(newProducts),
      );
    },
    [products, findProduct],
  );

  const increment = useCallback(
    async id => {
      const productIndex = findProduct(id);
      const newProducts = [...products];

      if (productIndex > -1) {
        newProducts[productIndex].quantity += 1;
      }
      setProducts(newProducts);
      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(newProducts),
      );
    },
    [findProduct, products],
  );

  const decrement = useCallback(
    async id => {
      const productIndex = findProduct(id);
      const newProducts = [...products];

      if (productIndex > -1 && newProducts[productIndex].quantity > 1) {
        newProducts[productIndex].quantity -= 1;
      } else {
        // newProducts.splice(productIndex, 1); - isso ficou ruim. preciso arrumar com mais tempo!
      }
      setProducts(newProducts);
      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(newProducts),
      );
    },
    [findProduct, products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
