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
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import API from "../api/api";
import "../mystyle/Products.css";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { token, role } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    API.get("/products?limit=12") // 🔥 only 12 products
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <Box className="products-section">
      <Container maxWidth="xl">

        <Box className="section-header">
          <Typography className="section-title">
            Our <span>Products</span>
          </Typography>
        </Box>

        {loading ? (
          <Typography align="center">Loading...</Typography>
        ) : (
          <>
            <Grid container spacing={3}>
              {products.map((product) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}   // 🔥 4 per row
                  key={product._id}
                >
                  <Card className="product-card">
                    <CardMedia
                      component="img"
                      image={product.image}
                      alt={product.title}
                      className="product-image"
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
                          className="add-btn"
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

            {/* View More Button */}
            <Box className="view-more-container">
              <Button
                variant="outlined"
                className="view-more-btn"
                href="/products"  // or use navigate
              >
                View More
              </Button>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
};

export default Products;