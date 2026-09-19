// src/services/matching.service.js

const {
  classifyFileType,
  calculateRepositoryEvidenceConfidence,
  analyzeContributionDepth
} = require("./githubEvidence.service");

// --------------------------------------------------
// 1. NORMALIZE SKILL
// --------------------------------------------------

function normalizeSkill(skill) {
  if (!skill) {
    return "";
  }

  const rawSkill = typeof skill === "string" ? skill : (skill.name || "");
  if (!rawSkill || typeof rawSkill !== "string") {
    return "";
  }

  let normalized = rawSkill
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

  const aliases = {
    // Python
    "python3": "python", "python2": "python",
    "python programming": "python", "python development": "python",
    // JavaScript
    "javascript programming": "javascript", "js": "javascript",
    // React
    "react.js": "react", "reactjs": "react", "react js": "react",
    "react development": "react", "next.js / react": "react",
    "react / next.js": "react", "javascript / frontend architecture": "react",
    "frontend dashboard & feedback interfaces": "react",
    // Node.js
    "nodejs": "node.js", "node js": "node.js", "node development": "node.js",
    "typescript / node.js": "node.js", "typescript / node.js (n8n stack)": "node.js",
    "backend web development": "node.js",
    // Machine Learning
    "ml": "machine learning", "machine-learning": "machine learning",
    "machine learning programming": "machine learning",
    // AI
    "ai": "artificial intelligence",
    // Computer Vision
    "cv": "computer vision",
    "computer vision and deep learning": "computer vision",
    "computer vision & deep learning": "computer vision",
    "image processing": "computer vision",
    // Deep Learning
    "deep learning (pytorch/tensorflow)": "deep learning",
    "convolutional neural networks": "deep learning", "cnns": "deep learning",
    // MongoDB
    "mongo": "mongodb",
    // Express
    "express.js": "express", "expressjs": "express",
    // Next.js
    "nextjs": "next.js", "next js": "next.js",
    // GIS
    "gis": "geospatial data analysis",
    "geospatial data analysis (gis)": "geospatial data analysis",
    "geospatial data processing (gis)": "geospatial data analysis",
    // Full Stack
    "full stack development": "full-stack development",
    "full stack web development": "full-stack development",
    "full-stack web development": "full-stack development",
    "full-stack web development": "full-stack development",
    "web application development": "full-stack development",
    "full-stack web/mobile development": "full-stack development",
    // Cloud
    "cloud infrastructure": "cloud computing",
    "cloud deployment & mlops": "cloud deployment",
    "cloud deployment and mlops": "cloud deployment",
    // MLOps
    "ml ops": "mlops", "ml-ops": "mlops",
    // AWS
    "amazon web services": "aws",
    // Docker
    "docker containerization": "docker",
    // API & Backend
    "api development": "node.js",
    "api development & integration": "node.js",
    "backend api development": "node.js",
    "mvc architecture & api design": "node.js",
    "user authentication & session handling": "node.js",
    "authentication flow implementation": "node.js",
    // Software / General
    "software development": "full-stack development",
    "algorithms & data structures": "computer science",
    "array search logic": "computer science",
    "workflow automation development": "automation",
    "git repository management": "git",
    "git & github forking": "git"
  };

  if (aliases[normalized]) {
    return aliases[normalized];
  }

  // --- Substring cleanup for AI-generated compound skill strings ---
  // e.g. "Next.js / React" → try extracting after " / " or " & " separators
  const separators = [' / ', ' & ', ' + ', ' and ', ' with ', ' ('];
  for (const sep of separators) {
    if (normalized.includes(sep)) {
      // Check each part after splitting
      const parts = normalized.split(sep).map(p => p.replace(/[()]/g, '').trim());
      for (const part of parts) {
        if (aliases[part]) return aliases[part];
      }
      // Return the first meaningful part (before the separator)
      return parts[0] || normalized;
    }
  }

  return normalized;
}

// --------------------------------------------------
// 2. AGGREGATE TEAM SKILLS
// --------------------------------------------------

