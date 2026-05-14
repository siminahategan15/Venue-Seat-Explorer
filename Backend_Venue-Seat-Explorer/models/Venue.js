const mongoose = require("mongoose");

const venueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
    },

    country: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      address: { type: String },
      placeId: String, // Google Places id ---to do
    },

    capacity: {
      type: Number,
      required: true,
    },

    imageUrl: {
      type: String,
    },

    categories: [String], // ['stadium', 'theater', 'concert', 'sports']
    amenities: [String], // ['wifi', 'parking', 'restrooms', 'food']
    website: String,
    phone: String,

    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Venue", venueSchema);
