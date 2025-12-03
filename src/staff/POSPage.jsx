import React, { useState, useRef, useEffect } from "react";
import ProductGrid from "./components/ProductGrid";
import Cart from "./components/Cart";
import OrderSummary from "./components/OrderSummary";
import CategoryFilter from "./components/CategoryFilter";
import { ShoppingCart, ArrowUp } from "lucide-react";

export default function POSPage() {
  const [cartItems, setCartItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const cartSectionRef = useRef(null);
  const containerRef = useRef(null);
  const productContainerRef = useRef(null);

  const handleAddToCart = (product) => {
    // Products with uniqueId come from the modal with customizations
    if (product.uniqueId) {
      setCartItems([...cartItems, product]);
    } else {
      // Fallback for simple add (shouldn't happen with modal approach)
      const exists = cartItems.find((i) => i.id === product.id && !i.uniqueId);
      if (exists) {
        setCartItems(
          cartItems.map((i) =>
            i.id === product.id && !i.uniqueId ? { ...i, qty: i.qty + 1 } : i
          )
        );
      } else {
        setCartItems([...cartItems, { ...product, qty: 1 }]);
      }
    }
  };

  const handleRemove = (uniqueId) =>
    setCartItems(cartItems.filter((i) => (i.uniqueId || i.id) !== uniqueId));

  const handleQtyChange = (uniqueId, delta) => {
    setCartItems(
      cartItems.map((i) =>
        (i.uniqueId || i.id) === uniqueId
          ? { ...i, qty: Math.max(1, i.qty + delta) }
          : i
      )
    );
  };

  const handleComplete = () => {
    setCartItems([]);
  };

  const handleClear = () => {
    setCartItems([]);
  };

  const scrollToCart = () => {
    cartSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollProductsToTop = () => {
    productContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Detect scroll position for mobile/tablet
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Show scroll-to-top button when near bottom (within 300px)
      setShowScrollTop(scrollPosition + windowHeight > documentHeight - 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Detect scroll position for desktop product section
  const [showDesktopScrollTop, setShowDesktopScrollTop] = useState(false);

  useEffect(() => {
    const productContainer = productContainerRef.current;
    if (!productContainer) return;

    const handleProductScroll = () => {
      const scrollPosition = productContainer.scrollTop;
      // Show button after scrolling down 400px
      setShowDesktopScrollTop(scrollPosition > 400);
    };

    productContainer.addEventListener("scroll", handleProductScroll);
    return () => productContainer.removeEventListener("scroll", handleProductScroll);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-[calc(100vh-120px)] bg-coffee-50 text-coffee-900 relative">
      {/* Left Section: Products */}
      <div className="flex-1 p-3 sm:p-4 md:p-5 lg:p-6 overflow-y-auto relative" ref={productContainerRef}>
        <div className="mb-4 sm:mb-5 lg:mb-6">
          <CategoryFilter onSelect={setSelectedCategory} />
        </div>
        <ProductGrid category={selectedCategory} onAdd={handleAddToCart} />

        {/* Desktop Scroll to Top Button - Only visible on large screens when scrolled */}
        {showDesktopScrollTop && (
          <button
            onClick={scrollProductsToTop}
            className="hidden lg:block fixed bottom-6 left-6 bg-[var(--color-coffee-600)] hover:bg-[var(--color-coffee-700)] text-white rounded-full p-4 shadow-2xl z-50 transition-all duration-200 active:scale-95"
            aria-label="Scroll to top"
          >
            <ArrowUp size={24} />
          </button>
        )}
      </div>

      {/* Right Section: Cart & Summary */}
      <div 
        ref={cartSectionRef}
        className="w-full lg:w-[380px] xl:w-[420px] bg-white shadow-lg border-t lg:border-t-0 lg:border-l border-coffee-200 p-3 sm:p-4 md:p-5 lg:p-6 flex flex-col rounded-t-2xl lg:rounded-none overflow-y-auto max-h-[70vh] lg:max-h-full"
      >
        <Cart
          items={cartItems}
          onRemove={handleRemove}
          onChangeQty={handleQtyChange}
        />
        <OrderSummary
          cartItems={cartItems}
          onComplete={handleComplete}
          onClear={handleClear}
        />
      </div>

      {/* Floating Scroll to Cart Button - Only visible on small/medium screens when NOT at bottom */}
      {!showScrollTop && (
        <button
          onClick={scrollToCart}
          className="lg:hidden fixed bottom-6 right-6 bg-[var(--color-coffee-600)] hover:bg-[var(--color-coffee-700)] text-white rounded-full p-4 shadow-2xl z-50 transition-all duration-200 active:scale-95"
          aria-label="Go to cart"
        >
          <div className="relative">
            <ShoppingCart size={24} />
            {cartItems.length > 0 && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                {cartItems.reduce((sum, item) => sum + (item.qty || 1), 0)}
              </div>
            )}
          </div>
        </button>
      )}

      {/* Floating Scroll to Top Button - Only visible when at bottom on small/medium screens */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="lg:hidden fixed bottom-6 right-6 bg-[var(--color-coffee-600)] hover:bg-[var(--color-coffee-700)] text-white rounded-full p-4 shadow-2xl z-50 transition-all duration-200 active:scale-95"
          aria-label="Scroll to top"
        >
          <ArrowUp size={24} />
        </button>
      )}
    </div>
  );
}

