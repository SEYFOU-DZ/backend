const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://ecomerce-lake-alpha.vercel.app",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Accept any Vercel frontend domain directly without env vars.
    if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) {
      return callback(null, true);
    }
    callback(null, false);
  },
  credentials: true,
}

module.exports = corsOptions;
