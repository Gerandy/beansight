import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { useState } from "react";
import MobileMenu from "./components/MobileMenu";
import Navbar from "./components/Navbar";
import Home from "./components/sections/Home";
import Menu from "./components/sections/Menu";
import ProductDetails from "./components/sections/ProductDetails";
import Myaccount from "./components/sections/Myaccount";
import Myprofile from "./components/Myprofile";
import Footer from "./components/sections/Footer";
import MyAddresses from "./components/MyAddresses";
import MyContactNumbers from "./components/MyContactNumbers";
import MyFavorites from "./components/MyFavorites";


import AdminLayout from "./admin/layouts/Adminlayouts";
import Dashboard from "./admin/dashboard";
import Sales from "./admin/sales";
import MenuPerformance from "./admin/menuperformance";
import Customers from "./admin/CustomerAnalytics";
import Inventory from "./admin/Inventory";
import Reports from "./admin/reports";
import Product from "./admin/Products";
import Pos from "./admin/Pos";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <Router>
      <Routes>
        {/* ---------- Public Site ---------- */}
        <Route
          path="/*"
          element={
            <>
              <Navbar
                menuOpen={menuOpen}
                setMenuOpen={setMenuOpen}
                cartOpen={cartOpen}
                setCartOpen={setCartOpen}
              />
              <MobileMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/menu" element={<Menu cartOpen={cartOpen} />} />
                <Route
                  path="/menu/product-details/:id/"
                  element={<ProductDetails />}
                />
                <Route path="/Myaccount" element={<Myaccount />}>
                  <Route index element={<Myprofile />} />
                  <Route path="profile" element={<Myprofile />} />
                  <Route path="addresses" element={<MyAddresses />} />
                  <Route path="contacts" element={<MyContactNumbers />} />
                  <Route path="favorites" element={<MyFavorites />} />
                </Route>
              </Routes>
              <Footer />
            </>
          }
        />

        {/* ---------- Admin Site ---------- */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="sales" element={<Sales />} />
          <Route path="menu-performance" element={<MenuPerformance />} />
          <Route path="customers" element={<Customers />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="reports" element={<Reports />} />
          <Route path="products" element={<Product />} />
          <Route path="/admin/pos" element={<Pos />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
