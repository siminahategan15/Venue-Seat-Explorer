const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    seatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seat",
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
  },
  { timestamps: true },
);

module.exports = mongoose.model("Review", reviewSchema);
