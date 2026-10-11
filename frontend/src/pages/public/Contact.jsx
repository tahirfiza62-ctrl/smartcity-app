
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Clock3,
  Send,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import PublicNavbar from "../../components/PublicNavbar";
import PublicFooter from "../../components/PublicFooter";
import "./Contact.css";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Contact form submitted:", formData);

    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <div className="contact-page">
      <PublicNavbar />

      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="contact-hero">
        <div className="contact-hero-grid"></div>

        <div className="contact-glow contact-glow-one"></div>
        <div className="contact-glow contact-glow-two"></div>

        <div className="contact-container">

          <motion.div
            className="contact-hero-content"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="contact-eyebrow">
              <span></span>
              CONTACT SMARTCITY
            </div>

            <h1>
              Let's improve
              <span> city services together.</span>
            </h1>

            <p>
              Have a question about SmartCity, digital services, or
              citizen support? Send us a message and our team will
              help direct your request.
            </p>

            <div className="contact-hero-badge">
              <ShieldCheck size={16} />
              <span>Connected. Secure. Accessible.</span>
            </div>
          </motion.div>

        </div>
      </section>

      {/* =====================================================
          CONTACT CONTENT
      ===================================================== */}
      <section className="contact-main-section">
        <div className="contact-container">

          <div className="contact-layout">

            {/* LEFT */}
            <motion.div
              className="contact-info"
              initial={{ opacity: 0, x: -25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="contact-section-label">
                GET IN TOUCH
              </div>

              <h2>
                We're here to
                <span> help.</span>
              </h2>

              <p className="contact-info-description">
                Whether you need information about the platform or
                want to report an issue, use the contact options below
                to reach the SmartCity support team.
              </p>

              {/* CONTACT ITEMS */}
              <div className="contact-info-list">

                <div className="contact-info-card">
                  <div className="contact-info-icon">
                    <Mail size={18} />
                  </div>

                  <div>
                    <span>Email</span>
                    <strong>info@smartcity.gov</strong>
                    <p>General platform inquiries</p>
                  </div>
                </div>

                <div className="contact-info-card">
                  <div className="contact-info-icon">
                    <Phone size={18} />
                  </div>

                  <div>
                    <span>Phone</span>
                    <strong>+92 51 1234567</strong>
                    <p>Citizen support line</p>
                  </div>
                </div>

                <div className="contact-info-card">
                  <div className="contact-info-icon">
                    <MapPin size={18} />
                  </div>

                  <div>
                    <span>Office</span>
                    <strong>Islamabad Capital Territory</strong>
                    <p>Pakistan</p>
                  </div>
                </div>

                <div className="contact-info-card">
                  <div className="contact-info-icon">
                    <Clock3 size={18} />
                  </div>

                  <div>
                    <span>Support Hours</span>
                    <strong>Monday – Friday</strong>
                    <p>9:00 AM – 5:00 PM</p>
                  </div>
                </div>

              </div>
            </motion.div>

            {/* RIGHT FORM */}
            <motion.div
              className="contact-form-wrapper"
              initial={{ opacity: 0, x: 25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="contact-form-header">
                <div className="contact-form-icon">
                  <MessageSquare size={19} />
                </div>

                <div>
                  <span>SEND A MESSAGE</span>
                  <h3>How can we help?</h3>
                </div>
              </div>

              <form
                className="contact-form"
                onSubmit={handleSubmit}
              >

                <div className="contact-form-row">

                  <div className="contact-field">
                    <label htmlFor="name">
                      Full Name
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="contact-field">
                    <label htmlFor="email">
                      Email Address
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                </div>

                <div className="contact-field">
                  <label htmlFor="subject">
                    Subject
                  </label>

                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    placeholder="What is your message about?"
                    value={formData.subject}
                    onChange={handleChange}
                  />
                </div>

                <div className="contact-field">
                  <label htmlFor="message">
                    Message
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    rows="6"
                    placeholder="Write your message here..."
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="contact-submit-button"
                >
                  Send Message
                  <Send size={15} />
                </button>

                <p className="contact-form-note">
                  Your message will be handled by the SmartCity
                  support team.
                </p>

              </form>
            </motion.div>

          </div>
        </div>
      </section>

      {/* =====================================================
          QUICK SUPPORT
      ===================================================== */}
      <section className="contact-support-section">
        <div className="contact-container">

          <div className="contact-support">

            <div className="contact-support-icon">
              <MessageSquare size={21} />
            </div>

            <div>
              <span>ALREADY A CITIZEN?</span>

              <h3>
                Access your digital services directly.
              </h3>

              <p>
                Sign in to manage complaints, service requests,
                appointments, payments, and notifications.
              </p>
            </div>

            <Link
              to="/login"
              className="contact-support-button"
            >
              Sign In
              <ArrowRight size={16} />
            </Link>

          </div>

        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

export default Contact;

