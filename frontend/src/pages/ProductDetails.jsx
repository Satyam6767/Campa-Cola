import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/api";
import { Container, Typography, CardMedia, Button, CircularProgress } from "@mui/material";
import { toast } from "react-toastify";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [product, setProduct] = useState(null);

  const fetchProduct = async () => {
    try {
      const { data } = await API.get(`/products/${id}`);
      setProduct(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  const handleAddToCart = async () => {
    if (!token) return navigate("/login");

    try {
      await API.post(
        "/cart/add",
        { productId: product._id, quantity: 1 },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Added to cart!");
    } catch (err) {
      console.log(err);
    }
  };

  if (!product)
    return (
      <CircularProgress
        sx={{ mt: 10, display: "block", mx: "auto" }}
      />
    );

  return (
    <Container sx={{ mt: 4 }}>
      <CardMedia
        component="img"
        image={product.image}
        height="300"
        sx={{ objectFit: "contain", mb: 3 }}
      />
      <Typography variant="h5" sx={{ fontWeight: "bold" }}>
        {product.title}
      </Typography>
      <Typography variant="h6" color="green" sx={{ mt: 1 }}>
        ₹{product.price}
      </Typography>
      <Typography sx={{ mt: 2 }}>{product.description}</Typography>

      <Button
        variant="contained"
        sx={{ mt: 3 }}
        onClick={handleAddToCart}
      >
        Add to Cart
      </Button>
    </Container>
  );
};

export default ProductDetails;
