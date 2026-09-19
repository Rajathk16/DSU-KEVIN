const Hackathon = require("../models/Hackathon");

const createHackathon = async (req, res, next) => {
  try {
    const { name, theme, description, startDate, endDate } = req.body;

    if (!name || !theme || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: { message: "Name, theme, startDate, and endDate are required" }
      });
    }

    const hackathon = await Hackathon.create({
      name,
      theme,
      description,
      startDate,
      endDate,
      createdBy: req.user._id
    });

    return res.status(201).json({
      success: true,
      data: hackathon
    });
  } catch (error) {
    next(error);
  }
};

const getHackathons = async (req, res, next) => {
  try {
    const hackathons = await Hackathon.find().populate("createdBy", "name email");

    return res.status(200).json({
      success: true,
      data: hackathons
    });
  } catch (error) {
    next(error);
  }
};

const getHackathonById = async (req, res, next) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id).populate("createdBy", "name email");

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        error: { message: "Hackathon not found" }
      });
    }

    return res.status(200).json({
      success: true,
      data: hackathon
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createHackathon,
  getHackathons,
  getHackathonById
};