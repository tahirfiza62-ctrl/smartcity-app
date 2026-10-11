import { Link, NavLink } from "react-router-dom";
import { ArrowRight, Menu, X, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./PublicNavbar.css";

function PublicNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <motion.header
      className="public-navbar"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <div className="public-navbar-container">
        <Link to="/" className="public-logo" onClick={closeMenu}>
          <div className="public-logo-icon">
            <ShieldCheck size={23} />
          </div>

          <div className="public-logo-text">
            <strong>SmartCity</strong>
            <span>Digital Governance</span>
          </div>
        </Link>

        <nav className="public-nav-links">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "public-nav-link active" : "public-nav-link"
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive ? "public-nav-link active" : "public-nav-link"
            }
          >
            About
          </NavLink>

          <NavLink
            to="/contact"
            className={({ isActive }) =>
              isActive ? "public-nav-link active" : "public-nav-link"
            }
          >
            Contact
          </NavLink>
        </nav>

        <div className="public-nav-actions">
          <Link to="/login" className="public-login">
            Sign In
          </Link>

          <Link to="/register" className="public-register">
            Get Started
            <ArrowRight size={16} />
          </Link>
        </div>

        <button
          className="public-menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-public-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Link to="/" onClick={closeMenu}>
              Home
            </Link>

            <Link to="/about" onClick={closeMenu}>
              About
            </Link>

            <Link to="/contact" onClick={closeMenu}>
              Contact
            </Link>

            <Link to="/login" onClick={closeMenu}>
              Sign In
            </Link>

            <Link to="/register" onClick={closeMenu}>
              Get Started
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export default PublicNavbar;