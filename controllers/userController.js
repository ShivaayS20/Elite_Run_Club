const User = require("../models/User");
const { success, error } = require("../utils/response");

// PATCH /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    return success(res, 200, "Profile updated", { user });
  } catch (err) {
    if (err.name === "ValidationError") {
      return error(res, 400, "Please check your name/phone");
    }
    console.error("updateProfile failed:", err.message);
    return error(res, 500, "Failed to update profile");
  }
};

// POST /api/users/profile/avatar
const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return error(res, 400, "No file uploaded");
    }

    const avatarPath = `/uploads/avatars/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarPath },
      { new: true }
    );

    return success(res, 200, "Avatar updated", { avatar: user.avatar });
  } catch (err) {
    console.error("updateAvatar failed:", err.message);
    return error(res, 500, "Failed to update avatar");
  }
};

module.exports = { updateProfile, updateAvatar };