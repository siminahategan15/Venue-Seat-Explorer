const Section = require("../models/Section");
const Seat = require("../models/Seat");
const Venue = require("../models/Venue");
const User = require("../models/User");

exports.getSectionsByVenue = async (req, res) => {
  try {
    const sections = await Section.find({
      venueId: req.params.venueId,
    }).sort({ level: 1, name: 1 });
    res.json(sections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSectionById = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id).populate("venueId");
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }
    res.json(section);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSection = async (req, res) => {
  try {
    if (!req.firebaseUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findOne({ firebaseUid: req.firebaseUser.uid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { venueId, name, level, totalRows } = req.body;

    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }

    if (venue.adminId.toString() !== user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only the venue admin can add sections" });
    }

    const section = await Section.create({ venueId, name, level, totalRows });
    res.status(201).json(section);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSection = async (req, res) => {
  try {
    if (!req.firebaseUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findOne({ firebaseUid: req.firebaseUser.uid });
    const section = await Section.findById(req.params.id);

    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    const venue = await Venue.findById(section.venueId);
    if (venue.adminId.toString() !== user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only the venue admin can update sections" });
    }

    const updated = await Section.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    if (!req.firebaseUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findOne({ firebaseUid: req.firebaseUser.uid });
    const section = await Section.findById(req.params.id);

    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    const venue = await Venue.findById(section.venueId);
    if (venue.adminId.toString() !== user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only the venue admin can delete sections" });
    }

    await Seat.deleteMany({ sectionId: req.params.id });
    await Section.findByIdAndDelete(req.params.id);
    res.json({ message: "Section and its seats deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
