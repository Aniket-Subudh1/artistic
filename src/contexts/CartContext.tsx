"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { EquipmentPackage } from '@/services/equipment-packages.service';
import { CustomEquipmentPackage } from '@/services/custom-equipment-packages.service';

type CartPackage = {
  type: 'regular' | 'custom';
  package: EquipmentPackage | CustomEquipmentPackage;
  startDate: string;
  endDate: string;
  id: string;
};

interface CartContextType {
  cartItems: CartPackage[];
  addToCart: (item: CartPackage) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalDays: (startDate: string, endDate: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartPackage[]>([]);

  const addToCart = (item: CartPackage) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(cartItem => cartItem.id === item.id);
      if (existingIndex >= 0) {
        // Update existing item
        const newItems = [...prev];
        newItems[existingIndex] = item;
        return newItems;
      }
      // Add new item
      return [...prev, item];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalDays = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const days = getTotalDays(item.startDate, item.endDate);
      const packagePrice = item.type === 'regular' 
        ? (item.package as EquipmentPackage).totalPrice 
        : (item.package as CustomEquipmentPackage).totalPricePerDay;
      return total + (packagePrice * days);
    }, 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getTotalDays
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}