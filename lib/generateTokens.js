const jwt = require("jsonwebtoken");
const ACCESS_SECRET =
  process.env.ACCESS_TOKEN_SECRET || "fallback_access_secret_change_me";
const REFRESH_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "fallback_refresh_secret_change_me";

const generateAccessToken = (user) => {
  const userId = user._id || user.id;
  const accessToken = jwt.sign(
    { UserInfo: { id: userId, isAdmin: user.isAdmin } },
    ACCESS_SECRET,
    { expiresIn: "30s" }
  );
  return accessToken;
}

const generateRefreshToken = (user) => {
  const userId = user._id || user.id;
  const refreshToken = jwt.sign(
    { UserInfo: { id: userId, isAdmin: user.isAdmin } },
    REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  return refreshToken;
}

module.exports = { generateAccessToken, generateRefreshToken }