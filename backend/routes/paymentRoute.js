const express = require("express");
const mongoose = require("mongoose");

const Payment = require("../models/Payment");
const ServiceRequest = require("../models/ServiceRequest");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================================================
   CREATE SERVICE REQUEST PAYMENT
========================================================= */

router.post(
  "/service-request",
  authMiddleware,
  async (req, res) => {
    try {
      console.log("=================================");
      console.log("PAYMENT REQUEST RECEIVED");
      console.log("BODY:", req.body);
      console.log("=================================");

      const {
        serviceRequestId,
        paymentMethod,
        referenceNumber,
      } = req.body || {};

      /* =====================================================
         VALIDATE SERVICE REQUEST ID
      ===================================================== */

      if (!serviceRequestId) {
        return res.status(400).json({
          success: false,
          message: "Service request ID is required.",
        });
      }

      /* =====================================================
         VALIDATE PAYMENT METHOD
      ===================================================== */

      if (!paymentMethod) {
        return res.status(400).json({
          success: false,
          message: "Payment method is required.",
        });
      }

      /* =====================================================
         VALIDATE OBJECT ID
      ===================================================== */

      if (!mongoose.Types.ObjectId.isValid(serviceRequestId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid service request ID.",
        });
      }

      /* =====================================================
         GET LOGGED-IN USER
      ===================================================== */

      const userId =
        req.user?.id ||
        req.user?._id ||
        req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      /* =====================================================
         FIND SERVICE REQUEST
      ===================================================== */

      const serviceRequest =
        await ServiceRequest.findById(serviceRequestId);

      if (!serviceRequest) {
        return res.status(404).json({
          success: false,
          message: "Service request not found.",
        });
      }

      /* =====================================================
         CHECK OWNERSHIP
      ===================================================== */

      if (
        serviceRequest.citizen &&
        serviceRequest.citizen.toString() !==
          userId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to pay for this request.",
        });
      }

      /* =====================================================
         PREVENT DUPLICATE PAID PAYMENT
      ===================================================== */

      if (serviceRequest.paymentStatus === "Paid") {
        return res.status(400).json({
          success: false,
          message:
            "This service request has already been paid.",
        });
      }

      /* =====================================================
         VALIDATE PAYMENT METHOD
      ===================================================== */

      const allowedMethods = [
        "jazzcash",
        "easypaisa",
        "bank",
      ];

      if (!allowedMethods.includes(paymentMethod)) {
        return res.status(400).json({
          success: false,
          message: "Invalid payment method.",
        });
      }

      /* =====================================================
         BANK TRANSFER REFERENCE
      ===================================================== */

      if (
        paymentMethod === "bank" &&
        !referenceNumber?.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Bank transfer reference number is required.",
        });
      }

      /* =====================================================
         CREATE PENDING PAYMENT
      ===================================================== */

      const payment = await Payment.create({
        citizen: userId,

        serviceRequest: serviceRequest._id,

        amount: serviceRequest.amount,

        paymentMethod,

        referenceNumber:
          referenceNumber?.trim() || "",

        status: "Pending",
      });

      /* =====================================================
         LINK PAYMENT TO SERVICE REQUEST
      ===================================================== */

      serviceRequest.paymentId = payment._id;

      serviceRequest.paymentStatus = "Pending";

      await serviceRequest.save();

      /* =====================================================
         RESPONSE
      ===================================================== */

      return res.status(201).json({
        success: true,

        message:
          "Payment request created and is awaiting verification.",

        payment: {
          _id: payment._id,

          amount: payment.amount,

          paymentMethod:
            payment.paymentMethod,

          referenceNumber:
            payment.referenceNumber,

          status: payment.status,

          serviceRequestId:
            serviceRequest._id,
        },
      });

    } catch (error) {
      console.error(
        "================================="
      );

      console.error(
        "SERVICE PAYMENT ERROR:"
      );

      console.error(error);

      console.error(
        "================================="
      );

      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Unable to create payment request.",
      });
    }
  }
);

module.exports = router;