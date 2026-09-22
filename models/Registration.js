const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "confirmed",
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
 { timestamps: true, toJSON: { virtuals: true } }
);

registrationSchema.index({ user: 1, event: 1 }, { unique: true });
registrationSchema.index({ event: 1 });

module.exports = mongoose.model("Registration", registrationSchema);