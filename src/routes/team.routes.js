const express = require("express");

const {
  createTeam,
  getTeamById,
  updateTeam,
  addMember,
  removeMember
} = require("../controllers/team.controller");

const {
  protect
} = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", protect, createTeam);

router.get("/:id", protect, getTeamById);

router.put("/:id", protect, updateTeam);

router.post("/:id/members", protect, addMember);

router.delete(
  "/:id/members/:userId",
  protect,
  removeMember
);

module.exports = router;