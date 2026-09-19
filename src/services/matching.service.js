// src/services/matching.service.js

// --------------------------------------------------
// 1. NORMALIZE SKILL
// --------------------------------------------------

function normalizeSkill(skill) {
  if (!skill || typeof skill !== "string") {
    return "";
  }

  let normalized = skill
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

  const aliases = {
    // Python
    // -------------------------
    "python3": "python",
    "python2": "python",
    "python programming": "python",
    "python development": "python",
    
    // JavaScript
    // -------------------------
    "javascript programming": "javascript",
    "js": "javascript",
    
    // React
    // -------------------------
    "react.js": "react",
    "reactjs": "react",
    "react js": "react",
    "react development": "react",
    
    // Node.js
    // -------------------------
    "nodejs": "node.js",
    "node js": "node.js",
    "node development": "node.js",
    
    // Machine Learning
    // -------------------------
    "ml": "machine learning",
    "machine-learning": "machine learning",
    "machine learning programming":
      "machine learning",
      
    // Artificial Intelligence
    // -------------------------
    "ai": "artificial intelligence",
    
    // Computer Vision
    // -------------------------
    "cv": "computer vision",
    "computer vision and deep learning":
      "computer vision",
    "computer vision & deep learning":
      "computer vision",
      
    // Deep Learning
    // -------------------------
    "deep learning (pytorch/tensorflow)":
      "deep learning",

    "deep learning pytorch tensorflow":
      "deep learning",

    "deep learning with pytorch":
      "deep learning",

    "deep learning with tensorflow":
      "deep learning",
      
    // PyTorch
    // -------------------------
    "pytorch framework": "pytorch",
    
    // TensorFlow
    // -------------------------
    "tensorflow framework": "tensorflow",
    
    // MongoDB
    // -------------------------
    "mongo": "mongodb",
    
    // Express
    // -------------------------
    "express.js": "express",
    "expressjs": "express",
    
    // Next.js
    // -------------------------
    "nextjs": "next.js",
    "next js": "next.js",
    
    // GIS / Geospatial
    // -------------------------
    "gis": "geospatial data analysis",

    "geospatial data analysis (gis)":
      "geospatial data analysis",

    "geospatial analysis":
      "geospatial data analysis",

    "gis and geospatial data processing":
      "geospatial data analysis",

    "gis & geospatial data processing":
      "geospatial data analysis",
      
    // Full Stack
    // -------------------------
    "full stack development":
      "full-stack development",

    "full-stack development":
      "full-stack development",

    "full stack web development":
      "full-stack development",

    "full-stack web development":
      "full-stack development",

    "full-stack web/mobile development":
      "full-stack development",

    "full stack web/mobile development":
      "full-stack development",
      
    // Cloud
    // -------------------------
    "cloud computing":
      "cloud computing",

    "cloud deployment":
      "cloud deployment",

    "cloud deployment & mlops":
      "cloud deployment",

    "cloud deployment and mlops":
      "cloud deployment",

    "cloud computing and deployment":
      "cloud computing",
      
    // MLOps
    // -------------------------
    "ml ops": "mlops",
    "ml-ops": "mlops",
    
    // AWS
    // -------------------------
    "amazon web services": "aws",
    
    // Docker
    // -------------------------
    "docker containerization":
      "docker"
  };

  normalized =
    aliases[normalized] || normalized;

  return normalized;
}

// --------------------------------------------------
// 2. AGGREGATE TEAM SKILLS
// --------------------------------------------------

function aggregateTeamSkills(teamMembers = []) {
  const teamSkills = {};

  for (const member of teamMembers) {
    if (!member) {
      continue;
    }

    // Support both:
    // member.skills
    // and populated member.user.skills
    const user = member.user || member;

    if (!Array.isArray(user.skills)) {
      continue;
    }

    for (const skill of user.skills) {
      if (!skill || typeof skill !== "string") {
        continue;
      }

      const normalizedName = normalizeSkill(skill);

      if (!normalizedName) {
        continue;
      }

      // User.js stores skills as strings,
      // so skill presence = proficiency 10 for MVP.
      const score = 10;

      // Keep the highest score if the skill
      // appears in multiple team members.
      if (
        !teamSkills[normalizedName] ||
        score > teamSkills[normalizedName]
      ) {
        teamSkills[normalizedName] = score;
      }
    }
  }

  return teamSkills;
}


// --------------------------------------------------
// 3. CALCULATE SKILL GAPS
// --------------------------------------------------

