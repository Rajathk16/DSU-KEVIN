const mongoose = require("mongoose");
const Team = require("../models/Team");
const User = require("../models/User");

const createTeam = async (req, res, next) => {
  try {
    const { name, description, theme } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Team name is required"
        }
      });
    }

    const team = await Team.create({
      name: name.trim(),
      description: description?.trim() || "",
      theme: theme?.trim() || "",
      owner: req.user._id,
      members: [
        {
          user: req.user._id,
          role: "Team Lead"
        }
      ],
      status: "forming"
    });

    await team.populate([
      {
        path: "owner",
        select: "name email college studentId"
      },
      {
        path: "members.user",
        select: "name email college studentId skills github"
      }
    ]);

    return res.status(201).json({
      success: true,
      data: team
    });
  } catch (error) {
    next(error);
  }
};

const getTeamById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid team ID"
        }
      });
    }

    const team = await Team.findById(id)
      .populate("owner", "name email college studentId skills github")
      .populate(
        "members.user",
        "name email college studentId skills github"
      );

    if (!team) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Team not found"
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: team
    });
  } catch (error) {
    next(error);
  }
};

const updateTeam = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid team ID"
        }
      });
    }

    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Team not found"
        }
      });
    }

    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          message: "Only the team owner can update the team"
        }
      });
    }

    const allowedFields = [
      "name",
      "description",
      "theme",
      "status"
    ];

    const invalidFields = Object.keys(req.body).filter(
      (field) => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Invalid field(s): ${invalidFields.join(", ")}`
        }
      });
    }

    if (
      req.body.name !== undefined &&
      (!req.body.name || !req.body.name.trim())
    ) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Team name cannot be empty"
        }
      });
    }

    if (req.body.name !== undefined) {
      team.name = req.body.name.trim();
    }

    if (req.body.description !== undefined) {
      team.description = req.body.description.trim();
    }

    if (req.body.theme !== undefined) {
      const newTheme = req.body.theme.trim();

      if (team.theme !== newTheme) {
        team.requiredRoles = [];
      }

      team.theme = newTheme;
    }

    if (req.body.status !== undefined) {
      const allowedStatuses = [
        "forming",
        "complete",
        "closed"
      ];

      if (!allowedStatuses.includes(req.body.status)) {
        return res.status(400).json({
          success: false,
          error: {
            message:
              "Invalid team status. Allowed values: forming, complete, closed"
          }
        });
      }

      team.status = req.body.status;
    }

    await team.save();

    await team.populate([
      {
        path: "owner",
        select: "name email college studentId"
      },
      {
        path: "members.user",
        select: "name email college studentId skills github"
      }
    ]);

    return res.status(200).json({
      success: true,
      data: team
    });
  } catch (error) {
    next(error);
  }
};

const addMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid team ID"
        }
      });
    }

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid user ID"
        }
      });
    }

    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Team not found"
        }
      });
    }

    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          message: "Only the team owner can add members"
        }
      });
    }

    if (team.status === "closed") {
      return res.status(400).json({
        success: false,
        error: {
          message: "Cannot add members to a closed team"
        }
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: "User not found"
        }
      });
    }

    const alreadyMember = team.members.some(
      (member) => member.user.toString() === userId.toString()
    );

    if (alreadyMember) {
      return res.status(409).json({
        success: false,
        error: {
          message: "User is already a team member"
        }
      });
    }

    team.members.push({
      user: userId,
      role: role?.trim() || "Team Member"
    });

    await team.save();

    await team.populate([
      {
        path: "owner",
        select: "name email college studentId"
      },
      {
        path: "members.user",
        select: "name email college studentId skills github"
      }
    ]);

    return res.status(200).json({
      success: true,
      data: team
    });
  } catch (error) {
    next(error);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid team ID"
        }
      });
    }

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid user ID"
        }
      });
    }

    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Team not found"
        }
      });
    }

    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          message: "Only the team owner can remove members"
        }
      });
    }

    if (team.owner.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Team owner cannot be removed from the team"
        }
      });
    }

    const memberExists = team.members.some(
      (member) => member.user.toString() === userId.toString()
    );

    if (!memberExists) {
      return res.status(404).json({
        success: false,
        error: {
          message: "User is not a member of this team"
        }
      });
    }

    team.members = team.members.filter(
      (member) => member.user.toString() !== userId.toString()
    );

    await team.save();

    await team.populate([
      {
        path: "owner",
        select: "name email college studentId"
      },
      {
        path: "members.user",
        select: "name email college studentId skills github"
      }
    ]);

    return res.status(200).json({
      success: true,
      data: team
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTeam,
  getTeamById,
  updateTeam,
  addMember,
  removeMember
};