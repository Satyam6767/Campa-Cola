import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Container, Typography, Button, Box } from "@mui/material";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const address = location.state?.address;

  useEffect(() => {
    if (!address) {
      navigate("/cart");
      return;
    }

    const timer = setTimeout(() => {
      navigate("/orders");
    }, 3000);

    return () => clearTimeout(timer);
  }, [address, navigate]);

  return (
    <Container sx={{ textAlign: "center", mt: 10 }}>
      <Box>
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Yes_Check_Circle.svg/512px-Yes_Check_Circle.svg.png"
          alt="Order Success"
          width={130}
        />
      </Box>

      <Typography variant="h4" sx={{ fontWeight: "bold", mt: 2 }}>
        Order Placed Successfully! 🎉
      </Typography>

      <Typography sx={{ mt: 1, color: "gray" }}>
        Thank you for choosing Campa Cola 🥤<br />
        You will be redirected shortly...
      </Typography>

      <Button
        variant="contained"
        sx={{ mt: 4 }}
        onClick={() => navigate("/orders")}
      >
        View Orders Now
      </Button>
    </Container>
  );
};

export default OrderSuccess;