function calculateSkillGaps(requiredSkills = [], teamSkills = {}) {
  const skillGaps = [];

  for (const required of requiredSkills) {
    if (!required || !required.name) {
      continue;
    }

    const skillName = normalizeSkill(required.name);

    if (!skillName) {
      continue;
    }

    const importance = Number(required.importance) || 1;

    const teamScore = teamSkills[skillName] || 0;

    // If team doesn't have the skill,
    // consider it a skill gap.
    if (teamScore === 0) {
      skillGaps.push({
        name: skillName,
        importance,
        reason: required.reason || "",
      });
    }
  }

  return skillGaps;
}


// --------------------------------------------------
// 4. CALCULATE CANDIDATE MATCH
// --------------------------------------------------

function calculateCandidateMatch(candidate, skillGaps = []) {
  if (!candidate || !Array.isArray(candidate.skills)) {
    return {
      score: 0,
      matchedSkills: [],
      missingSkills: skillGaps.map(
        (skill) => skill.name
      )
    };
  }

  let totalImportance = 0;
  let matchedImportance = 0;

  const matchedSkills = [];
  const missingSkills = [];

  // User.js stores skills as:
  // ["Python", "React.js", "Node.js"]
  //
  // Convert them into normalized skill names.
  const candidateSkills = new Set();

  for (const skill of candidate.skills) {
    if (!skill || typeof skill !== "string") {
      continue;
    }

    const normalizedName = normalizeSkill(skill);

    if (normalizedName) {
      candidateSkills.add(normalizedName);
    }
  }

  // Compare candidate skills with the project's skill gaps.
  for (const requiredSkill of skillGaps) {
    if (!requiredSkill || !requiredSkill.name) {
      continue;
    }

    const skillName =
      normalizeSkill(requiredSkill.name);

    const importance =
      Number(requiredSkill.importance) || 1;

    totalImportance += importance;

    if (candidateSkills.has(skillName)) {
      // User.js doesn't store proficiency scores.
      // For MVP, skill presence = score 10/10.
      const candidateScore = 10;

      matchedImportance += importance;

      matchedSkills.push({
        name: skillName,
        score: candidateScore,
        importance
      });
    } else {
      missingSkills.push(skillName);
    }
  }

  let matchScore = 0;

  if (totalImportance > 0) {
    matchScore =
      (matchedImportance / totalImportance) * 100;
  }

  return {
    score: Number(matchScore.toFixed(2)),
    matchedSkills,
    missingSkills
  };
}

// --------------------------------------------------
// 5. GITHUB EVIDENCE SCORE
// --------------------------------------------------

function calculateEvidenceScore(
  github = {},
  requiredSkills = []
) {
  if (
    !github ||
    !Array.isArray(github.repositories)
  ) {
    return 0;
  }

  const repositories = github.repositories;

  if (repositories.length === 0) {
    return 0;
  }

  // Normalize all required project skills
  const normalizedRequiredSkills =
    requiredSkills
      .map((skill) => {
        if (!skill || !skill.name) {
          return "";
        }

        return normalizeSkill(skill.name);
      })
      .filter(Boolean);

  let relevantRepositories = 0;

  let totalStars = 0;

  let totalCommits = 0;

  for (const repository of repositories) {
    if (!repository) {
      continue;
    }

    // ------------------------------------------
    // Repository skills
    // ------------------------------------------

    const repositorySkills = [];

    if (repository.language) {
      repositorySkills.push(
        normalizeSkill(repository.language)
      );
    }

    if (Array.isArray(repository.topics)) {
      for (const topic of repository.topics) {
        if (!topic) {
          continue;
        }

        repositorySkills.push(
          normalizeSkill(topic)
        );
      }
    }

    // ------------------------------------------
    // Check project relevance
    // ------------------------------------------

    const isRelevant =
      normalizedRequiredSkills.some(
        (requiredSkill) =>
          repositorySkills.includes(requiredSkill)
      );

    if (isRelevant) {
      relevantRepositories++;
    }

    // ------------------------------------------
    // GitHub activity
    // ------------------------------------------

    totalStars +=
      Number(repository.stars) || 0;

    totalCommits +=
      Number(repository.commits) || 0;
  }

  // ------------------------------------------
  // Repository score
  // Maximum: 30
  // ------------------------------------------

  const repositoryScore =
    Math.min(
      repositories.length * 3,
      30
    );

  // ------------------------------------------
  // Relevant repository score
  // Maximum: 40
  // ------------------------------------------

  const relevantRepositoryScore =
    Math.min(
      relevantRepositories * 8,
      40
    );

  // ------------------------------------------
  // Commit activity score
  // Maximum: 20
  // ------------------------------------------

  const commitScore =
    Math.min(
      totalCommits / 5,
      20
    );

  // ------------------------------------------
  // Stars score
  // Maximum: 10
  // ------------------------------------------

  const starScore =
    Math.min(
      totalStars,
      10
    );

  // ------------------------------------------
  // Final GitHub evidence
  // Maximum: 100
  // ------------------------------------------

  const evidenceScore =
    repositoryScore +
    relevantRepositoryScore +
    commitScore +
    starScore;

  return Number(
    Math.min(evidenceScore, 100).toFixed(2)
  );
}


