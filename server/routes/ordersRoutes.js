// server/routes/ordersRoutes.js
const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");
const ordersController = require("../controllers/ordersController");

router.post("/place", authenticate, ordersController.placeOrder);
router.get("/", authenticate, ordersController.getOrders);
router.post("/cancel", authenticate, ordersController.cancelOrder);

module.exports = router;
