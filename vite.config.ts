import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { handleSendEmail } from "./server/emailHandler.js";
import { handleAdmissionsRequest } from "./server/mongoHandler.js";
import { handleSubscriptionsRequest } from "./server/subscriptionHandler.js";
import { handleVisitorsRequest } from "./server/visitorHandler.js";
import { emailRateLimiter } from "./server/rateLimiter.js";

function backendDevServerPlugin(): Plugin {
  return {
    name: "backend-dev-server-plugin",
    configureServer(server) {
      // 1. Email notification service
      server.middlewares.use("/api/send-email", async (req, res, next) => {
        if (req.method !== "POST") return next();

        // Enforce rate limiting in dev server
        if (!emailRateLimiter.apply(req, res)) {
          return;
        }

        let raw = "";
        req.on("data", (chunk: any) => {
          raw += chunk;
        });
        req.on("end", async () => {
          try {
            const body = JSON.parse(raw || "{}");
            const result = await handleSendEmail(body);
            res.setHeader("Content-Type", "application/json");
            res.statusCode = 200;
            res.end(JSON.stringify(result));
          } catch (err: any) {
            console.error("[EmailDevServer] Error sending email:", err);
            res.setHeader("Content-Type", "application/json");
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: err?.message || "Failed to send email" }));
          }
        });
      });

      // 2. Student admissions MongoDB service
      server.middlewares.use("/api/admissions", async (req: any, res: any) => {
        try {
          if (req.method === "GET" || req.method === "OPTIONS" || req.method === "HEAD") {
            req.body = {};
            await handleAdmissionsRequest(req, res);
            return;
          }

          let raw = "";
          req.on("data", (chunk: any) => {
            raw += chunk;
          });
          req.on("end", async () => {
            try {
              if (raw) {
                try {
                  req.body = JSON.parse(raw);
                } catch {
                  req.body = raw;
                }
              } else {
                req.body = {};
              }
              await handleAdmissionsRequest(req, res);
            } catch (err: any) {
              console.error("[AdmissionsDevServer] Error:", err);
              res.setHeader("Content-Type", "application/json");
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err?.message || "Failed to process admission" }));
            }
          });
        } catch (outerErr: any) {
          console.error("[AdmissionsDevServer] Outer Error:", outerErr);
          res.setHeader("Content-Type", "application/json");
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: outerErr?.message || "Failed to process admission" }));
        }
      });

      // 3. Subscriptions Razorpay service
      server.middlewares.use("/api/subscriptions", async (req: any, res: any) => {
        try {
          await handleSubscriptionsRequest(req, res);
        } catch (err: any) {
          console.error("[SubscriptionsDevServer] Error:", err);
          res.setHeader("Content-Type", "application/json");
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: err?.message || "Failed to fetch subscriptions" }));
        }
      });

      // 4. Visitors & Footprint analytics service
      server.middlewares.use("/api/visitors", async (req: any, res: any) => {
        try {
          if (req.method === "GET" || req.method === "OPTIONS" || req.method === "HEAD") {
            req.body = {};
            await handleVisitorsRequest(req, res);
            return;
          }

          let raw = "";
          req.on("data", (chunk: any) => {
            raw += chunk;
          });
          req.on("end", async () => {
            try {
              if (raw) {
                try {
                  req.body = JSON.parse(raw);
                } catch {
                  req.body = raw;
                }
              } else {
                req.body = {};
              }
              await handleVisitorsRequest(req, res);
            } catch (err: any) {
              console.error("[VisitorsDevServer] Error:", err);
              res.setHeader("Content-Type", "application/json");
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err?.message || "Failed to process visitors" }));
            }
          });
        } catch (outerErr: any) {
          console.error("[VisitorsDevServer] Outer Error:", outerErr);
          res.setHeader("Content-Type", "application/json");
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: outerErr?.message || "Failed to process visitors" }));
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  envPrefix: ["VITE_", "PUBLIC_", "ADMIN_", "APP_", "API_", "RAZORPAY_"],
  server: {
    host: true,
    port: 8080,
  },
  plugins: [
    react(),
    backendDevServerPlugin(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
