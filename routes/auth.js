const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const {
  googleLogin,
  googleCallback,
  logout,
  getMe,
} = require("../controllers/authController");

router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);
router.post("/logout", logout);
router.get("/me", requireAuth, getMe);

module.exports = router;