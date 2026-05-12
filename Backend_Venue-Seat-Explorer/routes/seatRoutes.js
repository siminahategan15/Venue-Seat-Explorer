const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const controller = require("../controllers/seatController");

router.get("/venue/:venueId", controller.getSeatsByVenue);
router.get("/:id", controller.getSeatById);
router.post("/", auth, controller.createSeat);
router.put("/:id", auth, controller.updateSeat);
router.delete("/:id", auth, controller.deleteSeat);

module.exports = router;
