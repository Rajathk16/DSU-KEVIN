// src/routes/matching.routes.js

const express = require("express");

const {
  analyzeProjectAndMatch,
} = require("../controllers/matching.controller");

const router = express.Router();


// POST /api/matching/analyze-project

router.post(
  "/analyze-project",
  analyzeProjectAndMatch
);


module.exports = router;