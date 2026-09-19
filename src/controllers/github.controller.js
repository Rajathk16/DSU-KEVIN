// src/controllers/github.controller.js

const User = require('../models/User');
const githubService = require('../services/github.service');
const { verifySkillsFromContributions } = require('../services/ai.service');

const syncGithub = async (req, res) => {
  try {
    const userId = req.user ? req.user.id || req.user._id : req.body.userId;
    let githubUsername = req.body.githubUsername;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { message: "Unauthorized or missing userId" }
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: "User not found" }
      });
    }

    githubUsername = githubUsername || (user.github && user.github.username) || user.githubUsername;
    if (!githubUsername) {
      return res.status(400).json({
        success: false,
        error: { message: "GitHub username is required" }
      });
    }

    const accessToken = req.body.accessToken || process.env.GITHUB_TOKEN; // Fallback to bot token if no user token
    
    // 1. Fetch repositories
    const repos = await githubService.getRepositories(githubUsername, accessToken);
    const analyzedRepositories = [];
    const allVerifiedSkills = [];
    const skillNameSet = new Set(user.skills || []);

    // Analyze up to 10 most recent repos to preserve rate limits
    const reposToAnalyze = repos.slice(0, 10);

    const analysisPromises = reposToAnalyze.map(async (repo) => {
      // 2. Multi-dimensional Authenticity & Depth Analysis
      const repoAnalysis = await githubService.analyzeRepositoryFull(
        repo.owner ? repo.owner.login : githubUsername,
        repo.name,
        githubUsername
      );

      // 3. Gemini Code-Level Skill Verification
      const aiVerification = await verifySkillsFromContributions({
        repositoryName: repo.name,
        languages: repoAnalysis.languages,
        topics: repoAnalysis.topics,
        isFork: repoAnalysis.isFork,
        parentRepo: repoAnalysis.parentRepo,
        userCommits: repoAnalysis.userCommits,
        personalContribution: repoAnalysis.contributionPercentage,
        codeRatio: repoAnalysis.codeRatio,
        docRatio: repoAnalysis.docRatio,
        isCosmeticOnly: repoAnalysis.codeRatio < 15,
        modulesContributed: repoAnalysis.modulesContributed
      });

      const repoVerifiedSkills = aiVerification.verifiedSkills || [];
      repoAnalysis.verifiedSkills = repoVerifiedSkills;

      return { repoAnalysis, repoVerifiedSkills };
    });

    const results = await Promise.all(analysisPromises);

    for (const result of results) {
      // Add to overall verified skills
      for (const skill of result.repoVerifiedSkills) {
        allVerifiedSkills.push(skill);
        skillNameSet.add(skill.name);
      }
      analyzedRepositories.push(result.repoAnalysis);
    }

    // 4. Calculate Overall Evidence Profile Metrics
    let overallConfidenceScore = 50;
    let overallEvidenceLevel = "moderate";

    if (analyzedRepositories.length > 0) {
      const totalScore = analyzedRepositories.reduce(
        (sum, r) => sum + (r.confidenceScore || 50),
        0
      );
      overallConfidenceScore = Number((totalScore / analyzedRepositories.length).toFixed(1));

      if (overallConfidenceScore >= 70) {
        overallEvidenceLevel = "strong";
      } else if (overallConfidenceScore < 40) {
        overallEvidenceLevel = "weak";
      }
    }

    // 5. Update User Record in MongoDB
    user.github = {
      username: githubUsername,
      profileUrl: `https://github.com/${githubUsername}`,
      syncedAt: new Date(),
      overallConfidenceScore,
      overallEvidenceLevel,
      repositories: analyzedRepositories
    };
    user.githubConnected = true;
    user.skills = Array.from(skillNameSet);
    user.verifiedSkills = allVerifiedSkills;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "GitHub profile synchronized and multi-dimensionally verified.",
      data: {
        username: githubUsername,
        repositoriesAnalyzed: analyzedRepositories.length,
        overallEvidenceConfidence: overallConfidenceScore,
        overallEvidenceLevel,
        verifiedSkills: allVerifiedSkills,
        repositories: analyzedRepositories.map(r => ({
          repository: r.repository,
          isFork: r.isFork,
          parentRepo: r.parentRepo,
          contributionPercentage: r.contributionPercentage,
          codeRatio: r.codeRatio,
          docRatio: r.docRatio,
          evidenceBadge: r.evidenceBadge,
          confidenceScore: r.confidenceScore,
          explanation: r.explanation
        }))
      }
    });

  } catch (error) {
    console.error("GitHub Sync Error:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to sync GitHub profile: " + error.message }
    });
  }
};

const githubOAuth = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, error: { message: "Authorization code is required" } });
    }

    const accessToken = await githubService.exchangeCodeForToken(code);
    const githubProfile = await githubService.getAuthenticatedUser(accessToken);

    // Pass the username and token to the sync logic
    req.body.githubUsername = githubProfile.login;
    req.body.accessToken = accessToken;
    
    // Trigger existing sync logic
    return await syncGithub(req, res);
  } catch (error) {
    console.error("OAuth Error:", error);
    return res.status(500).json({ success: false, error: { message: "OAuth flow failed" } });
  }
};

const syncManual = async (req, res, next) => {
  try {
    const { githubUsername } = req.body;
    if (!githubUsername) {
      return res.status(400).json({ success: false, error: { message: "GitHub username is required" } });
    }
    
    // Pass the username to the sync logic
    req.body.githubUsername = githubUsername;
    // We don't have an access token, so syncGithub will fallback to process.env.GITHUB_TOKEN
    
    // Trigger existing sync logic
    return await syncGithub(req, res);
  } catch (error) {
    next(error);
  }
};

const disconnectGithub = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, error: { message: "User not found" } });
    }

    user.github = {
      username: null,
      profileUrl: null,
      syncedAt: null,
      overallConfidenceScore: null,
      overallEvidenceLevel: null,
      repositories: []
    };
    user.githubConnected = false;
    user.verifiedSkills = [];
    
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: "GitHub profile disconnected successfully"
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  syncGithub,
  githubOAuth,
  syncManual,
  disconnectGithub
};