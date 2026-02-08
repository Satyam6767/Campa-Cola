import { Box, Typography, Container } from "@mui/material";
import "../mystyle/AboutSection.css";
import image1 from "../assets/campacola.jpg";
import image2 from "../assets/campacola-abt2.jpg";

const AboutSection = () => {
  return (
    <Box className="about-section">
      <Container maxWidth="lg">

        {/* ===== SECTION HEADER (CENTER) ===== */}
        <Box className="section-header">
          <Typography className="section-tag">
            taste, quality, and refreshment
          </Typography>

          <Typography className="section-title">
            <span>ABOUT US</span>
          </Typography>

          {/* <Typography className="section-subtitle">
            A legacy of bold taste, quality, and refreshment
          </Typography> */}
        </Box>

        {/* ===== CONTENT ===== */}
        <Box className="about-content">
          
          {/* LEFT – IMAGES */}
          <Box className="about-images">
            <img src={image1} alt="Campa Cola Distribution" className="img-main" loading="lazy" />
            <img src={image2} alt="Campa Cola Bottles" className="img-overlap" loading="lazy" />
          </Box>

          {/* RIGHT – TEXT */}
          <Box className="about-text">
            {/* <Typography className="about-tag">
              CAMPA COLA
            </Typography> */}

            <Typography className="about-title">
              Janki Enterprises <span>PUPRI</span>
            </Typography>

            <Typography className="about-desc">
              Janki Enterprises is an authorized distributor of Campa Cola,
              proudly serving Pupri with authentic and refreshing beverages.
              We focus on quality, reliability, and building long-term trust
              with our customers.
            </Typography>

            <Typography className="about-desc">
              From retail outlets to large orders, we ensure timely delivery
              and consistent taste that brings back the nostalgia of India’s
              most iconic cola brand.
            </Typography>
          </Box>

        </Box>
      </Container>
    </Box>
  );
};

export default AboutSection;
