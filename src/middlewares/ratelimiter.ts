import rateLimit from "express-rate-limit";

// General limiter: max 100 requests per 15 minutes per IP
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true, // return rate limit info in headers
  legacyHeaders: false, // disable deprecated headers
});

// Stricter limiter for auth endpoints: 10 requests per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many login/signup attempts, please try again later.",
});

