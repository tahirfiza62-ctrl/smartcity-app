
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock3,
  FileText,
  Globe2,
  Map,
  MapPinned,
  MessageSquare,
  PhoneCall,
  ShieldCheck,
  Siren,
  Wrench,
  Activity,
  Radio,
  Bell,

  Search,

  ClipboardCheck,
  Route,

  BarChart3,
  ChevronRight,
  Zap,
} from "lucide-react";

import PublicNavbar from "../../components/PublicNavbar";
import PublicFooter from "../../components/PublicFooter";
import "./Home.css";


/* =========================================================
   CITY STATISTICS
========================================================= */

const cityStats = [
  {
    number: "8M+",
    label: "Citizens",
    description: "Supported by the platform",
  },
  {
    number: "45",
    label: "Departments",
    description: "Connected across the city",
  },
  {
    number: "25",
    label: "Hospitals",
    description: "Included in the service network",
  },
  {
    number: "3,500+",
    label: "Public Assets",
    description: "Tracked and managed",
  },
];


/* =========================================================
   SERVICES
========================================================= */

const services = [
  {
    icon: MessageSquare,
    title: "Citizen Complaints",
    description:
      "Report road damage, streetlight issues, sanitation problems and other civic concerns. Citizens can follow the progress of each complaint.",
  },
  {
    icon: FileText,
    title: "Service Requests",
    description:
      "Submit requests for municipal and public services without having to visit multiple government offices.",
  },
  {
    icon: MapPinned,
    title: "GIS & City Mapping",
    description:
      "View complaints, infrastructure, public assets and operational information using location-based city data.",
  },
  {
    icon: Siren,
    title: "Emergency Coordination",
    description:
      "Support communication and coordination between emergency departments during incidents and critical situations.",
  },
];


/* =========================================================
   DEPARTMENTS
========================================================= */

const departments = [
  "Health",
  "Education",
  "Transport",
  "Municipal Services",
  "Water & Utilities",
  "Emergency Services",
];


/* =========================================================
   WORKFLOW
========================================================= */

const workflow = [
  {
    icon: ClipboardCheck,
    step: "01",
    title: "Submit",
    text: "A citizen submits a complaint or service request with the required information.",
  },
  {
    icon: Route,
    step: "02",
    title: "Assign",
    text: "The request is routed to the relevant government department for handling.",
  },
  {
    icon: Search,
    step: "03",
    title: "Review",
    text: "An officer reviews the request and determines the action required.",
  },
  {
    icon: Wrench,
    step: "04",
    title: "Resolve",
    text: "Field teams or responsible officers take action and update the request.",
  },
  {
    icon: CheckCircle2,
    step: "05",
    title: "Close",
    text: "The citizen is notified after the issue has been resolved or the service completed.",
  },
];


/* =========================================================
   BENEFITS
========================================================= */

const benefits = [
  {
    icon: Clock3,
    title: "Faster Processing",
    text: "Digital workflows reduce unnecessary manual handling and make requests easier to track.",
  },
  {
    icon: Bell,
    title: "Better Communication",
    text: "Citizens receive updates instead of having to repeatedly contact departments.",
  },
  {
    icon: BarChart3,
    title: "Operational Visibility",
    text: "Department dashboards provide a clearer view of workloads, requests and city activity.",
  },
  {
    icon: ShieldCheck,
    title: "Accountable Operations",
    text: "Role-based access and activity records help maintain responsibility across workflows.",
  },
];


/* =========================================================
   ANIMATION
========================================================= */

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 28,
  },

  visible: {
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.65,
      ease: "easeOut",
    },
  },
};


const stagger = {
  hidden: {},

  visible: {
    transition: {
      staggerChildren: 0.09,
    },
  },
};


/* =========================================================
   HOME
========================================================= */

