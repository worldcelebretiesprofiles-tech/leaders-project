import helmet from "helmet";

export const securityHeaders = helmet({
  // Configure Content Security Policy to allow API communication and Cloudinary assets
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com"],
      connectSrc: ["'self'", "https://res.cloudinary.com", "https://*.sentry.io", "https://sentry.io"],
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "https://res.cloudinary.com"],
      frameAncestors: ["'none'"]
    }
  },
  // Disable COEP to allow loading cross-origin images smoothly in browser
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  xFrameOptions: { action: "deny" }
});
