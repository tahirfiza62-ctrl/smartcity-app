
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Building2,
  Users,
  Globe2,
  CheckCircle2,
  ArrowRight,
  Target,
  Eye,
  Lightbulb,
} from "lucide-react";
import { Link } from "react-router-dom";
import PublicNavbar from "../../components/PublicNavbar";
import PublicFooter from "../../components/PublicFooter";
import "./About.css";

function About() {
  const stats = [
    {
      value: "8M+",
      label: "Citizens Served",
    },
    {
      value: "45",
      label: "Departments",
    },
    {
      value: "3500+",
      label: "City Assets",
    },
    {
      value: "500+",
      label: "Daily Complaints",
    },
  ];

  const capabilities = [
    "Centralized citizen service management",
    "Digital complaint and issue tracking",
    "Department-level workflow management",
    "Real-time city operations monitoring",
    "GIS-based infrastructure visibility",
    "Secure digital communication",
  ];

  return (
    <div className="about-page">
      <PublicNavbar />

      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="about-hero">
        <div className="about-hero-grid"></div>
        <div className="about-glow about-glow-one"></div>
        <div className="about-glow about-glow-two"></div>

        <div className="about-container">

          <motion.div
            className="about-hero-content"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="about-eyebrow">
              <span></span>
              ABOUT SMARTCITY
            </div>

            <h1>
              Building a more
              <span> connected city.</span>
            </h1>

            <p>
              SmartCity brings citizens, government departments, services,
              infrastructure, and city operations together through one
              centralized digital platform.
            </p>

            <div className="about-hero-actions">
              <Link to="/register" className="about-primary-button">
                Join the Platform
                <ArrowRight size={16} />
              </Link>

              <Link to="/contact" className="about-secondary-button">
                Contact Us
              </Link>
            </div>
          </motion.div>

          {/* HERO VISUAL */}
          <motion.div
            className="about-hero-visual"
            initial={{ opacity: 0, x: 35 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            <div className="about-visual-card">

              <div className="about-visual-top">
                <div className="about-visual-title">
                  <ShieldCheck size={18} />
                  <span>SMART CITY OPERATIONS</span>
                </div>

                <span className="about-live">
                  <i></i>
                  LIVE
                </span>
              </div>

              <div className="about-city-preview">
                <div className="city-circle city-circle-one"></div>
                <div className="city-circle city-circle-two"></div>

                <div className="city-node node-one">
                  <Building2 size={15} />
                </div>

                <div className="city-node node-two">
                  <Users size={15} />
                </div>

                <div className="city-node node-three">
                  <Globe2 size={15} />
                </div>

                <div className="city-line line-one"></div>
                <div className="city-line line-two"></div>
                <div className="city-line line-three"></div>

                <div className="city-center">
                  <ShieldCheck size={25} />
                  <span>CONNECTED</span>
                </div>
              </div>

              <div className="about-visual-footer">
                <div>
                  <strong>45</strong>
                  <span>Departments</span>
                </div>

                <div>
                  <strong>8M+</strong>
                  <span>Citizens</span>
                </div>

                <div>
                  <strong>24/7</strong>
                  <span>Monitoring</span>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          STATS
      ===================================================== */}
      <section className="about-stats-section">
        <div className="about-container">
          <div className="about-stats-grid">
            {stats.map((stat, index) => (
              <motion.div
                className="about-stat"
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                }}
              >
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          WHO WE ARE
      ===================================================== */}
      <section className="about-intro-section">
        <div className="about-container">
          <div className="about-intro-grid">

            <motion.div
              className="about-intro-heading"
              initial={{ opacity: 0, x: -25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="about-section-label">
                WHO WE ARE
              </div>

              <h2>
                One digital platform for
                <span> smarter governance.</span>
              </h2>
            </motion.div>

            <motion.div
              className="about-intro-content"
              initial={{ opacity: 0, x: 25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p>
                SmartCity is an enterprise digital governance platform
                designed to connect citizens with the services and
                departments responsible for managing modern cities.
              </p>

              <p>
                Instead of relying on disconnected systems and manual
                processes, the platform creates a shared digital
                environment where requests, complaints, appointments,
                payments, assets, and operational information can be
                managed more efficiently.
              </p>

              <div className="about-check-list">
                {capabilities.map((item) => (
                  <div className="about-check-item" key={item}>
                    <CheckCircle2 size={16} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* =====================================================
          MISSION / VISION
      ===================================================== */}
      <section className="about-values-section">
        <div className="about-container">

          <div className="about-section-heading">
            <div className="about-section-label">
              OUR DIRECTION
            </div>

            <h2>
              Designed around people,
              <span> services and cities.</span>
            </h2>
          </div>

          <div className="about-values-grid">

            <motion.div
              className="about-value-card"
              whileHover={{ y: -5 }}
            >
              <div className="about-value-icon">
                <Target size={21} />
              </div>

              <span className="about-value-number">
                01
              </span>

              <h3>Our Mission</h3>

              <p>
                To make public services easier to access by providing
                citizens and government departments with a unified,
                transparent, and efficient digital platform.
              </p>
            </motion.div>

            <motion.div
              className="about-value-card"
              whileHover={{ y: -5 }}
            >
              <div className="about-value-icon">
                <Eye size={21} />
              </div>

              <span className="about-value-number">
                02
              </span>

              <h3>Our Vision</h3>

              <p>
                To support connected cities where technology improves
                communication, service delivery, infrastructure management,
                and everyday civic experiences.
              </p>
            </motion.div>

            <motion.div
              className="about-value-card"
              whileHover={{ y: -5 }}
            >
              <div className="about-value-icon">
                <Lightbulb size={21} />
              </div>

              <span className="about-value-number">
                03
              </span>

              <h3>Our Approach</h3>

              <p>
                We bring data, people, departments, and workflows together
                so city operations can be monitored, coordinated, and
                improved through one digital environment.
              </p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* =====================================================
          CTA
      ===================================================== */}
      <section className="about-cta-section">
        <div className="about-container">
          <motion.div
            className="about-cta"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div>
              <span>SMARTER GOVERNANCE STARTS WITH CONNECTION</span>

              <h2>
                Ready to connect with your city?
              </h2>

              <p>
                Create your account and access digital civic services
                through the SmartCity platform.
              </p>
            </div>

            <Link
              to="/register"
              className="about-cta-button"
            >
              Get Started
              <ArrowRight size={17} />
            </Link>
          </motion.div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

export default About;

