import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { loadGoogleMaps } from "../utils/loadGoogleMaps";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Initialize cart from localStorage immediately
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      return [];
    }
  });
  const [totalPrice, setTotalPrice] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [feeLoading, setFeeLoading] = useState(false);

  /* -----------------------------------------------------------
      RECALCULATE TOTAL & SAVE CART TO LOCALSTORAGE
  ------------------------------------------------------------ */
  useEffect(() => {
    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setTotalPrice(total);
    
    // Save to localStorage whenever cart changes
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }, [cart]);


  /* -----------------------------------------------------------
      CALCULATE DELIVERY FEE
  ------------------------------------------------------------ */
  const calculateDeliveryFee = useCallback(
    async (address, shippingType = "delivery") => {
      if (shippingType !== "delivery" || !address) {
        setDeliveryFee(0);
        return 0;
      }

      setFeeLoading(true);

      try {
        // Read delivery config
        const cfgSnap = await getDoc(doc(db, "settings", "mapRadius"));
        const cfg = cfgSnap.data();

        const baseFee = Number(cfg.flatFee || 40);
        const perKmFee = Number(cfg.deliveryFeeKm || 10);
        const origin = `${cfg.lat },${cfg.long }`;

        // Load Google Maps SDK
        const maps = await loadGoogleMaps();
        const service = new maps.DistanceMatrixService();

        const fee = await new Promise((resolve) => {
          service.getDistanceMatrix(
            {
              origins: [origin],
              destinations: [address],
              travelMode: maps.TravelMode.DRIVING,
              unitSystem: maps.UnitSystem.METRIC,
            },
            (res, status) => {
              if (
                status === "OK" &&
                res.rows?.[0]?.elements?.[0]?.status === "OK"
              ) {
                const meters = res.rows[0].elements[0].distance.value || 0;
                const km = Math.ceil(meters / 1000);
                resolve(baseFee + km * perKmFee);
              } else {
                resolve(baseFee); // fallback
              }
            }
          );
        });

        const finalFee = Number(fee.toFixed(2));
        setDeliveryFee(finalFee);
        setFeeLoading(false);
        return finalFee;
      } catch (err) {
        console.error("Delivery Fee Error:", err);

        const fallback = 60;
        setDeliveryFee(fallback);
        setFeeLoading(false);
        return fallback;
      }
    },
    []
  );

  /* -----------------------------------------------------------
      CART FUNCTIONS
  ------------------------------------------------------------ */
  const addToCart = (item, quantity = 1) => {
    const q = Math.max(1, Number.parseInt(quantity, 10) || 1);

    // keep addon comparison stable
    const norm = (arr) =>
      JSON.stringify((arr || []).slice().sort((a, b) => String(a.id).localeCompare(String(b.id))));

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (i) =>
          i.id === item.id &&
          i.size === item.size &&
          norm(i.addons) === norm(item.addons)
      );

      if (existingIndex !== -1) {
        const updatedCart = [...prev];
        // always add 1 when the same item is added again
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          quantity: updatedCart[existingIndex].quantity + 1,
        };
        return updatedCart;
      } else {
        const uniqueCartItemId = `${item.id}-${Date.now()}-${Math.random()}`;
        return [...prev, { ...item, quantity: q, uniqueCartItemId }];
      }
    });
  };



  const removeFromCart = (uniqueCartItemId) => {
    setCart((prev) =>
      prev.filter((item) => item.uniqueCartItemId !== uniqueCartItemId)
    );
  };

  const updateQuantity = (uniqueCartItemId, qty) => {
    setCart((prev) =>
      qty < 1
        ? prev.filter((i) => i.uniqueCartItemId !== uniqueCartItemId)
        : prev.map((i) =>
            i.uniqueCartItemId === uniqueCartItemId ? { ...i, quantity: qty } : i
          )
    );
  };

  const clearCart = () => {
    setCart([]);
    setDeliveryFee(0);
    try {
      localStorage.removeItem("cart");
    } catch (error) {
      console.error("Error clearing cart from localStorage:", error);
    }
  };

  /* -----------------------------------------------------------
      PROVIDER
  ------------------------------------------------------------ */
  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalPrice,
        deliveryFee,
        feeLoading,
        calculateDeliveryFee,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
