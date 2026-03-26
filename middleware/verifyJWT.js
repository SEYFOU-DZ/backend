const jwt = require("jsonwebtoken");
const ACCESS_SECRET =
  process.env.ACCESS_TOKEN_SECRET || "fallback_access_secret_change_me";

const verifyJWT = (req, res, next) => {
  // Accept token from Authorization header (for cross-domain requests)
  // OR from httpOnly cookie (for same-domain requests)
  let token = null;

  const authHeader = req.headers["authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  } else {
    token = req.cookies?.token;
  }

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, ACCESS_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Unauthorized" });
    req.user = decoded.UserInfo;
    next();
  });
};

module.exports = verifyJWT;