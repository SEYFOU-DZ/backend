require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieparser = require("cookie-parser");

const corsOptions = require("./config/corsOptions");
const dbConnect = require("./config/dbConnect");
const root = require("./routes/root");
const authRoute = require("./routes/authRoute");
const checkingUser = require("./routes/checkingUserRoute");
const refreshAuth = require("./routes/refreshAuth");
const productRoute = require("./routes/productRoute");
const ordersRoute = require("./routes/ordersRoute");

const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieparser());

const PORT = process.env.PORT || 5000;

// CONNECTING TO DATABASE
dbConnect();

// ROUTES
app.use("/", root);
app.use("/api/auth", authRoute);
app.use("/api", checkingUser);
app.use("/api", refreshAuth);
app.use("/api/products", productRoute);
app.use("/api/orders", ordersRoute);

// STARTING SERVER WITH HTTPS
mongoose.connection.once("open", () => {
 
 app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});