const express = require("express");
const router = express.Router();

const ordersController = require("../controllers/ordersController");
const verifyAdmin = require("../middleware/verifyAdmin");

// Specific paths first (avoids any ambiguity with "/")
router.get("/stats", ...verifyAdmin, ordersController.getOrderStats);

router.patch("/:id/confirm", ...verifyAdmin, ordersController.confirmOrder);
router.post("/:id/confirm", ...verifyAdmin, ordersController.confirmOrder);

router.patch("/:id/reject", ...verifyAdmin, ordersController.rejectOrder);
router.post("/:id/reject", ...verifyAdmin, ordersController.rejectOrder);

router.delete("/:id", ...verifyAdmin, ordersController.deleteOrder);

// List + create last
router.post("/", ordersController.createOrder);
router.get("/", ...verifyAdmin, ordersController.getOrders);

module.exports = router;


