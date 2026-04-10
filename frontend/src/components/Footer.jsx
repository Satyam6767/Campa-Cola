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
            <img
                src="/final-logo.jpeg"
                alt="Logo"
                style={{ width: 150 }}
                loading="lazy"
              />
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
            <Typography className="footer-text">📍Station Road, Near Pani <br /> Tanki

              Pupri,843320 Bihar India</Typography>
            <Typography className="footer-text">📞 +91 8210038214</Typography>
            <Typography className="footer-text">✉️ Jankienterprises252522@gmail.com</Typography>
          </Grid>

          {/* MAP */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography className="footer-heading">
              Find Us
            </Typography>
            <Box className="footer-map">
              <iframe
  title="Janki Enterprises Location"
  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3571.6334006465154!2d85.6976011!3d26.4675435!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ec517093337179%3A0xa3f23c0bc6354aaf!2sJanki%20Enterprises!5e0!3m2!1sen!2sin!4v1775821137938!5m2!1sen!2sin"
  width="100%"
  height="180"
  style={{ border: 0 }}
  allowFullScreen
  loading="lazy"
  referrerPolicy="no-referrer-when-downgrade"
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
