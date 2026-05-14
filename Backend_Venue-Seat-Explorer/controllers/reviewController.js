const Review = require("../models/Review");
const User = require("../models/User");
const Venue = require("../models/Venue");

exports.getReviewsBySeat = async (req, res) => {
  try {
    const reviews = await Review.find({ seatId: req.params.seatId })
      .populate("userId", "username firstName lastName")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReviewsByVenue = async (req, res) => {
  try {
    const reviews = await Review.find({ venueId: req.params.venueId })
      .populate("userId", "username firstName lastName")
      .populate("seatId", "seatNumber row")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createReview = async (req, res) => {
  try {
    if (!req.firebaseUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findOne({ firebaseUid: req.firebaseUser.uid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { seatId, venueId, ratingView, ratingComfort, ratingSound, comment } =
      req.body;

    if (!seatId || !venueId) {
      return res
        .status(400)
        .json({ message: "seatId and venueId are required" });
    }

    if (!ratingView || !ratingComfort) {
      return res.status(400).json({ message: "Ratings are required" });
    }

    const reviewData = {
      seatId,
      venueId,
      userId: user._id,
      ratingView,
      ratingComfort,
      comment,
    };
    if (ratingSound) reviewData.ratingSound = ratingSound;

    const review = await Review.create(reviewData);

    await review.populate("userId", "username firstName lastName");
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    if (!req.firebaseUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findOne({ firebaseUid: req.firebaseUser.uid });
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Only review author can update" });
    }

    const updated = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("userId", "username firstName lastName");

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.flagReview = async (req, res) => {
  try {
    const { reason } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isFlagged: true, flagReason: reason },
      { new: true },
    );
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.censorReview = async (req, res) => {
  try {
    if (!req.firebaseUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findOne({ firebaseUid: req.firebaseUser.uid });
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const venue = await Venue.findById(review.venueId);

    if (venue.adminId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Only venue admin can censor" });
    }

    const { reason, replacementText } = req.body;

    const censoredReview = await Review.findByIdAndUpdate(
      req.params.id,
      {
        censoredComment: {
          original: review.comment,
          censored: replacementText || "[Censored - inappropriate content]",
          reason,
        },
      },
      { new: true },
    );

    res.json(censoredReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    if (!req.firebaseUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findOne({ firebaseUid: req.firebaseUser.uid });
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Only review author can delete" });
    }

    const deleted = await Review.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedReason: "User deleted" },
      { new: true },
    );

    res.json(deleted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFlaggedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      venueId: req.params.venueId,
      isFlagged: true,
    })
      .populate("userId", "username firstName lastName")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
