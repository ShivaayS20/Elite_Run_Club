const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      default: null,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      default: null,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

gallerySchema.index({ event: 1 });

module.exports = mongoose.model("Gallery", gallerySchema);