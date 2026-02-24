import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] });
  const { token, role } = useContext(AuthContext);

  // =========================
  // ADD TO CART (FIXED)
  // =========================
  const addToCart = async (product, quantity = 1) => {
    if (!token || role !== "user") return;

    try {
      const res = await axios.post(
        "https://campa-cola-1.onrender.com/api/cart/add",
        {
          productId: product._id,
          quantity: quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCart(res.data.cart);
    } catch (error) {
      console.error(
        "Add to cart error:",
        error.response?.data || error.message
      );
    }
  };

  // =========================
  // FETCH CART
  // =========================
  const fetchCart = async () => {
    if (!token || role !== "user") return;

    try {
      const res = await axios.get(
        "https://campa-cola-1.onrender.com/api/cart",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCart(res.data || { items: [] });
    } catch (error) {
      console.error("Fetch cart error:", error.message);
    }
  };

  // Fetch cart on login
  useEffect(() => {
    fetchCart();
  }, [token]);

  return (
    <CartContext.Provider value={{ cart, addToCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};
