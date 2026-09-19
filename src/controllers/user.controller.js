const mongoose = require("mongoose");

const User = require("../models/User");

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid user ID"
        }
      });
    }

    const user = await User.findById(id).select(
      "name college studentId bio skills github isCollegeVerified createdAt updatedAt"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: "User not found"
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid user ID"
        }
      });
    }

    /*
     * Users may only modify their own profile.
     */
    if (req.user._id.toString() !== id) {
      return res.status(403).json({
        success: false,
        error: {
          message: "You can only update your own profile"
        }
      });
    }

    const allowedFields = [
      "name",
      "college",
      "studentId",
      "bio",
      "skills"
    ];

    const incomingFields = Object.keys(req.body);

    const invalidFields = incomingFields.filter(
      (field) => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: "One or more fields cannot be updated",
          details: {
            invalidFields
          }
        }
      });
    }

    const updates = {};

    if (req.body.name !== undefined) {
      if (
        typeof req.body.name !== "string" ||
        req.body.name.trim().length < 2
      ) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Name must contain at least 2 characters"
          }
        });
      }

      updates.name = req.body.name.trim();
    }

    if (req.body.college !== undefined) {
      if (
        typeof req.body.college !== "string" ||
        !req.body.college.trim()
      ) {
        return res.status(400).json({
          success: false,
          error: {
            message: "College cannot be empty"
          }
        });
      }

      updates.college = req.body.college.trim();
    }

    if (req.body.studentId !== undefined) {
      if (
        typeof req.body.studentId !== "string" ||
        !req.body.studentId.trim()
      ) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Student ID cannot be empty"
          }
        });
      }

      updates.studentId = req.body.studentId.trim();
    }

    if (req.body.bio !== undefined) {
      if (typeof req.body.bio !== "string") {
        return res.status(400).json({
          success: false,
          error: {
            message: "Bio must be a string"
          }
        });
      }

      updates.bio = req.body.bio.trim();
    }

    if (req.body.skills !== undefined) {
      if (!Array.isArray(req.body.skills)) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Skills must be an array"
          }
        });
      }

      const skills = [
        ...new Set(
          req.body.skills
            .filter((skill) => typeof skill === "string")
            .map((skill) => skill.trim().toLowerCase())
            .filter(Boolean)
        )
      ];

      if (skills.length > 30) {
        return res.status(400).json({
          success: false,
          error: {
            message: "A maximum of 30 skills can be added"
          }
        });
      }

      updates.skills = skills;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: updates
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: {
          message: "User not found"
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const { skill } = req.query;
    
    // Base query to only fetch users who have synced GitHub (they are the "talent")
    let query = { "github.username": { $ne: null } };
    
    // If a skill is provided, filter by it
    if (skill) {
      query.skills = { $regex: new RegExp(`^${skill}$`, "i") };
    }

    const users = await User.find(query)
      .select("name college studentId bio skills github.username createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: {
        users
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserById,
  updateUser,
  getAllUsers
};