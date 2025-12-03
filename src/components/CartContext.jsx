import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
 
 
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // ✅ Save cart to localStorage every time it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));

    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setTotalPrice(total);
  }, [cart]);

  const addToCart = (item) => {
    // Create a unique identifier based on product + size + addons
    const addonsKey = item.addons 
      ? item.addons
          .map(a => `${a.id}:${a.qty}`)
          .sort()
          .join('|')
      : '';
    
    const uniqueCartItemId = `${item.id}_${item.size || ''}_${addonsKey}`;

    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (cartItem) => cartItem.uniqueCartItemId === uniqueCartItemId
      );

      if (existingItem) {
        // Item with same product, size, and add-ons exists - increment quantity
        return prevCart.map((cartItem) =>
          cartItem.uniqueCartItemId === uniqueCartItemId
            ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
            : cartItem
        );
      }

      // New unique item - add to cart
      return [...prevCart, { ...item, uniqueCartItemId }];
    });
  };

  const updateQuantity = (uniqueCartItemId, newQuantity) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.uniqueCartItemId === uniqueCartItemId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeFromCart = (uniqueCartItemId) => {
    setCart((prevCart) => 
      prevCart.filter((item) => item.uniqueCartItemId !== uniqueCartItemId)
    );
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{
        cart,
        totalPrice,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
