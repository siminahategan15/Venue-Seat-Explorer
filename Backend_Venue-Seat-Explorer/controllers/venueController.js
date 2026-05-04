const Venue = require("../models/Venue");

exports.getAllVenues = async (req, res) => {
  const venues = await Venue.find();
  res.json(venues);
};

exports.getVenueById = async (req, res) => {
  const venue = await Venue.findById(req.params.id);
  res.json(venue);
};

exports.createVenue = async (req, res) => {
  const venue = await Venue.create(req.body);
  res.status(201).json(venue);
};

exports.updateVenue = async (req, res) => {
  const venue = await Venue.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.json(venue);
};

exports.deleteVenue = async (req, res) => {
  await Venue.findByIdAndDelete(req.params.id);
  res.json({ message: "Venue deleted" });
};
