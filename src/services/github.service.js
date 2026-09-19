// src/services/github.service.js

const axios = require('axios');
const {
  analyzeContributionDepth,
  analyzeCommitTiming,
  calculateRepositoryEvidenceConfidence,
  generateEvidenceExplanation
} = require('./githubEvidence.service');

class GithubService {
  constructor() {
    const headers = {
      Accept: 'application/vnd.github.v3+json'
    };

    if (
      process.env.GITHUB_TOKEN &&
      process.env.GITHUB_TOKEN !== 'your_github_token'
    ) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    this.api = axios.create({
      baseURL: 'https://api.github.com',
      headers,
      timeout: 10000
    });
  }

  async getUser(username) {
    try {
      const response = await this.api.get(`/users/${username}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${username}:`, error.message);
      throw error;
    }
  }

  async getRepositories(username, accessToken) {
    try {
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
      const response = await this.api.get(
        `/users/${username}/repos?type=all&sort=updated&per_page=30`,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching repos for ${username}:`, error.message);
      throw error;
    }
  }

  async getRepository(owner, repo, accessToken) {
    try {
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
      const response = await this.api.get(`/repos/${owner}/${repo}`, { headers });
      return response.data;
    } catch (error) {
      console.error(`Error fetching repo ${owner}/${repo}:`, error.message);
      return null;
    }
  }

  async getRepositoryLanguages(owner, repo, accessToken) {
    try {
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
      const response = await this.api.get(`/repos/${owner}/${repo}/languages`, { headers });
      return Object.keys(response.data); // Returns array of language names
    } catch (error) {
      console.error(`Error fetching languages for ${owner}/${repo}:`, error.message);
      return [];
    }
  }

  async getRepositoryTopics(owner, repo, accessToken) {
    try {
      const headers = { 'Accept': 'application/vnd.github.mercy-preview+json' };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      const response = await this.api.get(`/repos/${owner}/${repo}/topics`, { headers });
      return response.data.names || [];
    } catch (error) {
      console.error(`Error fetching topics for ${owner}/${repo}:`, error.message);
      return [];
    }
  }

  async exchangeCodeForToken(code) {
    try {
      const response = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code: code
        },
        {
          headers: {
            Accept: 'application/json'
          }
        }
      );
      return response.data.access_token;
    } catch (error) {
      console.error('Error exchanging code for token:', error.message);
      throw error;
    }
  }

  async getAuthenticatedUser(accessToken) {
    try {
      const response = await axios.get('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching authenticated user:', error.message);
      throw error;
    }
  }

  async getUserCommits(owner, repo, username) {
    try {
      const response = await this.api.get(
        `/repos/${owner}/${repo}/commits?author=${username}&per_page=30`
      );
      return response.data || [];
    } catch (error) {
      console.warn(`Could not fetch author commits for ${owner}/${repo} (${username}):`, error.message);
      return [];
    }
  }

  async getCommitDetails(owner, repo, commitSha) {
    try {
      const response = await this.api.get(`/repos/${owner}/${repo}/commits/${commitSha}`);
      return response.data;
    } catch (error) {
      console.warn(`Could not fetch commit details ${commitSha}:`, error.message);
      return null;
    }
  }

  async getRepositoryContributors(owner, repo) {
    try {
      const response = await this.api.get(`/repos/${owner}/${repo}/contributors?per_page=30`);
      return response.data || [];
    } catch (error) {
      console.warn(`Could not fetch contributors for ${owner}/${repo}:`, error.message);
      return [];
    }
  }

  /**
   * Comprehensive repository authenticity and depth analysis
   * Solves both:
   * 1. Fork / Low Contribution Loophole
   * 2. Cosmetic / README Loophole
   */
  async analyzeRepositoryFull(owner, repoName, username) {
    try {
      // 1. Fetch basic repository metadata
      let repoData = await this.getRepository(owner, repoName);
      if (!repoData) {
        repoData = { name: repoName, fork: false, stargazers_count: 0 };
      }

      const isFork = Boolean(repoData.fork);
      const parentRepo = repoData.parent ? repoData.parent.full_name : null;
      const stars = repoData.stargazers_count || 0;
      const htmlUrl = repoData.html_url || `https://github.com/${owner}/${repoName}`;

      // 2. Fetch languages and topics
      const languages = await this.getRepositoryLanguages(owner, repoName);
      const topics = repoData.topics || (await this.getRepositoryTopics(owner, repoName));

      // 3. Fetch user commits and contributors
      const [userCommits, contributors] = await Promise.all([
        this.getUserCommits(owner, repoName, username),
        this.getRepositoryContributors(owner, repoName)
      ]);

      // Calculate personal contribution vs total commits
      let totalRepoCommits = 0;
      let userCommitCount = userCommits.length;
      let personalContribution = 100;

      if (Array.isArray(contributors) && contributors.length > 0) {
        totalRepoCommits = contributors.reduce((acc, c) => acc + (c.contributions || 0), 0);
        const userInContributors = contributors.find(
          c => (c.login || '').toLowerCase() === username.toLowerCase()
        );
        if (userInContributors) {
          userCommitCount = Math.max(userCommitCount, userInContributors.contributions || 0);
        }
      }

      if (totalRepoCommits > 0) {
        personalContribution = Number(((userCommitCount / totalRepoCommits) * 100).toFixed(1));
      } else if (isFork) {
        // Fallback for fork when total commits unavailable
        personalContribution = userCommitCount > 0 ? Math.min(50, userCommitCount * 5) : 5;
      }

      // 4. Inspect modified files in candidate's commits (sample up to 5 commits)
      const touchedFiles = [];
      const commitSample = userCommits.slice(0, 5);

      for (const c of commitSample) {
        if (c.sha) {
          const detail = await this.getCommitDetails(owner, repoName, c.sha);
          if (detail && Array.isArray(detail.files)) {
            for (const f of detail.files) {
              if (f.filename) touchedFiles.push(f.filename);
            }
          }
        }
      }

      // 5. Analyze contribution depth (Code vs Docs/README)
      const depthAnalysis = analyzeContributionDepth(touchedFiles);

      // 6. Analyze commit timing (Dump detection)
      const timingAnalysis = analyzeCommitTiming(userCommits, repoData.created_at);

      // 7. Calculate multi-dimensional confidence score
      const confidenceResult = calculateRepositoryEvidenceConfidence({
        isFork,
        parentRepo,
        userCommits: userCommitCount,
        totalCommits: totalRepoCommits,
        contributionPercentage: personalContribution,
        codeRatio: depthAnalysis.codeRatio,
        docRatio: depthAnalysis.docRatio,
        isCosmeticOnly: depthAnalysis.isCosmeticOnly,
        isSingleCommitDump: timingAnalysis.isSingleCommitDump,
        activeDurationMonths: timingAnalysis.activeDurationMonths,
        relevanceScore: 60 // Baseline until project-matched
      });

      // 8. Generate clear explanation
      const explanation = generateEvidenceExplanation({
        repoName,
        isFork,
        parentRepo,
        personalContribution,
        userCommits: userCommitCount,
        codeRatio: depthAnalysis.codeRatio,
        isCosmeticOnly: depthAnalysis.isCosmeticOnly,
        isSingleCommitDump: timingAnalysis.isSingleCommitDump,
        evidenceLevel: confidenceResult.evidenceLevel,
        confidenceScore: confidenceResult.confidenceScore,
        modulesContributed: depthAnalysis.modulesContributed
      });

      return {
        repository: repoName,
        url: htmlUrl,
        language: languages[0] || repoData.language || '',
        languages,
        topics,
        stars,
        isFork,
        parentRepo,
        userCommits: userCommitCount,
        totalCommits: totalRepoCommits,
        contributionPercentage: personalContribution,
        codeRatio: depthAnalysis.codeRatio,
        docRatio: depthAnalysis.docRatio,
        modulesContributed: depthAnalysis.modulesContributed,
        isSingleCommitDump: timingAnalysis.isSingleCommitDump,
        activeDurationMonths: timingAnalysis.activeDurationMonths,
        confidenceScore: confidenceResult.confidenceScore,
        evidenceLevel: confidenceResult.evidenceLevel,
        evidenceBadge: confidenceResult.evidenceBadge,
        explanation
      };
    } catch (error) {
      console.error(`Error in analyzeRepositoryFull for ${repoName}:`, error.message);
      // Resilient fallback: return basic evidence
      return {
        repository: repoName,
        url: `https://github.com/${owner}/${repoName}`,
        language: '',
        languages: [],
        topics: [],
        stars: 0,
        isFork: false,
        parentRepo: null,
        userCommits: 1,
        totalCommits: 1,
        contributionPercentage: 50,
        codeRatio: 50,
        docRatio: 50,
        modulesContributed: [],
        isSingleCommitDump: false,
        activeDurationMonths: 1,
        confidenceScore: 50,
        evidenceLevel: 'moderate',
        evidenceBadge: '🟡 Moderate Evidence',
        explanation: 'Basic repository evidence (fallback mode).'
      };
    }
  }
}

module.exports = new GithubService();