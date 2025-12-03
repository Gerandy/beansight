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
  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [feeLoading, setFeeLoading] = useState(false);

  /* -----------------------------------------------------------
      Load INITIAL CART
  ------------------------------------------------------------ */
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  /* -----------------------------------------------------------
      RECALCULATE TOTAL & SAVE CART
  ------------------------------------------------------------ */
  useEffect(() => {
    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setTotalPrice(total);
    localStorage.setItem("cart", JSON.stringify(cart));
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
        const cfgSnap = await getDoc(doc(db, "settings", "deliveryConfig"));
        const cfg = cfgSnap.exists() ? cfgSnap.data() : {};

        const baseFee = Number(cfg.baseFee ?? 40);
        const perKmFee = Number(cfg.perKm ?? 10);
        const origin = `${cfg.storeLat ?? "14.4239"},${cfg.storeLng ?? "120.8986"}`;

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
  const addToCart = (item) => {
    const uniqueId = `${item.id}-${Date.now()}-${Math.random()}`;
    setCart((prev) => [...prev, { ...item, uniqueCartItemId: uniqueId }]);
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
    localStorage.removeItem("cart");
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
