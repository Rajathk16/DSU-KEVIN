// src/services/githubEvidence.service.js

/**
 * Categorize a file by its extension or path
 */
function classifyFileType(filename = '') {
  if (!filename || typeof filename !== 'string') {
    return 'other';
  }

  const lower = filename.toLowerCase();

  // Documentation / Cosmetic files
  if (
    lower.endsWith('.md') ||
    lower.endsWith('.txt') ||
    lower.endsWith('.rst') ||
    lower.includes('license') ||
    lower.includes('readme') ||
    lower.includes('contributing') ||
    lower.includes('changelog') ||
    lower.startsWith('docs/') ||
    lower.includes('/docs/')
  ) {
    return 'doc';
  }

  // Configuration / Environment / Build files
  if (
    lower.endsWith('.json') ||
    lower.endsWith('.yaml') ||
    lower.endsWith('.yml') ||
    lower.endsWith('.toml') ||
    lower.endsWith('.xml') ||
    lower.endsWith('.ini') ||
    lower.endsWith('.lock') ||
    lower.endsWith('.env') ||
    lower.endsWith('.env.example') ||
    lower.includes('.gitignore') ||
    lower.includes('.dockerignore') ||
    lower.endsWith('dockerfile') ||
    lower.endsWith('makefile')
  ) {
    return 'config';
  }

  // Assets & Styling
  if (
    lower.endsWith('.png') ||
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    lower.endsWith('.gif') ||
    lower.endsWith('.svg') ||
    lower.endsWith('.ico') ||
    lower.endsWith('.css') ||
    lower.endsWith('.scss') ||
    lower.endsWith('.sass') ||
    lower.endsWith('.less') ||
    lower.endsWith('.woff') ||
    lower.endsWith('.ttf')
  ) {
    return 'asset';
  }

  // Core Code Files
  if (
    lower.endsWith('.py') ||
    lower.endsWith('.ipynb') ||
    lower.endsWith('.js') ||
    lower.endsWith('.jsx') ||
    lower.endsWith('.ts') ||
    lower.endsWith('.tsx') ||
    lower.endsWith('.java') ||
    lower.endsWith('.cpp') ||
    lower.endsWith('.c') ||
    lower.endsWith('.h') ||
    lower.endsWith('.cs') ||
    lower.endsWith('.go') ||
    lower.endsWith('.rs') ||
    lower.endsWith('.rb') ||
    lower.endsWith('.php') ||
    lower.endsWith('.swift') ||
    lower.endsWith('.kt') ||
    lower.endsWith('.scala') ||
    lower.endsWith('.r') ||
    lower.endsWith('.sql') ||
    lower.endsWith('.sh') ||
    lower.endsWith('.html')
  ) {
    return 'code';
  }

  return 'other';
}

/**
 * Extract distinct module or directory names touched by the user
 */
function extractModuleNames(fileList = []) {
  const modules = new Set();

  for (const file of fileList) {
    if (!file) continue;
    const parts = file.split('/').filter(Boolean);
    if (parts.length > 1) {
      modules.add(parts[0]);
      if (parts.length > 2 && ['src', 'lib', 'app', 'packages'].includes(parts[0])) {
        modules.add(`${parts[0]}/${parts[1]}`);
      }
    } else {
      const base = parts[0].replace(/\.[^.]+$/, '');
      if (base) modules.add(base);
    }
  }

  return Array.from(modules);
}

/**
 * Analyze contribution depth: code vs docs vs config breakdown
 * Catches the Cosmetic / README Loophole!
 */
function analyzeContributionDepth(filesModified = []) {
  if (!Array.isArray(filesModified) || filesModified.length === 0) {
    return {
      totalFiles: 0,
      codeFiles: 0,
      docFiles: 0,
      configFiles: 0,
      assetFiles: 0,
      codeRatio: 0,
      docRatio: 0,
      modulesContributed: [],
      isCosmeticOnly: false,
      breakdownSummary: 'No file modification data available.'
    };
  }

  let codeFiles = 0;
  let docFiles = 0;
  let configFiles = 0;
  let assetFiles = 0;
  const fileNames = [];

  for (const item of filesModified) {
    const filename = typeof item === 'string' ? item : (item.filename || item.name || '');
    fileNames.push(filename);
    const type = classifyFileType(filename);

    if (type === 'code') codeFiles++;
    else if (type === 'doc') docFiles++;
    else if (type === 'config') configFiles++;
    else if (type === 'asset') assetFiles++;
  }

  const totalFiles = filesModified.length;
  const codeRatio = totalFiles > 0 ? Number(((codeFiles / totalFiles) * 100).toFixed(1)) : 0;
  const docRatio = totalFiles > 0 ? Number(((docFiles / totalFiles) * 100).toFixed(1)) : 0;
  const modulesContributed = extractModuleNames(fileNames);

  // Cosmetic loophole detected if changes are overwhelmingly docs/assets/config and zero or tiny code
  const isCosmeticOnly = (docRatio >= 75 && codeRatio <= 15) || (codeFiles === 0 && totalFiles > 0);

  let breakdownSummary = '';
  if (isCosmeticOnly) {
    breakdownSummary = `Cosmetic contributor: ${docFiles} doc/config files touched (${docRatio}%), only ${codeFiles} code files.`;
  } else {
    breakdownSummary = `Active code contributor: ${codeFiles} code files (${codeRatio}%), ${docFiles} docs, touching modules: ${modulesContributed.slice(0, 4).join(', ') || 'root'}.`;
  }

  return {
    totalFiles,
    codeFiles,
    docFiles,
    configFiles,
    assetFiles,
    codeRatio,
    docRatio,
    modulesContributed,
    isCosmeticOnly,
    breakdownSummary
  };
}

