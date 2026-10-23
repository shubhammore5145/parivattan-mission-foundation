import { handleSendEmail } from "../server/emailHandler.js";
import { emailRateLimiter } from "../server/rateLimiter.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  // 1. Enforce Email Rate Limiting (max 6 requests per 10 minutes per IP)
  const isAllowed = emailRateLimiter.apply(req, res);
  if (!isAllowed) {
    return; // Rate limit response already sent by limiter
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const result = await handleSendEmail(body || {});
    return res.status(200).json(result);
  } catch (err) {
    console.error("[API send-email error]:", err);
    return res.status(500).json({ success: false, error: err?.message || "Failed to send email" });
  }
}

