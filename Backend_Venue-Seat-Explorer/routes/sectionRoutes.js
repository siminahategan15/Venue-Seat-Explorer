const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const controller = require("../controllers/sectionController");

router.get("/venue/:venueId", controller.getSectionsByVenue);
router.get("/:id", controller.getSectionById);
router.post("/", auth, controller.createSection);
router.put("/:id", auth, controller.updateSection);
router.delete("/:id", auth, controller.deleteSection);

module.exports = router;
