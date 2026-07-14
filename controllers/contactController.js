const Contact = require("../models/Contact");
const { success, error } = require("../utils/response");
const { sendContactAlert } = require("../utils/sendEmail"); // add this at the top of the file

// POST /api/contact
const submitContactForm = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return error(res, 400, "Name, email, and message are all required");
    }

    await Contact.create({ name, email, message });

    sendContactAlert({ name, email, message });

    return success(res, 201, "Message sent, we'll get back to you soon", null);
  } catch (err) {
    if (err.name === "ValidationError") {
      return error(res, 400, "Please check your name, email, and message");
    }
    console.error("submitContactForm failed:", err.message);
    return error(res, 500, "Failed to send message");
  }
};

module.exports = { submitContactForm };