const Review = require("../models/Review");

exports.getReviewsBySeat = async (req, res) => {
  const reviews = await Review.find({
    seatId: req.params.seatId,
  }).populate("userId", "username");

  res.json(reviews);
};

exports.createReview = async (req, res) => {
  const review = await Review.create(req.body);
  res.status(201).json(review);
};

exports.updateReview = async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.json(review);
};

exports.deleteReview = async (req, res) => {
  await Review.findByIdAndDelete(req.params.id);
  res.json({ message: "Review deleted" });
};
