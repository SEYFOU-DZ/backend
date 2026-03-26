const express = require("express");
const router = express.Router();
const users = require("../controllers/usersController");
const verifyJWT = require("../middleware/verifyJWT")

router.get("/", verifyJWT, users);

module.exports = router;