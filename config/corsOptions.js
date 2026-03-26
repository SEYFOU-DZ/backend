const staticOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];
const envOrigins = (process.env.CORS_ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const allowedOrigins = [...staticOrigins, ...envOrigins];
// In production, if you don't provide CORS_ALLOWED_ORIGINS, we allow any origin
// to avoid "Failed to fetch" due to CORS blocking across different domains.
const allowAllInProd = process.env.NODE_ENV === "production" && envOrigins.length === 0;

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowAllInProd) return callback(null, true);
    callback(null, allowedOrigins.includes(origin));
  },
  credentials: true,
}

module.exports = corsOptions;
