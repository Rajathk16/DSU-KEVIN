const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Skill name is required"],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: [100, "Skill name cannot exceed 100 characters"]
    },

    category: {
      type: String,
      trim: true,
      maxlength: [100, "Category cannot exceed 100 characters"],
      default: "Uncategorized"
    },

    source: {
      type: String,
      enum: ["manual", "github_extraction"],
      default: "manual"
    }
  },
  {
    timestamps: true
  }
);

const Skill = mongoose.model("Skill", skillSchema);

module.exports = Skill;