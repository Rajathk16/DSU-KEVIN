const express = require("express");
const {
  syncUser,
  getMe
} = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/sync", syncUser);
router.get("/me", protect, getMe);

module.exports = router;