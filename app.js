const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const logger = require("./utils/logger");
const notFoundHandler = require("./middleware/notFoundHandler");
const errorHandler = require("./middleware/errorHandler");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./docs/swaggerConfig");
const rateLimit = require("express-rate-limit");

const app = express();
const NODE_ENV = process.env.NODE_ENV || "development";

const allowedOrigins = (process.env.CORS_URL || "")
  .split(",")
  .map((u) => u.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin '${origin}' is not allowed`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  // allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());

// 1. Apply Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per window
  message: { error: "Too many requests from this IP, please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", apiLimiter);

// Setup Swagger Docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(cookieParser());

if (NODE_ENV === "development") {
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.originalUrl}`);
    next();
  });
}

// ── FHIR Sync Routes (API v1) ────────────────────────────────────────────────
const syncRoutes = require("./routes/sync");
app.use("/api/v1/fhir/sync", syncRoutes);

// ── SMART Launch Routes (API v1) ─────────────────────────────────────────────
const launchRoutes = require("./routes/launch");
app.use("/api/v1/fhir/launch", launchRoutes);

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use(notFoundHandler);

// ── Centralized error handler ────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
