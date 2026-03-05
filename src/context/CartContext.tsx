"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";

export interface CartItem {
  id: number | string;
  title: string;
  titleTranslations?: Record<string, string>;
  price: number;
  image: string;
  quantity: number;
  category?: string;
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: number | string }
  | { type: "UPDATE_QUANTITY"; payload: { id: number | string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] };

const initialState: CartState = { items: [] };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find((i) => i.id === action.payload.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === action.payload.id
              ? { ...i, quantity: i.quantity + (action.payload.quantity || 1) }
              : i
          ),
        };
      }
      return {
        items: [
          ...state.items,
          { ...action.payload, quantity: action.payload.quantity || 1 },
        ],
      };
    }
    case "REMOVE_ITEM":
      return { items: state.items.filter((i) => i.id !== action.payload) };
    case "UPDATE_QUANTITY": {
      const { id, quantity } = action.payload;
      if (quantity < 1) return { items: state.items.filter((i) => i.id !== id) };
      return {
        items: state.items.map((i) =>
          i.id === id ? { ...i, quantity } : i
        ),
      };
    }
    case "CLEAR_CART":
      return { items: [] };
    case "LOAD_CART":
      return { items: action.payload };
    default:
      return state;
  }
};

const CART_STORAGE_KEY = "onmart-cart";

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  /** Toggle item in cart: first click adds, second click removes. */
  toggleItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: number | string) => void;
  updateQuantity: (id: number | string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  /** Number of unique products (for cart badge). */
  itemCount: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CartItem[];
        dispatch({ type: "LOAD_CART", payload: parsed });
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const addItem = (item: Omit<CartItem, "quantity">, quantity = 1) => {
    dispatch({ type: "ADD_ITEM", payload: { ...item, quantity } });
  };

  const toggleItem = (item: Omit<CartItem, "quantity">) => {
    const exists = state.items.some((i) => i.id === item.id);
    if (exists) {
      dispatch({ type: "REMOVE_ITEM", payload: item.id });
    } else {
      dispatch({ type: "ADD_ITEM", payload: { ...item, quantity: 1 } });
    }
  };

  const removeItem = (id: number | string) => dispatch({ type: "REMOVE_ITEM", payload: id });
  const updateQuantity = (id: number | string, quantity: number) =>
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  const clearCart = () => dispatch({ type: "CLEAR_CART" });

  const totalItems = state.items.reduce((s, i) => s + i.quantity, 0);
  const itemCount = state.items.length;
  const totalPrice = state.items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addItem,
        toggleItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        itemCount,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (ctx === undefined) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