function aggregateTeamSkills(teamMembers = []) {
  const teamSkills = {};

  for (const member of teamMembers) {
    if (!member) continue;

    // Support member.skills, member.user.skills, and member.user.verifiedSkills
    const user = member.user || member;
    const skillsList = Array.isArray(user.skills) ? user.skills : [];

    for (const item of skillsList) {
      if (!item) continue;
      const skillName = typeof item === "string" ? item : (item.name || "");
      const normalizedName = normalizeSkill(skillName);

      if (!normalizedName) continue;

      const score = typeof item === "object" && item.score !== undefined
        ? Number(item.score)
        : 10;

      if (!teamSkills[normalizedName] || score > teamSkills[normalizedName]) {
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
    if (!required || !required.name) continue;

    const skillName = normalizeSkill(required.name);
    if (!skillName) continue;

    const importance = Number(required.importance) || 1;
    const teamScore = teamSkills[skillName] || 0;

    // If team doesn't have the skill or has low coverage, consider it a gap
    if (teamScore === 0) {
      skillGaps.push({
        name: skillName,
        importance,
        reason: required.reason || ""
      });
    }
  }

  return skillGaps;
}

// --------------------------------------------------
// 4. CALCULATE CANDIDATE MATCH (WITH EVIDENCE INTEGRATION)
// --------------------------------------------------

/**
 * Calculates candidate match against skill gaps.
 * Incorporates evidence confidence from verifiedSkills or GitHub repositories:
 * Candidate with genuine ML contributions gets full score (10/10).
 * Candidate with forked/cosmetic ML repository gets penalized (4/10).
 */
function calculateCandidateMatch(candidate, skillGaps = []) {
  if (!candidate || !Array.isArray(candidate.skills)) {
    return {
      score: 0,
      matchedSkills: [],
      missingSkills: skillGaps.map((skill) => skill.name)
    };
  }

  let totalImportance = 0;
  let matchedImportance = 0;

  const matchedSkills = [];
  const missingSkills = [];

  // Build candidate skill map with normalized names and confidence
  // Check candidate.verifiedSkills or candidate.skills
  const candidateSkillMap = new Map(); // normalizedName -> { score, confidence, evidenceLevel }

  // 1. Process candidate.skills
  for (const skill of candidate.skills) {
    if (!skill) continue;
    const rawName = typeof skill === "string" ? skill : (skill.name || "");
    const normalizedName = normalizeSkill(rawName);
    if (!normalizedName) continue;

    const baseScore = (typeof skill === "object" && skill.score !== undefined)
      ? Number(skill.score)
      : 2; // Penalize self-reported skills with no evidence

    candidateSkillMap.set(normalizedName, {
      score: baseScore,
      confidence: 10,
      evidenceLevel: "none",
      source: "self"
    });
  }

  // 2. Enrich with candidate.verifiedSkills (if present from GitHub analysis)
  const verifiedList = Array.isArray(candidate.verifiedSkills)
    ? candidate.verifiedSkills
    : [];

  for (const vSkill of verifiedList) {
    if (!vSkill || !vSkill.name) continue;
    const normalizedName = normalizeSkill(vSkill.name);
    if (!normalizedName) continue;

    const confidence = Number(vSkill.confidence) || 50;
    const evidenceLevel = vSkill.evidenceLevel || (confidence >= 70 ? "strong" : (confidence >= 40 ? "moderate" : "weak"));

    // Scale candidate proficiency based on evidence authenticity:
    // Strong evidence: 10/10
    // Moderate evidence: 7.5/10
    // Weak evidence (Fork / README loophole): 3.5/10
    let calibratedScore = 6;
    if (evidenceLevel === "strong") calibratedScore = 10;
    else if (evidenceLevel === "moderate") calibratedScore = 7.5;
    else if (evidenceLevel === "weak") calibratedScore = 3.5;

    candidateSkillMap.set(normalizedName, {
      score: calibratedScore,
      confidence,
      evidenceLevel,
      reason: vSkill.reason || "",
      source: "github-verified"
    });
  }

  // 3. Match against project skill gaps
  for (const requiredSkill of skillGaps) {
    if (!requiredSkill || !requiredSkill.name) continue;

    const skillName = normalizeSkill(requiredSkill.name);
    const importance = Number(requiredSkill.importance) || 1;
    totalImportance += importance;

    // --- Exact match first ---
    let matchData = candidateSkillMap.get(skillName) || null;

    // --- Substring/partial match fallback ---
    // Handles AI-extracted skills like "Next.js / React" matching required "react"
    if (!matchData) {
      for (const [candidateSkill, data] of candidateSkillMap.entries()) {
        if (
          candidateSkill.includes(skillName) ||
          skillName.includes(candidateSkill) ||
          // cross-alias check: see if the candidate skill normalizes to the required skill
          normalizeSkill(candidateSkill) === skillName
        ) {
          matchData = data;
          break;
        }
      }
    }

    if (matchData) {
      const proficiencyRatio = matchData.score / 10;
      matchedImportance += importance * proficiencyRatio;

      matchedSkills.push({
        name: skillName,
        score: matchData.score,
        confidence: matchData.confidence,
        evidenceLevel: matchData.evidenceLevel,
        reason: matchData.reason,
        importance
      });
    } else {
      missingSkills.push(skillName);
    }
  }

  let matchScore = 0;
  if (totalImportance > 0) {
    matchScore = (matchedImportance / totalImportance) * 100;
  }

  return {
    score: Number(matchScore.toFixed(2)),
    matchedSkills,
    missingSkills
  };
}

// --------------------------------------------------
// 5. GITHUB EVIDENCE CONFIDENCE SCORE
// --------------------------------------------------

/**
 * Calculates Multi-dimensional GitHub Evidence Confidence Score
 * Incorporates:
 * 1. Personal Contribution % (catches Loophole 1)
 * 2. Repository Originality / Fork Status (catches Loophole 1)
 * 3. Relevant Code Depth & Code vs Docs Ratio (catches Loophole 2)
 * 4. Active Consistency Over Time (catches dumps)
 * 5. Project Relevance
 */
function calculateEvidenceScore(github = {}, requiredSkills = []) {
  if (!github || !Array.isArray(github.repositories) || github.repositories.length === 0) {
    return 0;
  }

  const repositories = github.repositories;

  // If user already has overallConfidenceScore computed, use it with project relevance calibration
  const normalizedRequiredSkills = requiredSkills
    .map((skill) => normalizeSkill(skill.name || skill))
    .filter(Boolean);

  let totalWeightedConfidence = 0;
  let relevantRepoCount = 0;

  for (const repo of repositories) {
    if (!repo) continue;

    // Collect skills for this repository
    const repoSkills = [];
    if (repo.language) repoSkills.push(normalizeSkill(repo.language));
    if (Array.isArray(repo.languages)) {
      repo.languages.forEach(l => repoSkills.push(normalizeSkill(l)));
    }
    if (Array.isArray(repo.topics)) {
      repo.topics.forEach(t => repoSkills.push(normalizeSkill(t)));
    }

    const isRelevant = normalizedRequiredSkills.some((req) =>
      repoSkills.includes(req)
    );

    if (isRelevant) {
      relevantRepoCount++;
    }

    // If repository already has multi-dimensional confidence computed
    let repoConfidence = repo.confidenceScore;

    if (repoConfidence === undefined || repoConfidence === null) {
      // Compute on the fly if not pre-computed
      const filesModified = repo.filesModified || [];
      const depth = analyzeContributionDepth(filesModified);

      const confidenceResult = calculateRepositoryEvidenceConfidence({
        isFork: Boolean(repo.isFork),
        parentRepo: repo.parentRepo || null,
        userCommits: repo.userCommits || repo.commits || 1,
        totalCommits: repo.totalCommits || (repo.commits ? repo.commits * 2 : 2),
        contributionPercentage: repo.contributionPercentage,
        codeRatio: repo.codeRatio !== undefined ? repo.codeRatio : depth.codeRatio,
        docRatio: repo.docRatio !== undefined ? repo.docRatio : depth.docRatio,
        isCosmeticOnly: repo.isCosmeticOnly !== undefined ? repo.isCosmeticOnly : depth.isCosmeticOnly,
        isSingleCommitDump: Boolean(repo.isSingleCommitDump),
        activeDurationMonths: repo.activeDurationMonths || 1,
        relevanceScore: isRelevant ? 85 : 40
      });

      repoConfidence = confidenceResult.confidenceScore;
    }

    // Weight relevant repositories higher in the overall evidence score
    const repoWeight = isRelevant ? 1.5 : 0.8;
    totalWeightedConfidence += repoConfidence * repoWeight;
  }

  const effectiveDivisor = (relevantRepoCount * 1.5) + ((repositories.length - relevantRepoCount) * 0.8) || 1;
  let overallEvidence = totalWeightedConfidence / effectiveDivisor;

  // Bonus if candidate has multiple relevant repos with active code
  if (relevantRepoCount >= 2) {
    overallEvidence = Math.min(100, overallEvidence + 5);
  }

  return Number(Math.min(100, Math.max(0, overallEvidence)).toFixed(2));
}

// --------------------------------------------------
// 6. PROJECT RELEVANCE
// --------------------------------------------------

function calculateProjectRelevance(candidate, requiredSkills = []) {
  if (
    !candidate ||
    !candidate.github ||
    !Array.isArray(candidate.github.repositories) ||
    candidate.github.repositories.length === 0
  ) {
    return 0;
  }

  const repositories = candidate.github.repositories;
  const normalizedRequiredSkills = requiredSkills
    .map((skill) => normalizeSkill(skill.name || skill))
    .filter(Boolean);

  if (normalizedRequiredSkills.length === 0) {
    return 50;
  }

  let relevantRepositories = 0;
  let highQualityRelevantRepos = 0;

  for (const repository of repositories) {
    if (!repository) continue;

    const repositorySkills = [];
    if (repository.language) repositorySkills.push(normalizeSkill(repository.language));
    if (Array.isArray(repository.languages)) {
      repository.languages.forEach(l => repositorySkills.push(normalizeSkill(l)));
    }
    if (Array.isArray(repository.topics)) {
      for (const topic of repository.topics) {
        if (topic) repositorySkills.push(normalizeSkill(topic));
      }
    }

    const isRelevant = normalizedRequiredSkills.some((req) =>
      repositorySkills.includes(req)
    );

    if (isRelevant) {
      relevantRepositories++;
      // If the relevant repo has genuine code (>50% codeRatio and >30% contribution), it's high quality
      const isGoodCode = (repository.codeRatio === undefined || repository.codeRatio >= 40);
      const isGoodContrib = (repository.contributionPercentage === undefined || repository.contributionPercentage >= 30);
      if (isGoodCode && isGoodContrib) {
        highQualityRelevantRepos++;
      }
    }
  }

  if (relevantRepositories === 0) {
    return 0;
  }

  // Base score: 30 points per relevant repo, extra for verified high quality code
  const relevanceScore = Math.min(
    100,
    (relevantRepositories * 25) + (highQualityRelevantRepos * 15)
  );

  return Number(relevanceScore.toFixed(2));
}

// --------------------------------------------------
// 7. FINAL MATCH SCORE (UPDATED WEIGHTS)
// --------------------------------------------------
// Final Match Score = 60% Skill Match + 25% Evidence Confidence + 15% Project Relevance

function calculateFinalMatch(skillMatch, githubEvidence, projectRelevance) {
  const finalScore =
    skillMatch * 0.60 +
    githubEvidence * 0.25 +
    projectRelevance * 0.15;

  return Number(finalScore.toFixed(2));
}

// --------------------------------------------------
// 8. GENERATE REASONS & EXPLAINABILITY (DEMO READY)
// --------------------------------------------------

function generateReasons({
  matchedSkills = [],
  githubEvidence = 0,
  projectRelevance = 0,
  github = {},
  candidate = {}
}) {
  const reasons = [];
  const candidateName = candidate.name || "This candidate";

  // 1. Evidence Tier
  let evidenceTier = "🔴 Weak Evidence";
  if (githubEvidence >= 70) evidenceTier = "🟢 Strong Evidence";
  else if (githubEvidence >= 40) evidenceTier = "🟡 Moderate Evidence";

  // 2. Matched Skills with Evidence Level
  if (matchedSkills.length > 0) {
    const strongMatches = matchedSkills.filter(s => s.evidenceLevel === "strong").map(s => s.name);
    const moderateMatches = matchedSkills.filter(s => s.evidenceLevel === "moderate").map(s => s.name);
    const weakMatches = matchedSkills.filter(s => s.evidenceLevel === "weak").map(s => s.name);

    if (strongMatches.length > 0) {
      reasons.push(`✅ Strong GitHub-verified skills: ${strongMatches.join(", ")} — code-level evidence confirmed.`);
    }
    if (moderateMatches.length > 0) {
      reasons.push(`🟡 Moderate evidence for: ${moderateMatches.join(", ")} — some code contributions detected.`);
    }
    if (weakMatches.length > 0) {
      reasons.push(`⚠️ Weak evidence for: ${weakMatches.join(", ")} — limited personal code contributions (forked or README-only repos).`);
    }
  } else {
    reasons.push(`No direct skill overlap found between ${candidateName}'s profile and the project's required skills.`);
  }

  // 3. GitHub Repository Analysis
  const repos = Array.isArray(github.repositories) ? github.repositories : [];
  if (repos.length > 0) {
    const originalRepos = repos.filter(r => !r.isFork);
    const forkedRepos = repos.filter(r => r.isFork);
    const cosmeticRepos = repos.filter(r => r.codeRatio !== undefined && r.codeRatio < 15);
    const dumpRepos = repos.filter(r => r.isSingleCommitDump);
    const totalUserCommits = repos.reduce((acc, r) => acc + (r.userCommits || 0), 0);
    const avgContrib = repos.length > 0
      ? Math.round(repos.reduce((acc, r) => acc + (r.contributionPercentage !== undefined ? r.contributionPercentage : 100), 0) / repos.length)
      : 0;

    // Repo overview
    reasons.push(
      `${evidenceTier}: ${repos.length} repos analyzed — ${originalRepos.length} original, ${forkedRepos.length} forked. ` +
      `Avg personal contribution: ${avgContrib}%. Total commits authored: ${totalUserCommits}.`
    );

    // Top original repos with high code density
    const highQualityRepos = originalRepos
      .filter(r => (r.codeRatio || 0) >= 40 && (r.userCommits || 0) >= 3)
      .slice(0, 2);
    if (highQualityRepos.length > 0) {
      const repoNames = highQualityRepos.map(r => `${r.repository} (${r.codeRatio}% code)`).join(", ");
      reasons.push(`💻 High-quality code contributions in: ${repoNames}.`);
    }

    // Fork penalty
    if (forkedRepos.length > 0) {
      const lowForks = forkedRepos.filter(r => (r.contributionPercentage || 0) < 20);
      if (lowForks.length > 0) {
        const forkNames = lowForks.map(r => r.repository).join(", ");
        reasons.push(`⚠️ Score reduced: ${lowForks.length} forked repo(s) with <20% personal contribution (${forkNames}) — upstream work excluded from scoring.`);
      }
    }

    // Cosmetic commit warning
    if (cosmeticRepos.length > 0) {
      reasons.push(`⚠️ ${cosmeticRepos.length} repo(s) flagged as low-code-depth (README/config edits only) — these reduce the GitHub Evidence score.`);
    }

    // Single commit dump warning
    if (dumpRepos.length > 0) {
      reasons.push(`⚠️ ${dumpRepos.length} repo(s) flagged as single-commit dump — no iterative development history detected.`);
    }

  } else {
    reasons.push(`No GitHub repositories found for ${candidateName}. GitHub Evidence score is 0% — please sync GitHub profile.`);
  }

  // 4. Why KEVIN matched — final summary
  const strongSkills = matchedSkills.filter(s => s.evidenceLevel === "strong");
  const finalScore = (githubEvidence * 0.25) + (projectRelevance * 0.15);

  if (strongSkills.length > 0) {
    reasons.push(
      `Why KEVIN matched ${candidateName}: Strong verified GitHub evidence in ${strongSkills.map(s => s.name).join(", ")} ` +
      `with genuine code contributions — not just forked or cosmetic commits.`
    );
  } else if (matchedSkills.length > 0 && githubEvidence >= 40) {
    reasons.push(
      `Why KEVIN matched ${candidateName}: Skills match project requirements with moderate GitHub evidence (${Math.round(githubEvidence)}%). ` +
      `Strengthening GitHub contributions would improve ranking.`
    );
  } else if (projectRelevance >= 50) {
    reasons.push(
      `Why KEVIN matched ${candidateName}: GitHub repositories contain languages/technologies relevant to this project, ` +
      `though skill verification confidence is low.`
    );
  } else {
    reasons.push(
      `Why KEVIN ranked ${candidateName} lower: Low skill match + insufficient GitHub evidence. ` +
      `Recommend syncing a more complete GitHub profile with original, code-heavy repositories.`
    );
  }

  return reasons;
}

// --------------------------------------------------
// 9. RANK CANDIDATES
// --------------------------------------------------

function rankCandidates(candidates = []) {
  return [...candidates].sort((a, b) => b.finalScore - a.finalScore);
}

module.exports = {
  normalizeSkill,
  aggregateTeamSkills,
  calculateSkillGaps,
  calculateCandidateMatch,
  calculateEvidenceScore,
  calculateProjectRelevance,
  calculateFinalMatch,
  generateReasons,
  rankCandidates
};