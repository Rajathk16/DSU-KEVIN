const mongoose = require("mongoose");

const teamRequestSchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true
    },

    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    message: {
      type: String,
      trim: true,
      maxlength: [500, "Message cannot exceed 500 characters"],
      default: ""
    },

    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "rejected",
        "cancelled"
      ],
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);

teamRequestSchema.index({
  team: 1,
  requester: 1
});

teamRequestSchema.index({
  team: 1,
  status: 1
});

const TeamRequest = mongoose.model(
  "TeamRequest",
  teamRequestSchema
);

module.exports = TeamRequest;