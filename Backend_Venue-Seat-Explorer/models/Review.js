const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
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

    ratingView: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    ratingComfort: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    comment: String,

    isFlagged: { type: Boolean, default: false },
    flagReason: String, // 'inappropriate', 'offensive', 'spam'
    isDeleted: { type: Boolean, default: false },
    deletedReason: String,
    censoredComment: {
      original: String,
      censored: String,
      reason: String,
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Review", reviewSchema);
