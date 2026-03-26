const jwt = require("jsonwebtoken");
const ACCESS_SECRET =
  process.env.ACCESS_TOKEN_SECRET || "fallback_access_secret_change_me";

const verifyJWT = (req,res,next)=>{
  
  const token = req.cookies.token;
  
  if(!token) return res.status(401).json({message:"Unauthorized"});
  
  jwt.verify(token, ACCESS_SECRET,(err,decoded)=>{
    if(err) return res.status(401).json({message:"Unauthorized"});
    req.user = decoded.UserInfo;
    next();
  })
}


module.exports = verifyJWT