/**
 * Detect single-commit dumps vs iterative development over time
 */
function analyzeCommitTiming(commits = [], createdAt = null) {
  if (!Array.isArray(commits) || commits.length === 0) {
    return {
      commitCount: 0,
      activeDurationDays: 0,
      activeDurationMonths: 0,
      isSingleCommitDump: false,
      timingSummary: 'No commit timing data.'
    };
  }

  const commitCount = commits.length;
  const dates = commits
    .map(c => {
      const dateStr = c.commit?.author?.date || c.commit?.committer?.date || c.date;
      return dateStr ? new Date(dateStr).getTime() : null;
    })
    .filter(Boolean)
    .sort((a, b) => a - b);

  if (dates.length <= 1) {
    return {
      commitCount,
      activeDurationDays: 0,
      activeDurationMonths: 0,
      isSingleCommitDump: true,
      timingSummary: 'Single commit dump detected. No iterative commit history.'
    };
  }

  const firstDate = dates[0];
  const lastDate = dates[dates.length - 1];
  const diffMs = Math.max(0, lastDate - firstDate);
  const activeDurationDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
  const activeDurationMonths = Number((activeDurationDays / 30.4).toFixed(1));

  // If commits occurred within 3 hours and commit count is very small, flag as dump
  const isSingleCommitDump = commitCount <= 1 || (diffMs < 3 * 60 * 60 * 1000 && commitCount < 3);

  const timingSummary = isSingleCommitDump
    ? `Dumping pattern: all activity occurred in less than 3 hours.`
    : `Consistent development: active across ${activeDurationDays} days (~${activeDurationMonths} months) with ${commitCount} commits.`;

  return {
    commitCount,
    activeDurationDays,
    activeDurationMonths,
    isSingleCommitDump,
    timingSummary
  };
}

/**
 * Multi-dimensional Evidence Confidence Score Calculator
 *
 * Combines 5 dimensions:
 * 1. Contribution History (30%)
 * 2. Repository Originality / Fork Status (20%)
 * 3. Relevant Code Depth (20%)
 * 4. Consistency Over Time (15%)
 * 5. Repository / Language Relevance (15%)
 */
