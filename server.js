require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

// DB Config setups
const connectDB = require("./config/db");

// Core router paths
const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const registrationRoutes = require("./routes/registrations");
const galleryRoutes = require("./routes/gallery");
const contactRoutes = require("./routes/contact");
const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/users");

const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB instance setup
connectDB();

// Global System Level Middleware Stack
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Map public static asset folders
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── REGISTER BASE MOUNT POINTS ──────────────────────────────────────────
app.use("/api/auth", authRoutes); // This wires up the /request-otp and /verify-otp endpoints!
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);

// ── PAGE SYSTEM ROUTING LAYER ───────────────────────────────────────────
const pages = {
  "/": "index.html",
  "/about": "about.html",
  "/events": "events.html",
  "/event-details": "event-details.html",
  "/gallery": "gallery.html",
  "/community": "community.html",
  "/routes": "routes.html",
  "/contact": "contact.html",
  "/login": "login.html",
  "/profile": "profile.html",
  "/admin": "admin.html",
};

Object.entries(pages).forEach(([route, file]) => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(__dirname, "public", file));
  });
});

// Fallback 404 Route Processing
app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: "API route not found" });
});

// Handle errors gracefully globally
app.use(errorHandler);

// Vercel's serverless runtime imports this file for its exports and calls the
// app directly — it doesn't need (or want) us binding to a port ourselves.
// Locally (npm run dev / npm start), process.env.VERCEL isn't set, so this
// still starts a normal server exactly as before.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server executing successfully. Live running context listening over port: ${PORT}`);
  });
}

module.exports = app;