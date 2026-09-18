const mongoose = require("mongoose");

const Team = require("../models/Team");
const User = require("../models/User");

const { analyzeProject } = require("../services/ai.service");

const {
  aggregateTeamSkills,
  calculateSkillGaps,
  calculateCandidateMatch,
  calculateEvidenceScore,
  calculateProjectRelevance,
  calculateFinalMatch,
  generateReasons,
  rankCandidates,
} = require("../services/matching.service");


async function analyzeProjectAndMatch(req, res) {
  try {
    const {
      projectDescription,
      teamId,
    } = req.body;


    // ==============================
    // 1. VALIDATE PROJECT DESCRIPTION
    // ==============================

    if (
      !projectDescription ||
      typeof projectDescription !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "projectDescription is required.",
      });
    }


    // ==============================
    // 2. VALIDATE TEAM ID
    // ==============================

    if (!teamId) {
      return res.status(400).json({
        success: false,
        message: "teamId is required.",
      });
    }

    if (!mongoose.isValidObjectId(teamId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid team ID.",
      });
    }


    // ==============================
    // 3. FETCH TEAM
    // ==============================

    const team = await Team.findById(teamId)
      .populate(
        "members.user",
        "name email college studentId skills github"
      );

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found.",
      });
    }


    // ==============================
    // 4. GET TEAM MEMBERS
    // ==============================

    const teamMembers = team.members
      .map((member) => member.user)
      .filter(Boolean);

    const teamMemberIds = teamMembers.map(
      (member) => member._id
    );


    // ==============================
    // 5. FETCH POTENTIAL CANDIDATES
    // ==============================

    const candidates = await User.find({
      _id: {
        $nin: teamMemberIds,
      },
    }).select(
      "name email college studentId skills github"
    );


    // ==============================
    // 6. LOG TEAM DATA
    // ==============================

    console.log("\n==============================");
    console.log("REAL TEAM DATA");
    console.log("==============================");

    console.log("Team:", team.name);

    console.log(
      "Team Members:",
      teamMembers.map((member) => ({
        id: member._id,
        name: member.name,
        skills: member.skills,
      }))
    );

    console.log(
      "Candidate Count:",
      candidates.length
    );


    // ==============================
    // 7. AI PROJECT ANALYSIS
    // ==============================

    console.log("\n==============================");
    console.log("AI PROJECT ANALYSIS");
    console.log("==============================");

    const aiResult =
      await analyzeProject(projectDescription);

    const requiredSkills =
      aiResult.skills || [];

    console.log(
      "Required Skills:",
      requiredSkills
    );


    // ==============================
    // 8. ANALYZE TEAM SKILLS
    // ==============================

    const teamSkills =
      aggregateTeamSkills(teamMembers);


    // ==============================
    // 9. FIND SKILL GAPS
    // ==============================

    const skillGaps =
      calculateSkillGaps(
        requiredSkills,
        teamSkills
      );


    console.log("\n==============================");
    console.log("TEAM SKILL ANALYSIS");
    console.log("==============================");

    console.log(
      "Team Skills:",
      teamSkills
    );

    console.log(
      "Skill Gaps:",
      skillGaps
    );


    // ==============================
    // 10. SCORE EVERY CANDIDATE
    // ==============================

    const scoredCandidates =
      candidates.map((candidate) => {

        // ------------------------------
        // Skill Match
        // ------------------------------

        const skillMatch =
          calculateCandidateMatch(
            candidate,
            skillGaps
          );


        // ------------------------------
        // GitHub Evidence
        // ------------------------------

        const githubEvidence =
          calculateEvidenceScore(
            candidate.github || {},
            requiredSkills
          );


        // ------------------------------
        // Project Relevance
        // ------------------------------

        const projectRelevance =
          calculateProjectRelevance(
            candidate,
            requiredSkills
          );


        // ------------------------------
        // Final Match Score
        // ------------------------------

        const finalScore =
          calculateFinalMatch(
            skillMatch.score,
            githubEvidence,
            projectRelevance
          );


        // ------------------------------
        // Explanation / Reasons
        // ------------------------------

        const reasons =
          generateReasons({
            matchedSkills:
              skillMatch.matchedSkills,

            githubEvidence,

            projectRelevance,

            github:
              candidate.github || {},
          });


        // ------------------------------
        // Candidate Result
        // ------------------------------

        return {
          id: candidate._id,

          name: candidate.name,

          email: candidate.email,

          college: candidate.college,

          skillMatch:
            skillMatch.score,

          githubEvidence,

          projectRelevance,

          finalScore,

          matchedSkills:
            skillMatch.matchedSkills,

          missingSkills:
            skillMatch.missingSkills,

          reasons,
        };
      });


    // ==============================
    // 11. RANK CANDIDATES
    // ==============================

    const rankedCandidates =
      rankCandidates(scoredCandidates);


    // ==============================
    // 12. ADD RANK POSITION
    // ==============================

    const rankedCandidatesWithPosition =
      rankedCandidates.map(
        (candidate, index) => ({
          rank: index + 1,
          ...candidate,
        })
      );


    // ==============================
    // 13. SEND FINAL RESPONSE
    // ==============================

    return res.status(200).json({
      success: true,

      project: {
        description: projectDescription,

        requiredSkills,
      },

      teamAnalysis: {
        teamId: team._id,

        teamName: team.name,

        teamSkills,

        skillGaps,
      },

      candidates:
        rankedCandidatesWithPosition,
    });


  } catch (error) {

    // ==============================
    // ERROR HANDLING
    // ==============================

    console.error(
      "Matching controller error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to analyze project and match candidates.",

      error:
        error.message,
    });
  }
}


module.exports = {
  analyzeProjectAndMatch,
};