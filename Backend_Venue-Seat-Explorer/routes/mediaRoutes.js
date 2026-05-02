const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const controller = require("../controllers/mediaController");

router.get("/seat/:seatId", controller.getMediaBySeat);

// single image upload
router.post("/upload/:seatId", upload.single("image"), controller.uploadMedia);

router.delete("/:id", controller.deleteMedia);

module.exports = router;
