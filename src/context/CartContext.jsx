/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
} from 'react';
import { useAuth } from './AuthContext';
import {
  getCart,
  addToCartApi,
  removeFromCartApi,
  clearCartApi,
  updateCartItemApi,
} from '../utils/api';

const CartContext = createContext(null);

export const useCart = () => useContext(CartContext);

const mapItem = (item) => ({
  cartItemId: item.cartItemId ?? item.id,
  eventId: item.eventId,
  eventName: item.eventName,
  eventImage: item.eventImage,
  ticketTypeId: item.ticketTypeId,
  ticketTypeName: item.ticketTypeName,
  price: Number(item.unitPrice ?? item.price ?? 0),
  quantity: Number(item.quantity ?? 0),
  saleEndDate: item.saleEndDate,
});

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const requestId = useRef(0);

  /** Returns the fresh cart so callers can act on the new server-side ids. */
  const fetchBackendCart = useCallback(async () => {
    if (!token) {
      setCart([]);
      return [];
    }
    const id = ++requestId.current;
    setLoading(true);
    try {
      const data = await getCart();
      const items = (data?.code === 1000 ? data.result?.items : null) || [];
      const mapped = items.map(mapItem);
      // Ignore responses from a request that a newer one has superseded.
      if (id === requestId.current) setCart(mapped);
      return mapped;
    } catch (error) {
      if (id === requestId.current) setCart([]);
      throw error;
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchBackendCart().catch(() => {
      /* surfaced by the page that triggers an action, not on background load */
    });
  }, [fetchBackendCart]);

  /**
   * Adds tickets and reports partial failures instead of swallowing them —
   * the old version always told the user "added successfully".
   */
  const addToCart = async (tickets) => {
    if (!token) {
      throw new Error('Vui lòng đăng nhập để thêm vé vào giỏ hàng.');
    }

    const failures = [];
    for (const t of tickets) {
      try {
        await addToCartApi(t.typeId, t.qty);
      } catch (error) {
        failures.push(`${t.typeName}: ${error.message}`);
      }
    }

    const updated = await fetchBackendCart();

    if (failures.length) {
      const error = new Error(failures.join(' · '));
      error.partial = failures.length < tickets.length;
      error.cart = updated;
      throw error;
    }
    return updated;
  };

  const removeFromCart = async (cartItemId) => {
    const item = cart.find((i) => i.cartItemId === cartItemId);
    if (!item) return;
    await removeFromCartApi(item.cartItemId);
    await fetchBackendCart();
  };

  const updateQuantity = async (cartItemId, quantity) => {
    if (quantity < 1) return removeFromCart(cartItemId);
    await updateCartItemApi(cartItemId, quantity);
    await fetchBackendCart();
  };

  const clearCart = async () => {
    if (token) await clearCartApi();
    setCart([]);
  };

  const getCartCount = useCallback(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart],
  );

  const getCartTotal = useCallback(
    () => cart.reduce((total, item) => total + item.price * item.quantity, 0),
    [cart],
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartCount,
        getCartTotal,
        fetchBackendCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
