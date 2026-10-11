const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const ServiceRequest = require("../models/ServiceRequest");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================================================
   UPLOAD DIRECTORY
========================================================= */

const uploadDirectory = path.join(
  __dirname,
  "../uploads/service-documents"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

/* =========================================================
   MULTER STORAGE
========================================================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

/* =========================================================
   FILE FILTER
========================================================= */

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, PNG, PDF, DOC and DOCX files are allowed."
      )
    );
  }
};

/* =========================================================
   UPLOAD
========================================================= */

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

/* =========================================================
   SERVICE CATALOG
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
   ALLOWED VALUES
========================================================= */

const ALLOWED_PRIORITIES = [
  "Low",
  "Medium",
  "High",
];

const ALLOWED_STATUSES = [
  "Submitted",
  "Under Review",
  "Processing",
  "Approved",
  "Rejected",
  "Completed",
  "Cancelled",
];

/* =========================================================
   GET USER ID
========================================================= */

const getUserId = (req) => {
  return (
    req.user?.id ||
    req.user?._id ||
    req.user?.userId
  );
};

/* =========================================================
   DEPARTMENT AUTHORIZATION
========================================================= */

const departmentOnly = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    if (
      user.role !== "department" &&
      user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Department access required.",
      });
    }

    req.currentUser = user;

    next();
  } catch (error) {
    console.error(
      "Department authorization error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Authorization failed.",
    });
  }
};

/* =========================================================
   GENERATE REQUEST ID
========================================================= */

const generateRequestId = () => {
  const randomNumber = Math.floor(
    100000 + Math.random() * 900000
  );

  return `SR-${Date.now()}-${randomNumber}`;
};

/* =========================================================
   CREATE SERVICE REQUEST
   CITIZEN
========================================================= */

router.post(
  "/",
  authMiddleware,
  upload.single("attachment"),
  async (req, res) => {
    try {
      const userId = getUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Citizen not found.",
        });
      }

      const {
        category,
        title,
        description,
        location,
        priority = "Medium",
      } = req.body;

      /* -----------------------------------------------------
         VALIDATE CATEGORY
      ----------------------------------------------------- */

      if (!category) {
        return res.status(400).json({
          success: false,
          message: "Service category is required.",
        });
      }

      const service = SERVICES[category];

      if (!service) {
        return res.status(400).json({
          success: false,
          message: "Invalid service category.",
        });
      }

      /* -----------------------------------------------------
         VALIDATE REQUIRED FIELDS
      ----------------------------------------------------- */

      if (!title || !description || !location) {
        return res.status(400).json({
          success: false,
          message:
            "Title, description and location are required.",
        });
      }

      /* -----------------------------------------------------
         VALIDATE PRIORITY
      ----------------------------------------------------- */

      if (!ALLOWED_PRIORITIES.includes(priority)) {
        return res.status(400).json({
          success: false,
          message: "Invalid priority.",
        });
      }

      /* -----------------------------------------------------
         IMPORTANT:
         DEPARTMENT IS AUTOMATICALLY TAKEN FROM SERVICES
      ----------------------------------------------------- */

      const department = service.department;

      /* -----------------------------------------------------
         ATTACHMENT
      ----------------------------------------------------- */

      let attachment = "";

      if (req.file) {
        attachment = `/uploads/service-documents/${req.file.filename}`;
      }

      /* -----------------------------------------------------
         CREATE REQUEST
      ----------------------------------------------------- */

      const serviceRequest =
        await ServiceRequest.create({
          requestId: generateRequestId(),

          citizen: user._id,

          citizenName:
            user.name ||
            user.fullName ||
            "Citizen",

          citizenEmail:
            user.email || "",

          category,

          serviceName: service.name,

          // AUTOMATIC DEPARTMENT
          department,

          title,

          description,

          location,

          priority,

          // AUTOMATIC SERVICE PRICE
          amount: service.price,

          status: "Submitted",

          paymentStatus: "Pending",

          attachment,
        });

      return res.status(201).json({
        success: true,
        message:
          "Service application submitted successfully.",

        serviceRequest,
      });
    } catch (error) {
      console.error(
        "Create service request error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to create service request.",
      });
    }
  }
);

/* =========================================================
   GET CITIZEN'S SERVICE REQUESTS
========================================================= */

router.get(
  "/my",
  authMiddleware,
  async (req, res) => {
    try {
      const userId = getUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      const requests =
        await ServiceRequest.find({
          citizen: userId,
        })
          .populate(
            "paymentId"
          )
          .populate(
            "assignedOfficer",
            "name email department"
          )
          .sort({
            createdAt: -1,
          });

      return res.json({
        success: true,
        serviceRequests: requests,
      });
    } catch (error) {
      console.error(
        "Get citizen service requests error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch service requests.",
      });
    }
  }
);

/* =========================================================
   GET ALL SERVICE APPLICATIONS
   DEPARTMENT OFFICER

   IMPORTANT:
   ONLY APPLICATIONS BELONGING TO THE OFFICER'S
   DEPARTMENT ARE RETURNED.
========================================================= */

