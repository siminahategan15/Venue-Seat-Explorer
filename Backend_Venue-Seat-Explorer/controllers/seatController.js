const Seat = require("../models/Seat");
const Venue = require("../models/Venue");

exports.getSeatsByVenue = async (req, res) => {
  const seats = await Seat.find({
    venueId: req.params.venueId,
  });

  res.json(seats);
};

exports.getSeatById = async (req, res) => {
  const seat = await Seat.findById(req.params.id)
    .populate("venueId")
    .populate("sectionId");

  res.json(seat);
};

exports.createSeat = async (req, res) => {
  try {
    const { venueId, sectionId, row, seatNumber, x, y } = req.body;

    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }

    const userId = req.user?._id;
    if (venue.adminId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Only the venue admin can add seats" });
    }
    const seat = await Seat.create({
      venueId,
      sectionId,
      row,
      seatNumber,
      x,
      y,
    });
    res.status(201).json(seat);
  } catch (error) {
    console.error("Error creating seat:", error);
    res.status(500).json({ message: "Failed to create seat" });
  }
};

exports.getSeatsByVenue = async (req, res) => {
  try {
    const seats = await Seat.find({ venueId: req.params.venueId }).populate(
      "sectionId",
    );
    res.json(seats);
  } catch (error) {
    console.error("Error fetching seats:", error);
    res.status(500).json({ message: "Failed to fetch seats" });
  }
};

exports.updateSeat = async (req, res) => {
  const seat = await Seat.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.json(seat);
};

exports.deleteSeat = async (req, res) => {
  await Seat.findByIdAndDelete(req.params.id);
  res.json({ message: "Seat deleted" });
};
