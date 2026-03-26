const express = require("express");
const jwt = require("jsonwebtoken");
const {generateAccessToken} = require("../lib/generateTokens");
const router = express.Router();
const REFRESH_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "fallback_refresh_secret_change_me";

router.post("/refreshAuth", async (req, res)=>{
    const refreshToken = req.cookies.refreshToken;
    const sameSite = process.env.NODE_ENV === "production" ? "none" : "lax";

    if(!refreshToken) {
        res.clearCookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite,
        });
        res.clearCookie("refreshToken", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite,
        });
        return res.status(401).json({message:"Unauthoraized"});
    }

     jwt.verify(refreshToken, REFRESH_SECRET,(err,decoded)=>{
        if(err) {
            res.clearCookie("token", {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite,
            });
            res.clearCookie("refreshToken", {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite,
            });
            return res.status(401).json({message:"Unauthorized"});
        }
        const user = decoded.UserInfo;
        // generate access token
        const accessToken = generateAccessToken(user);

         res.status(200).json({ token: accessToken });
   })

})

module.exports = router;