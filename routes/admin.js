const express = require("express");
const router = express.Router();
const { requireAuth, requireAdmin } = require("../middleware/auth");
const {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getAllRegistrations,
  getAllContactMessages,
  updateContactStatus,
} = require("../controllers/adminController");

router.use(requireAuth, requireAdmin);

router.get("/events", getAllEvents);
router.post("/events", createEvent);
router.patch("/events/:id", updateEvent);
router.delete("/events/:id", deleteEvent);

router.get("/registrations", getAllRegistrations);

router.get("/contact", getAllContactMessages);
router.patch("/contact/:id", updateContactStatus);

module.exports = router;