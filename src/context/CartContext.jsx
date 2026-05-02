import { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { getCart, addToCartApi, removeFromCartApi, clearCartApi } from '../api/api';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]); // Trả về Mảng như cũ
  const { token } = useAuth();

  const fetchBackendCart = async () => {
    if (!token) {
      setCart([]);
      return;
    }
    try {
      const data = await getCart();
      if (data.code === 1000 && data.result) {
        const mappedItems = data.result.items.map(item => ({
          cartItemId: item.id,
          eventId: item.eventId,
          eventName: item.eventName,
          eventImage: item.eventImage,
          ticketTypeId: item.ticketTypeId,
          ticketTypeName: item.ticketTypeName,
          price: item.unitPrice,
          quantity: item.quantity,
          saleEndDate: item.saleEndDate
        }));
        setCart(mappedItems);
      }
    } catch (error) {
      console.error("Failed to fetch backend cart:", error);
    }
  };

  useEffect(() => {
    fetchBackendCart();
  }, [token]);

  const addToCart = async (event, tickets) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      for (const t of tickets) {
        try {
          await addToCartApi(t.typeId, t.qty);
        } catch (error) {
          console.error("Failed to sync item to backend:", error);
        }
      }
      await fetchBackendCart();
    } else {
      const newItems = tickets.map(t => ({
        eventId: event.id,
        eventName: event.name,
        eventImage: event.imageUrls?.[0],
        ticketTypeId: t.typeId,
        ticketTypeName: t.typeName,
        price: t.price,
        quantity: t.qty
      }));

      setCart(prev => {
        let updatedCart = [...prev];
        newItems.forEach(newItem => {
          const existingIdx = updatedCart.findIndex(item => item.ticketTypeId === newItem.ticketTypeId);
          if (existingIdx >= 0) {
            updatedCart[existingIdx].quantity += newItem.quantity;
          } else {
            updatedCart.push(newItem);
          }
        });
        return updatedCart;
      });
    }
  };

  const removeFromCart = async (ticketTypeId) => {
    const token = localStorage.getItem('token');
    const itemToRemove = cart.find(item => item.ticketTypeId === ticketTypeId);

    if (token && itemToRemove?.cartItemId) {
      try {
        await removeFromCartApi(itemToRemove.cartItemId);
      } catch (error) {
        console.error("Failed to remove item from backend:", error);
      }
    }
    setCart(prev => prev.filter(item => item.ticketTypeId !== ticketTypeId));
  };

  const clearCart = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await clearCartApi();
      } catch (error) {
        console.error("Failed to clear cart on backend:", error);
      }
    }
    setCart([]);
  };

  const getCartCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, getCartCount, getCartTotal, fetchBackendCart }}>
      {children}
    </CartContext.Provider>
  );
};
