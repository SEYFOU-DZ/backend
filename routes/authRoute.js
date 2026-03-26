const express = require("express");
const { register, verifyEmail, resendOtp, login, logout } = require("../controllers/authController");
const router = express.Router();


// REGISTER
router.post("/register", register);
router.post("/verifyEmail", verifyEmail);
router.post("/resendOtp", resendOtp);
router.post("/login", login);

// LOGOUT
router.post("/logout", logout);

module.exports = router;