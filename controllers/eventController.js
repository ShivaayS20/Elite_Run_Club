const Event = require("../models/Event");
const Registration = require("../models/Registration");
const { success, error } = require("../utils/response");

// GET /api/events?filter=all|weekend|weekday&page=1&limit=10
const getEvents = async (req, res) => {
  try {
    const { filter = "all", page = 1, limit = 10 } = req.query;

    const query = {
      status: "published",
      date: { $gte: new Date() },
    };

    let events = await Event.find(query).sort({ date: 1 });

    if (filter === "weekend") {
      events = events.filter((e) => {
        const day = new Date(e.date).getDay();
        return day === 0 || day === 6;
      });
    } else if (filter === "weekday") {
      events = events.filter((e) => {
        const day = new Date(e.date).getDay();
        return day >= 1 && day <= 5;
      });
    }

    const total = events.length;
    const start = (page - 1) * limit;
    const paginated = events.slice(start, start + Number(limit));

    return success(res, 200, "", {
      events: paginated,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("getEvents failed:", err.message);
    return error(res, 500, "Failed to fetch events");
  }
};

// GET /api/events/next
const getNextEvent = async (req, res) => {
  try {
    const event = await Event.findOne({
      status: "published",
      date: { $gte: new Date() },
    }).sort({ date: 1 });

    if (!event) {
      return error(res, 404, "No upcoming events");
    }

    return success(res, 200, "", { event });
  } catch (err) {
    console.error("getNextEvent failed:", err.message);
    return error(res, 500, "Failed to fetch next event");
  }
};

// GET /api/events/:id
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return error(res, 404, "Event not found");
    }

    const registrationCount = await Registration.countDocuments({
      event: event._id,
      status: "confirmed",
    });

    return success(res, 200, "", {
      event: { ...event.toObject({ virtuals: true }), registrationCount },
    });
  } catch (err) {
    if (err.name === "CastError") {
      return error(res, 400, "Invalid event ID");
    }
    console.error("getEventById failed:", err.message);
    return error(res, 500, "Failed to fetch event");
  }
};

module.exports = { getEvents, getNextEvent, getEventById };