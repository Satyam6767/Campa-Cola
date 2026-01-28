import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";

const Footer = () => {
  return (
    <>
      <style>{`
        .footer {
          background: #111;
          color: #ddd;
          padding: 50px 20px 0;
          font-family: Arial, sans-serif;
        }

        .footer-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 30px;
        }

        .footer-box h3 {
          margin-bottom: 15px;
          color: #fff;
          position: relative;
        }

        .footer-box h3::after {
          content: "";
          width: 40px;
          height: 3px;
          background: #e63946;
          position: absolute;
          left: 0;
          bottom: -5px;
        }

        .footer-logo {
          width: 120px;
          margin-bottom: 15px;
        }

        .footer-box p {
          line-height: 1.6;
          font-size: 14px;
          margin-bottom: 10px;
        }

        .footer-box ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-box ul li {
          margin-bottom: 10px;
        }

        .footer-box ul li a {
          text-decoration: none;
          color: #bbb;
          transition: 0.3s ease;
        }

        .footer-box ul li a:hover {
          color: #e63946;
          padding-left: 6px;
        }

        .footer-box svg {
          color: #e63946;
          margin-right: 8px;
        }

        .footer-box iframe {
          width: 100%;
          height: 180px;
          border: none;
          border-radius: 8px;
        }

        .footer-bottom {
          text-align: center;
          padding: 15px;
          margin-top: 30px;
          background: #000;
          font-size: 14px;
          color: #aaa;
        }

        @media (max-width: 768px) {
          .footer {
            text-align: center;
          }

          .footer-box h3::after {
            left: 50%;
            transform: translateX(-50%);
          }
        }
      `}</style>

      <footer className="footer">
        <div className="footer-container">

          {/* About */}
          <div className="footer-box">
            <img
              src="/logo.png"
              alt="Studio 7 Interior"
              className="footer-logo"
            />
            <p>
              We are your trusted partner in transforming spaces into captivating
              works of art. With a passion for interior design, we turn your
              dream spaces into reality.
            </p>
          </div>

          {/* Navigation */}
          <div className="footer-box">
            <h3>Navigation</h3>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/about">About Us</a></li>
              <li><a href="/residential">Residential Projects</a></li>
              <li><a href="/commercial">Commercial Projects</a></li>
              <li><a href="/contact">Contact Us</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-box">
            <h3>Contact Info</h3>
            <p><FaMapMarkerAlt /> Kothrud, Pune - 411038</p>
            <p><FaPhoneAlt /> +91 98221 93456</p>
            <p><FaEnvelope /> studio7baner@gmail.com</p>
          </div>

          {/* Map */}
          <div className="footer-box">
            <h3>Locate Us</h3>
            <iframe
              title="map"
              src="https://www.google.com/maps?q=Studio%207%20Interior%20Designers%20Pune&output=embed"
              loading="lazy"
            ></iframe>
          </div>

        </div>

        <div className="footer-bottom">
          © {new Date().getFullYear()} Studio 7 Interior. All Rights Reserved.
        </div>
      </footer>
    </>
  );
};

export default Footer;
