const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const controller = require("../controllers/mediaController");

router.get("/seat/:seatId", controller.getMediaBySeat);
router.post(
  "/upload/:seatId",
  auth,
  upload.single("image"),
  controller.uploadMedia,
);
router.delete("/:id", auth, controller.deleteMedia);
router.get("/venue/:venueId", controller.getMediaByVenue);
router.get("/flagged/:venueId", controller.getFlaggedMedia);
router.post("/:id/flag", controller.flagMedia);
router.post("/:id/helpful", controller.markMediaHelpful);

module.exports = router;
