const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    distanceKm: {
      type: Number,
      default: null,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Moderate", "Hard"],
      default: "Easy",
    },
    maxParticipants: {
      type: Number,
      default: null,
    },
    bannerImage: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["draft", "published", "cancelled"],
      default: "published",
    },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

eventSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model("Event", eventSchema);