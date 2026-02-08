import { Box, Typography, Container, Grid, Link } from "@mui/material";
import "../mystyle/Footer.css";

const Footer = () => {
  return (
    <Box className="footer">
      <Container maxWidth="lg">
        <Grid
          container
          spacing={4}
          alignItems="flex-start"   // ✅ IMPORTANT FIX
          justifyContent="space-between"
        >

          {/* BRAND */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography className="footer-title">
              Campa Cola
            </Typography>
            <Typography className="footer-desc">
              Janki Enterprises is an authorized <br /> distributor of Campa Cola,
              delivering quality  <br /> and refreshment with trust and reliability.
            </Typography>
          </Grid>

          {/* QUICK LINKS */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography className="footer-heading">
              Quick Links
            </Typography>
            <ul className="footer-links">
              <li><Link href="/" underline="none">Home</Link></li>
              <li><Link href="/products" underline="none">Products</Link></li>
              <li><Link href="/about" underline="none">About</Link></li>
              <li><Link href="/contact" underline="none">Contact</Link></li>
            </ul>
          </Grid>

          {/* CONTACT */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography className="footer-heading">
              Contact
            </Typography>
            <Typography className="footer-text">📍 Pupri, Bihar, India</Typography>
            <Typography className="footer-text">📞 +91 98765 43210</Typography>
            <Typography className="footer-text">✉️ jankienterprises@gmail.com</Typography>
          </Grid>

          {/* MAP */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography className="footer-heading">
              Find Us
            </Typography>
            <Box className="footer-map">
              <iframe
                title="Janki Enterprises Location"
                src="https://www.google.com/maps?q=Pupri%20Bihar&output=embed"
                width="100%"
                height="180"
                style={{ border: 0 }}
                loading="lazy"
              />
            </Box>
          </Grid>

        </Grid>

        {/* COPYRIGHT */}
        <Box className="footer-bottom">
          <Typography className="footer-copy">
            © 2026 Janki Enterprises | Campa Cola Distributor
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
