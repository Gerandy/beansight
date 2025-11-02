import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { useState } from "react";
import MobileMenu from "./components/MobileMenu";
import Navbar from "./components/Navbar";
import Home from "./components/sections/Home";
import Menu from "./components/sections/Menu";
import ProductDetails from "./components/sections/ProductDetails";
import Myaccount from "./components/sections/Myaccount";
import Myprofile from "./components/myaccount/Myprofile";
import Footer from "./components/sections/Footer";
import MyAddresses from "./components/myaccount/MyAddresses";
import MyContactNumbers from "./components/myaccount/MyContactNumbers";
import MyFavorites from "./components/myaccount/MyFavorites";
import Orders from "./components/sections/Orders";
import Checkout from "./components/Checkout";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import RequireAuth from "./components/auth/RequireAuth";

// ----- Admin -----
import AdminLayout from "./admin/layouts/Adminlayouts";
import Dashboard from "./admin/dashboard";
import Sales from "./admin/sales";
import MenuPerformance from "./admin/menuperformance";
import Customers from "./admin/CustomerAnalytics";
import Inventory from "./admin/Inventory";
import Reports from "./admin/reports";
import Product from "./admin/Products";
import UserManagement from "./admin/UserManagement";
import OrderManagement from "./admin/OrderManagement";
import Pos from "./admin/Pos";

// ----- Staff (POS) -----
import StaffLayout from "./staff/layouts/StaffLayout";
import PosPage from "./staff/POSPage";
import OnlineOrders from "./staff/components/OnlineOrders";
import History from "./staff/components/History";
import StaffProduct from "./staff/components/StaffProduct";

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
            <div className="flex flex-col min-h-screen">
              <Navbar
                menuOpen={menuOpen}
                setMenuOpen={setMenuOpen}
                cartOpen={cartOpen}
                setCartOpen={setCartOpen}
              />
              <MobileMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/menu" element={<Menu cartOpen={cartOpen} />} />
                  <Route path="/menu/product-details/:id" element={<ProductDetails />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route
                    path="/Myaccount"
                    element={
                      <RequireAuth>
                        <Myaccount />
                      </RequireAuth>
                    }
                  >
                    <Route index element={<Myprofile />} />
                    <Route path="profile" element={<Myprofile />} />
                    <Route path="addresses" element={<MyAddresses />} />
                    <Route path="contacts" element={<MyContactNumbers />} />
                    <Route path="favorites" element={<MyFavorites />} />
                  </Route>
                </Routes>
              </main>
              <Footer />
            </div>
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
          <Route path="user-management" element={<UserManagement />} />
          <Route path="order-management" element={<OrderManagement />} />
          <Route path="pos" element={<Pos />} />
        </Route>

        {/* ---------- Staff Site (POS) ---------- */}
        <Route path="/staff" element={<StaffLayout />}>
          <Route index element={<PosPage />} />
          <Route path="pos" element={<PosPage />} />
          <Route path="online-orders" element={<OnlineOrders />} />
          <Route path="history" element={<History />} />
          <Route path="products" element={<StaffProduct />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

