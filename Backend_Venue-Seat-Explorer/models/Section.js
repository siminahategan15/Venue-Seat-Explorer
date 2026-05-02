const mongoose = require("mongoose");
const sectionSchema = new mongoose.Schema(
  {
    venueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    level: {
      type: String,
      enum: ["lower", "middle", "upper", "vip"],
      default: "lower",
    },

    totalRows: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Section", sectionSchema);
