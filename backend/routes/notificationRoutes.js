const express = require("express");

const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// ==========================================
// GET USER NOTIFICATIONS
// ==========================================

router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId =
      req.user?.id ||
      req.user?._id ||
      req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required.",
      });
    }

    const notifications = await Notification.find({
      user: userId,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      notifications,
    });

  } catch (error) {
    console.error(
      "Get Notifications Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications.",
    });
  }
});


// ==========================================
// GET UNREAD COUNT
// ==========================================

router.get(
  "/unread-count",
  authMiddleware,
  async (req, res) => {
    try {
      const userId =
        req.user?.id ||
        req.user?._id ||
        req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User authentication required.",
        });
      }

      const count =
        await Notification.countDocuments({
          user: userId,
          isRead: false,
        });

      res.status(200).json({
        success: true,
        count,
      });

    } catch (error) {
      console.error(
        "Unread Count Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to get notification count.",
      });
    }
  }
);


// ==========================================
// MARK ONE AS READ
// ==========================================

router.patch(
  "/:id/read",
  authMiddleware,
  async (req, res) => {
    try {
      const userId =
        req.user?.id ||
        req.user?._id ||
        req.user?.userId;

      const notification =
        await Notification.findOneAndUpdate(
          {
            _id: req.params.id,
            user: userId,
          },
          {
            isRead: true,
          },
          {
            new: true,
          }
        );

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found.",
        });
      }

      res.status(200).json({
        success: true,
        notification,
      });

    } catch (error) {
      console.error(
        "Mark Notification Read Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to update notification.",
      });
    }
  }
);


// ==========================================
// MARK ALL AS READ
// ==========================================

router.patch(
  "/read-all",
  authMiddleware,
  async (req, res) => {
    try {
      const userId =
        req.user?.id ||
        req.user?._id ||
        req.user?.userId;

      await Notification.updateMany(
        {
          user: userId,
          isRead: false,
        },
        {
          $set: {
            isRead: true,
          },
        }
      );

      res.status(200).json({
        success: true,
        message:
          "All notifications marked as read.",
      });

    } catch (error) {
      console.error(
        "Mark All Read Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to update notifications.",
      });
    }
  }
);


// ==========================================
// DELETE NOTIFICATION
// ==========================================

router.delete(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const userId =
        req.user?.id ||
        req.user?._id ||
        req.user?.userId;

      const notification =
        await Notification.findOneAndDelete({
          _id: req.params.id,
          user: userId,
        });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found.",
        });
      }

      res.status(200).json({
        success: true,
        message:
          "Notification deleted successfully.",
      });

    } catch (error) {
      console.error(
        "Delete Notification Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to delete notification.",
      });
    }
  }
);


module.exports = router;