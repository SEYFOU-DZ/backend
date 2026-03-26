const allowedOrigins = [
  "https://ecomerce-lake-alpha.vercel.app"
];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
}

module.exports = corsOptions;
