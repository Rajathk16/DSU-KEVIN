const express = require('express');
const router = express.Router();
const { syncGithub, githubOAuth, syncManual, disconnectGithub } = require('../controllers/github.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/sync', protect, syncGithub);
router.post('/oauth', protect, githubOAuth);
router.post('/sync-manual', protect, syncManual);
router.delete('/disconnect', protect, disconnectGithub);

module.exports = router;