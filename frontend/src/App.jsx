import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// User Pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import ProductDetails from "./pages/ProductDetails";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Orders from "./pages/Orders";

// Layout Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Admin Section
import AdminLayout from "./admin/AdminLayout";
import AdminRoute from "./routes/AdminRoute";
import AdminDashboard from "./admin/AdminDashboard";
import ManageProducts from "./admin/ManageProducts";
import ManageCategories from "./admin/ManageCategories";
import ManageOrders from "./admin/ManageOrders";
import Billing from "./admin/Billing";
import BillingHistory from "./admin/BillingHistory";
import PrintInvoice from "./admin/PrintInvoice";
import Contact from "./pages/Contact";
import Aboutus from "./pages/Aboutus";

const App = () => {
  return (
    <Router>
      <Navbar />
      <ToastContainer position="top-right" autoClose={2000} />

      <Routes>

        {/* User Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/about" element={<Aboutus />} />
        <Route path="/contact" element={<Contact />} />


        {/* Admin Protected Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<ManageProducts />} />
          <Route path="categories" element={<ManageCategories />} />
          <Route path="orders" element={<ManageOrders />} />
          <Route path="billing" element={<Billing />} />
          <Route path="billing-history" element={<BillingHistory />} />
          <Route path="invoice/:id" element={<PrintInvoice />} />



        </Route>

      </Routes>

      {/* <Footer /> */}
    </Router>
  );
};

export default App;
