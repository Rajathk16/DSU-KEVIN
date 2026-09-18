const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const env = require("../config/env");

const createToken = (userId) => {
  return jwt.sign(
    {
      userId: userId.toString()
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn
    }
  );
};

const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      college,
      studentId,
      bio,
      skills
    } = req.body;

    if (!name || !email || !password || !college || !studentId) {
      return res.status(400).json({
        success: false,
        error: {
          message:
            "name, email, password, college and studentId are required"
        }
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Verify it's a college email
    if (!normalizedEmail.match(/(\.edu|\.ac\.in)$/i)) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Please register with a valid college email address (.edu or .ac.in)"
        }
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Password must contain at least 8 characters"
        }
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          message: "An account with this email already exists"
        }
      });
    }

    const normalizedSkills = Array.isArray(skills)
      ? [
          ...new Set(
            skills
              .filter((skill) => typeof skill === "string")
              .map((skill) => skill.trim().toLowerCase())
              .filter(Boolean)
          )
        ]
      : [];

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: passwordHash,
      college: college.trim(),
      studentId: studentId.trim(),
      bio: typeof bio === "string" ? bio.trim() : "",
      skills: normalizedSkills
    });

    const token = createToken(user._id);

    return res.status(201).json({
      success: true,
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Email and password are required"
        }
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail
    }).select("+password");

    /*
     * Do not reveal whether the email exists.
     */
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: "Invalid email or password"
        }
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        error: {
          message: "Invalid email or password"
        }
      });
    }

    const token = createToken(user._id);

    return res.status(200).json({
      success: true,
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe
};