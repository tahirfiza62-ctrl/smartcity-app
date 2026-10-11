
const Contact = require("../models/Contact");

/* =========================================================
   SEND CONTACT MESSAGE
========================================================= */

const sendContactMessage = async (req, res) => {
  try {
    const {
      name,
      email,
      subject,
      message,
    } = req.body;

    /* Validation */

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email and message are required.",
      });
    }

    /* Create message */

    const contact = await Contact.create({
      name,
      email,
      subject,
      message,
    });

    return res.status(201).json({
      success: true,
      message: "Your message has been sent successfully.",
      contact,
    });

  } catch (error) {
    console.error("Contact message error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while sending your message.",
    });
  }
};


/* =========================================================
   GET ALL CONTACT MESSAGES
========================================================= */

const getAllContactMessages = async (req, res) => {
  try {
    const contacts = await Contact.find()
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: contacts.length,
      contacts,
    });

  } catch (error) {
    console.error("Get contacts error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve contact messages.",
    });
  }
};


module.exports = {
  sendContactMessage,
  getAllContactMessages,
};

