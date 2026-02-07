import { Box, Typography, Button, Container } from "@mui/material";
import "../mystyle/HeroSection.css";

const HeroSection = () => {
  return (
    <Box className="hero-section">
      <Container maxWidth="lg">
        <Box className="hero-content">
          {/* LEFT */}
          <Box className="hero-text">
            <Typography className="hero-brand">
              CAMPA COLA
            </Typography>

            <Typography className="hero-title">
              Janki Enterprises <span>PUPRI</span>
            </Typography>

            <Typography className="hero-desc">
              Bold taste, iconic fizz, and pure nostalgia.
              Experience the legendary Indian cola again.
            </Typography>

            <Box className="hero-buttons">
              <Button variant="contained" className="hero-btn primary">
                Order Now
              </Button>
              <Button variant="outlined" className="hero-btn secondary">
                Explore More
              </Button>
            </Box>
          </Box>

          {/* RIGHT */}
          <Box className="hero-image">
            <img src="../../dist/campa-cola-200.png" alt="Campa Cola Bottle" />
            <img src="../../dist/campa cola orange.png" alt="Campa Cola Bottle" />
            <img src="../../dist/campa power up.png" alt="Campa Cola Bottle" />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection;
