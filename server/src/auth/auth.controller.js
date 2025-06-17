const bcrypt = require("bcryptjs");
const db = require("../db.js");
const authService = require("./auth.service.js");

const signup = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).send("Email and password required");

  const existingUser = await db("users").where({ email }).first();
  if (existingUser) return res.status(400).send("Email already in use");

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await db("users")
    .insert({
      email,
      password_hash: hashedPassword,
    })
    .returning("id");

  const { accessToken, refreshToken, refreshTokenJti } =
    authService.generateTokens({ id: user[0].id, email });
  await authService.saveRefreshToken(refreshTokenJti, user[0].id);

  res.cookie("accessToken", accessToken, authService.accessCookieOptions);
  res.cookie("refreshToken", refreshToken, authService.refreshCookieOptions);

  return res.status(201).json({
    user: { id: user[0], email },
    accessToken,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).send("Email and password required");

  const user = await db("users").where({ email }).first();
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).send("Invalid credentials");
  }

  const { accessToken, refreshToken, refreshTokenJti } =
    authService.generateTokens(user);
  await authService.saveRefreshToken(refreshTokenJti, user.id);

  res.cookie("accessToken", accessToken, authService.accessCookieOptions);
  res.cookie("refreshToken", refreshToken, authService.refreshCookieOptions);

  res.status(200).json({
    user: { id: user.id, email: user.email },
    accessToken,
  });
};

const refresh = async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;
  if (!incomingRefreshToken)
    return res.status(401).send("Refresh token not found");

  try {
    const decoded = authService.verifyRefreshToken(incomingRefreshToken);
    const tokenInDb = await authService.findRefreshToken(decoded.jti);

    if (!tokenInDb) {
      await authService.deleteAllUserTokens(decoded.sub);
      return res.status(403).send("Forbidden: Token reuse detected.");
    }

    await authService.deleteRefreshToken(decoded.jti);

    const user = { id: decoded.sub };
    const { accessToken, refreshToken, refreshTokenJti } =
      authService.generateTokens(user);
    await authService.saveRefreshToken(refreshTokenJti, user.id);

    res.cookie("accessToken", accessToken, authService.accessCookieOptions);
    res.cookie("refreshToken", refreshToken, authService.refreshCookieOptions);
    const userData = await db("users").where({ id: decoded.sub }).first();
    // Send back the new access token in the body for RTK Query to use immediately
    res.json({ accessToken, user: { email: userData.email, id: userData.id } });
  } catch (err) {
    return res.status(401).send("Unauthorized: Invalid refresh token");
  }
};

const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    try {
      const decoded = authService.verifyRefreshToken(refreshToken);
      await authService.deleteRefreshToken(decoded.jti);
    } catch (error) {}
  }
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(204).send();
};

module.exports = {
  login,
  signup,
  refresh,
  logout,
};
