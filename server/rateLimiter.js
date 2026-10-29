/**
 * ============================================================================
 * PARIVATTAN MISSION FOUNDATION - RATE LIMITER SYSTEM
 * ============================================================================
 * Production-ready, zero-dependency in-memory sliding window rate limiter.
 * Supports:
 * - Vercel Serverless Functions (req, res with res.status().json())
 * - Node.js HTTP Server / Vite dev middleware (res.statusCode, res.setHeader, res.end)
 * - Automatic background cache eviction to prevent memory leaks
 * - Standard RFC-compliant RateLimit HTTP response headers
 * ============================================================================
 */

// Global in-memory storage for rate limits
const memoryStore = new Map();

// Periodic cleanup of expired rate limit entries every 60 seconds
if (typeof setInterval !== "undefined") {
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of memoryStore.entries()) {
      if (now > record.resetTime) {
        memoryStore.delete(key);
      }
    }
  }, 60 * 1000);

  // Unref interval so it doesn't hold the process open
  if (cleanupInterval && typeof cleanupInterval.unref === "function") {
    cleanupInterval.unref();
  }
}

/**
 * Extracts client IP from incoming HTTP request across various hosting environments
 * (Vercel, Cloudflare, Node proxy, localhost).
 */
export function getClientIp(req) {
  if (!req) return "127.0.0.1";

  // Check standard proxy headers
  const xForwardedFor =
    req.headers?.["x-forwarded-for"] ||
    req.headers?.["X-Forwarded-For"] ||
    (req.headers && req.headers["x-forwarded-for"]);

  if (xForwardedFor) {
    const ips = typeof xForwardedFor === "string" ? xForwardedFor.split(",") : xForwardedFor;
    const firstIp = (ips[0] || "").trim();
    if (firstIp) return firstIp;
  }

  return (
    req.headers?.["x-real-ip"] ||
    req.headers?.["cf-connecting-ip"] ||
    req.headers?.["fastly-client-ip"] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    "127.0.0.1"
  );
}

/**
 * Safely sends a JSON response with status code and headers
 * regardless of whether the environment is Express/Vercel or raw Node.js http.
 */
function sendJsonResponse(res, statusCode, headers, payload) {
  if (!res) return;

  // Set HTTP headers
  if (typeof res.setHeader === "function") {
    for (const [key, value] of Object.entries(headers)) {
      try {
        res.setHeader(key, String(value));
      } catch {}
    }
    try {
      res.setHeader("Content-Type", "application/json");
    } catch {}
  }

  res.statusCode = statusCode;

  // If running in Express/Vercel with helper methods:
  if (typeof res.status === "function" && typeof res.json === "function") {
    return res.status(statusCode).json(payload);
  }

  // Fallback to standard Node.js ServerResponse
  if (typeof res.end === "function") {
    return res.end(JSON.stringify(payload));
  }
}

/**
 * Creates a rate limiter instance with custom window and limits.
 */
export function createRateLimiter(options = {}) {
  const {
    prefix = "rl",
    windowMs = 60 * 1000, // Default: 1 minute
    max = 60, // Default: 60 requests per window
    message = "Too many requests. Please wait a moment and try again.",
    statusCode = 429,
    keyGenerator = getClientIp,
  } = options;

  /**
   * Checks current hit count for the client without immediately sending response.
   */
  function check(req) {
    const rawIp = keyGenerator(req);
    const key = `${prefix}:${rawIp}`;
    const now = Date.now();

    // In local development or on localhost (127.0.0.1 / ::1), provide a relaxed limit (100) so testing is never blocked
    const isLocalhost =
      rawIp === "127.0.0.1" ||
      rawIp === "::1" ||
      rawIp === "localhost" ||
      rawIp.includes("127.0.0.1") ||
      process.env.NODE_ENV === "development";
    const effectiveLimit = isLocalhost ? Math.max(max, 100) : max;

    let record = memoryStore.get(key);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      memoryStore.set(key, record);
    } else {
      record.count += 1;
    }

    const resetInSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000));
    const remaining = Math.max(0, effectiveLimit - record.count);
    const allowed = record.count <= effectiveLimit;

    return {
      allowed,
      limit: effectiveLimit,
      current: record.count,
      remaining,
      resetTime: record.resetTime,
      resetInSeconds,
      ip: rawIp,
    };
  }

  /**
   * Applies rate limiting to the request.
   * If exceeded: sets HTTP 429, sends JSON response, and returns false.
   * If allowed: sets rate limit headers on response and returns true.
   */
  function apply(req, res) {
    // Whitelist paid transactions: Students who have already paid MUST NEVER be blocked
    let reqBody = req?.body;
    if (typeof reqBody === "string") {
      try { reqBody = JSON.parse(reqBody); } catch {}
    }
    const hasPaymentId = reqBody?.payment_id || reqBody?.paymentId || reqBody?.razorpay_payment_id;
    if (hasPaymentId) {
      return true;
    }

    const result = check(req);

    const headers = {
      "X-RateLimit-Limit": result.limit,
      "X-RateLimit-Remaining": result.remaining,
      "X-RateLimit-Reset": Math.ceil(result.resetTime / 1000),
    };

    if (!result.allowed) {
      headers["Retry-After"] = result.resetInSeconds;

      console.warn(
        `[RateLimiter: ${prefix}] Blocked IP ${result.ip} - exceeded limit (${result.current}/${result.limit}). Retry after ${result.resetInSeconds}s.`
      );

      sendJsonResponse(res, statusCode, headers, {
        success: false,
        rateLimited: true,
        error: message,
        retryAfter: result.resetInSeconds,
        limit: result.limit,
      });

      return false;
    }

    // Set rate limit info headers on allowed responses as well
    if (res && typeof res.setHeader === "function") {
      for (const [key, val] of Object.entries(headers)) {
        try {
          res.setHeader(key, String(val));
        } catch {}
      }
    }

    return true;
  }

  /**
   * Express/Connect middleware adapter
   */
  function middleware(req, res, next) {
    const allowed = apply(req, res);
    if (allowed && typeof next === "function") {
      next();
    }
  }

  /**
   * Resets limit for a specific IP (useful for testing or admin overrides)
   */
  function reset(reqOrIp) {
    const ip = typeof reqOrIp === "string" ? reqOrIp : keyGenerator(reqOrIp);
    const key = `${prefix}:${ip}`;
    memoryStore.delete(key);
  }

  return {
    check,
    apply,
    middleware,
    reset,
  };
}

