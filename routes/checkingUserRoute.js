const verifyJWT = require("../middleware/verifyJWT");

const express = require("express");
const router = express.Router();

router.get('/checkingUser',verifyJWT,(req,res)=>{
    res.json({user:req.user});
})

module.exports = router;