const Seat = require("../models/Seat");

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
  const seat = await Seat.create(req.body);
  res.status(201).json(seat);
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
