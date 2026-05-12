const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    seatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seat",
      required: true,
    },
    venueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: { type: String, enum: ["image", "video"], required: true },
    url: { type: String, required: true },
    caption: String,
    uploadedBy: String,

    isFlagged: { type: Boolean, default: false },
    flagReason: String,
    isDeleted: { type: Boolean, default: false },
    deletedReason: String,

    viewCount: { type: Number, default: 0 },
    helpfulCount: { type: Number, default: 0 },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Media", mediaSchema);
