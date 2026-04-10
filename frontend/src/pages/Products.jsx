import {
  Box,
  Typography,
  Container,
  Card,
  CardMedia,
  CardContent,
  Button,
} from "@mui/material";
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "../mystyle/Product.css";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import API from "../api/api";

const Products = ({ limit, showViewMore }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { token, role } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    const url = limit ? `/products?limit=${limit}` : "/products";

    API.get(url)
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  }, [limit]);

  return (
    <Box className="products-section">
      <Container maxWidth="xl">

        <Box className="section-header">
          <Typography className="section-tag">
            CAMPA COLA
          </Typography>

          <Typography className="section-title">
            Our <span>Products</span>
          </Typography>
        </Box>

        {loading ? (
          <Typography align="center">Loading products...</Typography>
        ) : (
          <>
            <Box
              className={`products-grid ${
                limit ? "home-grid" : "full-grid"
              }`}
            >
              {products.map((product) => (
                <Card className="product-card" key={product._id}>
                  <CardMedia
                    component="img"
                    image={product.image}
                    alt={product.title}
                    className="product-image"
                    loading="lazy"
                  />

                  <CardContent className="product-content">
                    <Typography className="product-name">
                      {product.title}
                    </Typography>

                    <Typography className="product-price">
                      ₹{product.price}
                    </Typography>

                    {token && role === "user" && (
                      <Button
                        variant="contained"
                        fullWidth
                        className="add-to-cart-btn"
                        onClick={() => addToCart(product)}
                      >
                        Add to Cart
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>

            {showViewMore && (
              <Box textAlign="center" mt={4}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate("/products")}
                >
                  View More
                </Button>
              </Box>
            )}
          </>
        )}

      </Container>
    </Box>
  );
};

export default Products;