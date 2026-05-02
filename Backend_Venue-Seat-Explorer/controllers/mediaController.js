const Media = require("../models/Media");

exports.getMediaBySeat = async (req, res) => {
  const media = await Media.find({
    seatId: req.params.seatId,
  }).populate("userId", "username email");

  res.json(media);
};

exports.uploadMedia = async (req, res) => {
  try {
    const media = await Media.create({
      seatId: req.params.seatId,
      venueId: req.body.venueId,
      userId: req.body.userId,
      username: req.body.username,
      type: "image",
      url: req.file.path, // Cloudinary URL
      caption: req.body.caption,
    });

    res.status(201).json(media);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteMedia = async (req, res) => {
  await Media.findByIdAndDelete(req.params.id);
  res.json({ message: "Media deleted" });
};
