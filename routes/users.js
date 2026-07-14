const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { updateProfile, updateAvatar } = require("../controllers/userController");

router.patch("/profile", requireAuth, updateProfile);
router.post("/profile/avatar", requireAuth, upload.single("avatar"), updateAvatar);

module.exports = router;