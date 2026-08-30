import rateLimit from "express-rate-limit";

// Rate limiter for general API requests
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Limit each IP to 5000 requests per window (to accommodate corporate NATs)
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests from this IP, please try again after 15 minutes"
  }
});

// Stricter rate limiter for authentication endpoints to prevent brute force (max 10 attempts per hour per IP)
export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute (reduced for dev testing)
  max: 1500, // Increased limit for dev testing
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many login attempts from this IP, please try again later"
  }
});
