require("../config/firebase"); // Initialize Firebase Admin
const { getAuth } = require("firebase-admin/auth");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        message: "Not authorized to access this route"
      }
    });
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    
    // We expect the user to be synced to our DB
    const user = await User.findOne({ email: decodedToken.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: "User not found in database. Please register."
        }
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Firebase Auth Error:", error);
    return res.status(401).json({
      success: false,
      error: {
        message: "Not authorized to access this route",
        details: error.message
      }
    });
  }
};

module.exports = {
  protect
};