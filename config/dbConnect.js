const mongoose = require("mongoose");

const DB_URI = process.env.DB_URI;

const dbConnect = async ()=>{
  try{
    await mongoose.connect(DB_URI);
    console.log("connected to data base")
  }catch(err){
    console.log("error connecting data base", err)
  }
}

module.exports = dbConnect;