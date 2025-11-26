import "./types";
import type { Express } from "express";
import rateLimit from "express-rate-limit";

const NOTION_CLIENT_ID = process.env.NOTION_CLIENT_ID;
const NOTION_CLIENT_SECRET = process.env.NOTION_CLIENT_SECRET;
const NOTION_REDIRECT_URI = process.env.NOTION_REDIRECT_URI || "http://0.0.0.0:5000/auth/notion/callback";

// CWE-307: Improper Restriction of Excessive Authentication Attempts
// Rate limiter for authentication endpoints - stricter limits
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 authentication attempts per window
  message: "Too many authentication attempts from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests from counting
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

// Rate limiter for OAuth callback - prevent code replay attacks
const callbackRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 callback attempts per window
  message: "Too many callback attempts from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

// General auth API rate limiter
const authApiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

export function registerAuthRoutes(app: Express) {
  // Initiate Notion OAuth flow
  app.get("/auth/notion", authRateLimiter, (req, res) => {
    const scopes = [
      "user:read",
      "content:read",
      "content:write",
      "workspace:read"
    ].join(" ");

    const authUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${NOTION_CLIENT_ID}&response_type=code&owner=user&redirect_uri=${encodeURIComponent(NOTION_REDIRECT_URI)}&scope=${encodeURIComponent(scopes)}`;

    res.redirect(authUrl);
  });

  // Handle Notion OAuth callback
  app.get("/auth/notion/callback", callbackRateLimiter, async (req, res) => {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: "Missing authorization code" });
    }

    try {
      const response = await fetch("https://api.notion.com/v1/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(`${NOTION_CLIENT_ID}:${NOTION_CLIENT_SECRET}`).toString("base64")}`,
        },
        body: JSON.stringify({
          grant_type: "authorization_code",
          code,
          redirect_uri: NOTION_REDIRECT_URI,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to exchange code for token");
      }

      // Store the access token and workspace info in session or database
      req.session.notionAccessToken = data.access_token;
      req.session.notionWorkspaceId = data.workspace_id;
      req.session.notionBotId = data.bot_id;

      res.redirect("/settings?auth=success");
    } catch (error) {
      console.error("Notion OAuth error:", error);
      res.redirect("/settings?auth=error");
    }
  });

  // Get current authentication status
  app.get("/api/auth/status", authApiRateLimiter, (req, res) => {
    res.json({
      isAuthenticated: !!req.session.notionAccessToken,
      workspaceId: req.session.notionWorkspaceId,
    });
  });

  // Disconnect Notion
  app.post("/api/auth/disconnect", authApiRateLimiter, (req, res) => {
    delete req.session.notionAccessToken;
    delete req.session.notionWorkspaceId;
    delete req.session.notionBotId;
    res.json({ success: true });
  });
}
