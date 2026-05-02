const express = require("express");
const router = express.Router();
const controller = require("../controllers/seatController");

router.get("/venue/:venueId", controller.getSeatsByVenue);
router.get("/:id", controller.getSeatById);
router.post("/", controller.createSeat);
router.put("/:id", controller.updateSeat);
router.delete("/:id", controller.deleteSeat);

module.exports = router;
