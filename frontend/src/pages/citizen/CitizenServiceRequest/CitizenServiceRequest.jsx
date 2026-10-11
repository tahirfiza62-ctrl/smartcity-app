import  { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Send,
  MapPin,
  FileText,
  Upload,
  AlertCircle,
  CreditCard,
  Building2,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";

import "./CitizenServiceRequest.css";

const API_URL = "http://localhost:3000";

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

const CitizenServiceRequest = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    category: "",
    title: "",
    description: "",
    location: "",
    priority: "Medium",
  });

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
    const file = e.target.files?.[0];

    if (!file) {
      setDocument(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5 MB.");
      e.target.value = "";
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

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, PDF, DOC and DOCX files are allowed.");
      e.target.value = "";
      return;
    }

    setDocument(file);
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category) {
      toast.error("Please select a service.");
      return;
    }

    if (!formData.title.trim()) {
      toast.error("Please enter a request title.");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Please describe your request.");
      return;
    }

    if (!formData.location.trim()) {
      toast.error("Please enter your location.");
      return;
    }

    const token = localStorage.getItem("department_token");

    if (!token) {
      toast.error("Please login first.");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();

      data.append("category", formData.category);
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("location", formData.location);
      data.append("priority", formData.priority);

      if (document) {
        data.append("supportingDocument", document);
      }

      const response = await axios.post(
        `${API_URL}/api/service-requests`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const request =
        response.data?.serviceRequest ||
        response.data?.request ||
        response.data?.data;

      setSubmitted(true);

      toast.success("Service request submitted successfully!");

      if (request?._id) {
        setTimeout(() => {
          navigate(`/citizen/payments/${request._id}`);
        }, 1200);
      }
    } catch (error) {
      console.error("SERVICE REQUEST ERROR:", error);

      const message =
        error.response?.data?.message ||
        "Unable to submit service request.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     SUCCESS SCREEN
  ========================================================= */

  if (submitted) {
    return (
      <div className="csr-page">
        <div className="csr-success-card">

          <div className="csr-success-icon">
            <CheckCircle size={42} />
          </div>

          <h1>Request Submitted</h1>

          <p>
            Your service request has been submitted successfully.
          </p>

          <div className="csr-success-info">
            <strong>{selectedService?.name}</strong>

            <span>
              You will be redirected to the payment page.
            </span>
          </div>

          <button
            className="csr-payment-button"
            onClick={() => navigate("/citizen")}
          >
            Back to Dashboard
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="csr-page">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="csr-hero">

        <div className="csr-hero-icon">
          <FileText size={32} />
        </div>

        <div>
          <span className="csr-eyebrow">
            CITIZEN SERVICES
          </span>

          <h1>Service Request</h1>

          <p>
            Apply for government services quickly and securely
            through CIVIC CONNECT.
          </p>
        </div>

      </section>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="csr-container">

        <form
          className="csr-form-card"
          onSubmit={handleSubmit}
        >

          {/* SERVICE SELECTION */}

          <div className="csr-section">

            <div className="csr-section-heading">
              <div className="csr-heading-icon">
                <Building2 size={20} />
              </div>

              <div>
                <h2>Select Service</h2>
                <p>
                  Choose the government service you want to request.
                </p>
              </div>
            </div>


            <div className="csr-field">

              <label>
                Service Category
                <span>*</span>
              </label>

              <div className="csr-select-wrapper">

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select a service
                  </option>

                  <optgroup label="Citizen Registration">

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

                  </optgroup>


                  <optgroup label="Land & Property">

                    <option value="property-registration">
                      Property Registration
                    </option>

                    <option value="property-transfer">
                      Property Transfer
                    </option>

                    <option value="property-record">
                      Property Record Request
                    </option>

                  </optgroup>


                  <optgroup label="Building & Business">

                    <option value="building-permit">
                      Building Permit
                    </option>

                    <option value="business-registration">
                      Business Registration
                    </option>

                    <option value="trade-license">
                      Trade License
                    </option>

                  </optgroup>


                  <option value="other">
                    Other Citizen Service
                  </option>

                </select>

                <ChevronDown size={18} />

              </div>

            </div>


            {/* SELECTED SERVICE INFO */}

            {selectedService && (
              <div className="csr-service-preview">

                <div className="csr-preview-left">

                  <div className="csr-preview-icon">
                    <Building2 size={22} />
                  </div>

                  <div>
                    <strong>
                      {selectedService.name}
                    </strong>

                    <span>
                      {selectedService.department}
                    </span>
                  </div>

                </div>

                <div className="csr-price">
                  Rs. {selectedService.price.toLocaleString()}
                </div>

              </div>
            )}

          </div>


          {/* REQUEST DETAILS */}

          <div className="csr-section">

            <div className="csr-section-heading">

              <div className="csr-heading-icon">
                <FileText size={20} />
              </div>

              <div>
                <h2>Request Details</h2>

                <p>
                  Provide information about your service request.
                </p>
              </div>

            </div>


            <div className="csr-field">

              <label>
                Request Title
                <span>*</span>
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter a short title for your request"
                maxLength={150}
                required
              />

            </div>


            <div className="csr-field">

              <label>
                Description
                <span>*</span>
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Explain your service request in detail..."
                rows="6"
                maxLength={2000}
                required
              />

              <small>
                {formData.description.length}/2000 characters
              </small>

            </div>


            <div className="csr-grid">

              <div className="csr-field">

                <label>
                  Location
                  <span>*</span>
                </label>

                <div className="csr-input-icon">

                  <MapPin size={18} />

                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter location"
                    maxLength={300}
                    required
                  />

                </div>

              </div>


              <div className="csr-field">

                <label>
                  Priority
                </label>

                <div className="csr-select-wrapper">

                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                  >

                    <option value="Low">
                      Low
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="High">
                      High
                    </option>

                  </select>

                  <ChevronDown size={18} />

                </div>

              </div>

            </div>

          </div>


          {/* DOCUMENT */}

          <div className="csr-section">

            <div className="csr-section-heading">

              <div className="csr-heading-icon">
                <Upload size={20} />
              </div>

              <div>
                <h2>Supporting Document</h2>

                <p>
                  Upload any document required for your application.
                </p>
              </div>

            </div>


            <label className="csr-upload">

              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                onChange={handleFileChange}
              />

              <div className="csr-upload-icon">
                <Upload size={25} />
              </div>

              <strong>
                {document
                  ? document.name
                  : "Click to upload a document"}
              </strong>

              <span>
                JPG, PNG, PDF, DOC or DOCX • Maximum 5 MB
              </span>

            </label>

          </div>


          {/* PAYMENT INFO */}

          {selectedService && (
            <div className="csr-payment-summary">

              <div className="csr-payment-icon">
                <CreditCard size={22} />
              </div>

              <div className="csr-payment-text">

                <strong>
                  Service Fee
                </strong>

                <span>
                  Payment will be completed after submitting
                  your request.
                </span>

              </div>

              <div className="csr-payment-amount">
                Rs. {selectedService.price.toLocaleString()}
              </div>

            </div>
          )}


          {/* NOTICE */}

          <div className="csr-notice">

            <AlertCircle size={19} />

            <p>
              Please make sure all information is correct before
              submitting your request. Your request will be sent
              to the relevant department for processing.
            </p>

          </div>


          {/* SUBMIT */}

          <div className="csr-actions">

            <button
              type="button"
              className="csr-cancel-btn"
              onClick={() => navigate("/citizen")}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="csr-submit-btn"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="csr-spinner"></span>
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Submit Service Request
                </>
              )}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default CitizenServiceRequest;