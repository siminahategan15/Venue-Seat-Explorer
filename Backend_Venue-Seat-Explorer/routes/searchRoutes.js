const express = require("express");
const router = express.Router();
const controller = require("../controllers/searchController");

router.get("/venues", controller.searchVenues);
router.get("/seats", controller.searchSeats);
router.get("/", controller.searchAll);

module.exports = router;
