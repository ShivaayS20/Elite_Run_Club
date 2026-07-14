const Event = require("../models/Event");
const Registration = require("../models/Registration");
const Contact = require("../models/Contact");
const { success, error } = require("../utils/response");

// GET /api/admin/events?page=1&limit=10
const getAllEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const total = await Event.countDocuments();
    const events = await Event.find()
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return success(res, 200, "", {
      events,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("getAllEvents failed:", err.message);
    return error(res, 500, "Failed to fetch events");
  }
};

// POST /api/admin/events
const createEvent = async (req, res) => {
  try {
    const event = await Event.create(req.body);
    return success(res, 201, "Event created", { event });
  } catch (err) {
    if (err.name === "ValidationError") {
      return error(res, 400, "Please check the event details");
    }
    console.error("createEvent failed:", err.message);
    return error(res, 500, "Failed to create event");
  }
};

// PATCH /api/admin/events/:id
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!event) {
      return error(res, 404, "Event not found");
    }

    return success(res, 200, "Event updated", { event });
  } catch (err) {
    if (err.name === "CastError") {
      return error(res, 400, "Invalid event ID");
    }
    if (err.name === "ValidationError") {
      return error(res, 400, "Please check the event details");
    }
    console.error("updateEvent failed:", err.message);
    return error(res, 500, "Failed to update event");
  }
};

// DELETE /api/admin/events/:id
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return error(res, 404, "Event not found");
    }

    return success(res, 200, "Event deleted", null);
  } catch (err) {
    if (err.name === "CastError") {
      return error(res, 400, "Invalid event ID");
    }
    console.error("deleteEvent failed:", err.message);
    return error(res, 500, "Failed to delete event");
  }
};

// GET /api/admin/registrations?eventId=...
const getAllRegistrations = async (req, res) => {
  try {
    const { eventId } = req.query;

    const query = {};
    if (eventId) {
      query.event = eventId;
    }

    const registrations = await Registration.find(query)
      .populate("user", "name email phone")
      .populate("event", "title date")
      .sort({ registeredAt: -1 });

    return success(res, 200, "", { registrations });
  } catch (err) {
    if (err.name === "CastError") {
      return error(res, 400, "Invalid event ID");
    }
    console.error("getAllRegistrations failed:", err.message);
    return error(res, 500, "Failed to fetch registrations");
  }
};

// GET /api/admin/contact?status=new
const getAllContactMessages = async (req, res) => {
  try {
    const { status } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const messages = await Contact.find(query).sort({ createdAt: -1 });

    return success(res, 200, "", { messages });
  } catch (err) {
    console.error("getAllContactMessages failed:", err.message);
    return error(res, 500, "Failed to fetch messages");
  }
};

// PATCH /api/admin/contact/:id
const updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["new", "read", "responded"].includes(status)) {
      return error(res, 400, "Invalid status value");
    }

    const message = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!message) {
      return error(res, 404, "Message not found");
    }

    return success(res, 200, "Status updated", { message });
  } catch (err) {
    if (err.name === "CastError") {
      return error(res, 400, "Invalid message ID");
    }
    console.error("updateContactStatus failed:", err.message);
    return error(res, 500, "Failed to update status");
  }
};

module.exports = {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getAllRegistrations,
  getAllContactMessages,
  updateContactStatus,
};