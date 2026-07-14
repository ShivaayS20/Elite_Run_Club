const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// Wraps any Resend send call so one failure never crashes the app
const send = async (fn, label) => {
  try {
    await fn();
  } catch (err) {
    console.error(`Email failed (${label}):`, err.message);
  }
};

const sendRsvpConfirmation = ({ name, email, event }) => {
  return send(async () => {
    await resend.emails.send({
      from: "Elite Run Club <onboarding@resend.dev>",
      to: email,
      subject: `You're confirmed for ${event.title}!`,
      html: `
        <h2>See you there, ${name}!</h2>
        <p>You're registered for <strong>${event.title}</strong>.</p>
        <p><strong>Date:</strong> ${new Date(event.date).toDateString()}</p>
        <p><strong>Time:</strong> ${event.time}</p>
        <p><strong>Location:</strong> ${event.location}</p>
      `,
    });
  }, "rsvp confirmation");
};

const sendContactAlert = ({ name, email, message }) => {
  return send(async () => {
    await resend.emails.send({
      from: "Elite Run Club <onboarding@resend.dev>",
      to: process.env.ADMIN_EMAIL,
      subject: "New contact form message",
      html: `
        <h3>New message from ${name}</h3>
        <p><strong>Email:</strong> ${email}</p>
        <p>${message}</p>
      `,
    });
  }, "contact alert");
};

module.exports = { sendRsvpConfirmation, sendContactAlert };