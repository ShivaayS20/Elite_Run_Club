const Event = require("../models/Event");
const Registration = require("../models/Registration");
const { success, error } = require("../utils/response");
const { sendRsvpConfirmation } = require("../utils/sendEmail"); // add this at the top of the file


// POST /api/registrations
const createRegistration = async (req, res) => {
  try {
    const { eventId } = req.body;

    if (!eventId) {
      return error(res, 400, "Event ID is required");
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return error(res, 404, "Event not found");
    }

    const existing = await Registration.findOne({
      user: req.user._id,
      event: eventId,
    });
    if (existing) {
      return error(res, 409, "You've already registered for this event");
    }

    if (event.maxParticipants) {
      const currentCount = await Registration.countDocuments({
        event: eventId,
        status: "confirmed",
      });
      if (currentCount >= event.maxParticipants) {
        return error(res, 409, "This event is full");
      }
    }

    const registration = await Registration.create({
      user: req.user._id,
      event: eventId,
    });

sendRsvpConfirmation({ name: req.user.name, email: req.user.email, event });
    
    return success(res, 201, "Registration confirmed", { registration });
  } catch (err) {
    if (err.name === "CastError") {
      return error(res, 400, "Invalid event ID");
    }
    if (err.code === 11000) {
      return error(res, 409, "You've already registered for this event");
    }
    console.error("createRegistration failed:", err.message);
    return error(res, 500, "Failed to register");
  }
};

// GET /api/registrations/me
const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user._id })
      .populate("event")
      .sort({ registeredAt: -1 });

    const now = new Date();
    const upcoming = registrations.filter((r) => new Date(r.event.date) >= now);
    const past = registrations.filter((r) => new Date(r.event.date) < now);

    return success(res, 200, "", { upcoming, past });
  } catch (err) {
    console.error("getMyRegistrations failed:", err.message);
    return error(res, 500, "Failed to fetch your registrations");
  }
};

// DELETE /api/registrations/:id
const cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return error(res, 404, "Registration not found");
    }

    if (registration.user.toString() !== req.user._id.toString()) {
      return error(res, 403, "This isn't your registration");
    }

    await registration.deleteOne();

    return success(res, 200, "Registration cancelled", null);
  } catch (err) {
    if (err.name === "CastError") {
      return error(res, 400, "Invalid registration ID");
    }
    console.error("cancelRegistration failed:", err.message);
    return error(res, 500, "Failed to cancel registration");
  }
};

module.exports = { createRegistration, getMyRegistrations, cancelRegistration };