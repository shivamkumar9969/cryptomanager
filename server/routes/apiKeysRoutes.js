const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");
const {
  getApiKeys,
  addApiKey,
  deleteApiKey,
} = require("../controllers/apiKeysController");

router.get("/", authenticate, getApiKeys);
router.post("/add", authenticate, addApiKey);
router.delete("/:id", authenticate, deleteApiKey);

module.exports = router;
