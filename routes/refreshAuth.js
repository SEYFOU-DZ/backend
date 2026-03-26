const express = require("express");
const jwt = require("jsonwebtoken");
const {generateAccessToken} = require("../lib/generateTokens");
const router = express.Router();
const REFRESH_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "fallback_refresh_secret_change_me";

router.post("/refreshAuth", async (req, res)=>{
    const refreshToken = req.cookies.refreshToken;

    if(!refreshToken) {
        res.clearCookie("token");
        res.clearCookie("refreshToken");
        return res.status(401).json({message:"Unauthoraized"});
    }

     jwt.verify(refreshToken, REFRESH_SECRET,(err,decoded)=>{
        if(err) {
            res.clearCookie("token");
            res.clearCookie("refreshToken");
            return res.status(401).json({message:"Unauthorized"});
        }
        const user = decoded.UserInfo;
        // generate access token
        const accessToken = generateAccessToken(user);
         res.cookie("token", accessToken, {
         httpOnly:true,
         secure: process.env.NODE_ENV === "production",
         sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
         maxAge: 30 * 1000,
         });

         res.status(200).json({ token: accessToken });
   })

})

module.exports = router;