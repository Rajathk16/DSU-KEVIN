const express = require("express");

const {
  createTeam,
  getTeamById,
  getAllTeams,
  updateTeam,
  addMember,
  removeMember,
  addGuestMember,
  removeGuestMember,
  deleteTeam,
  getMyTeams,
  respondToInvite
} = require("../controllers/team.controller");

const {
  protect
} = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", protect, createTeam);
router.get("/", protect, getAllTeams);

router.get("/user/me", protect, getMyTeams);

router.get("/:id", protect, getTeamById);

router.put("/:id", protect, updateTeam);

router.post("/:id/members", protect, addMember);

router.delete(
  "/:id/members/:userId",
  protect,
  removeMember
);

router.put("/:id/invites/respond", protect, respondToInvite);

router.post("/:id/guests", protect, addGuestMember);
router.delete("/:id/guests/:guestId", protect, removeGuestMember);

router.delete("/:id", protect, deleteTeam);

module.exports = router;