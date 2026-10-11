
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  ArrowUpRight,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import "./PublicFooter.css";

function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="public-footer">
      <div className="public-footer-container">

        {/* =========================
            MAIN FOOTER
        ========================= */}
        <div className="public-footer-main">

          {/* BRAND */}
          <div className="public-footer-brand">
            <Link to="/" className="public-footer-logo">
              <div className="public-footer-logo-icon">
                <ShieldCheck size={22} />
              </div>

              <div>
                <strong>SmartCity</strong>
                <span>Digital Governance</span>
              </div>
            </Link>

            <p>
              A connected digital platform designed to simplify public
              services, improve civic communication, and support smarter
              city operations.
            </p>

            <div className="public-footer-status">
              <span className="status-dot"></span>
              <span>Digital Services Online</span>
            </div>
          </div>

          {/* PLATFORM */}
          <div className="public-footer-column">
            <h4>Platform</h4>

            <Link to="/">Home</Link>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/login">Sign In</Link>
            <Link to="/register">Create Account</Link>
          </div>

          {/* SERVICES */}
          <div className="public-footer-column">
            <h4>Services</h4>

            <a href="#services">Citizen Services</a>
            <a href="#services">Complaint Management</a>
            <a href="#services">Service Requests</a>
            <a href="#services">Appointments</a>
            <a href="#services">Digital Payments</a>
          </div>

          {/* CONTACT */}
          <div className="public-footer-column public-footer-contact">
            <h4>Get In Touch</h4>

            <a href="mailto:info@smartcity.gov">
              <Mail size={15} />
              <span>info@smartcity.gov</span>
            </a>

            <a href="tel:+92511234567">
              <Phone size={15} />
              <span>+92 51 1234567</span>
            </a>

            <div className="footer-contact-item">
              <MapPin size={15} />
              <span>
                Islamabad Capital Territory,
                Pakistan
              </span>
            </div>
          </div>
        </div>

        {/* =========================
            CTA
        ========================= */}
        <div className="public-footer-cta">

          <div>
            <span className="footer-cta-label">
              SMARTER CITY. BETTER SERVICES.
            </span>

            <h3>
              Connect with your city digitally.
            </h3>
          </div>

          <Link
            to="/register"
            className="footer-cta-button"
          >
            Get Started
            <ArrowUpRight size={17} />
          </Link>
        </div>

        {/* =========================
            BOTTOM FOOTER
        ========================= */}
        <div className="public-footer-bottom">

          <p>
            © {currentYear} SmartCity Digital Governance.
            All rights reserved.
          </p>

          <div className="public-footer-legal">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#accessibility">Accessibility</a>
          </div>

          {/* SOCIAL LINKS */}
          <div className="public-footer-socials">

            <a
              href="#facebook"
              aria-label="Facebook"
            >
              f
            </a>

            <a
              href="#twitter"
              aria-label="Twitter"
            >
              𝕏
            </a>

            <a
              href="#linkedin"
              aria-label="LinkedIn"
            >
              in
            </a>

          </div>

        </div>

      </div>
    </footer>
  );
}

export default PublicFooter;

