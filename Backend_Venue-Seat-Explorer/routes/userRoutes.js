const express = require("express");
const router = express.Router();
const controller = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");

router.get("/me", authMiddleware, controller.getCurrentUser);
router.get("/", controller.getUsers);
router.get("/:id", controller.getUserById);
router.post("/", controller.createUser);
router.put("/:id", authMiddleware, controller.updateUser);
router.delete("/:id", authMiddleware, controller.deleteUser);

module.exports = router;
