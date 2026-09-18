const express = require("express");

const {
  getUserById,
  updateUser
} = require("../controllers/user.controller");

const {
  protect
} = require("../middleware/auth.middleware");

const router = express.Router();

/*
 * All profile operations require authentication.
 */
router.get("/:id", protect, getUserById);

router.put("/:id", protect, updateUser);

module.exports = router;