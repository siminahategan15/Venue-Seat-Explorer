const Media = require("../models/Media");
const User = require("../models/User");
const Venue = require("../models/Venue");

exports.getMediaBySeat = async (req, res) => {
  try {
    const media = await Media.find({ seatId: req.params.seatId })
      .populate("userId", "username")
      .sort({ createdAt: -1 });
    res.json(media);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.uploadMedia = async (req, res) => {
  try {
    if (!req.firebaseUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findOne({ firebaseUid: req.firebaseUser.uid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { seatId } = req.params;
    const { caption } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileUrl = req.file.path || `/uploads/${req.file.filename}`;

    const media = await Media.create({
      seatId,
      venueId: req.body.venueId,
      userId: user._id,
      type: req.file.mimetype.startsWith("image") ? "image" : "video",
      url: fileUrl,
      caption,
      uploadedBy: user.username,
    });

    res.status(201).json(media);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.flagMedia = async (req, res) => {
  try {
    const { reason } = req.body;
    const media = await Media.findByIdAndUpdate(
      req.params.id,
      { isFlagged: true, flagReason: reason },
      { new: true },
    );
    res.json(media);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteMedia = async (req, res) => {
  try {
    if (!req.firebaseUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findOne({ firebaseUid: req.firebaseUser.uid });
    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({ message: "Media not found" });
    }

    const venue = await Venue.findById(media.venueId);

    if (
      media.userId.toString() !== user._id.toString() &&
      venue.adminId.toString() !== user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized to delete" });
    }

    const deleted = await Media.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        deletedReason: req.body.reason || "Deleted by moderator",
      },
      { new: true },
    );

    res.json(deleted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markMediaHelpful = async (req, res) => {
  try {
    const media = await Media.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpfulCount: 1 } },
      { new: true },
    );
    res.json(media);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMediaByVenue = async (req, res) => {
  try {
    const media = await Media.find({ venueId: req.params.venueId })
      .populate("userId", "username")
      .populate("seatId", "seatNumber row")
      .sort({ createdAt: -1 });
    res.json(media);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFlaggedMedia = async (req, res) => {
  try {
    const media = await Media.find({
      venueId: req.params.venueId,
      isFlagged: true,
    })
      .populate("userId", "username")
      .sort({ createdAt: -1 });
    res.json(media);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
