const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const User = require("../models/User");
const env = require("../config/env");

const protect = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      return res.status(401).json({
        success: false,
        error: {
          message: "Authentication required"
        }
      });
    }

    if (!authorizationHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: {
          message: "Invalid authorization format"
        }
      });
    }

    const token = authorizationHeader.substring(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          message: "Authentication token is missing"
        }
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(token, env.jwtSecret);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          error: {
            message: "Authentication token has expired"
          }
        });
      }

      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          error: {
            message: "Invalid authentication token"
          }
        });
      }

      return res.status(401).json({
        success: false,
        error: {
          message: "Authentication failed"
        }
      });
    }

    if (!decoded.userId) {
      return res.status(401).json({
        success: false,
        error: {
          message: "Invalid authentication payload"
        }
      });
    }

    if (!mongoose.Types.ObjectId.isValid(decoded.userId)) {
      return res.status(401).json({
        success: false,
        error: {
          message: "Invalid user identity"
        }
      });
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: "User account no longer exists"
        }
      });
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  protect
};