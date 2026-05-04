const express = require("express");
const router = express.Router();
const controller = require("../controllers/venueController");

router.get("/", controller.getAllVenues);
router.get("/:id", controller.getVenueById);
router.post("/", controller.createVenue);
router.put("/:id", controller.updateVenue);
router.delete("/:id", controller.deleteVenue);

module.exports = router;
