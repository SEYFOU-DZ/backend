const verifyJWT = require("./verifyJWT");

const verifyAdmin = (req, res, next) => {
  // First, rely on verifyJWT to populate req.user
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // Check if user is admin
  if (req.user.isAdmin !== true) {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }

  next();
};

// We export an array of middleware so it always verifies JWT first, then Admin
module.exports = [verifyJWT, verifyAdmin];
