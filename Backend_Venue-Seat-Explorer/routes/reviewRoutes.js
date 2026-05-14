const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const controller = require("../controllers/reviewController");

router.get("/seat/:seatId", controller.getReviewsBySeat);
router.post("/", auth, controller.createReview);
router.put("/:id", auth, controller.updateReview);
router.delete("/:id", auth, controller.deleteReview);
router.get("/venue/:venueId", controller.getReviewsByVenue);
router.get("/flagged/:venueId", controller.getFlaggedReviews);
router.post("/:id/flag", controller.flagReview);
router.post("/:id/censor", controller.censorReview);

module.exports = router;
