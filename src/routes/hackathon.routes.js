const express = require("express");
const { protect } = require("../middleware/auth.middleware");
const { createHackathon, getHackathons, getHackathonById } = require("../controllers/hackathon.controller");

const router = express.Router();

router.post("/", protect, createHackathon);
router.get("/", protect, getHackathons);
router.get("/:id", protect, getHackathonById);

module.exports = router;