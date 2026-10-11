import { useState } from "react";
import {
  Send,
  MapPin,
  FileText,
  Upload,
  AlertCircle,
  CheckCircle,
  CreditCard,
  Building2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import "./ServiceRequests.css";

const API_URL = "http://localhost:3000";

/* =========================================================
   SERVICE CONFIGURATION
========================================================= */

const SERVICES = {
  "child-registration": {
    name: "Child Registration Certificate",
    price: 500,
    department: "Citizen Registration Department",
  },

  "birth-certificate": {
    name: "Birth Certificate",
    price: 300,
    department: "Citizen Registration Department",
  },

  "death-certificate": {
    name: "Death Certificate",
    price: 300,
    department: "Citizen Registration Department",
  },

  "marriage-certificate": {
    name: "Marriage Certificate",
    price: 500,
    department: "Citizen Registration Department",
  },

  "domicile-certificate": {
    name: "Domicile Certificate",
    price: 1000,
    department: "Citizen Registration Department",
  },

  "residence-certificate": {
    name: "Residence Certificate",
    price: 500,
    department: "Citizen Registration Department",
  },

  "character-certificate": {
    name: "Character Certificate",
    price: 500,
    department: "Citizen Registration Department",
  },

  "property-registration": {
    name: "Property Registration",
    price: 5000,
    department: "Land & Property Department",
  },

  "property-transfer": {
    name: "Property Transfer",
    price: 4000,
    department: "Land & Property Department",
  },

  "property-record": {
    name: "Property Record Request",
    price: 1000,
    department: "Land & Property Department",
  },

  "building-permit": {
    name: "Building Permit",
    price: 3000,
    department: "Building & Planning Department",
  },

  "business-registration": {
    name: "Business Registration",
    price: 2500,
    department: "Business & Licensing Department",
  },

  "trade-license": {
    name: "Trade License",
    price: 2000,
    department: "Business & Licensing Department",
  },

  other: {
    name: "Other Citizen Service",
    price: 500,
    department: "Citizen Services Department",
  },
};

/* =========================================================
   COMPONENT
========================================================= */

const ServiceRequest = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    category: "",
    title: "",
    description: "",
    location: "",
    priority: "Medium",
  });

  const [file, setFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedService = SERVICES[formData.category];

  /* =========================================================
     HANDLE INPUT
  ========================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================================
     HANDLE FILE
  ========================================================= */

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Maximum file size: 5 MB
    const maxSize = 5 * 1024 * 1024;

    if (selectedFile.size > maxSize) {
      toast.error("File size must be less than 5 MB.");
      e.target.value = "";
      setFile(null);
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error(
        "Only JPG, PNG, PDF, DOC and DOCX files are allowed."
      );

      e.target.value = "";
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  /* =========================================================
     SUBMIT APPLICATION
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    /* -------------------------------------------------------
       VALIDATION
    ------------------------------------------------------- */

    if (
      !formData.category ||
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.location.trim()
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    /* -------------------------------------------------------
       CHECK SELECTED SERVICE
    ------------------------------------------------------- */

    if (!selectedService) {
      toast.error("Please select a valid service.");
      return;
    }

    try {
      setLoading(true);

      /* -----------------------------------------------------
         GET CITIZEN TOKEN
      ----------------------------------------------------- */

      const token = localStorage.getItem("department_token");

      if (!token) {
        toast.error("Please login first.");
        navigate("/login");
        return;
      }

      /* -----------------------------------------------------
         CREATE FORM DATA
      ----------------------------------------------------- */

      const requestData = new FormData();

      requestData.append(
        "category",
        formData.category
      );

      requestData.append(
        "title",
        formData.title.trim()
      );

      requestData.append(
        "description",
        formData.description.trim()
      );

      requestData.append(
        "location",
        formData.location.trim()
      );

      requestData.append(
        "priority",
        formData.priority
      );

      /* -----------------------------------------------------
         ADD SUPPORTING DOCUMENT
      ----------------------------------------------------- */

      if (file) {
        requestData.append(
          "supportingDocument",
          file
        );
      }

      /* -----------------------------------------------------
         DEBUG FORM DATA
      ----------------------------------------------------- */

      console.log("Submitting service request...");
      console.log("Category:", formData.category);
      console.log("Title:", formData.title);
      console.log("Description:", formData.description);
      console.log("Location:", formData.location);
      console.log("Priority:", formData.priority);
      console.log("File:", file);

      /* -----------------------------------------------------
         SEND REQUEST TO BACKEND
      ----------------------------------------------------- */

      const response = await axios.post(
        `${API_URL}/api/service-requests`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(
        "Service request response:",
        response.data
      );

      /* -----------------------------------------------------
         GET CREATED SERVICE REQUEST
      ----------------------------------------------------- */

      const request =
        response.data?.serviceRequest ||
        response.data?.request;

      if (!request?._id) {
        console.error(
          "Invalid service request response:",
          response.data
        );

        throw new Error(
          "Service request ID was not returned by the server."
        );
      }

      /* -----------------------------------------------------
         SUCCESS
      ----------------------------------------------------- */

      setSubmitted(true);

      toast.success(
        "Service application submitted successfully!"
      );

      console.log(
        "Created Service Request ID:",
        request._id
      );

      /* -----------------------------------------------------
         GO TO PAYMENT PAGE
      ----------------------------------------------------- */

      navigate(
        `/citizen/payments/${request._id}`
      );

    } catch (error) {
      console.error(
        "================================="
      );

      console.error(
        "SERVICE REQUEST ERROR:"
      );

      console.error(error);

      console.error(
        "SERVER RESPONSE:",
        error.response?.data
      );

      console.error(
        "STATUS:",
        error.response?.status
      );

      console.error(
        "================================="
      );

      toast.error(
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to submit service application."
      );

    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="service-request-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="service-request-header">

        <div className="service-header-icon">
          <FileText size={28} />
        </div>

        <div className="service-header-content">

          <span className="service-eyebrow">
            CITIZEN SERVICES
          </span>

          <h1>
            Apply for a Service
          </h1>

          <p>
            Submit an application for government and
            citizen services through CIVIC CONNECT.
          </p>

        </div>

      </div>

      {/* =====================================================
          SUCCESS MESSAGE
      ===================================================== */}

      {submitted && (
        <div className="service-success-message">

          <CheckCircle size={22} />

          <div>

            <strong>
              Service application submitted successfully
            </strong>

            <p>
              Redirecting you to the payment page...
            </p>

          </div>

        </div>
      )}

      {/* =====================================================
          FORM
      ===================================================== */}

      <form
        className="service-request-card"
        onSubmit={handleSubmit}
      >

        {/* ===================================================
            SERVICE INFORMATION
        =================================================== */}

        <div className="service-form-section">

          <div className="service-section-heading">

            <div className="section-icon">
              <FileText size={18} />
            </div>

            <div>

              <h2>
                Service Information
              </h2>

              <p>
                Select the government service you want
                to apply for.
              </p>

            </div>

          </div>

          <div className="service-form-grid">

            {/* SERVICE */}

            <div className="service-form-group">

              <label>
                Service
                <span>*</span>
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >

                <option value="">
                  Select a service
                </option>

                <option value="child-registration">
                  Child Registration Certificate
                </option>

                <option value="birth-certificate">
                  Birth Certificate
                </option>

                <option value="death-certificate">
                  Death Certificate
                </option>

                <option value="marriage-certificate">
                  Marriage Certificate
                </option>

                <option value="domicile-certificate">
                  Domicile Certificate
                </option>

                <option value="residence-certificate">
                  Residence Certificate
                </option>

                <option value="character-certificate">
                  Character Certificate
                </option>

                <option value="property-registration">
                  Property Registration
                </option>

                <option value="property-transfer">
                  Property Transfer
                </option>

                <option value="property-record">
                  Property Record Request
                </option>

                <option value="building-permit">
                  Building Permit
                </option>

                <option value="business-registration">
                  Business Registration
                </option>

                <option value="trade-license">
                  Trade License
                </option>

                <option value="other">
                  Other Citizen Service
                </option>

              </select>

            </div>

            {/* TITLE */}

            <div className="service-form-group">

              <label>
                Application Title
                <span>*</span>
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Application for child registration"
                required
              />

            </div>

          </div>

          {/* =================================================
              SELECTED SERVICE
          ================================================= */}

          {selectedService && (

            <div className="selected-service-price">

              <div className="selected-service-price-icon">
                <CreditCard size={22} />
              </div>

              <div className="selected-service-info">

                <span>
                  Selected Service
                </span>

                <strong>
                  {selectedService.name}
                </strong>

                <small>
                  Department:{" "}
                  <b>
                    {selectedService.department}
                  </b>
                </small>

              </div>

              <div className="selected-service-department">

                <Building2 size={17} />

                <div>

                  <span>
                    Processing Department
                  </span>

                  <strong>
                    {selectedService.department}
                  </strong>

                </div>

              </div>

              <div className="service-fixed-price">

                <span>
                  Service Fee
                </span>

                <strong>
                  Rs.{" "}
                  {selectedService.price.toLocaleString()}
                </strong>

              </div>

            </div>

          )}

          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <div className="service-form-group full-width">

            <label>
              Application Description
              <span>*</span>
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide details about your application..."
              rows="6"
              required
            />

            <small>
              Provide accurate information so the relevant
              department can process your application.
            </small>

          </div>

        </div>

        {/* ===================================================
            LOCATION
        =================================================== */}

        <div className="service-form-section">

          <div className="service-section-heading">

            <div className="section-icon">
              <MapPin size={18} />
            </div>

            <div>

              <h2>
                Location
              </h2>

              <p>
                Provide the location related to this
                application.
              </p>

            </div>

          </div>

          <div className="service-form-group full-width">

            <label>
              Address / Location
              <span>*</span>
            </label>

            <div className="location-input-wrapper">

              <MapPin size={18} />

              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter your address or relevant location"
                required
              />

            </div>

          </div>

        </div>

        {/* ===================================================
            PRIORITY
        =================================================== */}

        <div className="service-form-section">

          <div className="service-section-heading">

            <div className="section-icon">
              <AlertCircle size={18} />
            </div>

            <div>

              <h2>
                Priority
              </h2>

              <p>
                Select the priority of your application.
              </p>

            </div>

          </div>

          <div className="priority-options">

            {["Low", "Medium", "High"].map(
              (priority) => (

                <label
                  key={priority}
                  className={`priority-option ${
                    formData.priority === priority
                      ? `active ${priority.toLowerCase()}`
                      : ""
                  }`}
                >

                  <input
                    type="radio"
                    name="priority"
                    value={priority}
                    checked={
                      formData.priority === priority
                    }
                    onChange={handleChange}
                  />

                  <div>

                    <strong>
                      {priority}
                    </strong>

                    <span>
                      {priority === "Low"
                        ? "Normal processing"
                        : priority === "Medium"
                        ? "Needs regular attention"
                        : "Requires urgent attention"}
                    </span>

                  </div>

                </label>

              )
            )}

          </div>

        </div>

        {/* ===================================================
            SUPPORTING DOCUMENT
        =================================================== */}

        <div className="service-form-section">

          <div className="service-section-heading">

            <div className="section-icon">
              <Upload size={18} />
            </div>

            <div>

              <h2>
                Supporting Document
              </h2>

              <p>
                Upload a document if it is required
                for your application.
              </p>

            </div>

          </div>

          <label className="upload-box">

            <input
              type="file"
              onChange={handleFileChange}
              accept="image/jpeg,image/png,application/pdf,.doc,.docx"
            />

            <Upload size={25} />

            <strong>
              {file
                ? file.name
                : "Upload a supporting document"}
            </strong>

            <span>
              {file
                ? `${(
                    file.size /
                    1024 /
                    1024
                  ).toFixed(2)} MB selected`
                : "JPG, PNG, PDF, DOC or DOCX — Max 5 MB"}
            </span>

          </label>

        </div>

        {/* ===================================================
            APPLICATION SUMMARY
        =================================================== */}

        {selectedService && (

          <div className="service-application-summary">

            <div className="summary-heading">

              <FileText size={18} />

              <span>
                Application Summary
              </span>

            </div>

            <div className="summary-grid">

              <div>

                <span>
                  Service
                </span>

                <strong>
                  {selectedService.name}
                </strong>

              </div>

              <div>

                <span>
                  Department
                </span>

                <strong>
                  {selectedService.department}
                </strong>

              </div>

              <div>

                <span>
                  Priority
                </span>

                <strong>
                  {formData.priority}
                </strong>

              </div>

              <div>

                <span>
                  Service Fee
                </span>

                <strong>
                  Rs.{" "}
                  {selectedService.price.toLocaleString()}
                </strong>

              </div>

            </div>

          </div>

        )}

        {/* ===================================================
            ACTION BUTTONS
        =================================================== */}

        <div className="service-form-actions">

          <button
            type="button"
            className="service-cancel-btn"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="service-submit-btn"
            disabled={loading}
          >

            <Send size={17} />

            {loading
              ? "Submitting Application..."
              : "Submit & Continue to Payment"}

          </button>

        </div>

      </form>

    </div>
  );
};

export default ServiceRequest;