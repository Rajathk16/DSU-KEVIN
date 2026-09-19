const mongoose = require("mongoose");

const hackathonSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Hackathon name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"]
    },
    theme: {
      type: String,
      required: [true, "Theme is required"],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"]
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"]
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ["upcoming", "active", "completed"],
      default: "upcoming"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Hackathon", hackathonSchema);