function calculateRepositoryEvidenceConfidence({
  isFork = false,
  parentRepo = null,
  userCommits = 0,
  totalCommits = 0,
  contributionPercentage = null,
  codeRatio = 0,
  docRatio = 0,
  isCosmeticOnly = false,
  isSingleCommitDump = false,
  activeDurationMonths = 0,
  relevanceScore = 50
}) {
  // 1. Calculate personal contribution percentage
  let personalContribution = 100;
  if (totalCommits > 0) {
    personalContribution = Math.min(100, (userCommits / totalCommits) * 100);
  } else if (contributionPercentage !== null && contributionPercentage !== undefined) {
    personalContribution = Number(contributionPercentage);
  } else if (isFork) {
    // If it's a fork and we have no commit stats, default to low contribution
    personalContribution = 10;
  }

  // ----------------------------------------------------
  // Dimension 1: Contribution History (30% Weight)
  // ----------------------------------------------------
  let contributionScore = 0;
  if (personalContribution >= 75) {
    contributionScore = Math.min(100, 75 + Math.min(25, userCommits * 0.5));
  } else if (personalContribution >= 40) {
    contributionScore = 50 + (personalContribution - 40);
  } else if (personalContribution >= 15) {
    contributionScore = 25 + (personalContribution - 15);
  } else {
    // Very low contribution (<15%) (Loophole 1!)
    contributionScore = Math.max(5, personalContribution);
  }

  // ----------------------------------------------------
  // Dimension 2: Repository Originality (20% Weight)
  // ----------------------------------------------------
  let originalityScore = 100;
  if (isFork) {
    if (personalContribution >= 70) {
      originalityScore = 70; // Significant personal work on a fork
    } else if (personalContribution >= 30) {
      originalityScore = 40; // Moderate contribution on a fork
    } else {
      originalityScore = 15; // Low contribution fork (Loophole 1 penalty)
    }
  }

  // ----------------------------------------------------
  // Dimension 3: Relevant Code Depth (20% Weight)
  // Catches Loophole 2 (README / Cosmetic commits)
  // ----------------------------------------------------
  let codeDepthScore = 0;
  if (isCosmeticOnly || codeRatio < 10) {
    // Severe penalty for README / cosmetic only edits!
    codeDepthScore = 10;
  } else if (codeRatio >= 70) {
    codeDepthScore = 100;
  } else if (codeRatio >= 40) {
    codeDepthScore = 70;
  } else {
    codeDepthScore = 35;
  }

  // ----------------------------------------------------
  // Dimension 4: Consistency Over Time (15% Weight)
  // ----------------------------------------------------
  let consistencyScore = 0;
  if (isSingleCommitDump) {
    consistencyScore = 15;
  } else if (activeDurationMonths >= 3 && userCommits >= 5) {
    consistencyScore = 100;
  } else if (activeDurationMonths >= 1 && userCommits >= 3) {
    consistencyScore = 75;
  } else if (userCommits >= 3) {
    consistencyScore = 50;
  } else {
    consistencyScore = 30;
  }

  // ----------------------------------------------------
  // Dimension 5: Relevance (15% Weight)
  // ----------------------------------------------------
  const normRelevance = Math.min(100, Math.max(0, relevanceScore));

  // ----------------------------------------------------
  // Final Weighted Multi-Dimensional Confidence
  // ----------------------------------------------------
  const weightedConfidence =
    contributionScore * 0.30 +
    originalityScore * 0.20 +
    codeDepthScore * 0.20 +
    consistencyScore * 0.15 +
    normRelevance * 0.15;

  const confidenceScore = Number(Math.min(100, Math.max(0, weightedConfidence)).toFixed(1));

  // Determine Evidence Level Tier
  let evidenceLevel = 'weak';
  let evidenceBadge = '🔴 Weak Evidence';

  if (confidenceScore >= 70) {
    evidenceLevel = 'strong';
    evidenceBadge = '🟢 Strong Evidence';
  } else if (confidenceScore >= 40) {
    evidenceLevel = 'moderate';
    evidenceBadge = '🟡 Moderate Evidence';
  }

  return {
    confidenceScore,
    evidenceLevel,
    evidenceBadge,
    metrics: {
      contributionScore: Number(contributionScore.toFixed(1)),
      originalityScore: Number(originalityScore.toFixed(1)),
      codeDepthScore: Number(codeDepthScore.toFixed(1)),
      consistencyScore: Number(consistencyScore.toFixed(1)),
      relevanceScore: Number(normRelevance.toFixed(1)),
      personalContribution: Number(personalContribution.toFixed(1))
    }
  };
}

/**
 * Generate clear explanation for human review & UI demo
 */
function generateEvidenceExplanation({
  repoName = '',
  isFork = false,
  parentRepo = null,
  personalContribution = 100,
  userCommits = 0,
  codeRatio = 0,
  isCosmeticOnly = false,
  isSingleCommitDump = false,
  evidenceLevel = 'moderate',
  confidenceScore = 50,
  modulesContributed = []
}) {
  const parts = [];

  if (isFork) {
    if (personalContribution < 15) {
      parts.push(`Fork of ${parentRepo || 'upstream project'} with minimal personal contribution (${personalContribution}%).`);
    } else {
      parts.push(`Fork of ${parentRepo || 'upstream project'}, verified ${personalContribution}% personal contribution.`);
    }
  } else {
    parts.push(`Original repository with direct authorship (${personalContribution}% personal contribution).`);
  }

  if (isCosmeticOnly) {
    parts.push(`⚠️ Low code depth: commits primarily affect documentation / README rather than core technical logic.`);
  } else if (codeRatio >= 60) {
    parts.push(`High code density (${codeRatio}% code files) across modules: ${modulesContributed.slice(0, 3).join(', ') || 'root'}.`);
  }

  if (isSingleCommitDump) {
    parts.push(`⚠️ Single-commit repository dump with limited iterative history.`);
  } else if (userCommits > 10) {
    parts.push(`Substantial development history with ${userCommits} commits.`);
  }

  return parts.join(' ');
}

module.exports = {
  classifyFileType,
  extractModuleNames,
  analyzeContributionDepth,
  analyzeCommitTiming,
  calculateRepositoryEvidenceConfidence,
  generateEvidenceExplanation
};