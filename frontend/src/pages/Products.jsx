import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
} from "@mui/material";
import { useEffect, useState, useContext } from "react";
import "../mystyle/Products.css";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import API from "../api/api";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { token, role } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    API.get("/products")
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  }, []);

  return (
    <Box className="products-section">
      <Container maxWidth="xl">

        {/* SECTION HEADER */}
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
          <Grid container spacing={2}>
            {products.map((product) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={2}     // ✅ 6 products per row on large screens
                key={product._id}
              >
                <Card className="product-card">

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

                    {/* USER ONLY */}
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
              </Grid>
            ))}
          </Grid>
        )}

      </Container>
    </Box>
  );
};

export default Products;
