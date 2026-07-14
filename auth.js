const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Temporary memory cache to store active OTP tokens (expires in 5 minutes)
const dynamicOtpCacheStore = new Map();

// Configuration for Email Delivery Services
// Make sure to add EMAIL_USER and EMAIL_PASS to your .env file
const emailDeliveryTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS  
  }
});

// ── EXTENSION: OTP REQUEST ENDPOINT ─────────────────────────────────────
router.post('/request-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email parameter is required.' });
  }

  // Generate a random 6-digit numeric token string
  const generatedToken = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store OTP with a 5-minute expiration timestamp
  dynamicOtpCacheStore.set(email, {
    token: generatedToken,
    expiresAt: Date.now() + 5 * 60 * 1000 
  });

  const layoutMessagingTemplate = {
    from: `"Elite Run Club Hub" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your One-Time Registration Verification Code',
    html: `
      <div style="font-family: sans-serif; padding: 24px; color: #191c1e;">
        <h2 style="color: #00336e;">Elite Run Club</h2>
        <p>Your verification code token sequence is:</p>
        <div style="background: #f2f4f6; padding: 16px; font-size: 1.5rem; font-weight: bold; letter-spacing: 0.1em; text-align: center; border-radius: 8px; color: #00336e; margin: 16px 0;">
          ${generatedToken}
        </div>
        <p style="font-size: 0.85rem; color: #747781;">This tracking context remains active over the next 5 minutes.</p>
      </div>
    `
  };

  try {
    await emailDeliveryTransporter.sendMail(layoutMessagingTemplate);
    return res.status(200).json({ message: 'Verification code routed to email successfully.' });
  } catch (deliveryFailureError) {
    console.error("SMTP Delivery Error: ", deliveryFailureError);
    return res.status(500).json({ error: 'Failed to send verification email. Check server logs.' });
  }
});

// ── EXTENSION: OTP VERIFICATION ENDPOINT ────────────────────────────────
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const cachedInstancePayload = dynamicOtpCacheStore.get(email);

  if (!cachedInstancePayload) {
    return res.status(400).json({ error: 'Validation process was not requested, or has timed out.' });
  }

  if (Date.now() > cachedInstancePayload.expiresAt) {
    dynamicOtpCacheStore.delete(email);
    return res.status(400).json({ error: 'Verification token expired. Please request a new code.' });
  }

  if (cachedInstancePayload.token !== otp.trim()) {
    return res.status(400).json({ error: 'The code entered is incorrect.' });
  }

  // Verification successful! Clean cache store entry
  dynamicOtpCacheStore.delete(email);
  return res.status(200).json({ status: 'SUCCESS', message: 'Email authenticated successfully.' });
});

// ── EXISTING BACKEND AUTH ROUTES (Placeholders) ─────────────────────────
router.post('/login', async (req, res) => {
  // Your legacy/existing login database authentication routines here
  res.status(501).json({ message: "Login route operational layer status: standard" });
});

router.post('/register', async (req, res) => {
  // Your legacy/existing registration collection writes here
  res.status(501).json({ message: "Registration database destination sync context status: standard" });
});

module.exports = router;