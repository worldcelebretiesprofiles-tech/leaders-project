import express from "express";
import cors from "cors";
import path from "node:path";
import * as Sentry from "@sentry/node";
import { apiLimiter } from "./middleware/rate-limiter";
import { securityHeaders } from "./middleware/security-headers";
import { errorHandler } from "./middleware/errorHandler";

import authRoutes from "./routes/auth.routes";
import categoryRoutes from "./routes/category.routes";
import subcategoryRoutes from "./routes/subcategory.routes";
import profileRoutes from "./routes/profile.routes";
import uploadRoutes from "./routes/upload.routes";
import sitemapRoutes from "./routes/sitemap.routes";
import applicationRoutes from "./routes/application.routes";
import analyticsRoutes from "./routes/analytics.routes";
import { notificationRoutes } from "./routes/notification.routes";

const app = express();

// Configure trust proxy for Railway's reverse proxy BEFORE rate limiting
app.set("trust proxy", 1);

const PORT = process.env.PORT || 5000;

// Initialize Sentry Node SDK if DSN is provided
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
  });
  console.log("Sentry Node SDK initialized successfully.");
}

// 1. Enable secure security headers via Helmet
app.use(securityHeaders);

// 2. Configure Origin-Locked CORS policies
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://celebreties-profile.vercel.app"
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}
if (process.env.ALLOWED_ORIGINS) {
  allowedOrigins.push(...process.env.ALLOWED_ORIGINS.split(","));
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. Server-to-server or Curl)
      if (!origin) return callback(null, true);
      
      const cleanOrigin = origin.trim().replace(/\/$/, "");
      const isAllowed = allowedOrigins.some(allowed => cleanOrigin === allowed.trim().replace(/\/$/, ""));
      const isVercelOrigin = cleanOrigin.startsWith("https://celebreties-profile") && cleanOrigin.endsWith(".vercel.app");
      
      if (isAllowed || isVercelOrigin || allowedOrigins.includes("*")) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);

app.use(express.json());

// 3. Serve optimized mock uploads statically if running locally/fallback mode
app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

// 4. Rate limiting for API requests
app.use("/api/", apiLimiter);

/* ========================================================================= */
/* REST API ENDPOINTS (VERSIONED UNDER /api/v1/)                              */
/* ========================================================================= */

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/profiles", profileRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/subcategories", subcategoryRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/sitemap.xml", sitemapRoutes);
app.use("/api/v1/applications", applicationRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/notifications", notificationRoutes);

// Global Error Handler Middleware
app.use(errorHandler);

// Start Express Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`   Global Leader Sphere Production API Server     `);
  console.log(`   Namespace Prefix: /api/v1/                     `);
  console.log(`   Port: ${PORT}                                  `);
  console.log(`==================================================`);
});
