// src/routes/matching.routes.js

const express = require("express");

const {
  analyzeProjectAndMatch,
} = require("../controllers/matching.controller");

const { protect } = require("../middleware/auth.middleware");

const router = express.Router();


// POST /api/matching/analyze-project

router.post(
  "/analyze-project",
  protect,
  analyzeProjectAndMatch
);


module.exports = router;