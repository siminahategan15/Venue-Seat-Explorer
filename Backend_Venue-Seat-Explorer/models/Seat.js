const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema(
  {
    venueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
      required: true,
    },

    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },

    row: {
      type: Number,
      required: true,
    },

    seatNumber: {
      type: Number,
      required: true,
    },

    x: Number,
    y: Number,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Seat", seatSchema);
