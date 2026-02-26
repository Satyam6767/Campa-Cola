import { Box, Typography, Container } from "@mui/material";
import "../mystyle/WhyChooseUs.css";

const features = [
  {
    title: "Premium Quality Products",
    desc: "We deliver high-quality and reliable products that meet industry standards and customer expectations.",
    icon: "🏆",
  },
  {
    title: "Wide Product Range",
    desc: "Janki Enterprises offers a wide variety of products to fulfill diverse customer needs efficiently.",
    icon: "📦",
  },
  {
    title: "Timely Delivery",
    desc: "We ensure on-time delivery with a strong distribution network and professional logistics support.",
    icon: "🚚",
  },
  {
    title: "Experienced Team",
    desc: "Our experienced professionals ensure smooth operations, quality assurance, and excellent service.",
    icon: "👨‍💼",
  },
  {
    title: "Competitive Pricing",
    desc: "We provide cost-effective solutions without compromising on product quality and service standards.",
    icon: "💰",
  },
  {
    title: "Customer Satisfaction",
    desc: "Customer satisfaction is our top priority. We build long-term relationships through trust and reliability.",
    icon: "🤝",
  },
];

const WhyChooseUs = () => {
  return (
    <Box className="why-section">
      <Container maxWidth="xl">

       <Box className="section-header">
  <Typography className="section-tag">
    our strengths
  </Typography>

  <Typography className="section-title">
    <span>WHY CHOOSE US</span>
  </Typography>
</Box>

        <Box className="why-grid">
          {features.map((item, index) => (
            <Box className="why-card" key={index}>
              <Box className="why-icon">
                {item.icon}
              </Box>

              <Typography className="why-card-title">
                {item.title}
              </Typography>

              <Typography className="why-card-desc">
                {item.desc}
              </Typography>
            </Box>
          ))}
        </Box>

      </Container>
    </Box>
  );
};

export default WhyChooseUs;