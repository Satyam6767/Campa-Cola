import { Box, Typography, Button, Container } from "@mui/material";
import "../mystyle/HeroSection.css";
import image1 from "../assets/campa-cola-200.png"
import image2 from "../assets/campa cola orange.png"
import image3 from "../assets/campa power up.png"

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
            <img src={image1} alt="Campa Cola Bottle" loading="lazy" />
            <img src={image2} alt="Campa Cola Bottle" loading="lazy" />
            <img src={image3} alt="Campa Cola Bottle" loading="lazy" />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection;
