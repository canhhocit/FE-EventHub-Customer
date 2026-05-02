import { createContext, useState, useEffect, useContext } from 'react';
import { API_BASE_URL } from '../utils/constants';

import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { token } = useAuth();

  const fetchBackendCart = async () => {
    if (!token) {
      setCart([]);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          console.warn("Session expired. Please login again.");
          // Optional: handle logout here
        }
        return;
      }

      const data = await response.json();
      if (data.code === 1000 && data.result) {
        // Map backend CartItem to frontend cart format
        const items = data.result.items.map(item => ({
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
        setCart(items);
      }
    } catch (error) {
      console.error("Failed to fetch backend cart:", error);
    }
  };

  // Load giỏ hàng từ backend khi có token
  useEffect(() => {
    fetchBackendCart();
  }, [token]);

  const addToCart = async (event, tickets) => {
    const token = localStorage.getItem('token');
    
    // If logged in, sync with backend
    if (token) {
      for (const t of tickets) {
        try {
          await fetch(`${API_BASE_URL}/cart/add`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              ticketTypeId: t.typeId,
              quantity: t.qty
            })
          });
        } catch (error) {
          console.error("Failed to sync item to backend:", error);
        }
      }
      // Re-fetch to get consistent state (including item IDs from DB if needed)
      await fetchBackendCart();
    } else {
      // Offline mode (should be blocked by UI but kept for safety)
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
        await fetch(`${API_BASE_URL}/cart/items/${itemToRemove.cartItemId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (error) {
        console.error("Failed to remove item from backend:", error);
      }
    }
    setCart(prev => prev.filter(item => item.ticketTypeId !== ticketTypeId));
  };

  const clearCart = () => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_BASE_URL}/cart/clear`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
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