router.get(
  "/department/all",
  authMiddleware,
  departmentOnly,
  async (req, res) => {
    try {
      const department =
        req.currentUser?.department;

      /* -----------------------------------------------------
         ADMIN
         Admin can see all applications.
      ----------------------------------------------------- */

      let filter = {};

      if (req.currentUser.role !== "admin") {
        if (!department) {
          return res.status(400).json({
            success: false,
            message:
              "Department is not assigned to this officer.",
          });
        }

        filter = {
          department: department,
        };
      }

      const requests =
        await ServiceRequest.find(filter)
          .populate(
            "citizen",
            "name email phone"
          )
          .populate(
            "paymentId"
          )
          .populate(
            "assignedOfficer",
            "name email department"
          )
          .sort({
            createdAt: -1,
          });

      return res.json({
        success: true,

        department:
          req.currentUser.role === "admin"
            ? "All Departments"
            : department,

        serviceRequests: requests,
      });
    } catch (error) {
      console.error(
        "Get department applications error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch service applications.",
      });
    }
  }
);

/* =========================================================
   GET SINGLE APPLICATION
   DEPARTMENT OFFICER
========================================================= */

router.get(
  "/department/:id",
  authMiddleware,
  departmentOnly,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid service application ID.",
        });
      }

      let filter = {
        _id: id,
      };

      /* -----------------------------------------------------
         DEPARTMENT OFFICER:
         CAN ONLY OPEN THEIR DEPARTMENT'S APPLICATION
      ----------------------------------------------------- */

      if (req.currentUser.role !== "admin") {
        const department =
          req.currentUser?.department;

        if (!department) {
          return res.status(400).json({
            success: false,
            message:
              "Department is not assigned to this officer.",
          });
        }

        filter.department = department;
      }

      const request =
        await ServiceRequest.findOne(filter)
          .populate(
            "citizen",
            "name email phone"
          )
          .populate(
            "paymentId"
          )
          .populate(
            "assignedOfficer",
            "name email department"
          );

      if (!request) {
        return res.status(404).json({
          success: false,
          message:
            "Service application not found or does not belong to your department.",
        });
      }

      return res.json({
        success: true,
        serviceRequest: request,
      });
    } catch (error) {
      console.error(
        "Get department application error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch service application.",
      });
    }
  }
);

/* =========================================================
   UPDATE APPLICATION STATUS
   DEPARTMENT OFFICER
========================================================= */

router.patch(
  "/department/:id/status",
  authMiddleware,
  departmentOnly,
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        status,
        departmentNotes,
      } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid service application ID.",
        });
      }

      /* -----------------------------------------------------
         VALIDATE STATUS
      ----------------------------------------------------- */

      if (
        !status ||
        !ALLOWED_STATUSES.includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid application status.",
          allowedStatuses: ALLOWED_STATUSES,
        });
      }

      /* -----------------------------------------------------
         BUILD FILTER
      ----------------------------------------------------- */

      let filter = {
        _id: id,
      };

      if (req.currentUser.role !== "admin") {
        const department =
          req.currentUser?.department;

        if (!department) {
          return res.status(400).json({
            success: false,
            message:
              "Department is not assigned to this officer.",
          });
        }

        filter.department = department;
      }

      /* -----------------------------------------------------
         FIND APPLICATION
      ----------------------------------------------------- */

      const request =
        await ServiceRequest.findOne(filter);

      if (!request) {
        return res.status(404).json({
          success: false,
          message:
            "Service application not found or does not belong to your department.",
        });
      }

      /* -----------------------------------------------------
         UPDATE
      ----------------------------------------------------- */

      request.status = status;

      if (
        typeof departmentNotes === "string"
      ) {
        request.departmentNotes =
          departmentNotes;
      }

      request.processedBy =
        req.currentUser._id;

      await request.save();

      const updatedRequest =
        await ServiceRequest.findById(
          request._id
        )
          .populate(
            "citizen",
            "name email phone"
          )
          .populate(
            "paymentId"
          )
          .populate(
            "assignedOfficer",
            "name email department"
          );

      return res.json({
        success: true,

        message:
          "Service application status updated successfully.",

        serviceRequest: updatedRequest,
      });
    } catch (error) {
      console.error(
        "Update service status error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update service status.",
      });
    }
  }
);

/* =========================================================
   GET SINGLE SERVICE REQUEST
   CITIZEN
========================================================= */

router.get(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid service request ID.",
        });
      }

      const userId = getUserId(req);

      const request =
        await ServiceRequest.findById(id)
          .populate(
            "citizen",
            "name email phone"
          )
          .populate(
            "paymentId"
          )
          .populate(
            "assignedOfficer",
            "name email department"
          );

      if (!request) {
        return res.status(404).json({
          success: false,
          message:
            "Service request not found.",
        });
      }

      /* -----------------------------------------------------
         DEPARTMENT / ADMIN CAN ACCESS
      ----------------------------------------------------- */

      if (
        req.user?.role === "department" ||
        req.user?.role === "admin"
      ) {
        return res.json({
          success: true,
          serviceRequest: request,
        });
      }

      /* -----------------------------------------------------
         CITIZEN CAN ONLY ACCESS OWN REQUEST
      ----------------------------------------------------- */

      if (
        request.citizen._id.toString() !==
        userId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to view this request.",
        });
      }

      return res.json({
        success: true,
        serviceRequest: request,
      });
    } catch (error) {
      console.error(
        "Get service request error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch service request.",
      });
    }
  }
);

/* =========================================================
   MULTER ERROR HANDLER
========================================================= */

router.use(
  (error, req, res, next) => {
    if (
      error instanceof multer.MulterError
    ) {
      if (
        error.code === "LIMIT_FILE_SIZE"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "File size cannot exceed 5MB.",
        });
      }

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next();
  }
);

module.exports = router;