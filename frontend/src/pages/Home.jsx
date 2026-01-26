import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button
} from "@mui/material";
import { Link } from "react-router-dom";
import API from "../api/api";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import img1 from "../../public/1.jpg";
import img2 from "../../public/2.jpg";
import img3 from "../../public/3.jpg";

import Aboutus from "./Aboutus";

const Home = () => {
  const [products, setProducts] = useState([]);

  // 🔹 Fetch products
  const fetchProducts = async () => {
    try {
      const { data } = await API.get("/products");
      setProducts(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <>
      {/* 🚀 Swiper Carousel */}
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        loop
        style={{ width: "100%", height: "490px" }}
      >
        {[img1, img2, img3].map((img, i) => (
          <SwiperSlide key={i}>
            <Box
              sx={{
                width: "100%",
                height: "100%",
                backgroundImage: `url(${img})`,
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* About Section */}
      <Aboutus />

      {/* 🛒 Shop by Category / Products */}
      <Container sx={{ mt: 5 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
          Shop by Category
        </Typography>

        <Grid container spacing={3}>
          {products.length === 0 ? (
            <Typography>No products available</Typography>
          ) : (
            products.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                <Card
                  sx={{
                    height: "100%",
                    cursor: "pointer",
                    transition: "0.3s",
                    "&:hover": { transform: "translateY(-5px)" }
                  }}
                  component={Link}
                  to={`/product/${product._id}`}
                >
                  <CardMedia
                    component="img"
                    height="160"
                    image={product.image}
                    alt={product.title}
                  />
                  <CardContent>
                    <Typography sx={{ fontWeight: "bold" }}>
                      {product.title}
                    </Typography>
                    <Typography color="text.secondary">
                      ₹{product.price}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Container>

      {/* ⭐ Featured Section (optional static) */}
      <Container sx={{ mt: 6 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
          Featured Drinks
        </Typography>

        <Grid container spacing={3}>
          {products.slice(0, 3).map((product) => (
            <Grid item xs={12} sm={4} key={product._id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={product.image}
                />
                <CardContent>
                  <Typography>{product.title}</Typography>
                  <Typography color="text.secondary">
                    ₹{product.price}
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{ mt: 1 }}
                    component={Link}
                    to={`/product/${product._id}`}
                  >
                    Buy Now
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
};

export default Home;
