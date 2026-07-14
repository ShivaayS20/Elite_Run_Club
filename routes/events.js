const express = require("express");
const router = express.Router();
const {
  getEvents,
  getNextEvent,
  getEventById,
} = require("../controllers/eventController");

router.get("/", getEvents);
router.get("/next", getNextEvent);
router.get("/:id", getEventById);

module.exports = router;