// --------------------------------------------------
// 6. PROJECT RELEVANCE
// --------------------------------------------------

function calculateProjectRelevance(
  candidate,
  requiredSkills = []
) {
  if (
    !candidate ||
    !candidate.github ||
    !Array.isArray(candidate.github.repositories)
  ) {
    return 0;
  }

  const repositories =
    candidate.github.repositories;

  if (repositories.length === 0) {
    return 0;
  }

  const normalizedRequiredSkills =
    requiredSkills
      .map((skill) => {
        if (!skill || !skill.name) {
          return "";
        }

        return normalizeSkill(skill.name);
      })
      .filter(Boolean);

  let relevantRepositories = 0;

  for (const repository of repositories) {
    if (!repository) {
      continue;
    }

    const repositorySkills = [];

    // Repository programming language
    if (repository.language) {
      repositorySkills.push(
        normalizeSkill(repository.language)
      );
    }

    // Repository topics
    if (Array.isArray(repository.topics)) {
      for (const topic of repository.topics) {
        if (!topic) {
          continue;
        }

        repositorySkills.push(
          normalizeSkill(topic)
        );
      }
    }

    const isRelevant =
      normalizedRequiredSkills.some(
        (requiredSkill) =>
          repositorySkills.includes(requiredSkill)
      );

    if (isRelevant) {
      relevantRepositories++;
    }
  }

  if (relevantRepositories === 0) {
    return 0;
  }

  // Each relevant repository contributes 25 points.
  // Maximum = 100.
  const relevanceScore =
    Math.min(
      relevantRepositories * 25,
      100
    );

  return Number(
    relevanceScore.toFixed(2)
  );
}


// --------------------------------------------------
// 7. FINAL MATCH SCORE
// --------------------------------------------------

function calculateFinalMatch(
  skillMatch,
  githubEvidence,
  projectRelevance
) {
  const finalScore =
    skillMatch * 0.70 +
    githubEvidence * 0.20 +
    projectRelevance * 0.10;

  return Number(finalScore.toFixed(2));
}


// --------------------------------------------------
// 8. GENERATE REASONS
// --------------------------------------------------

function generateReasons({
  matchedSkills = [],
  githubEvidence = 0,
  projectRelevance = 0,
  github = {},
}) {
  const reasons = [];

  // ------------------------------------------
  // Skill matching
  // ------------------------------------------

  if (matchedSkills.length > 0) {
    const skillNames = matchedSkills.map(
      (skill) => skill.name
    );

    reasons.push(
      `Matches required skills: ${skillNames.join(", ")}.`
    );
  }

  // ------------------------------------------
  // GitHub evidence
  // ------------------------------------------

  if (githubEvidence > 0) {
    const repositories =
      Array.isArray(github.repositories)
        ? github.repositories
        : [];

    const repositoryCount =
      repositories.length;

    if (repositoryCount > 0) {
      reasons.push(
        `Has ${repositoryCount} GitHub ${
          repositoryCount === 1
            ? "repository"
            : "repositories"
        } providing development evidence.`
      );
    } else {
      reasons.push(
        "GitHub activity provides supporting evidence of development experience."
      );
    }
  }

  // ------------------------------------------
  // Project relevance
  // ------------------------------------------

  if (projectRelevance > 0) {
    reasons.push(
      `Previous GitHub projects show relevance to the current project.`
    );
  }

  // ------------------------------------------
  // No strong match
  // ------------------------------------------

  if (reasons.length === 0) {
    reasons.push(
      "No strong matching evidence was found."
    );
  }

  return reasons;
}


// --------------------------------------------------
// 9. RANK CANDIDATES
// --------------------------------------------------

function rankCandidates(candidates = []) {
  return [...candidates].sort(
    (a, b) => b.finalScore - a.finalScore
  );
}


// --------------------------------------------------
// EXPORTS
// --------------------------------------------------

module.exports = {
  normalizeSkill,
  aggregateTeamSkills,
  calculateSkillGaps,
  calculateCandidateMatch,
  calculateEvidenceScore,
  calculateProjectRelevance,
  calculateFinalMatch,
  generateReasons,
  rankCandidates,
};