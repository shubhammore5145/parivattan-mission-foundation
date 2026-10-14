import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { handleSendEmail } from "./server/emailHandler.js";

function emailDevServerPlugin(): Plugin {
  return {
    name: "email-dev-server-plugin",
    configureServer(server) {
      server.middlewares.use("/api/send-email", async (req, res, next) => {
        if (req.method !== "POST") return next();
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
    emailDevServerPlugin(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
