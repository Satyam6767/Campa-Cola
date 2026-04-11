import {
  FaPhoneAlt,
  FaEnvelope,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
} from "react-icons/fa";
import "../mystyle/Header.css";

const Header = () => {
  return (
    <header className="app-header">
      {/* LEFT SIDE */}
      <div className="header-left">
       

        <div className="header-contact">
          <div className="contact-item">
            <FaPhoneAlt />
            <span>+91 8210038214</span>
          </div>

          <div className="contact-item">
            <FaEnvelope />
            <span>Jankienterprises252522@gmail.com</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="header-right">
        <a href="#" aria-label="Facebook">
          <FaFacebookF />
        </a>
        <a href="#" aria-label="Instagram">
          <FaInstagram />
        </a>
        <a href="#" aria-label="Instagram">
          <FaLinkedinIn />
        </a>
         <a href="#" aria-label="Twitter">
          <FaTwitter />
        </a>
      </div>
    </header>
  );
};

export default Header;
