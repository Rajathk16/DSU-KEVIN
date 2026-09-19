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

    const normalizedSkills = Array.isArray(skills)
      ? [...new Set(skills.filter(s => typeof s === "string").map(s => s.trim().toLowerCase()).filter(Boolean))]
      : [];

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user in DB
      // We don't need to store passwords anymore because Firebase handles it!
      // However, our User model might require a password field. 
      // We can generate a random string or remove the requirement from the schema later.
      user = await User.create({
        name: name ? name.trim() : email.split('@')[0],
        email: email,
        password: "FIREBASE_MANAGED_PASSWORD_" + Date.now(), // Dummy password since required
        college: college ? college.trim() : "",
        studentId: studentId ? studentId.trim() : "",
        bio: typeof bio === "string" ? bio.trim() : "",
        skills: normalizedSkills
      });
    } else {
      // Update existing user profile if needed
      if (name) user.name = name.trim();
      if (college) user.college = college.trim();
      if (studentId) user.studentId = studentId.trim();
      if (bio) user.bio = bio.trim();
      if (skills) user.skills = normalizedSkills;
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