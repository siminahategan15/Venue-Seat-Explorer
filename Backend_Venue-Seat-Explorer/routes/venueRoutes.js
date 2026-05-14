const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const controller = require("../controllers/venueController");

router.get("/", controller.getAllVenues);
router.get("/:id", controller.getVenueById);
router.post("/", auth, controller.isAdmin, controller.createVenue);
router.put("/:id", auth, controller.updateVenue);
router.delete("/:id", auth, controller.deleteVenue);

module.exports = router;
