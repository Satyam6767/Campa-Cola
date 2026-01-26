import { useEffect, useState } from "react";
import API from "../api/api";
import { Grid, Card, CardMedia, CardContent, Typography, CircularProgress, Container, Button } from "@mui/material";
import { Link } from "react-router-dom";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const { data } = await API.get("/products/all");
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) return <CircularProgress sx={{ display: "block", mx: "auto", mt: 10 }} />;

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
        All Products
      </Typography>

      <Grid container spacing={3}>
        {products.map((p) => (
          <Grid item xs={12} sm={4} md={3} key={p._id}>
            <Card>
              <CardMedia
                component="img"
                height="180"
                image={p.image}
                alt={p.title}
              />
              <CardContent>
                <Typography sx={{ fontWeight: "bold" }}>{p.title}</Typography>
                <Typography color="text.secondary">₹{p.price}</Typography>

                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to={`/product/${p._id}`}
                  sx={{ mt: 1 }}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Products;
