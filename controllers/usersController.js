const User = require("../models/User");

// GET ALL USERS
const users = async (req,res)=>{
  const users = await User.find().select("firstName lastName email").lean()
  if(!users || !users.length) return res.status(400).json({message:"no users found"})
  res.status(200).json(users);
}

module.exports = users;




