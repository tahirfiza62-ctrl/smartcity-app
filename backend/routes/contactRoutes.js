
const express = require("express");

const {
  sendContactMessage,
  getAllContactMessages,
} = require("../controllers/contactController");

const router = express.Router();

/* POST CONTACT MESSAGE */
router.post("/send", sendContactMessage);

/* GET ALL CONTACT MESSAGES */
router.get("/all", getAllContactMessages);

module.exports = router;

