import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('vf_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [savedForLater, setSavedForLater] = useState(() => {
    const saved = localStorage.getItem('vf_saved_later');
    return saved ? JSON.parse(saved) : [];
  });

  const [coupon, setCoupon] = useState(null);

  useEffect(() => {
    localStorage.setItem('vf_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('vf_saved_later', JSON.stringify(savedForLater));
  }, [savedForLater]);

  const addToCart = (serviceItem) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.serviceId === serviceItem.serviceId);
      if (existing) {
        return prev.map((item) =>
          item.serviceId === serviceItem.serviceId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...serviceItem, quantity: serviceItem.quantity || 1 }];
    });
  };

  const removeFromCart = (serviceId) => {
    setCartItems((prev) => prev.filter((item) => item.serviceId !== serviceId));
  };

  const updateQuantity = (serviceId, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.serviceId === serviceId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const saveForLaterItem = (serviceId) => {
    const itemToSave = cartItems.find((item) => item.serviceId === serviceId);
    if (itemToSave) {
      setSavedForLater((prev) => [...prev, itemToSave]);
      removeFromCart(serviceId);
    }
  };

  const moveToCart = (serviceId) => {
    const itemToMove = savedForLater.find((item) => item.serviceId === serviceId);
    if (itemToMove) {
      addToCart(itemToMove);
      setSavedForLater((prev) => prev.filter((item) => item.serviceId !== serviceId));
    }
  };

  const applyCoupon = (code) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'VIBE10') {
      setCoupon({ code: 'VIBE10', discountPercent: 10 });
      return { success: true, message: '10% Coupon VIBE10 applied!' };
    } else if (clean === 'FIRST20') {
      setCoupon({ code: 'FIRST20', discountPercent: 20 });
      return { success: true, message: '20% Coupon FIRST20 applied!' };
    }
    return { success: false, message: 'Invalid coupon code' };
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
  };

  // Computations
  const subtotal = cartItems.reduce((acc, item) => {
    let p = item.price;
    if (item.priority === 'fast') p += 100;
    if (item.priority === 'express') p += 200;
    return acc + p * item.quantity;
  }, 0);

  const discountAmount = coupon ? Math.round((subtotal * coupon.discountPercent) / 100) : 0;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const gstAmount = Math.round(discountedSubtotal * 0.18);
  const grandTotal = discountedSubtotal + gstAmount;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        savedForLater,
        coupon,
        addToCart,
        removeFromCart,
        updateQuantity,
        saveForLaterItem,
        moveToCart,
        applyCoupon,
        removeCoupon,
        clearCart,
        subtotal,
        discountAmount,
        gstAmount,
        grandTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
