const Venue = require("../models/Venue");
const User = require("../models/User");

exports.getAllVenues = async (req, res) => {
  try {
    const venues = await Venue.find().populate(
      "adminId",
      "email username firstName lastName",
    );
    res.json(venues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getVenueById = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id).populate(
      "adminId",
      "email username firstName lastName",
    );
    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }
    res.json(venue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.isAdmin = async (req, res, next) => {
  const user = await User.findOne({
    firebaseUid: req.firebaseUser.uid,
  });
  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Admins only." });
  }
  next();
};

exports.createVenue = async (req, res) => {
  try {
    if (!req.firebaseUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const backendUser = await User.findOne({
      firebaseUid: req.firebaseUser.uid,
    });

    if (!backendUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const {
      name,
      city,
      description,
      country,
      capacity,
      location,
      amenities,
      categories,
      phone,
      website,
    } = req.body;

    if (!location || !location.latitude || !location.longitude) {
      return res.status(400).json({
        message: "Location with latitude and longitude is required",
      });
    }

    const venue = await Venue.create({
      name,
      city,
      country,
      capacity,
      description,
      location,
      amenities,
      categories,
      phone,
      website,
      adminId: backendUser._id,
    });

    await venue.populate("adminId", "email username firstName lastName");
    res.status(201).json(venue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateVenue = async (req, res) => {
  try {
    if (!req.firebaseUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findOne({ firebaseUid: req.firebaseUser.uid });
    const venue = await Venue.findById(req.params.id);

    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }

    if (venue.adminId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Only venue admin can update" });
    }

    const updated = await Venue.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("adminId", "email username firstName lastName");

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteVenue = async (req, res) => {
  try {
    if (!req.firebaseUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findOne({ firebaseUid: req.firebaseUser.uid });
    const venue = await Venue.findById(req.params.id);

    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }

    if (venue.adminId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Only venue admin can delete" });
    }

    await Venue.findByIdAndDelete(req.params.id);
    res.json({ message: "Venue deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getVenueAdminStats = async (req, res) => {
  try {
    if (!req.firebaseUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findOne({ firebaseUid: req.firebaseUser.uid });
    const venues = await Venue.find({ adminId: user._id });

    const Review = require("../models/Review");
    const Media = require("../models/Media");
    const Seat = require("../models/Seat");

    const stats = [];
    for (const venue of venues) {
      const reviews = await Review.countDocuments({ venueId: venue._id });
      const flaggedReviews = await Review.countDocuments({
        venueId: venue._id,
        isFlagged: true,
      });
      const photos = await Media.countDocuments({ venueId: venue._id });
      const flaggedPhotos = await Media.countDocuments({
        venueId: venue._id,
        isFlagged: true,
      });
      const seats = await Seat.countDocuments({ venueId: venue._id });

      stats.push({
        venue,
        reviews,
        flaggedReviews,
        photos,
        flaggedPhotos,
        seats,
      });
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
