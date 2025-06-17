const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).send("Access Denied: No Token Provided!");

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = { id: decoded.sub };
    next();
  } catch (error) {
    return res.status(401).send("Unauthorized: Invalid Token");
  }
};

module.exports = authenticate;
