const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
  const userId = user._id || user.id;
  const accessToken = jwt.sign(
    { UserInfo: { id: userId, isAdmin: user.isAdmin } },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "30s" }
  );
  return accessToken;
}

const generateRefreshToken = (user) => {
  const userId = user._id || user.id;
  const refreshToken = jwt.sign(
    { UserInfo: { id: userId, isAdmin: user.isAdmin } },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
  return refreshToken;
}

module.exports = { generateAccessToken, generateRefreshToken }