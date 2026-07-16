const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL
);

// Step 1: send the user to Google's login page
const googleLogin = (req, res) => {
  const authUrl = client.generateAuthUrl({
    access_type: "offline",
    scope: ["profile", "email"],
    prompt: "consent",
  });
  res.redirect(authUrl);
};

// Step 2: Google sends the user back here after they log in
const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.redirect("/login?error=missing_code");
    }

    const { tokens } = await client.getToken(code);
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.redirect("/login?error=no_email");
    }

    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.create({
        googleId,
        name,
        email,
        avatar: picture || null,
      });
    }

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.redirect("/profile");
  } catch (err) {
    console.error("Google login failed:", err.message);
    res.redirect("/login?error=login_failed");
  }
};

// Logout
const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.status(200).json({
    success: true,
    message: "Logged out",
    data: null,
  });
};

// Get info about the currently logged in person
const getMe = (req, res) => {
  res.status(200).json({
    success: true,
    message: "",
    data: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
      phone: req.user.phone,
      role: req.user.role,
    },
  });
};

module.exports = { googleLogin, googleCallback, logout, getMe };