function Home() {
  return (
    <div className="home-page">

      <PublicNavbar />


      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="smart-hero">

        <div className="hero-grid"></div>

        <div className="hero-glow hero-glow-one"></div>
        <div className="hero-glow hero-glow-two"></div>


        <div className="hero-container">

          {/* =================================================
              LEFT CONTENT
          ================================================= */}

          <motion.div
            className="hero-content"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
            }}
          >

            <motion.div
              className="hero-eyebrow"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.2,
                duration: 0.5,
              }}
            >
              <span className="status-dot"></span>

              CITY OPERATIONS PLATFORM
            </motion.div>


            <h1>
              One platform for a
              <span> smarter, connected city.</span>
            </h1>


            <p className="hero-description">
              Bring citizen services, government departments, public
              assets and emergency operations together in one digital
              platform. Track requests, coordinate work and understand
              what is happening across the city.
            </p>


            <div className="hero-actions">

              <Link
                to="/register"
                className="hero-primary-btn"
              >
                Access the Platform

                <ArrowRight size={17} />
              </Link>


              <Link
                to="/about"
                className="hero-secondary-btn"
              >
                Explore Platform
              </Link>

            </div>


            <div className="hero-trust">

              <div className="trust-icon">
                <ShieldCheck size={17} />
              </div>

              <div>
                <strong>
                  Built for public-sector operations
                </strong>

                <span>
                  Designed around citizens, departments and
                  city-wide workflows
                </span>
              </div>

            </div>

          </motion.div>


          {/* =================================================
              DASHBOARD
          ================================================= */}

          <motion.div
            className="hero-dashboard-wrapper"
            initial={{
              opacity: 0,
              x: 55,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1,
            }}
            transition={{
              duration: 0.9,
              delay: 0.2,
              ease: "easeOut",
            }}
          >

            <div className="dashboard-glow"></div>


            <div className="dashboard-window">

              {/* WINDOW HEADER */}

              <div className="window-top">

                <div className="window-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>


                <div className="window-title">
                  <ShieldCheck size={13} />
                  SmartCity Dashboard
                </div>


                <div className="window-status">
                  <span></span>
                  Live
                </div>

              </div>


              {/* DASHBOARD BODY */}

              <div className="dashboard-body">


                {/* MINI SIDEBAR */}

                <aside className="mini-sidebar">

                  <div className="mini-logo">
                    <ShieldCheck size={17} />
                  </div>


                  <div className="mini-nav active">
                    <Building2 size={15} />
                  </div>


                  <div className="mini-nav">
                    <MessageSquare size={15} />
                  </div>


                  <div className="mini-nav">
                    <MapPinned size={15} />
                  </div>


                  <div className="mini-nav">
                    <Siren size={15} />
                  </div>


                  <div className="mini-nav">
                    <BarChart3 size={15} />
                  </div>

                </aside>


                {/* MINI CONTENT */}

                <div className="mini-content">


                  {/* MINI HEADER */}

                  <div className="mini-header">

                    <div>
                      <span>OVERVIEW</span>

                      <h3>
                        City Operations
                      </h3>
                    </div>


                    <div className="mini-date">
                      <Clock3 size={13} />
                      Live Data
                    </div>

                  </div>


                  {/* MINI STATS */}

                  <div className="mini-stats">

                    <div className="mini-stat-card">

                      <span>
                        Total Requests
                      </span>

                      <strong>
                        12,482
                      </strong>

                      <small>
                        +12.4%
                      </small>

                    </div>


                    <div className="mini-stat-card">

                      <span>
                        Resolved
                      </span>

                      <strong>
                        9,840
                      </strong>

                      <small>
                        +8.7%
                      </small>

                    </div>


                    <div className="mini-stat-card">

                      <span>
                        Active Issues
                      </span>

                      <strong>
                        128
                      </strong>

                      <small>
                        Today
                      </small>

                    </div>

                  </div>


                  {/* MAIN GRID */}

                  <div className="mini-main-grid">


                    {/* CHART */}

                    <div className="mini-chart-card">

                      <div className="chart-heading">

                        <div>
                          <span>
                            REQUEST ACTIVITY
                          </span>

                          <strong>
                            Weekly Overview
                          </strong>
                        </div>

                        <ChevronRight size={15} />

                      </div>


                      <div className="fake-chart">

                        <div className="chart-lines">
                          <span></span>
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>


                        <div className="chart-bars">

                          <i style={{ height: "42%" }}></i>
                          <i style={{ height: "58%" }}></i>
                          <i style={{ height: "48%" }}></i>
                          <i style={{ height: "72%" }}></i>
                          <i style={{ height: "63%" }}></i>
                          <i style={{ height: "88%" }}></i>
                          <i style={{ height: "76%" }}></i>

                        </div>

                      </div>

                    </div>


                    {/* RECENT ACTIVITY */}

                    <div className="mini-activity-card">

                      <span>
                        RECENT ACTIVITY
                      </span>


                      <div className="activity-row">

                        <div className="activity-icon purple">
                          <MessageSquare size={12} />
                        </div>

                        <div>
                          <strong>
                            Complaint resolved
                          </strong>

                          <small>
                            Road Maintenance
                          </small>
                        </div>

                      </div>


                      <div className="activity-row">

                        <div className="activity-icon cyan">
                          <MapPinned size={12} />
                        </div>

                        <div>
                          <strong>
                            Asset updated
                          </strong>

                          <small>
                            Street Lighting
                          </small>
                        </div>

                      </div>


                      <div className="activity-row">

                        <div className="activity-icon green">
                          <CheckCircle2 size={12} />
                        </div>

                        <div>
                          <strong>
                            Service completed
                          </strong>

                          <small>
                            Municipal Services
                          </small>
                        </div>

                      </div>

                    </div>

                  </div>


                  {/* DASHBOARD BOTTOM */}

                  <div className="dashboard-bottom-row">

                    <div className="bottom-operation">
                      <Activity size={14} />

                      <div>
                        <span>
                          SYSTEM STATUS
                        </span>

                        <strong>
                          All services operational
                        </strong>
                      </div>
                    </div>


                    <div className="bottom-operation">
                      <Radio size={14} />

                      <div>
                        <span>
                          DEPARTMENTS ONLINE
                        </span>

                        <strong>
                          24 active
                        </strong>
                      </div>
                    </div>

                  </div>

                </div>

              </div>


              {/* DASHBOARD FOOTER */}

              <div className="dashboard-window-footer">

                <span>
                  <ShieldCheck size={11} />
                  Secure city operations
                </span>

                <span>
                  Updated just now
                </span>

              </div>

            </div>


            {/* FLOATING CARD ONE */}

            <motion.div
              className="floating-card floating-card-one"
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >

              <div className="floating-icon purple-bg">
                <CheckCircle2 size={16} />
              </div>

              <div>
                <strong>
                  92.8%
                </strong>

                <span>
                  Resolution Rate
                </span>
              </div>

            </motion.div>


            {/* FLOATING CARD TWO */}

            <motion.div
              className="floating-card floating-card-two"
              animate={{
                y: [0, 8, 0],
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >

              <div className="floating-icon cyan-bg">
                <Zap size={16} />
              </div>

              <div>
                <strong>
                  24/7
                </strong>

                <span>
                  City Monitoring
                </span>
              </div>

            </motion.div>

          </motion.div>

        </div>

      </section>


      {/* =====================================================
          STATISTICS
      ====================================================== */}

      <section className="city-statistics">

        <div className="home-container">

          <motion.div
            className="statistics-grid"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.2,
            }}
          >

            {cityStats.map((item) => (

              <motion.div
                className="statistics-item"
                variants={fadeUp}
                key={item.label}
              >

                <strong>
                  {item.number}
                </strong>

                <div>
                  <h3>
                    {item.label}
                  </h3>

                  <p>
                    {item.description}
                  </p>
                </div>

              </motion.div>

            ))}

          </motion.div>

        </div>

      </section>


      {/* =====================================================
          INTRODUCTION
      ====================================================== */}

      <section className="introduction-section">

        <div className="home-container introduction-layout">

          <motion.div
            className="introduction-heading"
            initial={{
              opacity: 0,
              x: -30,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
          >

            <span className="section-label">
              WHY SMARTCITY
            </span>

            <h2>
              A single system for
              <span>
                everyday city operations.
              </span>
            </h2>

          </motion.div>


          <motion.div
            className="introduction-copy"
            initial={{
              opacity: 0,
              x: 30,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
          >

            <p>
              City services often involve multiple departments,
              field teams and administrative processes. When
              information is spread across separate systems,
              responding to citizens can take longer and
              operational information becomes difficult to follow.
            </p>

            <p>
              SmartCity brings these activities into a shared
              digital environment. Citizens get a clear way to
              submit and follow requests, while departments
              receive the tools needed to assign, review and
              resolve them.
            </p>

          </motion.div>

        </div>

      </section>


      {/* =====================================================
          SERVICES
      ====================================================== */}

      <section className="services-section">

        <div className="home-container">

          <motion.div
            className="section-heading-row"
            initial={{
              opacity: 0,
              y: 25,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.65,
            }}
          >

            <div>

              <span className="section-label">
                PLATFORM SERVICES
              </span>

              <h2>
                Services built around
                <br />
                <span>
                  real city needs.
                </span>
              </h2>

            </div>


            <p>
              The platform brings the most common citizen
              and operational requirements into one connected system.
            </p>

          </motion.div>


          <motion.div
            className="services-grid"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.12,
            }}
          >

            {services.map((service, index) => {

              const Icon = service.icon;

              return (

                <motion.article
                  className="service-card"
                  variants={fadeUp}
                  whileHover={{
                    y: -6,
                  }}
                  key={service.title}
                >

                  <div className="service-card-top">

                    <div className="service-icon">
                      <Icon size={21} />
                    </div>

                    <span>
                      0{index + 1}
                    </span>

                  </div>


                  <h3>
                    {service.title}
                  </h3>


                  <p>
                    {service.description}
                  </p>


                  <Link
                    to="/login"
                    className="service-card-link"
                  >
                    Access service
                    <ArrowUpRight size={15} />
                  </Link>

                </motion.article>

              );

            })}

          </motion.div>

        </div>

      </section>


      {/* =====================================================
          DEPARTMENTS
      ====================================================== */}

      <section className="departments-section">

        <div className="home-container departments-layout">

          <motion.div
            className="departments-copy"
            initial={{
              opacity: 0,
              x: -35,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >

            <span className="section-label">
              CONNECTED GOVERNMENT
            </span>

            <h2>
              Departments working
              <span>
                from the same picture.
              </span>
            </h2>

            <p>
              SmartCity is designed to support multiple
              government and public service departments without
              forcing every department into the same workflow.
            </p>

            <p>
              Each department can manage its assigned requests,
              field activities, assets and operational information
              while the central administration maintains an
              overall view.
            </p>

            <Link
              to="/about"
              className="outline-button"
            >
              See how it works
              <ArrowRight size={16} />
            </Link>

          </motion.div>


          <motion.div
            className="department-panel"
            initial={{
              opacity: 0,
              x: 35,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >

            <div className="department-panel-header">

              <div className="department-panel-icon">
                <Building2 size={19} />
              </div>

              <div>
                <span>
                  CONNECTED DEPARTMENTS
                </span>

                <strong>
                  City Service Network
                </strong>
              </div>

            </div>


            <div className="department-list">

              {departments.map((department, index) => (

                <div
                  className="department-row"
                  key={department}
                >

                  <div className="department-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <span>
                    {department}
                  </span>

                  <CheckCircle2 size={15} />

                </div>

              ))}

            </div>


            <div className="department-footer">

              <Globe2 size={16} />

              <span>
                Connected through a centralized digital
                operations platform.
              </span>

            </div>

          </motion.div>

        </div>

      </section>


      {/* =====================================================
          WORKFLOW
      ====================================================== */}

      <section className="workflow-section">

        <div className="home-container">

          <motion.div
            className="workflow-heading"
            initial={{
              opacity: 0,
              y: 25,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
          >

            <span className="section-label">
              REQUEST WORKFLOW
            </span>

            <h2>
              From a citizen's request
              <br />
              to a
              <span>
                completed service.
              </span>
            </h2>

            <p>
              A structured workflow gives each request a clear
              path through the responsible department.
            </p>

          </motion.div>


          <motion.div
            className="workflow-grid"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.15,
            }}
          >

            {workflow.map((item, index) => {

              const Icon = item.icon;

              return (

                <motion.div
                  className="workflow-card"
                  variants={fadeUp}
                  key={item.step}
                >

                  <div className="workflow-card-top">

                    <div className="workflow-icon">
                      <Icon size={19} />
                    </div>

                    <span>
                      {item.step}
                    </span>

                  </div>


                  <h3>
                    {item.title}
                  </h3>

                  <p>
                    {item.text}
                  </p>


                  {index !== workflow.length - 1 && (
                    <div className="workflow-arrow">
                      <ArrowRight size={14} />
                    </div>
                  )}

                </motion.div>

              );

            })}

          </motion.div>

        </div>

      </section>


      {/* =====================================================
          GIS / ASSETS
      ====================================================== */}

      <section className="operations-section">

        <div className="home-container operations-layout">

          <motion.div
            className="operations-visual"
            initial={{
              opacity: 0,
              scale: 0.96,
            }}
            whileInView={{
              opacity: 1,
              scale: 1,
            }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >

            <div className="map-card">

              <div className="map-top">

                <div>
                  <small>
                    CITY MAP
                  </small>

                  <strong>
                    Public Infrastructure
                  </strong>
                </div>

                <div className="map-control">
                  <Map size={15} />
                </div>

              </div>


              <div className="map-area">

                <div className="map-road road-one"></div>
                <div className="map-road road-two"></div>
                <div className="map-road road-three"></div>

                <div className="map-block block-one"></div>
                <div className="map-block block-two"></div>
                <div className="map-block block-three"></div>
                <div className="map-block block-four"></div>


                <div className="map-marker marker-one">
                  <Building2 size={11} />
                </div>

                <div className="map-marker marker-two">
                  <Wrench size={11} />
                </div>

                <div className="map-marker marker-three">
                  <MapPinned size={11} />
                </div>

                <div className="map-marker marker-four">
                  <Siren size={11} />
                </div>


                <div className="map-location">
                  <span></span>
                  Active City Area
                </div>

              </div>


              <div className="map-legend">

                <span>
                  <i className="legend-purple"></i>
                  Assets
                </span>

                <span>
                  <i className="legend-blue"></i>
                  Requests
                </span>

                <span>
                  <i className="legend-red"></i>
                  Emergency
                </span>

              </div>

            </div>

          </motion.div>


          <motion.div
            className="operations-copy"
            initial={{
              opacity: 0,
              x: 35,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >

            <span className="section-label">
              CITY OPERATIONS
            </span>

            <h2>
              Know what is happening
              <span>
                across the city.
              </span>
            </h2>

            <p>
              Public assets and citizen requests are easier
              to understand when their location and operational
              information are available together.
            </p>


            <div className="operations-points">

              <div>

                <MapPinned size={18} />

                <div>

                  <strong>
                    Location-based information
                  </strong>

                  <span>
                    View infrastructure and requests according
                    to their geographic location.
                  </span>

                </div>

              </div>


              <div>

                <Wrench size={18} />

                <div>

                  <strong>
                    Public asset management
                  </strong>

                  <span>
                    Keep records of roads, streetlights, parks,
                    buildings, vehicles and utility infrastructure.
                  </span>

                </div>

              </div>


              <div>

                <BarChart3 size={18} />

                <div>

                  <strong>
                    Operational analytics
                  </strong>

                  <span>
                    Use dashboards and reports to understand
                    workload, response and service activity.
                  </span>

                </div>

              </div>

            </div>

          </motion.div>

        </div>

      </section>


      {/* =====================================================
          BENEFITS
      ====================================================== */}

      <section className="benefits-section">

        <div className="home-container">

          <motion.div
            className="benefits-heading"
            initial={{
              opacity: 0,
              y: 25,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
          >

            <span className="section-label">
              PLATFORM BENEFITS
            </span>

            <h2>
              Designed to improve
              <span>
                the everyday process.
              </span>
            </h2>

          </motion.div>


          <motion.div
            className="benefits-grid"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.15,
            }}
          >

            {benefits.map((benefit) => {

              const Icon = benefit.icon;

              return (

                <motion.div
                  className="benefit-item"
                  variants={fadeUp}
                  key={benefit.title}
                >

                  <div className="benefit-icon">
                    <Icon size={19} />
                  </div>

                  <div>

                    <h3>
                      {benefit.title}
                    </h3>

                    <p>
                      {benefit.text}
                    </p>

                  </div>

                </motion.div>

              );

            })}

          </motion.div>

        </div>

      </section>


      {/* =====================================================
          CTA
      ====================================================== */}

      <section className="cta-section">

        <div className="home-container">

          <motion.div
            className="cta-box"
            initial={{
              opacity: 0,
              y: 30,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >

            <div className="cta-content">

              <span className="section-label">
                GET STARTED
              </span>

              <h2>
                A simpler way to connect
                <br />
                with
                <span>
                  city services.
                </span>
              </h2>

              <p>
                Create your account to submit requests,
                follow complaints and access available
                digital services.
              </p>


              <div className="cta-actions">

                <Link
                  to="/register"
                  className="primary-button"
                >
                  Create an Account
                  <ArrowRight size={17} />
                </Link>

                <Link
                  to="/contact"
                  className="cta-contact"
                >
                  <PhoneCall size={15} />
                  Contact the platform team
                </Link>

              </div>

            </div>


            <div className="cta-symbol">

              <div className="cta-circle circle-large"></div>
              <div className="cta-circle circle-small"></div>

              <div className="cta-symbol-center">
                <ShieldCheck size={31} />
              </div>

            </div>

          </motion.div>

        </div>

      </section>


     <PublicFooter />

    </div>
  );
}

export default Home;

