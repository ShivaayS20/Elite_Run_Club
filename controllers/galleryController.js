const Gallery = require("../models/Gallery");
const { success, error } = require("../utils/response");

// GET /api/gallery?eventId=...&page=1&limit=12
const getGalleryImages = async (req, res) => {
  try {
    const { eventId, page = 1, limit = 12 } = req.query;

    const query = {};
    if (eventId) {
      query.event = eventId;
    }

    const total = await Gallery.countDocuments(query);
    const images = await Gallery.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return success(res, 200, "", {
      images,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    if (err.name === "CastError") {
      return error(res, 400, "Invalid event ID");
    }
    console.error("getGalleryImages failed:", err.message);
    return error(res, 500, "Failed to fetch gallery images");
  }
};

module.exports = { getGalleryImages };