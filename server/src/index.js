const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const authRoutes = require("./auth/auth.routes.js");
const userRoutes = require("./user/user.routes.js");

const app = express();
const PORT = process.env.PORT || 8080;
console.log(process.env.ORIGINS);
const allowedOrigins = process.env.ORIGINS.split(";");

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

app.get("/api/health", (req, res) => res.send("OK"));

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
