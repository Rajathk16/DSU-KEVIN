const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const env = require("./config/env");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const teamRoutes = require("./routes/team.routes");
const matchingRoutes = require("./routes/matching.routes");
const githubRoutes = require("./routes/github.routes");
const hackathonRoutes = require("./routes/hackathon.routes");

const {
  notFound,
  errorHandler
} = require("./middleware/error.middleware");

const app = express();

/*
 * Basic Express configuration
 */
app.disable("x-powered-by");

// Security Headers
app.use(helmet());

// CORS should be before rate limiter so blocked requests still get CORS headers
// Allowed origins: localhost for dev + any CLIENT_URL(s) from env (comma-separated)
const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://localhost:5174",
  ...(env.clientUrl
    ? env.clientUrl.split(",").map((u) => u.trim())
    : [])
]);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Render health checks)
      if (!origin) return callback(null, true);

      // Allow any *.vercel.app subdomain (covers Vercel preview deployments too)
      if (
        allowedOrigins.has(origin) ||
        /^https:\/\/[\w-]+(\.vercel\.app)$/.test(origin)
      ) {
        return callback(null, true);
      }

      callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    credentials: true
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, 
  legacyHeaders: false, 
});
app.use(limiter);

app.use(
  express.json({
    limit: "1mb"
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb"
  })
);

/*
 * Health check
 */
app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      service: "KEVIN API",
      status: "healthy",
      environment: env.nodeEnv,
      timestamp: new Date().toISOString()
    }
  });
});

/*
 * API routes
 */
app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/teams", teamRoutes);

app.use("/api/matching", matchingRoutes);

app.use("/api/github", githubRoutes);

app.use("/api/hackathons", hackathonRoutes);

/*
 * 404 handler
 */
app.use(notFound);

/*
 * Global error handler
 */
app.use(errorHandler);

/*
 * Start server only when this file is executed directly.
 */
if (require.main === module) {
  const startServer = async () => {
    try {
      await connectDB();

      app.listen(env.port, () => {
        console.log(
          `KEVIN API running on http://localhost:${env.port}`
        );
      });
    } catch (error) {
      console.error(
        "Failed to start KEVIN API:",
        error.message
      );

      process.exit(1);
    }
  };

  startServer();
}

module.exports = app;
