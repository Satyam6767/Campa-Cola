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
import "../mystyle/Products.css";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import API from "../api/api";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { token, role } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    API.get("/products?limit=6")
      .then((res) => {
        setProducts(res.data.products || res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  }, []);

  return (
    <Box className="products-section">
      <Container maxWidth={false}>

        {/* HEADER */}
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
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={20}
            slidesPerView={6}
            navigation
            pagination={{ clickable: true }}
            loop={true}
            breakpoints={{
              0: { slidesPerView: 1 },
              576: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              992: { slidesPerView: 4 },
              1200: { slidesPerView: 5 },
              1400: { slidesPerView: 6 },
            }}
          >
            {products.map((product) => (
              <SwiperSlide key={product._id}>
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
              </SwiperSlide>
            ))}
          </Swiper>
        )}

      </Container>
    </Box>
  );
};

export default Products;