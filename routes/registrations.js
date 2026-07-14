const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const {
  createRegistration,
  getMyRegistrations,
  cancelRegistration,
} = require("../controllers/registrationController");

router.post("/", requireAuth, createRegistration);
router.get("/me", requireAuth, getMyRegistrations);
router.delete("/:id", requireAuth, cancelRegistration);

module.exports = router;