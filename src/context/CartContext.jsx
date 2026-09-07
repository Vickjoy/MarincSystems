import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on initial mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('edgeSystemsCart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // Validate the parsed data
        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart);
        }
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem('edgeSystemsCart');
    }
  }, []);

  // Save cart to localStorage whenever cartItems changes
  useEffect(() => {
    try {
      localStorage.setItem('edgeSystemsCart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cartItems]);

  const addToCart = (item) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + (item.quantity || 1) } : i);
      } else {
        return [...prev, { ...item, quantity: item.quantity || 1 }];
      }
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const getTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  };

  const clearCart = () => {
    setCartItems([]);
    // Explicitly clear from localStorage as well
    try {
      localStorage.removeItem('edgeSystemsCart');
    } catch (error) {
      console.error('Error clearing cart from localStorage:', error);
    }
  };

  const isInCart = (itemId) => {
    return cartItems.some(item => item.id === itemId);
  };

  // Also provide setCart for backwards compatibility
  const setCart = (items) => {
    setCartItems(items);
    try {
      if (items.length === 0) {
        localStorage.removeItem('edgeSystemsCart');
      } else {
        localStorage.setItem('edgeSystemsCart', JSON.stringify(items));
      }
    } catch (error) {
      console.error('Error updating cart in localStorage:', error);
    }
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity,
      getTotal, 
      getTotalItems,
      clearCart,
      isInCart,
      setCart
    }}>
      {children}
    </CartContext.Provider>
  );
};