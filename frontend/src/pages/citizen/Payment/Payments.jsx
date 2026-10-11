import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

import {
  ArrowLeft,
  CreditCard,
  WalletCards,
  Building2,
  FileText,
  Receipt,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Lock,
  ExternalLink,
  Smartphone,
} from "lucide-react";

import "./Payments.css";

const API_URL = "http://localhost:3000";

const Payments = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [serviceRequest, setServiceRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");

  const [paymentResult, setPaymentResult] = useState(null);

  const paymentMethods = [
    {
      id: "jazzcash",
      name: "JazzCash",
      description: "Pay securely through JazzCash",
      icon: WalletCards,
    },
    {
      id: "easypaisa",
      name: "Easypaisa",
      description: "Pay securely through Easypaisa",
      icon: CreditCard,
    },
    {
      id: "bank",
      name: "Bank Transfer",
      description: "Transfer payment from your bank",
      icon: Building2,
    },
  ];

  /* =========================================================
     GET SERVICE REQUEST
  ========================================================= */

  useEffect(() => {
    const loadRequest = async () => {
      try {
        const token = localStorage.getItem("department_token");

        if (!token) {
          navigate("/login");
          return;
        }

        if (!id) {
          toast.error("First apply for service ");
          return;
        }

        const response = await axios.get(
          `${API_URL}/api/service-requests/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const request =
          response.data?.serviceRequest ||
          response.data?.request ||
          response.data?.data;

        if (!request) {
          toast.error("Service request not found.");
          return;
        }

        setServiceRequest(request);
      } catch (error) {
        console.error("LOAD PAYMENT ERROR:", error);

        toast.error(
          error.response?.data?.message ||
            "Unable to load payment information."
        );
      } finally {
        setLoading(false);
      }
    };

    loadRequest();
  }, [id, navigate]);

  /* =========================================================
     PAYMENT METHOD CHANGE
  ========================================================= */

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);

    // Clear fields when switching payment method
    setMobileNumber("");
    setReferenceNumber("");
  };

  /* =========================================================
     VALIDATE MOBILE NUMBER
  ========================================================= */

  const validateMobileNumber = () => {
    const mobile = mobileNumber.trim();

    if (!mobile) {
      toast.error("Please enter your mobile number.");
      return false;
    }

    if (!/^03\d{9}$/.test(mobile)) {
      toast.error(
        "Please enter a valid Pakistani mobile number, e.g. 03001234567."
      );
      return false;
    }

    return true;
  };

  /* =========================================================
     START PAYMENT
  ========================================================= */

  const handlePayment = async (event) => {
    event.preventDefault();

    if (!paymentMethod) {
      toast.error("Please select a payment method.");
      return;
    }

    if (!serviceRequest?._id) {
      toast.error("Service request information is missing.");
      return;
    }

    // JazzCash / Easypaisa validation
    if (
      paymentMethod === "jazzcash" ||
      paymentMethod === "easypaisa"
    ) {
      if (!validateMobileNumber()) {
        return;
      }
    }

    // Bank validation
    if (
      paymentMethod === "bank" &&
      !referenceNumber.trim()
    ) {
      toast.error(
        "Please enter the bank transaction reference."
      );
      return;
    }

    try {
      setProcessing(true);

      const token = localStorage.getItem("department_token");

      if (!token) {
        navigate("/login");
        return;
      }

      const paymentData = {
        serviceRequestId: serviceRequest._id,
        paymentMethod,

        // Mobile number only for JazzCash/Easypaisa
        mobileNumber:
          paymentMethod === "jazzcash" ||
          paymentMethod === "easypaisa"
            ? mobileNumber.trim()
            : "",

        // Reference only for bank
        referenceNumber:
          paymentMethod === "bank"
            ? referenceNumber.trim()
            : "",
      };

      console.log("PAYMENT DATA:", paymentData);

      const response = await axios.post(
        `${API_URL}/api/payments/service-request`,
        paymentData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result =
        response.data?.payment ||
        response.data?.data ||
        response.data;

      console.log("PAYMENT RESPONSE:", result);

      /*
        If a real payment gateway is configured,
        backend can return checkoutUrl.
      */

      if (result?.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }

      setPaymentResult(result);

      toast.success(
        "Payment request submitted for verification."
      );
    } catch (error) {
      console.error("PAYMENT ERROR:", error);

      console.error(
        "SERVER RESPONSE:",
        error.response?.data
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to start payment."
      );
    } finally {
      setProcessing(false);
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="payment-page">
        <div className="payment-loading">
          <div className="payment-spinner"></div>

          <h2>Loading Payment</h2>

          <p>
            Preparing your secure payment page...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     NOT FOUND
  ========================================================= */

  if (!serviceRequest) {
    return (
      <div className="payment-page">
        <div className="payment-empty">
          <div className="payment-empty-icon">
            <AlertCircle size={34} />
          </div>

          <h2>Payment Request Not Found</h2>

          <p>
            We could not find the service request associated
            with this payment.
          </p>

          <button
            onClick={() => navigate("/citizen/services")}
            className="primary-payment-button"
          >
            <ArrowLeft size={18} />
            Back to Services
          </button>
        </div>
      </div>
    );
  }

  /* =========================================================
     PAYMENT RESULT
  ========================================================= */

  if (paymentResult) {
    return (
      <div className="payment-page">
        <div className="payment-success">

          <div className="success-icon">
            <CheckCircle2 size={48} />
          </div>

          <span className="success-label">
            PAYMENT REQUEST RECEIVED
          </span>

          <h1>
            Payment Submitted
          </h1>

          <p className="success-description">
            Your payment request has been received.
            The transaction will remain pending until the
            payment provider or department verifies it.
          </p>

          <div className="receipt-card">

            <div className="receipt-heading">
              <Receipt size={20} />
              <span>Payment Details</span>
            </div>

            <div className="receipt-row">
              <span>Service</span>

              <strong>
                {serviceRequest.serviceName}
              </strong>
            </div>

            <div className="receipt-row">
              <span>Request ID</span>

              <strong>
                {serviceRequest.requestId}
              </strong>
            </div>

            <div className="receipt-row">
              <span>Payment Method</span>

              <strong>
                {paymentMethod === "jazzcash"
                  ? "JazzCash"
                  : paymentMethod === "easypaisa"
                  ? "Easypaisa"
                  : "Bank Transfer"}
              </strong>
            </div>

            {(paymentMethod === "jazzcash" ||
              paymentMethod === "easypaisa") &&
              mobileNumber && (
                <div className="receipt-row">
                  <span>Mobile Number</span>

                  <strong>
                    {mobileNumber}
                  </strong>
                </div>
              )}

            {paymentMethod === "bank" &&
              referenceNumber && (
                <div className="receipt-row">
                  <span>Reference</span>

                  <strong>
                    {referenceNumber}
                  </strong>
                </div>
              )}

            <div className="receipt-total">
              <span>Amount</span>

              <strong>
                Rs.{" "}
                {Number(
                  serviceRequest.amount || 0
                ).toLocaleString()}
              </strong>
            </div>

          </div>

          <div className="pending-box">
            <ShieldCheck size={20} />

            <div>
              <strong>
                Verification Pending
              </strong>

              <p>
                Your service request will be processed after
                the payment is verified.
              </p>
            </div>
          </div>

          <button
            className="primary-payment-button"
            onClick={() =>
              navigate("/citizen/services")
            }
          >
            <ArrowLeft size={18} />
            Back to Services
          </button>

        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN PAYMENT PAGE
  ========================================================= */

  return (
    <div className="payment-page">

      {/* HEADER */}

      <section className="payment-header">
        <div className="payment-header-inner">

          <button
            className="back-button"
            onClick={() =>
              navigate("/citizen/services")
            }
          >
            <ArrowLeft size={18} />
            Back to Services
          </button>

          <div className="payment-heading">

            <div className="payment-heading-icon">
              <CreditCard size={30} />
            </div>

            <div>
              <span>
                CIVIC CONNECT • SECURE PAYMENTS
              </span>

              <h1>
                Complete Your Payment
              </h1>

              <p>
                Pay your citizen service fee securely.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* CONTENT */}

      <main className="payment-container">

        <div className="payment-grid">

          {/* LEFT */}

          <div className="payment-left">

            {/* SERVICE CARD */}

            <section className="payment-card">

              <div className="card-title">

                <div className="card-title-icon">
                  <FileText size={20} />
                </div>

                <div>
                  <h2>
                    Service Request
                  </h2>

                  <p>
                    Review your application details
                  </p>
                </div>

              </div>

              <div className="service-details">

                <div>
                  <span>Service</span>

                  <strong>
                    {serviceRequest.serviceName}
                  </strong>
                </div>

                <div>
                  <span>Request ID</span>

                  <strong>
                    {serviceRequest.requestId}
                  </strong>
                </div>

                <div>
                  <span>Department</span>

                  <strong>
                    {serviceRequest.department}
                  </strong>
                </div>

                <div>
                  <span>Application Status</span>

                  <strong className="status">
                    {serviceRequest.status}
                  </strong>
                </div>

              </div>

            </section>

            {/* PAYMENT METHOD */}

            <section className="payment-card">

              <div className="card-title">

                <div className="card-title-icon">
                  <WalletCards size={20} />
                </div>

                <div>
                  <h2>
                    Select Payment Method
                  </h2>

                  <p>
                    Choose your preferred payment method
                  </p>
                </div>

              </div>

              <div className="methods">

                {paymentMethods.map((method) => {
                  const Icon = method.icon;

                  return (
                    <button
                      type="button"
                      key={method.id}
                      className={`method ${
                        paymentMethod === method.id
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        handlePaymentMethodChange(
                          method.id
                        )
                      }
                    >

                      <div className="method-icon">
                        <Icon size={23} />
                      </div>

                      <div className="method-content">
                        <strong>
                          {method.name}
                        </strong>

                        <span>
                          {method.description}
                        </span>
                      </div>

                      <div className="radio">
                        {paymentMethod === method.id && (
                          <div></div>
                        )}
                      </div>

                    </button>
                  );
                })}

              </div>

              {/* JAZZCASH */}

              {paymentMethod === "jazzcash" && (
                <div className="provider-box">

                  <div className="provider-icon">
                    <WalletCards size={22} />
                  </div>

                  <div>
                    <strong>
                      JazzCash Secure Checkout
                    </strong>

                    <p>
                      Enter your JazzCash mobile number
                      to continue with payment.
                    </p>
                  </div>

                  <ExternalLink size={18} />

                </div>
              )}

              {/* EASYPAISA */}

              {paymentMethod === "easypaisa" && (
                <div className="provider-box">

                  <div className="provider-icon">
                    <CreditCard size={22} />
                  </div>

                  <div>
                    <strong>
                      Easypaisa Secure Checkout
                    </strong>

                    <p>
                      Enter your Easypaisa mobile number
                      to continue with payment.
                    </p>
                  </div>

                  <ExternalLink size={18} />

                </div>
              )}

              {/* MOBILE PAYMENT FIELD */}

              {(paymentMethod === "jazzcash" ||
                paymentMethod === "easypaisa") && (
                <div className="mobile-payment-section">

                  <div className="reference-field">

                    <label>
                      {paymentMethod === "jazzcash"
                        ? "JazzCash Mobile Number"
                        : "Easypaisa Mobile Number"}

                      <span>*</span>
                    </label>

                    <div className="input-box">

                      <Smartphone size={19} />

                      <input
                        type="tel"
                        value={mobileNumber}
                        onChange={(e) =>
                          setMobileNumber(
                            e.target.value.replace(
                              /\D/g,
                              ""
                            )
                          )
                        }
                        placeholder="03XXXXXXXXX"
                        maxLength={11}
                        inputMode="numeric"
                      />

                    </div>

                    <small>
                      Enter the mobile number registered
                      with your payment account.
                    </small>

                  </div>

                </div>
              )}

              {/* BANK TRANSFER */}

              {paymentMethod === "bank" && (
                <div className="bank-payment-section">

                  <div className="bank-information">

                    <div className="bank-information-header">
                      <Building2 size={20} />

                      <div>
                        <strong>
                          Bank Transfer
                        </strong>

                        <span>
                          Transfer the exact amount to
                          the configured Civic Connect
                          payment account.
                        </span>
                      </div>
                    </div>

                    <div className="bank-details">

                      <div>
                        <span>
                          Account Title
                        </span>

                        <strong>
                          Configured by Administrator
                        </strong>
                      </div>

                      <div>
                        <span>
                          Bank
                        </span>

                        <strong>
                          Configured by Administrator
                        </strong>
                      </div>

                      <div>
                        <span>
                          IBAN
                        </span>

                        <strong>
                          Available from payment settings
                        </strong>
                      </div>

                    </div>

                  </div>

                  <div className="reference-field">

                    <label>
                      Bank Transaction Reference
                      <span>*</span>
                    </label>

                    <div className="input-box">

                      <Receipt size={19} />

                      <input
                        type="text"
                        value={referenceNumber}
                        onChange={(e) =>
                          setReferenceNumber(
                            e.target.value
                          )
                        }
                        placeholder="Enter bank transaction reference"
                      />

                    </div>

                    <small>
                      Enter the reference generated by
                      your bank after completing the transfer.
                    </small>

                  </div>

                </div>
              )}

            </section>

            {/* SECURITY */}

            <div className="security-box">

              <Lock size={21} />

              <div>

                <strong>
                  Secure Payment
                </strong>

                <p>
                  Payment verification is handled by the
                  configured payment provider. Never share
                  your PIN, password or OTP with anyone.
                </p>

              </div>

            </div>

            {/* PAY BUTTON */}

            <button
              className="pay-now-button"
              onClick={handlePayment}
              disabled={
                processing || !paymentMethod
              }
            >

              {processing ? (
                <>
                  <span className="button-spinner"></span>
                  Connecting to Payment Gateway...
                </>
              ) : (
                <>
                  <Lock size={18} />
                  Continue Secure Payment
                </>
              )}

            </button>

          </div>

          {/* RIGHT SUMMARY */}

          <aside className="payment-summary">

            <div className="summary-header">

              <div className="summary-icon">
                <Receipt size={21} />
              </div>

              <div>
                <span>
                  PAYMENT SUMMARY
                </span>

                <h2>
                  Order Summary
                </h2>
              </div>

            </div>

            <div className="summary-service">

              <span>
                Service
              </span>

              <strong>
                {serviceRequest.serviceName}
              </strong>

            </div>

            <div className="summary-line">

              <span>
                Application Fee
              </span>

              <strong>
                Rs.{" "}
                {Number(
                  serviceRequest.amount || 0
                ).toLocaleString()}
              </strong>

            </div>

            <div className="summary-line">

              <span>
                Processing Fee
              </span>

              <strong>
                Rs. 0
              </strong>

            </div>

            <div className="summary-divider"></div>

            <div className="summary-total">

              <span>
                Total Payable
              </span>

              <strong>
                Rs.{" "}
                {Number(
                  serviceRequest.amount || 0
                ).toLocaleString()}
              </strong>

            </div>

            <div className="summary-security">

              <ShieldCheck size={19} />

              <p>
                Your transaction is processed through
                the configured payment provider.
              </p>

            </div>

          </aside>

        </div>

      </main>

    </div>
  );
};

export default Payments;