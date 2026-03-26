const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateAndSendOtp = require("../lib/generateAndSendOtp");
const { generateAccessToken, generateRefreshToken } = require("../lib/generateTokens");

// REGISTER
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    // cheking empty fields 
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    // cheking existing user
    let user = await User.findOne({ email });
    if (user && user.isVerified) {
      return res.status(401).json({ message: "wrong email or password" });
    }
    // hashing password
    const hashedPassword = await bcrypt.hash(password, 10);
    // create new user
    if (!user) {
      user = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
      });
    } else if (!user.isVerified) {
      user.firstName = firstName;
      user.lastName = lastName;
      user.password = hashedPassword;
      await user.save()
    }
    // send otp to email (never crash if email misconfigured)
    const otpRes = await generateAndSendOtp(user);

    res.status(201).json({
      message: otpRes?.emailSent
        ? "verification code sent to email"
        : "Account created. OTP email could not be sent (check server email settings).",
      emailSent: Boolean(otpRes?.emailSent),
    });

  } catch (err) {
    console.log("there is an error in register", err);
    res.status(500).json({ message: "server error" });
  }
}


// VERIFY EMAIL
const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "user not found register again" });
    }

    if (user.isVerified) {
      return res.status(401).json({ message: "user already verified" });
    }

    if (user.otpExpiration < Date.now()) {
      return res.status(401).json({ message: "Expired code" });
    }

    const isOtpMatch = await bcrypt.compare(String(otp), user.otp);
    if (!isOtpMatch) {
      return res.status(401).json({ message: "Invalid code" });
    }

    // generate access token
    const accessToken = generateAccessToken(user);
    // generate refresh token
    const refreshToken = generateRefreshToken(user);

    // make user verified
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiration = undefined;
    await user.save();

    // store token in the cookie
    const sameSite = process.env.NODE_ENV === "production" ? "none" : "lax";

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite,
      maxAge: 30 * 1000,
    });


    res.status(201).json({ message: "verified successfully", token: accessToken });

  } catch (err) {
    console.log("there is an error in verify email", err);
    res.status(500).json({ message: "server error" });
  }
}

// RESEND OTP
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    let user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found register again" });
    if (user.isVerified) return res.status(400).json({ message: "User already verified" });

    const otpRes = await generateAndSendOtp(user);

    res.status(200).json({
      message: otpRes?.emailSent
        ? "New verification code sent to email"
        : "Could not send OTP email (check server email settings).",
      emailSent: Boolean(otpRes?.emailSent),
    });
  } catch (err) {
    console.log("error in resendOtp:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: "All failds are required" });

    let user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "wrong email or password" });

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) return res.status(400).json({ message: "wrong email or password" });

    if (!user.isVerified) {
      await generateAndSendOtp(user);
      return res.status(403).json({ message: "not verified" });
    }

    // generate access token
    const accessToken = generateAccessToken(user);
    // generate refresh token
    const refreshToken = generateRefreshToken(user);

    // store token in the cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 1000,
    });


    res.status(201).json({ message: "User verified successfully", token: accessToken });

  } catch (err) {
    console.log("there is an error in login", err);
    res.status(500).json({ message: "server error" });
  }
}

// FORGOT PASSWORD


// LOGOUT
const logout = (req, res) => {
  const sameSite = process.env.NODE_ENV === "production" ? "none" : "lax";
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
  res.status(200).json({ message: "Logged out successfully" });
};


module.exports = { register, verifyEmail, resendOtp, login, logout };