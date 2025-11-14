import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { CartProvider } from "./components/CartContext.jsx";
import { DataProvider } from "./datafetcher";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CartProvider>
      <DataProvider>  
      <App />
      </DataProvider>   
    </CartProvider>
  </StrictMode>
);