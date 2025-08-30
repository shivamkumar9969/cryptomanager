const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");

router.get("/profile", authenticate, userController.getProfile);
router.put("/profile", authenticate, userController.updateProfile);
router.put("/change-password", authenticate, userController.changePassword);

module.exports = router;
