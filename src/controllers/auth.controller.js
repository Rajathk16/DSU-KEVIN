require("../config/firebase"); // Initialize Firebase Admin
const { getAuth } = require("firebase-admin/auth");
const User = require("../models/User");

const syncUser = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: { message: "No token provided for sync" }
      });
    }

    // Verify Firebase token
    const decodedToken = await getAuth().verifyIdToken(token);
    const email = decodedToken.email;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: { message: "Firebase token does not contain an email" }
      });
    }

    const { name, college, studentId, bio, skills } = req.body;

    // Server-side sanitization and length enforcement
    const sanitizedName = typeof name === "string" ? name.trim().slice(0, 100) : email.split('@')[0];
    const sanitizedCollege = typeof college === "string" ? college.trim().slice(0, 200) : "";
    const sanitizedStudentId = typeof studentId === "string" ? studentId.trim().slice(0, 100) : "";
    const sanitizedBio = typeof bio === "string" ? bio.trim().slice(0, 1000) : "";

    const normalizedSkills = Array.isArray(skills)
      ? [...new Set(skills.filter(s => typeof s === "string").map(s => s.trim().toLowerCase().slice(0, 50)).filter(Boolean))].slice(0, 30)
      : [];

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: sanitizedName || email.split('@')[0],
        email: email,
        password: "FIREBASE_MANAGED_PASSWORD_" + Date.now(),
        college: sanitizedCollege,
        studentId: sanitizedStudentId,
        bio: sanitizedBio,
        skills: normalizedSkills
      });
    } else {
      // Update existing user profile if needed
      if (sanitizedName) user.name = sanitizedName;
      if (sanitizedCollege) user.college = sanitizedCollege;
      if (sanitizedStudentId) user.studentId = sanitizedStudentId;
      if (sanitizedBio !== undefined) user.bio = sanitizedBio;
      if (Array.isArray(skills)) user.skills = normalizedSkills;
      await user.save();
    }

    return res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error("Sync Error:", error);
    
    // If it's a MongoDB validation or duplicate key error, return 400
    if (error.name === 'ValidationError' || error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: { message: error.message }
      });
    }

    return res.status(401).json({
      success: false,
      error: { message: "Invalid or expired Firebase token", details: error.message }
    });
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
  syncUser,
  getMe
};