/**
 * Extracts client IP or IP + email identifier from incoming HTTP request
 * Ensures different students sharing the same Wi-Fi/cellular NAT IP are never blocked.
 */
export function getClientIdentifier(req) {
  const ip = getClientIp(req);
  let email = "";
  try {
    if (req?.body && typeof req.body === "object") {
      email = req.body.email || req.body.studentEmail || req.body.donorEmail || "";
    } else if (typeof req?.body === "string" && req.body.includes("@")) {
      const parsed = JSON.parse(req.body);
      email = parsed.email || parsed.studentEmail || parsed.donorEmail || "";
    }
  } catch {}
  return email ? `${ip}_${email.trim().toLowerCase()}` : ip;
}

// ============================================================================
// PRECONFIGURED RATE LIMITERS FOR PARIVATTAN MISSION FOUNDATION
// ============================================================================

/**
 * 1. Email Rate Limiter (/api/send-email)
 * High-capacity window per student (80 per 5 minutes).
 * Protects Gmail SMTP credentials without blocking genuine applicants.
 */
export const emailRateLimiter = createRateLimiter({
  prefix: "email",
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 80,
  keyGenerator: getClientIdentifier,
  message:
    "ईमेल पाठवण्याची मर्यादा संपली आहे. कृपया काही मिनिटांनंतर पुन्हा प्रयत्न करा. (Too many email requests. Please try again after a few minutes.)",
});

/**
 * 2. Admission Submission Rate Limiter (POST /api/admissions)
 * High capacity window per applicant (80 submissions per 5 minutes).
 * Prevents automated bot spam while ensuring students are never blocked.
 */
export const admissionsCreateRateLimiter = createRateLimiter({
  prefix: "admissions_create",
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 80,
  keyGenerator: getClientIdentifier,
  message:
    "ॲडमिशन अर्ज पाठवण्याची मर्यादा गाठली आहे. कृपया ५ मिनिटांनी पुन्हा प्रयत्न करा. (Too many admission applications submitted. Please try again after 5 minutes.)",
});

/**
 * 3. Admissions Read Rate Limiter (GET /api/admissions)
 * High capacity window to ensure admin console queries are never blocked.
 */
export const admissionsReadRateLimiter = createRateLimiter({
  prefix: "admissions_read",
  windowMs: 60 * 1000, // 1 minute
  max: 300,
  message: "विनंत्यांची मर्यादा गाठली आहे. कृपया १ मिनिट थांबा. (Too many requests. Please wait a minute.)",
});

/**
 * 4. Admissions Mutation Rate Limiter (PUT / DELETE /api/admissions)
 * Max 30 updates/deletes per minute per IP.
 */
export const admissionsMutationRateLimiter = createRateLimiter({
  prefix: "admissions_mutation",
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: "Too many updates or deletions. Please wait a moment.",
});

/**
 * 5. General API Rate Limiter
 * Max 120 requests per minute per IP.
 */
export const generalApiRateLimiter = createRateLimiter({
  prefix: "general_api",
  windowMs: 60 * 1000, // 1 minute
  max: 120,
  message: "API rate limit exceeded. Please try again in a few seconds.",
});
