const express = require("express");
const router = express.Router();
const controller = require("../controllers/reviewController");

router.get("/seat/:seatId", controller.getReviewsBySeat);
router.post("/", controller.createReview);
router.put("/:id", controller.updateReview);
router.delete("/:id", controller.deleteReview);

module.exports = router;
