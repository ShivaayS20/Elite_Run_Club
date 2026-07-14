const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Checks if the person is logged in
const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "You must be logged in to do this",
        errors: [],
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Account no longer exists",
        errors: [],
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired session, please log in again",
      errors: [],
    });
  }
};

// Checks if the logged-in person is an admin
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "You don't have permission to do this",
      errors: [],
    });
  }
  next();
};

module.exports = { requireAuth, requireAdmin };