const Venue = require("../models/Venue");
const Seat = require("../models/Seat");
const Section = require("../models/Section");

exports.searchVenues = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: "Query parameter 'q' is required" });
    }

    const regex = new RegExp(q, "i");
    const venues = await Venue.find({
      $or: [{ name: regex }, { city: regex }, { country: regex }],
    })
      .populate("adminId", "email username firstName lastName")
      .limit(20);

    res.json(venues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.searchSeats = async (req, res) => {
  try {
    const { venueId, sectionId, row } = req.query;
    const filter = {};

    if (venueId) filter.venueId = venueId;
    if (sectionId) filter.sectionId = sectionId;
    if (row) filter.row = Number(row);

    const seats = await Seat.find(filter)
      .populate("sectionId")
      .populate("venueId", "name city")
      .limit(50);

    res.json(seats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.searchAll = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: "Query parameter 'q' is required" });
    }

    const regex = new RegExp(q, "i");

    const [venues, sections] = await Promise.all([
      Venue.find({
        $or: [{ name: regex }, { city: regex }, { country: regex }],
      })
        .populate("adminId", "email username firstName lastName")
        .limit(10),
      Section.find({ name: regex })
        .populate("venueId", "name city country")
        .limit(10),
    ]);

    res.json({ venues, sections });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
