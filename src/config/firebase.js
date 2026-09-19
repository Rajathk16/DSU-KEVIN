const admin = require("firebase-admin");

// Initialize Firebase Admin just for token verification
// This doesn't require a service account key if we only use it for verifyIdToken
admin.initializeApp({
  projectId: "kevin-37b3b"
});

module.exports = admin;